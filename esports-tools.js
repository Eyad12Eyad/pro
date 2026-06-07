/* ============================================================
   esports-tools.js — Eyad_Eyad12 | نسخة احترافية محسّنة
   10 أدوات إيسبورت PUBG Mobile | Canvas-Based
   ============================================================ */
'use strict';

/* ── Filter Function ── */
function espFilter(btn, cat) {
    document.querySelectorAll('.esp-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.esp-card').forEach(card => {
        const match = cat === 'all' || card.dataset.cat === cat;
        card.classList.toggle('esp-hidden', !match);
        if (match) { card.style.animation = 'none'; card.offsetHeight; card.style.animation = 'espCardIn .35s ease forwards'; }
    });
}

/* ── Helpers ── */
const _dl  = (c, n) => { const a = document.createElement('a'); a.href = c.toDataURL('image/png'); a.download = n+'.png'; a.click(); };
const _dlT = (t, n) => { const b = new Blob([t],{type:'text/plain;charset=utf-8'}),u=URL.createObjectURL(b),a=document.createElement('a'); a.href=u;a.download=n+'.txt';a.click();URL.revokeObjectURL(u); };
const _dlH = (h, n) => { const b = new Blob([h],{type:'text/html;charset=utf-8'}),u=URL.createObjectURL(b),a=document.createElement('a'); a.href=u;a.download=n+'.html';a.click();URL.revokeObjectURL(u); };
const _v   = id => document.getElementById(id)?.value ?? '';
const _hex = (hex, a=1) => { const n=parseInt(hex.replace('#',''),16); return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`; };
const _ctx = (id, w, h) => { const c=document.getElementById(id); if(!c)return null; c.width=w;c.height=h; return c.getContext('2d'); };

/* ════════════════════════════════════════════════════════
   PATCH openService
════════════════════════════════════════════════════════ */
(function(){
    const ESP = ['lb-creator','pubg-map','cam-frame','stream-overlay','team-logo','tournament-banner','player-stats','highlight-maker','stream-bg','transitions'];
    const orig = window.openService;
    window.openService = function(id, name){
        if (!ESP.includes(id)) return orig?.call(this, id, name);
        const modal = document.getElementById('serviceModal');
        const title = document.getElementById('serviceModalTitle');
        const cont  = document.getElementById('serviceModalContent');
        if (!modal||!title||!cont) return;
        title.textContent = name;
        cont.innerHTML = _buildTool(id);
        modal.classList.add('active');
        requestAnimationFrame(() => _initTool(id));
    };
})();

function _initTool(id) {
    ({  'lb-creator':        lbInit,
        'pubg-map':          mapInit,
        'cam-frame':         cfInit,
        'stream-overlay':    soInit,
        'team-logo':         tlInit,
        'tournament-banner': tbInit,
        'player-stats':      psInit,
        'highlight-maker':   hlInit,
        'stream-bg':         bgInit,
        'transitions':       trInit  }[id]?.());
}

/* ════════════════════════════════════════════════════════
   HTML BUILDERS
════════════════════════════════════════════════════════ */
function _buildTool(id) {
    const W = s => `<div class="esp-tool-wrap">${s}</div>`;
    switch(id) {

    case 'lb-creator': return W(`
      <div class="esp-tool-full">
        <div class="esp-tool-grid">
          <div class="esp-tool-sidebar">
            <div class="esp-tool-block">
              <div class="esp-tool-block-title"><i class="fas fa-trophy"></i> البطولة</div>
              <div class="form-group"><label>اسم البطولة</label><input class="service-input" id="lb_title" value="PUBG Mobile Championship"></div>
              <div class="esp-color-row">
                <div><label class="form-group" style="font-size:.72rem;color:#667788;display:block;margin-bottom:.25rem">خلفية</label><input type="color" class="esp-color-inp" id="lb_bg" value="#030d1e"></div>
                <div><label class="form-group" style="font-size:.72rem;color:#667788;display:block;margin-bottom:.25rem">هيدر</label><input type="color" class="esp-color-inp" id="lb_hdr" value="#00e5ff"></div>
                <div><label class="form-group" style="font-size:.72rem;color:#667788;display:block;margin-bottom:.25rem">تمييز</label><input type="color" class="esp-color-inp" id="lb_acc" value="#ffd700"></div>
              </div>
            </div>
            <div class="esp-tool-block" style="max-height:300px;overflow-y:auto">
              <div class="esp-tool-block-title"><i class="fas fa-users"></i> الفرق <small style="color:#556;font-size:.7rem">(حتى 16)</small></div>
              <div style="display:flex;gap:.3rem;color:#556677;font-size:.68rem;padding:0 2px;margin-bottom:.3rem">
                <span style="flex:2">الاسم</span><span style="width:48px;text-align:center">قتل</span><span style="width:52px;text-align:center">نقاط</span>
              </div>
              <div id="lb_rows"></div>
              <button class="esp-add-btn" onclick="lbAdd()" style="margin-top:.4rem"><i class="fas fa-plus"></i> فريق جديد</button>
            </div>
            <div class="esp-dl-row">
              <button class="esp-dl-btn" onclick="lbRender();lbDl()"><i class="fas fa-download"></i> تنزيل PNG</button>
              <button class="esp-dl-btn sec" onclick="lbRender()"><i class="fas fa-sync"></i> تحديث</button>
            </div>
          </div>
          <div class="esp-tool-preview">
            <div class="esp-preview-label"><i class="fas fa-eye"></i> معاينة مباشرة</div>
            <div class="esp-lb-preview"><canvas id="lb_cv" style="width:100%"></canvas></div>
          </div>
        </div>
      </div>`);

    case 'pubg-map': return W(`
      <div class="esp-tool-full" style="padding:0">
        <div style="padding:10px 12px 0;display:flex;flex-direction:column;gap:7px">
          <div>
            <div style="color:#ffd700;font-size:.78rem;font-weight:700;margin-bottom:5px">🗺️ اختر المنطقة:</div>
            <div id="mapLocPicker" style="display:flex;flex-wrap:wrap;gap:4px">
              <button class="esp-map-btn active" onclick="mapLoadLoc(this,'maps/erangel.png','Erangel')">🟩 Erangel</button>
              <button class="esp-map-btn" onclick="mapLoadLoc(this,'maps/pushinki.png','Pochinki')">Pochinki</button>
              <button class="esp-map-btn" onclick="mapLoadLoc(this,'maps/gorgbool.png','Georgopol')">Georgopol</button>
              <button class="esp-map-btn" onclick="mapLoadLoc(this,'maps/yasnaya poliana.png','Yasnaya')">Yasnaya</button>
              <button class="esp-map-btn" onclick="mapLoadLoc(this,'maps/kameshki.png','Kameshki')">Kameshki</button>
              <button class="esp-map-btn" onclick="mapLoadLoc(this,'maps/severny.png','Severny')">Severny</button>
              <button class="esp-map-btn" onclick="mapLoadLoc(this,'maps/zhoark.png','Zharki')">Zharki</button>
              <button class="esp-map-btn" onclick="mapLoadLoc(this,'maps/gatka.png','Gatka')">Gatka</button>
              <button class="esp-map-btn" onclick="mapLoadLoc(this,'maps/primshock.png','Primorsk')">Primorsk</button>
              <button class="esp-map-btn" onclick="mapLoadLoc(this,'maps/mylta.png','Mylta')">Mylta</button>
              <button class="esp-map-btn" onclick="mapLoadLoc(this,'maps/mylta power ,factory.png','Mylta Power')">Mylta Power</button>
              <button class="esp-map-btn" onclick="mapLoadLoc(this,'maps/farm.png','Farm')">Farm</button>
              <button class="esp-map-btn" onclick="mapLoadLoc(this,'maps/school ,resohok.png','School')">School</button>
              <button class="esp-map-btn" onclick="mapLoadLoc(this,'maps/water town , rains.png','Water Town')">Water Town</button>
              <button class="esp-map-btn" onclick="mapLoadLoc(this,'maps/mansion.png','Mansion')">Mansion</button>
              <button class="esp-map-btn" onclick="mapLoadLoc(this,'maps/lebovka.png','Lipovka')">Lipovka</button>
              <button class="esp-map-btn" onclick="mapLoadLoc(this,'maps/prison , shelter.png','Prison')">Prison</button>
              <button class="esp-map-btn" onclick="mapLoadLoc(this,'maps/quarry.png','Quarry')">Quarry</button>
              <button class="esp-map-btn" onclick="mapLoadLoc(this,'maps/nova.png','Nova')">Nova</button>
              <button class="esp-map-btn" onclick="mapLoadLoc(this,'maps/island.png','Island')">Island</button>
              <button class="esp-map-btn" onclick="mapLoadLoc(this,'maps/bridg.png','Bridge')">Bridge</button>
            </div>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center">
            <span style="color:#aaa;font-size:.72rem">✏️</span>
            <button class="esp-map-btn active" id="mt-pen"    onclick="mapSetTool(this,'pen')">رسم</button>
            <button class="esp-map-btn" id="mt-arrow"  onclick="mapSetTool(this,'arrow')">سهم</button>
            <button class="esp-map-btn" id="mt-circle" onclick="mapSetTool(this,'circle')">دائرة</button>
            <button class="esp-map-btn" id="mt-rect"   onclick="mapSetTool(this,'rect')">مستطيل</button>
            <button class="esp-map-btn" id="mt-text"   onclick="mapSetTool(this,'text')">نص</button>
            <button class="esp-map-btn" id="mt-eraser" onclick="mapSetTool(this,'eraser')">ممحاة</button>
            <button class="esp-map-btn" id="mt-move"   onclick="mapSetTool(this,'move')">✋ تحريك</button>
            <button class="esp-map-btn" id="mt-delete" onclick="mapSetTool(this,'delete')">🗑️ حذف</button>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center">
            <span style="color:#ffd700;font-size:.72rem">👥</span>
            <button class="esp-map-btn" onclick="mapSetEntity(this,'igl')"     style="background:linear-gradient(135deg,#7f0000,#3f0000)">👑 IGL</button>
            <button class="esp-map-btn" onclick="mapSetEntity(this,'support')" style="background:linear-gradient(135deg,#0058a0,#003060)">🛡️ Support</button>
            <button class="esp-map-btn" onclick="mapSetEntity(this,'frager')"  style="background:linear-gradient(135deg,#b34700,#6a2900)">⚔️ Fragger</button>
            <button class="esp-map-btn" onclick="mapSetEntity(this,'scout')"   style="background:linear-gradient(135deg,#007a8c,#004050)">🔭 Scout</button>
            <button class="esp-map-btn" onclick="mapSetEntity(this,'freman')"  style="background:linear-gradient(135deg,#4a0072,#280040)">🦅 Free Man</button>
            <span style="color:#888;font-size:.7rem">|</span>
            <button class="esp-map-btn" onclick="mapSetEntity(this,'enemy')"   style="background:linear-gradient(135deg,#7f0000,#3f0000)">💀 عدو</button>
            <button class="esp-map-btn" onclick="mapSetEntity(this,'vehicle')" style="background:linear-gradient(135deg,#263238,#101820)">🚗 سيارة</button>
            <button class="esp-map-btn" onclick="mapSetEntity(this,'boat')"    style="background:linear-gradient(135deg,#0d47a1,#07234f)">⛵ قارب</button>
            <button class="esp-map-btn" onclick="mapSetEntity(this,'airdrop')" style="background:linear-gradient(135deg,#4a1272,#25073a)">📦 Airdrop</button>
            <button class="esp-map-btn" onclick="mapSetEntity(this,'zone')"    style="background:linear-gradient(135deg,#004d40,#002820)">⭕ زون</button>
            <button class="esp-map-btn" onclick="mapSetEntity(this,'marker')">📍</button>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:5px;align-items:center">
            ${['#ff4444','#00e5ff','#ffd700','#44ff88','#ff9100','#ffffff'].map((c,i)=>`<div class="esp-map-color-dot${!i?' active':''}" style="background:${c}" onclick="mapColor='${c}';document.querySelectorAll('.esp-map-color-dot').forEach(d=>d.classList.remove('active'));this.classList.add('active')"></div>`).join('')}
            <input type="range" id="mapBrush" min="2" max="16" value="3" style="width:65px;vertical-align:middle;accent-color:#00e5ff">
            <span style="color:#888;font-size:.7rem">|</span>
            <span style="color:#ffd700;font-size:.72rem">دمج:</span>
            <select id="mapMergeSel" style="background:#1a2a3a;color:#fff;border:1px solid rgba(0,229,255,0.3);border-radius:5px;padding:3px 5px;font-size:.72rem">
              <option value="">اختر...</option>
              <option value="maps/erangel.png">Erangel</option>
              <option value="maps/pushinki.png">Pochinki</option>
              <option value="maps/gorgbool.png">Georgopol</option>
              <option value="maps/kameshki.png">Kameshki</option>
              <option value="maps/severny.png">Severny</option>
              <option value="maps/gatka.png">Gatka</option>
              <option value="maps/mylta.png">Mylta</option>
              <option value="maps/farm.png">Farm</option>
              <option value="maps/school ,resohok.png">School</option>
              <option value="maps/prison , shelter.png">Prison</option>
              <option value="maps/quarry.png">Quarry</option>
              <option value="maps/nova.png">Nova</option>
              <option value="maps/island.png">Island</option>
              <option value="maps/bridg.png">Bridge</option>
            </select>
            <button class="esp-map-btn" onclick="mapAddMerge()" style="background:linear-gradient(135deg,#1a5c2a,#0a3a1a)">➕</button>
            <button class="esp-map-btn" onclick="mapClearMerge()" style="background:#3a1a1a">🗑️ دمج</button>
          </div>
        </div>
        <div id="mapHint" style="background:rgba(0,229,255,0.07);border-top:1px solid rgba(0,229,255,0.15);border-bottom:1px solid rgba(0,229,255,0.15);padding:3px 12px;font-size:.72rem;color:#00e5ff;margin:6px 0 0">✏️ رسم حر — Shift+سحب للتنقل • Scroll للتكبير</div>
        <div style="position:relative;padding:0 0 8px">
          <div style="position:absolute;top:8px;left:8px;z-index:10;display:flex;flex-direction:column;gap:3px">
            <button onclick="mapZoom(1.2)"   style="width:28px;height:28px;background:rgba(0,0,0,0.75);border:1px solid rgba(0,229,255,0.4);color:#00e5ff;border-radius:5px;cursor:pointer;font-size:16px;font-weight:700;line-height:1">+</button>
            <button onclick="mapZoom(.83)"   style="width:28px;height:28px;background:rgba(0,0,0,0.75);border:1px solid rgba(0,229,255,0.4);color:#00e5ff;border-radius:5px;cursor:pointer;font-size:16px;font-weight:700;line-height:1">−</button>
            <button onclick="mapZoomReset()" style="width:28px;height:28px;background:rgba(0,0,0,0.75);border:1px solid rgba(0,229,255,0.4);color:#00e5ff;border-radius:5px;cursor:pointer;font-size:11px;line-height:1">↺</button>
          </div>
          <div id="mapViewport" style="overflow:hidden;background:#0a1520;cursor:crosshair;height:500px;position:relative">
            <div id="mapPanBox" style="position:absolute;top:0;left:0;transform-origin:top left">
              <canvas id="map_bg"></canvas>
              <canvas id="map_cv" style="position:absolute;top:0;left:0"></canvas>
              <canvas id="map_ec" style="position:absolute;top:0;left:0;pointer-events:none"></canvas>
            </div>
          </div>
        </div>
        <div style="padding:0 12px 12px;display:flex;gap:6px;flex-wrap:wrap">
          <button class="esp-dl-btn" onclick="mapDl()"><i class="fas fa-download"></i> تصدير</button>
          <button class="esp-map-btn" onclick="mapUndo()">↩ تراجع</button>
          <button class="esp-map-btn" onclick="mapClear()">🗑 مسح الرسم</button>
          <button class="esp-map-btn" onclick="mapClearEntities()">💀 مسح العناصر</button>
        </div>
      </div>`);
    case 'cam-frame': return W(`
      <div class="esp-tool-grid">
        <div class="esp-tool-sidebar">
          <div class="esp-tool-block">
            <div class="esp-tool-block-title"><i class="fas fa-th-large"></i> نمط الإطار</div>
            <div class="esp-style-grid" id="cf_styles">
              ${[['💫 Neon Blue','nb'],['🔴 Neon Red','nr'],['👑 Golden','gd'],['🏆 Esport','es'],['💜 Purple','pu'],['🤖 Cyber','cy'],['⚔️ Military','ml'],['🌙 Arabic','ar']].map(([n,v],i)=>`<button class="esp-style-btn${!i?' active':''}" onclick="cfStyle='${v}';document.querySelectorAll('#cf_styles .esp-style-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');cfRender()">${n}</button>`).join('')}
            </div>
          </div>
          <div class="esp-tool-block">
            <div class="esp-tool-block-title"><i class="fas fa-user"></i> النص</div>
            <div class="form-group"><label>اسم البث</label><input class="service-input" id="cf_name" placeholder="Eyad_Eyad12" oninput="cfRender()"></div>
            <div class="form-group"><label>العنوان الفرعي</label><input class="service-input" id="cf_sub" placeholder="PUBG Mobile" oninput="cfRender()"></div>
            <div class="form-group"><label>اسم الفريق</label><input class="service-input" id="cf_team" placeholder="Team Alpha" oninput="cfRender()"></div>
          </div>
          <div class="esp-tool-block">
            <div class="esp-tool-block-title"><i class="fas fa-palette"></i> الألوان</div>
            <div class="esp-color-row">
              <div><label style="font-size:.7rem;color:#667788;display:block;margin-bottom:.25rem">رئيسي</label><input type="color" class="esp-color-inp" id="cf_c1" value="#00e5ff" oninput="cfRender()"></div>
              <div><label style="font-size:.7rem;color:#667788;display:block;margin-bottom:.25rem">ثانوي</label><input type="color" class="esp-color-inp" id="cf_c2" value="#0077ff" oninput="cfRender()"></div>
              <div><label style="font-size:.7rem;color:#667788;display:block;margin-bottom:.25rem">نص</label><input type="color" class="esp-color-inp" id="cf_tc" value="#ffffff" oninput="cfRender()"></div>
            </div>
          </div>
          <div class="esp-tool-block">
            <div class="esp-tool-block-title"><i class="fas fa-expand-alt"></i> الحجم</div>
            <div class="esp-size-row" id="cf_sizes">
              ${[['1:1 | 512px','512x512'],['3:4 | Vert','480x640'],['16:9 | Wide','854x480']].map(([n,v],i)=>`<button class="esp-size-btn${!i?' active':''}" onclick="cfSize='${v}';document.querySelectorAll('#cf_sizes .esp-size-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');cfRender()">${n}</button>`).join('')}
            </div>
          </div>
          <div class="esp-dl-row">
            <button class="esp-dl-btn" onclick="cfDl()"><i class="fas fa-download"></i> PNG شفاف</button>
            <button class="esp-dl-btn sec" onclick="cfDlCSS()"><i class="fas fa-code"></i> CSS</button>
          </div>
        </div>
        <div class="esp-tool-preview">
          <div class="esp-preview-label"><i class="fas fa-eye"></i> معاينة حية — المنتصف شفاف لـ OBS</div>
          <div class="esp-canvas-box"><canvas id="cf_cv" style="max-width:100%;max-height:420px"></canvas></div>
          <div class="esp-tool-hint"><i class="fas fa-info-circle" style="color:#00e5ff"></i> الإطار PNG شفاف — ضعه فوق الكاميرا في OBS كـ Image Source</div>
        </div>
      </div>`);

    case 'stream-overlay': return W(`
      <div class="esp-tool-grid">
        <div class="esp-tool-sidebar">
          <div class="esp-tool-block">
            <div class="esp-tool-block-title"><i class="fas fa-sliders-h"></i> عناصر الأوفرلي</div>
            ${[['soHealth','❤️ شريط الصحة والدروع',true],['soKills','💀 عداد القتلات',true],['soMinimap','🗺️ خريطة صغيرة',false],['soRing','⏱️ مؤقت الدائرة',true],['soWeapon','🔫 السلاح الحالي',true],['soSquad','👥 حالة الفريق',true],['soLogo','🏷️ شعار البث',true]].map(([id,lbl,def])=>`
              <label class="esp-toggle-item"><input type="checkbox" id="${id}" ${def?'checked':''} onchange="soRender()"><span>${lbl}</span></label>`).join('')}
          </div>
          <div class="esp-tool-block">
            <div class="esp-tool-block-title"><i class="fas fa-palette"></i> الثيم</div>
            <div class="esp-style-grid" id="so_themes">
              ${[['💻 Cyber','cy'],['🥇 Gold','gd'],['❤️ Red','rd'],['💜 Purple','pu'],['🤍 White','wh']].map(([n,v],i)=>`<button class="esp-style-btn${!i?' active':''}" onclick="soTheme='${v}';document.querySelectorAll('#so_themes .esp-style-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');soRender()">${n}</button>`).join('')}
            </div>
          </div>
          <div class="esp-tool-block">
            <div class="form-group"><label>اسم اللاعب</label><input class="service-input" id="so_player" value="Eyad_Eyad12" oninput="soRender()"></div>
            <div class="form-group"><label>اسم الفريق</label><input class="service-input" id="so_team" value="Team PUBG" oninput="soRender()"></div>
          </div>
          <div class="esp-dl-row"><button class="esp-dl-btn" onclick="soDl()"><i class="fas fa-download"></i> تنزيل PNG</button></div>
        </div>
        <div class="esp-tool-preview">
          <div class="esp-preview-label"><i class="fas fa-desktop"></i> معاينة 1920×1080</div>
          <div class="esp-canvas-box" style="background:#111"><canvas id="so_cv" style="width:100%"></canvas></div>
        </div>
      </div>`);

    case 'team-logo': return W(`
      <div class="esp-tool-grid">
        <div class="esp-tool-sidebar">
          <div class="esp-tool-block">
            <div class="esp-tool-block-title"><i class="fas fa-shapes"></i> الشكل</div>
            <div class="esp-style-grid" id="tl_shapes">
              ${[['🛡️ درع','sh'],['⬡ سداسي','hx'],['⭕ دائرة','ci'],['⭐ نجمة','st'],['◇ ماسة','di']].map(([n,v],i)=>`<button class="esp-style-btn${!i?' active':''}" onclick="tlShape='${v}';document.querySelectorAll('#tl_shapes .esp-style-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');tlRender()">${n}</button>`).join('')}
            </div>
          </div>
          <div class="esp-tool-block">
            <div class="esp-tool-block-title"><i class="fas fa-font"></i> بيانات الفريق</div>
            <div class="form-group"><label>اسم الفريق</label><input class="service-input" id="tl_name" value="Team Elite" oninput="tlRender()"></div>
            <div class="form-group"><label>الاختصار (3-4 أحرف)</label><input class="service-input" id="tl_abbr" value="ELT" maxlength="4" oninput="tlRender()"></div>
            <div class="form-group"><label>الشعار الفرعي</label><input class="service-input" id="tl_tag" value="PUBG Mobile Esports" oninput="tlRender()"></div>
          </div>
          <div class="esp-tool-block">
            <div class="esp-tool-block-title"><i class="fas fa-palette"></i> الألوان</div>
            <div class="esp-color-row">
              <div><label style="font-size:.7rem;color:#667788;display:block;margin-bottom:.25rem">رئيسي</label><input type="color" class="esp-color-inp" id="tl_c1" value="#00e5ff" oninput="tlRender()"></div>
              <div><label style="font-size:.7rem;color:#667788;display:block;margin-bottom:.25rem">خلفية</label><input type="color" class="esp-color-inp" id="tl_c2" value="#0a1628" oninput="tlRender()"></div>
              <div><label style="font-size:.7rem;color:#667788;display:block;margin-bottom:.25rem">نص</label><input type="color" class="esp-color-inp" id="tl_tc" value="#ffffff" oninput="tlRender()"></div>
            </div>
          </div>
          <div class="esp-dl-row"><button class="esp-dl-btn" onclick="tlRender();tlDl()"><i class="fas fa-download"></i> PNG شفاف</button></div>
        </div>
        <div class="esp-tool-preview">
          <div class="esp-preview-label"><i class="fas fa-eye"></i> معاينة الشعار</div>
          <div class="esp-canvas-box" style="min-height:280px"><canvas id="tl_cv" style="max-width:100%;max-height:380px"></canvas></div>
        </div>
      </div>`);

    case 'tournament-banner': return W(`
      <div class="esp-tool-grid">
        <div class="esp-tool-sidebar">
          <div class="esp-tool-block">
            <div class="esp-tool-block-title"><i class="fas fa-trophy"></i> بيانات البطولة</div>
            <div class="form-group"><label>اسم البطولة</label><input class="service-input" id="tb_title" value="PUBG Mobile Championship 2025" oninput="tbRender()"></div>
            <div class="form-group"><label>التاريخ</label><input class="service-input" id="tb_date" value="15 - 20 يناير 2025" oninput="tbRender()"></div>
            <div class="form-group"><label>الجائزة</label><input class="service-input" id="tb_prize" value="🏆 الجائزة: 500,000 د.ع" oninput="tbRender()"></div>
            <div class="form-group"><label>المنظم</label><input class="service-input" id="tb_org" value="Eyad_Eyad12 Esports" oninput="tbRender()"></div>
          </div>
          <div class="esp-tool-block">
            <div class="esp-tool-block-title"><i class="fas fa-image"></i> النمط</div>
            <div class="esp-style-grid" id="tb_styles">
              ${[['💻 Cyber','cy'],['🏆 Esport','es'],['🔥 Fire','fi'],['🌙 Night','ni'],['👑 Gold','gd']].map(([n,v],i)=>`<button class="esp-style-btn${!i?' active':''}" onclick="tbStyle='${v}';document.querySelectorAll('#tb_styles .esp-style-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');tbRender()">${n}</button>`).join('')}
            </div>
          </div>
          <div class="esp-tool-block">
            <div class="esp-tool-block-title"><i class="fas fa-expand-alt"></i> الحجم</div>
            <div class="esp-size-row" id="tb_sizes">
              ${[['1920×1080','1920x1080'],['1280×720','1280x720'],['1080×1350','1080x1350']].map(([n,v],i)=>`<button class="esp-size-btn${!i?' active':''}" onclick="tbSize='${v}';document.querySelectorAll('#tb_sizes .esp-size-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');tbRender()">${n}</button>`).join('')}
            </div>
          </div>
          <div class="esp-dl-row"><button class="esp-dl-btn" onclick="tbRender();tbDl()"><i class="fas fa-download"></i> تنزيل PNG</button></div>
        </div>
        <div class="esp-tool-preview">
          <div class="esp-preview-label"><i class="fas fa-eye"></i> معاينة البنر</div>
          <div class="esp-canvas-box"><canvas id="tb_cv" style="width:100%"></canvas></div>
        </div>
      </div>`);

    case 'player-stats': return W(`
      <div class="esp-tool-grid">
        <div class="esp-tool-sidebar">
          <div class="esp-tool-block">
            <div class="esp-tool-block-title"><i class="fas fa-user-circle"></i> اللاعب</div>
            ${[['ps_name','الاسم','Eyad_Eyad12'],['ps_tier','الرتبة','Conqueror'],['ps_uid','Player ID','12345678'],['ps_server','السيرفر','MENA']].map(([id,lbl,ph])=>`<div class="form-group"><label>${lbl}</label><input class="service-input" id="${id}" value="${ph}" oninput="psRender()"></div>`).join('')}
          </div>
          <div class="esp-tool-block">
            <div class="esp-tool-block-title"><i class="fas fa-chart-bar"></i> الإحصائيات</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:.4rem">
              ${[['ps_kd','K/D','8.5'],['ps_wr','Win %','45%'],['ps_kills','Max Kills','32'],['ps_matches','Matches','850'],['ps_dmg','Avg DMG','1240'],['ps_top10','Top 10%','78%']].map(([id,lbl,ph])=>`<div class="form-group"><label style="font-size:.72rem">${lbl}</label><input class="service-input" id="${id}" value="${ph}" oninput="psRender()"></div>`).join('')}
            </div>
          </div>
          <div class="esp-tool-block">
            <div class="esp-tool-block-title"><i class="fas fa-palette"></i> الثيم</div>
            <div class="esp-style-grid" id="ps_themes">
              ${[['💻 Cyber','cy'],['👑 Gold','gd'],['❤️ Red','rd'],['🌙 Night','ni']].map(([n,v],i)=>`<button class="esp-style-btn${!i?' active':''}" onclick="psTheme='${v}';document.querySelectorAll('#ps_themes .esp-style-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');psRender()">${n}</button>`).join('')}
            </div>
          </div>
          <div class="esp-dl-row"><button class="esp-dl-btn" onclick="psRender();psDl()"><i class="fas fa-download"></i> تنزيل PNG</button></div>
        </div>
        <div class="esp-tool-preview">
          <div class="esp-preview-label"><i class="fas fa-id-card"></i> بطاقة الإحصائيات</div>
          <div class="esp-canvas-box"><canvas id="ps_cv" style="width:100%"></canvas></div>
        </div>
      </div>`);

    case 'highlight-maker': return W(`
      <div class="esp-tool-grid">
        <div class="esp-tool-sidebar">
          <div class="esp-tool-block">
            <div class="esp-tool-block-title"><i class="fas fa-plus-circle"></i> إضافة لحظة</div>
            <div class="form-group"><label>الوقت (مثال: 12:34)</label><input class="service-input" id="hl_time" placeholder="00:00"></div>
            <div class="form-group"><label>الفئة</label>
              <select class="service-input" id="hl_cat">
                <option>💀 قتلة مميزة</option><option>🔥 Clutch رهيب</option>
                <option>🏆 فوز دائرة</option><option>💊 إنقاذ زميل</option>
                <option>🎯 سناي من بعيد</option><option>💣 تفجير مركبة</option>
                <option>🚗 مطاردة أو هروب</option><option>⭐ لحظة مميزة</option>
              </select>
            </div>
            <div class="form-group"><label>ملاحظة</label><input class="service-input" id="hl_note" placeholder="وصف اللحظة..."></div>
            <button class="esp-dl-btn" onclick="hlAdd()" style="margin-top:.3rem"><i class="fas fa-plus"></i> إضافة</button>
          </div>
          <div class="esp-tool-block">
            <div class="form-group"><label>عنوان البث</label><input class="service-input" id="hl_title" value="Eyad_Eyad12 — PUBG Highlights"></div>
          </div>
          <div class="esp-dl-row">
            <button class="esp-dl-btn" onclick="hlExportTxt()"><i class="fas fa-file-alt"></i> TXT</button>
            <button class="esp-dl-btn sec" onclick="hlExportHtml()"><i class="fas fa-code"></i> HTML</button>
          </div>
        </div>
        <div class="esp-tool-preview">
          <div class="esp-preview-label"><i class="fas fa-list-ol"></i> اللحظات (<span id="hl_count">0</span>)</div>
          <div class="esp-hl-list" id="hl_list"><div style="color:#445566;text-align:center;padding:2.5rem;font-size:.9rem">أضف أول لحظة 🎮</div></div>
        </div>
      </div>`);

    case 'stream-bg': return W(`
      <div class="esp-tool-grid">
        <div class="esp-tool-sidebar">
          <div class="esp-tool-block">
            <div class="esp-tool-block-title"><i class="fas fa-image"></i> الثيم</div>
            <div class="esp-style-grid" id="bg_themes">
              ${[['🌌 فضاء','sp'],['🌿 أدغال','jg'],['🏜️ صحراء','ds'],['🌨️ ثلج','sn'],['🔥 نار','fr'],['🌙 ليل','ni'],['💻 سايبر','cy'],['🌆 مدينة','ct']].map(([n,v],i)=>`<button class="esp-style-btn${!i?' active':''}" onclick="bgTheme='${v}';document.querySelectorAll('#bg_themes .esp-style-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');bgRender()">${n}</button>`).join('')}
            </div>
          </div>
          <div class="esp-tool-block">
            <div class="esp-tool-block-title"><i class="fas fa-magic"></i> التأثير</div>
            <div class="esp-style-grid" id="bg_fx">
              ${[['بدون','no'],['جزيئات','pt'],['شبكة','gr'],['موجات','wv'],['نجوم','st']].map(([n,v],i)=>`<button class="esp-style-btn${!i?' active':''}" onclick="bgFx='${v}';document.querySelectorAll('#bg_fx .esp-style-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');bgRender()">${n}</button>`).join('')}
            </div>
          </div>
          <div class="esp-tool-block">
            <div class="form-group"><label>نص البث</label><input class="service-input" id="bg_text" placeholder="Eyad_Eyad12 Live" oninput="bgRender()"></div>
            <div class="form-group"><label>اللعبة</label><input class="service-input" id="bg_game" value="PUBG Mobile" oninput="bgRender()"></div>
          </div>
          <div class="esp-tool-block">
            <div class="esp-tool-block-title"><i class="fas fa-expand"></i> الدقة</div>
            <div class="esp-size-row" id="bg_sizes">
              ${[['1080p','1920x1080'],['1440p','2560x1440'],['4K','3840x2160']].map(([n,v],i)=>`<button class="esp-size-btn${!i?' active':''}" onclick="bgSz='${v}';document.querySelectorAll('#bg_sizes .esp-size-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');bgRender()">${n}</button>`).join('')}
            </div>
          </div>
          <div class="esp-dl-row"><button class="esp-dl-btn" onclick="bgRender();bgDl()"><i class="fas fa-download"></i> تنزيل PNG</button></div>
        </div>
        <div class="esp-tool-preview">
          <div class="esp-preview-label"><i class="fas fa-desktop"></i> معاينة الخلفية</div>
          <div class="esp-canvas-box"><canvas id="bg_cv" style="width:100%"></canvas></div>
        </div>
      </div>`);

    case 'transitions': return W(`
      <div class="esp-tool-grid">
        <div class="esp-tool-sidebar">
          <div class="esp-tool-block">
            <div class="esp-tool-block-title"><i class="fas fa-film"></i> نوع الانتقال</div>
            <div class="esp-style-grid" id="tr_types">
              ${[['⚡ Flash','fl'],['🌊 Wave','wv'],['💥 Blast','bl'],['↔️ Slide','sl'],['🔄 Spin','sp'],['📺 Glitch','gl'],['🌑 Fade','fd'],['✨ Particles','pt']].map(([n,v],i)=>`<button class="esp-style-btn${!i?' active':''}" onclick="trType='${v}';document.querySelectorAll('#tr_types .esp-style-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');trRender(0.5)">${n}</button>`).join('')}
            </div>
          </div>
          <div class="esp-tool-block">
            <div class="esp-tool-block-title"><i class="fas fa-palette"></i> الألوان</div>
            <div class="esp-color-row">
              <div><label style="font-size:.7rem;color:#667788;display:block;margin-bottom:.25rem">لون 1</label><input type="color" class="esp-color-inp" id="tr_c1" value="#00e5ff" oninput="trRender(0.5)"></div>
              <div><label style="font-size:.7rem;color:#667788;display:block;margin-bottom:.25rem">لون 2</label><input type="color" class="esp-color-inp" id="tr_c2" value="#0a1628" oninput="trRender(0.5)"></div>
              <div><label style="font-size:.7rem;color:#667788;display:block;margin-bottom:.25rem">خلفية</label><input type="color" class="esp-color-inp" id="tr_bg" value="#000000" oninput="trRender(0.5)"></div>
            </div>
          </div>
          <div class="esp-tool-block">
            <div class="esp-tool-block-title"><i class="fas fa-expand-alt"></i> الحجم</div>
            <div class="esp-size-row" id="tr_sizes">
              ${[['1920×1080','1920x1080'],['1280×720','1280x720']].map(([n,v],i)=>`<button class="esp-size-btn${!i?' active':''}" onclick="trSz='${v}';document.querySelectorAll('#tr_sizes .esp-size-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');trRender(0.5)">${n}</button>`).join('')}
            </div>
          </div>
          <div class="esp-dl-row">
            <button class="esp-dl-btn" onclick="trAnimate()"><i class="fas fa-play"></i> تشغيل</button>
            <button class="esp-dl-btn sec" onclick="trDl()"><i class="fas fa-download"></i> PNG</button>
          </div>
          <div class="esp-tr-note">💡 استخدم هذا الانتقال في OBS كـ <b>Stinger Transition</b></div>
        </div>
        <div class="esp-tool-preview">
          <div class="esp-preview-label"><i class="fas fa-film"></i> معاينة الانتقال</div>
          <div class="esp-canvas-box" style="background:#111"><canvas id="tr_cv" style="width:100%"></canvas></div>
        </div>
      </div>`);

    default: return '<p style="color:#bbb;text-align:center;padding:2rem">الخدمة غير متوفرة</p>';
    }
}

/* ════ 1. LEADERBOARD ════ */
let lbTeams = [
    {name:'Team Alpha',kills:24,pts:120},{name:'Team Beta',kills:18,pts:98},
    {name:'Team Gamma',kills:15,pts:85}, {name:'Team Delta',kills:12,pts:72},
];
function lbInit(){ lbDOM(); lbRender(); }
function lbDOM(){
    const el=document.getElementById('lb_rows'); if(!el)return;
    el.innerHTML=lbTeams.map((t,i)=>`
      <div class="esp-lb-row">
        <span class="esp-lb-num">${i+1}</span>
        <input class="esp-lb-inp" style="flex:2;min-width:0" value="${t.name}" oninput="lbTeams[${i}].name=this.value;lbRender()">
        <input class="esp-lb-inp" style="width:44px" type="number" value="${t.kills}" oninput="lbTeams[${i}].kills=+this.value;lbRender()">
        <input class="esp-lb-inp" style="width:50px" type="number" value="${t.pts}" oninput="lbTeams[${i}].pts=+this.value;lbRender()">
        <button class="esp-remove-btn" onclick="lbTeams.splice(${i},1);lbDOM();lbRender()">✕</button>
      </div>`).join('');
}
function lbAdd(){ if(lbTeams.length>=16)return; lbTeams.push({name:`Team ${String.fromCharCode(65+lbTeams.length)}`,kills:0,pts:0}); lbDOM(); lbRender(); }
function lbRender(){
    const sorted=[...lbTeams].sort((a,b)=>b.pts-a.pts||b.kills-a.kills);
    const bg=_v('lb_bg')||'#030d1e', hdr=_v('lb_hdr')||'#00e5ff', acc=_v('lb_acc')||'#ffd700';
    const title=_v('lb_title')||'PUBG Championship';
    const rH=54, topH=120, W=900, H=topH+sorted.length*rH+50;
    const ctx=_ctx('lb_cv',W,H); if(!ctx)return;
    const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,bg); g.addColorStop(1,_hex(bg,.85)+')'.replace('rgba','rgb').split(')')[0]+'00)');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
    // Diagonal stripes
    ctx.strokeStyle=_hex(hdr,.04); ctx.lineWidth=1;
    for(let i=-H;i<W+H;i+=55){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i+H,H);ctx.stroke();}
    // Top bar
    const hg=ctx.createLinearGradient(0,0,W,topH); hg.addColorStop(0,_hex(hdr,.25)); hg.addColorStop(1,_hex(hdr,0));
    ctx.fillStyle=hg; ctx.fillRect(0,0,W,topH);
    ctx.strokeStyle=hdr; ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(0,topH);ctx.lineTo(W,topH);ctx.stroke();
    // Title
    ctx.shadowColor=hdr; ctx.shadowBlur=20;
    ctx.fillStyle=hdr; ctx.font='bold 32px "Segoe UI",Arial'; ctx.textAlign='center';
    ctx.fillText('🏆 '+title,W/2,52);
    ctx.shadowBlur=0;
    ctx.fillStyle=_hex('#fff',.45); ctx.font='14px "Segoe UI",Arial';
    ctx.fillText('جدول الترتيب الرسمي — PUBG Mobile',W/2,82);
    // Headers
    ctx.fillStyle=_hex(hdr,.7); ctx.font='bold 13px "Segoe UI",Arial';
    ctx.textAlign='center';
    [[50,'#'],[220,'الفريق'],[560,'قتلات'],[700,'نقاط'],[830,'التقدم']].forEach(([x,h])=>ctx.fillText(h,x,topH+18));
    ctx.strokeStyle=_hex(hdr,.2); ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(20,topH+24);ctx.lineTo(W-20,topH+24);ctx.stroke();
    // Rows
    sorted.forEach((t,i)=>{
        const y=topH+28+i*rH, cx2=W/2;
        const medals=['🥇','🥈','🥉'];
        const rowBg=i<3?[_hex(acc,.12),_hex('#c0c0c0',.08),_hex('#cd7f32',.08)][i]:(i%2===0?_hex('#fff',.03):'transparent');
        ctx.fillStyle=rowBg; ctx.fillRect(0,y,W,rH);
        if(i===0){ctx.fillStyle=_hex(acc,.08);ctx.fillRect(0,y,4,rH);}
        // Rank
        ctx.font=i<3?'22px serif':'bold 15px "Segoe UI"';
        ctx.textAlign='center'; ctx.fillStyle='#fff';
        ctx.fillText(i<3?medals[i]:`#${i+1}`,50,y+rH/2+7);
        // Name
        ctx.textAlign='left'; ctx.font=`${i<3?'bold ':''} 16px "Segoe UI",Arial`;
        ctx.fillStyle=i===0?acc:'#fff';
        ctx.fillText(t.name,80,y+rH/2+7);
        // Kills
        ctx.textAlign='center'; ctx.fillStyle='#ff6b6b'; ctx.font='bold 14px "Segoe UI"';
        ctx.fillText(t.kills,560,y+rH/2+7);
        // Points
        ctx.fillStyle=i<3?acc:'#ccc'; ctx.font=`bold ${i<3?18:15}px "Segoe UI"`;
        ctx.fillText(t.pts,700,y+rH/2+7);
        // Progress bar
        const maxP=sorted[0]?.pts||1, bx=750,bw=100,bh=8,by2=y+rH/2-4;
        ctx.fillStyle=_hex('#fff',.08); ctx.beginPath(); ctx.roundRect(bx,by2,bw,bh,4); ctx.fill();
        ctx.fillStyle=i===0?acc:_hex(hdr,.7); ctx.beginPath(); ctx.roundRect(bx,by2,(t.pts/maxP)*bw,bh,4); ctx.fill();
        // Divider
        ctx.strokeStyle=_hex('#fff',.05); ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(20,y+rH-0.5);ctx.lineTo(W-20,y+rH-0.5);ctx.stroke();
    });
    // Footer
    ctx.fillStyle=_hex(hdr,.4); ctx.font='11px "Segoe UI"'; ctx.textAlign='center';
    ctx.fillText('Eyad_Eyad12 Esports • eyad-eyad12.com',W/2,H-14);
    ctx.strokeStyle=hdr; ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(0,H-2);ctx.lineTo(W*(sorted[0]?.pts||0)/(sorted.reduce((a,t)=>Math.max(a,t.pts),1)),H-2);ctx.stroke();
}
function lbDl(){ const c=document.getElementById('lb_cv'); if(c) _dl(c,'leaderboard'); }

/* ════ 2. PUBG MAP — نظام كامل ════ */
let mapTool='pen', mapColor='#ff4444', mapHistory=[], mapDrw=false;
let mapLX=0, mapLY=0, mapSnap=null;
let mapScale=1, mapPanX=0, mapPanY=0;
let mapImgW=0, mapImgH=0, mapBgImg=null;
let mapEntities=[], mapMergeLayers=[];
let mapEntityTool=null, mapDragIdx=-1, mapMrgIdx=-1;
let mapDragOX=0, mapDragOY=0, mapMrgOX=0, mapMrgOY=0;

const MAP_ICONS={
    igl:{emoji:'👑',label:'IGL',color:'#dc143c'},
    support:{emoji:'🛡️',label:'Support',color:'#00a8ff'},
    frager:{emoji:'⚔️',label:'Fragger',color:'#ff6b00'},
    scout:{emoji:'🔭',label:'Scout',color:'#00e5ff'},
    freman:{emoji:'🦅',label:'Free Man',color:'#9c27b0'},
    enemy:{emoji:'💀',label:'عدو',color:'#ff1744'},
    vehicle:{emoji:'🚗',label:'سيارة',color:'#90a4ae'},
    boat:{emoji:'⛵',label:'قارب',color:'#42a5f5'},
    airdrop:{emoji:'📦',label:'Airdrop',color:'#ce93d8'},
    zone:{emoji:'⭕',label:'زون',color:'#00e676'},
    marker:{emoji:'📍',label:'علامة',color:'#ff3b3b'}
};

function mapApplyTransform(){
    const b=document.getElementById('mapPanBox');
    if(b) b.style.transform=`translate(${mapPanX}px,${mapPanY}px) scale(${mapScale})`;
}
function mapZoom(f){
    const vp=document.getElementById('mapViewport'); if(!vp) return;
    const vw=vp.offsetWidth,vh=vp.offsetHeight;
    const ns=Math.min(Math.max(mapScale*f,.2),10);
    mapPanX=vw/2-(vw/2-mapPanX)*(ns/mapScale);
    mapPanY=vh/2-(vh/2-mapPanY)*(ns/mapScale);
    mapScale=ns; mapApplyTransform(); mapRedrawEntities(); mapRedrawBg();
}
function mapZoomReset(){
    const vp=document.getElementById('mapViewport'); if(!vp||!mapImgW) return;
    mapScale=vp.offsetWidth/mapImgW; mapPanX=0; mapPanY=0;
    mapApplyTransform(); mapRedrawEntities(); mapRedrawBg();
}

function mapDrawEntity(ctx,en){
    const S=mapScale||1, fs=Math.round(30/S), lfs=Math.round(10/S);
    ctx.save();
    ctx.font=fs+'px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.shadowColor='rgba(0,0,0,.95)'; ctx.shadowBlur=Math.round(5/S);
    ctx.fillText(en.emoji,en.x,en.y); ctx.shadowBlur=0;
    ctx.font='bold '+lfs+'px monospace'; ctx.textBaseline='top';
    ctx.fillStyle=en.color; ctx.strokeStyle='rgba(0,0,0,.95)';
    ctx.lineWidth=Math.max(1,2/S);
    ctx.strokeText(en.label,en.x,en.y+fs*.6); ctx.fillText(en.label,en.x,en.y+fs*.6);
    if(en.selected){
        ctx.strokeStyle='#ffd700'; ctx.lineWidth=Math.max(1,2/S);
        ctx.setLineDash([Math.round(4/S),Math.round(3/S)]);
        ctx.beginPath(); ctx.arc(en.x,en.y,Math.round(20/S),0,Math.PI*2); ctx.stroke();
        ctx.setLineDash([]);
    }
    ctx.restore();
}

function mapRedrawEntities(){
    const ec=document.getElementById('map_ec'); if(!ec) return;
    const ctx=ec.getContext('2d'); ctx.clearRect(0,0,ec.width,ec.height);
    mapEntities.forEach(en=>mapDrawEntity(ctx,en));
}

function mapRedrawBg(){
    const bg=document.getElementById('map_bg'); if(!bg||!mapBgImg) return;
    const ctx=bg.getContext('2d'); ctx.clearRect(0,0,bg.width,bg.height);
    ctx.drawImage(mapBgImg,0,0,bg.width,bg.height);
    mapMergeLayers.forEach(l=>{
        if(!l.imgObj||!l.imgObj.complete) return;
        ctx.save(); ctx.globalAlpha=.9;
        ctx.drawImage(l.imgObj,l.x,l.y,l.w,l.h);
        ctx.globalAlpha=1;
        ctx.strokeStyle=l.selected?'#ffd700':'#00e5ff';
        ctx.lineWidth=Math.max(1,2/mapScale);
        if(l.selected){ctx.setLineDash([Math.round(5/mapScale),Math.round(3/mapScale)]);}
        ctx.strokeRect(l.x,l.y,l.w,l.h); ctx.setLineDash([]);
        ctx.font='bold '+Math.round(11/mapScale)+'px monospace';
        ctx.fillStyle='#00e5ff'; ctx.textAlign='right';
        ctx.fillText(l.name,l.x+l.w-Math.round(3/mapScale),l.y+Math.round(13/mapScale));
        ctx.restore();
    });
}

function mapLoadBg(src){
    const bg=document.getElementById('map_bg'),dc=document.getElementById('map_cv'),ec=document.getElementById('map_ec');
    const vp=document.getElementById('mapViewport'); if(!bg||!vp) return;
    const img=new Image();
    img.onload=function(){
        mapBgImg=img;
        const vw=vp.offsetWidth||600, nw=img.naturalWidth||vw, nh=img.naturalHeight||vw;
        [bg,dc,ec].forEach(c=>{if(c){c.width=nw;c.height=nh;}});
        mapImgW=nw; mapImgH=nh;
        mapRedrawBg(); if(dc) dc.getContext('2d').clearRect(0,0,nw,nh);
        mapEntities=[]; mapHistory=[]; mapRedrawEntities();
        mapScale=vw/nw; mapPanX=0; mapPanY=0; mapApplyTransform();
    };
    img.onerror=function(){
        const vw=vp.offsetWidth||600;
        [bg,dc,ec].forEach(c=>{if(c){c.width=vw;c.height=500;}});
        mapImgW=vw; mapImgH=500;
        const ctx=bg.getContext('2d'); ctx.fillStyle='#0a1f0a'; ctx.fillRect(0,0,vw,500);
        ctx.fillStyle='rgba(255,255,255,.2)'; ctx.font='bold 18px monospace'; ctx.textAlign='center';
        ctx.fillText('⚠️ الصورة غير موجودة: '+src,vw/2,250);
        mapScale=1; mapPanX=0; mapPanY=0; mapApplyTransform();
    };
    img.src=src;
}

function mapGetPos(e,cv){
    const r=cv.getBoundingClientRect(), src=e.touches?e.touches[0]:e;
    return{x:(src.clientX-r.left)*(cv.width/r.width), y:(src.clientY-r.top)*(cv.height/r.height)};
}
function mapFindEntity(x,y){
    const hr=Math.round(28/mapScale);
    for(let i=mapEntities.length-1;i>=0;i--){const e=mapEntities[i],dx=e.x-x,dy=e.y-y;if(Math.sqrt(dx*dx+dy*dy)<=hr)return i;}
    return -1;
}
function mapFindMerge(x,y){
    for(let i=mapMergeLayers.length-1;i>=0;i--){const l=mapMergeLayers[i];if(x>=l.x&&x<=l.x+l.w&&y>=l.y&&y<=l.y+l.h)return i;}
    return -1;
}

function mapSwitchPointers(){
    const dc=document.getElementById('map_cv');
    const ec=document.getElementById('map_ec');
    if(!dc||!ec) return;
    const isEntityMode = (mapTool==='move'||mapTool==='delete');
    dc.style.pointerEvents = isEntityMode ? 'none' : 'auto';
    ec.style.pointerEvents = isEntityMode ? 'auto' : 'none';
    const vp=document.getElementById('mapViewport');
    if(vp) vp.style.cursor = isEntityMode ? 'default' : 'crosshair';
}
function mapInit(){
    mapEntities=[]; mapMergeLayers=[]; mapHistory=[];
    mapTool='pen'; mapEntityTool=null;
    const vp=document.getElementById('mapViewport'); if(!vp) return;
    setTimeout(mapSwitchPointers,100);
    mapLoadBg('maps/erangel.png');

    // Pan
    let panA=false,pSX=0,pSY=0,pOX=0,pOY=0;
    vp.addEventListener('mousedown',e=>{
        if(e.button===1||e.button===2||e.shiftKey){panA=true;pSX=e.clientX;pSY=e.clientY;pOX=mapPanX;pOY=mapPanY;vp.style.cursor='grab';e.preventDefault();}
    });
    vp.addEventListener('mousemove',e=>{if(!panA)return;mapPanX=pOX+(e.clientX-pSX);mapPanY=pOY+(e.clientY-pSY);mapApplyTransform();});
    vp.addEventListener('mouseup',  ()=>{panA=false;vp.style.cursor='crosshair';});
    vp.addEventListener('mouseleave',()=>{panA=false;vp.style.cursor='crosshair';});
    vp.addEventListener('contextmenu',e=>e.preventDefault());
    vp.addEventListener('wheel',e=>{
        e.preventDefault();
        const f=e.deltaY<0?1.15:.87, r=vp.getBoundingClientRect();
        const mx=e.clientX-r.left,my=e.clientY-r.top;
        const ns=Math.min(Math.max(mapScale*f,.2),10);
        mapPanX=mx-(mx-mapPanX)*(ns/mapScale); mapPanY=my-(my-mapPanY)*(ns/mapScale);
        mapScale=ns; mapApplyTransform(); mapRedrawEntities(); mapRedrawBg();
    },{passive:false});

    // Entity canvas events
    const ec=document.getElementById('map_ec');
    if(ec){
        ec.addEventListener('mousedown',e=>{
            if(e.shiftKey||e.button>0) return;
            const {x,y}=mapGetPos(e,ec);
            if(mapTool==='move'){
                const mi=mapFindMerge(x,y);
                if(mi>=0){mapMergeLayers.forEach(l=>l.selected=false);mapMergeLayers[mi].selected=true;mapMrgIdx=mi;mapMrgOX=x-mapMergeLayers[mi].x;mapMrgOY=y-mapMergeLayers[mi].y;mapRedrawBg();return;}
                const idx=mapFindEntity(x,y);
                if(idx>=0){mapEntities.forEach(en=>en.selected=false);mapEntities[idx].selected=true;mapDragIdx=idx;mapDragOX=x-mapEntities[idx].x;mapDragOY=y-mapEntities[idx].y;mapRedrawEntities();}
                return;
            }
            if(mapTool==='delete'){
                const mi=mapFindMerge(x,y);
                if(mi>=0){mapMergeLayers.splice(mi,1);mapRedrawBg();return;}
                const idx=mapFindEntity(x,y);
                if(idx>=0){mapEntities.splice(idx,1);mapRedrawEntities();}
            }
        });
        ec.addEventListener('mousemove',e=>{
            if(e.shiftKey||e.button>0) return;
            const {x,y}=mapGetPos(e,ec);
            if(mapTool==='move'){
                if(mapMrgIdx>=0){mapMergeLayers[mapMrgIdx].x=x-mapMrgOX;mapMergeLayers[mapMrgIdx].y=y-mapMrgOY;mapRedrawBg();return;}
                if(mapDragIdx>=0){mapEntities[mapDragIdx].x=x-mapDragOX;mapEntities[mapDragIdx].y=y-mapDragOY;mapRedrawEntities();}
            }
        });
        const stopEC=()=>{
            if(mapDragIdx>=0){mapEntities[mapDragIdx].selected=false;mapRedrawEntities();}
            if(mapMrgIdx>=0){mapMergeLayers[mapMrgIdx].selected=false;mapRedrawBg();}
            mapDragIdx=-1; mapMrgIdx=-1;
        };
        ec.addEventListener('mouseup',stopEC); ec.addEventListener('mouseleave',stopEC);
    }

    // Draw canvas events
    const dc=document.getElementById('map_cv');
    if(dc){
        const saveH=()=>{mapHistory.push(dc.toDataURL());if(mapHistory.length>40)mapHistory.shift();};
        dc.addEventListener('mousedown',e=>{
            if(e.shiftKey||e.button>0) return;
            if(['move','delete'].includes(mapTool)) return;
            const {x,y}=mapGetPos(e,dc); const ctx=dc.getContext('2d'); const S=mapScale||1;
            if(mapTool==='__entity__'&&mapEntityTool){
                const info=MAP_ICONS[mapEntityTool];
                mapEntities.push({emoji:info.emoji,label:info.label,color:info.color,x,y,selected:false});
                mapRedrawEntities(); return;
            }
            if(mapTool==='text'){
                const t=prompt('النص:'); if(!t) return; saveH();
                const fs=Math.round((+document.getElementById('mapBrush')?.value*3+12)/S);
                ctx.save(); ctx.font='bold '+fs+'px Tahoma'; ctx.fillStyle=mapColor;
                ctx.strokeStyle='rgba(0,0,0,.85)'; ctx.lineWidth=Math.max(1,2/S);
                ctx.strokeText(t,x,y); ctx.fillText(t,x,y); ctx.restore(); return;
            }
            saveH(); mapDrw=true; mapLX=x; mapLY=y;
            if(mapTool==='pen'||mapTool==='eraser'){ctx.beginPath();ctx.moveTo(x,y);}
            else mapSnap=ctx.getImageData(0,0,dc.width,dc.height);
        });
        dc.addEventListener('mousemove',e=>{
            if(!mapDrw) return;
            const {x,y}=mapGetPos(e,dc); const ctx=dc.getContext('2d');
            const S=mapScale||1, br=+document.getElementById('mapBrush')?.value||3;
            const lw=Math.max(.5,br/S);
            ctx.lineCap='round'; ctx.lineJoin='round';
            if(mapTool==='pen'){ctx.strokeStyle=mapColor;ctx.lineWidth=lw;ctx.lineTo(x,y);ctx.stroke();}
            else if(mapTool==='eraser'){ctx.globalCompositeOperation='destination-out';ctx.lineWidth=lw*5;ctx.lineTo(x,y);ctx.stroke();ctx.globalCompositeOperation='source-over';}
            else if(['arrow','circle','rect'].includes(mapTool)){
                ctx.putImageData(mapSnap,0,0);
                ctx.strokeStyle=mapColor;ctx.fillStyle=mapColor;ctx.lineWidth=lw;ctx.lineCap='round';
                if(mapTool==='rect'){ctx.beginPath();ctx.strokeRect(mapLX,mapLY,x-mapLX,y-mapLY);}
                else if(mapTool==='circle'){const rx=Math.abs(x-mapLX)/2,ry=Math.abs(y-mapLY)/2,cx=mapLX+(x-mapLX)/2,cy=mapLY+(y-mapLY)/2;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.stroke();}
                else if(mapTool==='arrow'){ctx.beginPath();ctx.moveTo(mapLX,mapLY);ctx.lineTo(x,y);ctx.stroke();const a=Math.atan2(y-mapLY,x-mapLX),hl=lw*6;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-hl*Math.cos(a-.42),y-hl*Math.sin(a-.42));ctx.lineTo(x-hl*Math.cos(a+.42),y-hl*Math.sin(a+.42));ctx.closePath();ctx.fill();}
            }
        });
        const stopDC=()=>{mapDrw=false;};
        dc.addEventListener('mouseup',stopDC); dc.addEventListener('mouseleave',stopDC);
        dc.addEventListener('touchstart',e=>{e.preventDefault();dc.dispatchEvent(new MouseEvent('mousedown',{clientX:e.touches[0].clientX,clientY:e.touches[0].clientY}));},{passive:false});
        dc.addEventListener('touchmove', e=>{e.preventDefault();dc.dispatchEvent(new MouseEvent('mousemove', {clientX:e.touches[0].clientX,clientY:e.touches[0].clientY}));},{passive:false});
        dc.addEventListener('touchend',stopDC);
    }
}

function mapLoadLoc(btn,src,name){
    document.querySelectorAll('#mapLocPicker .esp-map-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    mapMergeLayers=[]; mapEntities=[]; mapHistory=[];
    mapLoadBg(src);
    setTimeout(mapSwitchPointers,200);
}
function mapSetTool(btn,tool){
    mapTool=tool; mapEntityTool=null; mapSwitchPointers();
    document.querySelectorAll('[id^=mt-]').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const hints={pen:'✏️ رسم حر',arrow:'➡️ سهم',circle:'⭕ دائرة',rect:'▭ مستطيل',text:'🔤 نص',eraser:'🧹 ممحاة',move:'✋ تحريك — اسحب العنصر أو الخريطة المدموجة',delete:'🗑️ حذف — اضغط على العنصر'};
    const h=document.getElementById('mapHint'); if(h) h.textContent=hints[tool]||tool;
}
function mapSetEntity(btn,type){
    mapEntityTool=type; mapTool='__entity__'; mapSwitchPointers();
    document.querySelectorAll('[id^=mt-]').forEach(b=>b.classList.remove('active'));
    const info=MAP_ICONS[type];
    const h=document.getElementById('mapHint'); if(h) h.textContent=(info?.emoji||'')+'  '+( info?.label||type)+' — اضغط على الخريطة لوضعه';
}
function mapAddMerge(){
    const sel=document.getElementById('mapMergeSel'); if(!sel||!sel.value) return;
    const src=sel.value, name=sel.options[sel.selectedIndex].text;
    const bg=document.getElementById('map_bg'); if(!bg) return;
    const img=new Image();
    img.onload=function(){
        const w=Math.round(bg.width*.45), h=Math.round(img.naturalHeight*(w/img.naturalWidth));
        const off=mapMergeLayers.length*Math.round(bg.width*.04);
        mapMergeLayers.push({imgObj:img,src,name,x:Math.round(bg.width*.27)+off,y:Math.round(bg.height*.27)+off,w,h,selected:false});
        mapRedrawBg();
    };
    img.src=src; sel.value='';
}
function mapClearMerge(){ mapMergeLayers=[]; mapRedrawBg(); }
function mapClearEntities(){ mapEntities=[]; mapRedrawEntities(); }
function mapUndo(){
    const dc=document.getElementById('map_cv'); if(!dc||!mapHistory.length) return;
    const prev=mapHistory.pop(), img=new Image();
    img.onload=()=>{const ctx=dc.getContext('2d');ctx.clearRect(0,0,dc.width,dc.height);ctx.drawImage(img,0,0);};
    img.src=prev;
}
function mapClear(){ const dc=document.getElementById('map_cv'); if(dc){dc.getContext('2d').clearRect(0,0,dc.width,dc.height);mapHistory=[];} }
function mapDl(){
    const bg=document.getElementById('map_bg'),dc=document.getElementById('map_cv'),ec=document.getElementById('map_ec');
    if(!bg) return;
    const exp=document.createElement('canvas'); exp.width=bg.width; exp.height=bg.height;
    const ctx=exp.getContext('2d'); ctx.drawImage(bg,0,0); if(dc)ctx.drawImage(dc,0,0); if(ec)ctx.drawImage(ec,0,0);
    _dl(exp,'pubg-tactical-map');
}

/* ════ 3. CAM FRAME ════ */
let cfStyle='nb', cfSize='512x512';
function cfInit(){ cfRender(); }
function cfRender(){
    const [W,H]=(cfSize||'512x512').split('x').map(Number);
    const name=_v('cf_name')||'STREAMER', sub=_v('cf_sub')||'PUBG Mobile', team=_v('cf_team')||'';
    const c1=_v('cf_c1')||'#00e5ff', c2=_v('cf_c2')||'#0077ff', tc=_v('cf_tc')||'#ffffff';
    const ctx=_ctx('cf_cv',W,H); if(!ctx)return;
    ctx.clearRect(0,0,W,H);
    const cx=W/2,cy=H/2, p=Math.min(W,H);
    const BW=Math.max(5,p*.04), BAR=Math.round(H*.19);
    // Outer glow rings
    [.08,.2,.5].forEach((a,i)=>{
        ctx.shadowColor=c1; ctx.shadowBlur=[30,20,10][i];
        ctx.strokeStyle=_hex(c1,a); ctx.lineWidth=[BW*2.5,BW*1.5,BW][i];
        ctx.beginPath(); ctx.roundRect(BW,BW,W-BW*2,H-BAR-BW*2,Math.min(20,p*.04)); ctx.stroke();
    });
    ctx.shadowBlur=0;
    // Corner accents (L-shapes)
    const CL=p*.09;
    [[BW*1.5,BW*1.5,1,1],[W-BW*1.5,BW*1.5,-1,1],[BW*1.5,H-BAR-BW*1.5,1,-1],[W-BW*1.5,H-BAR-BW*1.5,-1,-1]].forEach(([ox,oy,dx,dy])=>{
        ctx.shadowColor=c2; ctx.shadowBlur=12;
        ctx.strokeStyle=c2; ctx.lineWidth=BW*.8;
        ctx.beginPath(); ctx.moveTo(ox+dx*CL,oy); ctx.lineTo(ox,oy); ctx.lineTo(ox,oy+dy*CL); ctx.stroke();
        ctx.beginPath(); ctx.arc(ox,oy,BW*.5,0,Math.PI*2); ctx.fillStyle=c2; ctx.fill();
    });
    ctx.shadowBlur=0;
    // Decorative dots around frame
    for(let i=0;i<12;i++){
        const angle=(i/12)*Math.PI*2;
        const r2=p*.44;
        const dx2=cx+Math.cos(angle)*r2, dy2=cy-BAR/2+Math.sin(angle)*r2*.92;
        ctx.fillStyle=i%3===0?c1:i%3===1?c2:_hex(c1,.3);
        ctx.shadowColor=c1; ctx.shadowBlur=6;
        ctx.beginPath(); ctx.arc(dx2,dy2,p*.012*(i%2===0?.7:1),0,Math.PI*2); ctx.fill();
    }
    ctx.shadowBlur=0;
    // Style-specific extras
    if(cfStyle==='cy'){ // Circuit lines
        ctx.strokeStyle=_hex(c1,.2); ctx.lineWidth=1;
        [[BW*3,H*.3,W*.15,H*.3,W*.15,H*.2],[W-BW*3,H*.5,W*.85,H*.5,W*.85,H*.4]].forEach(pts=>{
            ctx.beginPath(); for(let i=0;i<pts.length;i+=2) i===0?ctx.moveTo(pts[i],pts[i+1]):ctx.lineTo(pts[i],pts[i+1]); ctx.stroke();
            ctx.beginPath(); ctx.arc(pts[pts.length-2],pts[pts.length-1],3,0,Math.PI*2); ctx.fillStyle=c2; ctx.fill();
        });
    }
    if(cfStyle==='ar'){ // Arabic star ornament at corners
        [[p*.1,p*.1],[W-p*.1,p*.1],[p*.1,H-BAR-p*.1],[W-p*.1,H-BAR-p*.1]].forEach(([ox2,oy2])=>{
            ctx.save(); ctx.translate(ox2,oy2);
            ctx.fillStyle=_hex(c1,.4);
            for(let i=0;i<8;i++){
                ctx.save(); ctx.rotate(i*Math.PI/4);
                ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(p*.03,p*.01); ctx.lineTo(0,p*.05); ctx.lineTo(-p*.03,p*.01); ctx.closePath(); ctx.fill();
                ctx.restore();
            }
            ctx.restore();
        });
    }
    if(cfStyle==='ml'){ // Military crosshairs
        [[p*.08,p*.08],[W-p*.08,p*.08]].forEach(([ox2,oy2])=>{
            const hs=p*.05;
            ctx.strokeStyle='#4a5c3a'; ctx.lineWidth=2;
            ctx.beginPath(); ctx.moveTo(ox2-hs,oy2); ctx.lineTo(ox2+hs,oy2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(ox2,oy2-hs); ctx.lineTo(ox2,oy2+hs); ctx.stroke();
            ctx.beginPath(); ctx.arc(ox2,oy2,hs*.35,0,Math.PI*2); ctx.stroke();
        });
    }
    // Name bar
    const barY=H-BAR;
    const bg=ctx.createLinearGradient(0,barY,W,H);
    bg.addColorStop(0,_hex(c1,.92)); bg.addColorStop(.5,_hex(c2,.88)); bg.addColorStop(1,_hex(c1,.7));
    ctx.fillStyle=bg; ctx.beginPath(); ctx.moveTo(0,barY+2); ctx.lineTo(W,barY); ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill();
    // Scan lines on bar
    for(let y=barY;y<H;y+=5){ ctx.fillStyle='rgba(0,0,0,0.07)'; ctx.fillRect(0,y,W,2); }
    // Diagonal cut on bar left
    ctx.globalCompositeOperation='destination-out';
    ctx.beginPath(); ctx.moveTo(0,barY); ctx.lineTo(W*.22,barY); ctx.lineTo(W*.12,barY+BAR*.38); ctx.lineTo(0,barY+BAR*.38); ctx.closePath(); ctx.fill();
    ctx.globalCompositeOperation='source-over';
    // Name text
    ctx.save();
    ctx.shadowColor='rgba(0,0,0,.9)'; ctx.shadowBlur=6;
    ctx.fillStyle=tc; ctx.textAlign='center';
    ctx.font=`bold ${Math.round(p*.075)}px "Segoe UI",Arial`;
    ctx.fillText((name||'STREAMER').toUpperCase().slice(0,16),W/2,H-BAR*.5+2);
    ctx.font=`${Math.round(p*.043)}px "Segoe UI",Arial`;
    ctx.fillStyle=_hex(tc,.75);
    ctx.fillText((sub||'').slice(0,25),W/2,H-BAR*.16);
    if(team){
        ctx.textAlign='right'; ctx.font=`bold ${Math.round(p*.032)}px "Segoe UI",Arial`;
        ctx.fillStyle=_hex(tc,.55);
        ctx.fillText((team||'').toUpperCase().slice(0,12),W-BW*3,BW*3.5+p*.07);
    }
    ctx.restore();
}
function cfDl(){ cfRender(); const c=document.getElementById('cf_cv'); if(c)_dl(c,'cam-frame-'+cfStyle); }
function cfDlCSS(){
    const c1=_v('cf_c1')||'#00e5ff', c2=_v('cf_c2')||'#0077ff';
    const name=_v('cf_name')||'Streamer';
    const css=`/* Camera Frame CSS — Eyad_Eyad12 */\n.cam-frame {\n  border: 3px solid ${c1};\n  border-radius: 14px;\n  box-shadow: 0 0 20px ${c1}, 0 0 50px ${c1}44, inset 0 0 15px ${c2}22;\n  animation: framePulse 2s ease-in-out infinite;\n}\n@keyframes framePulse {\n  0%,100% { box-shadow: 0 0 20px ${c1}, 0 0 40px ${c1}44; }\n  50%       { box-shadow: 0 0 35px ${c1}, 0 0 70px ${c1}66; }\n}\n/* المالك: ${name} | eyad-eyad12.com */`;
    _dlT(css,'cam-frame-css');
}

/* ════ 4. STREAM OVERLAY ════ */
let soTheme='cy';
const SO={cy:{c1:'#00e5ff',c2:'#0077ff',cb:'rgba(0,8,25,.88)'},gd:{c1:'#ffd700',c2:'#ff9800',cb:'rgba(18,12,0,.88)'},rd:{c1:'#ff4444',c2:'#cc0000',cb:'rgba(18,0,0,.88)'},pu:{c1:'#a855f7',c2:'#7c3aed',cb:'rgba(8,0,18,.88)'},wh:{c1:'#fff',c2:'#ccc',cb:'rgba(0,0,0,.75)'}};
function soInit(){ soRender(); }
function soRender(){
    const t=SO[soTheme]||SO.cy, c1=t.c1,c2=t.c2;
    const player=_v('so_player')||'Player', team=_v('so_team')||'Team';
    const g=id=>document.getElementById(id)?.checked;
    const ctx=_ctx('so_cv',1920,1080); if(!ctx) return;
    ctx.clearRect(0,0,1920,1080);
    function rr(cx,cy,cw,ch,rad){ ctx.beginPath();ctx.moveTo(cx+rad,cy);ctx.lineTo(cx+cw-rad,cy);ctx.arcTo(cx+cw,cy,cx+cw,cy+rad,rad);ctx.lineTo(cx+cw,cy+ch-rad);ctx.arcTo(cx+cw,cy+ch,cx+cw-rad,cy+ch,rad);ctx.lineTo(cx+rad,cy+ch);ctx.arcTo(cx,cy+ch,cx,cy+ch-rad,rad);ctx.lineTo(cx,cy+rad);ctx.arcTo(cx,cy,cx+rad,cy,rad);ctx.closePath(); }
    function panel(x,y,w,h){ ctx.fillStyle=t.cb; rr(x,y,w,h,10); ctx.fill(); ctx.strokeStyle=_hex(c1,.4);ctx.lineWidth=1.5; rr(x,y,w,h,10); ctx.stroke(); }
    // Health bar
    if(g('soHealth')){
        panel(20,1000,420,60);
        ctx.fillStyle=c1; ctx.font='bold 16px "Segoe UI"'; ctx.textAlign='left';
        ctx.fillText('❤️',30,1036); ctx.fillText('🛡️',230,1036);
        ctx.fillStyle=_hex('#fff',.15); rr(52,1022,160,12,6);ctx.fill();
        const hg2=ctx.createLinearGradient(52,0,212,0); hg2.addColorStop(0,'#ff4444');hg2.addColorStop(1,'#ff8888');
        ctx.fillStyle=hg2; rr(52,1022,128,12,6);ctx.fill();
        ctx.fillStyle=_hex('#fff',.15); rr(252,1022,160,12,6);ctx.fill();
        ctx.fillStyle='#4488ff'; rr(252,1022,100,12,6);ctx.fill();
    }
    // Kill counter
    if(g('soKills')){ panel(1770,15,135,65); ctx.fillStyle=c1;ctx.font='bold 12px "Segoe UI"';ctx.textAlign='center';ctx.fillText('💀 KILLS',1837,38); ctx.fillStyle='#fff';ctx.font='bold 30px "Segoe UI"';ctx.fillText('7',1837,65); }
    // Ring timer
    if(g('soRing')){ panel(870,12,180,52); ctx.fillStyle='#ff6600';ctx.font='bold 13px "Segoe UI"';ctx.textAlign='center';ctx.fillText('⏱️ الدائرة تغلق',960,33); ctx.fillStyle='#fff';ctx.font='bold 20px monospace';ctx.fillText('02:45',960,52); }
    // Squad
    if(g('soSquad')){
        panel(20,15,195,160);
        ctx.fillStyle=c1;ctx.font='bold 13px "Segoe UI"';ctx.textAlign='right';ctx.fillText('👥 الفريق',205,38);
        ['أنت','زميل 2','زميل 3','زميل 4'].forEach((n2,i)=>{
            const ry=52+i*28;
            ctx.fillStyle=i===0?c1:'#bbb';ctx.font=`${i===0?'bold ':''} 13px "Segoe UI"`;ctx.textAlign='right';ctx.fillText(n2,205,ry+14);
            const fills=[.8,.55,.3,.95];
            ctx.fillStyle=_hex('#fff',.12); rr(25,ry,55,9,4);ctx.fill();
            ctx.fillStyle=i===0?c1:(fills[i]>.6?'#4CAF50':fills[i]>.3?'#ff9800':'#f44');
            rr(25,ry,55*fills[i],9,4);ctx.fill();
        });
    }
    // Weapon
    if(g('soWeapon')){ panel(1590,1000,310,60); ctx.fillStyle=c1;ctx.font='bold 14px "Segoe UI"';ctx.textAlign='center';ctx.fillText('🔫 M416 + 4x',1745,1027); ctx.fillStyle='#ccc';ctx.font='13px "Segoe UI"';ctx.fillText('💊 30 / 60 | 120 total',1745,1050); }
    // Minimap
    if(g('soMinimap')){
        panel(1745,80,155,120);
        ctx.fillStyle='#2d4a2d'; rr(1752,87,141,106,8);ctx.fill();
        ctx.fillStyle='rgba(255,255,255,.9)';ctx.shadowColor='#fff';ctx.shadowBlur=8;
        ctx.beginPath();ctx.arc(1822,137,5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
        ctx.strokeStyle=_hex('#ff9800',.7);ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(1822,137,35,0,Math.PI*2);ctx.stroke();
        ctx.fillStyle=_hex(c1,.7);ctx.font='bold 11px "Segoe UI"';ctx.textAlign='center';ctx.fillText('🗺️ Erangel',1822,193);
    }
    // Logo/Brand
    if(g('soLogo')){
        panel(1560,15,340,56);
        ctx.shadowColor=c1;ctx.shadowBlur=12;
        ctx.fillStyle=c1;ctx.font='bold 18px "Segoe UI"';ctx.textAlign='center';
        ctx.fillText('🎮 '+player,1730,38);ctx.shadowBlur=0;
        ctx.fillStyle=_hex('#fff',.5);ctx.font='13px "Segoe UI"';ctx.fillText(team+' • PUBG Mobile',1730,58);
    }
}
function soDl(){ soRender(); const c=document.getElementById('so_cv'); if(c)_dl(c,'stream-overlay'); }

/* ════ 5. TEAM LOGO ════ */
let tlShape='sh';
function tlInit(){ tlRender(); }
function tlRender(){
    const name=_v('tl_name')||'Team', abbr=_v('tl_abbr')||'TM', tag=_v('tl_tag')||'PUBG Esports';
    const c1=_v('tl_c1')||'#00e5ff', c2=_v('tl_c2')||'#0a1628', tc=_v('tl_tc')||'#fff';
    const W=512,H=512; const ctx=_ctx('tl_cv',W,H); if(!ctx)return;
    ctx.clearRect(0,0,W,H);
    const cx=W/2,cy=H/2, R=200;
    // Bg glow
    const bg2=ctx.createRadialGradient(cx,cy,0,cx,cy,R*1.2);
    bg2.addColorStop(0,_hex(c1,.08)); bg2.addColorStop(1,'transparent');
    ctx.fillStyle=bg2; ctx.fillRect(0,0,W,H);
    // Shadow
    ctx.shadowColor=c1; ctx.shadowBlur=40;
    ctx.fillStyle=c2; ctx.strokeStyle=c1; ctx.lineWidth=7;
    switch(tlShape){
        case 'sh': _tlShield(ctx,cx,cy,R,c1,c2); break;
        case 'hx': _tlHex(ctx,cx,cy,R,c1,c2); break;
        case 'ci': _tlCircle(ctx,cx,cy,R,c1,c2); break;
        case 'st': _tlStar(ctx,cx,cy,R,5,c1,c2); break;
        case 'di': _tlDiamond(ctx,cx,cy,R,c1,c2); break;
    }
    ctx.shadowBlur=0;
    // Inner details
    ctx.strokeStyle=_hex(c1,.25); ctx.lineWidth=2;
    switch(tlShape){
        case 'sh': ctx.beginPath();ctx.moveTo(cx,cy-R+35);ctx.lineTo(cx,cy+R-25);ctx.stroke();break;
        case 'ci': ctx.beginPath();ctx.arc(cx,cy,R-22,0,Math.PI*2);ctx.stroke();break;
    }
    // Abbreviation
    const fs=Math.min(88,260/Math.max(abbr.length,1));
    ctx.shadowColor=c1; ctx.shadowBlur=18;
    ctx.fillStyle=tc; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.font=`bold ${fs}px "Segoe UI",Arial`;
    ctx.fillText(abbr,cx,cy-18);
    // Team name
    ctx.shadowBlur=8; ctx.font='bold 22px "Segoe UI",Arial'; ctx.fillStyle=c1;
    ctx.fillText(name.toUpperCase(),cx,cy+65);
    // Tag
    ctx.shadowBlur=0; ctx.font='14px "Segoe UI",Arial'; ctx.fillStyle=_hex(tc,.55);
    ctx.fillText(tag,cx,cy+92);
    ctx.textBaseline='alphabetic';
}
function _tlShield(ctx,cx,cy,r,c1,c2){ ctx.beginPath();ctx.moveTo(cx,cy-r);ctx.bezierCurveTo(cx+r,cy-r,cx+r,cy+r*.3,cx,cy+r);ctx.bezierCurveTo(cx-r,cy+r*.3,cx-r,cy-r,cx,cy-r);ctx.fill();ctx.stroke(); }
function _tlHex(ctx,cx,cy,r,c1,c2){ ctx.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3-Math.PI/6;i===0?ctx.moveTo(cx+r*Math.cos(a),cy+r*Math.sin(a)):ctx.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a));}ctx.closePath();ctx.fill();ctx.stroke(); }
function _tlCircle(ctx,cx,cy,r,c1,c2){ ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();ctx.stroke(); }
function _tlStar(ctx,cx,cy,r,pts,c1,c2){ const inn=r*.42;ctx.beginPath();for(let i=0;i<pts*2;i++){const a=i*Math.PI/pts-Math.PI/2,ri=i%2===0?r:inn;i===0?ctx.moveTo(cx+ri*Math.cos(a),cy+ri*Math.sin(a)):ctx.lineTo(cx+ri*Math.cos(a),cy+ri*Math.sin(a));}ctx.closePath();ctx.fill();ctx.stroke(); }
function _tlDiamond(ctx,cx,cy,r,c1,c2){ ctx.beginPath();ctx.moveTo(cx,cy-r);ctx.lineTo(cx+r*.7,cy);ctx.lineTo(cx,cy+r);ctx.lineTo(cx-r*.7,cy);ctx.closePath();ctx.fill();ctx.stroke(); }
function tlDl(){ const c=document.getElementById('tl_cv'); if(c)_dl(c,'team-logo'); }

/* ════ 6. TOURNAMENT BANNER ════ */
let tbStyle='cy', tbSize='1920x1080';
const TB={cy:{b1:'#030d1e',b2:'#040d22',c1:'#00e5ff',c2:'#0077ff',ac:'#00ff88'},es:{b1:'#080414',b2:'#0f0820',c1:'#a855f7',c2:'#7c3aed',ac:'#ffd700'},fi:{b1:'#140200',b2:'#200400',c1:'#ff5500',c2:'#ff2200',ac:'#ffd700'},ni:{b1:'#030308',b2:'#050510',c1:'#4488ff',c2:'#2255cc',ac:'#00e5ff'},gd:{b1:'#120e00',b2:'#1e1600',c1:'#ffd700',c2:'#ff9800',ac:'#fff'}};
function tbInit(){ tbRender(); }
function tbRender(){
    const t=TB[tbStyle]||TB.cy;
    const [W,H]=(tbSize||'1920x1080').split('x').map(Number);
    const title=_v('tb_title')||'PUBG Championship', date=_v('tb_date')||'2025', prize=_v('tb_prize')||'جائزة: 500,000', org=_v('tb_org')||'Eyad_Eyad12';
    const ctx=_ctx('tb_cv',W,H); if(!ctx)return;
    // Background
    const g=ctx.createLinearGradient(0,0,W,H); g.addColorStop(0,t.b1);g.addColorStop(.5,t.b2);g.addColorStop(1,t.b1);
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    // Diagonal stripes
    ctx.strokeStyle=_hex(t.c1,.05); ctx.lineWidth=1;
    for(let i=-H;i<W+H;i+=80){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i+H,H);ctx.stroke();}
    // Vignette
    const vig=ctx.createRadialGradient(W/2,H/2,H*.1,W/2,H/2,H*.8);
    vig.addColorStop(0,'transparent'); vig.addColorStop(1,'rgba(0,0,0,.5)');
    ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);
    // Top glow bar
    const tg=ctx.createLinearGradient(0,0,W,0); tg.addColorStop(0,t.c2+'00');tg.addColorStop(.5,t.c1+'33');tg.addColorStop(1,t.c2+'00');
    ctx.fillStyle=tg; ctx.fillRect(0,0,W,H*.07);
    ctx.strokeStyle=t.c1; ctx.lineWidth=2.5;
    ctx.beginPath();ctx.moveTo(0,H*.07);ctx.lineTo(W,H*.07);ctx.stroke();
    // Center ring
    ctx.strokeStyle=_hex(t.c1,.06); ctx.lineWidth=80;
    ctx.beginPath();ctx.arc(W/2,H/2,H*.38,0,Math.PI*2);ctx.stroke();
    // PUBG Icon
    ctx.shadowColor=t.c1; ctx.shadowBlur=30;
    ctx.fillStyle=t.c1; ctx.font=`bold ${H*.07}px "Segoe UI"`;
    ctx.textAlign='center'; ctx.fillText('🎮 PUBG MOBILE',W/2,H*.22);
    // Main title
    ctx.shadowBlur=50;
    const fs=Math.min(H*.13,W*.055);
    ctx.font=`bold ${fs}px "Segoe UI",Arial`; ctx.fillStyle='#fff';
    ctx.fillText(title,W/2,H*.45);
    // Decorative lines
    ctx.shadowBlur=0;
    ['l','r'].forEach(dir=>{
        const g2=ctx.createLinearGradient(W/2,0,dir==='l'?0:W,0);
        g2.addColorStop(0,t.c1); g2.addColorStop(1,'transparent');
        ctx.strokeStyle=g2; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(W/2,H*.5); ctx.lineTo(dir==='l'?W/2-W*.35:W/2+W*.35,H*.5); ctx.stroke();
        ctx.fillStyle=t.c1; ctx.beginPath(); ctx.arc(dir==='l'?W/2-W*.36:W/2+W*.36,H*.5,4,0,Math.PI*2); ctx.fill();
    });
    // Date & Prize
    ctx.shadowBlur=8; ctx.shadowColor=t.ac;
    ctx.fillStyle=t.ac; ctx.font=`bold ${H*.048}px "Segoe UI"`; ctx.fillText('📅 '+date,W/2,H*.63);
    ctx.shadowBlur=0;
    ctx.fillStyle='rgba(255,255,255,.7)'; ctx.font=`${H*.04}px "Segoe UI"`;
    ctx.fillText(prize,W/2,H*.74);
    // Bottom
    const bg2=ctx.createLinearGradient(0,H*.85,W,H); bg2.addColorStop(0,t.c2+'00');bg2.addColorStop(.5,t.c1+'22');bg2.addColorStop(1,t.c2+'00');
    ctx.fillStyle=bg2;ctx.fillRect(0,H*.85,W,H*.15);
    ctx.strokeStyle=t.c1; ctx.lineWidth=2; ctx.beginPath();ctx.moveTo(0,H*.85);ctx.lineTo(W,H*.85);ctx.stroke();
    ctx.fillStyle=_hex(t.c1,.6); ctx.font=`${H*.027}px "Segoe UI"`;
    ctx.fillText('منظم بواسطة: '+org+' • eyad-eyad12.com',W/2,H*.945);
}
function tbDl(){ const c=document.getElementById('tb_cv'); if(c)_dl(c,'tournament-banner-'+tbStyle); }

/* ════ 7. PLAYER STATS ════ */
let psTheme='cy';
const PS={cy:{b1:'#020c1c',b2:'#040e22',c1:'#00e5ff',c2:'#0077ff',rk:'#ffd700'},gd:{b1:'#100b00',b2:'#180f00',c1:'#ffd700',c2:'#ff9800',rk:'#fff'},rd:{b1:'#100000',b2:'#180000',c1:'#ff4444',c2:'#cc0000',rk:'#ffd700'},ni:{b1:'#030308',b2:'#050510',c1:'#6688ff',c2:'#4466cc',rk:'#ffd700'}};
function psInit(){ psRender(); }
function psRender(){
    const t=PS[psTheme]||PS.cy;
    const W=900,H=520; const ctx=_ctx('ps_cv',W,H); if(!ctx)return;
    const bg=ctx.createLinearGradient(0,0,W,H); bg.addColorStop(0,t.b1);bg.addColorStop(1,t.b2);
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
    // Grid lines
    ctx.strokeStyle=_hex(t.c1,.07); ctx.lineWidth=1;
    for(let x=0;x<W;x+=60){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0;y<H;y+=60){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    // Border
    ctx.strokeStyle=_hex(t.c1,.4); ctx.lineWidth=2;
    ctx.beginPath();ctx.roundRect(8,8,W-16,H-16,16);ctx.stroke();
    // Left panel
    const sbg=ctx.createLinearGradient(0,0,220,H); sbg.addColorStop(0,_hex(t.c1,.18));sbg.addColorStop(1,'transparent');
    ctx.fillStyle=sbg; ctx.beginPath(); ctx.roundRect(0,0,220,H,16); ctx.fill();
    ctx.strokeStyle=_hex(t.c1,.25); ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(220,20);ctx.lineTo(220,H-20);ctx.stroke();
    // Tier
    ctx.shadowColor=t.rk; ctx.shadowBlur=25;
    ctx.fillStyle=t.rk; ctx.font='bold 52px serif'; ctx.textAlign='center'; ctx.fillText('⭐',110,90);
    ctx.shadowBlur=12;
    ctx.font='bold 22px "Segoe UI"'; ctx.fillText(_v('ps_tier')||'Conqueror',110,128);
    // Name
    ctx.shadowBlur=15; ctx.shadowColor=t.c1; ctx.fillStyle='#fff';
    ctx.font='bold 26px "Segoe UI"'; ctx.fillText(_v('ps_name')||'Player',110,170);
    ctx.shadowBlur=5; ctx.fillStyle=_hex(t.c1,.75); ctx.font='13px "Segoe UI"';
    ctx.fillText('ID: '+(_v('ps_uid')||'0000'),110,195);
    ctx.fillText('🌍 '+(_v('ps_server')||'MENA'),110,216);
    // Stats grid
    const stats=[['⚔️ K/D',_v('ps_kd')||'0'],['🏆 Win%',_v('ps_wr')||'0%'],['💀 Max Kills',_v('ps_kills')||'0'],['🎮 Matches',_v('ps_matches')||'0'],['💥 Avg DMG',_v('ps_dmg')||'0'],['📊 Top 10%',_v('ps_top10')||'0%']];
    const cols=3,cW=(W-250)/cols,cH=(H-70)/2;
    stats.forEach(([lbl,val],i)=>{
        const col=i%cols, row=Math.floor(i/cols);
        const sx=240+col*cW, sy=45+row*cH;
        ctx.fillStyle='rgba(255,255,255,.04)'; ctx.shadowBlur=0;
        ctx.beginPath(); ctx.roundRect(sx,sy,cW-12,cH-12,12); ctx.fill();
        ctx.strokeStyle=_hex(t.c1,.15); ctx.lineWidth=1;
        ctx.beginPath(); ctx.roundRect(sx,sy,cW-12,cH-12,12); ctx.stroke();
        // Value
        ctx.shadowColor=t.c1; ctx.shadowBlur=12;
        ctx.fillStyle=t.c1; ctx.font=`bold ${Math.min(42,cH*.42)}px "Segoe UI"`;
        ctx.textAlign='center'; ctx.fillText(val,sx+(cW-12)/2,sy+cH*.52);
        // Label
        ctx.shadowBlur=0; ctx.fillStyle='rgba(255,255,255,.5)'; ctx.font='13px "Segoe UI"';
        ctx.fillText(lbl,sx+(cW-12)/2,sy+cH*.75);
    });
    // Footer
    ctx.shadowBlur=0; ctx.fillStyle=_hex(t.c1,.45); ctx.font='11px "Segoe UI"'; ctx.textAlign='right';
    ctx.fillText('Eyad_Eyad12 Stats Card • eyad-eyad12.com',W-15,H-14);
}
function psDl(){ const c=document.getElementById('ps_cv'); if(c)_dl(c,'player-stats'); }

/* ════ 8. HIGHLIGHT MAKER ════ */
let hlItems=[];
function hlInit(){ hlUpdate(); }
function hlAdd(){
    const t=document.getElementById('hl_time')?.value?.trim();
    if(!t){alert('أدخل الوقت!');return;}
    hlItems.push({t,cat:document.getElementById('hl_cat')?.value||'',note:document.getElementById('hl_note')?.value||'',id:Date.now()});
    hlItems.sort((a,b)=>a.t.localeCompare(b.t));
    document.getElementById('hl_time').value=''; document.getElementById('hl_note').value='';
    hlUpdate();
}
function hlDel(id){ hlItems=hlItems.filter(h=>h.id!==id); hlUpdate(); }
function hlUpdate(){
    const count=document.getElementById('hl_count'); if(count) count.textContent=hlItems.length;
    const list=document.getElementById('hl_list'); if(!list)return;
    if(!hlItems.length){list.innerHTML='<div style="color:#445566;text-align:center;padding:2.5rem;font-size:.9rem">أضف أول لحظة 🎮</div>';return;}
    list.innerHTML=hlItems.map((h,i)=>`
      <div class="esp-hl-item">
        <span class="esp-hl-num">${i+1}</span>
        <span class="esp-hl-time">⏱ ${h.t}</span>
        <span class="esp-hl-cat">${h.cat}</span>
        <span class="esp-hl-note">${h.note||'—'}</span>
        <button class="esp-hl-del" onclick="hlDel(${h.id})">✕</button>
      </div>`).join('');
}
function hlExportTxt(){
    const title=_v('hl_title')||'PUBG Highlights';
    let t=`${'═'.repeat(42)}\n🎮 ${title}\nEyad_Eyad12 | eyad-eyad12.com\n${'═'.repeat(42)}\n\nإجمالي اللحظات: ${hlItems.length}\n\n`;
    hlItems.forEach((h,i)=>{t+=`[${i+1}] ⏱ ${h.t} — ${h.cat}\n`; if(h.note)t+=`    📝 ${h.note}\n`; t+='\n';});
    _dlT(t,'highlights');
}
function hlExportHtml(){
    const title=_v('hl_title')||'PUBG Highlights';
    const html=`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>${title}</title><style>body{font-family:"Segoe UI",sans-serif;background:#030d1e;color:#fff;padding:2rem;max-width:800px;margin:0 auto}h1{color:#00e5ff;text-align:center;text-shadow:0 0 20px rgba(0,229,255,.5)}p{color:#667788;text-align:center;margin-bottom:2rem}.hl{background:rgba(0,229,255,.06);border:1px solid rgba(0,229,255,.18);border-radius:12px;padding:.9rem 1.2rem;margin:.6rem 0;display:flex;gap:1rem;align-items:center}.num{color:#445566;font-size:.75rem;min-width:24px}.time{color:#00e5ff;font-weight:800;font-family:monospace;font-size:1.05rem}.cat{background:rgba(255,215,0,.15);color:#ffd700;border:1px solid rgba(255,215,0,.3);padding:2px 10px;border-radius:8px;font-size:.8rem;white-space:nowrap}.note{color:#778899;font-size:.88rem;flex:1}footer{text-align:center;color:#445566;margin-top:2rem;font-size:.85rem}</style></head><body><h1>🎮 ${title}</h1><p>اللحظات: ${hlItems.length}</p>${hlItems.map((h,i)=>`<div class="hl"><span class="num">${i+1}</span><span class="time">${h.t}</span><span class="cat">${h.cat}</span><span class="note">${h.note||''}</span></div>`).join('')}<footer>Eyad_Eyad12 • eyad-eyad12.com</footer></body></html>`;
    _dlH(html,'highlights');
}

/* ════ 9. STREAM BACKGROUND ════ */
let bgTheme='sp', bgFx='no', bgSz='1920x1080';
const BG_THEMES={sp:{s1:'#06001a',s2:'#010010',c1:'#8866ff',st:true},jg:{s1:'#071507',s2:'#030d03',c1:'#44ff88',st:false},ds:{s1:'#1f1000',s2:'#140900',c1:'#ff9800',st:false},sn:{s1:'#d0e8f4',s2:'#a0c8dc',c1:'#88aacc',st:true},fr:{s1:'#1a0200',s2:'#0f0100',c1:'#ff4400',st:false},ni:{s1:'#02020a',s2:'#040410',c1:'#4466ff',st:true},cy:{s1:'#000c14',s2:'#00060e',c1:'#00e5ff',st:false},ct:{s1:'#080314',s2:'#040212',c1:'#ff88ff',st:true}};
function bgInit(){ bgRender(); }
function bgRender(){
    const th=BG_THEMES[bgTheme]||BG_THEMES.sp;
    const [W,H]=(bgSz||'1920x1080').split('x').map(Number);
    const ctx=_ctx('bg_cv',W,H); if(!ctx)return;
    const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,th.s1);g.addColorStop(1,th.s2);
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    if(th.st){ for(let i=0;i<250;i++){const sx=(i*179+37)%W,sy=(i*113+53)%H,sr=i%7===0?2:1;ctx.fillStyle=`rgba(255,255,255,${.15+i%8*.06})`;ctx.beginPath();ctx.arc(sx,sy,sr,0,Math.PI*2);ctx.fill();} }
    if(bgFx==='gr'){ctx.strokeStyle=_hex(th.c1,.1);ctx.lineWidth=1;for(let x=0;x<W;x+=W/18){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}for(let y=0;y<H;y+=H/10){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}}
    if(bgFx==='pt'){for(let i=0;i<100;i++){ctx.fillStyle=_hex(th.c1,(.05+i%5*.04));ctx.beginPath();ctx.arc((i*73+17)%W,(i*89+41)%H,1+(i%4),0,Math.PI*2);ctx.fill();}}
    if(bgFx==='wv'){ctx.strokeStyle=_hex(th.c1,.15);ctx.lineWidth=2;for(let k=0;k<7;k++){ctx.beginPath();for(let x=0;x<=W;x+=12){const y=H*.5+Math.sin((x/W)*Math.PI*4+k)*(H*.08)+k*H*.07; x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();}}
    if(bgFx==='st'){ctx.fillStyle=_hex(th.c1,.35);for(let i=0;i<120;i++){const ox=(i*97+23)%W,oy=(i*131+57)%H,r=3+i%4;ctx.beginPath();for(let j=0;j<8;j++){const a=j*Math.PI/4,ri=j%2===0?r:r*.4;j===0?ctx.moveTo(ox+ri*Math.cos(a),oy+ri*Math.sin(a)):ctx.lineTo(ox+ri*Math.cos(a),oy+ri*Math.sin(a));}ctx.closePath();ctx.fill();}}
    // Hills (jungle/desert/city)
    if(['jg','ds','ct'].includes(bgTheme)){
        ctx.fillStyle=bgTheme==='jg'?'#0a1e0a':bgTheme==='ds'?'#3d2500':'#080210';
        ctx.beginPath();ctx.moveTo(0,H);
        for(let x=0;x<=W;x+=W/10){ctx.lineTo(x,H*.65+Math.sin(x/W*Math.PI*3)*H*.15);}
        ctx.lineTo(W,H);ctx.closePath();ctx.fill();
    }
    // Center glow
    const cg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,W*.35);
    cg.addColorStop(0,_hex(th.c1,.04)); cg.addColorStop(1,'transparent');
    ctx.fillStyle=cg; ctx.fillRect(0,0,W,H);
    // Text
    ctx.shadowColor=th.c1; ctx.shadowBlur=35;
    ctx.fillStyle=_hex(th.c1,.9); ctx.font=`bold ${H*.08}px "Segoe UI"`; ctx.textAlign='center';
    ctx.fillText('🎮 '+(_v('bg_game')||'PUBG Mobile'),W/2,H*.44);
    const txt=_v('bg_text');
    if(txt){ctx.shadowBlur=20;ctx.fillStyle='#fff';ctx.font=`bold ${H*.055}px "Segoe UI"`;ctx.fillText(txt,W/2,H*.56);}
    ctx.shadowBlur=5; ctx.fillStyle=_hex(th.c1,.45); ctx.font=`${H*.023}px "Segoe UI"`;
    ctx.fillText('eyad-eyad12.com',W/2,H*.96);
    ctx.shadowBlur=0;
}
function bgDl(){ const c=document.getElementById('bg_cv'); if(c)_dl(c,'stream-bg-'+bgTheme); }

/* ════ 10. TRANSITIONS ════ */
let trType='fl', trSz='1920x1080', trAF=null, trProg=0;
function trInit(){ trRender(.5); }
function trRender(p=.5){
    const [W,H]=(trSz||'1920x1080').split('x').map(Number);
    const c1=_v('tr_c1')||'#00e5ff', c2=_v('tr_c2')||'#0a1628', bg2=_v('tr_bg')||'#000';
    const ctx=_ctx('tr_cv',W,H); if(!ctx)return;
    ctx.fillStyle=bg2; ctx.fillRect(0,0,W,H);
    switch(trType){
        case 'fl': ctx.globalAlpha=p<.5?p*2:(1-p)*2; ctx.fillStyle=c1; ctx.fillRect(0,0,W,H); ctx.globalAlpha=1; break;
        case 'wv': ctx.fillStyle=c1; ctx.beginPath();ctx.moveTo(0,0);const wx=W*p*1.3;for(let y=0;y<=H;y+=10){const x=wx+Math.sin(y/H*Math.PI*5)*W*.1;ctx.lineTo(x,y);}ctx.lineTo(0,H);ctx.closePath();ctx.fill();break;
        case 'bl': const r=p*Math.sqrt(W*W+H*H)*.8,rg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,r);rg.addColorStop(0,c1);rg.addColorStop(.5,_hex(c1,.6));rg.addColorStop(1,'transparent');ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);break;
        case 'sl': ctx.fillStyle=c1;ctx.fillRect(0,0,W*p*1.15,H);if(p>.5){ctx.fillStyle=c2;ctx.fillRect(W*(p-.45)*1.2,0,W,H);}break;
        case 'sp': const angle=p*Math.PI*2;ctx.fillStyle=c1;ctx.beginPath();ctx.moveTo(W/2,H/2);ctx.arc(W/2,H/2,Math.max(W,H),0,angle);ctx.closePath();ctx.fill();break;
        case 'gl': for(let i=0;i<25;i++){const gy=(i/25)*H,shift=Math.sin(gy*.08+p*12)*W*.06*p;ctx.fillStyle=i%3===0?c1:_hex(c1,.5);ctx.fillRect(shift,gy,W*p,H/25);}break;
        case 'fd': ctx.globalAlpha=p;ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;break;
        case 'pt': ctx.globalAlpha=Math.min(1,p*2);for(let i=0;i<200;i++){const a=(i/200)*Math.PI*2,d=p*Math.max(W,H)*.75;const px2=W/2+Math.cos(a)*d,py2=H/2+Math.sin(a)*d;ctx.fillStyle=i%2===0?c1:c2;ctx.beginPath();ctx.arc(px2,py2,2+i%5,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;break;
    }
    ctx.fillStyle='rgba(255,255,255,.25)';ctx.font=`${H*.024}px "Segoe UI"`;ctx.textAlign='center';
    ctx.fillText(`Transition: ${trType} | Eyad_Eyad12`,W/2,H-16);
}
function trAnimate(){
    if(trAF){cancelAnimationFrame(trAF);trAF=null;trProg=0;trRender(0);return;}
    trProg=0;
    const step=()=>{ trProg+=.012; if(trProg>=1){trAF=null;trProg=0;trRender(0);return;} trRender(trProg); trAF=requestAnimationFrame(step); };
    trAF=requestAnimationFrame(step);
}
function trDl(){ trRender(.5); const c=document.getElementById('tr_cv'); if(c)_dl(c,'transition-'+trType); }

/* Clean up animation on modal close */
document.addEventListener('click',e=>{ if(e.target?.classList?.contains?.('close-btn')||e.target?.closest?.('.close-btn')){if(trAF){cancelAnimationFrame(trAF);trAF=null;}} });
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&trAF){cancelAnimationFrame(trAF);trAF=null;} });

console.log('%c🎮 Esports Tools v2 — 10 أداة ببجي احترافية جاهزة','color:#00e5ff;font-weight:bold;background:#030d1e;padding:4px 12px;border-radius:4px');