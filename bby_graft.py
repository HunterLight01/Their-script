#!/usr/bin/env python3
"""--aimbot-only: keep the whole engine_port output (our mod), but override
the aimbot objects with the verbatim BBY aimbot classes from bby_tail.js.
Appends an override block at EOF: BBY classes run in an IIFE, then the
global Aimbot/GetAllTargets/Jitter/AimbotRefresh bindings are reassigned
to the BBY instances, and the mod's own integration glue (extracted from
the built file) is re-attached to the new objects."""
import sys, pathlib

REPO = pathlib.Path(__file__).resolve().parent

def aimbot_chunk():
    tail = (REPO/'bby_tail.js').read_text()
    a = tail.find('    function calculateDistance')
    assert a > 0, 'calculateDistance not found in bby_tail.js'
    b = tail.find('addEventListener("mousemove"', a)
    assert b > 0
    b = tail.find('});', b) + 3
    chunk = tail[a:b]
    chunk = chunk.replace('    window.BabaConfig = BabaConfig;\n', '')
    chunk = chunk.replace('BabaConfig.', 'MOD.').replace('BabaConfig)', 'MOD)')
    return chunk

def glue_from(src):
    """The mod's integration glue + spearResolve, verbatim from built file."""
    a = src.find('// ---- integration glue')
    assert a > 0, 'integration glue marker not found'
    b = src.find('var MOD = {', a)
    assert b > 0
    glue1 = src[a:b]
    c = src.find('Aimbot.spearResolve = function() {', b)
    assert c > 0, 'spearResolve not found'
    d = src.find('function aimbotTick', c)
    assert d > 0
    glue2 = src[c:d]
    return glue1, glue2

def main(inp, outp, mode):
    src = open(inp).read()
    if mode != '--aimbot-only':
        raise SystemExit('only --aimbot-only supported')
    chunk = aimbot_chunk()
    assert 'class AimbotCon' in chunk and 'function AimbotRefresh' in chunk
    glue1, glue2 = glue_from(src)
    out = src + (
        '\n/* ===== BBY AIMBOT OVERRIDE (verbatim classes from BBY file) ===== */\n'
        'var __BBY = (function () {\n  var BabaConfig = MOD;\n'
        + chunk +
        '  return { G: GetAllTargets, A: Aimbot, J: Jitter, R: AimbotRefresh };\n})();\n'
        'GetAllTargets = __BBY.G;\nAimbot = __BBY.A;\nJitter = __BBY.J;\nAimbotRefresh = __BBY.R;\n'
        ''
        'window.Aimbot = Aimbot;\nwindow.GetAllTargets = GetAllTargets;\nwindow.AimbotRefresh = AimbotRefresh;\n'
        'try { __TOK_WINDOW__.Aimbot = Aimbot; __TOK_WINDOW__.GetAllTargets = GetAllTargets; __TOK_WINDOW__.AimbotRefresh = AimbotRefresh; } catch (e) {}\n'
        'try { window.AimbotMenu = window.AimbotMenu || gui; } catch (e) {}\n'
        + glue1 + glue2 +
        '/* ===== END BBY AIMBOT OVERRIDE ===== */\n'
    )
    open(outp, 'w').write(out)
    print('aimbot override appended:', outp, len(out))

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else '')
