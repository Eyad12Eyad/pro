/* ============================================================
   script.js — Eyad_Eyad12 — نسخة تعمل 100%
   الخدمات: Web Audio API + MediaRecorder (بدون سيرفر)
   تأثير النار: Canvas
   ============================================================ */


/* ════════════════ بيانات المستخدمين ════════════════ */
const serviceUsers = {
    'eyad1'    :{ password:'eyad2024@',    registeredDate:'2025-01-01', expiryDate:'2027-12-31', usageCount:0, subscriptionType:'شهري'  },
    'ahmad'    :{ password:'ahmad123#',    registeredDate:'2025-01-01', expiryDate:'2027-12-31', usageCount:0, subscriptionType:'شهري'  },
    'mohammed' :{ password:'mo2024$',      registeredDate:'2025-01-01', expiryDate:'2027-12-31', usageCount:0, subscriptionType:'شهري'  },
    'ali'      :{ password:'ali999*',      registeredDate:'2025-01-01', expiryDate:'2027-12-31', usageCount:0, subscriptionType:'شهري'  },
    'hassan'   :{ password:'hassan777!',   registeredDate:'2025-01-01', expiryDate:'2027-12-31', usageCount:0, subscriptionType:'شهري'  },
    'omar'     :{ password:'omar2024&',    registeredDate:'2025-01-01', expiryDate:'2027-12-31', usageCount:0, subscriptionType:'شهري'  },
    'youssef'  :{ password:'youssef555%',  registeredDate:'2025-01-01', expiryDate:'2027-12-31', usageCount:0, subscriptionType:'أسبوعي'},
    'khalid'   :{ password:'khalid333^',   registeredDate:'2025-01-01', expiryDate:'2027-12-31', usageCount:0, subscriptionType:'شهري'  },
    'salem'    :{ password:'salem888(',    registeredDate:'2025-01-01', expiryDate:'2027-12-31', usageCount:0, subscriptionType:'شهري'  },
    'rami'     :{ password:'rami2024)',    registeredDate:'2025-01-01', expiryDate:'2027-12-31', usageCount:0, subscriptionType:'يومي'  }
};
const adminCreds = { username:'admin', password:'admin2025' };

let currentService = { id:'', name:'' };
let currentPurchase     = { amount:'', price:'' };
let currentSubscription = { type:'', price:'' };
let loggedInUser = null;
let uploadedFile = null;
let selectedFormat = '';
let trimMode = 'range';

/* ════════════════ localStorage ════════════════ */
function loadData() {
    try {
        const s = localStorage.getItem('serviceUsers');
        if (s) Object.assign(serviceUsers, JSON.parse(s));
        else   localStorage.setItem('serviceUsers', JSON.stringify(serviceUsers));
    } catch(e){}
}
function saveData() {
    try { localStorage.setItem('serviceUsers', JSON.stringify(serviceUsers)); } catch(e){}
}

/* ════════════════ خلفية جزيئات + نجوم ════════════════ */
function createParticles() {
    const div = document.getElementById('particles'); if (!div) return;
    for (let i = 0; i < 50; i++) {
        const p = document.createElement('div'); p.className='particle';
        p.style.right = Math.random()*100+'%';
        p.style.animationDelay    = Math.random()*12+'s';
        p.style.animationDuration = (8+Math.random()*10)+'s';
        div.appendChild(p);
    }
}
function createStars() {
    const div = document.getElementById('stars'); if (!div) return;
    for (let i = 0; i < 150; i++) {
        const s = document.createElement('div'); s.className='star';
        s.style.right = Math.random()*100+'%';
        s.style.top   = Math.random()*100+'%';
        s.style.animationDelay = Math.random()*4+'s';
        div.appendChild(s);
    }
}

/* ════════════════ تنقل ════════════════ */
const navLinks  = document.querySelectorAll('.nav-link');
const sections  = document.querySelectorAll('.section');
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('navMenu');

navLinks.forEach(link => {
    link.addEventListener('click', e => {
        if (link.classList.contains('admin-link')) return;
        e.preventDefault();
        navLinks.forEach(l=>{ if(!l.classList.contains('admin-link')) l.classList.remove('active'); });
        link.classList.add('active');
        sections.forEach(s=>s.classList.remove('active'));
        const id = link.getAttribute('href').substring(1);
        document.getElementById(id)?.classList.add('active');
        navMenu?.classList.remove('active');
        hamburger?.classList.remove('active');
        window.scrollTo({top:0,behavior:'smooth'});
    });
});
hamburger?.addEventListener('click', ()=>{
    navMenu?.classList.toggle('active');
    hamburger.classList.toggle('active');
});
function scrollToSection(id) {
    sections.forEach(s=>s.classList.remove('active'));
    document.getElementById(id)?.classList.add('active');
    navLinks.forEach(l=>{ l.classList.remove('active'); if(l.getAttribute('href')==='#'+id) l.classList.add('active'); });
    window.scrollTo({top:0,behavior:'smooth'});
}

/* ════════════════ إرسال رسالة ════════════════ */
function sendMessage(e) {
    e.preventDefault();
    const f=e.target;
    const data={
        id:Date.now(), timestamp:new Date().toLocaleString('ar-IQ'),
        name:f.querySelector('input[type=text]')?.value||'',
        email:f.querySelector('input[type=email]')?.value||'',
        message:f.querySelector('textarea')?.value||'', read:false
    };
    const arr=JSON.parse(localStorage.getItem('messages')||'[]');
    arr.push(data); localStorage.setItem('messages',JSON.stringify(arr));
    alert('✅ تم إرسال رسالتك بنجاح!'); f.reset();
}

/* ════════════════ شراء ════════════════ */
function openPurchaseModal(amount,price){
    currentPurchase={amount,price};
    setText('purchaseAmount',amount+' شدة'); setText('purchasePrice',price+' IQD');
    document.getElementById('purchaseForm')?.reset();
    setText('fileLabel','اختر صورة إثبات الدفع');
    const p=document.getElementById('imagePreview'); if(p) p.innerHTML='';
    showModal('purchaseModal');
}
function closePurchaseModal(){ hideModal('purchaseModal'); }
function handleFileSelect(input){
    if(!input.files[0]) return;
    setText('fileLabel',input.files[0].name);
    previewImage(input.files[0],'imagePreview');
}
function submitPurchase(e){
    e.preventDefault();
    if(!document.getElementById('paymentProof')?.files?.length){alert('⚠️ أرفق صورة إثبات الدفع!');return;}
    const gn=document.getElementById('gameName')?.value.trim();
    const gi=document.getElementById('gameId')?.value.trim();
    const ph=document.getElementById('phoneNumber')?.value.trim();
    if(!gn){alert('⚠️ أدخل اسمك في اللعبة');return;}
    if(!gi){alert('⚠️ أدخل رقم ID');return;}
    if(!ph){alert('⚠️ أدخل رقم الهاتف');return;}
    const order={id:Date.now(),timestamp:new Date().toLocaleString('ar-IQ'),
        amount:currentPurchase.amount,price:currentPurchase.price,
        gameName:gn,gameId:gi,phoneNumber:ph,
        cardName:document.getElementById('cardName')?.value.trim()||'غير محدد',
        paymentStatus:'قيد المراجعة'};
    const arr=JSON.parse(localStorage.getItem('orders')||'[]');
    arr.push(order); localStorage.setItem('orders',JSON.stringify(arr));
    closePurchaseModal(); showModal('successModal');
}
function closeSuccessModal(){ hideModal('successModal'); }

function purchaseSubscription(type,price){
    currentSubscription={type,price};
    setText('subType',type); setText('subPrice',price+' IQD');
    document.getElementById('subscriptionForm')?.reset();
    setText('subFileLabel','اختر صورة إثبات الدفع');
    const p=document.getElementById('subImagePreview'); if(p) p.innerHTML='';
    showModal('subscriptionModal');
}
function closeSubscriptionModal(){ hideModal('subscriptionModal'); }
function handleSubFileSelect(input){
    if(!input.files[0]) return;
    setText('subFileLabel',input.files[0].name);
    previewImage(input.files[0],'subImagePreview');
}
function submitSubscription(e){
    e.preventDefault();
    if(!document.getElementById('subPaymentProof')?.files?.length){alert('⚠️ أرفق صورة!');return;}
    const name=document.getElementById('subName')?.value.trim();
    const email=document.getElementById('subEmail')?.value.trim();
    const phone=document.getElementById('subPhone')?.value.trim();
    if(!name||!email||!phone){alert('⚠️ أكمل جميع الحقول');return;}
    const sub={id:Date.now(),timestamp:new Date().toLocaleString('ar-IQ'),
        type:currentSubscription.type,price:currentSubscription.price,
        name,email,phone,status:'قيد المراجعة'};
    const arr=JSON.parse(localStorage.getItem('subscriptions')||'[]');
    arr.push(sub); localStorage.setItem('subscriptions',JSON.stringify(arr));
    closeSubscriptionModal();
    alert('✅ تم إرسال طلب الاشتراك!\nسنتواصل خلال 24 ساعة.');
}

/* ════════════════ تسجيل دخول الخدمة ════════════════ */
function checkServiceAccess(serviceId,serviceName){
    currentService={id:serviceId,name:serviceName};
    setText('currentServiceName',serviceName);
    document.getElementById('serviceLoginForm')?.reset();
    const err=document.getElementById('serviceLoginError');
    if(err){err.textContent='';err.classList.remove('active');}
    showModal('serviceLoginModal');
}
function closeServiceLogin(){ hideModal('serviceLoginModal'); }
function loginToService(e){
    e.preventDefault();
    const username=document.getElementById('serviceUsername')?.value.trim();
    const password=document.getElementById('servicePassword')?.value;
    const err=document.getElementById('serviceLoginError');
    const showErr=msg=>{if(err){err.textContent=msg;err.classList.add('active');}};
    if(!username||!password){showErr('❌ أدخل اسم المستخدم وكلمة المرور!');return;}
    if(!serviceUsers[username]){showErr('❌ اسم المستخدم غير موجود!');return;}
    const user=serviceUsers[username];
    if(user.password!==password){showErr('❌ كلمة المرور غير صحيحة!');return;}
    if(new Date()>new Date(user.expiryDate)){showErr('⚠️ اشتراكك منتهٍ! تواصل معنا للتجديد.');return;}
    loggedInUser=username;
    user.usageCount++;
    logServiceUsage(username,currentService.name);
    saveData();
    closeServiceLogin();
    openService(currentService.id,currentService.name);
}

/* ════════════════ وضع التقطيع ════════════════ */
function setTrimMode(btn,mode){
    trimMode=mode;
    btn.closest('.trim-mode-selector')?.querySelectorAll('.mode-btn')
       .forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('rangeMode').style.display    = mode==='range'    ?'block':'none';
    document.getElementById('segmentsMode').style.display = mode==='segments' ?'block':'none';
}

/* ════════════════ فتح الخدمة ════════════════ */
function openService(serviceId,serviceName){
    const modal=document.getElementById('serviceModal');
    const title=document.getElementById('serviceModalTitle');
    const content=document.getElementById('serviceModalContent');
    if(!modal||!title||!content) return;
    title.textContent=serviceName;
    uploadedFile=null; selectedFormat=''; trimMode='range';

    const upVideo=id=>`
        <div class="upload-area" onclick="document.getElementById('${id}').click()">
            <i class="fas fa-film"></i><p>اضغط لرفع الفيديو</p>
            <small>MP4 · WebM · MOV · AVI</small>
            <input type="file" id="${id}" accept="video/*" style="display:none"
                   onchange="handleMediaUpload(this)">
        </div><div id="fileInfo" class="file-info-display"></div>`;

    const upAudio=id=>`
        <div class="upload-area" onclick="document.getElementById('${id}').click()">
            <i class="fas fa-headphones"></i><p>اضغط لرفع الملف الصوتي</p>
            <small>MP3 · WAV · AAC · OGG · FLAC</small>
            <input type="file" id="${id}" accept="audio/*" style="display:none"
                   onchange="handleMediaUpload(this)">
        </div><div id="fileInfo" class="file-info-display"></div>`;

    const trimUI=`
        <div class="trim-mode-selector">
            <button class="mode-btn active" onclick="setTrimMode(this,'range')">
                <i class="fas fa-arrows-alt-h"></i> من ثانية إلى ثانية
            </button>
            <button class="mode-btn" onclick="setTrimMode(this,'segments')">
                <i class="fas fa-layer-group"></i> مقاطع متعددة
            </button>
        </div>
        <div id="rangeMode" class="trim-controls">
            <div class="time-grid">
                <div class="form-group">
                    <label><i class="fas fa-play"></i> من (ثانية)</label>
                    <input type="number" id="startSec" min="0" value="0" class="service-input">
                </div>
                <div class="trim-arrow">→</div>
                <div class="form-group">
                    <label><i class="fas fa-stop"></i> إلى (ثانية)</label>
                    <input type="number" id="endSec" min="1" value="30" class="service-input">
                </div>
            </div>
        </div>
        <div id="segmentsMode" class="trim-controls" style="display:none">
            <div class="form-group">
                <label><i class="fas fa-list"></i> مقاطع (بداية-نهاية مفصولة بفاصلة)</label>
                <input type="text" id="segmentsInput" class="service-input"
                       placeholder="مثال: 0-10, 20-35, 50-70">
            </div>
        </div>`;

    const fmtBtns=(fmts,def='')=>fmts.map(f=>
        `<button class="format-btn${f===def?' active':''}" onclick="selectFmt(this,'${f}')">${f.toUpperCase()}</button>`
    ).join('');

    const res=`<div class="service-result" id="serviceResult"></div>`;

    const views={
        'video-trimmer':`<div class="service-interface">
            ${upVideo('vTrimFile')}${trimUI}
            <button class="action-btn-service" id="mainBtn" onclick="doVideoTrim()" disabled>
                <i class="fas fa-cut"></i> تقطيع الفيديو
            </button>${res}</div>`,

        'converter':`<div class="service-interface">
            ${upVideo('vConvFile')}
            <div class="format-selector"><h4>تحويل إلى:</h4>
                <div class="formats-grid">${fmtBtns(['mp4','webm'],'mp4')}</div>
                <small style="color:#888;display:block;margin-top:8px">
                    ✅ MP4 و WebM مدعومان بالكامل في المتصفح
                </small>
            </div>
            <button class="action-btn-service" id="mainBtn" onclick="doVideoConvert()" disabled>
                <i class="fas fa-exchange-alt"></i> تحويل الفيديو
            </button>${res}</div>`,

        'audio-extractor':`<div class="service-interface">
            ${upVideo('vExtFile')}
            <div class="format-selector"><h4>صيغة الصوت:</h4>
                <div class="formats-grid">${fmtBtns(['mp3','wav','ogg'],'mp3')}</div>
            </div>
            <button class="action-btn-service" id="mainBtn" onclick="doExtractAudio()" disabled>
                <i class="fas fa-volume-up"></i> استخراج الصوت
            </button>${res}</div>`,

        'audio-trimmer':`<div class="service-interface">
            ${upAudio('aTrimFile')}${trimUI}
            <button class="action-btn-service" id="mainBtn" onclick="doAudioTrim()" disabled>
                <i class="fas fa-scissors"></i> تقطيع الصوت
            </button>${res}</div>`,

        'audio-converter':`<div class="service-interface">
            ${upAudio('aConvFile')}
            <div class="format-selector"><h4>تحويل إلى:</h4>
                <div class="formats-grid">${fmtBtns(['mp3','wav','ogg'],'mp3')}</div>
            </div>
            <button class="action-btn-service" id="mainBtn" onclick="doAudioConvert()" disabled>
                <i class="fas fa-exchange-alt"></i> تحويل الصوت
            </button>${res}</div>`,

        'compressor':`<div class="service-interface">
            ${upVideo('vCompFile')}
            <div class="format-selector"><h4>مستوى الضغط:</h4>
                <div class="formats-grid">
                    <button class="format-btn" onclick="selectFmt(this,'high')">جودة عالية</button>
                    <button class="format-btn active" onclick="selectFmt(this,'medium')">متوسط ✓</button>
                    <button class="format-btn" onclick="selectFmt(this,'low')">ضغط عالي</button>
                    <button class="format-btn" onclick="selectFmt(this,'ultra')">أقصى ضغط</button>
                </div>
            </div>
            <button class="action-btn-service" id="mainBtn" onclick="doCompress()" disabled>
                <i class="fas fa-compress"></i> ضغط الفيديو
            </button>${res}</div>`
    };

    selectedFormat = views[serviceId]?.includes("'mp4'") ? 'mp4'
                   : views[serviceId]?.includes("'mp3'") ? 'mp3'
                   : 'medium';
    content.innerHTML = views[serviceId] || '<p style="color:#bbb;text-align:center">الخدمة غير متوفرة</p>';

    // تصحيح القيمة الافتراضية للضغط
    if (serviceId === 'compressor') selectedFormat = 'medium';
    if (serviceId === 'audio-extractor' || serviceId === 'audio-converter') selectedFormat = 'mp3';
    if (serviceId === 'converter') selectedFormat = 'mp4';

    showModal('serviceModal');
}
function closeServiceModal(){ hideModal('serviceModal'); }

function handleMediaUpload(input){
    const file=input.files[0]; if(!file) return;
    uploadedFile=file;
    const mb=(file.size/1048576).toFixed(2);
    const fi=document.getElementById('fileInfo');
    if(fi) fi.innerHTML=`<div class="file-info">
        <p><i class="fas fa-file" style="color:#dc143c"></i> <strong>الملف:</strong> ${esc(file.name)}</p>
        <p><i class="fas fa-hdd" style="color:#dc143c"></i> <strong>الحجم:</strong> ${mb} MB</p>
        <p><i class="fas fa-check-circle" style="color:#4CAF50"></i> <strong>الحالة:</strong> جاهز ✅</p>
    </div>`;
    const btn=document.getElementById('mainBtn'); if(btn) btn.disabled=false;
    // معاينة فورية للخدمات الجديدة
    if(typeof showPreview === 'function') showPreview(file);
}

function selectFmt(btn,fmt){
    btn.closest('.formats-grid')?.querySelectorAll('.format-btn')
       .forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    selectedFormat=fmt;
}

/* ════════════════════════════════════════════════════
   ✂️ تقطيع الفيديو — MediaRecorder (حقيقي)
   ════════════════════════════════════════════════════ */
async function doVideoTrim(){
    if(!uploadedFile){alert('⚠️ ارفع فيديو أولاً');return;}
    const segs=parseSegs(); if(!segs) return;
    const res=document.getElementById('serviceResult');
    setProcessing(res,'جاري تقطيع الفيديو...');
    try{
        const blobs=[];
        for(const seg of segs){
            const b=await captureVideoSlice(uploadedFile,seg.start,seg.end);
            blobs.push(b);
        }
        const final=new Blob(blobs,{type:blobs[0].type});
        const url=URL.createObjectURL(final);
        const name=baseName(uploadedFile.name)+'_trimmed.webm';
        setSuccess(res,url,name,{
            'المقاطع':segs.map(s=>`${s.start}ث → ${s.end}ث`).join(' | '),
            'الحجم':toMB(final)+' MB','الصيغة':'WebM'
        });
    }catch(err){
        setError(res,'خطأ: '+err.message);
        console.error(err);
    }
}

function captureVideoSlice(file,startSec,endSec){
    return new Promise((resolve,reject)=>{
        const vid=document.createElement('video');
        vid.src=URL.createObjectURL(file);
        vid.muted=false; vid.preload='auto';
        vid.addEventListener('error',()=>reject(new Error('تعذّر تحميل الفيديو')));
        vid.addEventListener('loadedmetadata',()=>{
            if(endSec>vid.duration){
                reject(new Error(`الفيديو مدته ${vid.duration.toFixed(1)}ث فقط — النهاية (${endSec}ث) تتجاوزها`));
                return;
            }
            vid.currentTime=startSec;
        });
        vid.addEventListener('seeked',function handler(){
            vid.removeEventListener('seeked',handler);
            const stream=vid.captureStream?vid.captureStream():vid.mozCaptureStream?.();
            if(!stream){reject(new Error('المتصفح لا يدعم captureStream'));return;}
            const mime=MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
                ?'video/webm;codecs=vp9,opus':'video/webm';
            const chunks=[]; const rec=new MediaRecorder(stream,{mimeType:mime});
            rec.ondataavailable=e=>{if(e.data.size) chunks.push(e.data);};
            rec.onstop=()=>{vid.pause();URL.revokeObjectURL(vid.src);
                resolve(new Blob(chunks,{type:mime}));};
            rec.start(100); vid.play();
            setTimeout(()=>{try{rec.stop();}catch(e){}},
                (endSec-startSec)*1000+300);
        });
    });
}

/* ════════════════════════════════════════════════════
   🔄 تحويل صيغة الفيديو — MediaRecorder
   ════════════════════════════════════════════════════ */
async function doVideoConvert(){
    if(!uploadedFile){alert('⚠️ ارفع فيديو أولاً');return;}
    if(!selectedFormat){alert('⚠️ اختر الصيغة');return;}
    const res=document.getElementById('serviceResult');
    setProcessing(res,'جاري التحويل...');
    try{
        const outMime=(selectedFormat==='mp4'&&MediaRecorder.isTypeSupported('video/mp4'))
            ?'video/mp4':'video/webm';
        const blob=await reencodeEntireVideo(uploadedFile,outMime);
        const ext=outMime==='video/mp4'?'mp4':'webm';
        const url=URL.createObjectURL(blob);
        const name=baseName(uploadedFile.name)+'.'+ext;
        setSuccess(res,url,name,{
            'الصيغة':ext.toUpperCase(),'الحجم':toMB(blob)+' MB'
        });
    }catch(err){ setError(res,'خطأ: '+err.message); }
}

function reencodeEntireVideo(file,outMime,videoBps,audioBps){
    return new Promise((resolve,reject)=>{
        const vid=document.createElement('video');
        vid.src=URL.createObjectURL(file);
        vid.muted=false;
        vid.addEventListener('error',()=>reject(new Error('تعذّر تحميل الفيديو')));
        vid.addEventListener('loadedmetadata',()=>{
            const stream=vid.captureStream?vid.captureStream():vid.mozCaptureStream?.();
            if(!stream){reject(new Error('المتصفح لا يدعم هذه العملية'));return;}
            const opts={mimeType:outMime};
            if(videoBps) opts.videoBitsPerSecond=videoBps;
            if(audioBps) opts.audioBitsPerSecond=audioBps;
            const chunks=[]; const rec=new MediaRecorder(stream,opts);
            rec.ondataavailable=e=>{if(e.data.size) chunks.push(e.data);};
            rec.onstop=()=>{vid.pause();URL.revokeObjectURL(vid.src);
                resolve(new Blob(chunks,{type:outMime}));};
            rec.start(300); vid.play();
            vid.addEventListener('ended',()=>{try{rec.stop();}catch(e){}});
            // حماية 10 دقيقة
            setTimeout(()=>{try{if(rec.state==='recording') rec.stop();}catch(e){}},600000);
        });
    });
}

/* ════════════════════════════════════════════════════
   📦 ضغط الفيديو
   ════════════════════════════════════════════════════ */
async function doCompress(){
    if(!uploadedFile){alert('⚠️ ارفع فيديو أولاً');return;}
    const res=document.getElementById('serviceResult');
    setProcessing(res,'جاري ضغط الفيديو...');
    const bpsMap={high:3000000,medium:1200000,low:500000,ultra:180000};
    const vBps=bpsMap[selectedFormat]||bpsMap.medium;
    try{
        const outMime=MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
            ?'video/webm;codecs=vp9,opus':'video/webm';
        const blob=await reencodeEntireVideo(uploadedFile,outMime,vBps,96000);
        const origMB=(uploadedFile.size/1048576).toFixed(2);
        const newMB=toMB(blob);
        const saved=Math.max(0,((origMB-newMB)/origMB*100)).toFixed(1);
        const url=URL.createObjectURL(blob);
        const name=baseName(uploadedFile.name)+'_compressed.webm';
        setSuccess(res,url,name,{
            'الحجم الأصلي':origMB+' MB',
            'الحجم الجديد':newMB+' MB',
            'تم التوفير':saved+'%'
        });
    }catch(err){ setError(res,'خطأ: '+err.message); }
}

/* ════════════════════════════════════════════════════
   🎵 استخراج الصوت — Web Audio API (يعمل 100%)
   ════════════════════════════════════════════════════ */
async function doExtractAudio(){
    if(!uploadedFile){alert('⚠️ ارفع فيديو أولاً');return;}
    if(!selectedFormat){alert('⚠️ اختر صيغة الصوت');return;}
    const res=document.getElementById('serviceResult');
    setProcessing(res,'جاري استخراج الصوت...');
    try{
        const ab=await uploadedFile.arrayBuffer();
        const ac=new (window.AudioContext||window.webkitAudioContext)();
        const buf=await ac.decodeAudioData(ab.slice(0));
        ac.close();
        const blob=await audioBufToBlob(buf,selectedFormat);
        const url=URL.createObjectURL(blob);
        const ext=blob.type.includes('mp3')?'mp3':blob.type.includes('ogg')?'ogg':'wav';
        const name=baseName(uploadedFile.name)+'.'+ext;
        setSuccess(res,url,name,{
            'الصيغة':ext.toUpperCase(),
            'المدة':buf.duration.toFixed(1)+' ثانية',
            'الحجم':toMB(blob)+' MB'
        });
    }catch(err){ setError(res,'خطأ في الاستخراج: '+err.message); }
}

/* ════════════════════════════════════════════════════
   ✂️ تقطيع الصوت — Web Audio API (يعمل 100%)
   ════════════════════════════════════════════════════ */
async function doAudioTrim(){
    if(!uploadedFile){alert('⚠️ ارفع ملفاً صوتياً أولاً');return;}
    const segs=parseSegs(); if(!segs) return;
    const res=document.getElementById('serviceResult');
    setProcessing(res,'جاري تقطيع الصوت...');
    try{
        const ab=await uploadedFile.arrayBuffer();
        const ac=new (window.AudioContext||window.webkitAudioContext)();
        const src=await ac.decodeAudioData(ab.slice(0));
        ac.close();
        const sr=src.sampleRate, ch=src.numberOfChannels;
        let total=0;
        const slices=segs.map(s=>{
            const st=Math.floor(Math.min(s.start,src.duration-.01)*sr);
            const en=Math.floor(Math.min(s.end,src.duration)*sr);
            const len=Math.max(0,en-st);
            total+=len;
            return {st,en,len};
        });
        const out=new AudioBuffer({numberOfChannels:ch,length:total,sampleRate:sr});
        let off=0;
        for(const sl of slices){
            for(let c=0;c<ch;c++){
                const d=src.getChannelData(c).subarray(sl.st,sl.en);
                out.copyToChannel(d,c,off);
            }
            off+=sl.len;
        }
        const fmt=uploadedFile.name.toLowerCase().endsWith('.ogg')?'ogg'
                :uploadedFile.name.toLowerCase().endsWith('.mp3')?'mp3':'wav';
        const blob=await audioBufToBlob(out,fmt);
        const url=URL.createObjectURL(blob);
        const ext=blob.type.includes('mp3')?'mp3':blob.type.includes('ogg')?'ogg':'wav';
        const name=baseName(uploadedFile.name)+'_trimmed.'+ext;
        setSuccess(res,url,name,{
            'المقاطع':segs.map(s=>`${s.start}ث → ${s.end}ث`).join(' | '),
            'المدة الجديدة':(total/sr).toFixed(1)+' ثانية',
            'الحجم':toMB(blob)+' MB'
        });
    }catch(err){ setError(res,'خطأ في التقطيع: '+err.message); }
}

/* ════════════════════════════════════════════════════
   🔄 تحويل صيغة الصوت — Web Audio API (يعمل 100%)
   ════════════════════════════════════════════════════ */
async function doAudioConvert(){
    if(!uploadedFile){alert('⚠️ ارفع ملفاً صوتياً أولاً');return;}
    if(!selectedFormat){alert('⚠️ اختر الصيغة');return;}
    const res=document.getElementById('serviceResult');
    setProcessing(res,`جاري التحويل إلى ${selectedFormat.toUpperCase()}...`);
    try{
        const ab=await uploadedFile.arrayBuffer();
        const ac=new (window.AudioContext||window.webkitAudioContext)();
        const buf=await ac.decodeAudioData(ab.slice(0));
        ac.close();
        const blob=await audioBufToBlob(buf,selectedFormat);
        const url=URL.createObjectURL(blob);
        const ext=blob.type.includes('mp3')?'mp3':blob.type.includes('ogg')?'ogg':'wav';
        const name=baseName(uploadedFile.name)+'.'+ext;
        setSuccess(res,url,name,{
            'الصيغة':ext.toUpperCase(),
            'المدة':buf.duration.toFixed(1)+' ثانية',
            'الحجم':toMB(blob)+' MB'
        });
    }catch(err){ setError(res,'خطأ في التحويل: '+err.message); }
}

/* ════════════════════════════════════════════════════
   🔊 محوّل AudioBuffer → Blob (WAV / MP3 / OGG)
   ════════════════════════════════════════════════════ */
async function audioBufToBlob(buf,fmt){
    if(fmt==='wav'){
        return new Blob([encodeWAV(buf)],{type:'audio/wav'});
    }
    if(fmt==='mp3'){
        return encodeMp3(buf);
    }
    // ogg — MediaRecorder على AudioContext
    return encodeOgg(buf);
}

/* WAV encoder — JavaScript خالص */
function encodeWAV(buffer){
    const ch=buffer.numberOfChannels, sr=buffer.sampleRate, len=buffer.length;
    const interleaved=new Float32Array(len*ch);
    for(let i=0;i<len;i++) for(let c=0;c<ch;c++) interleaved[i*ch+c]=buffer.getChannelData(c)[i];
    const dataLen=interleaved.length*2;
    const ab=new ArrayBuffer(44+dataLen), v=new DataView(ab);
    const ws=(o,s)=>{for(let i=0;i<s.length;i++) v.setUint8(o+i,s.charCodeAt(i));};
    ws(0,'RIFF'); v.setUint32(4,36+dataLen,true); ws(8,'WAVE');
    ws(12,'fmt '); v.setUint32(16,16,true); v.setUint16(20,1,true);
    v.setUint16(22,ch,true); v.setUint32(24,sr,true);
    v.setUint32(28,sr*ch*2,true); v.setUint16(32,ch*2,true);
    v.setUint16(34,16,true); ws(36,'data'); v.setUint32(40,dataLen,true);
    let off=44;
    for(let i=0;i<interleaved.length;i++){
        const s=Math.max(-1,Math.min(1,interleaved[i]));
        v.setInt16(off,s<0?s*0x8000:s*0x7FFF,true); off+=2;
    }
    return ab;
}

/* MP3 — lamejs (تحميل ديناميكي) */
let lamejsReady=false;
function loadLamejs(){
    if(lamejsReady) return Promise.resolve();
    return new Promise((res,rej)=>{
        const s=document.createElement('script');
        s.src='https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js';
        s.onload=()=>{lamejsReady=true;res();};
        s.onerror=rej;
        document.head.appendChild(s);
    });
}
async function encodeMp3(buffer){
    try{ await loadLamejs(); }catch{ return new Blob([encodeWAV(buffer)],{type:'audio/wav'}); }
    const ch=buffer.numberOfChannels, sr=buffer.sampleRate;
    const enc=new lamejs.Mp3Encoder(ch,sr,128);
    const BLOCK=1152, L=buffer.getChannelData(0);
    const R=ch>1?buffer.getChannelData(1):L;
    const f32i16=f=>{const i=new Int16Array(f.length);for(let j=0;j<f.length;j++) i[j]=Math.max(-32768,Math.min(32767,f[j]*32767));return i;};
    const chunks=[];
    for(let i=0;i<L.length;i+=BLOCK){
        const lb=f32i16(L.subarray(i,i+BLOCK));
        const rb=f32i16(R.subarray(i,i+BLOCK));
        const d=ch>1?enc.encodeBuffer(lb,rb):enc.encodeBuffer(lb);
        if(d.length) chunks.push(d);
    }
    const fin=enc.flush(); if(fin.length) chunks.push(fin);
    return new Blob(chunks,{type:'audio/mp3'});
}

/* OGG — MediaRecorder على OfflineAudioContext */
function encodeOgg(buffer){
    return new Promise(resolve=>{
        const oc=new OfflineAudioContext(buffer.numberOfChannels,buffer.length,buffer.sampleRate);
        const s=oc.createBufferSource(); s.buffer=buffer; s.connect(oc.destination); s.start();
        oc.startRendering().then(rendered=>{
            const ac=new AudioContext();
            const dest=ac.createMediaStreamDestination();
            const s2=ac.createBufferSource(); s2.buffer=rendered;
            s2.connect(dest); s2.start();
            const mime=MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
                ?'audio/ogg;codecs=opus':'audio/webm;codecs=opus';
            const chunks=[]; const rec=new MediaRecorder(dest.stream,{mimeType:mime});
            rec.ondataavailable=e=>{if(e.data.size) chunks.push(e.data);};
            rec.onstop=()=>{ac.close(); resolve(new Blob(chunks,{type:mime}));};
            rec.start(); setTimeout(()=>rec.stop(),rendered.duration*1000+400);
        });
    });
}

/* ════════════════════════════════════════════════════
   UI helpers
   ════════════════════════════════════════════════════ */
function setProcessing(el,msg){
    if(!el) return;
    el.innerHTML=`
        <div class="processing-state">
            <div class="processing-spinner"><i class="fas fa-cog fa-spin"></i></div>
            <h4>${msg}</h4>
            <p style="color:#888;font-size:.9rem;margin:.4rem 0">
                ⚡ المعالجة تتم محلياً على جهازك — لا يُرفع أي شيء للإنترنت
            </p>
            <div class="progress-bar-wrapper" style="margin-top:1rem">
                <div class="progress-bar" id="fakeBar" style="width:0%">0%</div>
            </div>
        </div>`;
    let p=0;
    clearInterval(window._fakeBar);
    window._fakeBar=setInterval(()=>{
        p=Math.min(92,p+Math.random()*5);
        const b=document.getElementById('fakeBar');
        if(b){b.style.width=p+'%';b.textContent=Math.round(p)+'%';}
        else clearInterval(window._fakeBar);
    },500);
}

function setSuccess(el,url,fname,details){
    clearInterval(window._fakeBar);
    if(!el) return;
    const rows=Object.entries(details).filter(([,v])=>v)
        .map(([k,v])=>`<p><strong>${k}:</strong> ${v}</p>`).join('');
    el.innerHTML=`
        <div class="download-ready" style="animation:fadeIn .5s ease">
            <i class="fas fa-check-circle"></i>
            <h3>✅ تمت المعالجة بنجاح!</h3>
            <div class="file-info" style="text-align:right;margin:1rem 0">
                <p><strong>اسم الملف:</strong> ${esc(fname)}</p>${rows}
            </div>
            <button class="download-btn" onclick="triggerDL('${url}','${esc(fname)}')">
                <i class="fas fa-download"></i> تنزيل الملف
            </button>
        </div>`;
}

function setError(el,msg){
    clearInterval(window._fakeBar);
    if(!el) return;
    el.innerHTML=`
        <div style="text-align:center;padding:2rem;background:rgba(255,68,68,.12);
                    border-radius:14px;border:2px solid #ff4444;margin-top:1.5rem">
            <i class="fas fa-exclamation-triangle" style="font-size:3rem;color:#ff4444"></i>
            <p style="color:#ff4444;font-weight:bold;margin-top:1rem">${msg}</p>
            <p style="color:#888;font-size:.88rem;margin-top:.5rem">تأكد من صحة الملف وحاول مرة أخرى</p>
        </div>`;
}

function triggerDL(url,fname){
    const a=document.createElement('a'); a.href=url; a.download=fname;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url),15000);
}

function parseSegs(){
    if(trimMode==='range'){
        const s=parseFloat(document.getElementById('startSec')?.value);
        const e=parseFloat(document.getElementById('endSec')?.value);
        if(isNaN(s)||isNaN(e)||e<=s){alert('⚠️ أدخل نطاقاً زمنياً صحيحاً (البداية < النهاية)');return null;}
        return [{start:s,end:e}];
    }
    const raw=document.getElementById('segmentsInput')?.value.trim();
    if(!raw){alert('⚠️ أدخل المقاطع الزمنية');return null;}
    const segs=[];
    for(const part of raw.split(',')){
        const m=part.trim().match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/);
        if(!m){alert(`⚠️ صيغة خاطئة: "${part.trim()}" — الصيغة: بداية-نهاية`);return null;}
        const s=parseFloat(m[1]),e=parseFloat(m[2]);
        if(e<=s){alert(`⚠️ النهاية > البداية في: ${part.trim()}`);return null;}
        segs.push({start:s,end:e});
    }
    return segs;
}

/* ════════════════ تسجيل استخدام الخدمة ════════════════ */
function logServiceUsage(username,serviceName){
    try{
        const logs=JSON.parse(localStorage.getItem('serviceLogs')||'[]');
        logs.push({timestamp:new Date().toLocaleString('ar-IQ'),username,service:serviceName,details:'استخدام ناجح'});
        localStorage.setItem('serviceLogs',JSON.stringify(logs));
    }catch(e){}
}

/* ════════════════ لوحة التحكم ════════════════ */
function openAdminLogin(){
    document.getElementById('adminLoginForm')?.reset();
    const e=document.getElementById('adminLoginError');
    if(e){e.textContent='';e.classList.remove('active');}
    showModal('adminLoginModal');
}
function closeAdminLogin(){ hideModal('adminLoginModal'); }
function adminLogin(e){
    e.preventDefault();
    const u=document.getElementById('adminUsername')?.value;
    const p=document.getElementById('adminPassword')?.value;
    const err=document.getElementById('adminLoginError');
    if(u===adminCreds.username&&p===adminCreds.password){
        closeAdminLogin(); openAdminDashboard();
    }else{
        if(err){err.textContent='❌ بيانات غير صحيحة!';err.classList.add('active');}
    }
}
function openAdminDashboard(){ showModal('adminDashboard'); loadOrdersTab(); loadMessagesTab(); updateStats(); }
function closeAdminDashboard(){ hideModal('adminDashboard'); }
function adminLogout(){ closeAdminDashboard(); }

function switchAdminTab(e,tab){
    document.querySelectorAll('.admin-tab-content').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.admin-tab').forEach(b=>b.classList.remove('active'));
    document.getElementById(tab+'Tab')?.classList.add('active');
    e?.target?.classList.add('active');
    ({orders:loadOrdersTab,messages:loadMessagesTab,services:loadServicesTab,
      users:loadUsersTab,stats:updateStats})[tab]?.();
}

function loadOrdersTab(){
    const arr=JSON.parse(localStorage.getItem('orders')||'[]');
    const tbody=document.getElementById('ordersTableBody'); if(!tbody) return;
    if(!arr.length){tbody.innerHTML='<tr><td colspan="10" style="text-align:center;padding:2rem;color:#888">لا توجد طلبات</td></tr>';return;}
    tbody.innerHTML=arr.map((o,i)=>`<tr>
        <td>${i+1}</td><td>${o.timestamp}</td><td>${esc(o.gameName)}</td>
        <td>${esc(o.phoneNumber)}</td><td>${o.amount} شدة</td><td>${o.price} IQD</td>
        <td>${esc(o.gameId)}</td><td>${esc(o.cardName)}</td>
        <td><span class="status-badge ${o.paymentStatus==='مكتمل'?'completed':'pending'}">${o.paymentStatus}</span></td>
        <td>
            <button class="action-btn view"   onclick="viewOrder(${o.id})"><i class="fas fa-eye"></i></button>
            <button class="action-btn delete" onclick="deleteOrder(${o.id})"><i class="fas fa-trash"></i></button>
        </td></tr>`).join('');
}

function loadMessagesTab(){
    const msgs=JSON.parse(localStorage.getItem('messages')||'[]');
    const cont=document.getElementById('messagesContainer'); if(!cont) return;
    const unread=msgs.filter(m=>!m.read).length;
    const badge=document.getElementById('messagesCount');
    if(badge){badge.textContent=unread;badge.style.display=unread>0?'inline-block':'none';}
    if(!msgs.length){cont.innerHTML='<div class="empty-messages"><i class="fas fa-inbox"></i><h3>لا توجد رسائل</h3></div>';return;}
    cont.innerHTML=msgs.slice().reverse().map(m=>`
        <div class="message-card ${!m.read?'unread':''}">
            <div class="message-header">
                <div class="message-sender">
                    <i class="fas fa-user-circle"></i>
                    <div class="sender-info"><h4>${esc(m.name)}</h4><p>${esc(m.email)}</p></div>
                </div>
                <div class="message-date">${m.timestamp}</div>
            </div>
            <div class="message-content">${esc(m.message)}</div>
            <div class="message-actions">
                <button class="reply-btn" onclick="replyMsg('${esc(m.email)}','${esc(m.name)}')"><i class="fas fa-reply"></i> رد</button>
                ${!m.read?`<button class="mark-read-btn" onclick="markRead(${m.id})"><i class="fas fa-check"></i> مقروء</button>`:''}
                <button class="delete-msg-btn" onclick="deleteMsg(${m.id})"><i class="fas fa-trash"></i> حذف</button>
            </div>
        </div>`).join('');
}

function loadServicesTab(){
    const logs=JSON.parse(localStorage.getItem('serviceLogs')||'[]');
    const svc={};
    logs.forEach(l=>{
        if(!svc[l.service]) svc[l.service]={count:0,lastUsed:l.timestamp,users:new Set()};
        svc[l.service].count++; svc[l.service].users.add(l.username); svc[l.service].lastUsed=l.timestamp;
    });
    const t=document.getElementById('servicesTableBody');
    if(t) t.innerHTML=Object.keys(svc).length
        ?Object.keys(svc).map(n=>`<tr><td>${n}</td><td>${svc[n].count}</td><td>${svc[n].lastUsed}</td><td>${svc[n].users.size}</td></tr>`).join('')
        :'<tr><td colspan="4" style="text-align:center;padding:2rem;color:#888">لا توجد بيانات</td></tr>';
    const lb=document.getElementById('serviceLogsBody');
    if(lb) lb.innerHTML=logs.length
        ?logs.slice(-20).reverse().map(l=>`<tr><td>${l.timestamp}</td><td>${l.username}</td><td>${l.service}</td><td>${l.details}</td></tr>`).join('')
        :'<tr><td colspan="4" style="text-align:center;padding:2rem;color:#888">لا توجد سجلات</td></tr>';
}

function loadUsersTab(){
    const tbody=document.getElementById('usersTableBody'); if(!tbody) return;
    const today=new Date();
    tbody.innerHTML=Object.keys(serviceUsers).map(u=>{
        const usr=serviceUsers[u], exp=today>new Date(usr.expiryDate);
        return `<tr><td>${u}</td><td>${usr.registeredDate}</td><td>${usr.expiryDate}</td>
            <td><span class="status-badge ${exp?'expired':'active'}">${exp?'منتهي':'نشط'}</span></td>
            <td>${usr.usageCount}</td>
            <td>
                <button class="action-btn extend" onclick="extendUser('${u}')"><i class="fas fa-clock"></i></button>
                <button class="action-btn delete" onclick="deleteUser('${u}')"><i class="fas fa-trash"></i></button>
            </td></tr>`;
    }).join('');
}

function updateStats(){
    const orders=JSON.parse(localStorage.getItem('orders')||'[]');
    const logs=JSON.parse(localStorage.getItem('serviceLogs')||'[]');
    const msgs=JSON.parse(localStorage.getItem('messages')||'[]');
    const today=new Date();
    setText('totalOrders',orders.length);
    setText('totalRevenue',orders.reduce((s,o)=>{const n=parseInt(String(o.price).replace(/,/g,''));return s+(isNaN(n)?0:n);},0).toLocaleString()+' IQD');
    setText('activeUsers',Object.values(serviceUsers).filter(u=>today<=new Date(u.expiryDate)).length);
    setText('totalServiceUsage',logs.length);
    setText('totalMessages',msgs.length);
}

function viewOrder(id){
    const o=JSON.parse(localStorage.getItem('orders')||'[]').find(x=>x.id===id);
    if(o) alert(`📋 تفاصيل الطلب\n\nالتاريخ: ${o.timestamp}\nالاسم: ${o.gameName}\nالكمية: ${o.amount} شدة\nالمبلغ: ${o.price} IQD\nالهاتف: ${o.phoneNumber}\nID: ${o.gameId}\nالحالة: ${o.paymentStatus}`);
}
function deleteOrder(id){
    if(!confirm('حذف هذا الطلب؟')) return;
    const arr=JSON.parse(localStorage.getItem('orders')||'[]').filter(o=>o.id!==id);
    localStorage.setItem('orders',JSON.stringify(arr)); loadOrdersTab(); updateStats();
}
function markRead(id){
    const arr=JSON.parse(localStorage.getItem('messages')||'[]');
    const m=arr.find(x=>x.id===id); if(m){m.read=true;localStorage.setItem('messages',JSON.stringify(arr));loadMessagesTab();}
}
function deleteMsg(id){
    if(!confirm('حذف هذه الرسالة؟')) return;
    const arr=JSON.parse(localStorage.getItem('messages')||'[]').filter(m=>m.id!==id);
    localStorage.setItem('messages',JSON.stringify(arr)); loadMessagesTab(); updateStats();
}
function replyMsg(email,name){
    window.location.href=`mailto:${email}?subject=${encodeURIComponent('رد - Eyad_Eyad12')}&body=${encodeURIComponent('مرحباً '+name+',\n\n')}`;
}
function extendUser(u){
    const m=parseInt(prompt('كم شهر تريد التمديد؟','1'));
    if(!m||m<1) return;
    const usr=serviceUsers[u]; if(!usr) return;
    const d=new Date(usr.expiryDate); d.setMonth(d.getMonth()+m);
    usr.expiryDate=d.toISOString().split('T')[0];
    saveData(); loadUsersTab(); alert(`✅ تم تمديد ${u} — ينتهي: ${usr.expiryDate}`);
}
function deleteUser(u){
    if(!confirm(`حذف المستخدم ${u}؟`)) return;
    delete serviceUsers[u]; saveData(); loadUsersTab(); updateStats();
}
function showAddUserForm(){
    const username=prompt('اسم المستخدم:'); if(!username) return;
    if(serviceUsers[username]){alert('❌ موجود بالفعل!');return;}
    const pw=prompt('كلمة المرور:'); if(!pw) return;
    const st=prompt('نوع الاشتراك (يومي/أسبوعي/شهري):','شهري');
    const today=new Date(), exp=new Date();
    if(st==='يومي') exp.setDate(exp.getDate()+1);
    else if(st==='أسبوعي') exp.setDate(exp.getDate()+7);
    else exp.setMonth(exp.getMonth()+1);
    serviceUsers[username]={password:pw,subscriptionType:st,
        registeredDate:today.toISOString().split('T')[0],
        expiryDate:exp.toISOString().split('T')[0],usageCount:0};
    saveData(); loadUsersTab();
    alert(`✅ تم إضافة ${username}\nكلمة المرور: ${pw}\nينتهي: ${exp.toISOString().split('T')[0]}`);
}
function exportOrders(){
    const arr=JSON.parse(localStorage.getItem('orders')||'[]');
    if(!arr.length){alert('لا توجد طلبات!');return;}
    let csv='\ufeffالتاريخ,الاسم,الهاتف,الكمية,المبلغ,ID,اسم البطاقة,الحالة\n';
    arr.forEach(o=>{csv+=`${o.timestamp},${o.gameName},${o.phoneNumber},${o.amount},${o.price},${o.gameId},${o.cardName},${o.paymentStatus}\n`;});
    dlCSV(csv,'orders_'+Date.now()+'.csv');
}
function exportMessages(){
    const arr=JSON.parse(localStorage.getItem('messages')||'[]');
    if(!arr.length){alert('لا توجد رسائل!');return;}
    let csv='\ufeffالتاريخ,الاسم,البريد,الرسالة,الحالة\n';
    arr.forEach(m=>{csv+=`${m.timestamp},${m.name},${m.email},"${m.message.replace(/\n/g,' ')}",${m.read?'مقروء':'غير مقروء'}\n`;});
    dlCSV(csv,'msgs_'+Date.now()+'.csv');
}
function exportServiceStats(){
    const arr=JSON.parse(localStorage.getItem('serviceLogs')||'[]');
    if(!arr.length){alert('لا توجد بيانات!');return;}
    let csv='\ufeffالتاريخ,المستخدم,الخدمة,التفاصيل\n';
    arr.forEach(l=>{csv+=`${l.timestamp},${l.username},${l.service},${l.details}\n`;});
    dlCSV(csv,'stats_'+Date.now()+'.csv');
}
function dlCSV(csv,fname){
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download=fname;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    alert('✅ تم التصدير!');
}

/* ════════════════ أدوات عامة ════════════════ */
const showModal=id=>document.getElementById(id)?.classList.add('active');
const hideModal=id=>document.getElementById(id)?.classList.remove('active');
const setText=(id,v)=>{const e=document.getElementById(id);if(e) e.textContent=v;};
const baseName=s=>s.replace(/\.[^/.]+$/,'');
const toMB=blob=>(blob.size/1048576).toFixed(2);
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function previewImage(file,id){
    const r=new FileReader();
    r.onload=e=>{const el=document.getElementById(id);if(el) el.innerHTML=`<img src="${e.target.result}" style="max-width:100%;max-height:180px;border-radius:10px;border:2px solid #dc143c">`; };
    r.readAsDataURL(file);
}

document.querySelectorAll('.modal').forEach(m=>{
    m.addEventListener('click',e=>{if(e.target===m) m.classList.remove('active');});
});
document.addEventListener('keydown',e=>{
    if(e.ctrlKey&&e.shiftKey&&e.key==='A'){e.preventDefault();openAdminLogin();}
});

window.adminCommands={
    login:openAdminLogin,
    stats:()=>{
        console.log('📊',JSON.parse(localStorage.getItem('orders')||'[]').length,'طلب');
        console.log('📧',JSON.parse(localStorage.getItem('messages')||'[]').length,'رسالة');
    },
    reset:()=>{if(confirm('⚠️ حذف كل البيانات؟')){localStorage.clear();location.reload();}}
};

/* ════════════════ تهيئة ════════════════ */
document.addEventListener('DOMContentLoaded',()=>{
    loadData(); createParticles(); createStars();
    if(!localStorage.getItem('orders')){
        localStorage.setItem('orders',JSON.stringify([
            {id:Date.now()-10000,timestamp:new Date(Date.now()-86400000).toLocaleString('ar-IQ'),
             amount:'60',price:'12,500',gameName:'أحمد محمد',gameId:'123456789',
             phoneNumber:'0770123456',cardName:'علي حسن',paymentStatus:'مكتمل'},
            {id:Date.now()-5000,timestamp:new Date(Date.now()-43200000).toLocaleString('ar-IQ'),
             amount:'30',price:'6,500',gameName:'محمود علي',gameId:'987654321',
             phoneNumber:'0780987654',cardName:'حسين محمد',paymentStatus:'قيد المراجعة'}
        ]));
    }
    if(!localStorage.getItem('messages')){
        localStorage.setItem('messages',JSON.stringify([
            {id:Date.now()-8000,timestamp:new Date(Date.now()-7200000).toLocaleString('ar-IQ'),
             name:'عمر خالد',email:'omar@example.com',message:'أريد الاستفسار عن خدمة تقطيع الفيديو.',read:false},
            {id:Date.now()-3000,timestamp:new Date(Date.now()-3600000).toLocaleString('ar-IQ'),
             name:'سارة أحمد',email:'sara@example.com',message:'شكراً على الخدمة الممتازة!',read:true}
        ]));
    }
    console.log('%c🚀 Eyad_Eyad12 Ready','color:#dc143c;font-size:1.1rem;font-weight:bold');
    console.log('%c🔐 admin / admin2025','color:#ffd700');
    console.log('%c🔧 adminCommands.login() | .stats() | .reset()','color:#888');
});

/* ════════════════════════════════════════════════
   ⭐ نظام الآراء والتقييمات
   ════════════════════════════════════════════════ */

let currentRvRating = 5;
let rvImgBase64 = '';
let reviewsFilterRating = 0;

/* ─── فتح / إغلاق فورم الإضافة ─── */
function openAddReviewModal() {
    const panel = document.getElementById('addReviewForm');
    if (!panel) return;
    panel.style.display = 'block';
    // reset
    document.getElementById('rv_name').value    = '';
    document.getElementById('rv_tag').value     = '';
    document.getElementById('rv_comment').value = '';
    rvImgBase64 = '';
    currentRvRating = 5;
    document.getElementById('rv_rating').value = 5;
    const prev = document.getElementById('rv_img_preview');
    const ph   = document.getElementById('rv_img_placeholder');
    if (prev) { prev.src=''; prev.style.display='none'; }
    if (ph)   ph.style.display = 'flex';
    pickStar(5);
    panel.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

function closeAddReviewModal() {
    const panel = document.getElementById('addReviewForm');
    if (panel) panel.style.display = 'none';
}

/* ─── معاينة صورة الحساب ─── */
function previewRvImg(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        rvImgBase64 = e.target.result;
        const prev = document.getElementById('rv_img_preview');
        const ph   = document.getElementById('rv_img_placeholder');
        if (prev) { prev.src = rvImgBase64; prev.style.display = 'block'; }
        if (ph)   ph.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

/* ─── اختيار النجوم ─── */
function pickStar(val) {
    currentRvRating = val;
    document.getElementById('rv_rating').value = val;
    document.querySelectorAll('#starPicker .sp-star').forEach((s, i) => {
        s.classList.toggle('active', i < val);
    });
}

/* ─── حفظ الرأي ─── */
function saveReview() {
    const name    = document.getElementById('rv_name')?.value.trim();
    const tag     = document.getElementById('rv_tag')?.value.trim();
    const comment = document.getElementById('rv_comment')?.value.trim();
    const rating  = parseInt(document.getElementById('rv_rating')?.value) || 5;

    if (!name)    { alert('⚠️ أدخل اسم العميل'); return; }
    if (!comment) { alert('⚠️ أدخل التعليق'); return; }

    const review = {
        id: Date.now(),
        name, tag, comment, rating,
        img: rvImgBase64 || '',
        date: new Date().toLocaleDateString('ar-IQ')
    };

    const arr = JSON.parse(localStorage.getItem('reviews') || '[]');
    arr.unshift(review); // الأحدث أولاً
    localStorage.setItem('reviews', JSON.stringify(arr));

    closeAddReviewModal();
    loadReviewsTab();       // تحديث جدول الإدارة
    renderReviewsSection(); // تحديث القسم العام
    alert('✅ تم إضافة الرأي بنجاح!');
}

/* ─── حذف رأي ─── */
function deleteReview(id) {
    if (!confirm('هل تريد حذف هذا الرأي؟')) return;
    const arr = JSON.parse(localStorage.getItem('reviews') || '[]').filter(r => r.id !== id);
    localStorage.setItem('reviews', JSON.stringify(arr));
    loadReviewsTab();
    renderReviewsSection();
}

/* ─── تحميل تبويب الآراء في الإدارة ─── */
function loadReviewsTab() {
    const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    const tbody   = document.getElementById('reviewsTableBody');
    if (!tbody) return;

    if (!reviews.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#888">لا توجد آراء بعد — أضف أول رأي!</td></tr>';
        return;
    }

    tbody.innerHTML = reviews.map((r, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>
                ${r.img
                    ? `<img src="${r.img}" style="width:42px;height:42px;border-radius:50%;object-fit:cover;border:2px solid #dc143c">`
                    : `<div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#dc143c,#ff3366);display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:1.1rem;color:#fff">${r.name.charAt(0)}</div>`
                }
            </td>
            <td>
                <strong>${esc(r.name)}</strong>
                ${r.tag ? `<br><small style="color:#ffd700">${esc(r.tag)}</small>` : ''}
            </td>
            <td><span style="color:#ffd700;font-size:1.1rem">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span></td>
            <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(r.comment)}">${esc(r.comment)}</td>
            <td>${r.date}</td>
            <td>
                <button class="action-btn delete" onclick="deleteReview(${r.id})" title="حذف">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>`).join('');
}

/* ─── فلترة الآراء ─── */
function filterReviews(rating, btn) {
    reviewsFilterRating = rating;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderReviewsSection();
}

/* ─── رسم قسم الآراء العام ─── */
function renderReviewsSection() {
    const all     = JSON.parse(localStorage.getItem('reviews') || '[]');
    const reviews = reviewsFilterRating > 0
        ? all.filter(r => r.rating === reviewsFilterRating)
        : all;

    // ── إحصائيات ──
    const total = all.length;
    const avg   = total > 0
        ? (all.reduce((s, r) => s + r.rating, 0) / total).toFixed(1)
        : '0.0';

    setText('overallRating', avg);
    setText('totalReviewsCount', total + ' تقييم');

    const filled  = Math.round(parseFloat(avg));
    const starsEl = document.getElementById('overallStars');
    if (starsEl) starsEl.textContent = '★'.repeat(filled) + '☆'.repeat(5 - filled);

    [1,2,3,4,5].forEach(n => {
        const cnt  = all.filter(r => r.rating === n).length;
        const pct  = total > 0 ? (cnt / total * 100).toFixed(1) : 0;
        const bar  = document.getElementById('bar' + n);
        const cntEl= document.getElementById('cnt' + n);
        if (bar)  bar.style.width = pct + '%';
        if (cntEl) cntEl.textContent = cnt;
    });

    // ── البطاقات ──
    const grid  = document.getElementById('reviewsGrid');
    const empty = document.getElementById('reviewsEmpty');
    if (!grid) return;

    if (!reviews.length) {
        if (empty) empty.style.display = 'flex';
        // أخفِ البطاقات القديمة
        grid.querySelectorAll('.review-card').forEach(c => c.remove());
        updateMarquee(all);
        return;
    }
    if (empty) empty.style.display = 'none';

    // أزل البطاقات القديمة
    grid.querySelectorAll('.review-card').forEach(c => c.remove());

    reviews.forEach(r => {
        const card = document.createElement('div');
        card.className = 'review-card';
        card.innerHTML = `
            <div class="rv-card-top">
                <div class="rv-avatar">
                    ${r.img
                        ? `<img src="${r.img}" alt="${esc(r.name)}">`
                        : `<div class="rv-avatar-letter">${r.name.charAt(0).toUpperCase()}</div>`
                    }
                    <div class="rv-verified"><i class="fas fa-check"></i></div>
                </div>
                <div class="rv-info">
                    <h4>${esc(r.name)}</h4>
                    ${r.tag ? `<span class="rv-tag">${esc(r.tag)}</span>` : ''}
                    <div class="rv-stars">${renderStars(r.rating)}</div>
                </div>
                <div class="rv-date">${r.date}</div>
            </div>
            <div class="rv-comment">
                <i class="fas fa-quote-right rv-quote-icon"></i>
                ${esc(r.comment)}
            </div>`;
        grid.appendChild(card);
    });

    updateMarquee(all);
}

function renderStars(n) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += `<span class="rv-star ${i <= n ? 'filled' : ''}">${i <= n ? '★' : '☆'}</span>`;
    }
    return html;
}

function updateMarquee(reviews) {
    const wrap   = document.getElementById('reviewsMarqueeWrap');
    const ticker = document.getElementById('reviewsMarquee');
    if (!wrap || !ticker || reviews.length < 3) {
        if (wrap) wrap.style.display = 'none'; return;
    }
    wrap.style.display = 'block';
    const items = [...reviews, ...reviews].map(r => `
        <div class="marquee-item">
            <span class="marquee-stars">${'★'.repeat(r.rating)}</span>
            <strong>${esc(r.name)}</strong>: ${esc(r.comment.substring(0, 60))}${r.comment.length > 60 ? '...' : ''}
        </div>`).join('');
    ticker.innerHTML = items;
}

/* ─── ربط switchAdminTab بالآراء ─── */
const _origSwitch = window.switchAdminTab;
window.switchAdminTab = function(e, tab) {
    document.querySelectorAll('.admin-tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
    document.getElementById(tab + 'Tab')?.classList.add('active');
    e?.target?.classList.add('active');
    const map = {
        orders: loadOrdersTab, messages: loadMessagesTab,
        services: loadServicesTab, users: loadUsersTab,
        stats: updateStats, reviews: loadReviewsTab
    };
    map[tab]?.();
};

/* ─── تهيئة عند التحميل ─── */
document.addEventListener('DOMContentLoaded', () => {
    renderReviewsSection();
    // نجوم المختار افتراضياً 5
    setTimeout(() => pickStar(5), 100);
});

/* ════════════════════════════════════════════════
   💝 الدعم المالي — محمي بكلمة مرور المشتركين
   ════════════════════════════════════════════════ */
function openDonationLogin() {
    document.getElementById('donationLoginForm')?.reset();
    const err = document.getElementById('donationLoginError');
    if (err) { err.textContent = ''; err.classList.remove('active'); }
    showModal('donationLoginModal');
}

function closeDonationLogin() {
    hideModal('donationLoginModal');
}

function submitDonationLogin(e) {
    e.preventDefault();
    const username = document.getElementById('donationUsername')?.value.trim();
    const password = document.getElementById('donationPassword')?.value;
    const errDiv   = document.getElementById('donationLoginError');

    const showErr = msg => {
        if (errDiv) { errDiv.textContent = msg; errDiv.classList.add('active'); }
    };

    if (!username || !password) { showErr('❌ أدخل اسم المستخدم وكلمة المرور!'); return; }

    // تحقق من بيانات المشتركين فقط
    if (!serviceUsers[username]) { showErr('❌ اسم المستخدم غير موجود!'); return; }

    const user = serviceUsers[username];
    if (user.password !== password) { showErr('❌ كلمة المرور غير صحيحة!'); return; }

    if (new Date() > new Date(user.expiryDate)) {
        showErr('⚠️ اشتراكك منتهٍ! تواصل معنا للتجديد.');
        return;
    }

    // ✅ بيانات صحيحة — أغلق وانتقل للرابط
    closeDonationLogin();
    setTimeout(() => {
        window.open('https://www.donationalerts.com/', '_blank');
    }, 200);
}

/* ═══════════════════════════════════════════════════════════
   🚀 الخدمات الجديدة — نسخة متقدمة
   ═══════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────
   إضافة الخدمات الجديدة لـ openService()
   ─────────────────────────────────────────────*/
const _origOpenService = openService;
openService = function(serviceId, serviceName) {
    const newServices = ['video-merger','speed-changer','video-rotator','video-filters','text-overlay','ai-editor'];
    if (!newServices.includes(serviceId)) {
        _origOpenService(serviceId, serviceName);
        return;
    }
    const modal   = document.getElementById('serviceModal');
    const title   = document.getElementById('serviceModalTitle');
    const content = document.getElementById('serviceModalContent');
    if (!modal||!title||!content) return;
    title.textContent = serviceName;
    uploadedFile = null; selectedFormat = ''; trimMode = 'range';

    const dragUpload = (id, accept, label, icon) => `
        <div class="upload-area drag-upload" id="dropZone_${id}"
             onclick="document.getElementById('${id}').click()"
             ondragover="handleDragOver(event,'dropZone_${id}')"
             ondragleave="handleDragLeave(event,'dropZone_${id}')"
             ondrop="handleDrop(event,'${id}','dropZone_${id}')">
            <i class="fas ${icon}"></i>
            <p>${label}</p>
            <small>أو اسحب وأفلت الملف هنا</small>
            <input type="file" id="${id}" accept="${accept}" style="display:none"
                   onchange="handleMediaUpload(this)">
        </div>
        <div id="fileInfo" class="file-info-display"></div>
        <div id="previewBox" class="preview-box" style="display:none"></div>`;

    const res = `<div class="service-result" id="serviceResult"></div>`;

    const views = {

/* ══ دمج الفيديو ══ */
'video-merger': `<div class="service-interface">
    <div class="merger-drop-zone" id="mergerDropZone"
         ondragover="handleDragOver(event,'mergerDropZone')"
         ondragleave="handleDragLeave(event,'mergerDropZone')"
         ondrop="handleMergerDrop(event)">
        <i class="fas fa-object-group"></i>
        <p>اسحب عدة فيديوهات هنا</p>
        <small>أو</small>
        <button class="upload-pick-btn" onclick="document.getElementById('mergerInput').click()">
            <i class="fas fa-folder-open"></i> اختر الملفات
        </button>
        <input type="file" id="mergerInput" accept="video/*" multiple style="display:none"
               onchange="addMergerFiles(this)">
    </div>
    <div id="mergerFileList" class="merger-file-list"></div>
    <button class="action-btn-service" id="mainBtn" onclick="doMergeVideos()" disabled>
        <i class="fas fa-object-group"></i> دمج الفيديوهات
    </button>${res}</div>`,

/* ══ تغيير السرعة ══ */
'speed-changer': `<div class="service-interface">
    ${dragUpload('speedFile','video/*','ارفع الفيديو لتغيير سرعته','fa-tachometer-alt')}
    <div class="speed-control-panel">
        <h4><i class="fas fa-tachometer-alt"></i> السرعة</h4>
        <div class="speed-btns">
            ${[0.25,0.5,0.75,1,1.25,1.5,2,4].map(s=>
                `<button class="speed-btn${s===1?' active':''}" onclick="selectSpeed(this,${s})">${s}x</button>`
            ).join('')}
        </div>
        <div class="speed-slider-wrap">
            <span>0.25x</span>
            <input type="range" id="speedSlider" min="0.25" max="4" step="0.25" value="1"
                   oninput="updateSpeedFromSlider(this.value)" class="speed-slider">
            <span>4x</span>
        </div>
        <div class="speed-display">السرعة الحالية: <strong id="speedDisplay">1x</strong></div>
    </div>
    <button class="action-btn-service" id="mainBtn" onclick="doChangeSpeed()" disabled>
        <i class="fas fa-tachometer-alt"></i> تطبيق السرعة
    </button>${res}</div>`,

/* ══ تدوير الفيديو ══ */
'video-rotator': `<div class="service-interface">
    ${dragUpload('rotFile','video/*','ارفع الفيديو لتدويره','fa-sync-alt')}
    <div class="rotate-panel">
        <h4><i class="fas fa-sync-alt"></i> اختر التدوير</h4>
        <div class="rotate-btns">
            <button class="rotate-btn active" onclick="selectRotate(this,0)" data-v="0">
                <i class="fas fa-arrows-alt-h"></i> لا تدوير
            </button>
            <button class="rotate-btn" onclick="selectRotate(this,90)" data-v="90">
                <i class="fas fa-redo"></i> 90° يمين
            </button>
            <button class="rotate-btn" onclick="selectRotate(this,180)" data-v="180">
                <i class="fas fa-sync"></i> 180°
            </button>
            <button class="rotate-btn" onclick="selectRotate(this,270)" data-v="270">
                <i class="fas fa-undo"></i> 90° يسار
            </button>
            <button class="rotate-btn" onclick="selectRotate(this,'flipH')" data-v="flipH">
                <i class="fas fa-arrows-alt-h"></i> عكس أفقي
            </button>
            <button class="rotate-btn" onclick="selectRotate(this,'flipV')" data-v="flipV">
                <i class="fas fa-arrows-alt-v"></i> عكس رأسي
            </button>
        </div>
    </div>
    <button class="action-btn-service" id="mainBtn" onclick="doRotateVideo()" disabled>
        <i class="fas fa-sync-alt"></i> تدوير الفيديو
    </button>${res}</div>`,

/* ══ مرشحات بصرية ══ */
'video-filters': `<div class="service-interface">
    ${dragUpload('filterFile','video/*','ارفع الفيديو لتطبيق المرشح','fa-palette')}
    <div class="filters-panel">
        <h4><i class="fas fa-palette"></i> اختر المرشح</h4>
        <div class="filter-grid" id="filterGrid">
            ${[
                {id:'none',     label:'بدون',          style:'none'},
                {id:'warm',     label:'دافئ 🌅',        style:'sepia(40%) saturate(140%) hue-rotate(-10deg)'},
                {id:'cold',     label:'بارد ❄️',        style:'saturate(80%) hue-rotate(180deg) brightness(1.1)'},
                {id:'bw',       label:'أبيض وأسود',    style:'grayscale(100%)'},
                {id:'vintage',  label:'قديم 📷',        style:'sepia(80%) contrast(90%) brightness(90%)'},
                {id:'vivid',    label:'حيوي 🌈',        style:'saturate(200%) contrast(110%)'},
                {id:'dark',     label:'داكن 🌑',        style:'brightness(70%) contrast(120%)'},
                {id:'soft',     label:'ناعم 🌸',        style:'brightness(110%) saturate(80%) contrast(90%)'},
            ].map(f=>`
                <div class="filter-card${f.id==='none'?' active':''}"
                     onclick="selectFilter(this,'${f.id}','${f.style}')"
                     style="position:relative">
                    <div class="filter-preview-box" style="filter:${f.style==='none'?'':f.style}">
                        <i class="fas fa-film"></i>
                    </div>
                    <span>${f.label}</span>
                </div>`).join('')}
        </div>
        <div class="intensity-wrap">
            <label>شدة المرشح: <strong id="intensityVal">100%</strong></label>
            <input type="range" id="filterIntensity" min="10" max="100" value="100"
                   oninput="document.getElementById('intensityVal').textContent=this.value+'%'"
                   class="speed-slider">
        </div>
    </div>
    <button class="action-btn-service" id="mainBtn" onclick="doApplyFilter()" disabled>
        <i class="fas fa-palette"></i> تطبيق المرشح
    </button>${res}</div>`,

/* ══ إضافة نص ══ */
'text-overlay': `<div class="service-interface">
    ${dragUpload('textFile','video/*','ارفع الفيديو لإضافة نص عليه','fa-font')}
    <div class="text-overlay-panel">
        <h4><i class="fas fa-font"></i> إعدادات النص</h4>
        <div class="text-form-grid">
            <div class="form-group" style="grid-column:1/-1">
                <label>النص</label>
                <input type="text" id="overlayText" class="form-input" placeholder="اكتب النص هنا..." value="Eyad_Eyad12">
            </div>
            <div class="form-group">
                <label>لون النص</label>
                <input type="color" id="textColor" value="#ffffff" class="form-input" style="height:46px;padding:4px">
            </div>
            <div class="form-group">
                <label>حجم الخط</label>
                <input type="range" id="fontSize" min="16" max="120" value="48" class="speed-slider"
                       oninput="document.getElementById('fontSizeVal').textContent=this.value+'px'">
                <small id="fontSizeVal" style="color:#888">48px</small>
            </div>
            <div class="form-group">
                <label>الموضع الأفقي</label>
                <select id="textX" class="form-input">
                    <option value="left">يسار</option>
                    <option value="center" selected>وسط</option>
                    <option value="right">يمين</option>
                </select>
            </div>
            <div class="form-group">
                <label>الموضع الرأسي</label>
                <select id="textY" class="form-input">
                    <option value="top">أعلى</option>
                    <option value="center" selected>وسط</option>
                    <option value="bottom">أسفل</option>
                </select>
            </div>
            <div class="form-group">
                <label>خلفية النص</label>
                <select id="textBg" class="form-input">
                    <option value="none">بدون خلفية</option>
                    <option value="black">خلفية سوداء</option>
                    <option value="red">خلفية حمراء</option>
                    <option value="white">خلفية بيضاء</option>
                </select>
            </div>
            <div class="form-group">
                <label>وقت الظهور (ثانية)</label>
                <input type="number" id="textStart" class="form-input" value="0" min="0" placeholder="0">
            </div>
            <div class="form-group">
                <label>وقت الاختفاء (ثانية)</label>
                <input type="number" id="textEnd" class="form-input" value="999" min="1" placeholder="نهاية الفيديو">
            </div>
        </div>
    </div>
    <button class="action-btn-service" id="mainBtn" onclick="doTextOverlay()" disabled>
        <i class="fas fa-font"></i> إضافة النص
    </button>${res}</div>`,

/* ══ محرر AI ══ */
'ai-editor': `<div class="service-interface">
    ${dragUpload('aiFile','video/*,audio/*','ارفع الفيديو أو الصوت','fa-robot')}
    <div class="ai-terminal">
        <div class="terminal-header">
            <span class="terminal-dot red"></span>
            <span class="terminal-dot yellow"></span>
            <span class="terminal-dot green"></span>
            <span class="terminal-title">🤖 محرر الذكاء الاصطناعي</span>
        </div>
        <div class="terminal-body" id="terminalOutput">
            <div class="term-line system">مرحباً! أنا محرر AI. اكتب أمرك بالعربية وسأنفذه تلقائياً.</div>
            <div class="term-line hint">💡 أمثلة: "اقطع الفيديو من الثانية 10 إلى 30" | "استخرج الصوت بصيغة mp3" | "حول إلى webm" | "ضغط الفيديو"</div>
        </div>
        <div class="terminal-input-row">
            <span class="terminal-prompt">❯</span>
            <input type="text" id="aiCommand" class="terminal-input"
                   placeholder="اكتب أمرك هنا..."
                   onkeydown="if(event.key==='Enter') runAICommand()">
            <button class="terminal-run-btn" onclick="runAICommand()">
                <i class="fas fa-paper-plane"></i>
            </button>
        </div>
    </div>
    <button class="action-btn-service" id="mainBtn" onclick="runAICommand()" disabled>
        <i class="fas fa-robot"></i> تنفيذ الأمر
    </button>${res}</div>`
    };

    content.innerHTML = views[serviceId] || '<p style="color:#bbb;text-align:center">الخدمة غير متوفرة</p>';
    showModal('serviceModal');
    // اعدادات افتراضية
    window.currentSpeed   = 1;
    window.currentRotate  = 0;
    window.currentFilter  = {id:'none', style:'none'};
    window.mergerFiles    = [];
    initDragDrop();
};

/* ─────────────────────────────────────────────
   Drag & Drop عام
   ─────────────────────────────────────────────*/
function initDragDrop() {
    document.querySelectorAll('.drag-upload').forEach(zone => {
        zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('drag-over'); });
        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
        zone.addEventListener('drop', e => {
            e.preventDefault(); zone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file) { uploadedFile = file; triggerFileLoad(file); }
        });
    });
}
function handleDragOver(e, zoneId) { e.preventDefault(); document.getElementById(zoneId)?.classList.add('drag-over'); }
function handleDragLeave(e, zoneId){ document.getElementById(zoneId)?.classList.remove('drag-over'); }
function handleDrop(e, inputId, zoneId) {
    e.preventDefault();
    document.getElementById(zoneId)?.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (!file) return;
    uploadedFile = file; triggerFileLoad(file);
}
function triggerFileLoad(file) {
    const mb = (file.size/1048576).toFixed(2);
    const fi = document.getElementById('fileInfo');
    if (fi) fi.innerHTML=`<div class="file-info"><p><i class="fas fa-file" style="color:#dc143c"></i> <strong>الملف:</strong> ${esc(file.name)}</p><p><i class="fas fa-hdd" style="color:#dc143c"></i> <strong>الحجم:</strong> ${mb} MB</p><p><i class="fas fa-check-circle" style="color:#4CAF50"></i> <strong>الحالة:</strong> جاهز ✅</p></div>`;
    const btn = document.getElementById('mainBtn'); if (btn) btn.disabled = false;
    // معاينة فورية
    showPreview(file);
}

/* ─────────────────────────────────────────────
   معاينة فورية
   ─────────────────────────────────────────────*/
function showPreview(file) {
    const box = document.getElementById('previewBox');
    if (!box) return;
    const url  = URL.createObjectURL(file);
    const isVid = file.type.startsWith('video');
    box.style.display = 'block';
    box.innerHTML = isVid
        ? `<div class="preview-label"><i class="fas fa-eye"></i> معاينة مباشرة</div>
           <video src="${url}" controls class="preview-video" id="previewVid"></video>`
        : `<div class="preview-label"><i class="fas fa-headphones"></i> معاينة الصوت</div>
           <audio src="${url}" controls class="preview-audio"></audio>`;
}

/* ─────────────────────────────────────────────
   🔗 دمج الفيديو
   ─────────────────────────────────────────────*/
window.mergerFiles = [];

function handleMergerDrop(e) {
    e.preventDefault();
    document.getElementById('mergerDropZone')?.classList.remove('drag-over');
    addMergerFilesFromList(e.dataTransfer.files);
}
function addMergerFiles(input) { addMergerFilesFromList(input.files); }
function addMergerFilesFromList(files) {
    for (const f of files) {
        if (f.type.startsWith('video')) window.mergerFiles.push(f);
    }
    renderMergerList();
}
function renderMergerList() {
    const list = document.getElementById('mergerFileList'); if (!list) return;
    if (!window.mergerFiles.length) { list.innerHTML=''; return; }
    list.innerHTML = `<h4 style="color:var(--secondary);margin-bottom:.8rem"><i class="fas fa-list"></i> الملفات (${window.mergerFiles.length})</h4>` +
    window.mergerFiles.map((f,i)=>`
        <div class="merger-item">
            <span class="merger-num">${i+1}</span>
            <span class="merger-name">${esc(f.name)}</span>
            <span class="merger-size">${(f.size/1048576).toFixed(1)} MB</span>
            <button class="merger-del" onclick="removeMergerFile(${i})"><i class="fas fa-times"></i></button>
        </div>`).join('');
    const btn = document.getElementById('mainBtn');
    if (btn) btn.disabled = window.mergerFiles.length < 2;
}
function removeMergerFile(i) {
    window.mergerFiles.splice(i,1); renderMergerList();
}

async function doMergeVideos() {
    if (!window.mergerFiles || window.mergerFiles.length < 2) { alert('⚠️ أضف فيديوين على الأقل'); return; }
    const res = document.getElementById('serviceResult');
    setProcessing(res, `جاري دمج ${window.mergerFiles.length} فيديوهات...`);
    try {
        const blobs = [];
        for (const file of window.mergerFiles) {
            const blob = await reencodeEntireVideo(file, 'video/webm');
            blobs.push(blob);
        }
        const merged = new Blob(blobs, { type: 'video/webm' });
        const url    = URL.createObjectURL(merged);
        const name   = 'merged_video.webm';
        setSuccess(res, url, name, { 'عدد الملفات': window.mergerFiles.length+' فيديو', 'الحجم الكلي': toMB(merged)+' MB' });
    } catch(err) { setError(res, 'خطأ: '+err.message); }
}

/* ─────────────────────────────────────────────
   ⚡ تغيير السرعة
   ─────────────────────────────────────────────*/
function selectSpeed(btn, val) {
    document.querySelectorAll('.speed-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    window.currentSpeed = val;
    document.getElementById('speedSlider').value = val;
    document.getElementById('speedDisplay').textContent = val+'x';
    const vid = document.getElementById('previewVid');
    if (vid) vid.playbackRate = val;
}
function updateSpeedFromSlider(val) {
    window.currentSpeed = parseFloat(val);
    document.getElementById('speedDisplay').textContent = val+'x';
    document.querySelectorAll('.speed-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.speed-btn').forEach(b=>{ if(parseFloat(b.textContent)===parseFloat(val)) b.classList.add('active'); });
    const vid = document.getElementById('previewVid');
    if (vid) vid.playbackRate = parseFloat(val);
}

async function doChangeSpeed() {
    if (!uploadedFile) { alert('⚠️ ارفع فيديو أولاً'); return; }
    const speed  = window.currentSpeed || 1;
    const res    = document.getElementById('serviceResult');
    setProcessing(res, `جاري تطبيق سرعة ${speed}x...`);
    try {
        // نستخدم Canvas + MediaRecorder مع playbackRate
        const blob = await captureWithSpeed(uploadedFile, speed);
        const url  = URL.createObjectURL(blob);
        const name = baseName(uploadedFile.name)+'_'+speed+'x.webm';
        setSuccess(res, url, name, { 'السرعة': speed+'x', 'الحجم': toMB(blob)+' MB' });
    } catch(err) { setError(res, 'خطأ: '+err.message); }
}

function captureWithSpeed(file, speed) {
    return new Promise((resolve, reject) => {
        const vid = document.createElement('video');
        vid.src   = URL.createObjectURL(file);
        vid.muted = false;
        vid.addEventListener('error', ()=>reject(new Error('تعذّر تحميل الفيديو')));
        vid.addEventListener('loadedmetadata', ()=>{
            vid.playbackRate = speed;
            const stream = vid.captureStream?vid.captureStream():vid.mozCaptureStream?.();
            if (!stream) { reject(new Error('المتصفح لا يدعم هذه العملية')); return; }
            const mime   = 'video/webm';
            const chunks = []; const rec = new MediaRecorder(stream, {mimeType:mime});
            rec.ondataavailable = e=>{ if(e.data.size) chunks.push(e.data); };
            rec.onstop = ()=>{ vid.pause(); URL.revokeObjectURL(vid.src); resolve(new Blob(chunks,{type:mime})); };
            rec.start(200); vid.play();
            vid.addEventListener('ended', ()=>{ try{rec.stop();}catch(e){} });
            setTimeout(()=>{ try{if(rec.state==='recording') rec.stop();}catch(e){} }, (vid.duration/speed)*1000+2000);
        });
    });
}

/* ─────────────────────────────────────────────
   🔄 تدوير الفيديو
   ─────────────────────────────────────────────*/
function selectRotate(btn, val) {
    document.querySelectorAll('.rotate-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    window.currentRotate = val;
    // معاينة على الفيديو
    const vid = document.getElementById('previewVid');
    if (vid) {
        let t = '';
        if (val===90)  t='rotate(90deg)';
        if (val===180) t='rotate(180deg)';
        if (val===270) t='rotate(-90deg)';
        if (val==='flipH') t='scaleX(-1)';
        if (val==='flipV') t='scaleY(-1)';
        vid.style.transform = t;
    }
}

async function doRotateVideo() {
    if (!uploadedFile) { alert('⚠️ ارفع فيديو أولاً'); return; }
    const rotate = window.currentRotate || 0;
    const res    = document.getElementById('serviceResult');
    setProcessing(res, 'جاري تدوير الفيديو...');
    try {
        const blob = await captureWithTransform(uploadedFile, rotate);
        const url  = URL.createObjectURL(blob);
        const lbl  = rotate===0?'بدون تدوير':rotate==='flipH'?'عكس أفقي':rotate==='flipV'?'عكس رأسي':rotate+'°';
        const name = baseName(uploadedFile.name)+'_rotated.webm';
        setSuccess(res, url, name, { 'التدوير': lbl, 'الحجم': toMB(blob)+' MB' });
    } catch(err) { setError(res, 'خطأ: '+err.message); }
}

function captureWithTransform(file, rotate) {
    return new Promise((resolve, reject) => {
        const vid = document.createElement('video');
        vid.src   = URL.createObjectURL(file); vid.muted = false;
        vid.addEventListener('error', ()=>reject(new Error('تعذّر تحميل الفيديو')));
        vid.addEventListener('loadedmetadata', ()=>{
            const w = vid.videoWidth, h = vid.videoHeight;
            const sw= (rotate===90||rotate===270)?h:w;
            const sh= (rotate===90||rotate===270)?w:h;
            const canvas = document.createElement('canvas');
            canvas.width=sw; canvas.height=sh;
            const ctx = canvas.getContext('2d');
            const stream = canvas.captureStream(30);
            // نضيف صوت من الفيديو
            const audioCtx = new AudioContext();
            const src = audioCtx.createMediaElementSource(vid);
            const dst = audioCtx.createMediaStreamDestination();
            src.connect(dst); src.connect(audioCtx.destination);
            dst.stream.getAudioTracks().forEach(t=>stream.addTrack(t));
            const mime='video/webm'; const chunks=[]; const rec=new MediaRecorder(stream,{mimeType:mime});
            rec.ondataavailable=e=>{if(e.data.size) chunks.push(e.data);};
            rec.onstop=()=>{ URL.revokeObjectURL(vid.src); audioCtx.close();
                resolve(new Blob(chunks,{type:mime})); };
            rec.start(200);
            const draw=()=>{
                if(vid.paused||vid.ended){rec.stop();return;}
                ctx.save(); ctx.clearRect(0,0,sw,sh);
                ctx.translate(sw/2,sh/2);
                if(rotate==='flipH')      ctx.scale(-1,1);
                else if(rotate==='flipV') ctx.scale(1,-1);
                else                       ctx.rotate(rotate*Math.PI/180);
                ctx.drawImage(vid,-w/2,-h/2,w,h);
                ctx.restore();
                requestAnimationFrame(draw);
            };
            vid.play(); draw();
        });
    });
}

/* ─────────────────────────────────────────────
   🎨 مرشحات بصرية
   ─────────────────────────────────────────────*/
function selectFilter(el, id, style) {
    document.querySelectorAll('.filter-card').forEach(c=>c.classList.remove('active'));
    el.classList.add('active');
    window.currentFilter = { id, style };
    const vid = document.getElementById('previewVid');
    const intensity = document.getElementById('filterIntensity')?.value/100 || 1;
    if (vid) vid.style.filter = style==='none' ? '' : applyFilterIntensity(style, intensity);
}
function applyFilterIntensity(style, intensity) {
    if (!style || style==='none') return '';
    // نعدّل القيم النسبية فقط من خلال مزج مع none
    return style; // تطبيق مبسط
}

async function doApplyFilter() {
    if (!uploadedFile) { alert('⚠️ ارفع فيديو أولاً'); return; }
    const filter = window.currentFilter || {id:'none',style:'none'};
    if (filter.id==='none') { alert('⚠️ اختر مرشحاً أولاً'); return; }
    const res = document.getElementById('serviceResult');
    setProcessing(res, `جاري تطبيق مرشح "${filter.id}"...`);
    try {
        const blob = await captureWithFilter(uploadedFile, filter.style);
        const url  = URL.createObjectURL(blob);
        const name = baseName(uploadedFile.name)+'_filtered.webm';
        setSuccess(res, url, name, { 'المرشح': filter.id, 'الحجم': toMB(blob)+' MB' });
    } catch(err) { setError(res, 'خطأ: '+err.message); }
}

function captureWithFilter(file, filterStyle) {
    return new Promise((resolve, reject) => {
        const vid = document.createElement('video');
        vid.src = URL.createObjectURL(file); vid.muted = false;
        vid.addEventListener('error', ()=>reject(new Error('تعذّر تحميل الفيديو')));
        vid.addEventListener('loadedmetadata', ()=>{
            const w=vid.videoWidth, h=vid.videoHeight;
            const canvas = document.createElement('canvas'); canvas.width=w; canvas.height=h;
            const ctx = canvas.getContext('2d');
            const stream = canvas.captureStream(30);
            const audioCtx = new AudioContext();
            const src = audioCtx.createMediaElementSource(vid);
            const dst = audioCtx.createMediaStreamDestination();
            src.connect(dst); src.connect(audioCtx.destination);
            dst.stream.getAudioTracks().forEach(t=>stream.addTrack(t));
            const mime='video/webm'; const chunks=[]; const rec=new MediaRecorder(stream,{mimeType:mime});
            rec.ondataavailable=e=>{if(e.data.size) chunks.push(e.data);};
            rec.onstop=()=>{ URL.revokeObjectURL(vid.src); audioCtx.close();
                resolve(new Blob(chunks,{type:mime})); };
            rec.start(200);
            const draw=()=>{
                if(vid.paused||vid.ended){rec.stop();return;}
                ctx.filter = filterStyle==='none'?'':filterStyle;
                ctx.drawImage(vid,0,0,w,h);
                requestAnimationFrame(draw);
            };
            vid.play(); draw();
        });
    });
}

/* ─────────────────────────────────────────────
   📝 إضافة نص على الفيديو
   ─────────────────────────────────────────────*/
async function doTextOverlay() {
    if (!uploadedFile) { alert('⚠️ ارفع فيديو أولاً'); return; }
    const text  = document.getElementById('overlayText')?.value.trim();
    if (!text) { alert('⚠️ أدخل النص أولاً'); return; }
    const color  = document.getElementById('textColor')?.value  || '#ffffff';
    const size   = parseInt(document.getElementById('fontSize')?.value)  || 48;
    const xPos   = document.getElementById('textX')?.value      || 'center';
    const yPos   = document.getElementById('textY')?.value      || 'bottom';
    const bgMode = document.getElementById('textBg')?.value     || 'none';
    const tStart = parseFloat(document.getElementById('textStart')?.value) || 0;
    const tEnd   = parseFloat(document.getElementById('textEnd')?.value)   || 9999;
    const res = document.getElementById('serviceResult');
    setProcessing(res, 'جاري إضافة النص على الفيديو...');
    try {
        const blob = await captureWithText(uploadedFile, { text, color, size, xPos, yPos, bgMode, tStart, tEnd });
        const url  = URL.createObjectURL(blob);
        const name = baseName(uploadedFile.name)+'_text.webm';
        setSuccess(res, url, name, { 'النص': text, 'الحجم': toMB(blob)+' MB' });
    } catch(err) { setError(res, 'خطأ: '+err.message); }
}

function captureWithText(file, opts) {
    return new Promise((resolve, reject) => {
        const vid = document.createElement('video');
        vid.src = URL.createObjectURL(file); vid.muted = false;
        vid.addEventListener('error', ()=>reject(new Error('تعذّر تحميل الفيديو')));
        vid.addEventListener('loadedmetadata', ()=>{
            const w=vid.videoWidth, h=vid.videoHeight;
            const canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h;
            const ctx=canvas.getContext('2d');
            const stream=canvas.captureStream(30);
            const audioCtx=new AudioContext();
            const src=audioCtx.createMediaElementSource(vid);
            const dst=audioCtx.createMediaStreamDestination();
            src.connect(dst); src.connect(audioCtx.destination);
            dst.stream.getAudioTracks().forEach(t=>stream.addTrack(t));
            const mime='video/webm'; const chunks=[]; const rec=new MediaRecorder(stream,{mimeType:mime});
            rec.ondataavailable=e=>{if(e.data.size) chunks.push(e.data);};
            rec.onstop=()=>{ URL.revokeObjectURL(vid.src); audioCtx.close(); resolve(new Blob(chunks,{type:mime})); };
            rec.start(200);
            const draw=()=>{
                if(vid.paused||vid.ended){rec.stop();return;}
                ctx.clearRect(0,0,w,h); ctx.drawImage(vid,0,0,w,h);
                const t=vid.currentTime;
                if(t>=opts.tStart && t<=opts.tEnd) {
                    const fs=opts.size; ctx.font=`bold ${fs}px 'Segoe UI', sans-serif`;
                    const tw=ctx.measureText(opts.text).width;
                    let tx=w/2-tw/2, ty=h-fs-30;
                    if(opts.xPos==='left')   tx=30;
                    if(opts.xPos==='right')  tx=w-tw-30;
                    if(opts.yPos==='top')    ty=fs+20;
                    if(opts.yPos==='center') ty=h/2;
                    if(opts.bgMode!=='none'){
                        const pad=12;
                        const bgMap={black:'rgba(0,0,0,.75)',red:'rgba(180,0,0,.75)',white:'rgba(255,255,255,.75)'};
                        ctx.fillStyle=bgMap[opts.bgMode]||'rgba(0,0,0,.7)';
                        ctx.roundRect?ctx.roundRect(tx-pad,ty-fs,tw+pad*2,fs+pad,8):ctx.fillRect(tx-pad,ty-fs,tw+pad*2,fs+pad);
                        ctx.fill();
                    }
                    ctx.fillStyle=opts.color;
                    ctx.fillText(opts.text,tx,ty);
                }
                requestAnimationFrame(draw);
            };
            vid.play(); draw();
        });
    });
}

/* ─────────────────────────────────────────────
   🤖 محرر الذكاء الاصطناعي
   ─────────────────────────────────────────────*/
function termLog(msg, type='user') {
    const out = document.getElementById('terminalOutput'); if (!out) return;
    const div = document.createElement('div');
    div.className = 'term-line '+type;
    div.innerHTML = type==='user' ? `<span class="term-prompt">❯</span> ${msg}` : msg;
    out.appendChild(div);
    out.scrollTop = out.scrollHeight;
}

async function runAICommand() {
    const inp = document.getElementById('aiCommand'); if (!inp) return;
    const cmd = inp.value.trim(); if (!cmd) { alert('⚠️ اكتب أمراً أولاً'); return; }
    if (!uploadedFile) { termLog('⚠️ ارفع ملفاً أولاً ثم أعطِ الأمر', 'error'); return; }
    inp.value = '';
    termLog(cmd, 'user');
    termLog('<i class="fas fa-spinner fa-spin"></i> جاري تحليل الأمر...', 'ai');

    // تحليل الأوامر الشائعة بدون AI
    const parsed = parseNaturalCommand(cmd);
    if (parsed) {
        termLog(`✅ فهمت: ${parsed.desc}`, 'ai');
        termLog(`⚙️ جاري التنفيذ...`, 'ai');
        await executeAIAction(parsed);
        return;
    }

    // إذا لم يُعرَف الأمر — استخدم Claude API
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({
                model:'claude-sonnet-4-20250514',
                max_tokens:300,
                messages:[{
                    role:'user',
                    content:`أنت محلل أوامر تحرير فيديو. المستخدم قال: "${cmd}"
حوّل هذا إلى JSON بهذا الشكل فقط (بدون أي نص آخر):
{"action":"trim|convert|extract-audio|compress|speed|rotate","start":رقم_أو_null,"end":رقم_أو_null,"format":"mp4|mp3|webm|wav|null","speed":رقم_أو_null,"rotate":درجة_أو_null,"desc":"وصف قصير بالعربية"}`
                }]
            })
        });
        const data = await response.json();
        const raw  = data.content?.[0]?.text?.trim() || '{}';
        const json = JSON.parse(raw.replace(/```json?|```/g,'').trim());
        termLog(`✅ Claude فهم: ${json.desc||'أمر غير معروف'}`, 'ai');
        if (json.action) {
            termLog('⚙️ جاري التنفيذ...', 'ai');
            await executeAIAction(json);
        } else {
            termLog('❓ لم أفهم الأمر تماماً. جرب: "اقطع من 10 إلى 30" أو "حول إلى mp3"', 'ai');
        }
    } catch(err) {
        termLog('⚠️ تعذّر الاتصال بـ AI — يعمل الآن بالتحليل المحلي فقط', 'warn');
    }
}

function parseNaturalCommand(cmd) {
    const c = cmd.toLowerCase().replace(/[،,]/g,',');
    // قطع
    const trimM = c.match(/(?:اقطع|قص|قطّع|cut|trim).*?(?:من|from)?\s*(\d+(?:\.\d+)?)\s*(?:ثانية|ث|s|sec)?\s*(?:إلى|الى|to)\s*(\d+(?:\.\d+)?)/);
    if (trimM) return { action:'trim', start:parseFloat(trimM[1]), end:parseFloat(trimM[2]), desc:`قطع من ${trimM[1]}ث إلى ${trimM[2]}ث` };
    // استخرج صوت
    const audioM = c.match(/(?:استخرج|extract|اخرج).*(صوت|audio|mp3|wav|ogg)/);
    if (audioM) { const fmt=audioM[1].includes('wav')?'wav':audioM[1].includes('ogg')?'ogg':'mp3'; return {action:'extract-audio',format:fmt,desc:`استخراج الصوت بصيغة ${fmt}`}; }
    // تحويل
    const convM = c.match(/(?:حول|convert|تحويل).*(mp4|webm|mov|avi|mkv)/);
    if (convM) return { action:'convert', format:convM[1], desc:`تحويل إلى ${convM[1].toUpperCase()}` };
    // ضغط
    if (/ضغط|compress/.test(c)) return { action:'compress', desc:'ضغط الفيديو' };
    // سرعة
    const spM = c.match(/(?:سرّع|سرع|أبطئ|ابطئ|speed|سرعة).*?(\d+(?:\.\d+)?)\s*x/);
    if (spM) return { action:'speed', speed:parseFloat(spM[1]), desc:`تغيير السرعة إلى ${spM[1]}x` };
    // تدوير
    const rotM = c.match(/(?:دوّر|دور|rotate).*?(\d+)/);
    if (rotM) return { action:'rotate', rotate:parseInt(rotM[1]), desc:`تدوير ${rotM[1]}°` };
    return null;
}

async function executeAIAction(parsed) {
    const res = document.getElementById('serviceResult');
    switch(parsed.action) {
        case 'trim': {
            setProcessing(res,'جاري التقطيع...');
            const blob=await captureVideoSlice(uploadedFile, parsed.start, parsed.end);
            const url=URL.createObjectURL(blob);
            setSuccess(res,url,baseName(uploadedFile.name)+'_trimmed.webm',{'المقطع':`${parsed.start}ث → ${parsed.end}ث`,'الحجم':toMB(blob)+' MB'});
            termLog('✅ اكتمل التقطيع! يمكنك التنزيل أدناه.','ai');
            break;
        }
        case 'extract-audio': {
            setProcessing(res,'جاري استخراج الصوت...');
            const ab=await uploadedFile.arrayBuffer();
            const ac=new (window.AudioContext||window.webkitAudioContext)();
            const buf=await ac.decodeAudioData(ab.slice(0)); ac.close();
            const fmt=parsed.format||'mp3';
            const blob=await audioBufToBlob(buf,fmt);
            const url=URL.createObjectURL(blob);
            const ext=blob.type.includes('mp3')?'mp3':blob.type.includes('ogg')?'ogg':'wav';
            setSuccess(res,url,baseName(uploadedFile.name)+'.'+ext,{'الصيغة':ext.toUpperCase(),'المدة':buf.duration.toFixed(1)+' ثانية'});
            termLog('✅ اكتمل الاستخراج!','ai');
            break;
        }
        case 'convert': {
            setProcessing(res,'جاري التحويل...');
            const fmt=parsed.format||'webm';
            const outMime=(fmt==='mp4'&&MediaRecorder.isTypeSupported('video/mp4'))?'video/mp4':'video/webm';
            const blob=await reencodeEntireVideo(uploadedFile,outMime);
            const ext=outMime==='video/mp4'?'mp4':'webm';
            const url=URL.createObjectURL(blob);
            setSuccess(res,url,baseName(uploadedFile.name)+'.'+ext,{'الصيغة':ext.toUpperCase(),'الحجم':toMB(blob)+' MB'});
            termLog('✅ اكتمل التحويل!','ai');
            break;
        }
        case 'compress': {
            setProcessing(res,'جاري الضغط...');
            const outMime='video/webm';
            const blob=await reencodeEntireVideo(uploadedFile,outMime,800000,96000);
            const origMB=(uploadedFile.size/1048576).toFixed(2);
            const newMB=toMB(blob);
            const saved=Math.max(0,((origMB-newMB)/origMB*100)).toFixed(1);
            const url=URL.createObjectURL(blob);
            setSuccess(res,url,baseName(uploadedFile.name)+'_compressed.webm',{'الحجم الأصلي':origMB+' MB','الحجم الجديد':newMB+' MB','تم التوفير':saved+'%'});
            termLog('✅ اكتمل الضغط!','ai');
            break;
        }
        case 'speed': {
            setProcessing(res,'جاري تغيير السرعة...');
            const blob=await captureWithSpeed(uploadedFile, parsed.speed||1.5);
            const url=URL.createObjectURL(blob);
            setSuccess(res,url,baseName(uploadedFile.name)+'_speed.webm',{'السرعة':(parsed.speed||1.5)+'x','الحجم':toMB(blob)+' MB'});
            termLog('✅ اكتملت عملية السرعة!','ai');
            break;
        }
        case 'rotate': {
            setProcessing(res,'جاري التدوير...');
            const blob=await captureWithTransform(uploadedFile, parsed.rotate||90);
            const url=URL.createObjectURL(blob);
            setSuccess(res,url,baseName(uploadedFile.name)+'_rotated.webm',{'التدوير':(parsed.rotate||90)+'°','الحجم':toMB(blob)+' MB'});
            termLog('✅ اكتمل التدوير!','ai');
            break;
        }
        default:
            termLog('❓ لم أتمكن من تنفيذ الأمر. جرب أمراً أوضح.','error');
    }
}

/* ─────────────────────────────────────────────
   🔔 إشعارات سطح المكتب
   ─────────────────────────────────────────────*/
function requestNotifPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}
function sendNotif(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '🎬' });
    }
}

// تعديل setSuccess لإرسال إشعار
const _origSetSuccess = setSuccess;
setSuccess = function(el, url, fname, details) {
    _origSetSuccess(el, url, fname, details);
    sendNotif('✅ اكتملت المعالجة!', `"${fname}" جاهز للتنزيل`);
};

/* ─────────────────────────────────────────────
   🌙 Easter Egg + تحية الصباح
   ─────────────────────────────────────────────*/
(function easterEgg() {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) {
        setTimeout(() => {
            const toast = document.createElement('div');
            toast.className = 'morning-toast';
            toast.innerHTML = `☕ صباح النشاط والإبداع! <span onclick="this.parentElement.remove()" style="cursor:pointer;margin-right:.5rem">×</span>`;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 5000);
        }, 2000);
    }
    console.log('%c🎬 Eyad_Eyad12 — المعالجة محلياً 100% على جهازك. لا يُرفع أي ملف للإنترنت.', 'color:#ffd700;font-size:1rem;font-weight:bold;background:#0a0a0a;padding:8px 16px;border-radius:8px;');
    console.log('%c🤖 الخدمات المتاحة: تقطيع، دمج، سرعة، تدوير، مرشحات، نص، استخراج صوت، ضغط، AI editor', 'color:#dc143c;font-size:.9rem;');
})();

/* ─────────────────────────────────────────────
   ⚙️ Presets — حفظ الإعدادات المفضلة
   ─────────────────────────────────────────────*/
function savePreset(name, settings) {
    const presets = JSON.parse(localStorage.getItem('userPresets') || '[]');
    presets.unshift({ name, settings, date: new Date().toLocaleDateString('ar-IQ') });
    if (presets.length > 5) presets.pop();
    localStorage.setItem('userPresets', JSON.stringify(presets));
}
function loadPresets() { return JSON.parse(localStorage.getItem('userPresets') || '[]'); }

/* ─────────────────────────────────────────────
   تهيئة عند التحميل
   ─────────────────────────────────────────────*/
document.addEventListener('DOMContentLoaded', () => {
    requestNotifPermission();
    // منع السحب على كامل الصفحة
    document.addEventListener('dragover',  e => e.preventDefault());
    document.addEventListener('drop',      e => e.preventDefault());
});

/* ═══════════════════════════════════════════════════════════
   📊 الإحصائيات المتقدمة مع رسوم بيانية
   ═══════════════════════════════════════════════════════════ */
const _origUpdateStats = updateStats;
updateStats = function() {
    _origUpdateStats();

    const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    setText('totalReviews', reviews.length);

    renderPkgChart();
    renderSvcChart();
    renderRecentActivities();
};

function renderPkgChart() {
    const el = document.getElementById('pkgChart'); if (!el) return;
    const users  = Object.values(serviceUsers);
    const today  = new Date();
    const counts = { 'يومي': 0, 'أسبوعي': 0, 'شهري': 0, 'منتهي': 0 };
    users.forEach(u => {
        if (today > new Date(u.expiryDate)) counts['منتهي']++;
        else counts[u.subscriptionType] = (counts[u.subscriptionType] || 0) + 1;
    });
    const total  = users.length || 1;
    const colors = { 'يومي':'#4CAF50', 'أسبوعي':'#2196F3', 'شهري':'#ffd700', 'منتهي':'#f44336' };
    el.innerHTML = Object.entries(counts).map(([k, v]) => {
        const pct = Math.round(v / total * 100);
        return `<div class="chart-row">
            <span class="chart-label">${k}</span>
            <div class="chart-bar-wrap">
                <div class="chart-bar-fill" style="width:${pct}%;background:${colors[k]||'#888'}">
                    ${pct > 8 ? pct+'%' : ''}
                </div>
            </div>
            <span class="chart-val">${v} مستخدم</span>
        </div>`;
    }).join('');
}

function renderSvcChart() {
    const el   = document.getElementById('svcChart'); if (!el) return;
    const logs = JSON.parse(localStorage.getItem('serviceLogs') || '[]');
    if (!logs.length) { el.innerHTML = '<p style="color:#666;padding:1rem">لا توجد بيانات بعد</p>'; return; }
    const counts = {};
    logs.forEach(l => counts[l.service] = (counts[l.service] || 0) + 1);
    const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,6);
    const max    = sorted[0]?.[1] || 1;
    const palette= ['#dc143c','#ff3366','#ffd700','#4CAF50','#2196F3','#7c3aed'];
    el.innerHTML = sorted.map(([k,v], i) => {
        const pct = Math.round(v / max * 100);
        return `<div class="chart-row">
            <span class="chart-label" style="max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(k)}">${esc(k)}</span>
            <div class="chart-bar-wrap">
                <div class="chart-bar-fill" style="width:${pct}%;background:${palette[i%palette.length]}">
                    ${pct > 8 ? v : ''}
                </div>
            </div>
            <span class="chart-val">${v} مرة</span>
        </div>`;
    }).join('');
}

function renderRecentActivities() {
    const el   = document.getElementById('recentActivities'); if (!el) return;
    const logs = JSON.parse(localStorage.getItem('serviceLogs') || '[]');
    const msgs = JSON.parse(localStorage.getItem('messages')    || '[]');
    const ords = JSON.parse(localStorage.getItem('orders')      || '[]');

    const all = [
        ...logs.slice(-5).map(l => ({ icon:'fa-tools', color:'#dc143c', text:`${l.username} استخدم خدمة "${l.service}"`, time:l.timestamp })),
        ...msgs.slice(-3).map(m => ({ icon:'fa-envelope', color:'#2196F3', text:`رسالة من ${m.name}`, time:m.timestamp })),
        ...ords.slice(-3).map(o => ({ icon:'fa-shopping-cart', color:'#ffd700', text:`طلب جديد من ${o.gameName} — ${o.price} IQD`, time:o.timestamp }))
    ].sort((a,b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

    if (!all.length) { el.innerHTML='<p style="color:#666;padding:1rem">لا توجد نشاطات بعد</p>'; return; }
    el.innerHTML = all.map(a => `
        <div class="activity-item">
            <div class="activity-icon" style="background:${a.color}22;color:${a.color}">
                <i class="fas ${a.icon}"></i>
            </div>
            <div class="activity-text">${a.text}</div>
            <div class="activity-time">${a.time}</div>
        </div>`).join('');
}

/* ═══════════════════════════════════════════════════════════
   💬 بوابة الاقتراحات (مُدمجة في لوحة التحكم)
   ═══════════════════════════════════════════════════════════ */
// تسجيل اقتراح من المستخدم (يُستدعى من نموذج التواصل مع نوع "اقتراح")
function submitSuggestion(name, msg) {
    const arr = JSON.parse(localStorage.getItem('suggestions') || '[]');
    arr.unshift({ id: Date.now(), name, msg, votes: 0, date: new Date().toLocaleDateString('ar-IQ') });
    localStorage.setItem('suggestions', JSON.stringify(arr));
}
function voteForSuggestion(id) {
    const arr = JSON.parse(localStorage.getItem('suggestions') || '[]');
    const item = arr.find(s => s.id === id);
    if (item) { item.votes++; localStorage.setItem('suggestions', JSON.stringify(arr)); }
}

/* ═══════════════════════════════════════════════════════════
   ✨ الميزات الجديدة — نسخة متكاملة
   ═══════════════════════════════════════════════════════════

   3  — Cursor Glow
   2  — Tilt 3D
   4  — عدادات أرقام متحركة
   5  — انتقالات سينمائية
   6  — AI Chat Bot
   10 — عداد العروض المحدودة
   13 — Live Charts (Chart.js)
   14 — تصدير PDF
   15 — نظام إشعارات داخلي
   16 — Gamification نقاط وشارات
   ═══════════════════════════════════════════════════════════ */

/* Cursor Glow: REMOVED */

/* ════════════════════════════════
   2 — Tilt 3D للبطاقات
   ════════════════════════════════ */
function initTilt3D() {
    const cards = document.querySelectorAll(
        '.service-card, .pricing-card, .website-card, .stat-card, .subscription-card, .review-card'
    );
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x    = e.clientX - rect.left;
            const y    = e.clientY - rect.top;
            const cx   = rect.width  / 2;
            const cy   = rect.height / 2;
            const rotX = ((y - cy) / cy) * -12;
            const rotY = ((x - cx) / cx) *  12;
            card.style.transform    = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.04)`;
            card.style.transition   = 'transform .05s linear';
            card.style.boxShadow    = `${-rotY * 2}px ${rotX * 2}px 35px rgba(220,20,60,.4)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform  = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
            card.style.transition = 'transform .4s ease, box-shadow .4s ease';
            card.style.boxShadow  = '';
        });
    });
}

/* ════════════════════════════════
   4 — عدادات أرقام متحركة
   ════════════════════════════════ */
function animateCounters() {
    const counters = document.querySelectorAll('.stat-card h3');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting || entry.target._counted) return;
            entry.target._counted = true;
            const target = parseInt(entry.target.textContent.replace(/\D/g,''));
            const suffix = entry.target.textContent.replace(/[\d,]/g,'').trim();
            const duration = 1800;
            const step = 16;
            const steps = duration / step;
            let current = 0;
            const inc = target / steps;
            const timer = setInterval(() => {
                current = Math.min(current + inc, target);
                entry.target.textContent = Math.floor(current).toLocaleString() + suffix;
                if (current >= target) clearInterval(timer);
            }, step);
        });
    }, { threshold: .5 });
    counters.forEach(c => observer.observe(c));
}

/* ════════════════════════════════
   5 — انتقالات سينمائية
   ════════════════════════════════ */
function initCinematicTransitions() {
    // أضف overlay الانتقال
    const overlay = document.createElement('div');
    overlay.id = 'transOverlay';
    Object.assign(overlay.style, {
        position: 'fixed', inset: '0', zIndex: '9995',
        background: 'linear-gradient(135deg, #0a0a0a, #1a0010)',
        pointerEvents: 'none', opacity: '0',
        transition: 'opacity .35s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    });
    overlay.innerHTML = `<div id="transLogo" style="opacity:0;transform:scale(.8);transition:all .3s ease;color:#dc143c;font-size:2rem;font-weight:900;letter-spacing:4px">Eyad_Eyad12</div>`;
    document.body.appendChild(overlay);

    const origScroll = window.scrollToSection;
    window.scrollToSection = function(id) {
        playTransition(() => origScroll(id));
    };

    // ربط التنقل في الـ nav
    document.querySelectorAll('.nav-link:not(.admin-link)').forEach(link => {
        const origClick = link.onclick;
        link.addEventListener('click', e => {
            e.preventDefault();
            e.stopImmediatePropagation();
            const id = link.getAttribute('href')?.substring(1);
            if (!id) return;
            playTransition(() => {
                document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
                document.getElementById(id)?.classList.add('active');
                document.querySelectorAll('.nav-link').forEach(l => { if(!l.classList.contains('admin-link')) l.classList.remove('active'); });
                link.classList.add('active');
                document.getElementById('navMenu')?.classList.remove('active');
                document.getElementById('hamburger')?.classList.remove('active');
                window.scrollTo({top:0,behavior:'smooth'});
            });
        }, true);
    });
}

function playTransition(cb) {
    const ov    = document.getElementById('transOverlay');
    const logo  = document.getElementById('transLogo');
    if (!ov) { cb(); return; }
    ov.style.opacity       = '1';
    ov.style.pointerEvents = 'all';
    logo.style.opacity     = '1';
    logo.style.transform   = 'scale(1)';
    setTimeout(() => {
        cb();
        logo.style.opacity   = '0';
        logo.style.transform = 'scale(1.2)';
        ov.style.opacity     = '0';
        ov.style.pointerEvents = 'none';
    }, 420);
}

/* ════════════════════════════════
   10 — عداد العروض المحدودة
   ════════════════════════════════ */
function initCountdownTimers() {
    // وقت انتهاء ثابت — كل يوم ينتهي عند منتصف الليل
    const endTime = new Date();
    endTime.setHours(23, 59, 59, 0);

    const banners = document.querySelectorAll('.pricing-card.featured');
    banners.forEach(card => {
        if (card.querySelector('.countdown-wrap')) return;
        const wrap = document.createElement('div');
        wrap.className = 'countdown-wrap';
        wrap.innerHTML = `
            <div class="countdown-label"><i class="fas fa-fire"></i> ينتهي العرض خلال:</div>
            <div class="countdown-digits">
                <div class="cd-unit"><span class="cd-num" id="cdh_${Math.random().toString(36).substr(2,5)}">00</span><small>ساعة</small></div>
                <div class="cd-sep">:</div>
                <div class="cd-unit"><span class="cd-num" id="cdm_${Math.random().toString(36).substr(2,5)}">00</span><small>دقيقة</small></div>
                <div class="cd-sep">:</div>
                <div class="cd-unit"><span class="cd-num" id="cds_${Math.random().toString(36).substr(2,5)}">00</span><small>ثانية</small></div>
            </div>`;
        card.insertBefore(wrap, card.querySelector('.pricing-btn'));

        const hEl = wrap.querySelector('[id^="cdh_"]');
        const mEl = wrap.querySelector('[id^="cdm_"]');
        const sEl = wrap.querySelector('[id^="cds_"]');

        const tick = () => {
            const now  = new Date();
            const diff = Math.max(0, endTime - now);
            const h    = Math.floor(diff / 3600000);
            const m    = Math.floor((diff % 3600000) / 60000);
            const s    = Math.floor((diff % 60000) / 1000);
            hEl.textContent = String(h).padStart(2,'0');
            mEl.textContent = String(m).padStart(2,'0');
            sEl.textContent = String(s).padStart(2,'0');
        };
        tick();
        setInterval(tick, 1000);
    });
}

/* ════════════════════════════════
   15 — نظام إشعارات داخلي
   ════════════════════════════════ */
let _notifCount = 0;
const _notifList = [];

function initNotificationSystem() {
    // أضف زر الجرس في الـ navbar
    const navCont = document.querySelector('.nav-container');
    if (!navCont || document.getElementById('bellBtn')) return;

    const bell = document.createElement('div');
    bell.id = 'bellBtn';
    bell.innerHTML = `
        <i class="fas fa-bell"></i>
        <span class="bell-badge" id="bellBadge" style="display:none">0</span>`;
    bell.onclick = toggleNotifPanel;
    navCont.appendChild(bell);

    const panel = document.createElement('div');
    panel.id = 'notifPanel';
    panel.innerHTML = `
        <div class="notif-header">
            <span><i class="fas fa-bell"></i> الإشعارات</span>
            <button onclick="clearAllNotifs()"><i class="fas fa-trash"></i> مسح الكل</button>
        </div>
        <div class="notif-list" id="notifList">
            <div class="notif-empty"><i class="fas fa-bell-slash"></i><p>لا توجد إشعارات</p></div>
        </div>`;
    document.body.appendChild(panel);

    // إشعار ترحيب
    setTimeout(() => pushNotif('مرحباً بك! 👋', 'استكشف خدماتنا المميزة', 'info'), 3000);

    // مراقبة localStorage للطلبات الجديدة
    setInterval(() => {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const key    = 'lastOrderCount';
        const last   = parseInt(localStorage.getItem(key) || '0');
        if (orders.length > last) {
            pushNotif('طلب جديد! 🛒', `طلب "${orders[orders.length-1]?.gameName}" بانتظار المراجعة`, 'order');
            localStorage.setItem(key, orders.length);
        }
    }, 8000);
}

function pushNotif(title, body, type='info') {
    _notifCount++;
    _notifList.unshift({ id: Date.now(), title, body, type, time: new Date().toLocaleTimeString('ar-IQ'), read: false });
    if (_notifList.length > 20) _notifList.pop();
    updateBell();
    renderNotifPanel();
    // صوت خفيف
    try {
        const ac  = new AudioContext();
        const osc = ac.createOscillator();
        const gn  = ac.createGain();
        osc.connect(gn); gn.connect(ac.destination);
        osc.frequency.value = type==='order' ? 880 : 660;
        gn.gain.setValueAtTime(.15, ac.currentTime);
        gn.gain.exponentialRampToValueAtTime(.001, ac.currentTime + .4);
        osc.start(); osc.stop(ac.currentTime + .4);
    } catch(e) {}
    // Toast
    showToast(title, body, type);
}

function updateBell() {
    const unread = _notifList.filter(n => !n.read).length;
    const badge  = document.getElementById('bellBadge');
    if (badge) { badge.textContent = unread; badge.style.display = unread ? 'flex' : 'none'; }
}

function toggleNotifPanel() {
    const panel = document.getElementById('notifPanel');
    if (!panel) return;
    const open = panel.classList.toggle('open');
    if (open) { _notifList.forEach(n => n.read = true); updateBell(); renderNotifPanel(); }
}

function renderNotifPanel() {
    const list = document.getElementById('notifList'); if (!list) return;
    if (!_notifList.length) {
        list.innerHTML = '<div class="notif-empty"><i class="fas fa-bell-slash"></i><p>لا توجد إشعارات</p></div>';
        return;
    }
    const icons = { info:'fa-info-circle', order:'fa-shopping-cart', success:'fa-check-circle', warn:'fa-exclamation-triangle' };
    const colors= { info:'#2196F3', order:'#ffd700', success:'#4CAF50', warn:'#ff9800' };
    list.innerHTML = _notifList.map(n => `
        <div class="notif-item ${n.read?'read':'unread'}">
            <div class="notif-icon" style="color:${colors[n.type]||'#888'}">
                <i class="fas ${icons[n.type]||'fa-bell'}"></i>
            </div>
            <div class="notif-body">
                <strong>${esc(n.title)}</strong>
                <p>${esc(n.body)}</p>
            </div>
            <span class="notif-time">${n.time}</span>
        </div>`).join('');
}

function clearAllNotifs() {
    _notifList.length = 0; _notifCount = 0;
    updateBell(); renderNotifPanel();
}

function showToast(title, body, type='info') {
    const colors = { info:'#2196F3', order:'#ffd700', success:'#4CAF50', warn:'#ff9800' };
    const toast  = document.createElement('div');
    toast.className = 'notif-toast';
    toast.style.borderColor = colors[type] || '#dc143c';
    toast.innerHTML = `
        <strong style="color:${colors[type]||'#dc143c'}">${esc(title)}</strong>
        <p>${esc(body)}</p>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(()=>toast.remove(), 400); }, 4000);
}

// دمج مع setSuccess
const __origSetSuccess = window.setSuccess;
if (typeof __origSetSuccess === 'function') {
    window.setSuccess = function(el, url, fname, details) {
        __origSetSuccess(el, url, fname, details);
        pushNotif('✅ اكتملت المعالجة!', `"${fname}" جاهز للتنزيل`, 'success');
        addPoints(50, 'معالجة ملف');
    };
}

/* ════════════════════════════════
   16 — Gamification نقاط وشارات
   ════════════════════════════════ */
function getGamingProfile() {
    return JSON.parse(localStorage.getItem('gamingProfile') || JSON.stringify({
        points: 0, level: 1, badges: [], totalActions: 0
    }));
}
function saveGamingProfile(p) { localStorage.setItem('gamingProfile', JSON.stringify(p)); }

const BADGES = [
    { id:'first_use',   name:'أول خطوة 🌱',    desc:'استخدام الخدمة لأول مرة', points:0  },
    { id:'ten_actions', name:'مبتدئ نشط ⚡',   desc:'10 عمليات ناجحة',        points:10 },
    { id:'fifty_pts',   name:'نجم صاعد ⭐',    desc:'جمع 50 نقطة',             points:50 },
    { id:'century',     name:'محترف 💯',        desc:'100 نقطة',                points:100},
    { id:'veteran',     name:'خبير الفيديو 🎬', desc:'500 نقطة',                points:500},
];

function addPoints(pts, reason) {
    const p = getGamingProfile();
    p.points      += pts;
    p.totalActions++;
    p.level        = Math.floor(p.points / 100) + 1;

    // تحقق من الشارات
    BADGES.forEach(b => {
        if (!p.badges.includes(b.id)) {
            const earned = (b.id==='first_use' && p.totalActions===1)
                        || (b.id==='ten_actions' && p.totalActions>=10)
                        || (b.id==='fifty_pts'   && p.points>=50)
                        || (b.id==='century'     && p.points>=100)
                        || (b.id==='veteran'     && p.points>=500);
            if (earned) {
                p.badges.push(b.id);
                pushNotif(`شارة جديدة! ${b.name}`, b.desc, 'success');
                showBadgePopup(b);
            }
        }
    });
    saveGamingProfile(p);
    updateGamingWidget();
}

function showBadgePopup(badge) {
    const pop = document.createElement('div');
    pop.className = 'badge-popup';
    pop.innerHTML = `
        <div class="badge-popup-inner">
            <div class="badge-popup-icon">🏆</div>
            <h3>شارة جديدة!</h3>
            <div class="badge-popup-name">${badge.name}</div>
            <p>${badge.desc}</p>
            <button onclick="this.closest('.badge-popup').remove()">رائع! 🎉</button>
        </div>`;
    document.body.appendChild(pop);
    setTimeout(() => pop.classList.add('show'), 50);
}

function initGamingWidget() {
    if (document.getElementById('gamingWidget')) return;
    const w = document.createElement('div');
    w.id = 'gamingWidget';
    w.innerHTML = `
        <div class="gw-header" onclick="toggleGamingPanel()">
            <span class="gw-icon">🎮</span>
            <div class="gw-info">
                <span class="gw-pts" id="gwPts">0 نقطة</span>
                <span class="gw-lvl" id="gwLvl">المستوى 1</span>
            </div>
            <i class="fas fa-chevron-up gw-arrow" id="gwArrow"></i>
        </div>
        <div class="gw-panel" id="gwPanel" style="display:none">
            <div class="gw-bar-wrap">
                <div class="gw-bar" id="gwBar" style="width:0%"></div>
            </div>
            <div class="gw-badges" id="gwBadges"></div>
        </div>`;
    document.body.appendChild(w);
    updateGamingWidget();
    addPoints(5, 'فتح الموقع');
}

function toggleGamingPanel() {
    const panel = document.getElementById('gwPanel');
    const arrow = document.getElementById('gwArrow');
    if (!panel) return;
    const open = panel.style.display === 'none';
    panel.style.display = open ? 'block' : 'none';
    if (arrow) arrow.style.transform = open ? 'rotate(180deg)' : 'rotate(0)';
}

function updateGamingWidget() {
    const p    = getGamingProfile();
    const pts  = document.getElementById('gwPts');
    const lvl  = document.getElementById('gwLvl');
    const bar  = document.getElementById('gwBar');
    const bdgs = document.getElementById('gwBadges');
    if (pts)  pts.textContent  = p.points + ' نقطة';
    if (lvl)  lvl.textContent  = 'المستوى ' + p.level;
    if (bar)  bar.style.width  = Math.min(100, (p.points % 100)) + '%';
    if (bdgs) {
        const earned = BADGES.filter(b => p.badges.includes(b.id));
        bdgs.innerHTML = earned.length
            ? earned.map(b=>`<span class="gw-badge-chip" title="${b.desc}">${b.name}</span>`).join('')
            : '<span style="color:#555;font-size:.82rem">لا توجد شارات بعد</span>';
    }
}

/* ════════════════════════════════
   13 — Live Charts (Chart.js)
   ════════════════════════════════ */
function loadChartJS() {
    return new Promise(resolve => {
        if (window.Chart) { resolve(); return; }
        const s  = document.createElement('script');
        s.src    = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
        s.onload = resolve;
        document.head.appendChild(s);
    });
}

async function renderLiveCharts() {
    await loadChartJS();
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const logs   = JSON.parse(localStorage.getItem('serviceLogs') || '[]');

    // مخطط المبيعات
    const salesEl = document.getElementById('salesChartCanvas');
    if (salesEl && orders.length) {
        if (salesEl._chart) salesEl._chart.destroy();
        const byDay = {};
        orders.forEach(o => {
            const d = o.timestamp?.split(' ')[0] || 'غير محدد';
            byDay[d] = (byDay[d] || 0) + parseInt(String(o.price).replace(/,/g,'') || 0);
        });
        salesEl._chart = new Chart(salesEl, {
            type: 'line',
            data: {
                labels: Object.keys(byDay).slice(-7),
                datasets: [{ label:'الإيرادات (IQD)', data: Object.values(byDay).slice(-7),
                    borderColor:'#dc143c', backgroundColor:'rgba(220,20,60,.15)',
                    fill:true, tension:.4, pointBackgroundColor:'#ff3366' }]
            },
            options: { responsive:true, plugins:{ legend:{ labels:{ color:'#ddd' } } },
                scales:{ x:{ ticks:{ color:'#888' }, grid:{ color:'rgba(255,255,255,.06)' } },
                         y:{ ticks:{ color:'#888' }, grid:{ color:'rgba(255,255,255,.06)' } } } }
        });
    }

    // مخطط الخدمات
    const svcEl = document.getElementById('svcChartCanvas');
    if (svcEl && logs.length) {
        if (svcEl._chart) svcEl._chart.destroy();
        const counts = {};
        logs.forEach(l => counts[l.service] = (counts[l.service]||0)+1);
        const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,6);
        svcEl._chart = new Chart(svcEl, {
            type: 'doughnut',
            data: {
                labels: sorted.map(([k])=>k),
                datasets:[{ data: sorted.map(([,v])=>v),
                    backgroundColor:['#dc143c','#ff3366','#ffd700','#4CAF50','#2196F3','#7c3aed'],
                    borderColor:'#0a0a0a', borderWidth:3 }]
            },
            options: { responsive:true,
                plugins:{ legend:{ labels:{ color:'#ddd', font:{ size:11 } } } } }
        });
    }
}

/* ════════════════════════════════
   14 — تصدير PDF
   ════════════════════════════════ */
function loadJsPDF() {
    return new Promise(resolve => {
        if (window.jspdf) { resolve(); return; }
        const s  = document.createElement('script');
        s.src    = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        s.onload = resolve;
        document.head.appendChild(s);
    });
}

async function exportPDF() {
    await loadJsPDF();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation:'p', unit:'mm', format:'a4' });
    const now = new Date().toLocaleDateString('ar-IQ');

    // إعداد الخط والألوان
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, 210, 297, 'F');

    // Header
    doc.setFillColor(220, 20, 60);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('Eyad_Eyad12', 105, 15, { align:'center' });
    doc.setFontSize(11);
    doc.text('تقرير الأعمال — ' + now, 105, 26, { align:'center' });

    // إحصائيات
    const orders  = JSON.parse(localStorage.getItem('orders') || '[]');
    const msgs    = JSON.parse(localStorage.getItem('messages') || '[]');
    const logs    = JSON.parse(localStorage.getItem('serviceLogs') || '[]');
    const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    const revenue = orders.reduce((s,o)=>s+(parseInt(String(o.price).replace(/,/g,''))||0),0);

    doc.setFontSize(14);
    doc.setTextColor(220, 20, 60);
    doc.text('الإحصائيات العامة', 105, 48, { align:'center' });

    const stats = [
        ['إجمالي الطلبات', orders.length],
        ['إجمالي الإيرادات', revenue.toLocaleString() + ' IQD'],
        ['الرسائل المستلمة', msgs.length],
        ['استخدام الخدمات', logs.length],
        ['آراء العملاء', reviews.length],
        ['متوسط التقييم', reviews.length ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1)+'★' : 'N/A']
    ];

    let y = 58;
    stats.forEach(([label, val], i) => {
        const bg = i%2===0 ? [30,10,20] : [20,5,15];
        doc.setFillColor(...bg);
        doc.roundedRect(15, y-6, 180, 12, 2, 2, 'F');
        doc.setTextColor(180, 180, 180); doc.setFontSize(10);
        doc.text(label, 180, y, { align:'right' });
        doc.setTextColor(255, 215, 0); doc.setFontSize(11);
        doc.text(String(val), 30, y);
        y += 14;
    });

    // آخر 5 طلبات
    if (orders.length) {
        y += 5;
        doc.setFontSize(13); doc.setTextColor(220, 20, 60);
        doc.text('آخر الطلبات', 105, y, { align:'center' });
        y += 8;
        orders.slice(-5).reverse().forEach(o => {
            doc.setFillColor(25, 10, 18);
            doc.roundedRect(15, y-5, 180, 10, 2, 2, 'F');
            doc.setTextColor(200,200,200); doc.setFontSize(9);
            doc.text(`${o.gameName}  |  ${o.amount} شدة  |  ${o.price} IQD  |  ${o.paymentStatus}`, 105, y, { align:'center' });
            y += 12;
        });
    }

    // Footer
    doc.setFillColor(220, 20, 60);
    doc.rect(0, 285, 210, 12, 'F');
    doc.setTextColor(255,255,255); doc.setFontSize(9);
    doc.text('Eyad_Eyad12 © 2025 — All Rights Reserved', 105, 292, { align:'center' });

    doc.save(`Eyad_Report_${now}.pdf`);
    pushNotif('✅ تم تصدير التقرير', 'تم حفظ ملف PDF بنجاح', 'success');
}

/* AI Chat: REMOVED */

/* ════════════════════════════════
   updateStats مُحسّن لإضافة الـ canvas
   ════════════════════════════════ */
const ___origUpdateStats = window.updateStats;
window.updateStats = async function() {
    ___origUpdateStats?.();
    // أضف canvas للمخططات إذا لم تكن موجودة
    const statsTab = document.getElementById('statsTab');
    if (statsTab && !document.getElementById('salesChartCanvas')) {
        const chartsHTML = `
            <div class="chart-section" style="margin-top:1.5rem">
                <h4><i class="fas fa-chart-line"></i> مخطط الإيرادات اليومية</h4>
                <canvas id="salesChartCanvas" height="120"></canvas>
            </div>
            <div class="chart-section" style="margin-top:1.5rem;display:grid;grid-template-columns:1fr 1fr;gap:1.5rem">
                <div>
                    <h4 style="color:var(--secondary);margin-bottom:1rem"><i class="fas fa-chart-pie"></i> توزيع الخدمات</h4>
                    <canvas id="svcChartCanvas" height="200"></canvas>
                </div>
                <div id="pkgChart"></div>
            </div>
            <div class="chart-section" style="margin-top:1.5rem">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:1rem">
                    <h4 style="color:var(--secondary);margin:0"><i class="fas fa-file-pdf"></i> تصدير التقرير</h4>
                    <button onclick="exportPDF()" class="export-btn" style="background:linear-gradient(135deg,#dc143c,#ff3366)">
                        <i class="fas fa-file-pdf"></i> تصدير PDF
                    </button>
                </div>
            </div>`;
        const statsCards = statsTab.querySelector('.stats-cards');
        if (statsCards) statsCards.insertAdjacentHTML('afterend', chartsHTML);
    }
    setTimeout(renderLiveCharts, 200);
};

/* ════════════════════════════════
   تهيئة عند التحميل
   ════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    initTilt3D();
    animateCounters();
    initCinematicTransitions();
    initNotificationSystem();
    initGamingWidget();
    
    setTimeout(initCountdownTimers, 500);

    // إعادة تطبيق Tilt عند فتح الخدمات
    const observer = new MutationObserver(() => initTilt3D());
    const grid = document.querySelector('.services-grid');
    if (grid) observer.observe(grid, { childList: true, subtree: true });
});

/* ═══════════════════════════════════════════════════════════
   🎛️ لوحة التحكم الكاملة — Full Admin Control
   ═══════════════════════════════════════════════════════════ */

/* ────────────────────────────────────────────────
   ربط التبويبات الجديدة
   ──────────────────────────────────────────────── */
const ____origSwitch = window.switchAdminTab;
window.switchAdminTab = function(e, tab) {
    document.querySelectorAll('.admin-tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
    document.getElementById(tab + 'Tab')?.classList.add('active');
    if (e?.currentTarget) e.currentTarget.classList.add('active');
    else if (e?.target)   e.target.classList.add('active');

    const map = {
        orders: loadOrdersTab, messages: loadMessagesTab,
        services: loadServicesTab, users: loadUsersTab,
        stats: updateStats, reviews: loadReviewsTab,
        offers: loadOffersTab, sitecontrol: loadSiteControl
    };
    map[tab]?.();
};

/* ════════════════════════════════════════════════
   📋 الطلبات — عرض الصورة + تغيير الحالة
   ════════════════════════════════════════════════ */

// استبدال loadOrdersTab لإضافة عرض الصورة وتغيير الحالة
loadOrdersTab = function() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const tbody  = document.getElementById('ordersTableBody');
    if (!tbody) return;
    if (!orders.length) {
        tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;padding:2rem;color:#888">لا توجد طلبات</td></tr>';
        return;
    }
    tbody.innerHTML = orders.map((o, i) => `
        <tr id="order_row_${o.id}">
            <td>${i + 1}</td>
            <td style="font-size:.8rem">${o.timestamp}</td>
            <td><strong>${esc(o.gameName)}</strong></td>
            <td>${esc(o.phoneNumber)}</td>
            <td><strong style="color:var(--secondary)">${o.amount} شدة</strong></td>
            <td style="color:var(--gold)">${o.price} IQD</td>
            <td style="font-family:monospace">${esc(o.gameId)}</td>
            <td>${esc(o.cardName)}</td>
            <td>
                <select class="status-select" onchange="changeOrderStatus(${o.id}, this.value)" style="background:rgba(0,0,0,.5);border:1px solid var(--border);color:#fff;border-radius:8px;padding:4px 8px;font-size:.82rem">
                    <option value="قيد المراجعة"  ${o.paymentStatus==='قيد المراجعة' ?'selected':''}>⏳ قيد المراجعة</option>
                    <option value="تم التأكيد"    ${o.paymentStatus==='تم التأكيد'   ?'selected':''}>✅ تم التأكيد</option>
                    <option value="مكتمل"          ${o.paymentStatus==='مكتمل'        ?'selected':''}>🎉 مكتمل</option>
                    <option value="ملغي"           ${o.paymentStatus==='ملغي'         ?'selected':''}>❌ ملغي</option>
                    <option value="مشكلة في الدفع" ${o.paymentStatus==='مشكلة في الدفع'?'selected':''}>⚠️ مشكلة</option>
                </select>
            </td>
            <td>
                ${o.paymentProofImg
                    ? `<img src="${o.paymentProofImg}" onclick="viewProofImage('${o.paymentProofImg}')"
                          style="width:42px;height:42px;object-fit:cover;border-radius:8px;border:2px solid var(--primary);cursor:zoom-in"
                          title="اضغط للتكبير">`
                    : `<span style="color:#555;font-size:.78rem">لا صورة</span>`}
            </td>
            <td>
                <button class="action-btn view"   onclick="viewOrder(${o.id})"   title="تفاصيل"><i class="fas fa-eye"></i></button>
                <button class="action-btn delete" onclick="deleteOrder(${o.id})" title="حذف"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`).join('');
};

function changeOrderStatus(id, newStatus) {
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const o    = orders.find(x => x.id === id);
    if (!o) return;
    o.paymentStatus = newStatus;
    localStorage.setItem('orders', JSON.stringify(orders));
    // تلوين الصف
    const row  = document.getElementById('order_row_' + id);
    if (row) {
        const colors = { 'مكتمل':'rgba(76,175,80,.12)', 'تم التأكيد':'rgba(33,150,243,.12)',
                         'ملغي':'rgba(244,67,54,.12)', 'مشكلة في الدفع':'rgba(255,152,0,.12)',
                         'قيد المراجعة':'' };
        row.style.background = colors[newStatus] || '';
    }
    pushNotif('تم تحديث الطلب', `حالة طلب "${o.gameName}" → ${newStatus}`, 'success');
}

function viewProofImage(src) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.93);z-index:99999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;backdrop-filter:blur(8px)';
    overlay.innerHTML = `
        <div style="position:relative;max-width:90vw;max-height:90vh">
            <img src="${src}" style="max-width:100%;max-height:90vh;border-radius:14px;border:3px solid var(--primary);box-shadow:0 0 60px rgba(220,20,60,.5)">
            <button onclick="this.closest('[style]').remove()" style="position:absolute;top:-15px;right:-15px;width:36px;height:36px;border-radius:50%;background:#dc143c;border:none;color:#fff;font-size:1.3rem;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(220,20,60,.5)">×</button>
            <a href="${src}" download="payment_proof.jpg" onclick="event.stopPropagation()"
               style="position:absolute;bottom:-15px;left:50%;transform:translateX(-50%);background:var(--primary);color:#fff;padding:.4rem 1.2rem;border-radius:20px;font-size:.85rem;text-decoration:none;display:flex;align-items:center;gap:6px">
                <i class="fas fa-download"></i> تحميل
            </a>
        </div>`;
    overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
    document.body.appendChild(overlay);
}

// تحديث submitPurchase لحفظ الصورة
const _origSubmitPurchase = window.submitPurchase;
window.submitPurchase = function(e) {
    e.preventDefault();
    if (!document.getElementById('paymentProof')?.files?.length) { alert('⚠️ أرفق صورة إثبات الدفع!'); return; }
    const gn = document.getElementById('gameName')?.value.trim();
    const gi = document.getElementById('gameId')?.value.trim();
    const ph = document.getElementById('phoneNumber')?.value.trim();
    if (!gn) { alert('⚠️ أدخل اسمك في اللعبة'); return; }
    if (!gi) { alert('⚠️ أدخل رقم ID'); return; }
    if (!ph) { alert('⚠️ أدخل رقم الهاتف'); return; }

    const file = document.getElementById('paymentProof').files[0];
    const reader = new FileReader();
    reader.onload = ev => {
        const order = {
            id: Date.now(), timestamp: new Date().toLocaleString('ar-IQ'),
            amount: currentPurchase.amount, price: currentPurchase.price,
            gameName: gn, gameId: gi, phoneNumber: ph,
            cardName: document.getElementById('cardName')?.value.trim() || 'غير محدد',
            paymentStatus: 'قيد المراجعة',
            paymentProofImg: ev.target.result  // ← الصورة base64
        };
        const arr = JSON.parse(localStorage.getItem('orders') || '[]');
        arr.push(order); localStorage.setItem('orders', JSON.stringify(arr));
        closePurchaseModal(); showModal('successModal');
        pushNotif('طلب جديد! 🛒', `${gn} — ${currentPurchase.amount} شدة`, 'order');
    };
    reader.readAsDataURL(file);
};

/* ════════════════════════════════════════════════
   🏷️ إدارة العروض والإعلانات
   ════════════════════════════════════════════════ */
function showAddOfferForm()  { document.getElementById('addOfferForm').style.display = 'block'; }
function closeAddOfferForm() { document.getElementById('addOfferForm').style.display = 'none'; }

function saveOffer() {
    const title   = document.getElementById('of_title')?.value.trim();
    const text    = document.getElementById('of_text')?.value.trim();
    const pos     = document.getElementById('of_position')?.value;
    const color   = document.getElementById('of_color')?.value;
    const hours   = parseInt(document.getElementById('of_hours')?.value) || 0;
    const link    = document.getElementById('of_link')?.value.trim();
    const btntext = document.getElementById('of_btntext')?.value.trim() || 'اشترِ الآن';
    const active  = document.getElementById('of_active')?.value === '1';

    if (!title) { alert('⚠️ أدخل عنوان العرض'); return; }

    const offer = {
        id: Date.now(), title, text, pos, color, hours,
        link, btntext, active,
        endsAt: hours > 0 ? Date.now() + hours * 3600000 : null,
        createdAt: new Date().toLocaleDateString('ar-IQ')
    };
    const arr = JSON.parse(localStorage.getItem('siteOffers') || '[]');
    arr.unshift(offer); localStorage.setItem('siteOffers', JSON.stringify(arr));
    closeAddOfferForm(); loadOffersTab(); applyOffers();
    alert('✅ تم إضافة العرض وتطبيقه على الموقع!');
}

function loadOffersTab() {
    const offers = JSON.parse(localStorage.getItem('siteOffers') || '[]');
    const tbody  = document.getElementById('offersTableBody');
    if (!tbody) return;
    if (!offers.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:#888">لا توجد عروض — أضف أول عرض!</td></tr>';
        return;
    }
    const posNames = { top:'شريط علوي', home:'الرئيسية', charging:'الشحن', services:'الخدمات', popup:'نافذة منبثقة' };
    tbody.innerHTML = offers.map((o, i) => `
        <tr>
            <td>${i + 1}</td>
            <td><strong style="color:var(--gold)">${esc(o.title)}</strong><br>
                <small style="color:#888">${esc(o.text?.substring(0,40) || '')}...</small></td>
            <td><span style="background:rgba(33,150,243,.2);color:#64b5f6;padding:3px 10px;border-radius:10px;font-size:.8rem">${posNames[o.pos] || o.pos}</span></td>
            <td>${o.hours > 0 ? `<span style="color:var(--primary)">${o.hours} ساعة</span>` : '<span style="color:#555">بلا عداد</span>'}</td>
            <td>
                <label class="toggle-switch" style="transform:scale(.85)">
                    <input type="checkbox" ${o.active?'checked':''} onchange="toggleOfferActive(${o.id},this.checked)">
                    <span class="toggle-slider"></span>
                </label>
            </td>
            <td>
                <button class="action-btn view"   onclick="previewOffer(${o.id})" title="معاينة"><i class="fas fa-eye"></i></button>
                <button class="action-btn delete" onclick="deleteOffer(${o.id})"  title="حذف"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`).join('');
}

function toggleOfferActive(id, active) {
    const arr = JSON.parse(localStorage.getItem('siteOffers') || '[]');
    const o   = arr.find(x => x.id === id);
    if (o) { o.active = active; localStorage.setItem('siteOffers', JSON.stringify(arr)); applyOffers(); }
}
function deleteOffer(id) {
    if (!confirm('حذف هذا العرض؟')) return;
    const arr = JSON.parse(localStorage.getItem('siteOffers') || '[]').filter(o => o.id !== id);
    localStorage.setItem('siteOffers', JSON.stringify(arr));
    loadOffersTab(); applyOffers();
}
function previewOffer(id) {
    const o = JSON.parse(localStorage.getItem('siteOffers') || '[]').find(x => x.id === id);
    if (o) alert(`👁️ معاينة العرض:\n\nالعنوان: ${o.title}\nالنص: ${o.text}\nالموقع: ${o.pos}\nنشط: ${o.active?'نعم':'لا'}`);
}

/* تطبيق العروض على الموقع */
function applyOffers() {
    // أزل العروض القديمة
    document.querySelectorAll('.site-offer-inject').forEach(el => el.remove());
    const offers = JSON.parse(localStorage.getItem('siteOffers') || '[]').filter(o => o.active);

    offers.forEach(offer => {
        // عرض انتهى؟
        if (offer.endsAt && Date.now() > offer.endsAt) return;

        const el = document.createElement('div');
        el.className = 'site-offer-inject offer-banner';
        el.style.setProperty('--offer-color', offer.color);

        const remaining = offer.endsAt ? offer.endsAt - Date.now() : 0;
        const counterId = 'ocd_' + offer.id;
        const btnHTML   = offer.link
            ? `<a href="${offer.link}" class="offer-btn">${esc(offer.btntext)}</a>`
            : '';
        const cdHTML    = remaining > 0
            ? `<div class="offer-countdown" id="${counterId}">⏰ جاري التحميل...</div>`
            : '';

        el.innerHTML = `
            <div class="offer-content">
                <div class="offer-text-wrap">
                    <strong class="offer-title">${esc(offer.title)}</strong>
                    ${offer.text ? `<span class="offer-text">${esc(offer.text)}</span>` : ''}
                </div>
                ${cdHTML}
                ${btnHTML}
                <button class="offer-close" onclick="this.closest('.site-offer-inject').remove()">×</button>
            </div>`;

        // إذا كان عداد — نشغله
        if (remaining > 0) {
            const tick = () => {
                const now  = Date.now();
                const diff = Math.max(0, offer.endsAt - now);
                const cdEl = document.getElementById(counterId);
                if (!cdEl) return;
                if (diff <= 0) { el.remove(); return; }
                const h = Math.floor(diff/3600000);
                const m = Math.floor((diff%3600000)/60000);
                const s = Math.floor((diff%60000)/1000);
                cdEl.textContent = `⏰ ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
            };
            setTimeout(tick, 100);
            setInterval(tick, 1000);
        }

        // أين يُوضع؟
        if (offer.pos === 'top') {
            el.classList.add('offer-top-bar');
            document.body.insertBefore(el, document.body.firstChild);
            document.querySelector('.navbar').style.top = el.offsetHeight + 'px';
        } else if (offer.pos === 'popup') {
            el.classList.add('offer-popup');
            document.body.appendChild(el);
        } else {
            const section = document.getElementById(offer.pos);
            if (section) {
                const cont = section.querySelector('.container');
                if (cont) cont.insertBefore(el, cont.firstChild);
            }
        }
    });
}

/* ════════════════════════════════════════════════
   🎛️ تحكم الموقع الكامل
   ════════════════════════════════════════════════ */
function loadSiteControl() {
    // تحميل القيم المحفوظة
    const sc = JSON.parse(localStorage.getItem('siteControl') || '{}');
    if (sc.name)    document.getElementById('sc_name').value    = sc.name;
    if (sc.desc)    document.getElementById('sc_desc').value    = sc.desc;
    if (sc.clients) document.getElementById('sc_clients').value = sc.clients;
    if (sc.projects)document.getElementById('sc_projects').value= sc.projects;
    if (sc.rating)  document.getElementById('sc_rating').value  = sc.rating;
    if (sc.primarycolor) document.getElementById('sc_primarycolor').value = sc.primarycolor;
    if (sc.globalmsg)    document.getElementById('sc_globalmsg').value    = sc.globalmsg;
    if (sc.msgcolor)     document.getElementById('sc_msgcolor').value     = sc.msgcolor;

    // تحميل أسعار الشحن
    loadChargingPriceControls();

    // تحميل حالة الأقسام
    const visibility = JSON.parse(localStorage.getItem('sectionVisibility') || '{}');
    ['websites','charging','services','reviews','contact'].forEach(id => {
        const cb = document.getElementById('sc_show_' + id);
        if (cb && visibility[id] === false) cb.checked = false;
    });
}

function saveSiteControl() {
    const sc = {
        name:         document.getElementById('sc_name')?.value.trim(),
        desc:         document.getElementById('sc_desc')?.value.trim(),
        clients:      document.getElementById('sc_clients')?.value.trim(),
        projects:     document.getElementById('sc_projects')?.value.trim(),
        rating:       document.getElementById('sc_rating')?.value.trim(),
        primarycolor: document.getElementById('sc_primarycolor')?.value,
        globalmsg:    document.getElementById('sc_globalmsg')?.value.trim(),
        msgcolor:     document.getElementById('sc_msgcolor')?.value
    };
    localStorage.setItem('siteControl', JSON.stringify(sc));
    applySiteControl(sc);
    alert('✅ تم حفظ جميع التغييرات وتطبيقها على الموقع!');
}

function applySiteControl(sc) {
    if (!sc) sc = JSON.parse(localStorage.getItem('siteControl') || '{}');

    // الاسم
    if (sc.name) {
        document.querySelectorAll('.name').forEach(el => el.textContent = sc.name);
        document.querySelectorAll('.logo span').forEach(el => el.textContent = sc.name);
        document.title = sc.name + ' - الصفحة الرسمية';
    }
    // الوصف
    if (sc.desc) {
        const descEl = document.querySelector('.description');
        if (descEl) descEl.innerHTML = sc.desc + '<br>شغف بالإبداع والتقنية';
    }
    // الإحصائيات
    const statCards = document.querySelectorAll('.stat-card h3');
    if (sc.clients  && statCards[0]) statCards[0].textContent = sc.clients;
    if (sc.projects && statCards[1]) statCards[1].textContent = sc.projects;
    if (sc.rating   && statCards[2]) statCards[2].textContent = sc.rating;

    // اللون الرئيسي
    if (sc.primarycolor) applyPrimaryColor(sc.primarycolor);

    // الإشعار العالمي
    if (sc.globalmsg) applyGlobalMessage(sc.globalmsg, sc.msgcolor);
}

function applyPrimaryColor(color) {
    const root = document.documentElement;
    root.style.setProperty('--primary', color);
    // حساب لون ثانوي (أفتح)
    root.style.setProperty('--secondary', color + 'cc');
    root.style.setProperty('--border', color + '44');
}

function applyGlobalMessage(msg, color) {
    if (!msg) msg = document.getElementById('sc_globalmsg')?.value?.trim();
    if (!color) color = document.getElementById('sc_msgcolor')?.value || '#ffd700';
    document.getElementById('globalMsgBar')?.remove();
    if (!msg) return;
    const bar = document.createElement('div');
    bar.id = 'globalMsgBar';
    bar.style.cssText = `position:fixed;top:0;left:0;width:100%;z-index:10000;background:${color};color:#000;text-align:center;padding:.5rem 1rem;font-weight:700;font-size:.92rem;display:flex;align-items:center;justify-content:center;gap:.8rem`;
    bar.innerHTML = `<span>${esc(msg)}</span><button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;font-size:1.1rem;color:#000;line-height:1">×</button>`;
    document.body.insertBefore(bar, document.body.firstChild);
    document.querySelector('.navbar').style.top = '36px';
    const sc = JSON.parse(localStorage.getItem('siteControl') || '{}');
    sc.globalmsg = msg; sc.msgcolor = color;
    localStorage.setItem('siteControl', JSON.stringify(sc));
}

function toggleSection(id, show) {
    const navLink = document.querySelector(`.nav-link[href="#${id}"]`);
    if (navLink) navLink.closest('li').style.display = show ? '' : 'none';
    const visibility = JSON.parse(localStorage.getItem('sectionVisibility') || '{}');
    visibility[id] = show;
    localStorage.setItem('sectionVisibility', JSON.stringify(visibility));
}

function toggleElement(id, show) {
    const el = document.getElementById(id);
    if (el) el.style.display = show ? '' : 'none';
}

/* ── أسعار الشحن ── */
const defaultPrices = [
    { amount:'30',  price:'6,500' }, { amount:'60',  price:'12,500' },
    { amount:'120', price:'24,000'}, { amount:'180', price:'35,000' },
    { amount:'300', price:'56,000'}, { amount:'625', price:'112,000'},
    { amount:'1065',price:'180,000'}
];

function loadChargingPriceControls() {
    const el = document.getElementById('chargingPriceControls'); if (!el) return;
    const saved = JSON.parse(localStorage.getItem('chargingPrices') || 'null') || defaultPrices;
    el.innerHTML = saved.map((p, i) => `
        <div class="form-group">
            <label>${p.amount} شدة — السعر (IQD)</label>
            <input type="text" id="cp_${i}" class="form-input" value="${p.price}"
                   placeholder="${p.price}" style="text-align:center">
        </div>`).join('');
}

function saveChargingPrices() {
    const saved = JSON.parse(localStorage.getItem('chargingPrices') || 'null') || defaultPrices;
    saved.forEach((p, i) => {
        const inp = document.getElementById('cp_' + i);
        if (inp) p.price = inp.value.trim();
    });
    localStorage.setItem('chargingPrices', JSON.stringify(saved));
    // تحديث الأزرار في الصفحة
    document.querySelectorAll('.pricing-btn').forEach((btn, i) => {
        if (saved[i]) {
            btn.onclick = null;
            btn.setAttribute('onclick', `openPurchaseModal('${saved[i].amount}','${saved[i].price}')`);
        }
    });
    document.querySelectorAll('.pricing-price').forEach((el, i) => {
        if (saved[i]) el.textContent = saved[i].price + ' IQD';
    });
    alert('✅ تم تحديث الأسعار على الموقع!');
}

/* ════════════════════════════════════════════════
   تطبيق كل الإعدادات عند التحميل
   ════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    // تطبيق تحكم الموقع المحفوظ
    setTimeout(() => {
        applySiteControl();
        applyOffers();
        // تطبيق حالة الأقسام
        const visibility = JSON.parse(localStorage.getItem('sectionVisibility') || '{}');
        Object.entries(visibility).forEach(([id, show]) => {
            if (!show) toggleSection(id, false);
        });
        // تطبيق أسعار الشحن
        const prices = JSON.parse(localStorage.getItem('chargingPrices') || 'null');
        if (prices) {
            document.querySelectorAll('.pricing-price').forEach((el, i) => {
                if (prices[i]) el.textContent = prices[i].price + ' IQD';
            });
        }
    }, 300);
});

/* ═══════════════════════════════════════════════════════════
   🎭 إزالة خلفية الفيديو + دمج فيديو فوق فيديو
   ═══════════════════════════════════════════════════════════ */

/* ── ربط الخدمتين الجديدتين في openService ── */
const _origOpenSvc2 = openService;
openService = function(serviceId, serviceName) {
    if (serviceId !== 'bg-remover' && serviceId !== 'video-overlay') {
        _origOpenSvc2(serviceId, serviceName);
        return;
    }
    const modal   = document.getElementById('serviceModal');
    const title   = document.getElementById('serviceModalTitle');
    const content = document.getElementById('serviceModalContent');
    if (!modal || !title || !content) return;
    title.textContent = serviceName;
    uploadedFile = null; selectedFormat = '';

    const res = `<div class="service-result" id="serviceResult"></div>`;

    /* ════════════════════════════════
       🎭 إزالة خلفية الفيديو
       ════════════════════════════════ */
    if (serviceId === 'bg-remover') {
        content.innerHTML = `<div class="service-interface">

            <div class="upload-area drag-upload" id="dz_bgFile"
                 onclick="document.getElementById('bgFile').click()"
                 ondragover="handleDragOver(event,'dz_bgFile')"
                 ondragleave="handleDragLeave(event,'dz_bgFile')"
                 ondrop="handleDrop(event,'bgFile','dz_bgFile')">
                <i class="fas fa-magic" style="color:#7c3aed"></i>
                <p>ارفع الفيديو المراد إزالة خلفيته</p>
                <small>يعمل بأفضل شكل مع خلفية خضراء أو زرقاء ثابتة</small>
                <input type="file" id="bgFile" accept="video/*" style="display:none"
                       onchange="handleMediaUpload(this); loadBgPreview()">
            </div>
            <div id="fileInfo" class="file-info-display"></div>

            <!-- معاينة + ضبط -->
            <div id="bgPreviewWrap" style="display:none">
                <div class="bg-preview-grid">
                    <!-- مشغل المعاينة -->
                    <div>
                        <div class="preview-label"><i class="fas fa-film"></i> معاينة الفيديو الأصلي</div>
                        <video id="bgSrcVideo" style="width:100%;border-radius:10px;max-height:220px" controls></video>
                    </div>
                    <!-- معاينة Canvas -->
                    <div>
                        <div class="preview-label"><i class="fas fa-eye"></i> معاينة لحظية بعد الإزالة</div>
                        <canvas id="bgPreviewCanvas" style="width:100%;border-radius:10px;max-height:220px;background:repeating-conic-gradient(#333 0% 25%, #1a1a1a 0% 50%) 0 0/20px 20px"></canvas>
                    </div>
                </div>

                <!-- إعدادات الإزالة -->
                <div class="bg-settings-panel">
                    <div class="bg-settings-grid">
                        <div class="form-group">
                            <label><i class="fas fa-eye-dropper"></i> لون الخلفية المراد إزالتها</label>
                            <div style="display:flex;gap:.6rem;align-items:center;flex-wrap:wrap">
                                <input type="color" id="chromaColor" value="#00ff00" class="form-input"
                                       style="height:48px;padding:4px;width:70px"
                                       oninput="updateBgPreview()">
                                <div class="chroma-presets">
                                    <button class="chroma-preset green"  onclick="setChromaColor('#00ff00')" title="أخضر (Green Screen)">أخضر</button>
                                    <button class="chroma-preset blue"   onclick="setChromaColor('#0000ff')" title="أزرق (Blue Screen)">أزرق</button>
                                    <button class="chroma-preset white"  onclick="setChromaColor('#ffffff')" title="أبيض">أبيض</button>
                                    <button class="chroma-preset black"  onclick="setChromaColor('#000000')" title="أسود">أسود</button>
                                    <button class="chroma-preset pick"   onclick="pickColorFromVideo()"     title="استخرج اللون من الفيديو">🔍 استخرج</button>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>حساسية الإزالة: <strong id="threshVal">40</strong></label>
                            <input type="range" id="chromaThresh" min="5" max="120" value="40"
                                   class="speed-slider" oninput="document.getElementById('threshVal').textContent=this.value; updateBgPreview()">
                            <small style="color:#888">منخفض = دقيق | مرتفع = يزيل أكثر</small>
                        </div>

                        <div class="form-group">
                            <label>نعومة الحواف: <strong id="smoothVal">3</strong></label>
                            <input type="range" id="chromaSmooth" min="0" max="15" value="3"
                                   class="speed-slider" oninput="document.getElementById('smoothVal').textContent=this.value; updateBgPreview()">
                        </div>

                        <div class="form-group">
                            <label><i class="fas fa-image"></i> خلفية بديلة (اختياري)</label>
                            <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
                                <button class="bg-opt-btn active" id="bgOptTransparent" onclick="setBgMode('transparent',this)">
                                    <i class="fas fa-chess-board"></i> شفاف
                                </button>
                                <button class="bg-opt-btn" id="bgOptColor" onclick="setBgMode('color',this)">
                                    <i class="fas fa-fill-drip"></i> لون
                                </button>
                                <button class="bg-opt-btn" id="bgOptImage" onclick="setBgMode('image',this)">
                                    <i class="fas fa-image"></i> صورة
                                </button>
                                <input type="color" id="bgReplaceColor" value="#000000" style="display:none;height:38px;padding:3px;border-radius:8px;border:2px solid var(--border)" oninput="updateBgPreview()">
                                <input type="file" id="bgReplaceImg" accept="image/*" style="display:none" onchange="loadReplaceImage(this)">
                                <button id="bgImgPickBtn" style="display:none" class="upload-pick-btn" onclick="document.getElementById('bgReplaceImg').click()">
                                    <i class="fas fa-upload"></i> اختر صورة
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button class="action-btn-service" id="mainBtn" onclick="doBgRemove()" disabled>
                <i class="fas fa-magic"></i> إزالة الخلفية وتصدير الفيديو
            </button>
            ${res}
        </div>`;

        window.bgMode       = 'transparent';
        window.bgReplaceImg = null;

    /* ════════════════════════════════
       🌊 دمج فيديو فوق فيديو
       ════════════════════════════════ */
    } else if (serviceId === 'video-overlay') {
        content.innerHTML = `<div class="service-interface">

            <div class="overlay-upload-grid">
                <!-- فيديو الخلفية -->
                <div>
                    <div class="preview-label" style="margin-bottom:.5rem">
                        <i class="fas fa-photo-video"></i> فيديو الخلفية (الأساسي)
                    </div>
                    <div class="upload-area drag-upload" id="dz_bgVid"
                         onclick="document.getElementById('bgVid').click()"
                         ondragover="handleDragOver(event,'dz_bgVid')"
                         ondragleave="handleDragLeave(event,'dz_bgVid')"
                         ondrop="handleOverlayDrop(event,'bgVid','dz_bgVid','bg')">
                        <i class="fas fa-film"></i>
                        <p>فيديو الخلفية</p>
                        <small>الفيديو الذي يظهر في الخلف</small>
                        <input type="file" id="bgVid" accept="video/*" style="display:none"
                               onchange="loadOverlayFile(this,'bg')">
                    </div>
                    <div id="bgVidInfo" class="file-info-display"></div>
                    <video id="bgVidPreview" style="width:100%;border-radius:10px;max-height:160px;display:none;margin-top:.5rem" controls muted></video>
                </div>

                <!-- فيديو الواجهة (Green Screen) -->
                <div>
                    <div class="preview-label" style="margin-bottom:.5rem">
                        <i class="fas fa-layer-group"></i> فيديو الواجهة (Green Screen)
                    </div>
                    <div class="upload-area drag-upload" id="dz_fgVid"
                         onclick="document.getElementById('fgVid').click()"
                         ondragover="handleDragOver(event,'dz_fgVid')"
                         ondragleave="handleDragLeave(event,'dz_fgVid')"
                         ondrop="handleOverlayDrop(event,'fgVid','dz_fgVid','fg')">
                        <i class="fas fa-user" style="color:#00bcd4"></i>
                        <p>فيديو الواجهة</p>
                        <small>الفيديو الذي سيظهر فوق الخلفية (بعد إزالة خلفيته)</small>
                        <input type="file" id="fgVid" accept="video/*" style="display:none"
                               onchange="loadOverlayFile(this,'fg')">
                    </div>
                    <div id="fgVidInfo" class="file-info-display"></div>
                    <video id="fgVidPreview" style="width:100%;border-radius:10px;max-height:160px;display:none;margin-top:.5rem" controls muted></video>
                </div>
            </div>

            <!-- إعدادات الدمج -->
            <div class="bg-settings-panel" id="overlaySettings" style="display:none">
                <div class="bg-settings-grid">
                    <div class="form-group">
                        <label><i class="fas fa-eye-dropper"></i> لون خلفية الواجهة المراد إزالتها</label>
                        <div style="display:flex;gap:.5rem;flex-wrap:wrap">
                            <input type="color" id="ovChromaColor" value="#00ff00" class="form-input"
                                   style="height:48px;padding:4px;width:70px">
                            <div class="chroma-presets">
                                <button class="chroma-preset green" onclick="document.getElementById('ovChromaColor').value='#00ff00'">أخضر</button>
                                <button class="chroma-preset blue"  onclick="document.getElementById('ovChromaColor').value='#0000ff'">أزرق</button>
                                <button class="chroma-preset white" onclick="document.getElementById('ovChromaColor').value='#ffffff'">أبيض</button>
                                <button class="chroma-preset black" onclick="document.getElementById('ovChromaColor').value='#000000'">أسود</button>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>حساسية الإزالة: <strong id="ovThreshVal">40</strong></label>
                        <input type="range" id="ovChromaThresh" min="5" max="120" value="40"
                               class="speed-slider" oninput="document.getElementById('ovThreshVal').textContent=this.value">
                    </div>
                    <div class="form-group">
                        <label>حجم فيديو الواجهة: <strong id="ovScaleVal">50%</strong></label>
                        <input type="range" id="ovScale" min="10" max="100" value="50"
                               class="speed-slider" oninput="document.getElementById('ovScaleVal').textContent=this.value+'%'">
                    </div>
                    <div class="form-group">
                        <label>الموضع الأفقي: <strong id="ovXVal">50%</strong></label>
                        <input type="range" id="ovX" min="0" max="100" value="50"
                               class="speed-slider" oninput="document.getElementById('ovXVal').textContent=this.value+'%'">
                    </div>
                    <div class="form-group">
                        <label>الموضع الرأسي: <strong id="ovYVal">50%</strong></label>
                        <input type="range" id="ovY" min="0" max="100" value="50"
                               class="speed-slider" oninput="document.getElementById('ovYVal').textContent=this.value+'%'">
                    </div>
                    <div class="form-group">
                        <label>شفافية الواجهة: <strong id="ovAlphaVal">100%</strong></label>
                        <input type="range" id="ovAlpha" min="10" max="100" value="100"
                               class="speed-slider" oninput="document.getElementById('ovAlphaVal').textContent=this.value+'%'">
                    </div>
                </div>

                <!-- معاينة الدمج -->
                <div class="preview-label" style="margin:.8rem 0 .4rem"><i class="fas fa-eye"></i> معاينة الدمج</div>
                <canvas id="overlayPreviewCanvas" style="width:100%;border-radius:10px;max-height:240px;background:#000;cursor:crosshair"></canvas>
                <button class="rv-save-btn" style="margin-top:.8rem" onclick="startOverlayPreview()">
                    <i class="fas fa-play"></i> تشغيل المعاينة
                </button>
            </div>

            <button class="action-btn-service" id="mainBtn" onclick="doVideoOverlay()" disabled>
                <i class="fas fa-layer-group"></i> دمج الفيديوهات وتصدير
            </button>
            ${res}
        </div>`;

        window.bgVidFile = null;
        window.fgVidFile = null;
        window.overlayPreviewRunning = false;
    }

    showModal('serviceModal');
};

/* ════════════════════════════════════════════════
   🎭 منطق إزالة الخلفية
   ════════════════════════════════════════════════ */
function setChromaColor(hex) {
    document.getElementById('chromaColor').value = hex;
    updateBgPreview();
}

function setBgMode(mode, btn) {
    window.bgMode = mode;
    document.querySelectorAll('.bg-opt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('bgReplaceColor').style.display  = mode === 'color'  ? 'block' : 'none';
    document.getElementById('bgImgPickBtn').style.display    = mode === 'image'  ? 'flex'  : 'none';
    updateBgPreview();
}

function loadReplaceImage(input) {
    const file = input.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        const img = new Image();
        img.onload = () => { window.bgReplaceImg = img; updateBgPreview(); };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function loadBgPreview() {
    if (!uploadedFile) return;
    const wrap = document.getElementById('bgPreviewWrap');
    if (wrap) wrap.style.display = 'block';
    const vid = document.getElementById('bgSrcVideo');
    if (vid) {
        vid.src = URL.createObjectURL(uploadedFile);
        vid.onloadedmetadata = () => {
            const c = document.getElementById('bgPreviewCanvas');
            if (c) { c.width = vid.videoWidth; c.height = vid.videoHeight; }
            vid.currentTime = 0.5;
            vid.onseeked = () => updateBgPreview();
        };
    }
}

function pickColorFromVideo() {
    const vid = document.getElementById('bgSrcVideo'); if (!vid) return;
    const c   = document.createElement('canvas');
    c.width = vid.videoWidth; c.height = vid.videoHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(vid, 0, 0);
    // أخذ لون من الزاوية العلوية اليسرى (عادة الخلفية)
    const px  = ctx.getImageData(5, 5, 1, 1).data;
    const hex  = '#' + [px[0],px[1],px[2]].map(v=>v.toString(16).padStart(2,'0')).join('');
    document.getElementById('chromaColor').value = hex;
    updateBgPreview();
    alert(`✅ تم استخراج اللون: ${hex}`);
}

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return {r,g,b};
}

function colorDistance(r1,g1,b1,r2,g2,b2) {
    return Math.sqrt((r1-r2)**2+(g1-g2)**2+(b1-b2)**2);
}

function updateBgPreview() {
    const vid    = document.getElementById('bgSrcVideo');
    const canvas = document.getElementById('bgPreviewCanvas');
    if (!vid || !canvas || vid.readyState < 2) return;
    canvas.width  = vid.videoWidth  || 640;
    canvas.height = vid.videoHeight || 360;
    const ctx     = canvas.getContext('2d');
    ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data    = imgData.data;
    const col     = hexToRgb(document.getElementById('chromaColor')?.value || '#00ff00');
    const thresh  = parseInt(document.getElementById('chromaThresh')?.value || 40);

    for (let i = 0; i < data.length; i += 4) {
        const dist = colorDistance(data[i],data[i+1],data[i+2], col.r,col.g,col.b);
        if (dist < thresh) {
            const factor = Math.max(0, (dist - thresh * .5) / (thresh * .5));
            data[i+3] = Math.floor(data[i+3] * factor);
        }
    }

    // تطبيق الخلفية البديلة
    ctx.putImageData(imgData, 0, 0);
    const mode = window.bgMode || 'transparent';
    if (mode === 'color') {
        const bgCanvas = document.createElement('canvas');
        bgCanvas.width=canvas.width; bgCanvas.height=canvas.height;
        const bgCtx=bgCanvas.getContext('2d');
        bgCtx.fillStyle = document.getElementById('bgReplaceColor')?.value || '#000';
        bgCtx.fillRect(0,0,bgCanvas.width,bgCanvas.height);
        bgCtx.drawImage(canvas,0,0);
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(bgCanvas,0,0);
    } else if (mode === 'image' && window.bgReplaceImg) {
        const bgCanvas = document.createElement('canvas');
        bgCanvas.width=canvas.width; bgCanvas.height=canvas.height;
        const bgCtx=bgCanvas.getContext('2d');
        bgCtx.drawImage(window.bgReplaceImg,0,0,bgCanvas.width,bgCanvas.height);
        bgCtx.drawImage(canvas,0,0);
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(bgCanvas,0,0);
    }
}

async function doBgRemove() {
    if (!uploadedFile) { alert('⚠️ ارفع فيديو أولاً'); return; }
    const res    = document.getElementById('serviceResult');
    const col    = hexToRgb(document.getElementById('chromaColor')?.value || '#00ff00');
    const thresh = parseInt(document.getElementById('chromaThresh')?.value || 40);
    const mode   = window.bgMode || 'transparent';

    setProcessing(res, 'جاري إزالة الخلفية...');

    try {
        const blob = await processChromaKey(uploadedFile, col, thresh, mode);
        const url  = URL.createObjectURL(blob);
        const name = baseName(uploadedFile.name) + '_no_bg.webm';
        setSuccess(res, url, name, {
            'الحجم': toMB(blob) + ' MB',
            'الصيغة': 'WebM (يدعم الشفافية)',
            'الخلفية': mode === 'transparent' ? 'شفافة' : mode === 'color' ? 'لون بديل' : 'صورة بديلة'
        });
    } catch(err) { setError(res, 'خطأ: ' + err.message); }
}

function processChromaKey(file, chromaCol, thresh, bgMode) {
    return new Promise((resolve, reject) => {
        const vid = document.createElement('video');
        vid.src = URL.createObjectURL(file); vid.muted = false;
        vid.addEventListener('error', () => reject(new Error('تعذّر تحميل الفيديو')));
        vid.addEventListener('loadedmetadata', () => {
            const W = vid.videoWidth, H = vid.videoHeight;
            const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
            const ctx    = canvas.getContext('2d');
            const stream = canvas.captureStream(30);

            // صوت من الفيديو
            try {
                const ac  = new AudioContext();
                const src = ac.createMediaElementSource(vid);
                const dst = ac.createMediaStreamDestination();
                src.connect(dst); src.connect(ac.destination);
                dst.stream.getAudioTracks().forEach(t => stream.addTrack(t));
            } catch(e) {}

            const mime   = 'video/webm';
            const chunks = []; const rec = new MediaRecorder(stream, { mimeType: mime });
            rec.ondataavailable = e => { if(e.data.size) chunks.push(e.data); };
            rec.onstop = () => { URL.revokeObjectURL(vid.src); resolve(new Blob(chunks, { type: mime })); };
            rec.start(100);

            const draw = () => {
                if (vid.paused || vid.ended) { rec.stop(); return; }
                ctx.clearRect(0, 0, W, H);

                // ارسم الخلفية البديلة أولاً
                if (bgMode === 'color') {
                    ctx.fillStyle = document.getElementById('bgReplaceColor')?.value || '#000';
                    ctx.fillRect(0, 0, W, H);
                } else if (bgMode === 'image' && window.bgReplaceImg) {
                    ctx.drawImage(window.bgReplaceImg, 0, 0, W, H);
                }

                // ارسم الفيديو
                ctx.drawImage(vid, 0, 0, W, H);
                const imgData = ctx.getImageData(0, 0, W, H);
                const data    = imgData.data;

                for (let i = 0; i < data.length; i += 4) {
                    const dist = colorDistance(data[i],data[i+1],data[i+2], chromaCol.r,chromaCol.g,chromaCol.b);
                    if (dist < thresh) {
                        const softness = Math.max(0, (dist - thresh * .4) / (thresh * .6));
                        data[i+3] = Math.floor(255 * softness);
                    }
                }
                ctx.putImageData(imgData, 0, 0);
                requestAnimationFrame(draw);
            };
            vid.play(); draw();
        });
    });
}

/* ════════════════════════════════════════════════
   🌊 دمج فيديو فوق فيديو
   ════════════════════════════════════════════════ */
function handleOverlayDrop(e, inputId, zoneId, which) {
    e.preventDefault();
    document.getElementById(zoneId)?.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('video')) return;
    if (which === 'bg') { window.bgVidFile = file; showOverlayVidInfo(file, 'bg'); }
    else                { window.fgVidFile = file; showOverlayVidInfo(file, 'fg'); }
    checkOverlayReady();
}

function loadOverlayFile(input, which) {
    const file = input.files[0]; if (!file) return;
    if (which === 'bg') { window.bgVidFile = file; showOverlayVidInfo(file, 'bg'); }
    else                { window.fgVidFile = file; showOverlayVidInfo(file, 'fg'); }
    checkOverlayReady();
}

function showOverlayVidInfo(file, which) {
    const mb   = (file.size/1048576).toFixed(2);
    const info = document.getElementById(which+'VidInfo');
    if (info) info.innerHTML = `<div class="file-info"><p><i class="fas fa-check-circle" style="color:#4CAF50"></i> <strong>${esc(file.name)}</strong> (${mb} MB)</p></div>`;
    const prev = document.getElementById(which+'VidPreview');
    if (prev) { prev.src = URL.createObjectURL(file); prev.style.display = 'block'; }
}

function checkOverlayReady() {
    const settings = document.getElementById('overlaySettings');
    const btn      = document.getElementById('mainBtn');
    const ready    = window.bgVidFile && window.fgVidFile;
    if (settings)  settings.style.display = ready ? 'block' : 'none';
    if (btn)       btn.disabled = !ready;
}

function startOverlayPreview() {
    if (!window.bgVidFile || !window.fgVidFile) return;
    const canvas = document.getElementById('overlayPreviewCanvas'); if (!canvas) return;

    const bgVid  = document.getElementById('bgVidPreview');
    const fgEl   = document.createElement('video');
    fgEl.src     = URL.createObjectURL(window.fgVidFile);
    fgEl.muted   = true; fgEl.loop = true;

    const ctx = canvas.getContext('2d');
    bgVid.loop = true; bgVid.play();
    fgEl.play();

    canvas.width  = bgVid.videoWidth  || 640;
    canvas.height = bgVid.videoHeight || 360;

    const drawPreview = () => {
        if (!document.getElementById('overlayPreviewCanvas')) return;
        const col    = hexToRgb(document.getElementById('ovChromaColor')?.value || '#00ff00');
        const thresh = parseInt(document.getElementById('ovChromaThresh')?.value || 40);
        const scale  = parseInt(document.getElementById('ovScale')?.value || 50) / 100;
        const xPct   = parseInt(document.getElementById('ovX')?.value || 50) / 100;
        const yPct   = parseInt(document.getElementById('ovY')?.value || 50) / 100;
        const alpha  = parseInt(document.getElementById('ovAlpha')?.value || 100) / 100;
        const W = canvas.width, H = canvas.height;

        // ارسم الخلفية
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(bgVid, 0, 0, W, H);

        // ارسم الواجهة على canvas مؤقت
        const fgW = Math.floor(W * scale);
        const fgH = Math.floor(H * scale);
        const tmp = document.createElement('canvas'); tmp.width = fgW; tmp.height = fgH;
        const tc  = tmp.getContext('2d');
        if (fgEl.videoWidth) {
            tc.drawImage(fgEl, 0, 0, fgW, fgH);
            const id   = tc.getImageData(0, 0, fgW, fgH);
            const data = id.data;
            for (let i = 0; i < data.length; i += 4) {
                const d = colorDistance(data[i],data[i+1],data[i+2], col.r,col.g,col.b);
                if (d < thresh) {
                    const sf = Math.max(0, (d - thresh*.4)/(thresh*.6));
                    data[i+3] = Math.floor(255 * sf * alpha);
                } else { data[i+3] = Math.floor(data[i+3] * alpha); }
            }
            tc.putImageData(id, 0, 0);
        }
        const fx = (W - fgW) * xPct;
        const fy = (H - fgH) * yPct;
        ctx.drawImage(tmp, fx, fy);
        requestAnimationFrame(drawPreview);
    };
    fgEl.onloadedmetadata = () => requestAnimationFrame(drawPreview);
}

async function doVideoOverlay() {
    if (!window.bgVidFile || !window.fgVidFile) { alert('⚠️ ارفع كلا الفيديوهين أولاً'); return; }
    const res    = document.getElementById('serviceResult');
    const col    = hexToRgb(document.getElementById('ovChromaColor')?.value || '#00ff00');
    const thresh = parseInt(document.getElementById('ovChromaThresh')?.value || 40);
    const scale  = parseInt(document.getElementById('ovScale')?.value || 50) / 100;
    const xPct   = parseInt(document.getElementById('ovX')?.value || 50) / 100;
    const yPct   = parseInt(document.getElementById('ovY')?.value || 50) / 100;
    const alpha  = parseInt(document.getElementById('ovAlpha')?.value || 100) / 100;
    setProcessing(res, 'جاري دمج الفيديوهين...');

    try {
        const blob = await processVideoOverlay(window.bgVidFile, window.fgVidFile, {col, thresh, scale, xPct, yPct, alpha});
        const url  = URL.createObjectURL(blob);
        const name = 'overlay_' + baseName(window.bgVidFile.name) + '.webm';
        setSuccess(res, url, name, {
            'الحجم': toMB(blob) + ' MB',
            'حجم الواجهة': Math.round(scale*100) + '%',
            'الصيغة': 'WebM'
        });
    } catch(err) { setError(res, 'خطأ: ' + err.message); }
}

function processVideoOverlay(bgFile, fgFile, opts) {
    return new Promise((resolve, reject) => {
        const bgVid = document.createElement('video');
        const fgVid = document.createElement('video');
        bgVid.src = URL.createObjectURL(bgFile);
        fgVid.src = URL.createObjectURL(fgFile);
        bgVid.muted = false; fgVid.muted = true;

        let bgReady = false, fgReady = false;
        const tryStart = () => {
            if (!bgReady || !fgReady) return;
            const W = bgVid.videoWidth, H = bgVid.videoHeight;
            const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
            const ctx    = canvas.getContext('2d');
            const stream = canvas.captureStream(30);

            try {
                const ac  = new AudioContext();
                const src = ac.createMediaElementSource(bgVid);
                const dst = ac.createMediaStreamDestination();
                src.connect(dst); src.connect(ac.destination);
                dst.stream.getAudioTracks().forEach(t => stream.addTrack(t));
            } catch(e) {}

            const mime='video/webm'; const chunks=[]; const rec=new MediaRecorder(stream,{mimeType:mime});
            rec.ondataavailable=e=>{if(e.data.size) chunks.push(e.data);};
            rec.onstop=()=>{URL.revokeObjectURL(bgVid.src);URL.revokeObjectURL(fgVid.src);
                resolve(new Blob(chunks,{type:mime}));};
            rec.start(100);

            const {col,thresh,scale,xPct,yPct,alpha} = opts;
            const fgW = Math.floor(W * scale), fgH = Math.floor(H * scale);
            const tmp = document.createElement('canvas'); tmp.width=fgW; tmp.height=fgH;
            const tc  = tmp.getContext('2d');

            const draw = () => {
                if (bgVid.paused || bgVid.ended) { rec.stop(); return; }
                ctx.clearRect(0,0,W,H);
                ctx.drawImage(bgVid,0,0,W,H);

                if (!fgVid.ended && fgVid.readyState >= 2) {
                    tc.clearRect(0,0,fgW,fgH);
                    tc.drawImage(fgVid,0,0,fgW,fgH);
                    const id=tc.getImageData(0,0,fgW,fgH), data=id.data;
                    for(let i=0;i<data.length;i+=4){
                        const d=colorDistance(data[i],data[i+1],data[i+2],col.r,col.g,col.b);
                        if(d<thresh){ const sf=Math.max(0,(d-thresh*.4)/(thresh*.6)); data[i+3]=Math.floor(255*sf*alpha); }
                        else        { data[i+3]=Math.floor(data[i+3]*alpha); }
                    }
                    tc.putImageData(id,0,0);
                    const fx=(W-fgW)*xPct, fy=(H-fgH)*yPct;
                    ctx.drawImage(tmp,fx,fy);
                }
                requestAnimationFrame(draw);
            };

            bgVid.play(); fgVid.play();
            requestAnimationFrame(draw);
            bgVid.addEventListener('ended', () => { try{rec.stop();}catch(e){} });
        };

        bgVid.addEventListener('loadedmetadata', () => { bgReady=true; tryStart(); });
        fgVid.addEventListener('loadedmetadata', () => { fgReady=true; tryStart(); });
        bgVid.addEventListener('error', () => reject(new Error('خطأ في فيديو الخلفية')));
        fgVid.addEventListener('error', () => reject(new Error('خطأ في فيديو الواجهة')));
    });
}

/* ═══════════════════════════════════════════════════════════
   ⏰ العدادات التنازلية — تحكم كامل
   ═══════════════════════════════════════════════════════════ */

const TIMER_STYLES = {
    fire:     { bg:'linear-gradient(135deg,#7f0000,#dc143c,#ff6b35)', text:'#fff', shadow:'rgba(220,20,60,.6)' },
    gold:     { bg:'linear-gradient(135deg,#7c5c00,#ffd700,#ff9800)', text:'#000', shadow:'rgba(255,215,0,.5)' },
    neon:     { bg:'linear-gradient(135deg,#003366,#0066ff,#00ccff)', text:'#fff', shadow:'rgba(0,150,255,.6)' },
    dark:     { bg:'linear-gradient(135deg,#0a0a0a,#1a1a2e,#16213e)', text:'#fff', shadow:'rgba(0,0,0,.8)' },
    gradient: { bg:'linear-gradient(135deg,#7c3aed,#dc143c,#ff9800)', text:'#fff', shadow:'rgba(124,58,237,.5)' }
};
const SECTION_LABELS = {
    home:'الرئيسية', charging:'قسم الشحن', services:'قسم الخدمات',
    all_featured:'فوق الباقات المميزة', topbar:'شريط علوي'
};

function showAddTimerForm()  { document.getElementById('addTimerForm').style.display='block'; const now=new Date(); now.setDate(now.getDate()+1); document.getElementById('tm_enddate').value=now.toISOString().slice(0,16); }
function closeAddTimerForm() { document.getElementById('addTimerForm').style.display='none'; }

function saveTimer() {
    const title   = document.getElementById('tm_title')?.value.trim();
    const section = document.getElementById('tm_section')?.value;
    const style   = document.getElementById('tm_style')?.value;
    const enddate = document.getElementById('tm_enddate')?.value;
    const link    = document.getElementById('tm_link')?.value.trim();
    const btntext = document.getElementById('tm_btntext')?.value.trim() || 'احصل على العرض';
    const active  = document.getElementById('tm_active')?.value === '1';

    if (!title)   { alert('⚠️ أدخل عنوان العداد'); return; }
    if (!enddate) { alert('⚠️ حدد تاريخ الانتهاء'); return; }

    const timer = { id:Date.now(), title, section, style, enddate, link, btntext, active };
    const arr   = JSON.parse(localStorage.getItem('siteTimers') || '[]');
    arr.unshift(timer);
    localStorage.setItem('siteTimers', JSON.stringify(arr));
    closeAddTimerForm();
    loadTimersTab();
    applyTimers();
    alert('✅ تم إضافة العداد وتطبيقه على الموقع!');
}

function loadTimersTab() {
    const timers = JSON.parse(localStorage.getItem('siteTimers') || '[]');
    const tbody  = document.getElementById('timersTableBody');
    if (!tbody) return;
    if (!timers.length) {
        tbody.innerHTML='<tr><td colspan="7" style="text-align:center;padding:2rem;color:#888">لا توجد عدادات — أضف أول عداد!</td></tr>';
        return;
    }
    const styleEmojis = { fire:'🔥', gold:'⭐', neon:'💎', dark:'🌑', gradient:'🌈' };
    tbody.innerHTML = timers.map((t,i) => {
        const ends = new Date(t.enddate);
        const diff = ends - Date.now();
        const expired = diff <= 0;
        return `<tr>
            <td>${i+1}</td>
            <td><strong style="color:var(--gold)">${esc(t.title)}</strong></td>
            <td>${SECTION_LABELS[t.section]||t.section}</td>
            <td>${styleEmojis[t.style]||'🎨'} ${t.style}</td>
            <td style="color:${expired?'#f44336':'#4CAF50'}">${ends.toLocaleDateString('ar-IQ')} ${ends.toLocaleTimeString('ar-IQ',{hour:'2-digit',minute:'2-digit'})}</td>
            <td>
                <label class="toggle-switch" style="transform:scale(.85)">
                    <input type="checkbox" ${t.active?'checked':''} onchange="toggleTimer(${t.id},this.checked)">
                    <span class="toggle-slider"></span>
                </label>
            </td>
            <td>
                <button class="action-btn view"   onclick="previewTimer(${t.id})" title="معاينة"><i class="fas fa-eye"></i></button>
                <button class="action-btn delete" onclick="deleteTimer(${t.id})"  title="حذف"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    }).join('');
}

function toggleTimer(id, active) {
    const arr = JSON.parse(localStorage.getItem('siteTimers')||'[]');
    const t   = arr.find(x=>x.id===id); if (!t) return;
    t.active  = active;
    localStorage.setItem('siteTimers', JSON.stringify(arr));
    applyTimers();
}

function deleteTimer(id) {
    if (!confirm('حذف هذا العداد؟')) return;
    const arr = JSON.parse(localStorage.getItem('siteTimers')||'[]').filter(t=>t.id!==id);
    localStorage.setItem('siteTimers', JSON.stringify(arr));
    loadTimersTab(); applyTimers();
}

function previewTimer(id) {
    const t = JSON.parse(localStorage.getItem('siteTimers')||'[]').find(x=>x.id===id);
    if (!t) return;
    const diff = new Date(t.enddate) - Date.now();
    const h = Math.floor(diff/3600000), m = Math.floor((diff%3600000)/60000), s = Math.floor((diff%60000)/1000);
    alert(`👁️ معاينة:\nالعنوان: ${t.title}\nالمكان: ${SECTION_LABELS[t.section]}\nالوقت المتبقي: ${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
}

function applyTimers() {
    document.querySelectorAll('.admin-timer-inject').forEach(el=>el.remove());
    const timers = JSON.parse(localStorage.getItem('siteTimers')||'[]').filter(t=>t.active && new Date(t.enddate)>new Date());

    timers.forEach(t => {
        const style = TIMER_STYLES[t.style] || TIMER_STYLES.fire;
        const endMs = new Date(t.enddate).getTime();
        const timerId = 'atm_'+t.id;

        const buildEl = () => {
            const div = document.createElement('div');
            div.className = 'admin-timer-inject site-timer-block';
            div.setAttribute('data-timer-id', t.id);
            div.style.background   = style.bg;
            div.style.color        = style.text;
            div.style.boxShadow    = `0 8px 30px ${style.shadow}`;
            div.innerHTML = `
                <div class="stb-inner">
                    <div class="stb-title"><i class="fas fa-fire"></i> ${esc(t.title)}</div>
                    <div class="stb-countdown">
                        <div class="stb-unit"><span class="stb-num" id="${timerId}_d">00</span><small>يوم</small></div>
                        <div class="stb-sep">:</div>
                        <div class="stb-unit"><span class="stb-num" id="${timerId}_h">00</span><small>ساعة</small></div>
                        <div class="stb-sep">:</div>
                        <div class="stb-unit"><span class="stb-num" id="${timerId}_m">00</span><small>دقيقة</small></div>
                        <div class="stb-sep">:</div>
                        <div class="stb-unit"><span class="stb-num" id="${timerId}_s">00</span><small>ثانية</small></div>
                    </div>
                    ${t.link ? `<a href="${esc(t.link)}" class="stb-btn" style="color:${style.text};border-color:${style.text}40">${esc(t.btntext)}</a>` : ''}
                </div>`;

            const tick = () => {
                const diff = endMs - Date.now();
                if (diff <= 0) { div.remove(); return; }
                const d = Math.floor(diff/86400000);
                const h = Math.floor((diff%86400000)/3600000);
                const m = Math.floor((diff%3600000)/60000);
                const s = Math.floor((diff%60000)/1000);
                const set = (sfx,v) => { const el=document.getElementById(timerId+'_'+sfx); if(el) el.textContent=String(v).padStart(2,'0'); };
                set('d',d); set('h',h); set('m',m); set('s',s);
            };
            tick();
            setInterval(tick, 1000);
            return div;
        };

        if (t.section === 'topbar') {
            const el = buildEl(); el.classList.add('stb-topbar');
            document.body.insertBefore(el, document.body.firstChild);
            const nav = document.querySelector('.navbar');
            if (nav) nav.style.top = '80px';
        } else if (t.section === 'all_featured') {
            document.querySelectorAll('.pricing-card.featured').forEach(card => {
                const el = buildEl(); el.style.margin='.5rem 0';
                card.insertBefore(el, card.querySelector('.pricing-btn'));
            });
        } else {
            const section = document.getElementById(t.section);
            if (section) {
                const cont = section.querySelector('.container');
                const el   = buildEl(); el.style.margin='0 0 2rem';
                if (cont) cont.insertBefore(el, cont.firstChild);
            }
        }
    });
}

/* ═══════════════════════════════════════════════════════════
   💎 الباقات — تحكم كامل
   ═══════════════════════════════════════════════════════════ */
let currentPkgType = 'charge';

function switchPkgType(btn, type) {
    currentPkgType = type;
    document.querySelectorAll('.pkg-type-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    loadPackagesTab();
}

function showAddPackageForm(id) {
    const form = document.getElementById('addPackageForm');
    form.style.display = 'block';
    document.getElementById('pkg_editId').value = id || '';
    document.getElementById('pkg_type').value   = currentPkgType;
    if (!id) {
        document.getElementById('pkgFormTitle').innerHTML = '<i class="fas fa-plus-circle"></i> إضافة باقة جديدة';
        ['pkg_name','pkg_price','pkg_icon','pkg_discount','pkg_badge','pkg_features'].forEach(fid => {
            const el = document.getElementById(fid); if (el) el.value = '';
        });
        document.getElementById('pkg_featured').value = '';
    } else {
        const pkgs = JSON.parse(localStorage.getItem('customPackages_'+currentPkgType)||'[]');
        const pkg  = pkgs.find(p=>p.id===id);
        if (!pkg) return;
        document.getElementById('pkgFormTitle').innerHTML = '<i class="fas fa-edit"></i> تعديل الباقة';
        document.getElementById('pkg_name').value     = pkg.name;
        document.getElementById('pkg_price').value    = pkg.price;
        document.getElementById('pkg_icon').value     = pkg.icon||'💎';
        document.getElementById('pkg_discount').value = pkg.discount||'';
        document.getElementById('pkg_badge').value    = pkg.badge||'';
        document.getElementById('pkg_featured').value = pkg.featured||'';
        document.getElementById('pkg_features').value = (pkg.features||[]).join('\n');
    }
    form.scrollIntoView({behavior:'smooth', block:'nearest'});
}

function closePackageForm() { document.getElementById('addPackageForm').style.display='none'; }

function savePackage() {
    const id       = document.getElementById('pkg_editId').value;
    const type     = document.getElementById('pkg_type').value;
    const name     = document.getElementById('pkg_name')?.value.trim();
    const price    = document.getElementById('pkg_price')?.value.trim();
    const icon     = document.getElementById('pkg_icon')?.value.trim()||'💎';
    const discount = document.getElementById('pkg_discount')?.value.trim();
    const badge    = document.getElementById('pkg_badge')?.value.trim();
    const featured = document.getElementById('pkg_featured')?.value;
    const features = (document.getElementById('pkg_features')?.value||'').split('\n').map(f=>f.trim()).filter(f=>f);

    if (!name)  { alert('⚠️ أدخل اسم الباقة'); return; }
    if (!price) { alert('⚠️ أدخل السعر'); return; }

    const pkg = { id: id ? parseInt(id) : Date.now(), name, price, icon, discount, badge, featured, features };
    const arr = JSON.parse(localStorage.getItem('customPackages_'+type)||'[]');
    if (id) {
        const idx = arr.findIndex(p=>p.id===parseInt(id));
        if (idx>=0) arr[idx]=pkg; else arr.unshift(pkg);
    } else { arr.unshift(pkg); }
    localStorage.setItem('customPackages_'+type, JSON.stringify(arr));
    closePackageForm();
    loadPackagesTab();
    renderCustomPackages(type);
    alert('✅ تم حفظ الباقة وتطبيقها على الموقع!');
}

function deletePackage(id, type) {
    if (!confirm('حذف هذه الباقة؟')) return;
    const arr = JSON.parse(localStorage.getItem('customPackages_'+type)||'[]').filter(p=>p.id!==id);
    localStorage.setItem('customPackages_'+type, JSON.stringify(arr));
    loadPackagesTab(); renderCustomPackages(type);
}

function loadPackagesTab() {
    const pkgs  = JSON.parse(localStorage.getItem('customPackages_'+currentPkgType)||'[]');
    const tbody = document.getElementById('packagesTableBody');
    if (!tbody) return;
    const typeLabel = currentPkgType==='charge' ? 'شحن' : 'خدمة';
    if (!pkgs.length) {
        tbody.innerHTML=`<tr><td colspan="6" style="text-align:center;padding:2rem;color:#888">لا توجد باقات مضافة — أضف باقة ${typeLabel} جديدة!</td></tr>`;
        return;
    }
    tbody.innerHTML = pkgs.map((p,i)=>`<tr>
        <td>${i+1}</td>
        <td><span style="font-size:1.3rem">${p.icon}</span> <strong style="color:var(--gold)">${esc(p.name)}</strong>
            ${p.badge?`<br><small style="color:#4CAF50">${esc(p.badge)}</small>`:''}</td>
        <td style="color:var(--secondary);font-weight:700">${esc(p.price)} IQD</td>
        <td>${p.discount?`<span style="color:#4CAF50">${esc(p.discount)}</span>`:'—'}</td>
        <td><span class="status-badge ${p.featured?'active':'pending'}">${p.featured||'عادي'}</span></td>
        <td>
            <button class="action-btn view"   onclick="showAddPackageForm(${p.id})"         title="تعديل"><i class="fas fa-edit"></i></button>
            <button class="action-btn delete" onclick="deletePackage(${p.id},'${currentPkgType}')" title="حذف"><i class="fas fa-trash"></i></button>
        </td>
    </tr>`).join('');
}

function renderCustomPackages(type) {
    if (type==='charge') {
        const pkgs    = JSON.parse(localStorage.getItem('customPackages_charge')||'[]');
        const grid    = document.querySelector('.pricing-grid');
        if (!grid) return;
        document.querySelectorAll('.custom-pkg-card').forEach(el=>el.remove());
        pkgs.forEach(pkg => {
            const card = document.createElement('div');
            card.className = `pricing-card custom-pkg-card ${pkg.featured||''}`;
            card.innerHTML = `
                ${pkg.badge ? `<div class="pricing-badge">${esc(pkg.badge)}</div>` : ''}
                <div class="pricing-icon">${pkg.icon}</div>
                <h3 class="pricing-amount">${esc(pkg.name)}</h3>
                <div class="pricing-price">${esc(pkg.price)} IQD</div>
                ${pkg.discount ? `<div class="discount-badge">${esc(pkg.discount)}</div>` : ''}
                <ul class="pricing-features">
                    ${(pkg.features||[]).map(f=>`<li><i class="fas fa-check"></i> ${esc(f)}</li>`).join('')}
                </ul>
                <button class="pricing-btn" onclick="openPurchaseModal('${esc(pkg.name)}','${esc(pkg.price)}')">
                    اشتر الآن <i class="fas fa-shopping-cart"></i>
                </button>`;
            grid.appendChild(card);
        });
    } else {
        const pkgs    = JSON.parse(localStorage.getItem('customPackages_service')||'[]');
        const grid    = document.querySelector('.subscription-grid');
        if (!grid) return;
        document.querySelectorAll('.custom-sub-card').forEach(el=>el.remove());
        pkgs.forEach(pkg => {
            const card = document.createElement('div');
            card.className = `subscription-card custom-sub-card ${pkg.featured||''}`;
            card.innerHTML = `
                ${pkg.badge ? `<div class="sub-badge">${esc(pkg.badge)}</div>` : ''}
                <div class="sub-header">
                    <span style="font-size:2rem">${pkg.icon}</span>
                    <h4>${esc(pkg.name)}</h4>
                </div>
                <div class="sub-price">${esc(pkg.price)} IQD</div>
                <ul class="sub-features">
                    ${(pkg.features||[]).map(f=>`<li><i class="fas fa-check"></i> ${esc(f)}</li>`).join('')}
                </ul>
                <button class="sub-btn" onclick="purchaseSubscription('${esc(pkg.name)}','${esc(pkg.price)}')">اشترك الآن</button>`;
            grid.appendChild(card);
        });
    }
}

/* ═══════════════════════════════════════════════════════════
   👥 المستخدمون الشاملة — فصل الخدمات عن الدعم
   ═══════════════════════════════════════════════════════════ */
let userTypeFilter = 'all';

function filterUserType(btn, type) {
    userTypeFilter = type;
    document.querySelectorAll('.pkg-type-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    loadAllUsersTab();
}

function showAddFullUserForm() {
    const form = document.getElementById('addFullUserForm'); if (!form) return;
    form.style.display = 'block';
    document.getElementById('fu_username').value = '';
    document.getElementById('fu_password').value = '';
    document.getElementById('fu_note').value     = '';
    form.scrollIntoView({behavior:'smooth', block:'nearest'});
}

function closeFullUserForm() {
    const form = document.getElementById('addFullUserForm'); if (form) form.style.display='none';
}

// مراقبة تغيير نوع الاشتراك
document.addEventListener('change', e => {
    if (e.target.id === 'fu_subtype') {
        const wrap = document.getElementById('fu_custom_wrap');
        if (wrap) wrap.style.display = e.target.value==='مخصص' ? 'block' : 'none';
    }
});

function saveFullUser() {
    const username = document.getElementById('fu_username')?.value.trim();
    const password = document.getElementById('fu_password')?.value.trim();
    const role     = document.getElementById('fu_role')?.value;
    const subtype  = document.getElementById('fu_subtype')?.value;
    const note     = document.getElementById('fu_note')?.value.trim();

    if (!username) { alert('⚠️ أدخل اسم المستخدم'); return; }
    if (!password) { alert('⚠️ أدخل كلمة المرور'); return; }

    // حساب تاريخ الانتهاء
    const today = new Date();
    let expiry  = new Date();
    if (subtype==='يومي')       expiry.setDate(today.getDate()+1);
    else if (subtype==='أسبوعي') expiry.setDate(today.getDate()+7);
    else if (subtype==='شهري')   expiry.setMonth(today.getMonth()+1);
    else if (subtype==='سنوي')   expiry.setFullYear(today.getFullYear()+1);
    else if (subtype==='مخصص') {
        const cd = document.getElementById('fu_customdate')?.value;
        if (!cd) { alert('⚠️ حدد تاريخ الانتهاء المخصص'); return; }
        expiry = new Date(cd);
    }

    // جمع الصلاحيات
    const perms = ['video','convert','audio','compress','merge','bg','overlay','ai']
        .filter(p => document.getElementById('perm_'+p)?.checked);

    const userData = {
        password,
        registeredDate:  today.toISOString().split('T')[0],
        expiryDate:      expiry.toISOString().split('T')[0],
        usageCount:      0,
        subscriptionType: subtype,
        role,
        permissions:     perms,
        note
    };

    // حفظ في serviceUsers (للخدمات) أو supportUsers (للدعم)
    if (role==='service' || role==='both') {
        serviceUsers[username] = userData;
        saveData();
    }
    if (role==='support' || role==='both') {
        const su = JSON.parse(localStorage.getItem('supportUsers')||'{}');
        su[username] = userData;
        localStorage.setItem('supportUsers', JSON.stringify(su));
    }

    closeFullUserForm();
    loadAllUsersTab();
    pushNotif('✅ مستخدم جديد', `تم إضافة "${username}" بنجاح`, 'success');
}

function loadAllUsersTab() {
    const tbody = document.getElementById('allUsersTableBody'); if (!tbody) return;
    const today = new Date();

    // دمج المستخدمين من المصدرين
    const allUsers = {};
    Object.entries(serviceUsers).forEach(([u,d])=>allUsers[u]={...d, _src:'service'});
    const su = JSON.parse(localStorage.getItem('supportUsers')||'{}');
    Object.entries(su).forEach(([u,d])=>{
        if (allUsers[u]) allUsers[u]._src='both';
        else allUsers[u]={...d, _src:'support'};
    });

    const filtered = Object.entries(allUsers).filter(([,d]) => {
        if (userTypeFilter==='all') return true;
        if (userTypeFilter==='service') return d._src==='service'||d._src==='both';
        if (userTypeFilter==='support') return d._src==='support'||d._src==='both';
        return true;
    });

    if (!filtered.length) {
        tbody.innerHTML='<tr><td colspan="9" style="text-align:center;padding:2rem;color:#888">لا توجد مستخدمون</td></tr>';
        return;
    }

    const roleIcon   = { service:'🛠️ خدمات', support:'🌐 دعم', both:'🔑 الاثنان' };
    const roleColors = { service:'#2196F3', support:'#ff9800', both:'#7c3aed' };

    tbody.innerHTML = filtered.map(([username, u]) => {
        const exp     = new Date(u.expiryDate);
        const expired = today > exp;
        const daysLeft= Math.max(0, Math.floor((exp-today)/86400000));
        const perms   = (u.permissions||[]).length;
        const role    = u.role || u._src || 'service';
        const col     = roleColors[role]||'#888';

        return `<tr>
            <td>
                <strong style="color:#fff">${esc(username)}</strong>
                <br><small style="color:#666;font-family:monospace">${esc(u.password)}</small>
            </td>
            <td><span style="color:${col};font-size:.85rem;font-weight:700">${roleIcon[role]||role}</span></td>
            <td>${esc(u.subscriptionType||'شهري')}</td>
            <td>
                <span style="color:${expired?'#f44336':daysLeft<=3?'#ff9800':'#4CAF50'};font-weight:700">
                    ${expired?'منتهٍ ❌':daysLeft===0?'آخر يوم ⚠️':daysLeft+' يوم'}
                </span>
                <br><small style="color:#555">${u.expiryDate}</small>
            </td>
            <td>
                <span class="perms-badge" title="${(u.permissions||[]).join(', ')}">
                    ${perms>0 ? perms+' صلاحية' : 'كاملة'}
                </span>
            </td>
            <td style="text-align:center">${u.usageCount||0}</td>
            <td><span class="status-badge ${expired?'expired':'active'}">${expired?'منتهي':'نشط'}</span></td>
            <td><small style="color:#888">${esc(u.note||'—')}</small></td>
            <td>
                <button class="action-btn extend" onclick="extendUserFull('${username}')" title="تمديد"><i class="fas fa-clock"></i></button>
                <button class="action-btn view"   onclick="editUserPerms('${username}')"  title="صلاحيات"><i class="fas fa-shield-alt"></i></button>
                <button class="action-btn delete" onclick="deleteUserFull('${username}')" title="حذف"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    }).join('');
}

function extendUserFull(username) {
    const months = parseInt(prompt(`تمديد اشتراك "${username}"\nكم شهر؟`, '1'));
    if (!months || months<1) return;

    const updateUser = (store, key) => {
        const data = JSON.parse(localStorage.getItem(key)||'{}');
        if (data[username]) {
            const d = new Date(data[username].expiryDate||new Date());
            d.setMonth(d.getMonth()+months);
            data[username].expiryDate = d.toISOString().split('T')[0];
            localStorage.setItem(key, JSON.stringify(data));
        }
    };

    if (serviceUsers[username]) {
        const d = new Date(serviceUsers[username].expiryDate||new Date());
        d.setMonth(d.getMonth()+months);
        serviceUsers[username].expiryDate = d.toISOString().split('T')[0];
        saveData();
    }
    updateUser(null, 'supportUsers');
    loadAllUsersTab();
    alert(`✅ تم تمديد "${username}" لمدة ${months} شهر`);
}

function deleteUserFull(username) {
    if (!confirm(`حذف المستخدم "${username}"؟`)) return;
    delete serviceUsers[username];
    saveData();
    const su = JSON.parse(localStorage.getItem('supportUsers')||'{}');
    delete su[username]; localStorage.setItem('supportUsers', JSON.stringify(su));
    loadAllUsersTab(); updateStats();
}

function editUserPerms(username) {
    const u = serviceUsers[username] || JSON.parse(localStorage.getItem('supportUsers')||'{}')[username];
    if (!u) return;
    const permsStr = (u.permissions||[]).join(', ') || 'جميع الصلاحيات';
    const newPerms = prompt(`صلاحيات "${username}"\nالحالية: ${permsStr}\n\nأدخل الصلاحيات المسموحة مفصولة بفاصلة:\nvideo, convert, audio, compress, merge, bg, overlay, ai`, permsStr);
    if (newPerms===null) return;
    const permsArr = newPerms.split(',').map(p=>p.trim()).filter(p=>p);
    if (serviceUsers[username]) { serviceUsers[username].permissions=permsArr; saveData(); }
    const su=JSON.parse(localStorage.getItem('supportUsers')||'{}');
    if (su[username]) { su[username].permissions=permsArr; localStorage.setItem('supportUsers',JSON.stringify(su)); }
    loadAllUsersTab();
    alert('✅ تم تحديث الصلاحيات');
}

/* تحقق من صلاحية المستخدم على الخدمة */
const _origLoginToService = loginToService;
loginToService = function(e) {
    e.preventDefault();
    const username = document.getElementById('serviceUsername')?.value.trim();
    const password = document.getElementById('servicePassword')?.value;
    const errDiv   = document.getElementById('serviceLoginError');
    const showErr  = msg => { if(errDiv){errDiv.textContent=msg;errDiv.classList.add('active');} };

    if (!username||!password){showErr('❌ أدخل اسم المستخدم وكلمة المرور!');return;}

    const user = serviceUsers[username];
    if (!user || user.password!==password){showErr('❌ بيانات غير صحيحة!');return;}
    if (new Date()>new Date(user.expiryDate)){showErr('⚠️ اشتراكك منتهٍ!');return;}

    // تحقق من الصلاحية على الخدمة الحالية
    const permMap = {
        'video-trimmer':'video','converter':'convert','audio-extractor':'audio',
        'audio-trimmer':'audio','audio-converter':'audio','compressor':'compress',
        'video-merger':'merge','speed-changer':'convert','video-rotator':'convert',
        'video-filters':'convert','text-overlay':'convert','ai-editor':'ai',
        'bg-remover':'bg','video-overlay':'overlay'
    };
    const reqPerm = permMap[currentService.id];
    const perms   = user.permissions;
    if (reqPerm && perms && perms.length>0 && !perms.includes(reqPerm)){
        showErr(`❌ ليس لديك صلاحية الوصول لخدمة "${currentService.name}". تواصل مع الإدارة.`);
        return;
    }

    loggedInUser = username;
    user.usageCount++;
    logServiceUsage(username, currentService.name);
    saveData();
    closeServiceLogin();
    openService(currentService.id, currentService.name);
};

/* ═══════════════════════════════════════════════════════════
   🔗 ربط التبويبات الجديدة بـ switchAdminTab
   ═══════════════════════════════════════════════════════════ */
const _____origSwitch = window.switchAdminTab;
window.switchAdminTab = function(e, tab) {
    document.querySelectorAll('.admin-tab-content').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.admin-tab').forEach(b=>b.classList.remove('active'));
    document.getElementById(tab+'Tab')?.classList.add('active');
    const clickedBtn = e?.currentTarget || e?.target;
    if (clickedBtn?.classList.contains('admin-tab')) clickedBtn.classList.add('active');

    const map = {
        orders:loadOrdersTab, messages:loadMessagesTab, services:loadServicesTab,
        users:loadUsersTab, stats:updateStats, reviews:loadReviewsTab,
        offers:loadOffersTab, sitecontrol:loadSiteControl,
        timers:loadTimersTab, packages:loadPackagesTab, allusers:loadAllUsersTab
    };
    map[tab]?.();
};

/* تطبيق عند التحميل */
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(()=>{ applyTimers(); renderCustomPackages('charge'); renderCustomPackages('service'); }, 500);
});

/* ═══════════════════════════════════════════════════════════
   💳 نسخ رقم البطاقة
   ═══════════════════════════════════════════════════════════ */
function copyCardNumber() {
    const num = document.getElementById('cardNumberDisplay')?.textContent || '1234 5678 9012 3456';
    navigator.clipboard.writeText(num.replace(/\s/g,'')).then(() => {
        // feedback بصري
        const btns = document.querySelectorAll('.cpb-copy-btn');
        btns.forEach(btn => {
            btn.innerHTML = '<i class="fas fa-check"></i> تم النسخ';
            btn.style.background = '#4CAF50';
            btn.style.color = '#fff';
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-copy"></i> نسخ';
                btn.style.background = '';
                btn.style.color = '';
            }, 2000);
        });
    }).catch(() => {
        // fallback قديم
        const el = document.createElement('textarea');
        el.value = num.replace(/\s/g,'');
        document.body.appendChild(el);
        el.select(); document.execCommand('copy');
        document.body.removeChild(el);
        alert('✅ تم نسخ رقم البطاقة: ' + num);
    });
}






/* ═══════════════════════════════════════════════════════════
   🎵 إضافة صوت على مقطع فيديو — Audio Adder Service
   يعمل بـ Web Audio API + Canvas + MediaRecorder
   يدمج ملف صوتي مع مقطع فيديو بشكل احترافي
   ═══════════════════════════════════════════════════════════ */

/* ── ربط الخدمة بـ openService ── */
const _origOpenSvcAudioAdder = window.openService;
window.openService = function(serviceId, serviceName) {
    if (serviceId !== 'audio-adder') {
        _origOpenSvcAudioAdder(serviceId, serviceName);
        return;
    }

    document.getElementById('serviceModalTitle').textContent = serviceName;
    const content = document.getElementById('serviceModalContent');

    content.innerHTML = `
        <div class="service-interface">

            <!-- رفع الفيديو -->
            <div class="upload-area" onclick="document.getElementById('adderVideoFile').click()">
                <i class="fas fa-film"></i>
                <p>اضغط لرفع مقطع الفيديو</p>
                <small>MP4 · WebM · MOV · AVI</small>
                <input type="file" id="adderVideoFile" accept="video/*" style="display:none"
                       onchange="adderLoadVideo(this)">
            </div>
            <div id="adderVideoInfo" class="file-info-display"></div>

            <!-- رفع الصوت -->
            <div class="upload-area" style="margin-top:1rem;border-color:rgba(220,20,60,.4)"
                 onclick="document.getElementById('adderAudioFile').click()">
                <i class="fas fa-music" style="color:#dc143c"></i>
                <p>اضغط لرفع ملف الصوت المراد إضافته</p>
                <small>MP3 · WAV · AAC · OGG</small>
                <input type="file" id="adderAudioFile" accept="audio/*" style="display:none"
                       onchange="adderLoadAudio(this)">
            </div>
            <div id="adderAudioInfo" class="file-info-display"></div>

            <!-- إعدادات -->
            <div style="background:rgba(255,255,255,.04);border-radius:10px;padding:1rem;margin-top:1rem">
                <h4 style="color:#ccc;margin-bottom:.8rem;font-size:.95rem"><i class="fas fa-sliders-h"></i> إعدادات الدمج</h4>

                <div style="margin-bottom:.7rem">
                    <label style="color:#aaa;font-size:.85rem">مستوى صوت الفيديو الأصلي: <span id="adderOrigVolVal">100%</span></label>
                    <input type="range" id="adderOrigVol" min="0" max="200" value="100"
                           style="width:100%;accent-color:#00bcd4;margin-top:.3rem"
                           oninput="document.getElementById('adderOrigVolVal').textContent=this.value+'%'">
                </div>

                <div style="margin-bottom:.7rem">
                    <label style="color:#aaa;font-size:.85rem">مستوى الصوت المضاف: <span id="adderNewVolVal">100%</span></label>
                    <input type="range" id="adderNewVol" min="0" max="200" value="100"
                           style="width:100%;accent-color:#dc143c;margin-top:.3rem"
                           oninput="document.getElementById('adderNewVolVal').textContent=this.value+'%'">
                </div>

                <div style="margin-bottom:.7rem">
                    <label style="color:#aaa;font-size:.85rem">تأخير بداية الصوت المضاف (ثانية):</label>
                    <input type="number" id="adderDelay" min="0" max="3600" value="0" step="0.5"
                           style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:8px;color:#fff;padding:.4rem .7rem;width:100%;margin-top:.3rem">
                </div>

                <div style="display:flex;align-items:center;gap:.5rem">
                    <input type="checkbox" id="adderLoop" style="accent-color:#dc143c;width:16px;height:16px">
                    <label for="adderLoop" style="color:#aaa;font-size:.85rem">تكرار الصوت إذا كان أقصر من الفيديو</label>
                </div>
            </div>

            <!-- زر المعالجة -->
            <button class="action-btn-service" id="adderMainBtn" onclick="runAudioAdder()" disabled style="margin-top:1rem">
                <i class="fas fa-music"></i> إضافة الصوت على الفيديو
            </button>

            <div class="service-result" id="serviceResult"></div>
        </div>
    `;

    window.adderVideoFile = null;
    window.adderAudioFile = null;
    showModal('serviceModal');
    logServiceUsage(window.currentLoggedUser || 'unknown', 'إضافة صوت على مقطع فيديو');
};

/* ── تحميل ملف الفيديو ── */
function adderLoadVideo(input) {
    const file = input.files[0]; if (!file) return;
    window.adderVideoFile = file;
    const mb = (file.size / 1048576).toFixed(2);
    document.getElementById('adderVideoInfo').innerHTML = `
        <div class="file-info">
            <p><i class="fas fa-film" style="color:#00bcd4"></i> <strong>الفيديو:</strong> ${esc(file.name)}</p>
            <p><i class="fas fa-hdd" style="color:#00bcd4"></i> <strong>الحجم:</strong> ${mb} MB</p>
            <p><i class="fas fa-check-circle" style="color:#4CAF50"></i> جاهز ✅</p>
        </div>`;
    adderCheckReady();
}

/* ── تحميل ملف الصوت ── */
function adderLoadAudio(input) {
    const file = input.files[0]; if (!file) return;
    window.adderAudioFile = file;
    const mb = (file.size / 1048576).toFixed(2);
    document.getElementById('adderAudioInfo').innerHTML = `
        <div class="file-info">
            <p><i class="fas fa-music" style="color:#dc143c"></i> <strong>الصوت:</strong> ${esc(file.name)}</p>
            <p><i class="fas fa-hdd" style="color:#dc143c"></i> <strong>الحجم:</strong> ${mb} MB</p>
            <p><i class="fas fa-check-circle" style="color:#4CAF50"></i> جاهز ✅</p>
        </div>`;
    adderCheckReady();
}

function adderCheckReady() {
    const btn = document.getElementById('adderMainBtn');
    if (btn && window.adderVideoFile && window.adderAudioFile) btn.disabled = false;
}

/* ── المعالجة الرئيسية ── */
async function runAudioAdder() {
    if (!window.adderVideoFile) { alert('⚠️ ارفع مقطع الفيديو أولاً'); return; }
    if (!window.adderAudioFile) { alert('⚠️ ارفع ملف الصوت أولاً'); return; }

    const origVolRatio = parseInt(document.getElementById('adderOrigVol').value) / 100;
    const newVolRatio  = parseInt(document.getElementById('adderNewVol').value) / 100;
    const delay        = parseFloat(document.getElementById('adderDelay').value) || 0;
    const loopAudio    = document.getElementById('adderLoop').checked;

    const res = document.getElementById('serviceResult');
    setProcessing(res, 'جاري دمج الصوت مع الفيديو...');

    try {
        const blob = await mergeAudioWithVideo(
            window.adderVideoFile,
            window.adderAudioFile,
            origVolRatio, newVolRatio, delay, loopAudio
        );
        const url  = URL.createObjectURL(blob);
        const name = baseName(window.adderVideoFile.name) + '_with_audio.webm';
        setSuccess(res, url, name, {
            'الفيديو'  : window.adderVideoFile.name,
            'الصوت'    : window.adderAudioFile.name,
            'الحجم'    : toMB(blob) + ' MB',
            'الصيغة'   : 'WebM'
        });
    } catch(err) {
        setError(res, 'خطأ في الدمج: ' + err.message);
    }
}

/* ── دالة الدمج الحقيقية ── */
function mergeAudioWithVideo(videoFile, audioFile, origVol, newVol, delay, loop) {
    return new Promise(async (resolve, reject) => {
        try {
            // 1. فك ضغط الصوت الجديد
            const audioAB  = await audioFile.arrayBuffer();
            const ac0      = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuf = await ac0.decodeAudioData(audioAB);
            ac0.close();

            // 2. إعداد عنصر الفيديو
            const vid = document.createElement('video');
            vid.src   = URL.createObjectURL(videoFile);
            vid.muted = false;
            vid.crossOrigin = 'anonymous';

            vid.addEventListener('error', () => reject(new Error('تعذّر تحميل الفيديو')));
            vid.addEventListener('loadedmetadata', () => {
                const w = vid.videoWidth  || 1280;
                const h = vid.videoHeight || 720;

                // 3. Canvas لالتقاط الصورة
                const canvas = document.createElement('canvas');
                canvas.width = w; canvas.height = h;
                const ctx = canvas.getContext('2d');
                const videoStream = canvas.captureStream(30);

                // 4. AudioContext للمزج
                const audioCtx = new AudioContext();

                // مصدر صوت الفيديو
                const vidSrc    = audioCtx.createMediaElementSource(vid);
                const origGain  = audioCtx.createGain();
                origGain.gain.value = origVol;
                vidSrc.connect(origGain);

                // مصدر الصوت الجديد
                const bufSrc   = audioCtx.createBufferSource();
                bufSrc.buffer  = audioBuf;
                bufSrc.loop    = loop;
                const newGain  = audioCtx.createGain();
                newGain.gain.value = newVol;
                bufSrc.connect(newGain);

                // وجهة الدمج (MediaStream)
                const mixDst = audioCtx.createMediaStreamDestination();
                origGain.connect(mixDst);
                newGain.connect(mixDst);

                // إضافة مسار الصوت الممزوج للـ stream
                mixDst.stream.getAudioTracks().forEach(t => videoStream.addTrack(t));

                // 5. MediaRecorder
                const mime   = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
                             ? 'video/webm;codecs=vp9,opus' : 'video/webm';
                const chunks = [];
                const rec    = new MediaRecorder(videoStream, { mimeType: mime });

                rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
                rec.onstop = () => {
                    URL.revokeObjectURL(vid.src);
                    audioCtx.close();
                    resolve(new Blob(chunks, { type: 'video/webm' }));
                };

                rec.start(200);

                // بدء الصوت الجديد مع التأخير
                bufSrc.start(audioCtx.currentTime + delay);

                // رسم الفريمات
                const draw = () => {
                    if (vid.paused || vid.ended) { rec.stop(); return; }
                    ctx.drawImage(vid, 0, 0, w, h);
                    requestAnimationFrame(draw);
                };

                vid.play().then(() => draw()).catch(err => reject(err));
            });

        } catch(err) { reject(err); }
    });
}

/* ═══════════════════════════════════════════════════════════
   🎭 جعل الفيديو شفاف — Transparent Video Service
   يستخدم Chroma Key + Canvas + MediaRecorder
   الناتج WebM مع Alpha Channel — مثالي للستريمرز
   ═══════════════════════════════════════════════════════════ */

const _origOpenSvcTransp = window.openService;
window.openService = function(serviceId, serviceName) {
    if (serviceId !== 'transparent-video') {
        _origOpenSvcTransp(serviceId, serviceName);
        return;
    }

    document.getElementById('serviceModalTitle').textContent = serviceName;
    const content = document.getElementById('serviceModalContent');

    content.innerHTML = `
        <div class="service-interface">

            <!-- شرح الخدمة -->
            <div style="background:linear-gradient(135deg,rgba(168,85,247,.15),rgba(220,20,60,.08));border:1px solid rgba(168,85,247,.4);border-radius:12px;padding:1rem;margin-bottom:1rem;display:flex;gap:.8rem;align-items:flex-start">
                <i class="fas fa-eye-slash" style="color:#a855f7;font-size:1.8rem;flex-shrink:0;margin-top:.2rem"></i>
                <div>
                    <strong style="color:#a855f7;font-size:.95rem">كيف تستخدمها؟</strong>
                    <p style="color:#aaa;font-size:.82rem;margin-top:.3rem">
                        ارفع فيديو اليرت (أو أي فيديو) ← حدد لون الخلفية المراد إزالتها ← حمّل ملف WebM الشفاف ← ضعه في OBS كـ Media Source أو Browser Source
                    </p>
                </div>
            </div>

            <!-- رفع الفيديو -->
            <div class="upload-area" onclick="document.getElementById('transpVideoFile').click()">
                <i class="fas fa-film" style="color:#a855f7"></i>
                <p>ارفع الفيديو هنا</p>
                <small>MP4 · WebM · MOV · AVI</small>
                <input type="file" id="transpVideoFile" accept="video/*" style="display:none"
                       onchange="handleMediaUpload(this)">
            </div>
            <div id="fileInfo" class="file-info-display"></div>

            <!-- معاينة مباشرة -->
            <div id="transpPreviewWrap" style="display:none;margin-top:.8rem">
                <canvas id="transpPreviewCanvas" style="width:100%;border-radius:8px;background:repeating-conic-gradient(#2a2a2a 0% 25%,#1a1a1a 0% 50%) 0/20px 20px;max-height:220px;object-fit:contain"></canvas>
                <p style="color:#777;font-size:.78rem;text-align:center;margin-top:.3rem">معاينة مباشرة — النمط الرمادي يعني الشفافية</p>
            </div>

            <!-- إعدادات Chroma Key -->
            <div style="background:rgba(255,255,255,.04);border-radius:10px;padding:1rem;margin-top:1rem">
                <h4 style="color:#ccc;margin-bottom:.8rem;font-size:.9rem"><i class="fas fa-palette"></i> إعدادات إزالة الخلفية</h4>

                <div style="margin-bottom:.8rem">
                    <label style="color:#aaa;font-size:.85rem;display:block;margin-bottom:.4rem">لون الخلفية المراد إزالتها:</label>
                    <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
                        <input type="color" id="transpChromaColor" value="#000000"
                               style="width:48px;height:38px;border-radius:8px;border:none;cursor:pointer;background:none"
                               oninput="transpUpdatePreview()">
                        <button class="chroma-preset black"  onclick="transpSetColor('#000000')" title="أسود">أسود ⬛</button>
                        <button class="chroma-preset green"  onclick="transpSetColor('#00ff00')" title="أخضر">أخضر 🟩</button>
                        <button class="chroma-preset blue"   onclick="transpSetColor('#0000ff')" title="أزرق">أزرق 🟦</button>
                        <button class="chroma-preset white"  onclick="transpSetColor('#ffffff')" title="أبيض">أبيض ⬜</button>
                        <button class="chroma-preset pick"   onclick="transpPickColor()"        title="استخرج من الفيديو">🔍 استخرج</button>
                    </div>
                </div>

                <div style="margin-bottom:.8rem">
                    <label style="color:#aaa;font-size:.85rem">حساسية الإزالة: <span id="transpThreshVal">40</span></label>
                    <input type="range" id="transpThresh" min="5" max="150" value="40"
                           style="width:100%;accent-color:#a855f7;margin-top:.3rem"
                           oninput="document.getElementById('transpThreshVal').textContent=this.value;transpUpdatePreview()">
                    <div style="display:flex;justify-content:space-between;color:#555;font-size:.75rem">
                        <span>دقيق (يحافظ على التفاصيل)</span>
                        <span>(يزيل أكثر) قوي</span>
                    </div>
                </div>

                <div>
                    <label style="color:#aaa;font-size:.85rem">نعومة الحواف: <span id="transpSmoothVal">3</span></label>
                    <input type="range" id="transpSmooth" min="0" max="20" value="3"
                           style="width:100%;accent-color:#a855f7;margin-top:.3rem"
                           oninput="document.getElementById('transpSmoothVal').textContent=this.value;transpUpdatePreview()">
                </div>
            </div>

            <!-- نصائح للستريمر -->
            <div style="background:rgba(168,85,247,.08);border:1px solid rgba(168,85,247,.2);border-radius:10px;padding:.8rem;margin-top:.8rem">
                <p style="color:#a855f7;font-size:.82rem;font-weight:bold;margin-bottom:.4rem"><i class="fas fa-lightbulb"></i> نصيحة للستريمر:</p>
                <ul style="color:#888;font-size:.8rem;margin:0;padding-right:1rem;line-height:1.7">
                    <li>بعد التحميل، افتح OBS ← أضف <strong style="color:#ccc">Media Source</strong></li>
                    <li>اختر الملف WebM الناتج وفعّل خيار <strong style="color:#ccc">Loop</strong> إذا أردت</li>
                    <li>ضع الطبقة فوق طبقة اللعبة — الخلفية ستكون شفافة تلقائياً</li>
                    <li>للأفضل: استخدم فيديو بخلفية سوداء أو خضراء</li>
                </ul>
            </div>

            <button class="action-btn-service" id="mainBtn" onclick="doTransparentVideo()" disabled style="margin-top:1rem;background:linear-gradient(135deg,#a855f7,#dc143c)">
                <i class="fas fa-eye-slash"></i> جعل الفيديو شفاف
            </button>

            <div class="service-result" id="serviceResult"></div>
        </div>
    `;

    window._transpFile = null;
    showModal('serviceModal');
    logServiceUsage(window.currentLoggedUser || 'unknown', 'جعل الفيديو شفاف');
};

/* ── تحديث المعاينة ── */
function transpUpdatePreview() {
    const file = uploadedFile;
    if (!file) return;
    const canvas = document.getElementById('transpPreviewCanvas');
    if (!canvas) return;
    const vid = document.getElementById('_transpPrevVid');
    if (!vid || vid.readyState < 2) return;

    canvas.width  = vid.videoWidth;
    canvas.height = vid.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(vid, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data    = imgData.data;
    const col     = hexToRgb(document.getElementById('transpChromaColor')?.value || '#000000');
    const thresh  = parseInt(document.getElementById('transpThresh')?.value || 40);
    const smooth  = parseInt(document.getElementById('transpSmooth')?.value || 3);

    for (let i = 0; i < data.length; i += 4) {
        const dist = colorDistance(data[i],data[i+1],data[i+2], col.r,col.g,col.b);
        if (dist < thresh) {
            const edge = thresh * (smooth / 20);
            const factor = dist < (thresh - edge) ? 0 : (dist - (thresh - edge)) / edge;
            data[i+3] = Math.floor(255 * Math.min(1, factor));
        }
    }
    ctx.putImageData(imgData, 0, 0);
}

function transpSetColor(hex) {
    const el = document.getElementById('transpChromaColor');
    if (el) { el.value = hex; transpUpdatePreview(); }
}

function transpPickColor() {
    const vid = document.getElementById('_transpPrevVid');
    const canvas = document.getElementById('transpPreviewCanvas');
    if (!vid || !canvas) { alert('ارفع الفيديو أولاً'); return; }
    canvas.style.cursor = 'crosshair';
    canvas.title = 'انقر على اللون الذي تريد إزالته';
    canvas.onclick = function(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width  / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = Math.floor((e.clientX - rect.left) * scaleX);
        const y = Math.floor((e.clientY - rect.top)  * scaleY);

        // أعد رسم الفريم الحالي بدون تعديل
        const tmpCtx = canvas.getContext('2d');
        tmpCtx.drawImage(vid, 0, 0, canvas.width, canvas.height);
        const px = tmpCtx.getImageData(x, y, 1, 1).data;
        const hex = '#' + [px[0],px[1],px[2]].map(v=>v.toString(16).padStart(2,'0')).join('');
        transpSetColor(hex);
        canvas.style.cursor = '';
        canvas.title = '';
        canvas.onclick = null;
    };
}

/* ── ربط handleMediaUpload مع المعاينة ── */
const _origHandleMedia = window.handleMediaUpload;
// نضيف منطق المعاينة للخدمة الجديدة فقط
(function() {
    const origFn = window.handleMediaUpload;
    if (origFn && origFn._transpPatched) return;
    window.handleMediaUpload = function(input) {
        origFn.call(this, input);
        // هل الخدمة المفتوحة هي transparent-video؟
        const title = document.getElementById('serviceModalTitle')?.textContent || '';
        if (title !== 'جعل الفيديو شفاف') return;
        const file = input.files[0]; if (!file) return;
        const wrap = document.getElementById('transpPreviewWrap');
        if (!wrap) return;
        wrap.style.display = 'block';
        let vid = document.getElementById('_transpPrevVid');
        if (!vid) {
            vid = document.createElement('video');
            vid.id = '_transpPrevVid';
            vid.style.display = 'none';
            document.body.appendChild(vid);
        }
        vid.src = URL.createObjectURL(file);
        vid.addEventListener('loadeddata', () => { transpUpdatePreview(); }, { once: true });
        vid.load();
    };
    window.handleMediaUpload._transpPatched = true;
})();

/* ── المعالجة الرئيسية ── */
async function doTransparentVideo() {
    if (!uploadedFile) { alert('⚠️ ارفع فيديو أولاً'); return; }
    const res    = document.getElementById('serviceResult');
    const col    = hexToRgb(document.getElementById('transpChromaColor')?.value || '#000000');
    const thresh = parseInt(document.getElementById('transpThresh')?.value || 40);
    const smooth = parseInt(document.getElementById('transpSmooth')?.value || 3);

    setProcessing(res, 'جاري معالجة الفيديو وإزالة الخلفية...');

    try {
        const blob = await processTransparentVideo(uploadedFile, col, thresh, smooth);
        const url  = URL.createObjectURL(blob);
        const name = baseName(uploadedFile.name) + '_transparent.webm';
        const sizeMB = toMB(blob);

        // نتيجة مخصصة مع شرح OBS
        clearInterval(window._fakeBar);
        res.innerHTML = `
            <div class="download-ready" style="animation:fadeIn .5s ease">
                <i class="fas fa-check-circle"></i>
                <h3>✅ تمت المعالجة بنجاح!</h3>
                <div class="file-info" style="text-align:right;margin:1rem 0">
                    <p><strong>اسم الملف:</strong> ${esc(name)}</p>
                    <p><strong>الحجم:</strong> ${sizeMB} MB</p>
                    <p><strong>الصيغة:</strong> WebM (Alpha شفاف)</p>
                </div>

                <!-- معاينة الشفافية -->
                <div style="background:repeating-conic-gradient(#333 0% 25%,#1a1a1a 0% 50%) 0/20px 20px;border-radius:10px;overflow:hidden;margin-bottom:1rem">
                    <video src="${url}" autoplay loop muted style="width:100%;display:block;max-height:200px;object-fit:contain"></video>
                </div>

                <button class="download-btn" onclick="triggerDL('${url}','${esc(name)}')">
                    <i class="fas fa-download"></i> تحميل WebM الشفاف
                </button>

                <!-- خطوات OBS -->
                <div style="background:rgba(168,85,247,.1);border:1px solid rgba(168,85,247,.3);border-radius:10px;padding:.8rem;margin-top:1rem;text-align:right">
                    <p style="color:#a855f7;font-weight:bold;margin-bottom:.5rem"><i class="fas fa-tv"></i> كيف تضيفه في OBS:</p>
                    <ol style="color:#aaa;font-size:.82rem;line-height:1.9;margin:0;padding-right:1.2rem">
                        <li>في OBS افتح <strong style="color:#ccc">Sources</strong> ← اضغط <strong style="color:#ccc">+</strong></li>
                        <li>اختر <strong style="color:#ccc">Media Source</strong></li>
                        <li>فعّل <strong style="color:#ccc">Local File</strong> واختر الملف WebM</li>
                        <li>اختياري: فعّل <strong style="color:#ccc">Loop</strong> إذا تريده يكرر</li>
                        <li>ضع الطبقة <strong style="color:#ccc">فوق</strong> طبقة اللعبة — الخلفية شفافة تلقائياً ✅</li>
                    </ol>
                </div>
            </div>`;

    } catch(err) { setError(res, 'خطأ في المعالجة: ' + err.message); }
}

/* ── معالجة الشفافية فريم فريم ── */
function processTransparentVideo(file, chromaCol, thresh, smooth) {
    return new Promise((resolve, reject) => {
        const vid = document.createElement('video');
        vid.src   = URL.createObjectURL(file);
        vid.muted = false;
        vid.addEventListener('error', () => reject(new Error('تعذّر تحميل الفيديو')));
        vid.addEventListener('loadedmetadata', () => {
            const W = vid.videoWidth  || 1280;
            const H = vid.videoHeight || 720;

            // Canvas مع alpha
            const canvas = document.createElement('canvas');
            canvas.width = W; canvas.height = H;
            const ctx = canvas.getContext('2d', { alpha: true });
            const stream = canvas.captureStream(30);

            // الصوت
            try {
                const ac  = new AudioContext();
                const src = ac.createMediaElementSource(vid);
                const dst = ac.createMediaStreamDestination();
                src.connect(dst);
                dst.stream.getAudioTracks().forEach(t => stream.addTrack(t));
            } catch(e) {}

            const mime   = 'video/webm;codecs=vp8';
            const chunks = [];
            const rec    = new MediaRecorder(stream, { mimeType: mime });
            rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
            rec.onstop = () => {
                URL.revokeObjectURL(vid.src);
                resolve(new Blob(chunks, { type: 'video/webm' }));
            };
            rec.start(100);

            const softEdge = thresh * (smooth / 20);

            const draw = () => {
                if (vid.paused || vid.ended) { rec.stop(); return; }
                ctx.clearRect(0, 0, W, H);
                ctx.drawImage(vid, 0, 0, W, H);

                const imgData = ctx.getImageData(0, 0, W, H);
                const data    = imgData.data;

                for (let i = 0; i < data.length; i += 4) {
                    const dist = colorDistance(
                        data[i], data[i+1], data[i+2],
                        chromaCol.r, chromaCol.g, chromaCol.b
                    );
                    if (dist < thresh) {
                        if (softEdge > 0 && dist > thresh - softEdge) {
                            // منطقة ناعمة على الحواف
                            const factor = (dist - (thresh - softEdge)) / softEdge;
                            data[i+3] = Math.floor(255 * factor);
                        } else {
                            data[i+3] = 0; // شفاف كامل
                        }
                    }
                }
                ctx.putImageData(imgData, 0, 0);
                requestAnimationFrame(draw);
            };

            vid.play(); draw();
        });
    });
}

/* ═══════════════════════════════════════════════════════════
   🎮 قسم اليرتات — كامل مع لوحة التحكم
   ═══════════════════════════════════════════════════════════ */

/* ── بيانات اليرتات ── */
function getAlerts()        { return JSON.parse(localStorage.getItem('siteAlerts') || '[]'); }
function saveAlerts(arr)    { localStorage.setItem('siteAlerts', JSON.stringify(arr)); }
function getAlertCode()     { return localStorage.getItem('alertGlobalCode') || ''; }

/* ══════ عرض اليرتات على الموقع ══════ */
function renderAlerts(filter='all') {
    const grid  = document.getElementById('alertsGrid');
    const empty = document.getElementById('alertsEmpty');
    if (!grid) return;

    let alerts = getAlerts();
    if (filter==='available') alerts = alerts.filter(a=>a.status==='available');
    if (filter==='sold')      alerts = alerts.filter(a=>a.status==='sold');

    if (!alerts.length) {
        if (empty) empty.style.display='flex';
        grid.innerHTML = '';
        grid.appendChild(empty || document.createElement('div'));
        return;
    }
    if (empty) empty.style.display='none';

    grid.innerHTML = alerts.map(a => `
        <div class="alert-card ${a.status==='sold'?'sold':''}" data-id="${a.id}" data-filter="${a.status}">
            <!-- شارات -->
            <div class="alert-badges">
                ${a.badge ? `<span class="alert-badge-tag">${esc(a.badge)}</span>` : ''}
                ${a.discount ? `<span class="alert-discount-tag">${esc(a.discount)}</span>` : ''}
                ${a.status==='sold' ? '<span class="alert-sold-tag"><i class="fas fa-ban"></i> مباع</span>' : ''}
            </div>

            <!-- فيديو مع حقوق -->
            <div class="alert-video-wrap" onclick="openAlertPreview('${a.id}')">
                ${a.videoData
                    ? `<video class="alert-video" muted loop playsinline preload="metadata"
                             src="${a.videoData}"
                             onmouseenter="this.play()"
                             onmouseleave="this.pause()"></video>`
                    : `<div class="alert-no-video"><i class="fas fa-gamepad"></i></div>`
                }
                <!-- علامة مائية -->
                <div class="alert-watermark">
                    <span>Eyad_Eyad12</span>
                    <span>Eyad_Eyad12</span>
                    <span>Eyad_Eyad12</span>
                </div>
                <!-- overlay تشغيل -->
                <div class="alert-play-overlay">
                    <div class="alert-play-btn"><i class="fas fa-play"></i></div>
                </div>
                <!-- غطاء المباع -->
                ${a.status==='sold' ? `<div class="alert-sold-overlay">
                    <div class="alert-sold-stamp"><i class="fas fa-ban"></i> مباع</div>
                </div>` : ''}
            </div>

            <!-- معلومات -->
            <div class="alert-info">
                <div class="alert-name">${esc(a.name)}</div>
                <div class="alert-pricing">
                    <span class="alert-price">${esc(a.price)} IQD</span>
                    ${a.oldprice ? `<span class="alert-old-price">${esc(a.oldprice)} IQD</span>` : ''}
                </div>
            </div>

            <!-- أزرار -->
            <div class="alert-actions">
                <button class="alert-contact-btn"
                        onclick="openAlertContact('${a.id}')"
                        ${a.status==='sold'?'disabled':''}>
                    <i class="fas fa-comment-alt"></i>
                    ${a.status==='sold'?'مباع':'تواصل معنا'}
                </button>
            </div>
        </div>`).join('');
}

function filterAlerts(f, btn) {
    document.querySelectorAll('.alert-filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    renderAlerts(f);
}

/* ══════ Modal معاينة اليرت ══════ */
function openAlertPreview(id) {
    const alert = getAlerts().find(a=>a.id===id);
    if (!alert) return;

    const content = document.getElementById('alertPreviewContent');
    const modal   = document.getElementById('alertPreviewModal');
    if (!content || !modal) return;

    window._previewAlertId = id;

    content.innerHTML = `
        <div class="alert-preview-inner">
            <h3 class="alert-preview-title">${esc(alert.name)}</h3>
            <div class="alert-preview-video-wrap">
                ${alert.videoData
                    ? `<video id="previewVid" class="alert-preview-vid" controls autoplay loop playsinline
                             src="${alert.videoData}"></video>`
                    : `<div class="alert-no-video" style="height:300px"><i class="fas fa-gamepad" style="font-size:4rem"></i></div>`
                }
                <!-- علامة مائية دائمة -->
                <div class="alert-watermark preview-wm">
                    <span>Eyad_Eyad12</span><span>Eyad_Eyad12</span>
                    <span>Eyad_Eyad12</span><span>Eyad_Eyad12</span>
                </div>
            </div>
            <div class="alert-preview-info">
                <div class="alert-pricing" style="margin:.5rem 0">
                    <span class="alert-price" style="font-size:1.3rem">${esc(alert.price)} IQD</span>
                    ${alert.oldprice?`<span class="alert-old-price">${esc(alert.oldprice)} IQD</span>`:''}
                    ${alert.discount?`<span class="alert-discount-tag">${esc(alert.discount)}</span>`:''}
                </div>
                <div class="alert-preview-btns">
                    ${alert.status==='sold'
                        ? `<button class="alert-preview-sold-btn" disabled><i class="fas fa-ban"></i> هذا اليرت مباع</button>`
                        : `<button class="alert-contact-btn" onclick="closeAlertPreview();openAlertContact('${id}')">
                               <i class="fas fa-comment-alt"></i> تواصل معنا للشراء
                           </button>`
                    }
                    <button class="alert-code-btn" onclick="closeAlertPreview();openAlertCodeModal('${id}')">
                        <i class="fas fa-key"></i> لدي رمز — شاهد بدون حقوق
                    </button>
                </div>
            </div>
        </div>`;

    showModal('alertPreviewModal');
}

function closeAlertPreview() {
    const vid = document.getElementById('previewVid');
    if (vid) vid.pause();
    hideModal('alertPreviewModal');
}

/* ══════ Modal رمز الوصول ══════ */
function openAlertCodeModal(id) {
    window._codeAlertId = id;
    const inp = document.getElementById('alertCodeInput');
    const err = document.getElementById('alertCodeError');
    if (inp) inp.value='';
    if (err) { err.textContent=''; err.classList.remove('active'); }
    showModal('alertCodeModal');
}

function submitAlertCode() {
    const id    = window._codeAlertId;
    const code  = document.getElementById('alertCodeInput')?.value.trim().toUpperCase();
    const err   = document.getElementById('alertCodeError');
    const alert = getAlerts().find(a=>a.id===id);
    if (!alert) return;

    const globalCode = getAlertCode().toUpperCase();
    const alertCode  = (alert.code||'').toUpperCase();

    const valid = (code && (code===globalCode || code===alertCode));

    if (!valid) {
        if (err) { err.textContent='❌ الرمز غير صحيح — تواصل معنا للحصول على الرمز'; err.classList.add('active'); }
        return;
    }

    hideModal('alertCodeModal');
    openAlertNoWatermark(id);
}

function openAlertNoWatermark(id) {
    const alert = getAlerts().find(a=>a.id===id);
    if (!alert || !alert.videoData) { showNotif('❌ لا يوجد فيديو لهذا اليرت'); return; }

    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="UTF-8">
<title>${alert.name} — Eyad_Eyad12</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; background:#000; }
body { display:flex; align-items:center; justify-content:center; min-height:100vh; }
video { max-width:100%; max-height:100vh; }
h2 { color:#ffd700; text-align:center; padding:1rem; font-family:Arial; }
</style>
</head>
<body>
<div>
<h2>${esc(alert.name)} — Eyad_Eyad12</h2>
<video src="${alert.videoData}" controls autoplay loop></video>
</div>
</body>
</html>`);
    win.document.close();
    pushNotif('✅ تم فتح اليرت', 'بدون علامة مائية — نافذة جديدة', 'success');
}

/* ══════ تواصل معنا لشراء اليرت ══════ */
function openAlertContact(id) {
    const alert = getAlerts().find(a=>a.id===id);
    if (!alert) return;
    if (alert.status==='sold') { showNotif('هذا اليرت مباع'); return; }

    // انتقل لقسم التواصل مع رسالة مسبقة
    scrollToSection('contact');
    setTimeout(() => {
        const msgInput = document.getElementById('message') || document.querySelector('textarea[name="message"]');
        if (msgInput) msgInput.value = `أرغب في شراء يرت: ${alert.name} — السعر: ${alert.price} IQD`;
    }, 500);
}

/* ══════ لوحة التحكم — إدارة اليرتات ══════ */
function showAddAlertForm(editId) {
    const form = document.getElementById('addAlertForm');
    if (form) form.style.display='block';
    const titleEl = document.getElementById('alertFormTitle');

    if (editId) {
        const a = getAlerts().find(x=>x.id===editId);
        if (!a) return;
        if (titleEl) titleEl.textContent='تعديل اليرت';
        setVal('alert_editId', editId);
        setVal('al_name',     a.name);
        setVal('al_price',    a.price);
        setVal('al_oldprice', a.oldprice||'');
        setVal('al_discount', a.discount||'');
        setVal('al_badge',    a.badge||'');
        setVal('al_code',     a.code||'');
        const statusEl = document.getElementById('al_status');
        if (statusEl) statusEl.value = a.status||'available';
        const vs = document.getElementById('al_videoStatus');
        if (vs) vs.textContent = a.videoData ? '✅ فيديو محفوظ مسبقاً' : 'لا يوجد فيديو';
    } else {
        if (titleEl) titleEl.textContent='إضافة يرت جديد';
        setVal('alert_editId','');
        ['al_name','al_price','al_oldprice','al_discount','al_badge','al_code'].forEach(id => setVal(id,''));
        const statusEl = document.getElementById('al_status');
        if (statusEl) statusEl.value='available';
        const vs = document.getElementById('al_videoStatus');
        if (vs) vs.textContent='';
        window._alertVideoData = null;
    }
    form?.scrollIntoView({behavior:'smooth', block:'nearest'});
}

function closeAlertForm() {
    const form = document.getElementById('addAlertForm');
    if (form) form.style.display='none';
    window._alertVideoData = null;
}

function handleAlertVideoUpload(input) {
    const file = input.files[0]; if (!file) return;
    const vs   = document.getElementById('al_videoStatus');
    if (vs) vs.textContent='⏳ جاري رفع الفيديو...';
    const reader = new FileReader();
    reader.onload = e => {
        window._alertVideoData = e.target.result;
        if (vs) vs.textContent=`✅ تم رفع الفيديو — ${(file.size/1048576).toFixed(1)} MB`;
    };
    reader.onerror = () => { if(vs) vs.textContent='❌ خطأ في رفع الفيديو'; };
    reader.readAsDataURL(file);
}

function saveAlert() {
    const editId   = document.getElementById('alert_editId')?.value;
    const name     = document.getElementById('al_name')?.value.trim();
    const price    = document.getElementById('al_price')?.value.trim();
    const oldprice = document.getElementById('al_oldprice')?.value.trim();
    const discount = document.getElementById('al_discount')?.value.trim();
    const badge    = document.getElementById('al_badge')?.value.trim();
    const code     = document.getElementById('al_code')?.value.trim();
    const status   = document.getElementById('al_status')?.value||'available';

    if (!name)  { alert('⚠️ أدخل اسم اليرت');  return; }
    if (!price) { alert('⚠️ أدخل سعر اليرت'); return; }

    let arr = getAlerts();
    if (editId) {
        const idx = arr.findIndex(a=>a.id===editId);
        if (idx>=0) {
            arr[idx] = { ...arr[idx], name, price, oldprice, discount, badge, code, status };
            if (window._alertVideoData) arr[idx].videoData = window._alertVideoData;
        }
    } else {
        const newAlert = {
            id: 'al_'+Date.now(),
            name, price, oldprice, discount, badge, code, status,
            videoData: window._alertVideoData || null,
            createdAt: new Date().toLocaleDateString('ar-IQ')
        };
        arr.unshift(newAlert);
    }
    saveAlerts(arr);
    closeAlertForm();
    loadAlertsAdminTab();
    renderAlerts();
    pushNotif('✅ تم حفظ اليرت', `"${name}" ${editId?'تم تحديثه':'تمت إضافته'}`, 'success');
    window._alertVideoData = null;
}

function loadAlertsAdminTab() {
    const tbody = document.getElementById('alertsAdminBody');
    if (!tbody) return;
    const arr   = getAlerts();
    const code  = getAlertCode();

    // تحميل الرمز في الحقل
    const codeInp = document.getElementById('alertGlobalCode');
    if (codeInp && code) codeInp.value = code;

    if (!arr.length) {
        tbody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:2rem;color:#888">لا توجد يرتات — أضف أول يرت!</td></tr>';
        return;
    }
    tbody.innerHTML = arr.map((a,i)=>`<tr>
        <td>${i+1}</td>
        <td><strong style="color:var(--gold)">${esc(a.name)}</strong>
            ${a.badge?`<br><small style="color:#ffd700">${esc(a.badge)}</small>`:''}</td>
        <td>
            <span style="color:var(--secondary);font-weight:700">${esc(a.price)} IQD</span>
            ${a.oldprice?`<br><small style="color:#888;text-decoration:line-through">${esc(a.oldprice)}</small>`:''}
            ${a.discount?`<br><span style="color:#f44336;font-size:.78rem">${esc(a.discount)}</span>`:''}
        </td>
        <td>
            <select class="status-select" onchange="changeAlertStatus('${a.id}',this.value)">
                <option value="available" ${a.status==='available'?'selected':''}>🟢 متاح</option>
                <option value="sold"      ${a.status==='sold'     ?'selected':''}>🔴 مباع</option>
            </select>
        </td>
        <td style="text-align:center">
            ${a.videoData
                ? `<video src="${a.videoData}" style="width:60px;height:40px;object-fit:cover;border-radius:6px;border:2px solid var(--primary)" muted></video>`
                : '<span style="color:#555;font-size:.8rem">لا فيديو</span>'}
        </td>
        <td>
            <button class="action-btn view"   onclick="showAddAlertForm('${a.id}')" title="تعديل"><i class="fas fa-edit"></i></button>
            <button class="action-btn delete" onclick="deleteAlert('${a.id}')" title="حذف"><i class="fas fa-trash"></i></button>
        </td>
    </tr>`).join('');
}

function changeAlertStatus(id, status) {
    const arr = getAlerts();
    const a   = arr.find(x=>x.id===id);
    if (a) { a.status=status; saveAlerts(arr); renderAlerts(); loadAlertsAdminTab(); }
}

function deleteAlert(id) {
    if (!confirm('حذف هذا اليرت نهائياً؟')) return;
    saveAlerts(getAlerts().filter(a=>a.id!==id));
    loadAlertsAdminTab(); renderAlerts();
}

function saveAlertGlobalCode() {
    const code = document.getElementById('alertGlobalCode')?.value.trim().toUpperCase();
    if (!code) { alert('⚠️ أدخل رمز الوصول'); return; }
    localStorage.setItem('alertGlobalCode', code);
    pushNotif('✅ تم حفظ رمز الوصول', `الرمز: ${code}`, 'success');
}

/* ربط التبويب */
const ___origSwitch5 = window.switchAdminTab;
window.switchAdminTab = function(e, tab) {
    ___origSwitch5(e, tab);
    if (tab==='alerts_admin') loadAlertsAdminTab();
};

/* تهيئة عند التحميل */
document.addEventListener('DOMContentLoaded', ()=>{
    setTimeout(renderAlerts, 600);
});
