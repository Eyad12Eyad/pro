/* ============================================================
   script.js — Eyad_Eyad12 — نسخة تعمل 100%
   الخدمات: Web Audio API + MediaRecorder (بدون سيرفر)
   تأثير النار: Canvas
   ============================================================ */


/* ════════════════ بيانات المستخدمين ════════════════ */
const serviceUsers = {
    'user1' :{ password:'pass123',    registeredDate:'2024-01-15', expiryDate:'2027-12-31', usageCount:0, subscriptionType:'شهري' },
    'user2' :{ password:'pass456',    registeredDate:'2024-01-20', expiryDate:'2027-12-31', usageCount:0, subscriptionType:'شهري' },
    'user3' :{ password:'pass789',    registeredDate:'2024-12-01', expiryDate:'2027-12-31', usageCount:0, subscriptionType:'شهري' },
    'user4' :{ password:'test123',    registeredDate:'2024-12-15', expiryDate:'2027-12-31', usageCount:0, subscriptionType:'شهري' },
    'user5' :{ password:'demo456',    registeredDate:'2024-11-01', expiryDate:'2027-12-31', usageCount:0, subscriptionType:'أسبوعي'},
    'user6' :{ password:'access789',  registeredDate:'2024-12-20', expiryDate:'2027-12-31', usageCount:0, subscriptionType:'شهري' },
    'user7' :{ password:'secure123',  registeredDate:'2024-12-10', expiryDate:'2027-12-31', usageCount:0, subscriptionType:'أسبوعي'},
    'user8' :{ password:'login456',   registeredDate:'2024-12-25', expiryDate:'2027-12-31', usageCount:0, subscriptionType:'شهري' },
    'user9' :{ password:'service789', registeredDate:'2024-10-01', expiryDate:'2027-12-31', usageCount:0, subscriptionType:'يومي'  },
    'user10':{ password:'premium123', registeredDate:'2024-12-28', expiryDate:'2027-12-31', usageCount:0, subscriptionType:'شهري' }
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
