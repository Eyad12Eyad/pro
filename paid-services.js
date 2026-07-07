/* ================================================================
   paid-services.js v3 — Eyad_Eyad12
   نظام خدمات مدفوعة - حل نهائي بدون أخطاء
================================================================ */

const PS_KEY = 'ps_services_v3';
const PR_KEY = 'ps_requests_v3';

/* ════ Default Services ════ */
const PS_DEFAULTS = [
    {
        id:'ps1', active:true,
        name:'تصميم إعلان روم احترافي',
        desc:'إعلان ببجي موبايل مميز جاهز للنشر على السوشيال ميديا',
        price:3000, priceUnit:'للتصميم',
        timeVal:2, timeUnit:'hours',
        maxFiles:3, filesDesc:'حتى 3 صور مرجعية',
        icon:'fa-bullhorn', color:'#ff9800',
    },
    {
        id:'ps2', active:true,
        name:'مونتاج هايلايت',
        desc:'تحرير مقاطع احترافية من كيماتك مع موسيقى وتأثيرات مميزة',
        price:8000, priceUnit:'لكل مقطع',
        timeVal:6, timeUnit:'hours',
        maxFiles:5, filesDesc:'حتى 5 مقاطع فيديو',
        icon:'fa-film', color:'#dc143c',
    },
    {
        id:'ps3', active:true,
        name:'تصميم أوفرلي بث',
        desc:'أوفرلي احترافي مخصص لبثك مع ألوان وشعار فريقك',
        price:15000, priceUnit:'للتصميم',
        timeVal:12, timeUnit:'hours',
        maxFiles:2, filesDesc:'حتى 2 صورة شعار',
        icon:'fa-tv', color:'#aa44ff',
    },
    {
        id:'ps4', active:true,
        name:'تحرير فيديو كامل',
        desc:'تحرير احترافي لأي فيديو مع مونتاج وتأثيرات بصرية',
        price:20000, priceUnit:'لكل فيديو',
        timeVal:24, timeUnit:'hours',
        maxFiles:3, filesDesc:'حتى 3 فيديوهات',
        icon:'fa-video', color:'#44aaff',
    },
];

function psLoad(){ try{return JSON.parse(localStorage.getItem(PS_KEY)||'null')||JSON.parse(JSON.stringify(PS_DEFAULTS));}catch(_){return JSON.parse(JSON.stringify(PS_DEFAULTS));} }
function psSave(d){ localStorage.setItem(PS_KEY,JSON.stringify(d)); }
function prLoad(){ try{return JSON.parse(localStorage.getItem(PR_KEY)||'[]');}catch(_){return[];} }
function prSave(d){ localStorage.setItem(PR_KEY,JSON.stringify(d)); }

function fmtTime(val,unit){
    if(unit==='minutes') return val<60?val+' دقيقة':Math.round(val/60)+' ساعة';
    if(unit==='hours')   return val<24?val+' ساعة':Math.round(val/24)+' يوم';
    return val+' '+unit;
}

function formatPrice(p){ return Number(p).toLocaleString('ar-IQ'); }

/* ════ RENDER ════ */
function psRender(){
    const el = document.getElementById('ps_section');
    if(!el){ return; }
    const services = psLoad().filter(s=>s.active);
    if(!services.length){
        el.innerHTML='<div style="text-align:center;color:#445566;padding:3rem;font-size:.9rem">لا توجد خدمات مفعّلة حالياً</div>';
        return;
    }
    el.innerHTML=`
<style>
.psg{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.2rem}
.psc{background:linear-gradient(145deg,#0e0a18,#090810);border:1.5px solid rgba(255,255,255,.08);border-radius:20px;padding:1.5rem;position:relative;overflow:hidden;transition:transform .3s,box-shadow .3s,border-color .3s;display:flex;flex-direction:column;gap:.8rem}
.psc:hover{transform:translateY(-6px);border-color:var(--c);box-shadow:0 16px 40px rgba(0,0,0,.5),0 0 0 1px var(--c)}
.psc::before{content:'';position:absolute;top:-40px;right:-40px;width:120px;height:120px;border-radius:50%;background:var(--c);opacity:.07;pointer-events:none}
.psc-top{display:flex;align-items:flex-start;gap:.9rem}
.psc-icon{width:56px;height:56px;border-radius:15px;background:var(--c);display:flex;align-items:center;justify-content:center;font-size:1.5rem;color:#fff;flex-shrink:0;box-shadow:0 4px 14px var(--c-shadow)}
.psc-name{color:#fff;font-size:1rem;font-weight:800;line-height:1.3}
.psc-desc{color:#667788;font-size:.82rem;line-height:1.65;flex:1}
.psc-badges{display:flex;flex-wrap:wrap;gap:.4rem}
.psc-badge{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:3px 10px;font-size:.72rem;color:#9aabb8;display:flex;align-items:center;gap:4px;white-space:nowrap}
.psc-price-row{display:flex;align-items:center;justify-content:space-between;padding-top:.5rem;border-top:1px solid rgba(255,255,255,.06)}
.psc-price{font-size:1.5rem;font-weight:900;color:var(--c)}
.psc-price-unit{font-size:.72rem;color:#445566;font-weight:400;margin-top:2px}
.psc-btn{width:100%;padding:.8rem;border:none;border-radius:14px;font-weight:800;font-size:.9rem;cursor:pointer;font-family:inherit;background:var(--c);color:#fff;display:flex;align-items:center;justify-content:center;gap:7px;transition:all .25s;margin-top:.2rem}
.psc-btn:hover{filter:brightness(1.15);transform:translateY(-1px);box-shadow:0 8px 22px var(--c-shadow)}
.ps-track-wrap{text-align:center;margin-top:1.5rem}
.ps-track-btn{background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.12);color:#889aaa;padding:.65rem 1.8rem;border-radius:50px;cursor:pointer;font-family:inherit;font-size:.85rem;font-weight:600;transition:all .2s;display:inline-flex;align-items:center;gap:7px}
.ps-track-btn:hover{background:rgba(255,255,255,.12);color:#fff}
</style>
<div class="psg">
${services.map(s=>`
<div class="psc" style="--c:${s.color};--c-shadow:${s.color}44">
    <div class="psc-top">
        <div class="psc-icon"><i class="fas ${s.icon}"></i></div>
        <div class="psc-name">${s.name}</div>
    </div>
    <div class="psc-desc">${s.desc}</div>
    <div class="psc-badges">
        <span class="psc-badge"><i class="fas fa-clock"></i> ${fmtTime(s.timeVal,s.timeUnit)}</span>
        <span class="psc-badge"><i class="fas fa-paperclip"></i> ${s.filesDesc||'ملفات مرفقة'}</span>
        <span class="psc-badge"><i class="fas fa-check-circle" style="color:#44ee55"></i> جودة عالية</span>
    </div>
    <div class="psc-price-row">
        <div>
            <div class="psc-price">${formatPrice(s.price)} <span style="font-size:.7rem;font-weight:400">IQD</span></div>
            <div class="psc-price-unit">${s.priceUnit||''}</div>
        </div>
    </div>
    <button class="psc-btn" onclick="psOpenOrder('${s.id}')">
        <i class="fas fa-paper-plane"></i> اطلب الخدمة الآن
    </button>
</div>`).join('')}
</div>
<div class="ps-track-wrap">
    <button class="ps-track-btn" onclick="psOpenTrack()">
        <i class="fas fa-search"></i> تتبع طلبك
    </button>
</div>`;
}

/* ════ Order Modal ════ */
function psOpenOrder(sid){
    const srv = psLoad().find(s=>s.id===sid);
    if(!srv) return;
    document.getElementById('ps_order_modal')?.remove();
    const m = document.createElement('div');
    m.id='ps_order_modal';
    m.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:2rem 1rem;backdrop-filter:blur(6px);overflow-y:auto;-webkit-overflow-scrolling:touch';
    m.innerHTML=`
<style>
.psm{background:linear-gradient(145deg,#0e0a18,#080810);border:2px solid ${srv.color}44;border-radius:22px;padding:2rem;width:100%;max-width:520px;margin:auto 0;position:relative;animation:psmIn .35s cubic-bezier(.34,1.56,.64,1)}
@keyframes psmIn{from{opacity:0;transform:scale(.85) translateY(30px)}to{opacity:1;transform:scale(1)}}
.psm-x{position:absolute;top:1rem;left:1rem;background:rgba(255,255,255,.08);border:none;border-radius:9px;color:#aaa;width:34px;height:34px;cursor:pointer;font-size:1.2rem;font-family:inherit;display:flex;align-items:center;justify-content:center;transition:all .2s}
.psm-x:hover{background:rgba(255,50,50,.2);color:#f44}
.psm-h{color:#fff;font-size:1.1rem;font-weight:800;margin-bottom:1.2rem;display:flex;align-items:center;gap:.6rem}
.psm-svc{background:rgba(255,255,255,.05);border:1px solid ${srv.color}33;border-radius:13px;padding:.8rem 1rem;margin-bottom:1.2rem;display:flex;align-items:center;gap:.8rem}
.psm-svc-icon{width:42px;height:42px;border-radius:11px;background:${srv.color};display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.1rem;flex-shrink:0}
.psm-svc-name{color:#fff;font-weight:700;font-size:.92rem}
.psm-svc-price{color:${srv.color};font-size:.85rem;font-weight:700}
.psm-lbl{color:#889aaa;font-size:.74rem;font-weight:700;text-transform:uppercase;letter-spacing:.4px;margin-bottom:.3rem;display:block}
.psm-inp{width:100%;background:rgba(0,0,0,.5);border:1.5px solid rgba(255,255,255,.1);border-radius:10px;color:#fff;padding:.7rem 1rem;font-size:.88rem;font-family:inherit;box-sizing:border-box;transition:border-color .2s,box-shadow .2s;margin-bottom:.85rem}
.psm-inp:focus{outline:none;border-color:${srv.color};box-shadow:0 0 0 3px ${srv.color}22}
.psm-ta{min-height:100px;resize:vertical}
.psm-upload{background:rgba(255,255,255,.04);border:2px dashed rgba(255,255,255,.15);border-radius:13px;padding:1.1rem;text-align:center;cursor:pointer;transition:all .22s;margin-bottom:.85rem}
.psm-upload:hover{border-color:${srv.color};background:rgba(255,255,255,.07)}
.psm-upload i{font-size:1.8rem;color:${srv.color};display:block;margin-bottom:.3rem}
.psm-submit{width:100%;padding:.9rem;border:none;border-radius:13px;background:linear-gradient(135deg,${srv.color},${srv.color}cc);color:#fff;font-weight:900;font-size:.95rem;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .25s;margin-top:.5rem}
.psm-submit:hover{filter:brightness(1.12);transform:translateY(-1px);box-shadow:0 8px 24px ${srv.color}55}
.psm-submit:disabled{opacity:.5;cursor:not-allowed;transform:none}
.psm-files-info{color:#556677;font-size:.74rem;margin-top:.3rem}
.psm-qty{display:flex;align-items:center;gap:.4rem;margin-bottom:.85rem}
.psm-qty-btn{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff;width:36px;height:36px;border-radius:9px;font-size:1.2rem;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;transition:all .18s;flex-shrink:0}
.psm-qty-btn:hover{background:${srv.color}33;border-color:${srv.color}}
.psm-qty-val{flex:1;text-align:center;color:#fff;font-size:1.1rem;font-weight:800;background:rgba(0,0,0,.3);border-radius:9px;padding:.5rem;border:1px solid rgba(255,255,255,.1)}
.psm-total{background:${srv.color}11;border:1px solid ${srv.color}33;border-radius:11px;padding:.7rem 1rem;display:flex;align-items:center;justify-content:space-between;margin-bottom:.85rem}
.psm-total-lbl{color:#889aaa;font-size:.82rem}
.psm-total-price{color:${srv.color};font-size:1.2rem;font-weight:900}
</style>
<div class="psm">
    <button class="psm-x" onclick="document.getElementById('ps_order_modal').remove()">×</button>
    <div class="psm-h"><i class="fas fa-paper-plane" style="color:${srv.color}"></i> طلب جديد</div>

    <div class="psm-svc">
        <div class="psm-svc-icon"><i class="fas ${srv.icon}"></i></div>
        <div>
            <div class="psm-svc-name">${srv.name}</div>
            <div class="psm-svc-price">${formatPrice(srv.price)} IQD ${srv.priceUnit||''} • ${fmtTime(srv.timeVal,srv.timeUnit)}</div>
        </div>
    </div>

    <label class="psm-lbl">اسمك الكامل *</label>
    <input class="psm-inp" id="psm_name" placeholder="مثال: أحمد محمد">

    <label class="psm-lbl">رقم هاتفك *</label>
    <input class="psm-inp" id="psm_phone" placeholder="07X XXXX XXXX" type="tel">

    ${srv.filesDesc&&srv.filesDesc.includes('3')||srv.priceUnit?.includes('صورة')||srv.priceUnit?.includes('فيديو')||srv.priceUnit?.includes('مقطع')?`
    <label class="psm-lbl">الكمية (${srv.priceUnit||'قطعة'})</label>
    <div class="psm-qty">
        <button class="psm-qty-btn" onclick="psmChangeQty(-1)">−</button>
        <div class="psm-qty-val" id="psm_qty">1</div>
        <button class="psm-qty-btn" onclick="psmChangeQty(1)">+</button>
    </div>
    <div class="psm-total">
        <span class="psm-total-lbl">الإجمالي</span>
        <span class="psm-total-price" id="psm_total">${formatPrice(srv.price)} IQD</span>
    </div>`:''}

    <label class="psm-lbl">وصف الطلب بالتفصيل *</label>
    <textarea class="psm-inp psm-ta" id="psm_desc" placeholder="صف ما تريد بالتفصيل — كلما كان الوصف أدق كانت النتيجة أفضل..."></textarea>

    <label class="psm-lbl">الملفات المرفقة ${srv.filesDesc?'('+srv.filesDesc+')':''} — اختياري</label>
    <div class="psm-upload" onclick="document.getElementById('psm_files').click()">
        <i class="fas fa-cloud-upload-alt"></i>
        <span id="psm_files_lbl" style="color:#667788;font-size:.82rem">اضغط لرفع الصور أو الفيديو</span>
        <input type="file" id="psm_files" multiple accept="image/*,video/*" style="display:none"
            onchange="psmFilesChanged(this,${srv.maxFiles||10})">
    </div>
    <div id="psm_files_list" class="psm-files-info"></div>

    <button class="psm-submit" id="psm_submit" onclick="psSubmitOrder('${sid}',${srv.price})">
        <i class="fas fa-paper-plane"></i> إرسال الطلب
    </button>
</div>`;
    document.body.appendChild(m);
    m.addEventListener('click',e=>{ if(e.target===m) m.remove(); });

    /* qty vars */
    window._psmQty = 1;
    window._psmBasePrice = srv.price;
}

function psmChangeQty(d){
    window._psmQty = Math.max(1, (window._psmQty||1)+d);
    const el = document.getElementById('psm_qty');
    const tel = document.getElementById('psm_total');
    if(el) el.textContent = window._psmQty;
    if(tel) tel.textContent = formatPrice((window._psmBasePrice||0) * window._psmQty) + ' IQD';
}

function psmFilesChanged(inp, maxFiles){
    const files = [...inp.files].slice(0, maxFiles||10);
    if(inp.files.length > maxFiles){
        alert(`⚠️ الحد الأقصى ${maxFiles} ملفات — تم اختيار أول ${maxFiles} فقط`);
        // We'll still process the first maxFiles
    }
    const lbl = document.getElementById('psm_files_lbl');
    const list = document.getElementById('psm_files_list');
    if(lbl) lbl.textContent = `✅ ${files.length} ملف مختار`;
    if(list) list.innerHTML = files.map(f=>
        `<div>📎 ${f.name} <span style="color:#445566">(${(f.size/1024).toFixed(0)} KB)</span></div>`
    ).join('');
}

async function psSubmitOrder(sid, basePrice){
    const name  = document.getElementById('psm_name')?.value?.trim();
    const phone = document.getElementById('psm_phone')?.value?.trim();
    const desc  = document.getElementById('psm_desc')?.value?.trim();
    if(!name||!phone||!desc){ alert('⚠️ يرجى تعبئة الاسم والهاتف والوصف'); return; }

    const btn = document.getElementById('psm_submit');
    if(btn){ btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...'; }

    const srv = psLoad().find(s=>s.id===sid);
    const qty = window._psmQty||1;
    const total = basePrice * qty;

    /* Convert files to base64 */
    const filesInp = document.getElementById('psm_files');
    const filesData = [];
    if(filesInp?.files?.length){
        for(const file of [...filesInp.files].slice(0,srv?.maxFiles||10)){
            if(file.size > 15*1024*1024) continue;
            const b64 = await new Promise(res=>{
                const r=new FileReader(); r.onload=e=>res(e.target.result); r.readAsDataURL(file);
            });
            filesData.push({name:file.name,type:file.type,data:b64,size:file.size});
        }
    }

    const req = {
        id:'req_'+Date.now(),
        serviceId:sid,
        serviceName:srv?.name||sid,
        serviceColor:srv?.color||'#dc143c',
        serviceIcon:srv?.icon||'fa-star',
        clientName:name, clientPhone:phone, desc,
        qty, total, basePrice,
        files:filesData,
        status:'pending',
        createdAt:new Date().toISOString(),
        completedFiles:[],
        messages:[{from:'system',text:`طلب جديد: ${srv?.name} × ${qty} — الإجمالي: ${formatPrice(total)} IQD`,time:new Date().toLocaleTimeString('ar')}]
    };

    const reqs = prLoad();
    reqs.push(req);
    prSave(reqs);

    try{ new BroadcastChannel('ps_requests').postMessage({type:'NEW',req}); }catch(_){}

    document.getElementById('ps_order_modal')?.remove();
    psShowSuccess(req);
}

function psShowSuccess(req){
    const m=document.createElement('div');
    m.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:2rem 1rem;backdrop-filter:blur(6px);overflow-y:auto;-webkit-overflow-scrolling:touch';
    m.innerHTML=`
<div style="background:linear-gradient(145deg,#0e0a18,#080810);border:2px solid rgba(68,238,85,.3);border-radius:22px;padding:2rem;max-width:420px;width:100%;text-align:center;animation:psmIn .35s cubic-bezier(.34,1.56,.64,1)">
    <div style="font-size:3.5rem;margin-bottom:.7rem">🎉</div>
    <h3 style="color:#44ee55;font-size:1.2rem;font-weight:800;margin-bottom:.6rem">تم إرسال طلبك بنجاح!</h3>
    <div style="background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:.9rem;margin-bottom:1rem">
        <div style="color:#889aaa;font-size:.78rem;margin-bottom:.3rem">رقم الطلب</div>
        <div style="color:#fff;font-family:monospace;font-size:.88rem;font-weight:700">${req.id}</div>
    </div>
    <div style="color:#667788;font-size:.82rem;line-height:1.7;margin-bottom:1rem">
        📱 سيتم التواصل معك على<br>
        <b style="color:#fff">${req.clientPhone}</b><br>
        <b style="color:#ffd700">${formatPrice(req.total)} IQD</b>
    </div>
    <button onclick="this.closest('div[style*=fixed]').remove()" style="width:100%;padding:.8rem;background:linear-gradient(135deg,#44ee55,#22aa33);border:none;border-radius:12px;color:#000;font-weight:900;cursor:pointer;font-family:inherit;font-size:.9rem">
        حسناً ✓
    </button>
    <button onclick="psOpenTrack();this.closest('div[style*=fixed]').remove()" style="width:100%;padding:.65rem;background:transparent;border:1px solid rgba(255,255,255,.15);border-radius:12px;color:#aaa;font-weight:600;cursor:pointer;font-family:inherit;font-size:.82rem;margin-top:.5rem">
        تتبع طلبي
    </button>
</div>`;
    document.body.appendChild(m);
    m.addEventListener('click',e=>{ if(e.target===m) m.remove(); });
    /* Confetti */
    if(window.fxConfetti) fxConfetti(window.innerWidth/2, window.innerHeight/3);
}

/* ════ Track Modal ════ */
function psOpenTrack(){
    document.getElementById('ps_track_modal')?.remove();
    const m=document.createElement('div');
    m.id='ps_track_modal';
    m.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:2rem 1rem;backdrop-filter:blur(6px);overflow-y:auto;-webkit-overflow-scrolling:touch';
    m.innerHTML=`
<div style="background:linear-gradient(145deg,#0e0a18,#080810);border:2px solid rgba(220,20,60,.25);border-radius:22px;padding:1.8rem;max-width:500px;width:100%;max-height:85vh;overflow-y:auto;animation:psmIn .35s cubic-bezier(.34,1.56,.64,1)">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.2rem">
        <h3 style="color:#fff;font-size:1rem;font-weight:800"><i class="fas fa-search" style="color:#dc143c;margin-left:.5rem"></i>تتبع طلبك</h3>
        <button onclick="document.getElementById('ps_track_modal').remove()" style="background:rgba(255,255,255,.08);border:none;border-radius:8px;color:#aaa;width:32px;height:32px;cursor:pointer;font-size:1.1rem;font-family:inherit">×</button>
    </div>
    <div style="display:flex;gap:.4rem;margin-bottom:1rem">
        <input id="pt_q" placeholder="رقم هاتفك أو رقم الطلب" style="flex:1;background:rgba(0,0,0,.4);border:1.5px solid rgba(220,20,60,.25);border-radius:10px;color:#fff;padding:.65rem .9rem;font-size:.85rem;font-family:inherit;outline:none">
        <button onclick="ptSearch()" style="background:linear-gradient(135deg,#dc143c,#880000);border:none;border-radius:10px;color:#fff;padding:.65rem 1rem;font-weight:700;cursor:pointer;font-family:inherit">بحث</button>
    </div>
    <div id="pt_results"></div>
</div>`;
    document.body.appendChild(m);
    m.addEventListener('click',e=>{ if(e.target===m) m.remove(); });
}

function ptSearch(){
    const q = document.getElementById('pt_q')?.value?.trim();
    if(!q){alert('أدخل رقم الهاتف أو رقم الطلب');return;}
    const reqs = prLoad().filter(r=>
        r.clientPhone?.replace(/\s/g,'')===q.replace(/\s/g,'') ||
        r.id===q
    ).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    const el=document.getElementById('pt_results');
    if(!el)return;
    if(!reqs.length){el.innerHTML='<p style="color:#556677;text-align:center;font-size:.85rem;padding:1rem">لا توجد طلبات بهذا الرقم</p>';return;}
    const stMap={
        pending  :{l:'⏳ قيد الانتظار', c:'#ffd700'},
        inprogress:{l:'⚙️ جاري العمل',   c:'#00e5ff'},
        completed:{l:'✅ اكتمل',          c:'#44ee55'},
        delivered:{l:'📦 تم التسليم',     c:'#aa66ff'},
    };
    el.innerHTML=reqs.map(r=>{
        const st=stMap[r.status]||stMap.pending;
        const adminMsgs=(r.messages||[]).filter(m=>m.from==='admin');
        return `
<div style="background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.07);border-radius:14px;padding:1rem;margin-bottom:.7rem">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">
        <div style="color:#fff;font-weight:700;font-size:.88rem">${r.serviceName}</div>
        <span style="background:rgba(0,0,0,.4);border:1px solid ${st.c};color:${st.c};padding:2px 10px;border-radius:20px;font-size:.7rem;font-weight:700">${st.l}</span>
    </div>
    <div style="color:#667788;font-size:.76rem;margin-bottom:.4rem">
        ${new Date(r.createdAt).toLocaleDateString('ar')} • ${formatPrice(r.total||r.basePrice||0)} IQD × ${r.qty||1}
    </div>
    ${adminMsgs.length?`<div style="background:rgba(0,229,255,.07);border:1px solid rgba(0,229,255,.2);border-radius:9px;padding:.55rem .8rem;margin-bottom:.4rem">
        <div style="color:#00e5ff;font-size:.7rem;font-weight:700;margin-bottom:.15rem">💬 رسالة من الإدارة:</div>
        <div style="color:#ccd;font-size:.8rem">${adminMsgs[adminMsgs.length-1].text}</div>
    </div>`:''}
    ${r.completedFiles?.length?r.completedFiles.map(f=>`
        <a href="${f.data}" download="${f.name}" style="display:inline-flex;align-items:center;gap:5px;background:linear-gradient(135deg,#44ee55,#22aa33);border:none;border-radius:8px;color:#000;padding:6px 14px;font-weight:700;font-size:.8rem;text-decoration:none;margin-top:.3rem">
            <i class="fas fa-download"></i> ${f.name}
        </a>`).join(''):''}
</div>`;
    }).join('');
}

/* ════ Smart Init — يراقب كل الطرق الممكنة ════ */
(function init(){
    /* 1. When DOM ready */
    const tryRender = ()=>{
        if(document.getElementById('ps_section')) { psRender(); return true; }
        return false;
    };

    /* 2. Watch for ps_section to appear */
    const obs = new MutationObserver(()=>{ if(tryRender()) obs.disconnect(); });

    /* 3. Watch nav clicks to paid-services */
    const watchNav=()=>{
        document.querySelectorAll('a[href="#paid-services"],a[href*="paid"]').forEach(a=>{
            a.addEventListener('click',()=>setTimeout(psRender,120));
        });
        /* Also patch showSection if exists */
        const origShow = window.showSection;
        if(origShow){
            window.showSection = function(id){
                origShow.call(this,id);
                if(id==='paid-services') setTimeout(psRender,120);
            };
        }
    };

    /* 4. Watch section becoming active via class */
    const watchActive=()=>{
        const sec = document.getElementById('paid-services');
        if(!sec) return;
        new MutationObserver(()=>{
            if(sec.classList.contains('active')) setTimeout(psRender,80);
        }).observe(sec,{attributes:true,attributeFilter:['class']});
    };

    if(document.readyState==='loading'){
        document.addEventListener('DOMContentLoaded',()=>{
            obs.observe(document.body,{childList:true,subtree:true});
            if(!tryRender()){
                setTimeout(tryRender,300);
                setTimeout(tryRender,800);
                setTimeout(tryRender,1500);
            }
            watchNav(); watchActive();
        });
    } else {
        obs.observe(document.body,{childList:true,subtree:true});
        if(!tryRender()){
            setTimeout(tryRender,200);
            setTimeout(tryRender,600);
            setTimeout(tryRender,1200);
        }
        watchNav(); watchActive();
    }

    window.addEventListener('load',()=>{ setTimeout(tryRender,300); watchNav(); watchActive(); });
})();

/* ════ Exports ════ */
window.psRender      = psRender;
window.psOpenOrder   = psOpenOrder;
window.psOpenTrack   = psOpenTrack;
window.ptSearch      = ptSearch;
window.psmChangeQty  = psmChangeQty;
window.psmFilesChanged = psmFilesChanged;
window.psSubmitOrder = psSubmitOrder;
window.psLoad        = psLoad;
window.psSave        = psSave;
window.prLoad        = prLoad;
window.prSave        = prSave;
window.PS_KEY        = PS_KEY;
window.PR_KEY        = PR_KEY;

console.log('%c💎 Paid Services v3 — Ready','color:#ffd700;font-weight:900;background:#0a0000;padding:4px 10px;border-radius:4px');