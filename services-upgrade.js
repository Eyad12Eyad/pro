/* ================================================================
   services-upgrade.js — Eyad_Eyad12
   ترقية الكروت + السلوموشن
   أضف قبل </body>: <script src="services-upgrade.js" defer></script>
================================================================ */

/* ════════════════════════════════════════════
   ١. تلوين كروت الخدمات بألوان فريدة
════════════════════════════════════════════ */
const SV_COLORS = {
    'video-trimmer'    :{ c:'#ff6b35', r:'255,107,53'  },
    'converter'        :{ c:'#00ccff', r:'0,204,255'   },
    'audio-extractor'  :{ c:'#44ff88', r:'68,255,136'  },
    'audio-trimmer'    :{ c:'#00d4aa', r:'0,212,170'   },
    'audio-converter'  :{ c:'#a855f7', r:'168,85,247'  },
    'compressor'       :{ c:'#ff4444', r:'255,68,68'   },
    'video-merger'     :{ c:'#00bcd4', r:'0,188,212'   },
    'speed-changer'    :{ c:'#ffd700', r:'255,215,0'   },
    'video-rotator'    :{ c:'#7c3aed', r:'124,58,237'  },
    'video-filters'    :{ c:'#ff44aa', r:'255,68,170'  },
    'text-overlay'     :{ c:'#c8d4e8', r:'200,212,232' },
    'ai-editor'        :{ c:'#00e5ff', r:'0,229,255'   },
    'bg-remover'       :{ c:'#c026d3', r:'192,38,211'  },
    'video-overlay'    :{ c:'#06b6d4', r:'6,182,212'   },
    'audio-adder'      :{ c:'#3b82f6', r:'59,130,246'  },
    'transparent-video':{ c:'#a855f7', r:'168,85,247'  },
};

function upgradeServiceCards() {
    document.querySelectorAll('.service-card').forEach((card, idx) => {
        const oc   = card.getAttribute('onclick') || '';
        const m    = oc.match(/checkServiceAccess\('([^']+)'/);
        const sid  = m?.[1];
        const cfg  = SV_COLORS[sid];
        const c    = cfg?.c || '#dc143c';
        const r    = cfg?.r || '220,20,60';

        /* CSS vars */
        card.style.setProperty('--sv-color',        c);
        card.style.setProperty('--sv-accent',       `rgba(${r},.18)`);
        card.style.setProperty('--sv-accent-border',`rgba(${r},.4)`);
        card.style.setProperty('--sv-accent-glow',  `rgba(${r},.1)`);
        card.style.setProperty('--sv-icon-bg',      `rgba(${r},.1)`);
        card.style.setProperty('--sv-icon-border',  `rgba(${r},.22)`);
        card.style.setProperty('--sv-icon-glow',    `rgba(${r},.15)`);
        card.style.setProperty('--sv-chip-bg',      `rgba(${r},.1)`);
        card.style.setProperty('--sv-chip-border',  `rgba(${r},.22)`);
        card.style.setProperty('--sv-chip-color',   c);
        card.style.setProperty('--sv-btn-hover',    `rgba(${r},.12)`);

        /* Entrance animation with stagger */
        card.classList.add('sv-animated');
        card.style.animationDelay = (idx * 0.06) + 's';
    });
}

/* Run after DOM ready */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', upgradeServiceCards);
} else {
    upgradeServiceCards();
}

/* ════════════════════════════════════════════
   ٢. السلوموشن — Slow Motion Injection
════════════════════════════════════════════ */
const SM_TARGETS = ['video-trimmer', 'converter'];
let   smCurrentSpeed = 1;

/* Patch openService to inject slow motion panel */
(function(){
    const _prev = window.openService;
    window.openService = function(sid, sname){
        _prev?.call(this, sid, sname);
        if (SM_TARGETS.includes(sid)) {
            smCurrentSpeed = 1;
            requestAnimationFrame(() => smInjectPanel(sid));
        }
    };
})();

/* Inject the slow motion UI into the open modal */
function smInjectPanel(sid) {
    const iface  = document.querySelector('.service-interface');
    const mainBtn= document.getElementById('mainBtn');
    if (!iface || !mainBtn) return;
    if (document.querySelector('.slomo-panel')) return; /* Already injected */

    const panel = document.createElement('div');
    panel.className = 'slomo-panel';
    panel.innerHTML = `
        <div class="slomo-head">
            <i class="fas fa-tachometer-alt"></i>
            سرعة الفيديو (Slow Motion)
            <span class="slomo-badge">اختياري</span>
        </div>
        <div class="slomo-btns">
            <button class="slomo-btn" onclick="smSet(0.25,this)">
                <span class="slomo-icon">❄️</span>
                <span class="slomo-val">0.25x</span>
                <span class="slomo-lbl">Ultra Slow</span>
            </button>
            <button class="slomo-btn" onclick="smSet(0.5,this)">
                <span class="slomo-icon">🐢</span>
                <span class="slomo-val">0.5x</span>
                <span class="slomo-lbl">Slow Mo</span>
            </button>
            <button class="slomo-btn" onclick="smSet(0.75,this)">
                <span class="slomo-icon">🎯</span>
                <span class="slomo-val">0.75x</span>
                <span class="slomo-lbl">سلو خفيف</span>
            </button>
            <button class="slomo-btn active" onclick="smSet(1,this)">
                <span class="slomo-icon">▶️</span>
                <span class="slomo-val">1x</span>
                <span class="slomo-lbl">عادي</span>
            </button>
            <button class="slomo-btn" onclick="smSet(1.5,this)">
                <span class="slomo-icon">⚡</span>
                <span class="slomo-val">1.5x</span>
                <span class="slomo-lbl">سريع</span>
            </button>
            <button class="slomo-btn" onclick="smSet(2,this)">
                <span class="slomo-icon">🚀</span>
                <span class="slomo-val">2x</span>
                <span class="slomo-lbl">ضعف السرعة</span>
            </button>
        </div>
        <div class="slomo-status-bar">
            <span id="smStatusText">▶️ السرعة: عادي (1x)</span>
            <span class="sm-warn">💡 أقل من 1x = سلوموشن | أكثر = تسريع</span>
        </div>`;
    iface.insertBefore(panel, mainBtn);
}

function smSet(speed, btn) {
    smCurrentSpeed = speed;
    document.querySelectorAll('.slomo-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const labels = {
        0.25: '❄️ Ultra Slow (0.25x)',
        0.5 : '🐢 Slow Motion (0.5x)',
        0.75: '🎯 سلو خفيف (0.75x)',
        1   : '▶️ عادي (1x)',
        1.5 : '⚡ سريع (1.5x)',
        2   : '🚀 ضعف السرعة (2x)',
    };
    const st = document.getElementById('smStatusText');
    if (st) st.textContent = labels[speed] || speed + 'x';

    /* Preview speed on video if open */
    const vid = document.getElementById('previewVid');
    if (vid && vid.src) vid.playbackRate = speed;
}

/* ════════════════════════════════════════════
   Override doVideoTrim — تقطيع + سلوموشن
════════════════════════════════════════════ */
(function(){
    const _orig = window.doVideoTrim;
    window.doVideoTrim = async function(){
        const speed = smCurrentSpeed || 1;
        if (speed === 1) return _orig?.call(this);

        if (!window.uploadedFile) { alert('⚠️ ارفع فيديو أولاً'); return; }
        const segs = window.parseSegs?.();
        if (!segs) return;

        const res = document.getElementById('serviceResult');
        window.setProcessing?.(res, `🎬 جاري التقطيع بسرعة ${speed}x...`);

        try {
            const blobs = [];
            for (const seg of segs) {
                const b = await smCaptureSlice(window.uploadedFile, seg.start, seg.end, speed);
                blobs.push(b);
            }
            const final = new Blob(blobs, { type: blobs[0]?.type || 'video/webm' });
            const url   = URL.createObjectURL(final);
            const lbl   = speed < 1 ? `سلو_${speed}x` : `سريع_${speed}x`;
            const name  = (window.baseName?.(window.uploadedFile.name) || 'video') + `_${lbl}.webm`;
            window.setSuccess?.(res, url, name, {
                'المقاطع': segs.map(s => `${s.start}ث→${s.end}ث`).join(' | '),
                'السرعة' : speed + 'x ' + (speed < 1 ? '🐢 Slow Mo' : '🚀 سريع'),
                'الحجم'  : (window.toMB?.(final) || '?') + ' MB',
                'الصيغة' : 'WebM'
            });
        } catch(err) {
            window.setError?.(res, 'خطأ: ' + err.message);
        }
    };
})();

/* ════════════════════════════════════════════
   Override doVideoConvert — تحويل + سلوموشن
════════════════════════════════════════════ */
(function(){
    const _orig = window.doVideoConvert;
    window.doVideoConvert = async function(){
        const speed = smCurrentSpeed || 1;
        if (speed === 1) return _orig?.call(this);

        if (!window.uploadedFile) { alert('⚠️ ارفع فيديو أولاً'); return; }
        const res = document.getElementById('serviceResult');
        window.setProcessing?.(res, `🔄 جاري التحويل بسرعة ${speed}x...`);

        try {
            const blob = await smCaptureFullVideo(window.uploadedFile, speed);
            const url  = URL.createObjectURL(blob);
            const lbl  = speed < 1 ? `سلو_${speed}x` : `سريع_${speed}x`;
            const name = (window.baseName?.(window.uploadedFile.name) || 'video') + `_${lbl}.webm`;
            window.setSuccess?.(res, url, name, {
                'السرعة' : speed + 'x ' + (speed < 1 ? '🐢 Slow Mo' : '🚀 سريع'),
                'الحجم'  : (window.toMB?.(blob) || '?') + ' MB',
                'الصيغة' : 'WebM'
            });
        } catch(err) {
            window.setError?.(res, 'خطأ: ' + err.message);
        }
    };
})();

/* ════════════════════════════════════════════
   Core: captureSlice with speed
════════════════════════════════════════════ */
function smCaptureSlice(file, startSec, endSec, speed) {
    return new Promise((resolve, reject) => {
        const vid       = document.createElement('video');
        vid.src         = URL.createObjectURL(file);
        vid.muted       = false;
        vid.preload     = 'auto';

        vid.addEventListener('error', () => reject(new Error('تعذّر تحميل الفيديو')));

        vid.addEventListener('loadedmetadata', () => {
            if (endSec > vid.duration + .5) {
                reject(new Error(`الفيديو ${vid.duration.toFixed(1)}ث — النهاية (${endSec}ث) تتجاوزه`));
                return;
            }
            vid.currentTime = startSec;
        });

        vid.addEventListener('seeked', function handler() {
            vid.removeEventListener('seeked', handler);

            const stream = vid.captureStream?.() || vid.mozCaptureStream?.();
            if (!stream) { reject(new Error('المتصفح لا يدعم captureStream')); return; }

            const mime   = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
                           ? 'video/webm;codecs=vp9,opus' : 'video/webm';
            const chunks = [];
            const rec    = new MediaRecorder(stream, { mimeType: mime });

            rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
            rec.onstop = () => {
                vid.pause();
                URL.revokeObjectURL(vid.src);
                resolve(new Blob(chunks, { type: mime }));
            };

            rec.start(100);
            vid.playbackRate = speed;
            vid.play();

            /* Duration in real time = (segment length / speed) + buffer */
            const realDur = ((endSec - startSec) / speed) * 1000 + 600;
            setTimeout(() => {
                try { if (rec.state === 'recording') rec.stop(); } catch(_) {}
            }, realDur);
        });
    });
}

function smCaptureFullVideo(file, speed) {
    return new Promise((resolve, reject) => {
        const vid   = document.createElement('video');
        vid.src     = URL.createObjectURL(file);
        vid.muted   = false;
        vid.preload = 'auto';

        vid.addEventListener('error', () => reject(new Error('تعذّر تحميل الفيديو')));

        vid.addEventListener('loadedmetadata', () => {
            const stream = vid.captureStream?.() || vid.mozCaptureStream?.();
            if (!stream) { reject(new Error('المتصفح لا يدعم captureStream')); return; }

            const mime   = 'video/webm';
            const chunks = [];
            const rec    = new MediaRecorder(stream, { mimeType: mime });

            rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
            rec.onstop = () => {
                vid.pause();
                URL.revokeObjectURL(vid.src);
                resolve(new Blob(chunks, { type: mime }));
            };

            rec.start(200);
            vid.playbackRate = speed;
            vid.play();

            vid.addEventListener('ended', () => {
                try { if (rec.state === 'recording') rec.stop(); } catch(_) {}
            });

            /* Safety timeout */
            setTimeout(() => {
                try { if (rec.state === 'recording') rec.stop(); } catch(_) {}
            }, (vid.duration / speed) * 1000 + 3000);
        });
    });
}
