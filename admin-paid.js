/* ================================================================
   admin-paid.js v2 — Eyad_Eyad12
   لوحة تحكم الخدمات المدفوعة — إدارة كاملة
================================================================ */

(function(){
    const obs = new MutationObserver(()=>{
        const sidebar = document.querySelector('.adm-sidebar');
        if(!sidebar || sidebar.querySelector('[data-tab="adm-paid"]')) return;

        /* Add nav buttons */
        [
            {tab:'adm-paid',     icon:'fa-gem',   text:'الخدمات المدفوعة'},
            {tab:'adm-requests', icon:'fa-inbox',  text:'الطلبات', badge:'req_n_badge'},
        ].forEach(item=>{
            const btn = document.createElement('button');
            btn.className = 'adm-nav-item';
            btn.dataset.tab = item.tab;
            btn.innerHTML = `<i class="fas ${item.icon}"></i><span>${item.text}</span>${item.badge?`<span class="adm-nav-badge" id="${item.badge}">0</span>`:''}`;
            btn.onclick = ()=>{ admActivateTab?.(item.tab, btn); };
            sidebar.appendChild(btn);
        });

        /* Add tab contents */
        const main = document.querySelector('.adm-main');
        if(!main) return;
        if(!document.getElementById('adm-paidTab')){
            const d = document.createElement('div');
            d.id = 'adm-paidTab';
            d.className = 'admin-tab-content';
            d.innerHTML = apServicesHTML();
            main.appendChild(d);
        }
        if(!document.getElementById('adm-requestsTab')){
            const d = document.createElement('div');
            d.id = 'adm-requestsTab';
            d.className = 'admin-tab-content';
            d.innerHTML = apRequestsHTML();
            main.appendChild(d);
        }

        apUpdateBadge();

        /* Listen for new requests */
        try{
            new BroadcastChannel('ps_requests').onmessage = ()=>{ apUpdateBadge(); apReqLoad?.(); };
        }catch(_){}
    });
    obs.observe(document.body, {childList:true, subtree:true});
})();

/* ════ Helpers ════ */
function apLoad(){ return window.psLoad?.() || []; }
function apSave(d){ window.psSave?.(d); window.psRender?.(); }
function apReqLoadAll(){ return window.prLoad?.() || []; }
function apSaveReqs(d){ window.prSave?.(d); }
function apFmt(n){ return Number(n).toLocaleString('ar-IQ'); }
function apFmtTime(v,u){ if(u==='minutes')return v<60?v+' دقيقة':Math.round(v/60)+' ساعة'; if(u==='hours')return v<24?v+' ساعة':Math.round(v/24)+' يوم'; return v+' '+u; }

function apUpdateBadge(){
    const n = apReqLoadAll().filter(r=>r.status==='pending').length;
    const el = document.getElementById('req_n_badge');
    if(el) el.textContent = n||'';
}

/* ════ Services Manager ════ */
function apServicesHTML(){
return `
<div class="adm-page-title">
    <i class="fas fa-gem"></i><h2>إدارة الخدمات المدفوعة</h2>
    <div style="margin-right:auto">
        <button class="adm-btn adm-btn-primary" onclick="apShowForm(null)">
            <i class="fas fa-plus"></i> إضافة خدمة
        </button>
    </div>
</div>

<div id="ap_form_wrap" style="display:none;margin-bottom:1rem">
<div class="adm-card" style="border-color:rgba(220,20,60,.3)">
    <div class="adm-card-title"><i class="fas fa-edit"></i> <span id="ap_form_title_lbl">إضافة خدمة</span></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.8rem">
        <div class="adm-form-group"><label class="adm-label">اسم الخدمة *</label>
            <input class="adm-inp" id="ap_f_name" placeholder="مونتاج هايلايت"></div>
        <div class="adm-form-group"><label class="adm-label">السعر (IQD) *</label>
            <input class="adm-inp" id="ap_f_price" type="number" placeholder="8000" min="0"></div>
        <div class="adm-form-group"><label class="adm-label">وحدة السعر</label>
            <input class="adm-inp" id="ap_f_price_unit" placeholder="مثال: لكل مقطع / لكل 3 صور"></div>
        <div class="adm-form-group"><label class="adm-label">وقت التسليم *</label>
            <div style="display:flex;gap:.4rem">
                <input class="adm-inp" id="ap_f_time_val" type="number" placeholder="6" min="1" style="flex:1">
                <select class="adm-inp" id="ap_f_time_unit" style="width:100px;flex-shrink:0">
                    <option value="minutes">دقيقة</option>
                    <option value="hours" selected>ساعة</option>
                    <option value="days">يوم</option>
                </select>
            </div>
        </div>
        <div class="adm-form-group"><label class="adm-label">الحد الأقصى للملفات</label>
            <input class="adm-inp" id="ap_f_max_files" type="number" placeholder="5" min="1" max="20"></div>
        <div class="adm-form-group"><label class="adm-label">وصف الملفات المقبولة</label>
            <input class="adm-inp" id="ap_f_files_desc" placeholder="حتى 5 مقاطع فيديو"></div>
        <div class="adm-form-group" style="grid-column:1/-1">
            <label class="adm-label">وصف الخدمة *</label>
            <textarea class="adm-inp" id="ap_f_desc" rows="2" style="resize:vertical" placeholder="وصف مختصر..."></textarea>
        </div>
        <div class="adm-form-group"><label class="adm-label">أيقونة FontAwesome</label>
            <input class="adm-inp" id="ap_f_icon" placeholder="fa-film" value="fa-film"></div>
        <div class="adm-form-group"><label class="adm-label">اللون</label>
            <input type="color" class="adm-color-inp" id="ap_f_color" value="#dc143c"></div>
    </div>
    <div class="adm-btn-row">
        <button class="adm-btn adm-btn-primary" onclick="apSaveForm()">
            <i class="fas fa-save"></i> حفظ الخدمة
        </button>
        <button class="adm-btn adm-btn-outline" onclick="document.getElementById('ap_form_wrap').style.display='none'">
            إلغاء
        </button>
    </div>
</div>
</div>

<div class="adm-card">
    <div class="adm-card-title"><i class="fas fa-th"></i> البطاقات الحالية</div>
    <div id="ap_services_list"></div>
</div>`;
}

let _apEditId = null;

function apShowForm(id){
    _apEditId = id;
    const form = document.getElementById('ap_form_wrap');
    const lbl  = document.getElementById('ap_form_title_lbl');
    if(form) form.style.display = '';

    if(id){
        const s = apLoad().find(s=>s.id===id);
        if(!s) return;
        if(lbl) lbl.textContent = 'تعديل: '+s.name;
        document.getElementById('ap_f_name').value       = s.name;
        document.getElementById('ap_f_price').value      = s.price;
        document.getElementById('ap_f_price_unit').value = s.priceUnit||'';
        document.getElementById('ap_f_time_val').value   = s.timeVal;
        document.getElementById('ap_f_time_unit').value  = s.timeUnit||'hours';
        document.getElementById('ap_f_max_files').value  = s.maxFiles||5;
        document.getElementById('ap_f_files_desc').value = s.filesDesc||'';
        document.getElementById('ap_f_desc').value       = s.desc;
        document.getElementById('ap_f_icon').value       = s.icon;
        document.getElementById('ap_f_color').value      = s.color;
    } else {
        if(lbl) lbl.textContent = 'إضافة خدمة جديدة';
        ['ap_f_name','ap_f_price','ap_f_price_unit','ap_f_time_val','ap_f_max_files','ap_f_files_desc','ap_f_desc'].forEach(id=>{
            const el=document.getElementById(id); if(el) el.value='';
        });
        document.getElementById('ap_f_icon').value  = 'fa-star';
        document.getElementById('ap_f_color').value = '#dc143c';
        document.getElementById('ap_f_time_unit').value = 'hours';
    }
    form?.scrollIntoView({behavior:'smooth'});
}

function apSaveForm(){
    const name      = document.getElementById('ap_f_name')?.value?.trim();
    const price     = parseFloat(document.getElementById('ap_f_price')?.value||0);
    const desc      = document.getElementById('ap_f_desc')?.value?.trim();
    const timeVal   = parseInt(document.getElementById('ap_f_time_val')?.value||1);
    if(!name||!price||!desc||!timeVal){ alert('⚠️ اسم الخدمة، السعر، الوقت، والوصف مطلوبة'); return; }

    const item = {
        id        : _apEditId || 'ps_'+Date.now(),
        name,
        price,
        priceUnit : document.getElementById('ap_f_price_unit')?.value?.trim()||'للخدمة',
        timeVal,
        timeUnit  : document.getElementById('ap_f_time_unit')?.value||'hours',
        maxFiles  : parseInt(document.getElementById('ap_f_max_files')?.value||5),
        filesDesc : document.getElementById('ap_f_files_desc')?.value?.trim()||'ملفات مرفقة',
        desc,
        icon      : document.getElementById('ap_f_icon')?.value||'fa-star',
        color     : document.getElementById('ap_f_color')?.value||'#dc143c',
        active    : true,
    };

    const services = apLoad();
    if(_apEditId){
        const idx = services.findIndex(s=>s.id===_apEditId);
        if(idx>=0) services[idx]={...services[idx],...item};
        else services.push(item);
    } else {
        services.push(item);
    }
    apSave(services);
    document.getElementById('ap_form_wrap').style.display = 'none';
    apRenderServicesList();
    admToast?.('✅ تم حفظ الخدمة!','ok');
}

function apToggle(id){
    const svc = apLoad();
    const s = svc.find(s=>s.id===id);
    if(s){ s.active=!s.active; apSave(svc); apRenderServicesList(); }
}

function apDelete(id){
    if(!confirm('حذف هذه الخدمة نهائياً؟')) return;
    apSave(apLoad().filter(s=>s.id!==id));
    apRenderServicesList();
    admToast?.('🗑 تم الحذف','warn');
}

function apRenderServicesList(){
    const el = document.getElementById('ap_services_list');
    if(!el) return;
    const services = apLoad();
    if(!services.length){ el.innerHTML='<p style="color:#445566;font-size:.85rem">لا توجد خدمات. أضف خدمة جديدة.</p>'; return; }
    el.innerHTML = services.map(s=>`
<div style="background:rgba(255,255,255,.04);border:1.5px solid ${s.active?s.color+'44':'rgba(255,255,255,.07)'};border-radius:14px;padding:1rem;margin-bottom:.7rem;display:flex;gap:1rem;align-items:center">
    <div style="width:46px;height:46px;border-radius:12px;background:${s.color};display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.1rem;flex-shrink:0">
        <i class="fas ${s.icon}"></i>
    </div>
    <div style="flex:1;min-width:0">
        <div style="color:#fff;font-weight:700;font-size:.92rem;margin-bottom:.2rem">${s.name}</div>
        <div style="color:#667788;font-size:.76rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.desc}</div>
        <div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.4rem">
            <span style="background:rgba(255,255,255,.06);color:#aaa;padding:1px 8px;border-radius:20px;font-size:.68rem">${apFmt(s.price)} IQD ${s.priceUnit||''}</span>
            <span style="background:rgba(255,255,255,.06);color:#aaa;padding:1px 8px;border-radius:20px;font-size:.68rem">⏱ ${apFmtTime(s.timeVal,s.timeUnit)}</span>
            <span style="background:rgba(255,255,255,.06);color:#aaa;padding:1px 8px;border-radius:20px;font-size:.68rem">📎 ${s.filesDesc||'-'}</span>
            <span style="background:${s.active?'rgba(68,238,85,.12)':'rgba(255,68,68,.12)'};color:${s.active?'#44ee55':'#f44'};border:1px solid ${s.active?'rgba(68,238,85,.25)':'rgba(255,68,68,.25)'};padding:1px 8px;border-radius:20px;font-size:.68rem">${s.active?'مفعّل':'موقوف'}</span>
        </div>
    </div>
    <div style="display:flex;gap:.35rem;flex-shrink:0">
        <button onclick="apShowForm('${s.id}')" style="background:rgba(255,255,255,.08);border:none;border-radius:8px;color:#ccc;padding:6px 10px;cursor:pointer;font-family:inherit;font-size:.8rem;transition:all .18s" title="تعديل">✏️</button>
        <button onclick="apToggle('${s.id}')" style="background:${s.active?'rgba(255,68,68,.12)':'rgba(68,238,85,.12)'};border:none;border-radius:8px;color:${s.active?'#f44':'#44ee55'};padding:6px 10px;cursor:pointer;font-family:inherit;font-size:.78rem">${s.active?'إيقاف':'تفعيل'}</button>
        <button onclick="apDelete('${s.id}')" style="background:rgba(255,68,68,.12);border:none;border-radius:8px;color:#f44;padding:6px 10px;cursor:pointer;font-family:inherit;font-size:.8rem">🗑</button>
    </div>
</div>`).join('');
}

/* ════ Requests Manager ════ */
function apRequestsHTML(){
return `
<div class="adm-page-title">
    <i class="fas fa-inbox"></i><h2>الطلبات</h2>
    <div style="margin-right:auto;display:flex;gap:.4rem;flex-wrap:wrap">
        ${['all','pending','inprogress','completed','delivered'].map((v,i)=>`
        <button class="adm-btn ${!i?'adm-btn-primary':'adm-btn-outline'}" data-rf="${v}"
            onclick="apSetFilter('${v}',this)" style="padding:4px 12px;font-size:.75rem">
            ${{all:'الكل',pending:'⏳ انتظار',inprogress:'⚙️ جاري',completed:'✅ اكتمل',delivered:'📦 مُسلَّم'}[v]}
        </button>`).join('')}
        <button class="adm-btn adm-btn-outline" onclick="apReqLoad()" style="padding:4px 10px;font-size:.75rem"><i class="fas fa-sync"></i></button>
    </div>
</div>
<div id="ap_req_list"></div>
<div id="ap_req_detail" style="display:none;margin-top:1rem">
    <div class="adm-card" style="border-color:rgba(0,229,255,.2)">
        <div class="adm-card-title"><i class="fas fa-comment-dots"></i><span id="ap_detail_lbl">تفاصيل</span>
            <div style="margin-right:auto"><button class="adm-btn adm-btn-outline" onclick="document.getElementById('ap_req_detail').style.display='none'" style="padding:3px 10px;font-size:.74rem">إغلاق</button></div>
        </div>
        <div id="ap_detail_info" style="background:rgba(0,0,0,.3);border-radius:10px;padding:.8rem;font-size:.82rem;color:#889aaa;line-height:1.85;margin-bottom:.8rem"></div>
        <div style="display:flex;gap:.35rem;flex-wrap:wrap;margin-bottom:.8rem" id="ap_status_btns">
            ${[['pending','⏳ انتظار'],['inprogress','⚙️ جاري'],['completed','✅ اكتمل'],['delivered','📦 مُسلَّم']].map(([v,l])=>`
            <button data-st="${v}" onclick="apSetStatus('${v}',this)" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:#aaa;border-radius:8px;padding:5px 12px;cursor:pointer;font-family:inherit;font-size:.78rem;transition:all .18s">${l}</button>`).join('')}
        </div>
        <div style="background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.07);border-radius:11px;padding:.7rem;min-height:100px;max-height:200px;overflow-y:auto;font-size:.8rem;margin-bottom:.5rem" id="ap_chat"></div>
        <div style="display:flex;gap:.4rem;margin-bottom:.8rem">
            <input class="adm-inp" id="ap_msg_inp" placeholder="رسالة للعميل..." style="flex:1" onkeydown="if(event.key==='Enter')apSendMsg()">
            <button class="adm-btn adm-btn-primary" onclick="apSendMsg()" style="padding:.6rem 1rem"><i class="fas fa-paper-plane"></i></button>
        </div>
        <div style="border-top:1px solid rgba(255,255,255,.06);padding-top:.8rem">
            <div class="adm-label" style="margin-bottom:.4rem">📦 إرسال الشغل المكتمل</div>
            <div style="display:flex;gap:.4rem">
                <input type="file" id="ap_deliver_inp" multiple style="display:none" onchange="apDeliverChosen(this)">
                <button class="adm-btn adm-btn-outline" onclick="document.getElementById('ap_deliver_inp').click()" style="flex:1;padding:.6rem;font-size:.8rem"><i class="fas fa-upload"></i> اختر الملفات</button>
                <button class="adm-btn adm-btn-success" onclick="apDeliver()" style="padding:.6rem 1rem;font-size:.8rem"><i class="fas fa-send"></i> أرسل</button>
            </div>
            <div id="ap_deliver_lbl" style="color:#445566;font-size:.72rem;margin-top:.25rem"></div>
        </div>
    </div>
</div>`;
}

let _apFilter = 'all';
let _apCurReq = null;
let _apDeliverFiles = [];

function apSetFilter(v,btn){
    _apFilter = v;
    document.querySelectorAll('[data-rf]').forEach(b=>{
        b.className = 'adm-btn '+(b.dataset.rf===v?'adm-btn-primary':'adm-btn-outline');
        b.style.cssText='padding:4px 12px;font-size:.75rem';
    });
    apReqLoad();
}

function apReqLoad(){
    const el = document.getElementById('ap_req_list');
    if(!el) return;
    apUpdateBadge();
    const reqs = apReqLoadAll()
        .filter(r=>_apFilter==='all'||r.status===_apFilter)
        .sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));

    if(!reqs.length){ el.innerHTML='<div style="color:#445566;text-align:center;padding:2rem;font-size:.85rem">لا توجد طلبات</div>'; return; }

    const stM = {pending:{l:'⏳',c:'#ffd700'},inprogress:{l:'⚙️',c:'#00e5ff'},completed:{l:'✅',c:'#44ee55'},delivered:{l:'📦',c:'#aa66ff'}};
    el.innerHTML = reqs.map(r=>{
        const st = stM[r.status]||stM.pending;
        return `
<div style="background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.07);border-radius:13px;padding:.9rem 1rem;margin-bottom:.6rem;cursor:pointer;transition:all .2s"
    onclick="apOpenDetail('${r.id}')" onmouseover="this.style.borderColor='rgba(0,229,255,.3)'" onmouseout="this.style.borderColor='rgba(255,255,255,.07)'">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.4rem">
        <div>
            <span style="color:#fff;font-weight:700;font-size:.88rem">${r.serviceName}</span>
            ${r.qty>1?`<span style="color:#667788;font-size:.75rem;margin-right:.4rem">× ${r.qty}</span>`:''}
        </div>
        <span style="border:1px solid ${st.c};color:${st.c};padding:1px 9px;border-radius:20px;font-size:.7rem;font-weight:700">${st.l} ${r.status==='pending'?'انتظار':r.status==='inprogress'?'جاري':r.status==='completed'?'اكتمل':'مُسلَّم'}</span>
    </div>
    <div style="color:#889aaa;font-size:.76rem">👤 ${r.clientName} • 📱 ${r.clientPhone} • 💰 ${apFmt(r.total||r.basePrice||0)} IQD</div>
    <div style="color:#556677;font-size:.72rem;margin-top:.25rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.desc}</div>
    ${r.files?.length?`<div style="color:#445566;font-size:.68rem;margin-top:.2rem">📎 ${r.files.length} ملف مرفق</div>`:''}
</div>`;
    }).join('');
}

function apOpenDetail(reqId){
    const reqs = apReqLoadAll();
    const req  = reqs.find(r=>r.id===reqId);
    if(!req) return;
    _apCurReq = reqId;

    const det = document.getElementById('ap_req_detail');
    det.style.display='';
    document.getElementById('ap_detail_lbl').textContent = req.serviceName+' — '+req.clientName;

    /* Info */
    const inf = document.getElementById('ap_detail_info');
    if(inf) inf.innerHTML=`
<b style="color:#fff">العميل:</b> ${req.clientName} &nbsp;|&nbsp; 📱 ${req.clientPhone}<br>
<b style="color:#fff">الكمية:</b> ${req.qty||1} ${req.priceUnit||''} &nbsp;|&nbsp; 💰 ${apFmt(req.total||req.basePrice||0)} IQD<br>
<b style="color:#fff">الوصف:</b> ${req.desc}
${req.files?.length?`<br><b style="color:#fff">الملفات:</b> ${req.files.map(f=>`<a href="${f.data}" download="${f.name}" style="color:#00e5ff;margin-left:.4rem">${f.name}</a>`).join('')}`:''}`;

    /* Status btns */
    document.querySelectorAll('[data-st]').forEach(btn=>{
        const active = btn.dataset.st===req.status;
        btn.style.background = active?'rgba(220,20,60,.25)':'rgba(255,255,255,.06)';
        btn.style.borderColor = active?'#dc143c':'rgba(255,255,255,.12)';
        btn.style.color = active?'#fff':'#aaa';
    });

    /* Chat */
    apRenderChat(req.messages||[]);
    det.scrollIntoView({behavior:'smooth'});
}

function apRenderChat(msgs){
    const el = document.getElementById('ap_chat');
    if(!el) return;
    if(!msgs.length){ el.innerHTML='<p style="color:#445566;text-align:center;font-size:.78rem">لا رسائل</p>'; return; }
    el.innerHTML = msgs.map(m=>`
<div style="margin-bottom:.4rem;text-align:${m.from==='admin'?'left':'right'}">
    <span style="display:inline-block;background:${m.from==='admin'?'rgba(0,229,255,.1)':m.from==='system'?'rgba(255,255,255,.04)':'rgba(220,20,60,.1)'};border:1px solid ${m.from==='admin'?'rgba(0,229,255,.2)':'rgba(255,255,255,.06)'};border-radius:9px;padding:5px 10px;color:${m.from==='admin'?'#00e5ff':m.from==='system'?'#445566':'#ccd'};font-size:.76rem;max-width:85%">
        ${m.from!=='system'?`<b style="font-size:.62rem;opacity:.6;display:block">${m.from==='admin'?'الإدارة':'العميل'}</b>`:''}${m.text}
    </span>
</div>`).join('');
    el.scrollTop=el.scrollHeight;
}

function apSetStatus(status){
    const reqs = apReqLoadAll();
    const req  = reqs.find(r=>r.id===_apCurReq);
    if(!req) return;
    req.status = status;
    (req.messages=req.messages||[]).push({from:'system',text:`تغيير الحالة → ${status}`,time:new Date().toLocaleTimeString('ar')});
    apSaveReqs(reqs);
    apOpenDetail(_apCurReq);
    apReqLoad();
    admToast?.('✅ تم تحديث الحالة','ok');
}

function apSendMsg(){
    const inp  = document.getElementById('ap_msg_inp');
    const text = inp?.value?.trim();
    if(!text||!_apCurReq) return;
    const reqs = apReqLoadAll();
    const req  = reqs.find(r=>r.id===_apCurReq);
    if(!req) return;
    (req.messages=req.messages||[]).push({from:'admin',text,time:new Date().toLocaleTimeString('ar')});
    apSaveReqs(reqs);
    if(inp) inp.value='';
    apRenderChat(req.messages);
    admToast?.('📤 تم الإرسال','ok');
}

function apDeliverChosen(inp){
    _apDeliverFiles=[...inp.files];
    const lbl=document.getElementById('ap_deliver_lbl');
    if(lbl) lbl.textContent=`✅ ${_apDeliverFiles.length} ملف جاهز`;
}

async function apDeliver(){
    if(!_apDeliverFiles.length){alert('⚠️ اختر ملفاً');return;}
    if(!_apCurReq) return;
    const filesData=[];
    for(const file of _apDeliverFiles){
        const b64=await new Promise(res=>{const r=new FileReader();r.onload=e=>res(e.target.result);r.readAsDataURL(file);});
        filesData.push({name:file.name,type:file.type,data:b64});
    }
    const reqs=apReqLoadAll();
    const req=reqs.find(r=>r.id===_apCurReq);
    if(!req) return;
    req.completedFiles=filesData;
    req.status='delivered';
    (req.messages=req.messages||[]).push({from:'admin',text:`📦 تم إرسال الشغل — ${filesData.length} ملف. افتح تتبع الطلب لتحميله.`,time:new Date().toLocaleTimeString('ar')});
    apSaveReqs(reqs);
    _apDeliverFiles=[];
    document.getElementById('ap_deliver_inp').value='';
    document.getElementById('ap_deliver_lbl').textContent='';
    apOpenDetail(_apCurReq);
    apReqLoad();
    admToast?.('📦 تم تسليم الشغل!','ok');
}

/* Load on tab open */
document.addEventListener('click',e=>{
    const btn=e.target?.closest?.('[data-tab]');
    if(!btn) return;
    if(btn.dataset.tab==='adm-requests')  setTimeout(apReqLoad,100);
    if(btn.dataset.tab==='adm-paid')      setTimeout(apRenderServicesList,100);
});

/* Exports */
Object.assign(window,{
    apShowForm,apSaveForm,apToggle,apDelete,apRenderServicesList,
    apReqLoad,apSetFilter,apOpenDetail,apSetStatus,apSendMsg,
    apDeliverChosen,apDeliver
});

console.log('%c🛡️ Admin Paid v2 — Ready','color:#dc143c;font-weight:900;background:#08080f;padding:4px 10px;border-radius:4px');