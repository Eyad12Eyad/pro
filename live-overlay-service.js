/* ============================================================
   live-overlay-service.js — Eyad_Eyad12  v2.0
   أوفرلي البث المباشر PUBG — لوحة التحكم الكاملة
   ============================================================ */

/* ── Constants ── */
const LO_KEY       = 'pubg_live_eyad12';
const LO_CH        = 'pubg-live-eyad12';
const LO_PLACEMENT = [0,12,9,7,5,4,3,2,1,1,1,0,0,0,0,0,0,0,0,0,0,0];
const LO_FLAGS     = ['🏳️','🇮🇶','🇸🇦','🇦🇪','🇰🇼','🇶🇦','🇧🇭','🇴🇲','🇯🇴','🇪🇬','🇩🇿','🇲🇦','🇹🇳','🇱🇧','🇸🇾','🇵🇰','🇮🇷','🇹🇷','🇩🇪','🇬🇧','🇺🇸','🇧🇷','🇮🇩','🇵🇭','🇰🇷','🇯🇵','🇨🇳','🇦🇺'];
const LO_MEDALS    = ['🥇','🥈','🥉'];

/* ── State ── */
let loTeams           = [];
let loBc              = null;
let loNextId          = 1;
let loEliminationOrder= []; /* teamId[] — ترتيب الفرق التي فني كل أعضاؤها */

/* ════════════════════════════════════════════
   Patch openService
════════════════════════════════════════════ */
(function(){
    const prev = window.openService;
    window.openService = function(id, name){
        if(id !== 'live-overlay') return prev?.call(this, id, name);
        const modal = document.getElementById('serviceModal');
        const title = document.getElementById('serviceModalTitle');
        const cont  = document.getElementById('serviceModalContent');
        if(!modal||!title||!cont) return;
        title.textContent = name;
        cont.innerHTML    = loHTML();
        modal.classList.add('active');
        requestAnimationFrame(loInit);
    };
})();

/* ════════════════════════════════════════════
   HTML
════════════════════════════════════════════ */
function loHTML(){
return `<div class="service-interface" style="padding:0">
<style>
.lo-wrap{background:#030c1c;border-radius:14px;overflow:hidden}
.lo-topbar{background:linear-gradient(135deg,#a00,#700);display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;padding:.65rem 1rem;border-bottom:2px solid #e00}
.lo-topbar h3{color:#fff;font-size:.9rem;font-weight:800;margin-right:auto;display:flex;align-items:center;gap:6px}
.lo-top-btn{display:flex;align-items:center;gap:5px;padding:5px 12px;border-radius:8px;font-size:.78rem;font-weight:700;cursor:pointer;border:none;font-family:inherit;transition:all .2s;white-space:nowrap}
.lo-obs-btn{background:#00ccff;color:#000}.lo-obs-btn:hover{background:#00aadd}
.lo-add-btn{background:rgba(255,255,255,.14);color:#fff;border:1px solid rgba(255,255,255,.22)}.lo-add-btn:hover{background:rgba(255,255,255,.24)}
.lo-dist-btn{background:linear-gradient(135deg,#ffd700,#ff9800);color:#000;font-weight:900;font-size:.82rem}.lo-dist-btn:hover{filter:brightness(1.1);transform:scale(1.03)}
.lo-new-btn{background:rgba(0,229,255,.13);color:#00e5ff;border:1px solid rgba(0,229,255,.3)}.lo-new-btn:hover{background:rgba(0,229,255,.25)}
.lo-rst-btn{background:rgba(255,80,0,.15);color:#ff8844;border:1px solid rgba(255,80,0,.28)}.lo-rst-btn:hover{background:rgba(255,80,0,.3)}

/* Table */
.lo-table-wrap{overflow-x:auto;max-height:460px;overflow-y:auto}
.lo-table{width:100%;border-collapse:collapse;min-width:780px}
.lo-table th{background:#0a1828;color:#4a6070;font-size:.68rem;font-weight:700;padding:6px 6px;text-align:center;text-transform:uppercase;letter-spacing:.4px;position:sticky;top:0;z-index:2;border-bottom:1px solid rgba(0,229,255,.2)}
.lo-table td{padding:4px 5px;border-bottom:1px solid rgba(255,255,255,.04);vertical-align:middle}
.lo-table tr:hover td{background:rgba(0,229,255,.04)}
.lo-top1 td{background:rgba(255,215,0,.07)!important}
.lo-top2 td{background:rgba(192,192,192,.05)!important}
.lo-top3 td{background:rgba(205,127,50,.05)!important}
.lo-elim-row td{opacity:.5}

/* Rank */
.lo-rank{text-align:center;font-weight:900;color:#445566;font-size:.85rem;min-width:28px}
.lo-top1 .lo-rank{color:#ffd700}.lo-top2 .lo-rank{color:#c0c0c0}.lo-top3 .lo-rank{color:#cd7f32}

/* Place badge */
.lo-place-badge{display:inline-flex;align-items:center;gap:3px;background:rgba(255,215,0,.15);border:1px solid rgba(255,215,0,.3);color:#ffd700;padding:1px 7px;border-radius:8px;font-size:.68rem;font-weight:800;white-space:nowrap}
.lo-place-badge.no-place{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.1);color:#445566}

/* Elimination badge */
.lo-elim-badge{display:inline-flex;align-items:center;justify-content:center;background:#cc0000;color:#fff;border-radius:50%;width:18px;height:18px;font-size:.65rem;font-weight:900;flex-shrink:0}
.lo-elim-badge.no-elim{background:rgba(68,238,85,.15);color:#44ee55;border:1px solid rgba(68,238,85,.25)}

/* Inputs */
.lo-name-inp{background:rgba(0,0,0,.45);border:1px solid rgba(0,229,255,.18);border-radius:6px;color:#fff;padding:4px 7px;font-size:.8rem;width:100%;font-family:inherit}
.lo-name-inp:focus{outline:none;border-color:#00e5ff}
.lo-abbr-inp{background:rgba(0,0,0,.45);border:1px solid rgba(0,229,255,.15);border-radius:6px;color:#00e5ff;padding:3px 4px;font-size:.75rem;width:50px;text-align:center;font-family:inherit;font-weight:700;text-transform:uppercase}
.lo-abbr-inp:focus{outline:none;border-color:#00e5ff}
.lo-flag-sel{background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.1);border-radius:6px;color:#fff;padding:2px 3px;font-size:15px;cursor:pointer;font-family:inherit}
.lo-color-inp{width:30px;height:26px;border-radius:6px;border:1.5px solid rgba(255,255,255,.18);cursor:pointer;background:none;padding:1px}

/* Player bars */
.lo-players{display:flex;gap:3px;align-items:center;justify-content:center}
.lo-pbar{width:13px;height:28px;border-radius:3px;cursor:pointer;transition:all .2s;position:relative;flex-shrink:0}
.lo-pbar.alive{background:linear-gradient(180deg,#44ee55,#22aa33);box-shadow:0 0 6px rgba(68,238,85,.4)}
.lo-pbar.knocked{background:linear-gradient(180deg,#ee5500,#aa2200);box-shadow:0 0 6px rgba(238,85,0,.4)}
.lo-pbar.eliminated{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.08)}
.lo-pbar:hover{transform:scaleY(1.1)}

/* Kill controls */
.lo-kills{display:flex;align-items:center;gap:3px}
.lo-kill-val{min-width:20px;text-align:center;font-weight:800;color:#ff8855;font-size:.9rem}
.lo-k-btn{width:21px;height:21px;border-radius:5px;border:none;cursor:pointer;font-size:.85rem;font-weight:900;font-family:inherit;display:flex;align-items:center;justify-content:center;transition:all .15s}
.lo-k-plus{background:rgba(68,238,85,.2);color:#44ee55}.lo-k-plus:hover{background:rgba(68,238,85,.4)}
.lo-k-minus{background:rgba(255,85,0,.15);color:#ff5500}.lo-k-minus:hover{background:rgba(255,85,0,.3)}

/* Total */
.lo-total{text-align:center;font-weight:900;font-size:.95rem}

/* Delete */
.lo-del-btn{background:rgba(255,68,68,.1);border:1px solid rgba(255,68,68,.2);color:#f44;border-radius:6px;padding:2px 7px;cursor:pointer;font-family:inherit;font-size:.8rem;transition:all .15s}
.lo-del-btn:hover{background:rgba(255,68,68,.28)}

/* Status bar */
.lo-status-bar{display:flex;gap:1rem;padding:.45rem 1rem;background:rgba(0,0,0,.35);font-size:.72rem;color:#445566;border-top:1px solid rgba(255,255,255,.04);flex-wrap:wrap}
.lo-status-bar b{color:#00e5ff}
.lo-status-bar .lo-elim-stat{color:#ff6644}

/* Placement popup */
.lo-popup{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#0a1828;border:2px solid rgba(255,215,0,.4);border-radius:16px;padding:1.1rem;z-index:9999;box-shadow:0 20px 60px rgba(0,0,0,.9);min-width:270px}
.lo-popup h4{color:#ffd700;font-size:.88rem;margin-bottom:.75rem;text-align:center}
.lo-popup-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.35rem}
.lo-pl-opt{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#ccc;padding:5px 3px;text-align:center;font-size:.78rem;font-weight:700;cursor:pointer;font-family:inherit;transition:all .15s;line-height:1.3}
.lo-pl-opt:hover{background:rgba(255,215,0,.2);color:#ffd700;border-color:rgba(255,215,0,.4)}
.lo-pl-cancel{margin-top:.6rem;width:100%;background:rgba(255,68,68,.12);border:1px solid rgba(255,68,68,.22);color:#f44;border-radius:8px;padding:5px;cursor:pointer;font-family:inherit;font-size:.8rem;font-weight:700}

/* Dist confirm popup */
.lo-dist-popup{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#0a1828;border:2px solid rgba(255,215,0,.5);border-radius:16px;padding:1.4rem;z-index:9999;box-shadow:0 20px 60px rgba(0,0,0,.9);width:320px;text-align:center}
.lo-dist-popup h4{color:#ffd700;font-size:1rem;margin-bottom:.5rem}
.lo-dist-popup p{color:#8899aa;font-size:.82rem;line-height:1.6;margin-bottom:1rem}
.lo-dist-list{background:rgba(0,0,0,.3);border-radius:10px;padding:.6rem;margin-bottom:1rem;max-height:200px;overflow-y:auto;text-align:right}
.lo-dist-list-item{display:flex;align-items:center;gap:.5rem;padding:.25rem .4rem;font-size:.8rem;border-bottom:1px solid rgba(255,255,255,.04)}
.lo-dist-list-item:last-child{border-bottom:none}
.lo-dist-list-item .di-rank{color:#ffd700;font-weight:800;min-width:28px;font-size:.8rem}
.lo-dist-list-item .di-name{color:#ccc;flex:1}
.lo-dist-list-item .di-pts{color:#44ee55;font-weight:700;font-size:.8rem}
.lo-dist-list-item .di-how{color:#667788;font-size:.7rem}
.lo-dist-confirm-row{display:flex;gap:.6rem}
.lo-dist-ok{flex:2;padding:8px;background:linear-gradient(135deg,#ffd700,#ff9800);border:none;border-radius:10px;color:#000;font-weight:900;font-size:.88rem;cursor:pointer;font-family:inherit}
.lo-dist-cancel{flex:1;padding:8px;background:rgba(255,68,68,.12);border:1px solid rgba(255,68,68,.25);border-radius:10px;color:#f44;font-weight:700;font-size:.82rem;cursor:pointer;font-family:inherit}
</style>

<div class="lo-wrap">
  <!-- Top bar -->
  <div class="lo-topbar">
    <h3>🔴 لوحة التحكم المباشر</h3>
    <button class="lo-top-btn lo-dist-btn" onclick="loShowDistribute()">🏁 توزيع نقاط المراكز</button>
    <button class="lo-top-btn lo-obs-btn"  onclick="loOpenOverlay()"><i class="fas fa-external-link-alt"></i> OBS</button>
    <button class="lo-top-btn lo-add-btn"  onclick="loAddTeam()">+ فريق</button>
    <button class="lo-top-btn lo-new-btn"  onclick="loNewRound()">↺ جولة جديدة</button>
    <button class="lo-top-btn lo-rst-btn"  onclick="loReset()">🗑 مسح</button>
  </div>

  <!-- Table -->
  <div class="lo-table-wrap">
    <table class="lo-table">
      <thead><tr>
        <th>#</th>
        <th>تسلسل الموت</th>
        <th>الفريق</th>
        <th>اختصار</th>
        <th>علم</th>
        <th>لون</th>
        <th>اللاعبين</th>
        <th>قتلات</th>
        <th>مكان</th>
        <th>مجموع</th>
        <th></th>
      </tr></thead>
      <tbody id="lo-tbody"></tbody>
    </table>
  </div>

  <!-- Status bar -->
  <div class="lo-status-bar">
    <span>فرق: <b id="lo-tc">0</b></span>
    <span class="lo-elim-stat">منتهيين: <b id="lo-ec">0</b></span>
    <span>أعلى نقاط: <b id="lo-tp">0</b></span>
    <span>آخر تحديث: <b id="lo-tu">--</b></span>
    <span style="margin-right:auto;color:#334455">💡 انقر المربعات لتغيير حالة اللاعب — عند موت الفريق كاملاً يُسجّل تلقائياً</span>
  </div>
</div>`;
}

/* ════════════════════════════════════════════
   INIT
════════════════════════════════════════════ */
function loInit(){
    const saved = loLoad();
    if(saved?.teams?.length){
        loTeams = saved.teams;
        loEliminationOrder = saved.elimOrder || [];
        loNextId = Math.max(...loTeams.map(t=>t.id), 0) + 1;
    } else {
        loTeams = loDefaultTeams();
        loEliminationOrder = [];
    }
    try{ loBc = new BroadcastChannel(LO_CH); }catch(_){}
    loRenderTable();
    loBroadcast();
}

/* ════════════════════════════════════════════
   DATA
════════════════════════════════════════════ */
function loLoad(){
    try{ return JSON.parse(localStorage.getItem(LO_KEY)); }catch(_){ return null; }
}
function loSave(){
    const data = { teams:loTeams, elimOrder:loEliminationOrder, updated:Date.now() };
    try{ localStorage.setItem(LO_KEY, JSON.stringify(data)); }catch(_){}
    const el = document.getElementById('lo-tu');
    if(el) el.textContent = new Date().toLocaleTimeString('ar');
}
function loBroadcast(){
    loSave();
    try{ loBc?.postMessage({ type:'UPDATE', teams:loTeams }); }catch(_){}
}
function loTotalPts(t){ return (t.kills||0) + (t.placementPts||0); }
function loSorted(){ return [...loTeams].sort((a,b) => loTotalPts(b)-loTotalPts(a)); }
function loAllEliminated(t){ return t.players.every(p => p==='eliminated'); }

/* ════════════════════════════════════════════
   DEFAULT TEAMS
════════════════════════════════════════════ */
function loDefaultTeams(){
    const base=[
        ['Team Alpha','ALP','🇮🇶','#ff4444'],['Team Beta','BET','🇸🇦','#44aaff'],
        ['Team Gamma','GMM','🇦🇪','#44ff88'],['Team Delta','DLT','🇰🇼','#ffaa00'],
        ['Team Echo','ECH','🇶🇦','#aa44ff'], ['Team Foxtrot','FOX','🇧🇭','#ff44aa'],
    ];
    return base.map((t,i) => ({
        id:i+1, name:t[0], abbr:t[1], flag:t[2], color:t[3],
        players:['alive','alive','alive','alive'],
        kills:0, placementPts:0, place:null
    }));
}

/* ════════════════════════════════════════════
   RENDER TABLE
════════════════════════════════════════════ */
function loRenderTable(){
    const tbody = document.getElementById('lo-tbody');
    if(!tbody) return;
    const sorted = loSorted();
    const total  = loTeams.length;

    tbody.innerHTML = sorted.map((t,i) => {
        const rank    = i+1;
        const pts     = loTotalPts(t);
        const allElim = loAllEliminated(t);
        const elimIdx = loEliminationOrder.indexOf(t.id); /* -1 = لم يُحذف بعد */
        const rowCls  = allElim ? 'lo-elim-row' : rank===1?'lo-top1':rank===2?'lo-top2':rank===3?'lo-top3':'';
        const flagOpts= LO_FLAGS.map(f=>`<option value="${f}"${f===(t.flag||'🏳️')?' selected':''}>${f}</option>`).join('');

        /* Player bars */
        const bars = t.players.map((p,pi) => {
            const tips = {alive:'حي',knocked:'مطروح',eliminated:'ميت'};
            return `<div class="lo-pbar ${p}" onclick="loTogglePlayer(${t.id},${pi})" title="${tips[p]}"></div>`;
        }).join('');

        /* Elimination badge */
        const elimBadge = elimIdx >= 0
            ? `<span class="lo-elim-badge" title="الفريق ${elimIdx+1}. في الموت">${elimIdx+1}</span>`
            : `<span class="lo-elim-badge no-elim" title="حي">●</span>`;

        /* Place badge */
        const placeBadge = t.place
            ? `<span class="lo-place-badge">${t.place<=3?LO_MEDALS[t.place-1]:'#'+t.place} +${t.placementPts||0}نق</span>`
            : `<button class="lo-place-badge no-place" onclick="loManualPlace(${t.id},${rank})" title="اضغط لتعيين مكان يدوي">📍</button>`;

        return `
        <tr class="${rowCls}" id="lo-row-${t.id}">
          <td class="lo-rank">${LO_MEDALS[rank-1]||rank}</td>
          <td style="text-align:center">${elimBadge}</td>
          <td><input class="lo-name-inp" value="${loEsc(t.name)}" oninput="loField(${t.id},'name',this.value)" style="width:100px"></td>
          <td><input class="lo-abbr-inp" value="${loEsc(t.abbr)}" maxlength="5" oninput="loField(${t.id},'abbr',this.value.toUpperCase())"></td>
          <td><select class="lo-flag-sel" onchange="loField(${t.id},'flag',this.value)">${flagOpts}</select></td>
          <td><input type="color" class="lo-color-inp" value="${t.color||'#fff'}" oninput="loField(${t.id},'color',this.value)"></td>
          <td><div class="lo-players">${bars}</div></td>
          <td>
            <div class="lo-kills">
              <button class="lo-k-btn lo-k-minus" onclick="loKills(${t.id},-1)">−</button>
              <span class="lo-kill-val">${t.kills||0}</span>
              <button class="lo-k-btn lo-k-plus"  onclick="loKills(${t.id},+1)">+</button>
            </div>
          </td>
          <td style="text-align:center">${placeBadge}</td>
          <td><span class="lo-total" style="color:${rank===1?'#ffd700':rank<=3?'#00e5ff':'#ccc'}">${pts}</span></td>
          <td><button class="lo-del-btn" onclick="loDelete(${t.id})">✕</button></td>
        </tr>`;
    }).join('');

    /* Status bar */
    const ec = document.getElementById('lo-ec');
    const tc = document.getElementById('lo-tc');
    const tp = document.getElementById('lo-tp');
    if(ec) ec.textContent = loEliminationOrder.length;
    if(tc) tc.textContent = loTeams.length;
    if(tp && sorted.length) tp.textContent = loTotalPts(sorted[0]);
}

/* ════════════════════════════════════════════
   PLAYER TOGGLE — الوظيفة الرئيسية
════════════════════════════════════════════ */
function loTogglePlayer(teamId, pi){
    const team = loTeams.find(t => t.id === teamId);
    if(!team) return;

    const cycle = { alive:'knocked', knocked:'eliminated', eliminated:'alive' };
    team.players[pi] = cycle[team.players[pi]] || 'alive';

    const allElim  = loAllEliminated(team);
    const wasElim  = loEliminationOrder.includes(teamId);

    if(allElim && !wasElim){
        /* ── الفريق فني كله: سجّله في ترتيب الموت ── */
        loEliminationOrder.push(teamId);
        /* احسب مكانه: آخر من يموت = أعلى مكان بين المنتهيين */
        /* لكن نتركه مؤقتاً بدون نقاط لأن الجولة لم تنته بعد */
        /* نقاطه ستُحسب عند الضغط على "توزيع المراكز" */
    } else if(!allElim && wasElim){
        /* إذا أُحيي لاعب ← أزله من قائمة الانتهاء */
        loEliminationOrder = loEliminationOrder.filter(id => id !== teamId);
        team.placementPts = 0;
        team.place = null;
    }

    loRenderTable();
    loBroadcast();
}

/* ════════════════════════════════════════════
   DISTRIBUTE PLACEMENTS — توزيع نقاط المراكز
════════════════════════════════════════════ */
function loShowDistribute(){
    document.getElementById('lo-dist-popup-el')?.remove();

    const total = loTeams.length;

    /* 
     * منطق التوزيع:
     * - الفرق التي ماتت أولاً = آخر مراكز
     * - الفرق المتبقية (حية أو ناقصة) = أفضل مراكز حسب الترتيب الحالي بالنقاط
     */
    const preview = loCalcDistribution();

    const listHTML = preview.map(p => `
        <div class="lo-dist-list-item">
            <span class="di-rank">${p.place<=3?LO_MEDALS[p.place-1]:'#'+p.place}</span>
            <span class="di-name">${loEsc(p.name)}</span>
            <span class="di-how">${p.how}</span>
            <span class="di-pts">+${p.pts}</span>
        </div>`).join('');

    const popup = document.createElement('div');
    popup.id    = 'lo-dist-popup-el';
    popup.className = 'lo-dist-popup';
    popup.innerHTML = `
        <h4>🏁 توزيع نقاط المراكز</h4>
        <p>سيتم إعطاء كل فريق نقاط حسب ترتيبه — الفرق التي ماتت أولاً تأخذ آخر المراكز</p>
        <div class="lo-dist-list">${listHTML}</div>
        <div class="lo-dist-confirm-row">
            <button class="lo-dist-ok"    onclick="loConfirmDistribute()">✅ تأكيد التوزيع</button>
            <button class="lo-dist-cancel" onclick="document.getElementById('lo-dist-popup-el')?.remove()">إلغاء</button>
        </div>`;
    document.body.appendChild(popup);
}

function loCalcDistribution(){
    const total = loTeams.length;
    const result= [];
    let   place = 1;

    /* الفرق الحية / ناقصة (لم يمت كلها) — مرتبة حسب النقاط الحالية (قتلات فقط) */
    const alive = loTeams
        .filter(t => !loEliminationOrder.includes(t.id))
        .sort((a,b) => loTotalPts(b)-loTotalPts(a));

    alive.forEach(t => {
        result.push({
            id   : t.id,
            name : t.name,
            place: place,
            pts  : LO_PLACEMENT[place] || 0,
            how  : 'حي / ترتيب النقاط'
        });
        place++;
    });

    /* الفرق المنتهية — العكس: آخر من مات = مكان أعلى */
    /* loEliminationOrder[0] = أول من مات = أسوأ مكان */
    const elimReversed = [...loEliminationOrder].reverse(); /* آخر من مات أولاً */
    elimReversed.forEach(teamId => {
        const t = loTeams.find(t => t.id === teamId);
        if(!t) return;
        result.push({
            id   : t.id,
            name : t.name,
            place: place,
            pts  : LO_PLACEMENT[place] || 0,
            how  : `مات ${loEliminationOrder.indexOf(teamId)+1}°`
        });
        place++;
    });

    return result;
}

function loConfirmDistribute(){
    document.getElementById('lo-dist-popup-el')?.remove();
    const dist = loCalcDistribution();
    dist.forEach(d => {
        const t = loTeams.find(t => t.id === d.id);
        if(!t) return;
        t.place        = d.place;
        t.placementPts = d.pts;
    });
    loRenderTable();
    loBroadcast();

    /* رسالة تأكيد مرئية */
    const msg = document.createElement('div');
    msg.style.cssText = 'position:fixed;top:20px;right:50%;transform:translateX(50%);background:linear-gradient(135deg,#ffd700,#ff9800);color:#000;padding:10px 24px;border-radius:50px;font-weight:900;font-size:.9rem;z-index:99999;box-shadow:0 8px 24px rgba(0,0,0,.5)';
    msg.textContent = '🏁 تم توزيع نقاط المراكز على الكل!';
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2500);
}

/* ════════════════════════════════════════════
   MANUAL PLACE (يدوي لفريق واحد)
════════════════════════════════════════════ */
function loManualPlace(teamId, currentRank){
    document.getElementById('lo-popup')?.remove();
    const popup = document.createElement('div');
    popup.id    = 'lo-popup';
    popup.className = 'lo-popup';
    const opts  = Array.from({length:16},(_,i)=>i+1).map(p=>{
        const pts = LO_PLACEMENT[p]||0;
        return `<button class="lo-pl-opt" onclick="loSetPlace(${teamId},${p},${pts})">#${p}<br><small style="color:#ffd70088">+${pts}</small></button>`;
    }).join('');
    popup.innerHTML=`<h4>📍 مكان الفريق</h4><div class="lo-popup-grid">${opts}</div>
        <button class="lo-pl-cancel" onclick="document.getElementById('lo-popup')?.remove()">إلغاء</button>`;
    document.body.appendChild(popup);
    setTimeout(()=>{ document.addEventListener('click',function h(e){ if(!popup.contains(e.target)){popup.remove();document.removeEventListener('click',h);} }); },120);
}
function loSetPlace(teamId, place, pts){
    const t = loTeams.find(t=>t.id===teamId);
    if(t){ t.place=place; t.placementPts=pts; }
    document.getElementById('lo-popup')?.remove();
    loRenderTable(); loBroadcast();
}

/* ════════════════════════════════════════════
   OTHER ACTIONS
════════════════════════════════════════════ */
function loKills(teamId, delta){
    const t = loTeams.find(t=>t.id===teamId);
    if(!t) return;
    t.kills = Math.max(0,(t.kills||0)+delta);
    loRenderTable(); loBroadcast();
}
function loField(teamId, field, val){
    const t = loTeams.find(t=>t.id===teamId);
    if(t) t[field]=val;
    loBroadcast();
}
function loDelete(teamId){
    loTeams = loTeams.filter(t=>t.id!==teamId);
    loEliminationOrder = loEliminationOrder.filter(id=>id!==teamId);
    loRenderTable(); loBroadcast();
}
function loAddTeam(){
    if(loTeams.length>=20){alert('الحد الأقصى 20 فريق');return;}
    const cols=['#ff4444','#44aaff','#44ff88','#ffaa00','#aa44ff','#ff44aa','#44ffff','#ffff44'];
    loTeams.push({
        id:loNextId++, name:`Team ${loTeams.length+1}`,
        abbr:`T${loTeams.length+1}`, flag:'🏳️',
        color:cols[loTeams.length%cols.length],
        players:['alive','alive','alive','alive'],
        kills:0, placementPts:0, place:null
    });
    loRenderTable(); loBroadcast();
}
function loNewRound(){
    if(!confirm('جولة جديدة؟ سيتم تصفير اللاعبين والقتلات ومراكز الجولة')) return;
    loTeams.forEach(t=>{
        t.players=['alive','alive','alive','alive'];
        t.kills=0; t.placementPts=0; t.place=null;
    });
    loEliminationOrder=[];
    loRenderTable(); loBroadcast();
}
function loReset(){
    if(!confirm('مسح كل البيانات؟')) return;
    loTeams=loDefaultTeams(); loEliminationOrder=[]; loNextId=loTeams.length+1;
    loRenderTable(); loBroadcast();
}
function loOpenOverlay(){
    loBroadcast();
    const url = new URL('live-overlay.html', window.location.href).href;
    const win = window.open(url,'pubg-overlay','width=500,height=700,top=50,right=50');
    if(!win) alert('فعّل النوافذ المنبثقة أو اسحب live-overlay.html إلى OBS مباشرةً');
}
function loEsc(s){ return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }