#!/usr/bin/env python3
"""
Локальный трекер скриптов игрового клиента + автоматическая деобфускация webcrack.

Запуск:
    python -m pip install -r requirements.txt
    npm install -g webcrack        # или ничего не ставить — будет npx
    python engine_tracker.py

Скрипт раз в 10 минут проверяет сайт игры, находит js/*.js,
скачивает только новые версии во ВРЕМЕННЫЙ файл, прогоняет их через webcrack
и сохраняет в папку ТОЛЬКО результат webcrack. Оригинал (обфусцированный)
не сохраняется.
"""

import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

# --- Настройки ---
TARGET_URL = "https://dev" "ast.io/"
JS_DIR_PATTERN = re.compile(r"^/js/[^/]+\.js$")
STORAGE_DIR = Path(__file__).parent / "client_scripts"
CHECK_INTERVAL_SECONDS = 10  # 10 sec
REQUEST_TIMEOUT = 30
WEBCRACK_TIMEOUT = 1800  # 30 минут на деобфускацию большого бандла
NODE_MEMORY_MB = 8192    # лимит памяти Node для больших файлов

# engine_port.py — автоставка функций (AutoLoot/AutoBuild/Menu/aimbot и т.д.)
AUTO_PORT_SCRIPT = Path(__file__).parent / "engine_port.py"
# Единый файл для раздачи: всегда содержит САМУЮ СВЕЖУЮ готовую версию
# (webcrack + расшифровка имён + мод). Перезаписывается при каждом обновлении.
FULL_JS = Path(__file__).parent / "full.js"

# --- Discord webhook: уведомление, когда full.js обновлён ---
# Можно переопределить переменной окружения DISCORD_WEBHOOK_URL.
DISCORD_WEBHOOK_URL = os.environ.get(
    "DISCORD_WEBHOOK_URL",
    "https://discord.com/api/webhooks/1547838715206967346/6pX9ZDSxBrUhnCJaRS-MimH05m7V8NrkKjJoxHjPwuVjHljjfobgYDcMx-X0epXm_GGA",
)
AUTO_PORT_TIMEOUT = 900
AUTO_PORT_STATUS_SECONDS = 15


HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/128.0.0.0 Safari/537.36"
    ),
    "Accept": (
        "text/html,application/xhtml+xml,application/xml;q=0.9,"
        "image/avif,image/webp,image/apng,*/*;q=0.8"
    ),
    "Accept-Language": "en-US,en;q=0.9,ru;q=0.8",
    "DNT": "1",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Cache-Control": "max-age=0",
}


def ensure_storage() -> None:
    STORAGE_DIR.mkdir(parents=True, exist_ok=True)


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def script_out_dir(filename: str) -> Path:
    """Папка с результатом webcrack для конкретного скрипта."""
    return STORAGE_DIR / Path(filename).stem


def list_local_scripts() -> set[str]:
    """Имена уже обработанных скриптов (по папкам с результатом webcrack)."""
    return {p.name + ".js" for p in STORAGE_DIR.iterdir() if p.is_dir()}


def fetch_page(url: str) -> str:
    resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
    resp.raise_for_status()
    return resp.text


def extract_js_urls(html: str, base_url: str) -> list[str]:
    base_host = urlparse(base_url).netloc.lower()
    soup = BeautifulSoup(html, "html.parser")
    urls: list[str] = []
    for tag in soup.find_all("script", src=True):
        full = urljoin(base_url, tag["src"])
        parsed = urlparse(full)
        if parsed.netloc.lower() == base_host and JS_DIR_PATTERN.match(parsed.path):
            urls.append(full)
    return urls


def webcrack_command() -> list[str]:
    """Локально установленный webcrack, иначе npx."""
    exe = shutil.which("webcrack")
    if exe:
        return [exe]
    npx = shutil.which("npx") or shutil.which("npx.cmd")
    if not npx:
        raise RuntimeError(
            "Не найден Node.js. Установи Node LTS (https://nodejs.org) — "
            "он нужен для webcrack."
        )
    return [npx, "-y", "webcrack@latest"]


def run_webcrack(src_file: Path, out_dir: Path) -> None:
    """Прогоняет файл через webcrack, результат кладёт в out_dir."""
    env = os.environ.copy()
    env["NODE_OPTIONS"] = f"{env.get('NODE_OPTIONS', '')} --max-old-space-size={NODE_MEMORY_MB}".strip()

    cmd = webcrack_command() + [str(src_file), "-o", str(out_dir), "-f"]
    print(f"    webcrack: {' '.join(cmd)}")
    proc = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        timeout=WEBCRACK_TIMEOUT,
        env=env,
    )
    if proc.returncode != 0:
        raise RuntimeError(
            f"webcrack завершился с кодом {proc.returncode}: "
            f"{(proc.stderr or proc.stdout or '').strip()[:500]}"
        )



# ==================== Расшифровка имён (постобработка webcrack) ====================
ID_CHARS = r"\w\u00a1-\uffff$"
ID = rf"[{ID_CHARS}]+"


def _add(mapping, old, new):
    if old and old != new and old not in mapping and not old.isdigit():
        mapping[old] = new


def detect_names(code: str) -> dict:
    m: dict[str, str] = {}

    # 1) Entitie.init(600, 30000, 5000)
    i = code.find("(600, 30000, 5000)")
    if i != -1:
        line = code[code.rfind("\n", 0, i) + 1: i + 1]
        r = re.search(rf"({ID})\s*(?:\.({ID})|\[({ID})\])\s*\($", line)
        if r:
            _add(m, r.group(1), "Entitie")
            _add(m, r.group(3), "init")

    # 2) WaitANDrunHTML + home/game
    for mm in re.finditer(r'"howtoplay"', code):
        i = mm.start()
        window = code[i: i + 3000]
        if '"chat"' not in window or "setTimeout" not in window:
            continue
        before = code[max(0, i - 3000): i]
        funcs = re.findall(rf"function\s+({ID})\s*\(\s*\)", before)
        if funcs:
            _add(m, funcs[-1], "WaitANDrunHTML")
        calls = re.findall(rf"({ID})\s*(?:\.({ID})|\[({ID})\])\s*\(\s*\)", window)
        if len(calls) >= 1:
            _add(m, calls[0][0], "home")
        if len(calls) >= 2:
            _add(m, calls[1][0], "game")
        for c in calls[:2]:
            if c[1] and c[1] != "init":
                _add(m, c[1], "init")
            if c[2]:
                _add(m, c[2], "init")
        break


    # 3) state / State
    j = code.find("Are you sure")
    if j != -1:
        w = code[max(0, j - 600): j]
        r = re.search(rf"\(\s*({ID})\s*\[\s*({ID})\s*\]\s*&\s*\1\s*\.\s*({ID})\s*\.\s*({ID})\s*\)", w)
        if r:
            _add(m, r.group(2), "state")
            _add(m, r.group(3), "State")
            _add(m, r.group(4), "__CONNECTED__")

    # 4) render / ctx (построчно)
    lines = code.split("\n")
    pat = re.compile(rf"^\s*({ID})\s*\[({ID})\]\(({ID}),\s*\3\);\s*$")
    for idx in range(len(lines) - 2):
        r = pat.match(lines[idx])
        if not r:
            continue
        ctx = r.group(1)
        nxt = lines[idx + 1]
        if ctx not in nxt:
            continue
        r2 = re.match(rf"^\s*({ID})\s*(?:\.|\[)({ID})\]?\s*\(\s*\)\s*;\s*$", lines[idx + 2])
        if r2:
            _add(m, ctx, "ctx")
            _add(m, r2.group(1), "render")
            break

    # 5) socket / send / sendPacket
    for mm in re.finditer(r"new TextEncoder\(\)", code):
        window = code[mm.start(): mm.start() + 6000]
        sr = re.search(rf"({ID})\s*(?:\.(send)|\[({ID})\])\(({ID})\)\s*;\s*\n\s*\}}", window)
        if not sr:
            continue
        _add(m, sr.group(1), "socket")
        _add(m, sr.group(3), "send")
        fr = re.search(rf"function\s+({ID})\s*\(({ID})\)", window)
        if fr:
            _add(m, fr.group(1), "sendPacket")
        break


    # 6) World / players / PLAYER / id / x / y
    j = code.find('"!pos"')
    if j != -1:
        window = code[j: j + 1500]
        wr = re.search(
            rf"({ID})\.({ID})\[\1\.({ID})\[({ID})\]\]\[({ID})\]\[({ID})\]", window
        )
        if wr:
            _add(m, wr.group(1), "World")
            _add(m, wr.group(2), "players")
            _add(m, wr.group(3), "PLAYER")
            _add(m, wr.group(4), "id")
        coords = re.findall(rf"Math\[{ID}\]\(({ID})\.({ID})\[({ID})\]\s*/", window)
        if len(coords) >= 2:
            _add(m, coords[0][2], "x")
            _add(m, coords[1][2], "y")
    return m


def apply_renames(code: str, mapping: dict) -> str:
    if not mapping:
        return code
    keys = sorted(mapping, key=len, reverse=True)
    pattern = re.compile(
        rf"(?<![{ID_CHARS}])(" + "|".join(re.escape(k) for k in keys) + rf")(?![{ID_CHARS}])"
    )
    return pattern.sub(lambda mo: mapping[mo.group(1)], code)


def strip_wrapper(code: str) -> str:
    lines = code.split("\n")
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    if len(lines) > 2:
        lines = lines[1:-1]
    return "\n".join(lines)


def postprocess_file(path: Path) -> dict:
    """Удаляет первую и последнюю строку и расшифровывает известные имена."""
    code = path.read_text(encoding="utf-8", errors="replace")
    mapping = detect_names(code)
    code = apply_renames(strip_wrapper(code), mapping)
    path.write_text(code, encoding="utf-8")
    return mapping


def postprocess_dir(out_dir: Path) -> dict:
    """Постобработка всех .js файлов результата webcrack."""
    total: dict[str, str] = {}
    for js in sorted(out_dir.rglob("*.js")):
        mapping = postprocess_file(js)
        total.update(mapping)
        if mapping:
            print(f"    {js.name}: расшифровано имён — {len(mapping)}")
    (out_dir / "_names.json").write_text(
        json.dumps(total, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return total


# ==================== Автоставка функций (engine_port.py) ====================
def pick_client_file(out_dir: Path) -> Path | None:
    """Главный файл клиента — самый большой .js результата webcrack."""
    cands = [
        p for p in out_dir.rglob("*.js")
        if not p.name.endswith("_with_mod.js")
    ]
    if not cands:
        return None
    return max(cands, key=lambda p: p.stat().st_size)


def run_auto_port(out_dir: Path) -> Path | None:
    """Прогоняет расшифрованный клиент через engine_port.py и сохраняет мод-версию."""
    if not AUTO_PORT_SCRIPT.exists():
        print(f"    [!] engine_port.py не найден рядом с трекером ({AUTO_PORT_SCRIPT}) — пропуск автоставки")
        return None

    client = pick_client_file(out_dir)
    if client is None:
        print("    [!] Не найден .js для автоставки функций")
        return None

    tmp_out = out_dir / "_autoport_tmp.js"
    cmd = [sys.executable, str(AUTO_PORT_SCRIPT), str(client), "-o", str(tmp_out)]
    print(f"    Автоставка функций: {client.name}")

    env = os.environ.copy()
    env["PYTHONUTF8"] = "1"
    env["PYTHONIOENCODING"] = "utf-8"

    report_path = out_dir / "_autoport_report.txt"
    started = time.monotonic()
    last_status = started
    timed_out = False
    # auto_port writes into a report file while the tracker tails it. This
    # avoids subprocess.run(capture_output=True), which looked frozen until the
    # entire multi-megabyte analysis had finished.
    with report_path.open("w+", encoding="utf-8", errors="replace") as report_file:
        proc = subprocess.Popen(
            cmd,
            stdout=report_file,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
            cwd=str(out_dir),
            env=env,
        )
        read_pos = 0
        while proc.poll() is None:
            time.sleep(0.25)
            report_file.flush()
            report_file.seek(read_pos)
            fresh = report_file.read()
            read_pos = report_file.tell()
            for line in fresh.splitlines():
                print(f"      {line}", flush=True)
            now = time.monotonic()
            if now - last_status >= AUTO_PORT_STATUS_SECONDS:
                print(f"      [auto-port всё ещё работает: {now - started:.0f}с]", flush=True)
                last_status = now
            if now - started >= AUTO_PORT_TIMEOUT:
                proc.kill()
                proc.wait()
                timed_out = True
                break
        report_file.flush()
        report_file.seek(read_pos)
        for line in report_file.read().splitlines():
            print(f"      {line}", flush=True)

    if timed_out:
        print(f"    [!] engine_port.py: таймаут после {AUTO_PORT_TIMEOUT}с")
        tmp_out.unlink(missing_ok=True)
        return None

    report = report_path.read_text(encoding="utf-8", errors="replace").strip()
    if report:
        report_path.write_text(report + "\n", encoding="utf-8")

    if proc.returncode != 0:
        tail = "\n".join(report.splitlines()[-12:])
        print(f"    [!] engine_port.py код {proc.returncode}: {tail[:1200]}")
        tmp_out.unlink(missing_ok=True)
        return None
    if not tmp_out.exists() or tmp_out.stat().st_size == 0:
        print("    [!] engine_port.py не создал файл с модом")
        tmp_out.unlink(missing_ok=True)
        return None

    # Итог: в папке остаётся ОДИН файл клиента — webcrack + расшифровка + мод.
    shutil.move(str(tmp_out), str(client))
    publish_full(client)
    print(f"    Готовый файл (расшифрован + мод): {client} ({client.stat().st_size:,} байт)")
    print("      Клавиши: Q=AutoLoot  B=AutoBuild  L=PlayerList  H=Menu  ПКМ=Open")
    return client




def notify_discord_script_updated(client: Path) -> None:
    """Шлёт сообщение в Discord, когда готовый скрипт (full.js) обновлён."""
    if not DISCORD_WEBHOOK_URL:
        return
    try:
        size = client.stat().st_size
        meta = {}
        meta_path = client.parent / "_meta.json"
        if meta_path.exists():
            meta = json.loads(meta_path.read_text(encoding="utf-8", errors="replace"))
        payload = {
            "content": "Скрипт обновлён! :white_check_mark: Файл full.txt во вложении.",
            "embeds": [
                {
                    "title": "full.js обновлён",
                    "description": (
                        "Новая версия деобфусцирована, имена расшифрованы "
                        "и все функции добавлены."
                    ),
                    "color": 0x2ECC71,
                    "fields": [
                        {"name": "Исходный файл", "value": f"`{meta.get('filename', client.name)}`", "inline": True},
                        {"name": "Размер", "value": f"{size:,} байт", "inline": True},
                        {"name": "Время", "value": time.strftime("%Y-%m-%d %H:%M:%S"), "inline": True},
                    ],
                    "footer": {"text": "engine_tracker.py"},
                }
            ],
        }
        # full.js уходит вложением как full.txt (плюс сообщение-embed)
        file_bytes = client.read_bytes()
        resp = requests.post(
            DISCORD_WEBHOOK_URL,
            data={"payload_json": json.dumps(payload, ensure_ascii=False)},
            files={"file": ("full.txt", file_bytes, "text/plain")},
            timeout=300,
        )
        if resp.status_code in (200, 204):
            print("    Discord: уведомление отправлено")
        else:
            print(f"    [!] Discord webhook: HTTP {resp.status_code}: {resp.text[:200]}")
    except Exception as e:
        # Уведомление не должно ронять основную обработку
        print(f"    [!] Discord webhook ошибка: {e}")


def publish_full(client: Path) -> None:
    """Копирует готовый клиент в full.js — тот самый файл, который раздаётся."""
    tmp = FULL_JS.with_suffix(".js.tmp")
    shutil.copyfile(client, tmp)
    os.replace(tmp, FULL_JS)  # атомарная замена: раздача не отдаст половину файла
    notify_discord_script_updated(client)
    print(f"    full.js обновлён: {FULL_JS} ({FULL_JS.stat().st_size:,} байт)")


def process_script(url: str) -> str | None:
    """Скачивает во временный файл, деобфусцирует, сохраняет только результат."""
    filename = Path(urlparse(url).path).name
    if not filename.endswith(".js"):
        return None

    out_dir = script_out_dir(filename)
    if out_dir.exists():
        return None  # уже обработан

    print(f"[+] Новая версия: {filename}")
    print(f"    Скачивание {url} ...")
    resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
    resp.raise_for_status()
    data = resp.content
    digest = sha256_bytes(data)
    print(f"    Получено {len(data):,} байт, sha256 {digest[:16]}...")

    tmp_dir = Path(tempfile.mkdtemp(prefix="client_"))
    tmp_file = tmp_dir / filename
    tmp_out = tmp_dir / "out"
    try:
        tmp_file.write_bytes(data)
        print("    Деобфускация через webcrack (может занять несколько минут)...")
        started = time.time()
        run_webcrack(tmp_file, tmp_out)
        elapsed = time.time() - started

        if not tmp_out.exists() or not any(tmp_out.rglob("*.js")):
            raise RuntimeError("webcrack не выдал ни одного .js файла")

        out_dir.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(tmp_out), str(out_dir))

        print("    Постобработка: удаление обёртки + расшифровка имён...")
        names = postprocess_dir(out_dir)
        print(f"    Расшифровано имён всего: {len(names)}")

        modded = run_auto_port(out_dir)

        files = sorted(p.relative_to(out_dir).as_posix() for p in out_dir.rglob("*.js"))
        (out_dir / "_meta.json").write_text(
            json.dumps(
                {
                    "filename": filename,
                    "url": url,
                    "sha256_original": digest,
                    "size_original": len(data),
                    "downloaded_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                    "webcrack_seconds": round(elapsed, 1),
                    "files": files,
                    "renamed": names,
                    "modded_file": modded.name if modded else None,
                },
                ensure_ascii=False,
                indent=2,
            ),
            encoding="utf-8",
        )
        print(f"    Готово за {elapsed:.1f}с — {len(files)} файлов в {out_dir}")
        return filename
    except Exception as e:
        print(f"[!] Ошибка обработки {filename}: {e}")
        print("    Оригинал НЕ сохранён (сохраняется только результат webcrack).")
        if out_dir.exists():
            shutil.rmtree(out_dir, ignore_errors=True)
        return None
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


def check_once() -> dict:
    local = list_local_scripts()
    html = fetch_page(TARGET_URL)
    js_urls = extract_js_urls(html, TARGET_URL)

    processed: list[str] = []
    skipped: list[str] = []

    for url in js_urls:
        filename = Path(urlparse(url).path).name
        if filename in local:
            skipped.append(filename)
            continue
        name = process_script(url)
        if name:
            processed.append(name)

    return {
        "checked_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "found_urls": js_urls,
        "processed": processed,
        "skipped": skipped,
    }


def main() -> None:
    ensure_storage()
    print(f"Трекер запущен. Папка: {STORAGE_DIR.resolve()}")
    print("Сохраняются только деобфусцированные webcrack версии.")
    print(f"Проверка каждые {CHECK_INTERVAL_SECONDS // 60} минут. Ctrl+C для остановки.\n")

    while True:
        try:
            result = check_once()
            print(
                f"[{result['checked_at']}] найдено {len(result['found_urls'])}, "
                f"обработано {len(result['processed'])}, "
                f"уже было {len(result['skipped'])}"
            )
            for name in result["processed"]:
                print(f"    -> {name}")
        except requests.exceptions.RequestException as e:
            print(f"[!] Ошибка сети: {e}")
        except Exception as e:
            print(f"[!] Ошибка: {e}")

        print(f"--- Следующая проверка через {CHECK_INTERVAL_SECONDS // 60} минут ---\n")
        time.sleep(CHECK_INTERVAL_SECONDS)


if __name__ == "__main__":
    main()
