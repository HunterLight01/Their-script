/* ===== BABA BabaConfig: kod36 structural port ===== */

/* ===== BABA BabaConfig: v27 port ===== */
//full code start2
(function () {
    "use strict";

    // ==========================================
    // BabaConfig CODE STARTS HERE
    // ==========================================


    const BaseSettings = {
        AntiKickEnabled: true,
        AutoBuildEnabled: false,
        FAutoLootEnabled: false,
        AutoTakeEnabled: false,
        PlayersListEnabled: false,
        SpamChatEnabled: false,
        SpamChatText: "hello",
        PlayerId: "",
        zoom: 0,
        token: "",
        XRay: false,
        RightClickEnabled: false,
        XRayKey: "KeyN",
        AutoBuildKey: "KeyB",
        FAutoLootKey: "KeyQ",
        AutoTakeKey: "KeyT",
        PlayersListKey: "KeyL",
        AutoRun: false,

        // Visuals (all unified in BabaConfig)
        TeamColor: "#5FAE72",
        EnemyTeamColor: "#FF0000",
        ShowBuildingOwner: true,
        ShowNamesOnMap: true,
        ShowPosition: true,
        ShowDayNightTime: true,
        ShowAngels: true,
        ESP: true,
        Lines: false,
        LinesOpacity: 5,

        // Unified Aim/Combat settings (formerly kept in the separate MOD object)
        AimBotEnabled: false,
        hideAimbotAngle: false,
        target: "players",
        mouseFovEnable: true,
        mouseFov: 131313,
        distanceCoefficient: 100,
        offsetCoefficient: 0.1,
        visualizeResolving: true,
        visualizeResolvingColor: "#FFF200",
        autoFire: false,
        lockId: -1,
        antiAimMode: "At target",
        jitterActive: false,
        jitterOffset: 85,
        stopJittersOnStop: false,
        ShowRealAngles: "withAim",
        AimbotKey: "KeyZ",
        JitterKey: "KeyJ",

        // ===== new test compatibility (ported against code36 runtime) =====
        ShowMines: true,
        ShowSpikes: true,
        ShowWires: true,
        ShowHousesNamesOnMap: true,
        ShowKarmaOnPlayers: false,
        ShowLapadoneTimer: true,
        ShowSwitchs: true,
        ShowOtherPlayersHp: true,
        ShowCycleTimer: true,
        ShowOverlay: true,
        hit: true,
        Xraytransparency: 0.40,
        AutoAttackEnabled: false,
        AutoAttackKey: "KeyO",
        AntiAimbot: false,
        AntiAimbotKey: "NoKey",
        antiAimCoefficient: 100,
        autoDodgeEnabled: false,
        TargetTeammate: false,
        hidePlayerAngle: false,
        resolverType: "linear",
        bulletSpeedCoefficient: 4,
        SpamChatText1: "",
        SpamChatText2: "",
        AutoAddWoodCellsGasoline: false
    };

    const BabaConfig = Object.assign({ _lastLoot: 0 }, BaseSettings);

    // new-test names -> stable code36/V8 names. Keep aliases live instead of duplicating state.
    try {
        const __alias = (legacy, canonical) => {
            if (Object.prototype.hasOwnProperty.call(BabaConfig, legacy)) return;
            Object.defineProperty(BabaConfig, legacy, {
                enumerable: true, configurable: true,
                get: function () { return BabaConfig[canonical]; },
                set: function (v) { BabaConfig[canonical] = v; }
            });
        };
        __alias("AimBotEnable", "AimBotEnabled");
        __alias("AutoBuiledEnabled", "AutoBuildEnabled");
        __alias("AutoBuiledKey", "AutoBuildKey");
        __alias("OpenEverythingByClick", "RightClickEnabled");
        __alias("XrayBuildings", "XRay");
        __alias("XrayKey", "XRayKey");
        __alias("TeamClanColor", "TeamColor");
        __alias("EnemyClanColor", "EnemyTeamColor");
        __alias("ShowLines", "Lines");
    } catch (__aliasErr) {}

    try {
        const stored = localStorage.getItem("BestModMenuConfig");
        if (stored === null) {
            const defaults = {};
            for (const key of Object.keys(BaseSettings)) defaults[key] = BaseSettings[key];
            localStorage.setItem("BestModMenuConfig", JSON.stringify(defaults));
            Object.assign(BabaConfig, defaults);
        } else {
            const parsed = JSON.parse(stored);
            const normalized = {};
            for (const key of Object.keys(BaseSettings)) {
                normalized[key] = (parsed && typeof parsed === "object" && Object.prototype.hasOwnProperty.call(parsed, key))
                    ? parsed[key]
                    : BaseSettings[key];
            }
            if (String(normalized.EnemyTeamColor || "").toUpperCase() === "#C95C5C") normalized.EnemyTeamColor = "#FF0000";
            localStorage.setItem("BestModMenuConfig", JSON.stringify(normalized));
            Object.assign(BabaConfig, normalized);
        }
    } catch (err) {
        const defaults = {};
        for (const key of Object.keys(BaseSettings)) defaults[key] = BaseSettings[key];
        try { localStorage.setItem("BestModMenuConfig", JSON.stringify(defaults)); } catch (e) {}
        Object.assign(BabaConfig, defaults);
    }

    // Menu toggle is intentionally fixed to H and is not part of re-bindable settings.
    window.BabaConfig = BabaConfig;

    function babaIsAllyPlayer(ownerId) {
        try {
            if (typeof World === "undefined" || !World || !World.PLAYER) return false;
            if (ownerId === undefined || ownerId === null) return false;
            var id = +ownerId;
            if (!isFinite(id)) return false;
            try { if (+World.PLAYER[օ̖̏] === id) return true; } catch (e) {}
            try { if (+World.PLAYER[օ̖̏] === id) return true; } catch (e) {}
            var teamId = +World.PLAYER.εᴎ༩;
            if (!isFinite(teamId) || teamId < 0) return false;
            if (!World.players || !World.players[id]) return false;
            var p = World.players[id];
            if (+p.εᴎ༩ !== teamId) return false;
            try {
                var team = World.ⲣ８ߌ && World.ⲣ８ߌ[teamId];
                if (team && p.εᴎ༩ !== undefined && team.аіߑ !== undefined) return p.εᴎ༩ === team.аіߑ;
            } catch (e) {}
            return true;
        } catch (e) {}
        return false;
    }

    function babaVisualColor(ownerId) {
        return babaIsAllyPlayer(ownerId)
            ? (BabaConfig.TeamColor || "#5FAE72")
            : (BabaConfig.EnemyTeamColor || "#FF0000");
    }
    window.BabaIsAllyPlayer = babaIsAllyPlayer;
    window.BabaVisualColor = babaVisualColor;

    // Resolve the current *rendered* player entity. This uses the live render pool,
    // not packet/tracker positions, so overlays stay glued to the character every frame.
    function babaGetLivePlayerPos(playerId) {
        try {
            if (typeof Entitie === "undefined" || !Entitie || !Entitie.ᅟρᄁ || typeof ܐߒ̷ === "undefined") return null;
            var units = Entitie.ᅟρᄁ[ܐߒ̷];
            if (!units) return null;
            var id = +playerId;
            for (var i = 0; i < units.length; i++) {
                var ent = units[i];
                if (!ent) continue;
                try { if (+ent.іᴎ̟ !== 0) continue; } catch (e) {}
                var eid = NaN;
                try { eid = +ent.ѕ٩ܚ; } catch (e) {}
                if (eid !== id) continue;
                var ex = NaN, ey = NaN;
                try { ex = +ent[x]; ey = +ent[y]; } catch (e) {}
                if (!isFinite(ex) || !isFinite(ey)) { try { ex = +ent[x]; ey = +ent[y]; } catch (e) {} }
                if (isFinite(ex) && isFinite(ey)) return { x: ex, y: ey, id: id, ent: ent };
            }
        } catch (e) {}
        return null;
    }
    window.BabaGetLivePlayerPos = babaGetLivePlayerPos;

    // True only when the cursor is actually over a live rendered player body.
    function babaCursorOverPlayer() {
        try {
            if (!window.GetAllTargets || !window.GetAllTargets.mouseMapCords) return false;
            var mx = +window.GetAllTargets.mouseMapCords.x;
            var my = +window.GetAllTargets.mouseMapCords.y;
            if (!isFinite(mx) || !isFinite(my)) return false;
            if (typeof Entitie === "undefined" || !Entitie.ᅟρᄁ || typeof ܐߒ̷ === "undefined") return false;
            var units = Entitie.ᅟρᄁ[ܐߒ̷];
            if (!units) return false;
            var hitR2 = 92 * 92;
            for (var i = 0; i < units.length; i++) {
                var ent = units[i];
                if (!ent) continue;
                try { if (+ent.іᴎ̟ !== 0) continue; } catch (e) {}
                var ex = NaN, ey = NaN;
                try { ex = +ent[x]; ey = +ent[y]; } catch (e) {}
                if (!isFinite(ex) || !isFinite(ey)) continue;
                var dx = ex - mx, dy = ey - my;
                if (dx * dx + dy * dy <= hitR2) return true;
            }
        } catch (e) {}
        return false;
    }
    window.BabaCursorOverPlayer = babaCursorOverPlayer;

    // Fallback owner scan for placed objects which do not run the normal action-hover path
    // (notably floor/flat/fire-style builds). active entities use іᴎ̟ === 0.
    function babaFindOwnedBuildUnderCursor() {
        try {
            if (!BabaConfig.ShowBuildingOwner || !window.GetAllTargets || !window.GetAllTargets.mouseMapCords) return null;
            if (typeof Entitie === "undefined" || !Entitie.ᅟρᄁ) return null;
            if (babaCursorOverPlayer()) return null;
            var mx = +window.GetAllTargets.mouseMapCords.x, my = +window.GetAllTargets.mouseMapCords.y;
            if (!isFinite(mx) || !isFinite(my)) return null;
            var cellSize = 100;
            try { if (typeof ԁ︊᠍ !== "undefined" && +ԁ︊᠍.εⲟ༨ > 10) cellSize = +ԁ︊᠍.εⲟ༨; } catch (e) {}
            var cx = Math.floor(mx / cellSize), cy = Math.floor(my / cellSize);
            var best = null, bestD = Infinity;
            for (var ti = 0; ti < Entitie.ᅟρᄁ.length; ti++) {
                var units = Entitie.ᅟρᄁ[ti];
                if (!units) continue;
                for (var i = 0; i < units.length; i++) {
                    var ent = units[i];
                    if (!ent) continue;
                    // IMPORTANT: v29 active/normal entity state is 0. 1 is a removal/debris copy.
                    try { if (+ent.іᴎ̟ !== 0) continue; } catch (e) {}
                    var type = -1;
                    try { type = +ent[ᴀވܖ]; } catch (e) {}
                    try { if (typeof ܐߒ̷ !== "undefined" && type === +ܐߒ̷) continue; } catch (e) {}
                    var owner = 0;
                    try { owner = +ent.ѕ٩ܚ; } catch (e) {}
                    if (!isFinite(owner) || owner <= 0) continue;

                    var ex = NaN, ey = NaN;
                    try { ex = +ent[x]; ey = +ent[y]; } catch (e) {}
                    var gx = NaN, gy = NaN;
                    try { gx = +ent.ᴎᄃܚ; gy = +ent.ㅤ३ࠃ; } catch (e) {}
                    if (!isFinite(gx) && isFinite(ex)) gx = Math.floor(ex / cellSize);
                    if (!isFinite(gy) && isFinite(ey)) gy = Math.floor(ey / cellSize);

                    var cellMatch = isFinite(gx) && isFinite(gy) && gx === cx && gy === cy;
                    var dx = isFinite(ex) ? ex - mx : Infinity;
                    var dy = isFinite(ey) ? ey - my : Infinity;
                    var d = dx * dx + dy * dy;
                    // Flat builds may sit slightly off the grid center; keep the fallback inside one cell.
                    var nearWorld = isFinite(d) && d <= (cellSize * 0.72) * (cellSize * 0.72);
                    if (!cellMatch && !nearWorld) continue;
                    if (!isFinite(d)) d = 0;
                    if (d < bestD) {
                        bestD = d;
                        var outGX = isFinite(gx) ? gx : cx, outGY = isFinite(gy) ? gy : cy;
                        best = {
                            id: owner,
                            cellX: outGX,
                            cellY: outGY,
                            x: outGX * cellSize + cellSize / 2,
                            y: outGY * cellSize + cellSize / 2,
                            type: type,
                            stamp: (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now()
                        };
                    }
                }
            }
            return best;
        } catch (e) { return null; }
    }
    window.BabaFindOwnedBuildUnderCursor = babaFindOwnedBuildUnderCursor;

    function saveBabaConfig() {
        try {
            const out = {};
            for (const key of Object.keys(BaseSettings)) out[key] = BabaConfig[key];
            localStorage.setItem("BestModMenuConfig", JSON.stringify(out));
        } catch (e) {}
    }

    let sys_lastBuild = 0;
    let sys_spamTimer = null;
    let ui_GridOverlay = null;
    let ui_HudOverlay = null;
    let ui_InfoPanel = null;
    let autoRunIv = null;

    function shiftEv(type) {
        var o = { 
            key: "Shift", 
            code: "ShiftLeft", 
            keyCode: 16, 
            which: 16, 
            shiftKey: type === "keydown", 
            bubbles: true, 
            cancelable: true 
        };
        window.dispatchEvent(new KeyboardEvent(type, o));
        document.dispatchEvent(new KeyboardEvent(type, o));
        var c = document.querySelector("canvas"); 
        if (c) c.dispatchEvent(new KeyboardEvent(type, o));
    }

    function startAutoRun() {
        if (autoRunIv) return;
        shiftEv("keydown");
        autoRunIv = setInterval(function() { 
            shiftEv("keydown"); 
        }, 50);
    }

    function stopAutoRun() {
        if (autoRunIv) { 
            clearInterval(autoRunIv); 
            autoRunIv = null; 
        }
        shiftEv("keyup");
    }

    function applyAutoRun(val) {
        BabaConfig.AutoRun = val;
        if (val) startAutoRun();
        else stopAutoRun();
    }

    const manageSpammer = () => {
        try {
            if (sys_spamTimer) {
                clearInterval(sys_spamTimer);
                sys_spamTimer = null;
            }
            if (!BabaConfig.SpamChatEnabled) return;
            
            var __spamFlip = false;
            var __nextSpam = function () {
                var a = String(BabaConfig.SpamChatText1 || "");
                var b = String(BabaConfig.SpamChatText2 || "");
                var legacy = String(BabaConfig.SpamChatText || "");
                var msg = (a || b) ? (__spamFlip ? (b || a) : (a || b)) : legacy;
                __spamFlip = !__spamFlip;
                transmitChat(msg);
            };
            __nextSpam();
            sys_spamTimer = setInterval(__nextSpam, 5000);
        } catch (e) {}
    };

    if (BabaConfig.SpamChatEnabled) setTimeout(manageSpammer, 2000);
    if (BabaConfig.AutoRun) setTimeout(() => applyAutoRun(true), 1000);

    const transmitChat = (msg) => {
        try {
            if (!msg) return;
            if (typeof ո︀̜ !== "undefined" && ո︀̜ && typeof ո︀̜.ε٣︀ === "function") {
                ո︀̜.ε٣︀(String(msg));
            }
        } catch (e) {}
    };

    const dispatchNet = (dataArr) => {
        try {
            if (typeof ո︀̜ === "undefined" || typeof ո︀̜.ε٣︀ !== "function") return;
            try { ո︀̜.ε٣︀(JSON.stringify(dataArr)); return; } catch (e) {}
        } catch (e) {}
    };

    let _rcMouse = { x: 0, y: 0 };
    document.addEventListener("mousemove", function (ev) {
        _rcMouse.x = ev.clientX;
        _rcMouse.y = ev.clientY;
    }, true);

    function rcGetCanvas() {
        return document.getElementById("can") || document.querySelector("#can") || document.querySelector("canvas");
    }

    function rcWorldCursor(clientX, clientY) {
        try {
            var scale = +window.__babaWorldScale;
            var offX = +window.__babaCamX;
            var offY = +window.__babaCamY;
            if (!isFinite(scale) || scale <= 0) scale = +ιᚆܖ;
            if (!isFinite(offX)) offX = +ࡀ͢މ;
            if (!isFinite(offY)) offY = +ᴑᴇߌ;
            if (!isFinite(scale) || scale <= 0 || !isFinite(offX) || !isFinite(offY)) return null;

            var screenX = NaN, screenY = NaN;

            // Same client -> internal screen transform as the game/admin helper.
            if (isFinite(+clientX) && isFinite(+clientY)) {
                try {
                    var rx = +αࠄކ[ᴀᚊܖ].ⲟ͏٣;
                    var ry = +αࠄކ[ㅤ̢Ꮷ].ѕ̴̄;
                    if (isFinite(rx) && rx > 0 && isFinite(ry) && ry > 0) {
                        screenX = +clientX * rx;
                        screenY = +clientY * ry;
                    }
                } catch (__ratioErr) {}
            }

            // Native raw mouse coordinates are the authoritative fallback.
            if (!isFinite(screenX) || !isFinite(screenY)) {
                try {
                    if (typeof ԁ︊᠍ !== "undefined" && ԁ︊᠍ && isFinite(+ԁ︊᠍.ܐ̏๖) && isFinite(+ԁ︊᠍.ѕᄀ︀)) {
                        screenX = +ԁ︊᠍.ܐ̏๖;
                        screenY = +ԁ︊᠍.ѕᄀ︀;
                    }
                } catch (__nativeRawErr) {}
            }

            // Last fallback: native tracker coordinates are already divided by render scale.
            if (!isFinite(screenX) || !isFinite(screenY)) {
                try {
                    if (typeof ԁ︊᠍ !== "undefined" && ԁ︊᠍ && isFinite(+ԁ︊᠍[x]) && isFinite(+ԁ︊᠍[y])) {
                        var directX = +ԁ︊᠍[x] - offX;
                        var directY = +ԁ︊᠍[y] - offY;
                        if (isFinite(directX) && isFinite(directY)) return {x:directX, y:directY};
                    }
                } catch (__nativeScaledErr) {}
            }

            if (!isFinite(screenX) || !isFinite(screenY)) return null;
            var wx = screenX / scale - offX;
            var wy = screenY / scale - offY;
            return (isFinite(wx) && isFinite(wy)) ? {x:wx, y:wy} : null;
        } catch (e) { return null; }
    }

    function rcFindDoorUnderCursor(worldPoint) {
        try {
            if (!worldPoint || !window.__babaDoorActions) return null;
            var px = +worldPoint.x, py = +worldPoint.y;
            if (!isFinite(px) || !isFinite(py)) return null;
            var now = Date.now(), best = null, bestScore = Infinity;
            var table = window.__babaDoorActions;
            for (var k in table) {
                if (!Object.prototype.hasOwnProperty.call(table, k)) continue;
                var d = table[k];
                if (!d || now - (+d.t || 0) > 1200) continue;
                var w = Math.max(20, +d.w || 100);
                var h = Math.max(20, +d.h || 100);
                // Small padding makes the thin 35px door easy to hit without spilling into
                // the next full tile. Test both entity center and native grid-cell center.
                var pad = 12;
                var centers = [];
                if (isFinite(+d.x) && isFinite(+d.y)) centers.push([+d.x, +d.y]);
                if (isFinite(+d.gx) && isFinite(+d.gy)) centers.push([+d.gx * 100 + 50, +d.gy * 100 + 50]);
                for (var ci = 0; ci < centers.length; ci++) {
                    var cx = centers[ci][0], cy = centers[ci][1];
                    var dx = Math.abs(px - cx), dy = Math.abs(py - cy);
                    if (dx <= w / 2 + pad && dy <= h / 2 + pad) {
                        var score = (dx * dx) / Math.max(1, w * w) + (dy * dy) / Math.max(1, h * h);
                        if (score < bestScore) {
                            bestScore = score;
                            best = {packetId:+d.packetId, id:+d.id, pid:+d.pid || 0, kind:"door"};
                        }
                    }
                }
            }
            return best;
        } catch (e) { return null; }
    }

    function rcFindEntityUnderCursor(clientX, clientY) {
        try {
            var p = rcWorldCursor(clientX, clientY);
            if (!p) return null;
            var doorHit = rcFindDoorUnderCursor(p);
            if (doorHit) return doorHit;
            var mapTileX = Math.floor(Math.round(+p.x) / 100);
            var mapTileY = Math.floor(Math.round(+p.y) / 100);
            var key = mapTileX + ":" + mapTileY;
            var tuple = window.__babaGridActions && window.__babaGridActions[key];
            if (!tuple) return null;
            if (Array.isArray(tuple)) {
                if (tuple.length < 2) return null;
                return {packetId:+tuple[0], id:+tuple[1], pid:+tuple[2] || 0};
            }
            if (typeof tuple === "object") {
                return {packetId:+tuple.packetId, id:+tuple.id, pid:+tuple.pid || 0};
            }
            return null;
        } catch (e) { return null; }
    }

    function rcHandleActionOpen(clientX, clientY) {
        try {
            var h = rcFindEntityUnderCursor(clientX, clientY);
            if (!h || !(h.packetId > 0) || !(h.id >= 0)) return false;
            BabaConfig.hit = false;
            dispatchNet([h.packetId, h.id, h.pid]);
            return true;
        } catch (e) { return false; }
    }

    // Exact clicked tile only. No nearest-E-target fallback.
    document.addEventListener("mousedown", function (event) {
        try {
            if (event.button !== 2 || !BabaConfig.RightClickEnabled || !ո︀̜ || (ո︀̜[state] & ո︀̜.State.__CONNECTED__ ? 1 : 0) !== 1) return;
            _rcMouse.x = event.clientX;
            _rcMouse.y = event.clientY;
            if (rcHandleActionOpen(event.clientX, event.clientY)) {
                event.preventDefault();
                event.stopPropagation();
            }
        } catch (e) {}
    }, true);
    document.addEventListener("mouseup", function (event) {
        if (event.button === 2 && BabaConfig.RightClickEnabled) BabaConfig.hit = true;
    }, true);
    document.addEventListener("contextmenu", function (event) {
        if (BabaConfig.RightClickEnabled) {
            event.preventDefault();
            event.stopPropagation();
        }
    }, true);

    const routineAutoBuild = () => {
        if (!BabaConfig.AutoBuildEnabled || typeof World === "undefined" || !World.PLAYER) return;
        
        try {
            const timeNow = Date.now();
            if (timeNow - sys_lastBuild < 30) return;

            let usr = World.PLAYER;
            let rot = usr.і༡๐;
            let bI = usr.ɑ२︆;
            let bJ = usr.ⲟ̢٢;

            if (rot === undefined || bI === undefined || bJ === undefined) return;
            if (typeof bI === "number" && bI < 0) return;
            if (typeof bJ === "number" && bJ < 0) return;
            if (typeof ո︀̜ === "undefined" || typeof ո︀̜.ε٣︀ !== "function") return;

            ո︀̜.ε٣︀(JSON.stringify([14, rot, bI, bJ]));
            sys_lastBuild = timeNow;
        } catch (e) {}
    };

    const routineAutoTake = () => {
        if (!BabaConfig.AutoTakeEnabled) return;
        try {
            if (typeof World === "undefined" || !World || !World.PLAYER) return;
            if (typeof ո︀̜ === "undefined" || typeof ո︀̜.ε٣︀ !== "function") return;

            // v27's native take path uses ⲣމࡅ and packet [27, slot].
            var slots = ⲣމࡅ;
            for (var slot = 0; slot < 4; slot++) {
                try {
                    if (slots && slots[slot] && slots[slot][0] === 0) continue;
                } catch (e) {}
                ո︀̜.ε٣︀(JSON.stringify([27, slot]));
            }
        } catch (e) {}
    };

    const routineAntiKick = () => {
        if (!BabaConfig.AntiKickEnabled) return;
        try {
            if (typeof ո︀̜ !== "undefined" && typeof ո︀̜["ε٣︀"] === "function") {
                ո︀̜["ε٣︀"](JSON.stringify([0]));
            }
        } catch (_antiKickErr) {}
    };

    // ===== new-test verified automation compatibility =====
    var __antiMoveStep = 0;
    var __antiMovePattern = [1, 2, 4, 8, 1, 2, 4, 8, 5, 9, 10, 6];
    function routineAntiAimbot() {
        try {
            if (!BabaConfig.AntiAimbot) return;
            var coeff = Math.max(1, +BabaConfig.antiAimCoefficient || 100);
            __antiMoveStep += coeff;
            var idx = Math.floor(__antiMoveStep / coeff) % __antiMovePattern.length;
            dispatchNet([2, __antiMovePattern[idx]]);
        } catch (e) {}
    }
    function setAutoAttackState(on) {
        try { dispatchNet([on ? 4 : 5]); } catch (e) {}
    }
    function routineAutoAttack() {
        try {
            if (!BabaConfig.AutoAttackEnabled || !World || !World.PLAYER || +World.PLAYER[օ̖̏] <= 0) return;
            // Same keep-alive attack packet used by new-test. The explicit [5] is sent when disabled.
            dispatchNet([4]);
        } catch (e) {}
    }
    function routineAutoFireResources() {
        try {
            if (!BabaConfig.AutoAddWoodCellsGasoline || !World || !World.PLAYER || +World.PLAYER[օ̖̏] <= 0) return;
            dispatchNet([24]);
        } catch (e) {}
    }

    var __newTestCraftItems = {
        AutoString: [6],
        AutoGasoline: [58, 13],
        AutoSoups: [72],
        AutoSteaks: [10],
        AutoMetal: [8],
        AutoAlloys: [95],
        AutoUranium: [54],
        AutoCells: [92],
        AutoAmmo: [36],
        AutoTeslaBots: [139],
        AutoGrenade: [113],
        AutoDynamite: [98],
        AutoStoneFloors: [84],
        AutoTilingFloors: [85],
        AutoStoneWalls: [28],
        AutoStoneDoors: [51],
        AutoMetalWalls: [29],
        AutoMetalDoors: [52]
    };
    function routineAutoCraft() {
        try {
            if (!World || !World.PLAYER || +World.PLAYER[օ̖̏] <= 0) return;
            for (var opt in __newTestCraftItems) {
                if (!BabaConfig[opt]) continue;
                var ids = __newTestCraftItems[opt];
                for (var ci = 0; ci < ids.length; ci++) dispatchNet([18, ids[ci]]);
            }
        } catch (e) {}
    }

    setInterval(routineAutoBuild, 25);
    setInterval(routineAutoTake, 50);
    setInterval(routineAntiAimbot, 50);
    setInterval(routineAutoAttack, 3000);
    setInterval(routineAutoFireResources, 600);
    setInterval(routineAutoCraft, 1200);
    setInterval(routineAntiKick, 7000); 

    const pullPlayerName = (pObj) => {
        if (!pObj) return "";
        let nameStr = "";
        try { nameStr = pObj.ⲟࡇܛ; } catch (e) {}
        if (!nameStr) try { nameStr = pObj.nickname; } catch (e) {}
        return nameStr ? String(nameStr) : "";
    };

    const clbCopyID = (rawId) => {
        try {
            let pId = parseInt(rawId, 10);
            if (typeof World === "undefined" || !World.players || !World.players[pId]) {
                return alert("Player not found");
            }
            let nk = pullPlayerName(World.players[pId]).split("#")[0];
            if (!nk || nk === "0") return alert("Name not found");
            
            if (navigator.clipboard) navigator.clipboard.writeText(nk);
            alert(`Copied: ${nk}`);
        } catch (e) {}
    };

    const clbCopyAll = () => {
        try {
            if (typeof World === "undefined" || !World.players) return alert("No players available");
            let list = [];
            for (let k in World.players) {
                let pName = pullPlayerName(World.players[k]);
                if (pName) {
                    let cleanNick = pName.split("#")[0].trim();
                    if (cleanNick && cleanNick !== "0" && !list.includes(cleanNick)) {
                        list.push(cleanNick);
                    }
                }
            }
            if (!list.length) return alert("No players found");
            if (navigator.clipboard) navigator.clipboard.writeText(list.join("\n"));
            alert(`${list.length} names copied`);
        } catch (e) {}
    };

    // ===== BBY native zoom (ported from the working DEOB45 admin helper) =====
    var __bbyZoomFactor = 1;
    function __bbyApplyZoom() {
        try {
            if (!isFinite(__bbyZoomFactor)) __bbyZoomFactor = 1;
            if (__bbyZoomFactor < 0.33) __bbyZoomFactor = 0.33;
            if (__bbyZoomFactor > 2) __bbyZoomFactor = 2;
            window.BBYAdminZoomFactor = __bbyZoomFactor;
            BabaConfig.zoom = __bbyZoomFactor;
            ԁ︊᠍[ᴄࡆ̂] = __bbyZoomFactor - 1;
        } catch (e) {}
    }
    function __bbyChangeZoom(delta) {
        __bbyZoomFactor = Math.round((__bbyZoomFactor + delta) * 100) / 100;
        __bbyApplyZoom();
    }
    function __bbyInstallZoom() {
        try {
            var can = document.getElementById("can");
            if (!can || can.__bbyFullModZoomReady) return !!can;
            can.__bbyFullModZoomReady = true;
            can.addEventListener("wheel", function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
                __bbyChangeZoom(ev.deltaY < 0 ? 0.1 : -0.1);
            }, {passive:false,capture:true});
            return true;
        } catch (e) { return false; }
    }
    document.addEventListener("keydown", function(ev) {
        try {
            if (document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")) return;
            if (ev.code === "Equal" || ev.code === "NumpadAdd") { __bbyChangeZoom(0.1); ev.preventDefault(); }
            else if (ev.code === "Minus" || ev.code === "NumpadSubtract") { __bbyChangeZoom(-0.1); ev.preventDefault(); }
        } catch (e) {}
    }, true);
    setInterval(function(){ __bbyInstallZoom(); __bbyApplyZoom(); }, 50);

    // ===== BBY bottom-left survival numbers =====
    const initGridOverlay = () => {
        if (ui_GridOverlay && ui_GridOverlay.parentNode) return ui_GridOverlay;
        let box = document.createElement("div");
        box.style.cssText = "position:fixed;inset:0;z-index:999990;background:rgba(0,0,0,0.75);color:#fff;font:13px Viga,Arial,sans-serif;overflow:auto;display:none;padding:24px 30px;pointer-events:none;";
        document.body.appendChild(box);
        ui_GridOverlay = box;
        return box;
    };

    const initHudOverlay = () => {
        if (ui_HudOverlay && ui_HudOverlay.parentNode) return ui_HudOverlay;
        let pnl = document.createElement("div");
        pnl.style.cssText = "position:fixed;top:50%;left:20px;transform:translateY(-50%);z-index:998888;color:#fff;font:bold 16px Viga,Arial,sans-serif;background:transparent;padding:0;pointer-events:none;line-height:1.7;text-shadow: 2px 2px 4px rgba(0,0,0,0.95);";
        document.body.appendChild(pnl);
        ui_HudOverlay = pnl;
        return pnl;
    };

    const initInfoPanel = () => {
        if (ui_InfoPanel && ui_InfoPanel.parentNode) return ui_InfoPanel;
        let pnl = document.createElement("div");
        pnl.style.cssText = "position:fixed;top:18px;right:352px;left:auto;transform:none;z-index:999995;color:#fff;font:normal 14px Viga,Arial,sans-serif;background:rgba(0,0,0,0.45);border:1px solid rgba(255,255,255,0.15);border-radius:5px;padding:5px 8px;pointer-events:none;line-height:1.35;width:82px;text-align:left;text-shadow: 1px 1px 2px rgba(0,0,0,0.9);";
        document.body.appendChild(pnl);
        ui_InfoPanel = pnl;
        return pnl;
    };

    let currentFps = 60;
    let frameCount = 0;
    let lastFpsTime = performance.now();

    const calcFPS = () => {
        let now = performance.now();
        frameCount++;
        if (now - lastFpsTime >= 1000) {
            currentFps = Math.round((frameCount * 1000) / (now - lastFpsTime));
            frameCount = 0;
            lastFpsTime = now;
        }
        requestAnimationFrame(calcFPS);
    };
    requestAnimationFrame(calcFPS);

    const refreshHud = () => {
        try {
            let pnl = initHudOverlay();
            let c_ab = BabaConfig.AutoBuildEnabled ? "#2ecc71" : "#ffffff";
            let c_fl = BabaConfig.FAutoLootEnabled ? "#FF0000" : "#ffffff";
            let c_at = BabaConfig.AutoTakeEnabled ? "#8888FF" : "#ffffff";
            let c_xr = BabaConfig.XRay ? "#b659a7" : "#ffffff";
            let c_ak = BabaConfig.AntiKickEnabled ? "#00ffff" : "#ffffff";
            let c_ar = BabaConfig.AutoRun ? "#ff8c00" : "#ffffff";
            let c_rc = BabaConfig.RightClickEnabled ? "#ff00ff" : "#ffffff";
            let c_aim = BabaConfig.AimBotEnabled ? "#00ff66" : "#ffffff";

            pnl.innerHTML = `
                <div style="color:${c_ab}">AutoBuild: ${BabaConfig.AutoBuildEnabled ? "ON" : "OFF"}</div>
                <div style="color:${c_fl}">FAutoLoot: ${BabaConfig.FAutoLootEnabled ? "ON" : "OFF"}</div>
                <div style="color:${c_at}">AutoTake: ${BabaConfig.AutoTakeEnabled ? "ON" : "OFF"}</div>
                <div style="color:${c_xr}">X-Ray: ${BabaConfig.XRay ? "ON" : "OFF"}</div>
                <div style="color:${c_ak}">Anti-Kick: ${BabaConfig.AntiKickEnabled ? "ON" : "OFF"}</div>
                <div style="color:${c_ar}">AutoRun: ${BabaConfig.AutoRun ? "ON" : "OFF"}</div>
                <div style="color:${c_rc}">RightClick: ${BabaConfig.RightClickEnabled ? "ON" : "OFF"}</div>
                <div style="color:${c_aim}">Aimbot: ${BabaConfig.AimBotEnabled ? "ON" : "OFF"}</div>
            `;

            if (BabaConfig.ShowPosition && typeof World !== "undefined" && World && World.PLAYER) {
                try {
                    var px = World.PLAYER[x];
                    var py = World.PLAYER[y];
                    pnl.innerHTML += `<div style="color:#ffe082;margin-top:4px">[${Math.floor((+px || 0) / 100)}:${Math.floor((+py || 0) / 100)}]</div>`;
                } catch (e) {}
            }
        } catch (e) {}
    };
    setInterval(refreshHud, 150);

    const updateInfoPanel = () => {
        try {
            let pnl = initInfoPanel();
            let d = new Date();
            let hours = String(d.getHours()).padStart(2, '0');
            let minutes = String(d.getMinutes()).padStart(2, '0');
            let timeStr = `${hours}:${minutes}`;

            let dynamicPing = Math.floor(Math.random() * 5) + 3;

            let pCount = 0;
            if (World && World.players) {
                for (let key in World.players) {
                    if (String(key) === "0") continue;
                    let pName = pullPlayerName(World.players[key]);
                    if (!pName) continue;
                    let rawName = pName.split("#")[0].trim();
                    if (!rawName || rawName === "0") continue;
                    pCount++;
                }
            }

            let lineStyle = "border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 2px; margin-bottom: 2px;";
            pnl.innerHTML = `
                <div style="${lineStyle}">FPS: ${currentFps}</div>
                <div style="${lineStyle}">Ping: ${dynamicPing}ms</div>
                <div style="${lineStyle}">Time: ${timeStr}</div>
                <div>Players: ${pCount}</div>
            `;
        } catch (e) {}
    };
    setInterval(updateInfoPanel, 200);

    const refreshGrid = () => {
        try {
            let vGrid = initGridOverlay();
            if (!BabaConfig.PlayersListEnabled) {
                vGrid.style.display = "none";
                return;
            }
            vGrid.style.display = "block";

            let rawPlayers = [];
            let pCount = 0;
            const escBaba = (v) => String(v === undefined || v === null ? "" : v)
                .replace(/&/g, "&amp;").replace(/</g, "&lt;")
                .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
            const shortPoints = (value) => {
                let n = Number(value);
                if (!isFinite(n)) n = 0;
                n = Math.max(0, Math.floor(n));
                if (n >= 1000000000) return (Math.floor(n / 100000000) / 10).toString().replace(/\.0$/, "") + "b";
                if (n >= 1000000) return (Math.floor(n / 100000) / 10).toString().replace(/\.0$/, "") + "m";
                if (n >= 1000) return (Math.floor(n / 1000)) + "k";
                return String(n);
            };
            const karmaVisual = (pObj) => {
                try {
                    const map = ["img/karma4.png", "img/karma3.png", "img/karma2.png", "img/karma1.png", "img/karma0.png", "img/karma5.png"];
                    const idx = Math.floor(+pObj.І‍๗);
                    if (idx >= 0 && idx < map.length) return map[idx];
                } catch (e) {}
                return "";
            };

            if (World && World.players) {
                for (let key in World.players) {
                    if (String(key) === "0") continue;

                    let pObj = World.players[key];
                    if (!pObj) continue;
                    let pName = pullPlayerName(pObj);
                    if (!pName) continue;

                    let rawName = pName.split("#")[0].trim();
                    if (!rawName || rawName === "0") continue;

                    let serverId = String(key);
                    let points = 0;
                    let teamName = "";
                    let amI = false;
                    let sameTeam = false;

                    try { amI = !!(World.PLAYER && String(key) === String(World.PLAYER[օ̖̏])); } catch (e) {}
                    try {
                        if (typeof pObj.ⲅߒ̃ === "number" && isFinite(pObj.ⲅߒ̃))
                            points = Math.floor(pObj.ⲅߒ̃);
                    } catch (e) {}
                    try {
                        let teamId = +pObj.εᴎ༩;
                        if (teamId >= 0 && World.ⲣ８ߌ && World.ⲣ８ߌ[teamId]) {
                            let tm = World.ⲣ８ߌ[teamId];
                            if (pObj.εᴎ༩ === undefined || tm.аіߑ === undefined || pObj.εᴎ༩ === tm.аіߑ) {
                                let tn = tm[ᴎ०︁];
                                if (tn !== undefined && tn !== null && String(tn).trim())
                                    teamName = String(tn).trim();
                            }
                        }
                    } catch (e) {}
                    try { sameTeam = !!(teamName && window.BabaIsAllyPlayer && window.BabaIsAllyPlayer(+key)); } catch (e) {}

                    let nameClr = amI ? "#FFA500" : "#FFFFFF";
                    let teamHtml = "";
                    if (teamName) {
                        let teamClr = sameTeam ? "#69AFFF" : "#D76666";
                        teamHtml = `<span style="color:${teamClr};font-weight:700;margin-left:8px;">[${escBaba(teamName)}]</span>`;
                    }

                    let karmaSrc = karmaVisual(pObj);
                    let karmaHtml = karmaSrc
                        ? `<img src="${escBaba(karmaSrc)}" alt="" style="width:20px;height:20px;object-fit:contain;vertical-align:middle;margin-left:9px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.85));">`
                        : "";
                    let ptsHtml = `<span style="color:#C4CCD5;margin-left:8px;font-size:12px;">${escBaba(shortPoints(points))}</span>`;

                    rawPlayers.push(
                        `<div style="color:${nameClr};margin-bottom:6px;white-space:nowrap;line-height:22px;display:flex;align-items:center;min-height:22px;">` +
                          `<span>${escBaba(rawName)}#${escBaba(serverId)}</span>` +
                          teamHtml + karmaHtml + ptsHtml +
                        `</div>`
                    );
                    pCount++;
                }
            }

            let columnsHtml = [];
            let chunkSize = 15;
            for (let i = 0; i < rawPlayers.length; i += chunkSize) {
                let chunk = rawPlayers.slice(i, i + chunkSize);
                columnsHtml.push(`<div style="display:flex;flex-direction:column;min-width:300px;">${chunk.join("")}</div>`);
            }

            vGrid.innerHTML =
                `<div style="display:flex;flex-wrap:nowrap;gap:30px;max-height:calc(100vh - 80px);overflow-x:auto;padding-bottom:30px;">${columnsHtml.join("")}</div>` +
                `<div style="position:fixed;bottom:20px;right:20px;font-size:15px;color:#fff;background:rgba(0,0,0,0.85);padding:8px 12px;border-radius:4px;z-index:999999;">People On Server: ${pCount}</div>`;
        } catch (e) {}
    };
    setInterval(refreshGrid, 250);

    let bypassActive = false;
    const filterXR = (srcTxt) => {
        if (!srcTxt) return false;
        const s = String(srcTxt).toLowerCase();
        return ["wall","door","tree","wood","trunk","log","bush","plant","shrub","grass","rock","cactus","floor","ground"].some(word => s.includes(word));
    };

    const attachVisualHacks = () => {
        let tgtCvs = document.getElementById("can") || document.querySelector("canvas");
        if (!tgtCvs) return setTimeout(attachVisualHacks, 500);
        if (bypassActive) return;

        let rx = tgtCvs.getContext("2d");
        if (!rx) return;

        bypassActive = true;
        let baseDraw = rx.drawImage;
        
        rx.drawImage = function (...args) {
            try {
                let pic = args[0];
                if (BabaConfig.XRay && pic && pic.src && filterXR(pic.src)) {
                    let oldAlpha = this.globalAlpha;
                    this.globalAlpha = Math.max(0.05, Math.min(1, +BabaConfig.Xraytransparency || 0.4));
                    let ret = baseDraw.apply(this, args);
                    this.globalAlpha = oldAlpha;
                    return ret;
                }
            } catch (e) {}
            return baseDraw.apply(this, args);
        };
    };

    // One keyboard implementation for every re-bindable feature.
    window.addEventListener("keydown", (ev) => {
        try {
            let tg = ev.target;
            if (tg && (tg.tagName === "INPUT" || tg.tagName === "TEXTAREA" || tg.isContentEditable)) return;
        } catch (e) {}

        if (ev.repeat || _babaBindCapture) return;

        let changed = true;
        switch (ev.code) {
            case BabaConfig.AutoBuildKey:
                BabaConfig.AutoBuildEnabled = !BabaConfig.AutoBuildEnabled;
                break;
            case BabaConfig.FAutoLootKey:
                BabaConfig.FAutoLootEnabled = !BabaConfig.FAutoLootEnabled;
                break;
            case BabaConfig.AutoTakeKey:
                BabaConfig.AutoTakeEnabled = !BabaConfig.AutoTakeEnabled;
                break;
            case BabaConfig.PlayersListKey:
                BabaConfig.PlayersListEnabled = !BabaConfig.PlayersListEnabled;
                break;
            case BabaConfig.XRayKey:
                BabaConfig.XRay = !BabaConfig.XRay;
                break;
            case BabaConfig.AimbotKey:
                BabaConfig.AimBotEnabled = !BabaConfig.AimBotEnabled;
                try { if (window.AimbotRefresh) window.AimbotRefresh(); } catch (e) {}
                break;
            case BabaConfig.JitterKey:
                BabaConfig.jitterActive = !BabaConfig.jitterActive;
                break;
            case BabaConfig.AutoAttackKey:
                if (BabaConfig.AutoAttackKey !== "NoKey") {
                    BabaConfig.AutoAttackEnabled = !BabaConfig.AutoAttackEnabled;
                    try { setAutoAttackState(BabaConfig.AutoAttackEnabled); } catch (e) {}
                }
                break;
            case BabaConfig.AntiAimbotKey:
                if (BabaConfig.AntiAimbotKey !== "NoKey") BabaConfig.AntiAimbot = !BabaConfig.AntiAimbot;
                break;
            default:
                changed = false;
        }
        if (changed) {
            if (window.AimbotMenu) window.AimbotMenu.updateDisplay();
        }
    }, true);


    let _babaBindCapture = null;
    const guiAssignBind = (fld, obj, prop, dName) => {
        const cn = fld.add(obj, prop).name(dName || prop);
        const inNode = cn.domElement.querySelector("input");
        if (!inNode) return cn;
        inNode.readOnly = true;
        inNode.style.textAlign = "center";
        inNode.style.cursor = "pointer";

        inNode.addEventListener("click", (clickEv) => {
            clickEv.preventDefault();
            clickEv.stopPropagation();
            inNode.blur();

            if (_babaBindCapture) {
                document.removeEventListener("keydown", _babaBindCapture, true);
                _babaBindCapture = null;
            }

            const previous = obj[prop];
            obj[prop] = "Press a key...";
            cn.updateDisplay();

            _babaBindCapture = (e) => {
                // AutoRun generates synthetic Shift events. Only a real physical key may change a bind.
                if (e && e.isTrusted === false) return;
                e.preventDefault();
                e.stopPropagation();
                if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();

                if (e.code === "Escape") obj[prop] = previous;
                else if (e.code === "KeyH") {
                    // H is reserved exclusively for the menu.
                    obj[prop] = previous;
                } else {
                    obj[prop] = e.code;
                }

                cn.updateDisplay();
                document.removeEventListener("keydown", _babaBindCapture, true);
                _babaBindCapture = null;
            };
            document.addEventListener("keydown", _babaBindCapture, true);
        });
        return cn;
    };

    const parseTk = (txt) => {
        let matches = txt.match(/"([^"]*)"/g);
        if (matches && matches.length === 3) {
            return {
                tok: matches[0].slice(1, -1),
                tId: matches[1].slice(1, -1),
                uId: matches[2].slice(1, -1),
            };
        }
        return null;
    };

    // dat.GUI itself closes sibling folders; keep one accordion implementation only.
    const makeAcc = () => {};

    /* stale old-build bootstrap removed by exact port */
    /* ===================== BabaConfig BLOCK (ported) ===================== */
    /* ===================== dat.GUI (from message84) ===================== */
    (function(e, t) {
        if (typeof exports == "object" && typeof module != "undefined") {
            t(exports);
        } else if (typeof define == "function" && define.amd) {
            define(["exports"], t);
        } else {
            t(e.dat = {});
        }
    }
    )(window, function(e) {
        "use strict";

        function t(e, t) {
            var n = e.__state.conversionName.toString();
            var o = Math.round(e.r);
            var i = Math.round(e.g);
            var r = Math.round(e.b);
            var s = e.a;
            var a = Math.round(e.h);
            var l = e.s.toFixed(1);
            var d = e.v.toFixed(1);
            if (t || n === "THREE_CHAR_HEX" || n === "SIX_CHAR_HEX") {
                for (var c = e.hex.toString(16); c.length < 6; ) {
                    c = "0" + c;
                }
                return "#" + c;
            }
            if (n === "CSS_RGB") {
                return "rgb(" + o + "," + i + "," + r + ")";
            } else if (n === "CSS_RGBA") {
                return "rgba(" + o + "," + i + "," + r + "," + s + ")";
            } else if (n === "HEX") {
                return "0x" + e.hex.toString(16);
            } else if (n === "RGB_ARRAY") {
                return "[" + o + "," + i + "," + r + "]";
            } else if (n === "RGBA_ARRAY") {
                return "[" + o + "," + i + "," + r + "," + s + "]";
            } else if (n === "RGB_OBJ") {
                return "{r:" + o + ",g:" + i + ",b:" + r + "}";
            } else if (n === "RGBA_OBJ") {
                return "{r:" + o + ",g:" + i + ",b:" + r + ",a:" + s + "}";
            } else if (n === "HSV_OBJ") {
                return "{h:" + a + ",s:" + l + ",v:" + d + "}";
            } else if (n === "HSVA_OBJ") {
                return "{h:" + a + ",s:" + l + ",v:" + d + ",a:" + s + "}";
            } else {
                return "unknown format";
            }
        }
        function n(e, t, n) {
            Object.defineProperty(e, t, {
                get: function() {
                    if (this.__state.space === "RGB") {
                        return this.__state[t];
                    } else {
                        I.recalculateRGB(this, t, n);
                        return this.__state[t];
                    }
                },
                set: function(e) {
                    if (this.__state.space !== "RGB") {
                        I.recalculateRGB(this, t, n);
                        this.__state.space = "RGB";
                    }
                    this.__state[t] = e;
                }
            });
        }
        function o(e, t) {
            Object.defineProperty(e, t, {
                get: function() {
                    if (this.__state.space === "HSV") {
                        return this.__state[t];
                    } else {
                        I.recalculateHSV(this);
                        return this.__state[t];
                    }
                },
                set: function(e) {
                    if (this.__state.space !== "HSV") {
                        I.recalculateHSV(this);
                        this.__state.space = "HSV";
                    }
                    this.__state[t] = e;
                }
            });
        }
        function i(e) {
            if (e === "0" || S.isUndefined(e)) {
                return 0;
            }
            var t = e.match(U);
            if (S.isNull(t)) {
                return 0;
            } else {
                return parseFloat(t[1]);
            }
        }
        function r(e) {
            var t = e.toString();
            if (t.indexOf(".") > -1) {
                return t.length - t.indexOf(".") - 1;
            } else {
                return 0;
            }
        }
        function s(e, t) {
            var n = Math.pow(10, t);
            return Math.round(e * n) / n;
        }
        function a(e, t, n, o, i) {
            return o + (e - t) / (n - t) * (i - o);
        }
        function l(e, t, n, o) {
            e.style.background = "";
            S.each(ee, function(i) {
                e.style.cssText += "background: " + i + "linear-gradient(" + t + ", " + n + " 0%, " + o + " 100%); ";
            });
        }
        function d(e) {
            e.style.background = "";
            e.style.cssText += "background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);";
            e.style.cssText += "background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
            e.style.cssText += "background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
            e.style.cssText += "background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
            e.style.cssText += "background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
        }
        function c(e, t, n) {
            var o = document.createElement("li");
            if (t) {
                o.appendChild(t);
            }
            if (n) {
                e.__ul.insertBefore(o, n);
            } else {
                e.__ul.appendChild(o);
            }
            e.onResize();
            return o;
        }
        function u(e) {
            X.unbind(window, "resize", e.__resizeHandler);
            if (e.saveToLocalStorageIfPossible) {
                X.unbind(window, "unload", e.saveToLocalStorageIfPossible);
            }
        }
        function _(e, t) {
            var n = e.__preset_select[e.__preset_select.selectedIndex];
            n.innerHTML = t ? n.value + "*" : n.value;
        }
        function h(e, t, n) {
            n.__li = t;
            n.__gui = e;
            S.extend(n, {
                options: function(t) {
                    if (arguments.length > 1) {
                        var o = n.__li.nextElementSibling;
                        n.remove();
                        return f(e, n.object, n.property, {
                            before: o,
                            factoryArgs: [S.toArray(arguments)]
                        });
                    }
                    if (S.isArray(t) || S.isObject(t)) {
                        var i = n.__li.nextElementSibling;
                        n.remove();
                        return f(e, n.object, n.property, {
                            before: i,
                            factoryArgs: [t]
                        });
                    }
                },
                name: function(e) {
                    n.__li.firstElementChild.firstElementChild.innerHTML = e;
                    return n;
                },
                listen: function() {
                    n.__gui.listen(n);
                    return n;
                },
                remove: function() {
                    n.__gui.remove(n);
                    return n;
                }
            });
            if (n instanceof q) {
                var o = new Q(n.object,n.property,{
                    min: n.__min,
                    max: n.__max,
                    step: n.__step
                });
                S.each(["updateDisplay", "onChange", "onFinishChange", "step", "min", "max"], function(e) {
                    var t = n[e];
                    var i = o[e];
                    n[e] = o[e] = function() {
                        var e = Array.prototype.slice.call(arguments);
                        i.apply(o, e);
                        return t.apply(n, e);
                    }
                    ;
                });
                X.addClass(t, "has-slider");
                n.domElement.insertBefore(o.domElement, n.domElement.firstElementChild);
            } else if (n instanceof Q) {
                function i(t) {
                    if (S.isNumber(n.__min) && S.isNumber(n.__max)) {
                        var o = n.__li.firstElementChild.firstElementChild.innerHTML;
                        var i = n.__gui.__listening.indexOf(n) > -1;
                        n.remove();
                        var r = f(e, n.object, n.property, {
                            before: n.__li.nextElementSibling,
                            factoryArgs: [n.__min, n.__max, n.__step]
                        });
                        r.name(o);
                        if (i) {
                            r.listen();
                        }
                        return r;
                    }
                    return t;
                }
                n.min = S.compose(i, n.min);
                n.max = S.compose(i, n.max);
            } else if (n instanceof K) {
                X.bind(t, "click", function() {
                    X.fakeEvent(n.__checkbox, "click");
                });
                X.bind(n.__checkbox, "click", function(e) {
                    e.stopPropagation();
                });
            } else if (n instanceof Z) {
                X.bind(t, "click", function() {
                    X.fakeEvent(n.__button, "click");
                });
                X.bind(t, "mouseover", function() {
                    X.addClass(n.__button, "hover");
                });
                X.bind(t, "mouseout", function() {
                    X.removeClass(n.__button, "hover");
                });
            } else if (n instanceof $) {
                X.addClass(t, "color");
                n.updateDisplay = S.compose(function(e) {
                    t.style.borderLeftColor = n.__color.toString();
                    return e;
                }, n.updateDisplay);
                n.updateDisplay();
            }
            n.setValue = S.compose(function(t) {
                if (e.getRoot().__preset_select && n.isModified()) {
                    _(e.getRoot(), true);
                }
                return t;
            }, n.setValue);
        }
        function p(e, t) {
            var n = e.getRoot();
            var o = n.__rememberedObjects.indexOf(t.object);
            if (o !== -1) {
                var i = n.__rememberedObjectIndecesToControllers[o];
                if (i === undefined) {
                    i = {};
                    n.__rememberedObjectIndecesToControllers[o] = i;
                }
                i[t.property] = t;
                if (n.load && n.load.remembered) {
                    var r = n.load.remembered;
                    var s = undefined;
                    if (r[e.preset]) {
                        s = r[e.preset];
                    } else {
                        if (!r[se]) {
                            return;
                        }
                        s = r[se];
                    }
                    if (s[o] && s[o][t.property] !== undefined) {
                        var a = s[o][t.property];
                        t.initialValue = a;
                        t.setValue(a);
                    }
                }
            }
        }
        function f(e, t, n, o) {
            if (t[n] === undefined) {
                throw new Error("Object \"" + t + "\" has no property \"" + n + "\"");
            }
            var i = undefined;
            if (o.color) {
                i = new $(t,n);
            } else {
                var r = [t, n].concat(o.factoryArgs);
                i = ne.apply(e, r);
            }
            if (o.before instanceof z) {
                o.before = o.before.__li;
            }
            p(e, i);
            X.addClass(i.domElement, "c");
            var s = document.createElement("span");
            X.addClass(s, "property-name");
            s.innerHTML = i.property;
            var a = document.createElement("div");
            a.appendChild(s);
            a.appendChild(i.domElement);
            var l = c(e, a, o.before);
            X.addClass(l, he.CLASS_CONTROLLER_ROW);
            if (i instanceof $) {
                X.addClass(l, "color");
            } else {
                X.addClass(l, H(i.getValue()));
            }
            h(e, l, i);
            e.__controllers.push(i);
            return i;
        }
        function m(e, t) {
            return document.location.href + "." + t;
        }
        function g(e, t, n) {
            var o = document.createElement("option");
            o.innerHTML = t;
            o.value = t;
            e.__preset_select.appendChild(o);
            if (n) {
                e.__preset_select.selectedIndex = e.__preset_select.length - 1;
            }
        }
        function b(e, t) {
            t.style.display = e.useLocalStorage ? "block" : "none";
        }
        function v(e) {
            var t = e.__save_row = document.createElement("li");
            X.addClass(e.domElement, "has-save");
            e.__ul.insertBefore(t, e.__ul.firstChild);
            X.addClass(t, "save-row");
            var n = document.createElement("span");
            n.innerHTML = "&nbsp;";
            X.addClass(n, "button gears");
            var o = document.createElement("span");
            o.innerHTML = "Save";
            X.addClass(o, "button");
            X.addClass(o, "save");
            var i = document.createElement("span");
            i.innerHTML = "New";
            X.addClass(i, "button");
            X.addClass(i, "save-as");
            var r = document.createElement("span");
            r.innerHTML = "Revert";
            X.addClass(r, "button");
            X.addClass(r, "revert");
            var s = e.__preset_select = document.createElement("select");
            if (e.load && e.load.remembered) {
                S.each(e.load.remembered, function(t, n) {
                    g(e, n, n === e.preset);
                });
            } else {
                g(e, se, false);
            }
            X.bind(s, "change", function() {
                for (var t = 0; t < e.__preset_select.length; t++) {
                    e.__preset_select[t].innerHTML = e.__preset_select[t].value;
                }
                e.preset = this.value;
            });
            t.appendChild(s);
            t.appendChild(n);
            t.appendChild(o);
            t.appendChild(i);
            t.appendChild(r);
            if (ae) {
                var a = document.getElementById("dg-local-explain");
                var l = document.getElementById("dg-local-storage");
                document.getElementById("dg-save-locally").style.display = "block";
                if (localStorage.getItem(m(e, "isLocal")) === "true") {
                    l.setAttribute("checked", "checked");
                }
                b(e, a);
                X.bind(l, "change", function() {
                    e.useLocalStorage = !e.useLocalStorage;
                    b(e, a);
                });
            }
            var d = document.getElementById("dg-new-constructor");
            X.bind(d, "keydown", function(e) {
                if (!!e.metaKey && (e.which === 67 || e.keyCode === 67)) {
                    le.hide();
                }
            });
            X.bind(n, "click", function() {
                d.innerHTML = JSON.stringify(e.getSaveObject(), undefined, 2);
                le.show();
                d.focus();
                d.select();
            });
            X.bind(o, "click", function() {
                e.save();
            });
            X.bind(i, "click", function() {
                var t = prompt("Enter a new preset name.");
                if (t) {
                    e.saveAs(t);
                }
            });
            X.bind(r, "click", function() {
                e.revert();
            });
        }
        function y(e) {
            function t(t) {
                t.preventDefault();
                e.width += i - t.clientX;
                e.onResize();
                i = t.clientX;
                return false;
            }
            function n() {
                X.removeClass(e.__closeButton, he.CLASS_DRAG);
                X.unbind(window, "mousemove", t);
                X.unbind(window, "mouseup", n);
            }
            function o(o) {
                o.preventDefault();
                i = o.clientX;
                X.addClass(e.__closeButton, he.CLASS_DRAG);
                X.bind(window, "mousemove", t);
                X.bind(window, "mouseup", n);
                return false;
            }
            var i = undefined;
            e.__resize_handle = document.createElement("div");
            S.extend(e.__resize_handle.style, {
                width: "6px",
                marginLeft: "-3px",
                height: "200px",
                cursor: "ew-resize",
                position: "absolute"
            });
            X.bind(e.__resize_handle, "mousedown", o);
            X.bind(e.__closeButton, "mousedown", o);
            e.domElement.insertBefore(e.__resize_handle, e.domElement.firstElementChild);
        }
        function w(e, t) {
            e.domElement.style.width = t + "px";
            if (e.__save_row && e.autoPlace) {
                e.__save_row.style.width = t + "px";
            }
            if (e.__closeButton) {
                e.__closeButton.style.width = t + "px";
            }
        }
        function x(e, t) {
            var n = {};
            S.each(e.__rememberedObjects, function(o, i) {
                var r = {};
                var s = e.__rememberedObjectIndecesToControllers[i];
                S.each(s, function(e, n) {
                    r[n] = t ? e.initialValue : e.getValue();
                });
                n[i] = r;
            });
            return n;
        }
        function E(e) {
            for (var t = 0; t < e.__preset_select.length; t++) {
                if (e.__preset_select[t].value === e.preset) {
                    e.__preset_select.selectedIndex = t;
                }
            }
        }
        function C(e) {
            if (e.length !== 0) {
                oe.call(window, function() {
                    C(e);
                });
            }
            S.each(e, function(e) {
                e.updateDisplay();
            });
        }
        var A = Array.prototype.forEach;
        var k = Array.prototype.slice;
        var S = {
            BREAK: {},
            extend: function(e) {
                this.each(k.call(arguments, 1), function(t) {
                    (this.isObject(t) ? Object.keys(t) : []).forEach(function(n) {
                        if (!this.isUndefined(t[n])) {
                            e[n] = t[n];
                        }
                    }
                    .bind(this));
                }, this);
                return e;
            },
            defaults: function(e) {
                this.each(k.call(arguments, 1), function(t) {
                    (this.isObject(t) ? Object.keys(t) : []).forEach(function(n) {
                        if (this.isUndefined(e[n])) {
                            e[n] = t[n];
                        }
                    }
                    .bind(this));
                }, this);
                return e;
            },
            compose: function() {
                var e = k.call(arguments);
                return function() {
                    var t = k.call(arguments);
                    for (var n = e.length - 1; n >= 0; n--) {
                        t = [e[n].apply(this, t)];
                    }
                    return t[0];
                }
                ;
            },
            each: function(e, t, n) {
                if (e) {
                    if (A && e.forEach && e.forEach === A) {
                        e.forEach(t, n);
                    } else if (e.length === e.length + 0) {
                        var o = undefined;
                        var i = undefined;
                        o = 0;
                        i = e.length;
                        for (; o < i; o++) {
                            if (o in e && t.call(n, e[o], o) === this.BREAK) {
                                return;
                            }
                        }
                    } else {
                        for (var r in e) {
                            if (t.call(n, e[r], r) === this.BREAK) {
                                return;
                            }
                        }
                    }
                }
            },
            defer: function(e) {
                setTimeout(e, 0);
            },
            debounce: function(e, t, n) {
                var o = undefined;
                return function() {
                    var i = this;
                    var r = arguments;
                    var s = n || !o;
                    clearTimeout(o);
                    o = setTimeout(function() {
                        o = null;
                        if (!n) {
                            e.apply(i, r);
                        }
                    }, t);
                    if (s) {
                        e.apply(i, r);
                    }
                }
                ;
            },
            toArray: function(e) {
                if (e.toArray) {
                    return e.toArray();
                } else {
                    return k.call(e);
                }
            },
            isUndefined: function(e) {
                return e === undefined;
            },
            isNull: function(e) {
                return e === null;
            },
            isNaN: function(e) {
                function t(t) {
                    return e.apply(this, arguments);
                }
                t.toString = function() {
                    return e.toString();
                }
                ;
                return t;
            }(function(e) {
                return isNaN(e);
            }),
            isArray: Array.isArray || function(e) {
                return e.constructor === Array;
            }
            ,
            isObject: function(e) {
                return e === Object(e);
            },
            isNumber: function(e) {
                return e === e + 0;
            },
            isString: function(e) {
                return e === e + "";
            },
            isBoolean: function(e) {
                return e === false || e === true;
            },
            isFunction: function(e) {
                return e instanceof Function;
            }
        };
        var O = [{
            litmus: S.isString,
            conversions: {
                THREE_CHAR_HEX: {
                    read: function(e) {
                        var t = e.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);
                        return t !== null && {
                            space: "HEX",
                            hex: parseInt("0x" + t[1].toString() + t[1].toString() + t[2].toString() + t[2].toString() + t[3].toString() + t[3].toString(), 0)
                        };
                    },
                    write: t
                },
                SIX_CHAR_HEX: {
                    read: function(e) {
                        var t = e.match(/^#([A-F0-9]{6})$/i);
                        return t !== null && {
                            space: "HEX",
                            hex: parseInt("0x" + t[1].toString(), 0)
                        };
                    },
                    write: t
                },
                CSS_RGB: {
                    read: function(e) {
                        var t = e.match(/^rgb\(\s*(\S+)\s*,\s*(\S+)\s*,\s*(\S+)\s*\)/);
                        return t !== null && {
                            space: "RGB",
                            r: parseFloat(t[1]),
                            g: parseFloat(t[2]),
                            b: parseFloat(t[3])
                        };
                    },
                    write: t
                },
                CSS_RGBA: {
                    read: function(e) {
                        var t = e.match(/^rgba\(\s*(\S+)\s*,\s*(\S+)\s*,\s*(\S+)\s*,\s*(\S+)\s*\)/);
                        return t !== null && {
                            space: "RGB",
                            r: parseFloat(t[1]),
                            g: parseFloat(t[2]),
                            b: parseFloat(t[3]),
                            a: parseFloat(t[4])
                        };
                    },
                    write: t
                }
            }
        }, {
            litmus: S.isNumber,
            conversions: {
                HEX: {
                    read: function(e) {
                        return {
                            space: "HEX",
                            hex: e,
                            conversionName: "HEX"
                        };
                    },
                    write: function(e) {
                        return e.hex;
                    }
                }
            }
        }, {
            litmus: S.isArray,
            conversions: {
                RGB_ARRAY: {
                    read: function(e) {
                        return e.length === 3 && {
                            space: "RGB",
                            r: e[0],
                            g: e[1],
                            b: e[2]
                        };
                    },
                    write: function(e) {
                        return [e.r, e.g, e.b];
                    }
                },
                RGBA_ARRAY: {
                    read: function(e) {
                        return e.length === 4 && {
                            space: "RGB",
                            r: e[0],
                            g: e[1],
                            b: e[2],
                            a: e[3]
                        };
                    },
                    write: function(e) {
                        return [e.r, e.g, e.b, e.a];
                    }
                }
            }
        }, {
            litmus: S.isObject,
            conversions: {
                RGBA_OBJ: {
                    read: function(e) {
                        return !!S.isNumber(e.r) && !!S.isNumber(e.g) && !!S.isNumber(e.b) && !!S.isNumber(e.a) && {
                            space: "RGB",
                            r: e.r,
                            g: e.g,
                            b: e.b,
                            a: e.a
                        };
                    },
                    write: function(e) {
                        return {
                            r: e.r,
                            g: e.g,
                            b: e.b,
                            a: e.a
                        };
                    }
                },
                RGB_OBJ: {
                    read: function(e) {
                        return !!S.isNumber(e.r) && !!S.isNumber(e.g) && !!S.isNumber(e.b) && {
                            space: "RGB",
                            r: e.r,
                            g: e.g,
                            b: e.b
                        };
                    },
                    write: function(e) {
                        return {
                            r: e.r,
                            g: e.g,
                            b: e.b
                        };
                    }
                },
                HSVA_OBJ: {
                    read: function(e) {
                        return !!S.isNumber(e.h) && !!S.isNumber(e.s) && !!S.isNumber(e.v) && !!S.isNumber(e.a) && {
                            space: "HSV",
                            h: e.h,
                            s: e.s,
                            v: e.v,
                            a: e.a
                        };
                    },
                    write: function(e) {
                        return {
                            h: e.h,
                            s: e.s,
                            v: e.v,
                            a: e.a
                        };
                    }
                },
                HSV_OBJ: {
                    read: function(e) {
                        return !!S.isNumber(e.h) && !!S.isNumber(e.s) && !!S.isNumber(e.v) && {
                            space: "HSV",
                            h: e.h,
                            s: e.s,
                            v: e.v
                        };
                    },
                    write: function(e) {
                        return {
                            h: e.h,
                            s: e.s,
                            v: e.v
                        };
                    }
                }
            }
        }];
        var T = undefined;
        var L = undefined;
        function R() {
            L = false;
            var e = arguments.length > 1 ? S.toArray(arguments) : arguments[0];
            S.each(O, function(t) {
                if (t.litmus(e)) {
                    S.each(t.conversions, function(t, n) {
                        T = t.read(e);
                        if (L === false && T !== false) {
                            L = T;
                            T.conversionName = n;
                            T.conversion = t;
                            return S.BREAK;
                        }
                    });
                    return S.BREAK;
                }
            });
            return L;
        }
        var B = undefined;
        var N = {
            hsv_to_rgb: function(e, t, n) {
                var o = Math.floor(e / 60) % 6;
                var i = e / 60 - Math.floor(e / 60);
                var r = n * (1 - t);
                var s = n * (1 - i * t);
                var a = n * (1 - (1 - i) * t);
                var l = [[n, a, r], [s, n, r], [r, n, a], [r, s, n], [a, r, n], [n, r, s]][o];
                return {
                    r: l[0] * 255,
                    g: l[1] * 255,
                    b: l[2] * 255
                };
            },
            rgb_to_hsv: function(e, t, n) {
                var o = Math.min(e, t, n);
                var i = Math.max(e, t, n);
                var r = i - o;
                var s = undefined;
                var a = undefined;
                if (i === 0) {
                    return {
                        h: NaN,
                        s: 0,
                        v: 0
                    };
                } else {
                    a = r / i;
                    s = e === i ? (t - n) / r : t === i ? 2 + (n - e) / r : 4 + (e - t) / r;
                    if ((s /= 6) < 0) {
                        s += 1;
                    }
                    return {
                        h: s * 360,
                        s: a,
                        v: i / 255
                    };
                }
            },
            rgb_to_hex: function(e, t, n) {
                var o = this.hex_with_component(0, 2, e);
                o = this.hex_with_component(o, 1, t);
                return o = this.hex_with_component(o, 0, n);
            },
            component_from_hex: function(e, t) {
                return e >> t * 8 & 255;
            },
            hex_with_component: function(e, t, n) {
                return n << (B = t * 8) | e & ~(255 << B);
            }
        };
        var H = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
            return typeof e;
        }
        : function(e) {
            if (e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype) {
                return "symbol";
            } else {
                return typeof e;
            }
        }
        ;
        function F(e, t) {
            if (!(e instanceof t)) {
                throw new TypeError("Cannot call a class as a function");
            }
        }
        var P = function() {
            function e(e, t) {
                for (var n = 0; n < t.length; n++) {
                    var o = t[n];
                    o.enumerable = o.enumerable || false;
                    o.configurable = true;
                    if ("value"in o) {
                        o.writable = true;
                    }
                    Object.defineProperty(e, o.key, o);
                }
            }
            return function(t, n, o) {
                if (n) {
                    e(t.prototype, n);
                }
                if (o) {
                    e(t, o);
                }
                return t;
            }
            ;
        }();
        var D = function e(t, n, o) {
            if (t === null) {
                t = Function.prototype;
            }
            var i = Object.getOwnPropertyDescriptor(t, n);
            if (i === undefined) {
                var r = Object.getPrototypeOf(t);
                if (r === null) {
                    return undefined;
                } else {
                    return e(r, n, o);
                }
            }
            if ("value"in i) {
                return i.value;
            }
            var s = i.get;
            if (s !== undefined) {
                return s.call(o);
            }
        };
        function j(e, t) {
            if (typeof t != "function" && t !== null) {
                throw new TypeError("Super expression must either be null or a function, not " + typeof t);
            }
            e.prototype = Object.create(t && t.prototype, {
                constructor: {
                    value: e,
                    enumerable: false,
                    writable: true,
                    configurable: true
                }
            });
            if (t) {
                if (Object.setPrototypeOf) {
                    Object.setPrototypeOf(e, t);
                } else {
                    e.__proto__ = t;
                }
            }
        }
        function V(e, t) {
            if (!e) {
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            }
            if (!t || typeof t != "object" && typeof t != "function") {
                return e;
            } else {
                return t;
            }
        }
        var I = function() {
            function e() {
                F(this, e);
                this.__state = R.apply(this, arguments);
                if (this.__state === false) {
                    throw new Error("Failed to interpret color arguments");
                }
                this.__state.a = this.__state.a || 1;
            }
            P(e, [{
                key: "toString",
                value: function() {
                    return t(this);
                }
            }, {
                key: "toHexString",
                value: function() {
                    return t(this, true);
                }
            }, {
                key: "toOriginal",
                value: function() {
                    return this.__state.conversion.write(this);
                }
            }]);
            return e;
        }();
        I.recalculateRGB = function(e, t, n) {
            if (e.__state.space === "HEX") {
                e.__state[t] = N.component_from_hex(e.__state.hex, n);
            } else {
                if (e.__state.space !== "HSV") {
                    throw new Error("Corrupted color state");
                }
                S.extend(e.__state, N.hsv_to_rgb(e.__state.h, e.__state.s, e.__state.v));
            }
        }
        ;
        I.recalculateHSV = function(e) {
            var t = N.rgb_to_hsv(e.r, e.g, e.b);
            S.extend(e.__state, {
                s: t.s,
                v: t.v
            });
            if (S.isNaN(t.h)) {
                if (S.isUndefined(e.__state.h)) {
                    e.__state.h = 0;
                }
            } else {
                e.__state.h = t.h;
            }
        }
        ;
        I.COMPONENTS = ["r", "g", "b", "h", "s", "v", "hex", "a"];
        n(I.prototype, "r", 2);
        n(I.prototype, "g", 1);
        n(I.prototype, "b", 0);
        o(I.prototype, "h");
        o(I.prototype, "s");
        o(I.prototype, "v");
        Object.defineProperty(I.prototype, "a", {
            get: function() {
                return this.__state.a;
            },
            set: function(e) {
                this.__state.a = e;
            }
        });
        Object.defineProperty(I.prototype, "hex", {
            get: function() {
                if (this.__state.space !== "HEX") {
                    this.__state.hex = N.rgb_to_hex(this.r, this.g, this.b);
                    this.__state.space = "HEX";
                }
                return this.__state.hex;
            },
            set: function(e) {
                this.__state.space = "HEX";
                this.__state.hex = e;
            }
        });
        var z = function() {
            function e(t, n) {
                F(this, e);
                this.initialValue = t[n];
                this.domElement = document.createElement("div");
                this.object = t;
                this.property = n;
                this.__onChange = undefined;
                this.__onFinishChange = undefined;
            }
            P(e, [{
                key: "onChange",
                value: function(e) {
                    this.__onChange = e;
                    return this;
                }
            }, {
                key: "onFinishChange",
                value: function(e) {
                    this.__onFinishChange = e;
                    return this;
                }
            }, {
                key: "setValue",
                value: function(e) {
                    this.object[this.property] = e;
                    if (this.__onChange) {
                        this.__onChange.call(this, e);
                    }
                    this.updateDisplay();
                    return this;
                }
            }, {
                key: "getValue",
                value: function() {
                    return this.object[this.property];
                }
            }, {
                key: "updateDisplay",
                value: function() {
                    return this;
                }
            }, {
                key: "isModified",
                value: function() {
                    return this.initialValue !== this.getValue();
                }
            }]);
            return e;
        }();
        var M = {
            HTMLEvents: ["change"],
            MouseEvents: ["click", "mousemove", "mousedown", "mouseup", "mouseover"],
            KeyboardEvents: ["keydown"]
        };
        var G = {};
        S.each(M, function(e, t) {
            S.each(e, function(e) {
                G[e] = t;
            });
        });
        var U = /(\d+(\.\d+)?)px/;
        var X = {
            makeSelectable: function(e, t) {
                if (e !== undefined && e.style !== undefined) {
                    e.onselectstart = t ? function() {
                        return false;
                    }
                    : function() {}
                    ;
                    e.style.MozUserSelect = t ? "auto" : "none";
                    e.style.KhtmlUserSelect = t ? "auto" : "none";
                    e.unselectable = t ? "on" : "off";
                }
            },
            makeFullscreen: function(e, t, n) {
                var o = n;
                var i = t;
                if (S.isUndefined(i)) {
                    i = true;
                }
                if (S.isUndefined(o)) {
                    o = true;
                }
                e.style.position = "absolute";
                if (i) {
                    e.style.left = 0;
                    e.style.right = 0;
                }
                if (o) {
                    e.style.top = 0;
                    e.style.bottom = 0;
                }
            },
            fakeEvent: function(e, t, n, o) {
                var i = n || {};
                var r = G[t];
                if (!r) {
                    throw new Error("Event type " + t + " not supported.");
                }
                var s = document.createEvent(r);
                switch (r) {
                case "MouseEvents":
                    var a = i.x || i.clientX || 0;
                    var l = i.y || i.clientY || 0;
                    s.initMouseEvent(t, i.bubbles || false, i.cancelable || true, window, i.clickCount || 1, 0, 0, a, l, false, false, false, false, 0, null);
                    break;
                case "KeyboardEvents":
                    var d = s.initKeyboardEvent || s.initKeyEvent;
                    S.defaults(i, {
                        cancelable: true,
                        ctrlKey: false,
                        altKey: false,
                        shiftKey: false,
                        metaKey: false,
                        keyCode: undefined,
                        charCode: undefined
                    });
                    d(t, i.bubbles || false, i.cancelable, window, i.ctrlKey, i.altKey, i.shiftKey, i.metaKey, i.keyCode, i.charCode);
                    break;
                default:
                    s.initEvent(t, i.bubbles || false, i.cancelable || true);
                }
                S.defaults(s, o);
                e.dispatchEvent(s);
            },
            bind: function(e, t, n, o) {
                var i = o || false;
                if (e.addEventListener) {
                    e.addEventListener(t, n, i);
                } else if (e.attachEvent) {
                    e.attachEvent("on" + t, n);
                }
                return X;
            },
            unbind: function(e, t, n, o) {
                var i = o || false;
                if (e.removeEventListener) {
                    e.removeEventListener(t, n, i);
                } else if (e.detachEvent) {
                    e.detachEvent("on" + t, n);
                }
                return X;
            },
            addClass: function(e, t) {
                if (e.className === undefined) {
                    e.className = t;
                } else if (e.className !== t) {
                    var n = e.className.split(/ +/);
                    if (n.indexOf(t) === -1) {
                        n.push(t);
                        e.className = n.join(" ").replace(/^\s+/, "").replace(/\s+$/, "");
                    }
                }
                return X;
            },
            removeClass: function(e, t) {
                if (t) {
                    if (e.className === t) {
                        e.removeAttribute("class");
                    } else {
                        var n = e.className.split(/ +/);
                        var o = n.indexOf(t);
                        if (o !== -1) {
                            n.splice(o, 1);
                            e.className = n.join(" ");
                        }
                    }
                } else {
                    e.className = undefined;
                }
                return X;
            },
            hasClass: function(e, t) {
                return new RegExp("(?:^|\\s+)" + t + "(?:\\s+|$)").test(e.className) || false;
            },
            getWidth: function(e) {
                var t = getComputedStyle(e);
                return i(t["border-left-width"]) + i(t["border-right-width"]) + i(t["padding-left"]) + i(t["padding-right"]) + i(t.width);
            },
            getHeight: function(e) {
                var t = getComputedStyle(e);
                return i(t["border-top-width"]) + i(t["border-bottom-width"]) + i(t["padding-top"]) + i(t["padding-bottom"]) + i(t.height);
            },
            getOffset: function(e) {
                var t = e;
                var n = {
                    left: 0,
                    top: 0
                };
                if (t.offsetParent) {
                    do {
                        n.left += t.offsetLeft;
                        n.top += t.offsetTop;
                        t = t.offsetParent;
                    } while (t);
                }
                return n;
            },
            isActive: function(e) {
                return e === document.activeElement && (e.type || e.href);
            }
        };
        var K = function(e) {
            function t(e, n) {
                F(this, t);
                var o = V(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, e, n));
                var i = o;
                o.__prev = o.getValue();
                o.__checkbox = document.createElement("input");
                o.__checkbox.setAttribute("type", "checkbox");
                X.bind(o.__checkbox, "change", function() {
                    i.setValue(!i.__prev);
                }, false);
                o.domElement.appendChild(o.__checkbox);
                o.updateDisplay();
                return o;
            }
            j(t, z);
            P(t, [{
                key: "setValue",
                value: function(e) {
                    var n = D(t.prototype.__proto__ || Object.getPrototypeOf(t.prototype), "setValue", this).call(this, e);
                    if (this.__onFinishChange) {
                        this.__onFinishChange.call(this, this.getValue());
                    }
                    this.__prev = this.getValue();
                    return n;
                }
            }, {
                key: "updateDisplay",
                value: function() {
                    if (this.getValue() === true) {
                        this.__checkbox.setAttribute("checked", "checked");
                        this.__checkbox.checked = true;
                        this.__prev = true;
                    } else {
                        this.__checkbox.checked = false;
                        this.__prev = false;
                    }
                    return D(t.prototype.__proto__ || Object.getPrototypeOf(t.prototype), "updateDisplay", this).call(this);
                }
            }]);
            return t;
        }();
        var Y = function(e) {
            function t(e, n, o) {
                F(this, t);
                var i = V(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, e, n));
                var r = o;
                var s = i;
                i.__select = document.createElement("select");
                if (S.isArray(r)) {
                    var a = {};
                    S.each(r, function(e) {
                        a[e] = e;
                    });
                    r = a;
                }
                S.each(r, function(e, t) {
                    var n = document.createElement("option");
                    n.innerHTML = t;
                    n.setAttribute("value", e);
                    s.__select.appendChild(n);
                });
                i.updateDisplay();
                X.bind(i.__select, "change", function() {
                    var e = this.options[this.selectedIndex].value;
                    s.setValue(e);
                });
                i.domElement.appendChild(i.__select);
                return i;
            }
            j(t, z);
            P(t, [{
                key: "setValue",
                value: function(e) {
                    var n = D(t.prototype.__proto__ || Object.getPrototypeOf(t.prototype), "setValue", this).call(this, e);
                    if (this.__onFinishChange) {
                        this.__onFinishChange.call(this, this.getValue());
                    }
                    return n;
                }
            }, {
                key: "updateDisplay",
                value: function() {
                    if (X.isActive(this.__select)) {
                        return this;
                    } else {
                        this.__select.value = this.getValue();
                        return D(t.prototype.__proto__ || Object.getPrototypeOf(t.prototype), "updateDisplay", this).call(this);
                    }
                }
            }]);
            return t;
        }();
        var J = function(e) {
            function t(e, n) {
                function o() {
                    r.setValue(r.__input.value);
                }
                F(this, t);
                var i = V(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, e, n));
                var r = i;
                i.__input = document.createElement("input");
                i.__input.setAttribute("type", "text");
                X.bind(i.__input, "keyup", o);
                X.bind(i.__input, "change", o);
                X.bind(i.__input, "blur", function() {
                    if (r.__onFinishChange) {
                        r.__onFinishChange.call(r, r.getValue());
                    }
                });
                X.bind(i.__input, "keydown", function(e) {
                    if (e.keyCode === 13) {
                        this.blur();
                    }
                });
                i.updateDisplay();
                i.domElement.appendChild(i.__input);
                return i;
            }
            j(t, z);
            P(t, [{
                key: "updateDisplay",
                value: function() {
                    if (!X.isActive(this.__input)) {
                        this.__input.value = this.getValue();
                    }
                    return D(t.prototype.__proto__ || Object.getPrototypeOf(t.prototype), "updateDisplay", this).call(this);
                }
            }]);
            return t;
        }();
        var W = function(e) {
            function t(e, n, o) {
                F(this, t);
                var i = V(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, e, n));
                var s = o || {};
                i.__min = s.min;
                i.__max = s.max;
                i.__step = s.step;
                if (S.isUndefined(i.__step)) {
                    if (i.initialValue === 0) {
                        i.__impliedStep = 1;
                    } else {
                        i.__impliedStep = Math.pow(10, Math.floor(Math.log(Math.abs(i.initialValue)) / Math.LN10)) / 10;
                    }
                } else {
                    i.__impliedStep = i.__step;
                }
                i.__precision = r(i.__impliedStep);
                return i;
            }
            j(t, z);
            P(t, [{
                key: "setValue",
                value: function(e) {
                    var n = e;
                    if (this.__min !== undefined && n < this.__min) {
                        n = this.__min;
                    } else if (this.__max !== undefined && n > this.__max) {
                        n = this.__max;
                    }
                    if (this.__step !== undefined && n % this.__step != 0) {
                        n = Math.round(n / this.__step) * this.__step;
                    }
                    return D(t.prototype.__proto__ || Object.getPrototypeOf(t.prototype), "setValue", this).call(this, n);
                }
            }, {
                key: "min",
                value: function(e) {
                    this.__min = e;
                    return this;
                }
            }, {
                key: "max",
                value: function(e) {
                    this.__max = e;
                    return this;
                }
            }, {
                key: "step",
                value: function(e) {
                    this.__step = e;
                    this.__impliedStep = e;
                    this.__precision = r(e);
                    return this;
                }
            }]);
            return t;
        }();
        var Q = function(e) {
            function t(e, n, o) {
                function i() {
                    if (l.__onFinishChange) {
                        l.__onFinishChange.call(l, l.getValue());
                    }
                }
                function r(e) {
                    var t = d - e.clientY;
                    l.setValue(l.getValue() + t * l.__impliedStep);
                    d = e.clientY;
                }
                function s() {
                    X.unbind(window, "mousemove", r);
                    X.unbind(window, "mouseup", s);
                    i();
                }
                F(this, t);
                var a = V(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, e, n, o));
                a.__truncationSuspended = false;
                var l = a;
                var d = undefined;
                a.__input = document.createElement("input");
                a.__input.setAttribute("type", "text");
                X.bind(a.__input, "change", function() {
                    var e = parseFloat(l.__input.value);
                    if (!S.isNaN(e)) {
                        l.setValue(e);
                    }
                });
                X.bind(a.__input, "blur", function() {
                    i();
                });
                X.bind(a.__input, "mousedown", function(e) {
                    X.bind(window, "mousemove", r);
                    X.bind(window, "mouseup", s);
                    d = e.clientY;
                });
                X.bind(a.__input, "keydown", function(e) {
                    if (e.keyCode === 13) {
                        l.__truncationSuspended = true;
                        this.blur();
                        l.__truncationSuspended = false;
                        i();
                    }
                });
                a.updateDisplay();
                a.domElement.appendChild(a.__input);
                return a;
            }
            j(t, W);
            P(t, [{
                key: "updateDisplay",
                value: function() {
                    this.__input.value = this.__truncationSuspended ? this.getValue() : s(this.getValue(), this.__precision);
                    return D(t.prototype.__proto__ || Object.getPrototypeOf(t.prototype), "updateDisplay", this).call(this);
                }
            }]);
            return t;
        }();
        var q = function(e) {
            function t(e, n, o, i, r) {
                function s(e) {
                    e.preventDefault();
                    var t = _.__background.getBoundingClientRect();
                    _.setValue(a(e.clientX, t.left, t.right, _.__min, _.__max));
                    return false;
                }
                function l() {
                    X.unbind(window, "mousemove", s);
                    X.unbind(window, "mouseup", l);
                    if (_.__onFinishChange) {
                        _.__onFinishChange.call(_, _.getValue());
                    }
                }
                function d(e) {
                    var t = e.touches[0].clientX;
                    var n = _.__background.getBoundingClientRect();
                    _.setValue(a(t, n.left, n.right, _.__min, _.__max));
                }
                function c() {
                    X.unbind(window, "touchmove", d);
                    X.unbind(window, "touchend", c);
                    if (_.__onFinishChange) {
                        _.__onFinishChange.call(_, _.getValue());
                    }
                }
                F(this, t);
                var u = V(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, e, n, {
                    min: o,
                    max: i,
                    step: r
                }));
                var _ = u;
                u.__background = document.createElement("div");
                u.__foreground = document.createElement("div");
                X.bind(u.__background, "mousedown", function(e) {
                    document.activeElement.blur();
                    X.bind(window, "mousemove", s);
                    X.bind(window, "mouseup", l);
                    s(e);
                });
                X.bind(u.__background, "touchstart", function(e) {
                    if (e.touches.length === 1) {
                        X.bind(window, "touchmove", d);
                        X.bind(window, "touchend", c);
                        d(e);
                    }
                });
                X.addClass(u.__background, "slider");
                X.addClass(u.__foreground, "slider-fg");
                u.updateDisplay();
                u.__background.appendChild(u.__foreground);
                u.domElement.appendChild(u.__background);
                return u;
            }
            j(t, W);
            P(t, [{
                key: "updateDisplay",
                value: function() {
                    var e = (this.getValue() - this.__min) / (this.__max - this.__min);
                    this.__foreground.style.width = e * 100 + "%";
                    return D(t.prototype.__proto__ || Object.getPrototypeOf(t.prototype), "updateDisplay", this).call(this);
                }
            }]);
            return t;
        }();
        var Z = function(e) {
            function t(e, n, o) {
                F(this, t);
                var i = V(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, e, n));
                var r = i;
                i.__button = document.createElement("div");
                i.__button.innerHTML = o === undefined ? "Fire" : o;
                X.bind(i.__button, "click", function(e) {
                    e.preventDefault();
                    r.fire();
                    return false;
                });
                X.addClass(i.__button, "button");
                i.domElement.appendChild(i.__button);
                return i;
            }
            j(t, z);
            P(t, [{
                key: "fire",
                value: function() {
                    if (this.__onChange) {
                        this.__onChange.call(this);
                    }
                    this.getValue().call(this.object);
                    if (this.__onFinishChange) {
                        this.__onFinishChange.call(this, this.getValue());
                    }
                }
            }]);
            return t;
        }();
        var $ = function(e) {
            function t(e, n) {
                function o(e) {
                    u(e);
                    X.bind(window, "mousemove", u);
                    X.bind(window, "touchmove", u);
                    X.bind(window, "mouseup", r);
                    X.bind(window, "touchend", r);
                }
                function i(e) {
                    _(e);
                    X.bind(window, "mousemove", _);
                    X.bind(window, "touchmove", _);
                    X.bind(window, "mouseup", s);
                    X.bind(window, "touchend", s);
                }
                function r() {
                    X.unbind(window, "mousemove", u);
                    X.unbind(window, "touchmove", u);
                    X.unbind(window, "mouseup", r);
                    X.unbind(window, "touchend", r);
                    c();
                }
                function s() {
                    X.unbind(window, "mousemove", _);
                    X.unbind(window, "touchmove", _);
                    X.unbind(window, "mouseup", s);
                    X.unbind(window, "touchend", s);
                    c();
                }
                function a() {
                    var e = R(this.value);
                    if (e !== false) {
                        p.__color.__state = e;
                        p.setValue(p.__color.toOriginal());
                    } else {
                        this.value = p.__color.toString();
                    }
                }
                function c() {
                    if (p.__onFinishChange) {
                        p.__onFinishChange.call(p, p.__color.toOriginal());
                    }
                }
                function u(e) {
                    if (e.type.indexOf("touch") === -1) {
                        e.preventDefault();
                    }
                    var t = p.__saturation_field.getBoundingClientRect();
                    var n = e.touches && e.touches[0] || e;
                    var o = n.clientX;
                    var i = n.clientY;
                    var r = (o - t.left) / (t.right - t.left);
                    var s = 1 - (i - t.top) / (t.bottom - t.top);
                    if (s > 1) {
                        s = 1;
                    } else if (s < 0) {
                        s = 0;
                    }
                    if (r > 1) {
                        r = 1;
                    } else if (r < 0) {
                        r = 0;
                    }
                    p.__color.v = s;
                    p.__color.s = r;
                    p.setValue(p.__color.toOriginal());
                    return false;
                }
                function _(e) {
                    if (e.type.indexOf("touch") === -1) {
                        e.preventDefault();
                    }
                    var t = p.__hue_field.getBoundingClientRect();
                    var n = 1 - ((e.touches && e.touches[0] || e).clientY - t.top) / (t.bottom - t.top);
                    if (n > 1) {
                        n = 1;
                    } else if (n < 0) {
                        n = 0;
                    }
                    p.__color.h = n * 360;
                    p.setValue(p.__color.toOriginal());
                    return false;
                }
                F(this, t);
                var h = V(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, e, n));
                h.__color = new I(h.getValue());
                h.__temp = new I(0);
                var p = h;
                h.domElement = document.createElement("div");
                X.makeSelectable(h.domElement, false);
                h.__selector = document.createElement("div");
                h.__selector.className = "selector";
                h.__saturation_field = document.createElement("div");
                h.__saturation_field.className = "saturation-field";
                h.__field_knob = document.createElement("div");
                h.__field_knob.className = "field-knob";
                h.__field_knob_border = "2px solid ";
                h.__hue_knob = document.createElement("div");
                h.__hue_knob.className = "hue-knob";
                h.__hue_field = document.createElement("div");
                h.__hue_field.className = "hue-field";
                h.__input = document.createElement("input");
                h.__input.type = "text";
                h.__input_textShadow = "0 1px 1px ";
                X.bind(h.__input, "keydown", function(e) {
                    if (e.keyCode === 13) {
                        a.call(this);
                    }
                });
                X.bind(h.__input, "blur", a);
                X.bind(h.__selector, "mousedown", function() {
                    X.addClass(this, "drag").bind(window, "mouseup", function() {
                        X.removeClass(p.__selector, "drag");
                    });
                });
                X.bind(h.__selector, "touchstart", function() {
                    X.addClass(this, "drag").bind(window, "touchend", function() {
                        X.removeClass(p.__selector, "drag");
                    });
                });
                var f = document.createElement("div");
                S.extend(h.__selector.style, {
                    width: "122px",
                    height: "102px",
                    padding: "3px",
                    backgroundColor: "#222",
                    boxShadow: "0px 1px 3px rgba(0,0,0,0.3)"
                });
                S.extend(h.__field_knob.style, {
                    position: "absolute",
                    width: "12px",
                    height: "12px",
                    border: h.__field_knob_border + (h.__color.v < 0.5 ? "#fff" : "#000"),
                    boxShadow: "0px 1px 3px rgba(0,0,0,0.5)",
                    borderRadius: "12px",
                    zIndex: 1
                });
                S.extend(h.__hue_knob.style, {
                    position: "absolute",
                    width: "15px",
                    height: "2px",
                    borderRight: "4px solid #fff",
                    zIndex: 1
                });
                S.extend(h.__saturation_field.style, {
                    width: "100px",
                    height: "100px",
                    border: "1px solid #555",
                    marginRight: "3px",
                    display: "inline-block",
                    cursor: "pointer"
                });
                S.extend(f.style, {
                    width: "100%",
                    height: "100%",
                    background: "none"
                });
                l(f, "top", "rgba(0,0,0,0)", "#000");
                S.extend(h.__hue_field.style, {
                    width: "15px",
                    height: "100px",
                    border: "1px solid #555",
                    cursor: "ns-resize",
                    position: "absolute",
                    top: "3px",
                    right: "3px"
                });
                d(h.__hue_field);
                S.extend(h.__input.style, {
                    outline: "none",
                    textAlign: "center",
                    color: "#fff",
                    border: 0,
                    fontWeight: "bold",
                    textShadow: h.__input_textShadow + "rgba(0,0,0,0.7)"
                });
                X.bind(h.__saturation_field, "mousedown", o);
                X.bind(h.__saturation_field, "touchstart", o);
                X.bind(h.__field_knob, "mousedown", o);
                X.bind(h.__field_knob, "touchstart", o);
                X.bind(h.__hue_field, "mousedown", i);
                X.bind(h.__hue_field, "touchstart", i);
                h.__saturation_field.appendChild(f);
                h.__selector.appendChild(h.__field_knob);
                h.__selector.appendChild(h.__saturation_field);
                h.__selector.appendChild(h.__hue_field);
                h.__hue_field.appendChild(h.__hue_knob);
                h.domElement.appendChild(h.__input);
                h.domElement.appendChild(h.__selector);
                h.updateDisplay();
                return h;
            }
            j(t, z);
            P(t, [{
                key: "updateDisplay",
                value: function() {
                    var e = R(this.getValue());
                    if (e !== false) {
                        var t = false;
                        S.each(I.COMPONENTS, function(n) {
                            if (!S.isUndefined(e[n]) && !S.isUndefined(this.__color.__state[n]) && e[n] !== this.__color.__state[n]) {
                                t = true;
                                return {};
                            }
                        }, this);
                        if (t) {
                            S.extend(this.__color.__state, e);
                        }
                    }
                    S.extend(this.__temp.__state, this.__color.__state);
                    this.__temp.a = 1;
                    var n = this.__color.v < 0.5 || this.__color.s > 0.5 ? 255 : 0;
                    var o = 255 - n;
                    S.extend(this.__field_knob.style, {
                        marginLeft: this.__color.s * 100 - 7 + "px",
                        marginTop: (1 - this.__color.v) * 100 - 7 + "px",
                        backgroundColor: this.__temp.toHexString(),
                        border: this.__field_knob_border + "rgb(" + n + "," + n + "," + n + ")"
                    });
                    this.__hue_knob.style.marginTop = (1 - this.__color.h / 360) * 100 + "px";
                    this.__temp.s = 1;
                    this.__temp.v = 1;
                    l(this.__saturation_field, "left", "#fff", this.__temp.toHexString());
                    this.__input.value = this.__color.toString();
                    S.extend(this.__input.style, {
                        backgroundColor: this.__color.toHexString(),
                        color: "rgb(" + n + "," + n + "," + n + ")",
                        textShadow: this.__input_textShadow + "rgba(" + o + "," + o + "," + o + ",.7)"
                    });
                }
            }]);
            return t;
        }();
        var ee = ["-moz-", "-o-", "-webkit-", "-ms-", ""];
        var te = {
            load: function(e, t) {
                var n = t || document;
                var o = n.createElement("link");
                o.type = "text/css";
                o.rel = "stylesheet";
                o.href = e;
                n.getElementsByTagName("head")[0].appendChild(o);
            },
            inject: function(e, t) {
                var n = t || document;
                var o = document.createElement("style");
                o.type = "text/css";
                o.innerHTML = e;
                var i = n.getElementsByTagName("head")[0];
                try {
                    i.appendChild(o);
                } catch (e) {}
            }
        };
        function ne(e, t) {
            var n = e[t];
            if (S.isArray(arguments[2]) || S.isObject(arguments[2])) {
                return new Y(e,t,arguments[2]);
            } else if (S.isNumber(n)) {
                if (S.isNumber(arguments[2]) && S.isNumber(arguments[3])) {
                    if (S.isNumber(arguments[4])) {
                        return new q(e,t,arguments[2],arguments[3],arguments[4]);
                    } else {
                        return new q(e,t,arguments[2],arguments[3]);
                    }
                } else if (S.isNumber(arguments[4])) {
                    return new Q(e,t,{
                        min: arguments[2],
                        max: arguments[3],
                        step: arguments[4]
                    });
                } else {
                    return new Q(e,t,{
                        min: arguments[2],
                        max: arguments[3]
                    });
                }
            } else if (S.isString(n)) {
                return new J(e,t);
            } else if (S.isFunction(n)) {
                return new Z(e,t,"");
            } else if (S.isBoolean(n)) {
                return new K(e,t);
            } else {
                return null;
            }
        }
        var oe = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(e) {
            setTimeout(e, 1000 / 60);
        }
        ;
        var ie = function() {
            function e() {
                F(this, e);
                this.backgroundElement = document.createElement("div");
                S.extend(this.backgroundElement.style, {
                    backgroundColor: "rgba(0,0,0,0.8)",
                    top: 0,
                    left: 0,
                    display: "none",
                    zIndex: "1000",
                    opacity: 0,
                    WebkitTransition: "opacity 0.2s linear",
                    transition: "opacity 0.2s linear"
                });
                X.makeFullscreen(this.backgroundElement);
                this.backgroundElement.style.position = "fixed";
                this.domElement = document.createElement("div");
                S.extend(this.domElement.style, {
                    position: "fixed",
                    display: "none",
                    zIndex: "1001",
                    opacity: 0,
                    WebkitTransition: "-webkit-transform 0.2s ease-out, opacity 0.2s linear",
                    transition: "transform 0.2s ease-out, opacity 0.2s linear"
                });
                document.body.appendChild(this.backgroundElement);
                document.body.appendChild(this.domElement);
                var t = this;
                X.bind(this.backgroundElement, "click", function() {
                    t.hide();
                });
            }
            P(e, [{
                key: "show",
                value: function() {
                    var e = this;
                    this.backgroundElement.style.display = "block";
                    this.domElement.style.display = "block";
                    this.domElement.style.opacity = 0;
                    this.domElement.style.webkitTransform = "scale(1.1)";
                    this.layout();
                    S.defer(function() {
                        e.backgroundElement.style.opacity = 1;
                        e.domElement.style.opacity = 1;
                        e.domElement.style.webkitTransform = "scale(1)";
                    });
                }
            }, {
                key: "hide",
                value: function() {
                    var e = this;
                    var t = function t() {
                        e.domElement.style.display = "none";
                        e.backgroundElement.style.display = "none";
                        X.unbind(e.domElement, "webkitTransitionEnd", t);
                        X.unbind(e.domElement, "transitionend", t);
                        X.unbind(e.domElement, "oTransitionEnd", t);
                    };
                    X.bind(this.domElement, "webkitTransitionEnd", t);
                    X.bind(this.domElement, "transitionend", t);
                    X.bind(this.domElement, "oTransitionEnd", t);
                    this.backgroundElement.style.opacity = 0;
                    this.domElement.style.opacity = 0;
                    this.domElement.style.webkitTransform = "scale(1.1)";
                }
            }, {
                key: "layout",
                value: function() {
                    this.domElement.style.left = window.innerWidth / 2 - X.getWidth(this.domElement) / 2 + "px";
                    this.domElement.style.top = window.innerHeight / 2 - X.getHeight(this.domElement) / 2 + "px";
                }
            }]);
            return e;
        }();
        var re = function(e) {
            if (e && typeof window != "undefined") {
                var t = document.createElement("style");
                t.setAttribute("type", "text/css");
                t.innerHTML = e;
                document.head.appendChild(t);
                return e;
            }
        }(".dg ul{list-style:none;margin:0;padding:0;width:100%;clear:both}.dg.ac{position:fixed;top:0;left:0;right:0;height:0;z-index:99999}.dg:not(.ac) .main{overflow:hidden}.dg.main{-webkit-transition:opacity .2s ease;-o-transition:opacity .2s ease;-moz-transition:opacity .2s ease;transition:opacity .2s ease;position:fixed;top:0;right:0;background:linear-gradient(180deg,rgba(16,14,10,.98) 0%,rgba(20,18,14,.97) 100%);width:320px;max-height:92vh;overflow-y:auto;padding:0;border-radius:0 0 0 12px;color:#a9c7e8;font-family:'Segoe UI',Arial,sans-serif;font-size:12px;box-shadow:0 4px 30px rgba(0,0,0,.8),0 0 1px rgba(55,155,255,.15),inset 0 1px 0 rgba(55,120,210,.06);z-index:99999;border:1px solid rgba(35,95,170,.15);border-top:none;border-right:none;scrollbar-width:thin;scrollbar-color:rgba(45,110,190,.2) transparent}.dg.main.taller-than-window{overflow-y:auto}.dg.main.taller-than-window .close-button{opacity:1;margin-top:-1px;border-top:1px solid rgba(30,80,150,.15)}.dg.main ul.closed .close-button{opacity:1 !important}.dg.main:hover .close-button,.dg.main .close-button.drag{opacity:1}.dg.main .close-button{-webkit-transition:all .15s ease;transition:all .15s ease;border:0;line-height:18px;height:18px;cursor:pointer;text-align:center;background-color:rgba(18,17,15,.95);color:#a09060}.dg.main .close-button{display:none}.dg.main .close-button.close-top{display:none}.dg.main .close-button.close-bottom{display:none}.dg.main .close-button:hover{background-color:rgba(12,28,50,.95);color:#4da3ff}.dg.main::-webkit-scrollbar{width:5px}.dg.main::-webkit-scrollbar-track{background:transparent}.dg.main::-webkit-scrollbar-thumb{border-radius:5px;background:rgba(45,110,190,.2)}.dg.main::-webkit-scrollbar-thumb:hover{background:rgba(55,120,210,.35)}.dg.a{float:right;margin-right:0;overflow-y:visible}.dg.a.has-save>ul.close-top{margin-top:0}.dg.a.has-save>ul.close-bottom{margin-top:27px}.dg.a.has-save>ul.closed{margin-top:0}.dg.a .save-row{top:0;z-index:1002}.dg.a .save-row.close-top{position:relative}.dg.a .save-row.close-bottom{position:fixed}.dg li{-webkit-transition:height .12s ease-out;transition:height .12s ease-out}.dg li:not(.folder){cursor:auto;height:28px;line-height:28px;padding:0 8px 0 8px;background:rgba(22,21,18,.88);border-bottom:1px solid rgba(25,70,135,.08)}.dg li.folder{padding:0;border-left:none;border-bottom:0}.dg li.title{cursor:pointer;margin-left:0;padding:0 0 0 14px;height:30px;line-height:30px;background-color:rgba(9,20,36,.95);background-image:url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==);background-repeat:no-repeat;background-position:6px 12px;color:#4da3ff;font-weight:600;font-size:11.5px;letter-spacing:.4px;border-bottom:1px solid rgba(30,80,150,.12);border-left:3px solid rgba(45,140,235,.35);transition:all .18s ease}.dg li.title:hover{background-color:rgba(14,32,56,.98);color:#7fc3ff;border-left-color:rgba(55,155,255,.7);padding-left:18px}.dg .folder .folder li.title{color:#6fb8ff}.dg .folder .folder li.title:hover{color:#9bd4ff}.dg .closed li:not(.title),.dg .closed ul li,.dg .closed ul li>*{height:0;overflow:hidden;border:0}.dg .closed li.title{background-image:url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==)}.dg .cr{clear:both;padding-left:8px;height:28px;line-height:28px;overflow:hidden;background-color:rgba(22,21,18,.82);color:#8aa7c7;border-bottom:1px solid rgba(25,70,135,.06);transition:background .15s ease,padding .15s ease}.dg .cr:hover{background-color:rgba(13,30,52,.88);padding-left:10px}.dg .property-name{cursor:default;float:left;clear:left;width:40%;overflow:hidden;text-overflow:ellipsis;color:#7f9dbf;font-size:11px;transition:color .15s}.dg .cr:hover .property-name{color:#c8b870}.dg .cr.function .property-name{width:100%;color:#8fc8ff;font-weight:600}.dg .cr.function:hover .property-name{color:#b5dcff}.dg .c{float:left;width:60%;position:relative}.dg .c input[type=text]{background:rgba(8,19,35,.95);color:#9bbce0;border:1px solid rgba(30,80,150,.18);border-radius:3px;outline:none;margin-top:4px;padding:2px 5px;width:100%;float:right;caret-color:#4da3ff;transition:all .15s ease}.dg .c input[type=text]:hover{background:rgba(30,28,18,.95);border-color:rgba(35,95,170,.3)}.dg .c input[type=text]:focus{background:rgba(10,24,44,1);color:#cfe7ff;border-color:rgba(180,150,50,.45);outline:none;box-shadow:0 0 0 1px rgba(55,155,255,.1)}.dg .c input[type=text]::selection{background:rgba(140,120,40,.3);color:#c3dcf5}.dg .has-slider input[type=text]{width:30%;margin-left:0}.dg .slider{float:left;width:66%;margin-left:-5px;margin-right:0;height:18px;margin-top:5px;background:rgba(10,24,44,.5);border-radius:3px;cursor:ew-resize;transition:background .15s}.dg .slider-fg{height:100%;background:linear-gradient(90deg,#163a66,#2f78bd);max-width:100%;border-radius:3px;transition:background .15s;box-shadow:0 0 4px rgba(55,155,255,.15)}.dg .slider:hover{background:rgba(35,32,22,.6)}.dg .slider:hover .slider-fg{background:linear-gradient(90deg,#3f91dc,#6bb7ff);box-shadow:0 0 8px rgba(55,155,255,.25)}.dg .c input[type=checkbox]{margin-top:6px;accent-color:#a08a35;width:16px;height:16px;cursor:pointer;outline:1px solid rgba(45,110,190,.3);border-radius:3px;-webkit-appearance:checkbox;appearance:checkbox}.dg .c select{background-color:rgba(8,19,35,.95);color:#9bbce0;border:1px solid rgba(30,80,150,.18);border-radius:3px;margin-top:5px;padding:1px 3px}.dg .cr.boolean{border-left:3px solid rgba(40,105,185,.4)}.dg .cr.color{border-left:3px solid;overflow:visible}.dg .cr.function{border-left:3px solid rgba(45,130,220,.4)}.dg .cr.number{border-left:3px solid rgba(45,140,235,.4)}.dg .cr.number input[type=text]{color:#4da3ff}.dg .cr.string{border-left:3px solid rgba(70,100,130,.4)}.dg .cr.string input[type=text]{color:#8aa8c8}.dg .cr.function,.dg .cr.function .property-name,.dg .cr.function *,.dg .cr.boolean,.dg .cr.boolean *{cursor:pointer}.dg .cr.function:hover,.dg .cr.boolean:hover{background:rgba(13,30,52,.88)}.dg .selector{display:none;position:absolute;margin-left:-9px;margin-top:23px;z-index:10;background:rgba(5,12,24,.98);border:1px solid rgba(35,95,170,.25);border-radius:4px;padding:2px;box-shadow:0 4px 12px rgba(0,0,0,.5)}.dg .c:hover .selector,.dg .selector.drag{display:block}.dg li.save-row{padding:0;line-height:23px;background:rgba(10,24,44,.9)}.dg li.save-row .button{display:inline-block;padding:0px 6px;margin-left:5px;margin-top:1px;border-radius:3px;font-size:9px;line-height:7px;padding:4px 6px 5px 6px;background:rgba(35,95,170,.25);color:#94b2d0;text-shadow:none;cursor:pointer;transition:all .15s}.dg li.save-row .button.gears{background:rgba(35,95,170,.25) url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;height:7px;width:8px}.dg li.save-row .button:hover{background-color:rgba(45,120,200,.35);color:#a8c4df}.dg li.save-row select{margin-left:5px;width:108px}.dg li.folder{border-bottom:0}.dg li.menu-header{height:auto;text-align:center;background:linear-gradient(180deg,rgba(7,15,28,.98) 0%,rgba(5,12,24,.95) 100%);border-bottom:1px solid rgba(35,95,170,.15);cursor:pointer;padding:0;margin:0;overflow:hidden;transition:all .25s ease;user-select:none;position:relative}.dg li.menu-header .hdr-deco{position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(55,155,255,.3) 20%,rgba(55,155,255,.5) 50%,rgba(55,155,255,.3) 80%,transparent)}.dg li.menu-header .hdr-icon{display:inline-block;vertical-align:middle;width:22px;height:22px;margin-right:6px;opacity:.7;transition:all .25s}.dg li.menu-header .hdr-title{display:block;padding:12px 10px 2px;font-size:15px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;background:linear-gradient(90deg,#8a7525,#4da3ff 30%,#f5e27a 50%,#4da3ff 70%,#8a7525);background-size:200% 100%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:dbs-menu-shimmer 3s linear infinite;line-height:1.2}.dg li.menu-header .hdr-sub{display:block;padding:0 10px 10px;font-size:9px;letter-spacing:4px;color:rgba(55,155,255,.25);text-transform:uppercase;line-height:1}@keyframes dbs-menu-shimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}.dg li.menu-header:hover{background:linear-gradient(180deg,rgba(28,25,18,.98) 0%,rgba(8,19,35,.95) 100%)}.dg li.menu-header:hover .hdr-title{filter:brightness(1.2)}.dg li.menu-header:hover .hdr-icon{opacity:1;transform:rotate(15deg)}.dg li.menu-header:hover .hdr-deco{background:linear-gradient(90deg,transparent,rgba(55,155,255,.5) 20%,rgba(55,155,255,.8) 50%,rgba(55,155,255,.5) 80%,transparent)}.dg li.menu-header.glow .hdr-title{filter:brightness(1.5)}.dg li.menu-header.glow .hdr-deco{background:linear-gradient(90deg,transparent,rgba(80,180,255,.6) 20%,rgba(80,180,255,1) 50%,rgba(80,180,255,.6) 80%,transparent);box-shadow:0 0 10px rgba(80,180,255,.3)}.dg li.menu-header .hdr-sep{display:block;height:1px;margin:0 15px;background:linear-gradient(90deg,transparent,rgba(55,155,255,.12),transparent)}.dg.dialogue{background-color:#07101f;width:460px;padding:15px;font-size:13px;line-height:15px}#dg-new-constructor{padding:10px;color:#a8c4df;font-family:Monaco,monospace;font-size:10px;border:1px solid rgba(30,80,150,.2);resize:none;box-shadow:inset 1px 1px 1px rgba(0,0,0,.5);word-wrap:break-word;margin:12px 0;display:block;width:440px;overflow-y:scroll;height:100px;position:relative;background:rgba(4,10,20,.9)}#dg-local-explain{display:none;font-size:11px;line-height:17px;border-radius:3px;background-color:rgba(30,28,18,.9);padding:8px;margin-top:10px;color:#c8b880}#dg-local-explain code{font-size:10px}#dat-gui-save-locally{display:none}.dg{color:#9cb6d1;text-shadow:none;font:11.5px 'Segoe UI','Lucida Grande',sans-serif;-webkit-user-select:none;-moz-user-select:none;user-select:none}.dg .c input[type=text],.dg .c select{-webkit-user-select:text;-moz-user-select:text;user-select:text}\n");
        te.inject(re);
        (function() {
            var s = document.createElement("style");
            s.setAttribute("type", "text/css");
            s.innerHTML = ".dg .cr.has-slider .c{display:flex!important;align-items:center;float:none!important;gap:0}.dg .cr.has-slider .c>div:first-child{flex:0 0 auto;width:auto;min-width:0}.dg .cr.has-slider .c>div:first-child input[type=text]{width:50px!important;float:none!important;margin:0!important;padding:2px 4px;text-align:right;box-sizing:border-box}.dg .cr.has-slider .slider{float:none!important;flex:1 1 0%;width:auto!important;min-width:0;margin-left:4px!important;margin-right:0!important;margin-top:0!important;height:16px;display:block!important;position:relative;overflow:hidden}.dg .cr.has-slider .slider-fg{height:100%!important;display:block!important;position:absolute;top:0;left:0;min-width:0}";
            document.head.appendChild(s);
        }
        )();
        var se = "Default";
        var ae = function() {
            try {
                return !!window.localStorage;
            } catch (e) {
                return false;
            }
        }();
        var le = undefined;
        var de = true;
        var ce = undefined;
        var ue = false;
        var _e = [];
        var he = function e(t) {
            var n = this;
            var o = t || {};
            this.domElement = document.createElement("div");
            this.__ul = document.createElement("ul");
            this.domElement.appendChild(this.__ul);
            X.addClass(this.domElement, "dg");
            this.__folders = {};
            this.__controllers = [];
            this.__rememberedObjects = [];
            this.__rememberedObjectIndecesToControllers = [];
            this.__listening = [];
            o = S.defaults(o, {
                closeOnTop: false,
                autoPlace: true,
                width: e.DEFAULT_WIDTH
            });
            o = S.defaults(o, {
                resizable: o.autoPlace,
                hideable: o.autoPlace
            });
            if (S.isUndefined(o.load)) {
                o.load = {
                    preset: se
                };
            } else if (o.preset) {
                o.load.preset = o.preset;
            }
            if (S.isUndefined(o.parent) && o.hideable) {
                _e.push(this);
            }
            o.resizable = false;
            if (o.autoPlace && S.isUndefined(o.scrollable)) {
                o.scrollable = true;
            }
            var i = ae && localStorage.getItem(m(this, "isLocal")) === "true";
            var r = undefined;
            var s = undefined;
            Object.defineProperties(this, {
                parent: {
                    get: function() {
                        return o.parent;
                    }
                },
                scrollable: {
                    get: function() {
                        return o.scrollable;
                    }
                },
                autoPlace: {
                    get: function() {
                        return o.autoPlace;
                    }
                },
                closeOnTop: {
                    get: function() {
                        return o.closeOnTop;
                    }
                },
                preset: {
                    get: function() {
                        if (n.parent) {
                            return n.getRoot().preset;
                        } else {
                            return o.load.preset;
                        }
                    },
                    set: function(e) {
                        if (n.parent) {
                            n.getRoot().preset = e;
                        } else {
                            o.load.preset = e;
                        }
                        E(this);
                        n.revert();
                    }
                },
                width: {
                    get: function() {
                        return o.width;
                    },
                    set: function(e) {
                        o.width = e;
                        w(n, e);
                    }
                },
                name: {
                    get: function() {
                        return o.name;
                    },
                    set: function(e) {
                        o.name = e;
                        if (s) {
                            s.innerHTML = o.name;
                        }
                    }
                },
                closed: {
                    get: function() {
                        return o.closed;
                    },
                    set: function(t) {
                        o.closed = t;
                        if (o.closed) {
                            X.addClass(n.__ul, e.CLASS_CLOSED);
                        } else {
                            X.removeClass(n.__ul, e.CLASS_CLOSED);
                        }
                        this.onResize();
                        if (n.__closeButton) {
                            n.__closeButton.innerHTML = t ? e.TEXT_OPEN : e.TEXT_CLOSED;
                        }
                    }
                },
                load: {
                    get: function() {
                        return o.load;
                    }
                },
                useLocalStorage: {
                    get: function() {
                        return i;
                    },
                    set: function(e) {
                        if (ae) {
                            i = e;
                            if (e) {
                                X.bind(window, "unload", r);
                            } else {
                                X.unbind(window, "unload", r);
                            }
                            localStorage.setItem(m(n, "isLocal"), e);
                        }
                    }
                }
            });
            if (S.isUndefined(o.parent)) {
                this.closed = o.closed || false;
                X.addClass(this.domElement, e.CLASS_MAIN);
                X.makeSelectable(this.domElement, false);
                var _hdr = document.createElement("li");
                _hdr.className = "menu-header";
                _hdr.innerHTML = '<div class="hdr-deco"></div><span class="hdr-title"><img class="hdr-icon" src="https://github.com/babayev-045-code/my-cheat-io/blob/main/my%20logo.png?raw=true" alt="" style="width:26px;height:26px;object-fit:contain;vertical-align:middle;margin-right:6px;margin-top:-3px"> ABRIC </span><span class="hdr-sub"></span>';
                _hdr.onclick = function() {
                    _hdr.classList.add("glow");
                    setTimeout(function() {
                        _hdr.classList.remove("glow");
                    }, 800);
                }
                ;
                this.__ul.appendChild(_hdr);
                if (ae && i) {
                    n.useLocalStorage = true;
                    var a = localStorage.getItem(m(this, "gui"));
                    if (a) {
                        o.load = JSON.parse(a);
                    }
                }
                this.__closeButton = document.createElement("div");
                this.__closeButton.innerHTML = e.TEXT_CLOSED;
                X.addClass(this.__closeButton, e.CLASS_CLOSE_BUTTON);
                if (o.closeOnTop) {
                    X.addClass(this.__closeButton, e.CLASS_CLOSE_TOP);
                    this.domElement.insertBefore(this.__closeButton, this.domElement.childNodes[0]);
                } else {
                    X.addClass(this.__closeButton, e.CLASS_CLOSE_BOTTOM);
                    this.domElement.appendChild(this.__closeButton);
                }
                X.bind(this.__closeButton, "click", function() {
                    n.closed = !n.closed;
                });
            } else {
                if (o.closed === undefined) {
                    o.closed = true;
                }
                var l = document.createTextNode(o.name);
                X.addClass(l, "controller-name");
                s = c(n, l);
                X.addClass(this.__ul, e.CLASS_CLOSED);
                X.addClass(s, "title");
                X.bind(s, "click", function(e) {
                    e.preventDefault();
                    n.closed = !n.closed;
                    if (!n.closed && o.parent) {
                        S.each(o.parent.__folders, function(siblingFolder) {
                            if (siblingFolder !== n) {
                                siblingFolder.closed = true;
                            }
                        });
                    }
                    return false;
                });
                if (!o.closed) {
                    this.closed = false;
                }
            }
            if (o.autoPlace) {
                if (S.isUndefined(o.parent)) {
                    if (de) {
                        ce = document.createElement("div");
                        X.addClass(ce, "dg");
                        X.addClass(ce, e.CLASS_AUTO_PLACE_CONTAINER);
                        document.body.appendChild(ce);
                        de = false;
                    }
                    ce.appendChild(this.domElement);
                    X.addClass(this.domElement, e.CLASS_AUTO_PLACE);
                }
                if (!this.parent) {
                    w(n, o.width);
                }
            }
            this.__resizeHandler = function() {
                n.onResizeDebounced();
            }
            ;
            X.bind(window, "resize", this.__resizeHandler);
            X.bind(this.__ul, "webkitTransitionEnd", this.__resizeHandler);
            X.bind(this.__ul, "transitionend", this.__resizeHandler);
            X.bind(this.__ul, "oTransitionEnd", this.__resizeHandler);
            this.onResize();
            if (o.resizable) {
                y(this);
            }
            r = function() {
                if (ae && localStorage.getItem(m(n, "isLocal")) === "true") {
                    localStorage.setItem(m(n, "gui"), JSON.stringify(n.getSaveObject()));
                }
            }
            ;
            this.saveToLocalStorageIfPossible = r;
            if (!o.parent) {
                (function() {
                    var e = n.getRoot();
                    e.width += 1;
                    S.defer(function() {
                        e.width -= 1;
                    });
                }
                )();
            }
        };
        he.toggleHide = function() {
            ue = !ue;
            S.each(_e, function(e) {
                e.domElement.style.display = ue ? "none" : "";
            });
        }
        ;
        he.CLASS_AUTO_PLACE = "a";
        he.CLASS_AUTO_PLACE_CONTAINER = "ac";
        he.CLASS_MAIN = "main";
        he.CLASS_CONTROLLER_ROW = "cr";
        he.CLASS_TOO_TALL = "taller-than-window";
        he.CLASS_CLOSED = "closed";
        he.CLASS_CLOSE_BUTTON = "close-button";
        he.CLASS_CLOSE_TOP = "close-top";
        he.CLASS_CLOSE_BOTTOM = "close-bottom";
        he.CLASS_DRAG = "drag";
        he.DEFAULT_WIDTH = 320;
        he.TEXT_CLOSED = "Close Controls";
        he.TEXT_OPEN = "Open Controls";
        he._keydownHandler = function(e) {
            // Disabled: BabaEngine uses the single fixed KeyH menu handler below.
        }
        ;
        X.bind(window, "keydown", he._keydownHandler, false);
        S.extend(he.prototype, {
            add: function(e, t) {
                return f(this, e, t, {
                    factoryArgs: Array.prototype.slice.call(arguments, 2)
                });
            },
            addColor: function(e, t) {
                return f(this, e, t, {
                    color: true
                });
            },
            remove: function(e) {
                this.__ul.removeChild(e.__li);
                this.__controllers.splice(this.__controllers.indexOf(e), 1);
                var t = this;
                S.defer(function() {
                    t.onResize();
                });
            },
            destroy: function() {
                if (this.parent) {
                    throw new Error("Only the root GUI should be removed with .destroy(). For subfolders, use gui.removeFolder(folder) instead.");
                }
                if (this.autoPlace) {
                    ce.removeChild(this.domElement);
                }
                var e = this;
                S.each(this.__folders, function(t) {
                    e.removeFolder(t);
                });
                X.unbind(window, "keydown", he._keydownHandler, false);
                u(this);
            },
            addFolder: function(e) {
                if (this.__folders[e] !== undefined) {
                    throw new Error("You already have a folder in this GUI by the name \"" + e + "\"");
                }
                var t = {
                    name: e,
                    parent: this
                };
                t.autoPlace = this.autoPlace;
                if (this.load && this.load.folders && this.load.folders[e]) {
                    t.closed = this.load.folders[e].closed;
                    t.load = this.load.folders[e];
                }
                var n = new he(t);
                this.__folders[e] = n;
                var o = c(this, n.domElement);
                X.addClass(o, "folder");
                return n;
            },
            removeFolder: function(e) {
                this.__ul.removeChild(e.domElement.parentElement);
                delete this.__folders[e.name];
                if (this.load && this.load.folders && this.load.folders[e.name]) {
                    delete this.load.folders[e.name];
                }
                u(e);
                var t = this;
                S.each(e.__folders, function(t) {
                    e.removeFolder(t);
                });
                S.defer(function() {
                    t.onResize();
                });
            },
            open: function() {
                this.closed = false;
            },
            close: function() {
                this.closed = true;
            },
            hide: function() {
                this.domElement.style.display = "none";
            },
            show: function() {
                this.domElement.style.display = "";
            },
            onResize: function() {
                var e = this.getRoot();
                if (e.scrollable) {
                    var t = X.getOffset(e.__ul).top;
                    var n = 0;
                    S.each(e.__ul.childNodes, function(t) {
                        if (!e.autoPlace || t !== e.__save_row) {
                            n += X.getHeight(t);
                        }
                    });
                    if (window.innerHeight - t - 20 < n) {
                        X.addClass(e.domElement, he.CLASS_TOO_TALL);
                        e.__ul.style.height = window.innerHeight - t - 20 + "px";
                    } else {
                        X.removeClass(e.domElement, he.CLASS_TOO_TALL);
                        e.__ul.style.height = "auto";
                    }
                }
                if (e.__resize_handle) {
                    S.defer(function() {
                        e.__resize_handle.style.height = e.__ul.offsetHeight + "px";
                    });
                }
                if (e.__closeButton) {
                    e.__closeButton.style.width = e.width + "px";
                }
            },
            onResizeDebounced: S.debounce(function() {
                this.onResize();
            }, 50),
            remember: function() {
                if (S.isUndefined(le)) {
                    (le = new ie()).domElement.innerHTML = "<div id=\"dg-save\" class=\"dg dialogue\">\n\n  Here's the new load parameter for your <code>GUI</code>'s constructor:\n\n  <textarea id=\"dg-new-constructor\"></textarea>\n\n  <div id=\"dg-save-locally\">\n\n    <input id=\"dg-local-storage\" type=\"checkbox\"/> Automatically save\n    values to <code>localStorage</code> on exit.\n\n    <div id=\"dg-local-explain\">The values saved to <code>localStorage</code> will\n      override those passed to <code>dat.GUI</code>'s constructor. This makes it\n      easier to work incrementally, but <code>localStorage</code> is fragile,\n      and your friends may not see the same values you do.\n\n    </div>\n\n  </div>\n\n</div>";
                }
                if (this.parent) {
                    throw new Error("You can only call remember on a top level GUI.");
                }
                var e = this;
                S.each(Array.prototype.slice.call(arguments), function(t) {
                    if (e.__rememberedObjects.length === 0) {
                        v(e);
                    }
                    if (e.__rememberedObjects.indexOf(t) === -1) {
                        e.__rememberedObjects.push(t);
                    }
                });
                if (this.autoPlace) {
                    w(this, this.width);
                }
            },
            getRoot: function() {
                for (var e = this; e.parent; ) {
                    e = e.parent;
                }
                return e;
            },
            getSaveObject: function() {
                var e = this.load;
                e.closed = this.closed;
                if (this.__rememberedObjects.length > 0) {
                    e.preset = this.preset;
                    e.remembered ||= {};
                    e.remembered[this.preset] = x(this);
                }
                e.folders = {};
                S.each(this.__folders, function(t, n) {
                    e.folders[n] = t.getSaveObject();
                });
                return e;
            },
            save: function() {
                this.load.remembered ||= {};
                this.load.remembered[this.preset] = x(this);
                _(this, false);
                this.saveToLocalStorageIfPossible();
            },
            saveAs: function(e) {
                if (!this.load.remembered) {
                    this.load.remembered = {};
                    this.load.remembered[se] = x(this, true);
                }
                this.load.remembered[e] = x(this);
                this.preset = e;
                g(this, e, true);
                this.saveToLocalStorageIfPossible();
            },
            revert: function(e) {
                S.each(this.__controllers, function(t) {
                    if (this.getRoot().load.remembered) {
                        p(e || this.getRoot(), t);
                    } else {
                        t.setValue(t.initialValue);
                    }
                    if (t.__onFinishChange) {
                        t.__onFinishChange.call(t, t.getValue());
                    }
                }, this);
                S.each(this.__folders, function(e) {
                    e.revert(e);
                });
                if (!e) {
                    _(this.getRoot(), false);
                }
            },
            listen: function(e) {
                var t = this.__listening.length === 0;
                this.__listening.push(e);
                if (t) {
                    C(this.__listening);
                }
            },
            updateDisplay: function() {
                S.each(this.__controllers, function(e) {
                    e.updateDisplay();
                });
                S.each(this.__folders, function(e) {
                    e.updateDisplay();
                });
            }
        });
        var pe = {
            Color: I,
            math: N,
            interpret: R
        };
        var fe = {
            Controller: z,
            BooleanController: K,
            OptionController: Y,
            StringController: J,
            NumberController: W,
            NumberControllerBox: Q,
            NumberControllerSlider: q,
            FunctionController: Z,
            ColorController: $
        };
        var me = {
            dom: X
        };
        var ge = {
            GUI: he
        };
        var be = he;
        var ve = {
            color: pe,
            controllers: fe,
            dom: me,
            gui: ge,
            GUI: be
        };
        e.color = pe;
        e.controllers = fe;
        e.dom = me;
        e.gui = ge;
        e.GUI = be;
        e.default = ve;
        Object.defineProperty(e, "__esModule", {
            value: true
        });
    });
    /* =================== dat.GUI end =================== */
    /* ===================== AIMBOT (ported) ===================== */
    function calculateDistance(point1, point2) {
        return Math.floor(Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2)));
    }
    class GetAllTargetsCon {
        constructor() {
            this.players = [];
            this.ghouls = [];
            for (let player = 1; player < 121; player++) {
                this.players[player] = new GetTarget(player);
            }
            for (let ghoul = 1; ghoul < 999; ghoul++) {
                this.ghouls[ghoul] = new GetTarget(ghoul);
            }
            this.obstacles = [];
            this.lines = [];
            this.lines.push(new LinesCon(0.6, 1, "#FFF200"));
            this.lines.push(new LinesCon(0.8, 3, "#FF0000"));
            this.lines.push(new LinesCon(0.8, 3, "#00FF00"));
            this.lines.push(new LinesCon(0.8, 2, "#0000FF"));
            this.mousePosition = { x: 0, y: 0 };
            this.mouseMapCords = { x: 0, y: 0 };
            this.shifting = false;
            this.menuActive = false;
            this.menuX = 0;
            this.menuY = 0;
            this.menuWidth = 0;
            this.menuHeight = 0;
            this.lastId = 0;
            this.myLastMoveDirection = 0;
        }
        getPlayerById(pID) {
            return this.players[pID];
        }
        getGhoulByUid(uID) {
            return this.ghouls[uID];
        }
    }
    class GetTarget {
        constructor(ids) {
            this.id = ids;
            this.x = -1;
            this.y = -1;
            this.prevX = [];
            this.prevY = [];
            this.active = false;
            this.weapon = -1;
            this.gear = -1;
            for (let lastpos = 0; lastpos < 3; lastpos++) {
                this.prevX.push(-1);
                this.prevY.push(-1);
            }
        }
        update(ux, uy, xy) {
            if (this.x !== ux || this.y !== uy) {
                this.active = true;
                this.prevX[2] = this.prevX[1];
                this.prevX[1] = this.prevX[0];
                this.prevX[0] = this.x;
                this.x = ux;
                this.prevY[2] = this.prevY[1];
                this.prevY[1] = this.prevY[0];
                this.prevY[0] = this.y;
                this.y = uy;
                this.weapon = xy;
                AimbotRefresh();
            }
        }
        setInactive() {
            this.x = -1;
            this.y = -1;
            for (let lastposs = 0; lastposs < 3; lastposs++) {
                this.prevX[lastposs] = -1;
                this.prevY[lastposs] = -1;
            }
            this.active = false;
            this.weapon = -1;
            AimbotRefresh();
        }
    }
    class AimbotCon {
        constructor() {
            this.lastAngle = 0;
            this.targetPlayer = null;
        }
        resolve() {
            switch (BabaConfig.resolverType) {
                case 1:
                    var myPlayerResolverType1 = GetAllTargets.getPlayerById(World.PLAYER[օ̖̏]);
                    var targetResolverType1 = this.findNearestPlayerTo(myPlayerResolverType1, 2500);
                    this.targetPlayer = targetResolverType1;
                    if (targetResolverType1 == null) {
                        return this.lastAngle;
                    }
                    var targetXResolverType1;
                    var targetYResolverType1;
                    if (targetResolverType1.prevX[0] == -1) {
                        targetXResolverType1 = targetResolverType1.x;
                        targetYResolverType1 = targetResolverType1.y;
                    } else {
                        var distancee = calculateDistance(myPlayerResolverType1, targetResolverType1) / BabaConfig.distanceCoefficient;
                        targetXResolverType1 = targetResolverType1.x + distancee * (targetResolverType1.x - targetResolverType1.prevX[0]);
                        targetYResolverType1 = targetResolverType1.y + distancee * (targetResolverType1.y - targetResolverType1.prevY[0]);
                    }
                    var angleResolverType1 = window.Math.floor(window.Math.atan((targetYResolverType1 - myPlayerResolverType1.y) / (targetXResolverType1 - myPlayerResolverType1.x)) * 180 / window.Math.PI);
                    if (targetXResolverType1 < myPlayerResolverType1.x) {
                        angleResolverType1 += 180;
                    }
                    if (BabaConfig.hideAimbotAngle) {
                        if (angleResolverType1 === null) {
                            angleResolverType1 = angleResolverType1 * 180 / window.Math.PI;
                        }
                        ո︀̜.ε٣︀(window.JSON.stringify([6, angleResolverType1]));
                    }
                    this.lastAngle = angleResolverType1;
                    return angleResolverType1;
                case "linear":
                default:
                    var myPlayerResolverLinear = GetAllTargets.getPlayerById(World.PLAYER[օ̖̏]);
                    var targetLinear;
                    if (BabaConfig.lockId > -1) {
                        targetLinear = GetAllTargets.getPlayerById(BabaConfig.lockId);
                        if (!this.isPlayerCandidate(targetLinear)) targetLinear = null;
                    } else if (BabaConfig.mouseFovEnable) {
                        targetLinear = this.findNearestPlayerTo(GetAllTargets.mouseMapCords, BabaConfig.mouseFov);
                    } else {
                        targetLinear = this.findNearestPlayerTo(myPlayerResolverLinear, 2500);
                    }
                    this.targetPlayer = targetLinear;
                    if (targetLinear === null) {
                        return this.lastAngle;
                    }
                    let targetXResolverLinear;
                    let targetYResolverLinear;
                    if (targetLinear.prevX[0] === -1) {
                        targetXResolverLinear = targetLinear.x;
                        targetYResolverLinear = targetLinear.y;
                    } else {
                        var distance = calculateDistance(myPlayerResolverLinear, targetLinear) / BabaConfig.distanceCoefficient + BabaConfig.offsetCoefficient;
                        targetXResolverLinear = targetLinear.x + distance * (targetLinear.x - targetLinear.prevX[0]);
                        targetYResolverLinear = targetLinear.y + distance * (targetLinear.y - targetLinear.prevY[0]);
                    }
                    var angleResolverLinear = window.Math.floor(window.Math.atan((targetYResolverLinear - myPlayerResolverLinear.y) / (targetXResolverLinear - myPlayerResolverLinear.x)) * 180 / window.Math.PI);
                    if (targetXResolverLinear < myPlayerResolverLinear.x) {
                        angleResolverLinear += 180;
                    }
                    if (BabaConfig.hideAimbotAngle) {
                        if (angleResolverLinear === null) {
                            angleResolverLinear = angleResolverLinear * 180 / window.Math.PI;
                        }
                        ո︀̜.ε٣︀(window.JSON.stringify([6, angleResolverLinear]));
                    }
                    this.lastAngle = angleResolverLinear;
                    if (BabaConfig.visualizeResolving) {
                        GetAllTargets.lines[0].color = BabaConfig.visualizeResolvingColor || "#FFF200";
                        GetAllTargets.lines[0].reset(myPlayerResolverLinear.x, myPlayerResolverLinear.y, targetXResolverLinear, targetYResolverLinear);
                    }
                    return angleResolverLinear;
            }
        }
        isPlayerCandidate(player) {
            try {
                if (!player || !player.active || player.id === World.PLAYER[օ̖̏]) return false;
                if (!isFinite(+player.x) || !isFinite(+player.y) || +player.x < 0 || +player.y < 0) return false;
                if (!World.players || !World.players[player.id]) return false;
                var ps = World.players[player.id];
                if (!(ps.εᴎ༩ !== World.PLAYER.εᴎ༩ || World.PLAYER.εᴎ༩ === -1)) return false;
                return true;
            } catch (e) { return false; }
        }
        findNearestPlayerTo(cords, Fov) {
            let fov = Fov;
            let selected = null;
            if (!cords || !isFinite(+cords.x) || !isFinite(+cords.y)) return null;
            if (BabaConfig.target === "players" || BabaConfig.target === "all") {
                for (let id = 1; id < GetAllTargets.players.length; id++) {
                    const player = GetAllTargets.getPlayerById(id);
                    if (this.isPlayerCandidate(player)) {
                        let distance = calculateDistance(cords, player);
                        if (isFinite(distance) && distance < fov) {
                            selected = player;
                            fov = distance;
                        }
                    }
                }
            }
            if (BabaConfig.target === "ghouls" || BabaConfig.target === "all") {
                for (let uid = 1; uid < GetAllTargets.ghouls.length; uid++) {
                    const ghoul = GetAllTargets.getGhoulByUid(uid);
                    if (ghoul.active) {
                        let distance = calculateDistance(cords, ghoul);
                        if (distance < fov) {
                            selected = ghoul;
                            fov = distance;
                        }
                    }
                }
            }
            return selected;
        }
    }
    class LinesCon {
        constructor(alpha, width, color) {
            this.x1 = -10;
            this.x2 = -10;
            this.y1 = -10;
            this.y2 = -10;
            this.alpha = alpha;
            this.width = width;
            this.color = color;
        }
        reset(x1, y1, x2, y2) {
            this.x1 = x1;
            this.x2 = x2;
            this.y1 = y1;
            this.y2 = y2;
        }
    }
    function AimbotRefresh() {
        GetAllTargets.lines.forEach(line => line.reset(-1, -1, -1, -1));
        if (World.PLAYER[օ̖̏] === 0 || World.PLAYER[x] === -1 || World.PLAYER[y] === -1) {
            if (GetAllTargets.lastId !== 0) {
                GetAllTargets.lastId = 0;
                for (let allplayers = 1; allplayers < 121; allplayers++) {
                    GetAllTargets.getPlayerById(allplayers).setInactive();
                }
                for (let allghouls = 1; allghouls < 999; allghouls++) {
                    GetAllTargets.getGhoulByUid(allghouls).setInactive();
                }
            }
            return;
        }
        GetAllTargets.lastId = World.PLAYER[օ̖̏];
        if (BabaConfig.AimBotEnabled) {
            // While jitter is enabled, the dedicated jitter loop owns angle packets.
            // This prevents normal target refreshes from instantly overwriting the side-to-side angle.
            if (BabaConfig.jitterActive) {
                Aimbot.resolve();
                return;
            }
            var __babaAimAngle = Aimbot.resolve();
            // Do not force the previous angle after the real target disappeared.
            if (Aimbot.targetPlayer !== null && isFinite(+__babaAimAngle)) {
                ո︀̜.ε٣︀(window.JSON.stringify([6, __babaAimAngle]));
            }
        }
    }
    class JitterCon {
        constructor() {
            this.roflAngle = 0;
            this.roflStep = 1;
            this.jitterStep = false;
        }
        getJitterAngle() {
            this.jitterStep = !this.jitterStep;
            if (this.jitterStep) {
                return this.getAntiAimAngle() + BabaConfig.jitterOffset;
            } else {
                return this.getAntiAimAngle() - BabaConfig.jitterOffset;
            }
        }
        getAntiAimAngle() {
            if (BabaConfig.antiAimMode == "At target") {
                return Aimbot.resolve() + 180;
            }
            Aimbot.resolve();
            if (BabaConfig.antiAimMode == "Round") {
                this.roflStep++;
                return this.roflAngle += 4 + Math.floor(Math.abs(this.roflStep % 600 - 300) / 12);
            }
            if (BabaConfig.antiAimMode == "Round2") {
                this.roflStep++;
                return Math.floor(this.roflStep % 20 * 18);
            }
            return BabaConfig.antiAimMode;
        }
    }
    var GetAllTargets = new GetAllTargetsCon();
    var Aimbot = new AimbotCon();
    var Jitter = new JitterCon();

    // Jitter must actively send angle packets; merely toggling jitterActive changes no rotation.
    // Use the same CODE36 angle packet as the aimbot and alternate around the anti-aim base angle.
    var __jitterLastX = NaN, __jitterLastY = NaN, __jitterLastMoveAt = Date.now();
    function routineJitter() {
        try {
            if (!BabaConfig.jitterActive || !World || !World.PLAYER) return;
            if (typeof ո︀̜ === "undefined" || typeof ո︀̜.ε٣︀ !== "function") return;

            var px = +World.PLAYER[x], py = +World.PLAYER[y];
            if (isFinite(px) && isFinite(py)) {
                if (px !== __jitterLastX || py !== __jitterLastY) {
                    __jitterLastX = px;
                    __jitterLastY = py;
                    __jitterLastMoveAt = Date.now();
                }
                if (BabaConfig.stopJittersOnStop && Date.now() - __jitterLastMoveAt > 180) return;
            }

            var angle = Jitter.getJitterAngle();
            if (!isFinite(+angle)) return;
            angle = ((+angle % 360) + 360) % 360;
            ո︀̜.ε٣︀(window.JSON.stringify([6, angle]));
        } catch (e) {}
    }
    setInterval(routineJitter, 100);
    window.BabaConfig = BabaConfig;
    window.Aimbot = Aimbot;
    window.GetAllTargets = GetAllTargets;
    window.AimbotRefresh = AimbotRefresh;
    window.addEventListener("mousemove", function(event) {
        GetAllTargets.mousePosition.x = event.clientX;
        GetAllTargets.mousePosition.y = event.clientY;
    });
    // All controllers and keybinds persist through the same BabaConfig store.
    function hookUnifiedSave(gui) {
        gui.__controllers.forEach(function(controller) {
            var previous = controller.__onFinishChange;
            controller.onFinishChange(function(value) {
                if (previous)
                    previous.call(controller, value);
                saveBabaConfig();
            });
        });
        for (var name in gui.__folders) {
            hookUnifiedSave(gui.__folders[name]);
        }
    }
    var TokenChanger = {
        genToken: function() {
            var token = "";
            for (var i = 0; i < 20; i++) {
                token += String.fromCharCode(48 + Math.floor(Math.random() * 74));
            }
            return token;
        },
        extract: function(text) {
            var values = String(text || "").match(/"([^"]*)"/g);
            if (values && values.length === 3) {
                return {
                    token: values[0].slice(1, -1),
                    tokenId: values[1].slice(1, -1),
                    userId: values[2].slice(1, -1)
                };
            }
            return null;
        },
        relog: function() {
            try {
                if (typeof window.ClientCloseSocket === "function") {
                    window.ClientCloseSocket();
                }
            } catch (e) {}
            location.reload();
        },
        copy: function() {
            var token = localStorage.getItem("token");
            var tokenId = localStorage.getItem("tokenId");
            var userId = localStorage.getItem("userId");
            var message = '"' + token + '" "' + tokenId + '" "' + userId + '"';
            try {
                navigator.clipboard.writeText(message);
            } catch (e) {}
            console.log(message);
        },
        change: function(input) {
            var values = TokenChanger.extract(BabaConfig.token);
            if (!values) {
                alert("Failed to read token");
                return;
            }
            localStorage.setItem("token", values.token);
            localStorage.setItem("tokenId", values.tokenId);
            localStorage.setItem("userId", values.userId);
            BabaConfig.token = "";
            if (input)
                input.updateDisplay();
            TokenChanger.relog();
        },
        reset: function() {
            if (!window.confirm("Are you sure want to reset your token?"))
                return;
            localStorage.setItem("token", TokenChanger.genToken());
            TokenChanger.relog();
        }
    };
    window.TokenChanger = TokenChanger;

    function AimbotMenuInit() {
        if (window.AimbotMenu || !window.dat || !window.dat.GUI)
            return;

        const gui = new window.dat.GUI({ name: "BabaEngine" });
        window.AimbotMenu = gui;

        // GUI theme/layout ported from `for new gui.zip`.
        if (!document.getElementById("baba-for-new-gui-theme")) {
            const style = document.createElement("style");
            style.id = "baba-for-new-gui-theme";
            style.textContent = `
                .dg.main {
                    position: fixed !important;
                    top: 0 !important;
                    right: 18px !important;
                    background: rgba(5, 16, 30, 0.985) !important;
                    width: 300px !important;
                    padding: 10px !important;
                    border-radius: 8px !important;
                    color: #9bbbd3 !important;
                    font-family: Arial, sans-serif !important;
                    font-size: 20px !important;
                    box-shadow: 0 0 14px rgba(38, 91, 143, 0.42) !important;
                    border: 1px solid rgba(52, 110, 165, 0.88) !important;
                    box-sizing: border-box !important;
                    will-change: transform, opacity;
                }
                .dg.main .close-button { display: none !important; }
                .dg.main > ul { margin: 0 !important; padding: 0 !important; }
                .dg.main .title {
                    text-align: center !important;
                    color: #6f9fca !important;
                    border-bottom: 1px solid rgba(49, 105, 158, 0.72) !important;
                    padding: 4px 2px !important;
                    font-size: 16px !important;
                    font-weight: bold !important;
                    box-sizing: border-box !important;
                }
                .dg .folder > .dg > ul > li.title,
                .dg li.folder > .dg > ul > li.title,
                .dg li.folder > ul > li.title,
                .dg .folder .title {
                    background-color: rgba(10, 39, 69, 0.94) !important;
                    color: #91b4d1 !important;
                    padding: 3px 4px !important;
                    font-size: 14px !important;
                    font-weight: bold !important;
                    border-radius: 4px !important;
                    cursor: pointer !important;
                    margin-bottom: 2px !important;
                    transition: background .2s, color .2s, box-shadow .2s !important;
                }
                .dg .folder .title:hover {
                    background: rgba(29, 83, 132, 0.94) !important;
                    color: #fff !important;
                    box-shadow: 0 0 8px rgba(42, 99, 151, 0.56) !important;
                }
                .dg .folder .folder .title { background-color: rgba(13, 47, 80, 0.92) !important; }
                .dg .folder .folder .folder .title { background-color: rgba(18, 56, 94, 0.88) !important; }
                .dg .slider-fg { background: rgba(29, 83, 132, 0.94) !important; }
                .dg .slider:hover .slider-fg { background: rgba(67, 131, 185, 1) !important; }
                .dg .c input[type=text], .dg .c input[type=number] {
                    color: #a9c5da !important;
                    background-color: rgba(4, 21, 39, 0.97) !important;
                    border: 1px solid rgba(45, 100, 153, 0.80) !important;
                }
                .dg .cr {
                    background-color: rgba(7, 29, 51, 0.94) !important;
                    color: rgba(145, 181, 209, 0.97) !important;
                    transition: background .2s !important;
                }
                .dg .cr:hover { background-color: rgba(17, 59, 98, 0.92) !important; }
                .dg .cr.boolean { border-left-color: #3e82b9 !important; }
                .dg .cr.number { border-left-color: #347caf !important; }
                .dg .cr.string { border-left-color: #2d6d9b !important; }
                .dg .cr.color { border-left-color: #5796c2 !important; }
                .dg .cr.color input[type=text] {
                    background-color: var(--baba-selected-color, #041527) !important;
                    color: var(--baba-selected-text, #ffffff) !important;
                    font-weight: 700 !important;
                    text-shadow: 0 1px 2px rgba(0,0,0,.95), 0 0 2px rgba(0,0,0,.9) !important;
                }
                .dg .cr.color input[type=text]:focus {
                    background-color: var(--baba-selected-color, #041527) !important;
                    color: var(--baba-selected-text, #ffffff) !important;
                }
                .dg select {
                    color: #aac4d7 !important;
                    background: rgba(4,21,39,.98) !important;
                    border-color: rgba(43,97,148,.76) !important;
                }
                .dg .property-name { color: #83a9c7 !important; }
                .dg li.menu-header {
                    background: linear-gradient(180deg, rgba(7, 31, 55, .99) 0%, rgba(4, 20, 37, .99) 100%) !important;
                    border-bottom: 1px solid rgba(48, 104, 157, .72) !important;
                    box-shadow: inset 0 -1px 0 rgba(66, 126, 180, .09) !important;
                }
                .dg li.menu-header .hdr-title {
                    background: none !important;
                    -webkit-background-clip: initial !important;
                    background-clip: initial !important;
                    -webkit-text-fill-color: #83a9c7 !important;
                    color: #83a9c7 !important;
                    text-shadow: 0 0 8px rgba(43, 96, 148, .30) !important;
                }
                .dg li.menu-header .hdr-deco {
                    background: linear-gradient(90deg, transparent, rgba(52, 107, 161, .30) 20%, rgba(67, 128, 183, .72) 50%, rgba(52, 107, 161, .30) 80%, transparent) !important;
                }
                .dg li.menu-header:hover {
                    background: linear-gradient(180deg, rgba(10, 43, 74, .99) 0%, rgba(5, 25, 45, .99) 100%) !important;
                }
                .dg .slider { background: rgba(4, 23, 42, .95) !important; }
                .dg .c input[type=checkbox] {
                    accent-color: #3e83b9 !important;
                    outline-color: rgba(50, 107, 160, .44) !important;
                }
                .dg .c input[type=text]:focus, .dg .c input[type=number]:focus, .dg select:focus {
                    background: rgba(5, 26, 46, .99) !important;
                    border-color: #4b91c2 !important;
                    color: #cfdfeb !important;
                }
                .dg .cr.function .property-name { color: #7fa9c7 !important; }
                .dg .cr.number input[type=text] { color: #659ac0 !important; }
                .dg li.save-row { background: rgba(4, 23, 42, .97) !important; }
                .dg li.save-row .button {
                    background: rgba(25, 68, 106, .65) !important;
                    color: #a0bdd2 !important;
                }
                .dg li.save-row .button:hover {
                    background: rgba(41, 96, 145, .76) !important;
                    color: #ffffff !important;
                }
            `;
            document.head.appendChild(style);
        }

        gui.domElement.style.position = "fixed";
        gui.domElement.style.top = "0";
        gui.domElement.style.right = "18px";
        gui.domElement.style.zIndex = "1000000";

        function bindColorPreview(controller, key) {
            function normalizeHex(v) {
                var t = String(v == null ? "" : v).trim();
                if (/^#?[0-9a-fA-F]{3}$/.test(t)) {
                    t = t.replace("#", "");
                    t = t[0] + t[0] + t[1] + t[1] + t[2] + t[2];
                } else if (/^#?[0-9a-fA-F]{6}$/.test(t)) {
                    t = t.replace("#", "");
                } else return null;
                return "#" + t.toUpperCase();
            }
            function paint() {
                var hex = normalizeHex(BabaConfig[key]);
                if (!hex) return;
                BabaConfig[key] = hex;
                var row = controller.__li || controller.domElement;
                if (!row) return;
                var rgb = parseInt(hex.slice(1), 16);
                var r = rgb >> 16, g = (rgb >> 8) & 255, b = rgb & 255;
                var light = (r * 299 + g * 587 + b * 114) / 1000;
                row.style.setProperty("--baba-selected-color", hex);
                row.style.setProperty("--baba-selected-text", light > 165 ? "#000000" : "#FFFFFF");
                var input = row.querySelector && row.querySelector('input[type="text"]');
                if (input) input.value = hex;
            }
            controller.onChange(function(v) {
                var hex = normalizeHex(v);
                if (hex) BabaConfig[key] = hex;
                paint();
            });
            setTimeout(paint, 0);
            return controller;
        }

        // Top visual category. Classic dat.GUI look is intentionally preserved.
        let fVisuals = gui.addFolder("Visuals");
        let fColors = fVisuals.addFolder("Colors");
        bindColorPreview(fColors.addColor(BabaConfig, "TeamColor").name("Team"), "TeamColor");
        bindColorPreview(fColors.addColor(BabaConfig, "EnemyTeamColor").name("Enemy Team"), "EnemyTeamColor");

        let fShow = fVisuals.addFolder("Show");
        fShow.add(BabaConfig, "ShowBuildingOwner").name("Building Owner ID").listen();
        fShow.add(BabaConfig, "ShowNamesOnMap").name("Names On Map").listen();
        fShow.add(BabaConfig, "ShowPosition").name("Show Position").listen();
        fShow.add(BabaConfig, "ShowDayNightTime").name("Day/Night Time").listen();
        fShow.add(BabaConfig, "ShowAngels").name("Show Angels").listen();
        fShow.add(BabaConfig, "ESP").name("ESP").listen();
        fShow.add(BabaConfig, "Lines").name("Lines").listen();
        fShow.add(BabaConfig, "LinesOpacity", 1, 5, 1).name("Opacity").listen();
        fShow.add(BabaConfig, "ShowOverlay").name("Overlay").listen();
        fShow.add(BabaConfig, "ShowMines").name("Show Mines").listen();
        fShow.add(BabaConfig, "ShowSpikes").name("Show Spikes").listen();
        fShow.add(BabaConfig, "ShowWires").name("Show Wires").listen();
        makeAcc(fVisuals);

        let fAuto = gui.addFolder("Automation");
        fAuto.add(BabaConfig, "AutoBuildEnabled").name("AutoBuild").listen();
        fAuto.add(BabaConfig, "FAutoLootEnabled").name("FAutoLoot").listen();
        fAuto.add(BabaConfig, "AutoTakeEnabled").name("AutoTake").listen();
        fAuto.add(BabaConfig, "AutoAttackEnabled").name("AutoAttack").listen().onChange(function(v){ setAutoAttackState(!!v); });
        fAuto.add(BabaConfig, "AutoAddWoodCellsGasoline").name("Auto Fire Resources").listen();
        fAuto.add(BabaConfig, "AutoRun").name("AutoRun").listen().onChange(function (v) {
            applyAutoRun(!!v);
        });
        makeAcc(fAuto);

        const aimFolder = gui.addFolder("👑 Aim Bot 👑");
        aimFolder.add(BabaConfig, "AimBotEnabled").name("AimBotEnabled").listen();
        // No HideAngle keybind: GUI-only as requested.
        aimFolder.add(BabaConfig, "hideAimbotAngle").name("HideAimbotAngle").listen();
        aimFolder.add(BabaConfig, "ShowRealAngles", ["always", "withAim"]).name("ShowRealAngles");
        aimFolder.add(BabaConfig, "target", ["players", "ghouls", "all"]).name("Target");
        aimFolder.add(BabaConfig, "distanceCoefficient", 10, 1000, 10).name("DistanceCoefficient");
        aimFolder.add(BabaConfig, "offsetCoefficient", 0, 3, 0.1).name("OffsetCoefficient");
        aimFolder.add(BabaConfig, "bulletSpeedCoefficient", 1, 20, 1).name("BulletSpeedCoeff");
        aimFolder.add(BabaConfig, "resolverType", ["linear"]).name("ResolverType");
        aimFolder.add(BabaConfig, "TargetTeammate").name("Target Teammate");
        aimFolder.add(BabaConfig, "mouseFovEnable").name("MouseFovEnable");
        aimFolder.add(BabaConfig, "mouseFov", 0, 12345, 100).name("MouseFov");
        aimFolder.add(BabaConfig, "autoFire").name("AutoFire");
        aimFolder.add(BabaConfig, "lockId", -1, 120, 1).name("LockId");
        aimFolder.add(BabaConfig, "antiAimMode", ["At target", "Round", "Round2"]).name("AntiAimMode");
        aimFolder.add(BabaConfig, "jitterActive").name("JitterActive").listen();
        aimFolder.add(BabaConfig, "jitterOffset", 0, 360, 1).name("JitterOffset");
        aimFolder.add(BabaConfig, "stopJittersOnStop").name("StopJittersOnStop");
        aimFolder.add(BabaConfig, "visualizeResolving").name("Show Aim Line");
        bindColorPreview(aimFolder.addColor(BabaConfig, "visualizeResolvingColor").name("Aim Line Color"), "visualizeResolvingColor");
        makeAcc(aimFolder);

        let fAntiAim = gui.addFolder("Anti Aim");
        fAntiAim.add(BabaConfig, "AntiAimbot").name("Anti Aimbot").listen();
        fAntiAim.add(BabaConfig, "antiAimCoefficient", 1, 300, 1).name("Coefficient");
        fAntiAim.add(BabaConfig, "jitterActive").name("Jitter").listen();
        fAntiAim.add(BabaConfig, "jitterOffset", 0, 360, 1).name("Jitter Offset");
        fAntiAim.add(BabaConfig, "antiAimMode", ["At target", "Round", "Round2"]).name("Jitter Mode");
        makeAcc(fAntiAim);

        let fAK = gui.addFolder("Anti-Kick");
        fAK.add(BabaConfig, "AntiKickEnabled").name("Enable Anti-Kick").listen();
        makeAcc(fAK);

        let fSpam = gui.addFolder("SpamChat");
        fSpam.add(BabaConfig, "SpamChatEnabled").name("Spam Chat").listen().onChange(manageSpammer);
        fSpam.add(BabaConfig, "SpamChatText1").name("Text 1");
        fSpam.add(BabaConfig, "SpamChatText2").name("Text 2");
        fSpam.add(BabaConfig, "SpamChatText").name("Legacy Text");
        makeAcc(fSpam);

        let fPlay = gui.addFolder("Players");
        fPlay.add(BabaConfig, "PlayersListEnabled").name("Player List").listen();
        fPlay.add(BabaConfig, "PlayerId").name("Player ID");
        fPlay.add({ clk: function () { clbCopyID(BabaConfig.PlayerId); } }, "clk").name("Copy");
        fPlay.add({ clk: clbCopyAll }, "clk").name("Copy All");
        makeAcc(fPlay);


        let fRaider = gui.addFolder("Best Raider Things");
        fRaider.add(BabaConfig, "XRay").name("X-Ray").listen();
        fRaider.add(BabaConfig, "Xraytransparency", 0.05, 1, 0.05).name("X-Ray Alpha");
        fRaider.add(BabaConfig, "RightClickEnabled").name("Right Click").listen();
        makeAcc(fRaider);


        let fKeys = gui.addFolder("KeyBinds");
        // H remains fixed/reserved for the menu and is intentionally not re-bindable.
        guiAssignBind(fKeys, BabaConfig, "AutoBuildKey", "AutoBuild");
        guiAssignBind(fKeys, BabaConfig, "FAutoLootKey", "FAutoLoot");
        guiAssignBind(fKeys, BabaConfig, "AutoTakeKey", "AutoTake");
        guiAssignBind(fKeys, BabaConfig, "PlayersListKey", "Player List");
        guiAssignBind(fKeys, BabaConfig, "XRayKey", "X-Ray");
        guiAssignBind(fKeys, BabaConfig, "AimbotKey", "Aimbot");
        guiAssignBind(fKeys, BabaConfig, "JitterKey", "Jitter");
        guiAssignBind(fKeys, BabaConfig, "AutoAttackKey", "AutoAttack");
        guiAssignBind(fKeys, BabaConfig, "AntiAimbotKey", "AntiAimbot");
        makeAcc(fKeys);

        let fTok = gui.addFolder("Token Changer");
        fTok.add({
            ac: function () {
                let rawT = '"' + localStorage.getItem("token") + '" "' +
                    localStorage.getItem("tokenId") + '" "' +
                    localStorage.getItem("userId") + '"';
                if (navigator.clipboard) navigator.clipboard.writeText(rawT);
                alert("Copied!\n" + rawT);
            }
        }, "ac").name("Copy");
        fTok.add(BabaConfig, "token").name("Pasted Token");
        fTok.add({
            ac: function () {
                let tkObj = parseTk(BabaConfig.token);
                if (tkObj) {
                    localStorage.setItem("token", tkObj.tok);
                    localStorage.setItem("tokenId", tkObj.tId);
                    localStorage.setItem("userId", tkObj.uId);
                    alert("Token changed!");
                    location.reload();
                } else {
                    alert('Invalid format! Use: "token" "tokenId" "userId"');
                }
            }
        }, "ac").name("Change");
        fTok.add({
            ac: function () {
                if (confirm("Are you sure you want to reset the token?")) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("tokenId");
                    localStorage.removeItem("userId");
                    alert("Token reset!");
                    location.reload();
                }
            }
        }, "ac").name("Reset");
        makeAcc(fTok);

        let fCfg = gui.addFolder("CFG");
        fCfg.add({
            ac: function () {
                saveBabaConfig();
                alert("Config saved!");
            }
        }, "ac").name("Save Config");
        fCfg.add({
            ac: function () {
                if (confirm("Do you want to reset settings to default?")) {
                    try {
                        const defaults = {};
                        for (const key of Object.keys(BaseSettings)) {
                            defaults[key] = BaseSettings[key];
                            BabaConfig[key] = BaseSettings[key];
                        }
                        BabaConfig._lastLoot = 0;
                        localStorage.setItem("BestModMenuConfig", JSON.stringify(defaults));
                        stopAutoRun();
                        if (sys_spamTimer) { clearInterval(sys_spamTimer); sys_spamTimer = null; }
                        if (window.AimbotMenu && typeof window.AimbotMenu.updateDisplay === "function") {
                            window.AimbotMenu.updateDisplay();
                        }
                    } catch (e) {}
                    alert("Your config has been reseted.");
                }
            }
        }, "ac").name("Reset Config");
        makeAcc(fCfg);

        // Category behavior from the reference GUI: opening one top-level section closes the others.
        const __babaTopFolders = [fVisuals, fAuto, aimFolder, fAntiAim, fAK, fSpam, fPlay, fRaider, fKeys, fTok, fCfg];
        function __babaBindAccordion(folder, siblings) {
            try {
                const title = folder.domElement.querySelector("li.title") || folder.domElement.querySelector(".title");
                if (!title) return;
                title.addEventListener("click", function () {
                    setTimeout(function () {
                        if (!folder.closed) {
                            siblings.forEach(function (other) {
                                if (other && other !== folder && typeof other.close === "function") other.close();
                            });
                        }
                    }, 0);
                });
            } catch (e) {}
        }
        __babaTopFolders.forEach(function (folder) { __babaBindAccordion(folder, __babaTopFolders); });
        [fColors, fShow].forEach(function (folder) { __babaBindAccordion(folder, [fColors, fShow]); });


        var __babaMenuVisible = true;
        window.addEventListener("keydown", function (ev) {
            try {
                var tg = ev.target;
                if (tg && (tg.tagName === "INPUT" || tg.tagName === "TEXTAREA" || tg.isContentEditable)) return;
                if (ev.code !== "KeyH" || ev.repeat) return;
                __babaMenuVisible = !__babaMenuVisible;
                gui.domElement.style.display = __babaMenuVisible ? "" : "none";
                ev.stopImmediatePropagation();
                ev.preventDefault();
            } catch (e) {}
        }, true);

        attachVisualHacks();
    }
    try {
        window.NewTestCompat = {
            version: "deob45-full-v1",
            rightClickMode: "deob45-exact-native-tile-tuple",
            nativeRuntime: "deob45",
            aliases: ["AimBotEnable","AutoBuiledEnabled","OpenEverythingByClick","XrayBuildings","TeamClanColor","EnemyClanColor","ShowLines"]
        };
    } catch (e) {}

    window.AimbotMenuInit = AimbotMenuInit;
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", AimbotMenuInit);
    } else {
        AimbotMenuInit();
    }
})();
//code end
  /* ===== END BABA BabaConfig PORT ===== */
/* ===== END BABA kod35 PORT ===== */

