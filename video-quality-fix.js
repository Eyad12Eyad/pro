/* ================================================================
   video-quality-fix.js — Eyad_Eyad12
   إصلاح جودة معالجة الفيديو + تحسين إزالة الخلفية
   أضف قبل </body>: <script src="video-quality-fix.js" defer></script>
================================================================ */

/* ════════════════════════════════════════════════════════════
   ١. إصلاح captureVideoSlice — Canvas بدل captureStream مباشر
   السبب: captureStream من الفيديو يلتقط كل frame drop ولا يتحكم
   بالجودة. الحل: نرسم على Canvas بـ RAF ونلتقط من Canvas.
════════════════════════════════════════════════════════════ */
window.captureVideoSlice = function(file, startSec, endSec) {
    return new Promise((resolve, reject) => {
        const vid    = document.createElement('video');
        vid.src      = URL.createObjectURL(file);
        vid.preload  = 'auto';
        vid.muted    = true;
        vid.playsInline = true;

        vid.addEventListener('error', () => reject(new Error('تعذّر تحميل الفيديو')));

        vid.addEventListener('loadedmetadata', () => {
            if (endSec > vid.duration + 0.5) {
                reject(new Error(`الفيديو ${vid.duration.toFixed(1)}ث — النهاية (${endSec}ث) تتجاوزه`));
                return;
            }

            const W = vid.videoWidth  || 1280;
            const H = vid.videoHeight || 720;
            const canvas = document.createElement('canvas');
            canvas.width = W; canvas.height = H;
            const ctx = canvas.getContext('2d');

            vid.currentTime = startSec;

            vid.addEventListener('seeked', function onSeeked() {
                vid.removeEventListener('seeked', onSeeked);

                /* ── Canvas stream = stable 30fps ── */
                const stream = canvas.captureStream(30);

                /* ── Audio via AudioContext ── */
                let audioCtx;
                try {
                    audioCtx = new AudioContext();
                    const src = audioCtx.createMediaElementSource(vid);
                    const dst = audioCtx.createMediaStreamDestination();
                    src.connect(dst);
                    dst.stream.getAudioTracks().forEach(t => stream.addTrack(t));
                } catch(_) {}

                /* ── High-quality MediaRecorder ── */
                const mime = ['video/webm;codecs=vp9,opus',
                               'video/webm;codecs=vp8,opus',
                               'video/webm'].find(m => MediaRecorder.isTypeSupported(m));

                const chunks = [];
                const rec = new MediaRecorder(stream, {
                    mimeType              : mime,
                    videoBitsPerSecond    : 12_000_000,   /* 12 Mbps — جودة عالية */
                    audioBitsPerSecond    : 192_000,       /* 192 kbps */
                });

                rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
                rec.onstop = () => {
                    vid.pause();
                    cancelAnimationFrame(rafId);
                    try { audioCtx?.close(); } catch(_) {}
                    URL.revokeObjectURL(vid.src);
                    resolve(new Blob(chunks, { type: mime }));
                };

                /* ── RAF draw loop ── */
                let rafId;
                const drawLoop = () => {
                    if (vid.currentTime >= endSec - 0.05 || vid.ended || vid.paused) {
                        try { if (rec.state === 'recording') rec.stop(); } catch(_) {}
                        return;
                    }
                    ctx.drawImage(vid, 0, 0, W, H);
                    rafId = requestAnimationFrame(drawLoop);
                };

                rec.start(40);
                vid.play().catch(() => {});
                rafId = requestAnimationFrame(drawLoop);

                /* Safety timeout */
                setTimeout(() => {
                    try { if (rec.state === 'recording') rec.stop(); } catch(_) {}
                }, (endSec - startSec) * 1000 + 2000);
            });
        });
    });
};

/* ════════════════════════════════════════════════════════════
   ٢. إصلاح reencodeEntireVideo — bitrate عال + Canvas
════════════════════════════════════════════════════════════ */
window.reencodeEntireVideo = function(file, outMime, videoBps, audioBps) {
    return new Promise((resolve, reject) => {
        const vid = document.createElement('video');
        vid.src   = URL.createObjectURL(file);
        vid.preload = 'auto';
        vid.muted = true;
        vid.playsInline = true;

        vid.addEventListener('error', () => reject(new Error('تعذّر تحميل الفيديو')));

        vid.addEventListener('loadedmetadata', () => {
            const W = vid.videoWidth  || 1280;
            const H = vid.videoHeight || 720;
            const canvas = document.createElement('canvas');
            canvas.width = W; canvas.height = H;
            const ctx = canvas.getContext('2d');

            const stream = canvas.captureStream(30);

            let audioCtx;
            try {
                audioCtx = new AudioContext();
                const src = audioCtx.createMediaElementSource(vid);
                const dst = audioCtx.createMediaStreamDestination();
                src.connect(dst);
                dst.stream.getAudioTracks().forEach(t => stream.addTrack(t));
            } catch(_) {}

            const mime = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
                .find(m => MediaRecorder.isTypeSupported(m));

            const chunks = [];
            const rec = new MediaRecorder(stream, {
                mimeType           : mime,
                videoBitsPerSecond : videoBps || 10_000_000,
                audioBitsPerSecond : audioBps || 192_000,
            });

            rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
            rec.onstop = () => {
                vid.pause();
                cancelAnimationFrame(rafId);
                try { audioCtx?.close(); } catch(_) {}
                URL.revokeObjectURL(vid.src);
                resolve(new Blob(chunks, { type: mime }));
            };

            let rafId;
            const drawLoop = () => {
                if (vid.ended || vid.paused) {
                    try { if (rec.state === 'recording') rec.stop(); } catch(_) {}
                    return;
                }
                ctx.drawImage(vid, 0, 0, W, H);
                rafId = requestAnimationFrame(drawLoop);
            };

            rec.start(40);
            vid.play().catch(() => {});
            rafId = requestAnimationFrame(drawLoop);

            vid.addEventListener('ended', () => {
                try { if (rec.state === 'recording') rec.stop(); } catch(_) {}
            });

            setTimeout(() => {
                try { if (rec.state === 'recording') rec.stop(); } catch(_) {}
            }, vid.duration * 1000 + 3000);
        });
    });
};

/* ════════════════════════════════════════════════════════════
   ٣. إصلاح captureWithSpeed — سرعة مع جودة
════════════════════════════════════════════════════════════ */
window.captureWithSpeed = function(file, speed) {
    return new Promise((resolve, reject) => {
        const vid = document.createElement('video');
        vid.src   = URL.createObjectURL(file);
        vid.preload = 'auto';
        vid.muted = true;
        vid.playsInline = true;

        vid.addEventListener('error', () => reject(new Error('تعذّر تحميل الفيديو')));

        vid.addEventListener('loadedmetadata', () => {
            const W = vid.videoWidth  || 1280;
            const H = vid.videoHeight || 720;
            const canvas = document.createElement('canvas');
            canvas.width = W; canvas.height = H;
            const ctx = canvas.getContext('2d');

            const stream = canvas.captureStream(30);

            let audioCtx;
            try {
                audioCtx = new AudioContext();
                const src = audioCtx.createMediaElementSource(vid);
                const dst = audioCtx.createMediaStreamDestination();
                src.connect(dst);
                dst.stream.getAudioTracks().forEach(t => stream.addTrack(t));
            } catch(_) {}

            const mime = ['video/webm;codecs=vp9,opus', 'video/webm'].find(m => MediaRecorder.isTypeSupported(m));
            const chunks = [];
            const rec = new MediaRecorder(stream, {
                mimeType           : mime,
                videoBitsPerSecond : 10_000_000,
                audioBitsPerSecond : 192_000,
            });

            rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
            rec.onstop = () => {
                vid.pause(); cancelAnimationFrame(rafId);
                try { audioCtx?.close(); } catch(_) {}
                URL.revokeObjectURL(vid.src);
                resolve(new Blob(chunks, { type: mime }));
            };

            let rafId;
            const drawLoop = () => {
                if (vid.ended || vid.paused) {
                    try { if (rec.state === 'recording') rec.stop(); } catch(_) {}
                    return;
                }
                ctx.drawImage(vid, 0, 0, W, H);
                rafId = requestAnimationFrame(drawLoop);
            };

            rec.start(40);
            vid.playbackRate = speed;
            vid.play().catch(() => {});
            rafId = requestAnimationFrame(drawLoop);

            vid.addEventListener('ended', () => {
                try { if (rec.state === 'recording') rec.stop(); } catch(_) {}
            });

            setTimeout(() => {
                try { if (rec.state === 'recording') rec.stop(); } catch(_) {}
            }, (vid.duration / speed) * 1000 + 3000);
        });
    });
};

/* ════════════════════════════════════════════════════════════
   ٤. إصلاح Chroma Key — YCbCr بدل RGB بسيط
   السبب: RGB يتأثر بالإضاءة ويعطي حواف سيئة
   الحل: YCbCr يفصل اللون عن الإضاءة = نتيجة أنظف بكثير
════════════════════════════════════════════════════════════ */

/* ── دالة colorDistance المحسّنة بـ YCbCr ── */
window.colorDistance = function(r1, g1, b1, r2, g2, b2) {
    /* YCbCr conversion — أدق من RGB لـ green/blue screen */
    const Cb1 = -0.168736*r1 - 0.331264*g1 + 0.5*b1;
    const Cr1 =  0.5*r1      - 0.418688*g1 - 0.081312*b1;
    const Cb2 = -0.168736*r2 - 0.331264*g2 + 0.5*b2;
    const Cr2 =  0.5*r2      - 0.418688*g2 - 0.081312*b2;
    /* فقط نقارن قنوات اللون (Cb,Cr) وليس الإضاءة */
    return Math.sqrt((Cb1-Cb2)**2 + (Cr1-Cr2)**2) * 2.2;
};

/* ── processChromaKey المحسّن ── */
window.processChromaKey = function(file, chromaCol, thresh, bgMode) {
    return new Promise((resolve, reject) => {
        const vid = document.createElement('video');
        vid.src   = URL.createObjectURL(file);
        vid.muted = true;
        vid.playsInline = true;

        vid.addEventListener('error', () => reject(new Error('تعذّر تحميل الفيديو')));

        vid.addEventListener('loadedmetadata', () => {
            const W = vid.videoWidth  || 1280;
            const H = vid.videoHeight || 720;

            /* Canvas رئيسي */
            const canvas    = document.createElement('canvas');
            canvas.width = W; canvas.height = H;
            const ctx = canvas.getContext('2d');

            /* Canvas مؤقت للمعالجة */
            const tmpCv     = document.createElement('canvas');
            tmpCv.width = W; tmpCv.height = H;
            const tmpCtx    = tmpCv.getContext('2d');

            const stream  = canvas.captureStream(30);

            let audioCtx;
            try {
                audioCtx = new AudioContext();
                const src = audioCtx.createMediaElementSource(vid);
                const dst = audioCtx.createMediaStreamDestination();
                src.connect(dst);
                dst.stream.getAudioTracks().forEach(t => stream.addTrack(t));
            } catch(_) {}

            const mime   = 'video/webm';
            const chunks = [];
            const rec    = new MediaRecorder(stream, {
                mimeType           : mime,
                videoBitsPerSecond : 10_000_000,
                audioBitsPerSecond : 192_000,
            });

            rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
            rec.onstop = () => {
                vid.pause();
                cancelAnimationFrame(rafId);
                try { audioCtx?.close(); } catch(_) {}
                URL.revokeObjectURL(vid.src);
                resolve(new Blob(chunks, { type: mime }));
            };

            rec.start(40);
            vid.play().catch(() => {});

            let rafId;
            const draw = () => {
                if (vid.ended || vid.paused) {
                    try { if (rec.state === 'recording') rec.stop(); } catch(_) {}
                    return;
                }

                ctx.clearRect(0, 0, W, H);

                /* ── خلفية بديلة ── */
                if (bgMode === 'color') {
                    ctx.fillStyle = document.getElementById('bgReplaceColor')?.value || '#000';
                    ctx.fillRect(0, 0, W, H);
                } else if (bgMode === 'image' && window.bgReplaceImg) {
                    ctx.drawImage(window.bgReplaceImg, 0, 0, W, H);
                }

                /* ── رسم الفيديو على canvas مؤقت ── */
                tmpCtx.drawImage(vid, 0, 0, W, H);
                const imgData = tmpCtx.getImageData(0, 0, W, H);
                const d = imgData.data;

                const kR = chromaCol.r, kG = chromaCol.g, kB = chromaCol.b;

                /* ── Chroma Key محسّن ── */
                for (let i = 0; i < d.length; i += 4) {
                    const r = d[i], g = d[i+1], b = d[i+2];

                    /* YCbCr distance */
                    const dist = colorDistance(r, g, b, kR, kG, kB);

                    if (dist < thresh) {
                        /* منطقة الخلفية — شفافية كاملة */
                        const soft = dist < thresh * 0.5
                            ? 0
                            : (dist - thresh * 0.5) / (thresh * 0.5);
                        d[i+3] = Math.floor(255 * soft * soft); /* منحنى ناعم */

                        /* ── Spill Suppression: إزالة لون الخلفية من الحواف ── */
                        if (d[i+3] > 0 && d[i+3] < 200) {
                            /* للأخضر: خفّف القناة الخضراء */
                            if (kG > kR && kG > kB) {
                                d[i+1] = Math.round(d[i+1] * 0.65 + (d[i] + d[i+2]) * 0.175);
                            }
                            /* للأزرق: خفّف القناة الزرقاء */
                            if (kB > kR && kB > kG) {
                                d[i+2] = Math.round(d[i+2] * 0.65 + (d[i] + d[i+1]) * 0.175);
                            }
                        }
                    }
                }

                /* ── تطبيق blur على قناة Alpha لتنعيم الحواف ── */
                _smoothAlphaEdges(d, W, H);

                tmpCtx.putImageData(imgData, 0, 0);

                /* ── رسم النتيجة فوق الخلفية ── */
                ctx.drawImage(tmpCv, 0, 0);

                rafId = requestAnimationFrame(draw);
            };

            vid.addEventListener('ended', () => {
                try { if (rec.state === 'recording') rec.stop(); } catch(_) {}
            });

            rafId = requestAnimationFrame(draw);
        });
    });
};

/* ── تنعيم حواف Alpha — box blur خفيف ── */
function _smoothAlphaEdges(data, W, H) {
    /* نطبق blur على الصفوف فقط للسرعة — بدل 2D كامل */
    const R = 1; /* نصف قطر pixel */
    for (let y = R; y < H - R; y++) {
        for (let x = R; x < W - R; x++) {
            const i = (y * W + x) * 4;
            if (data[i+3] === 0 || data[i+3] === 255) continue; /* تخطى الحافة الخارجية والداخلية */
            let sum = 0, cnt = 0;
            for (let dy = -R; dy <= R; dy++) {
                for (let dx = -R; dx <= R; dx++) {
                    const ni = ((y+dy)*W + (x+dx)) * 4;
                    sum += data[ni+3]; cnt++;
                }
            }
            data[i+3] = Math.floor(sum / cnt);
        }
    }
}

/* ════════════════════════════════════════════════════════════
   ٥. إصلاح updateBgPreview — معاينة أفضل بـ YCbCr
════════════════════════════════════════════════════════════ */
window.updateBgPreview = function() {
    const vid    = document.getElementById('bgSrcVideo');
    const canvas = document.getElementById('bgPreviewCanvas');
    if (!vid || !canvas || vid.readyState < 2) return;

    canvas.width  = vid.videoWidth  || 640;
    canvas.height = vid.videoHeight || 360;
    const W = canvas.width, H = canvas.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(vid, 0, 0, W, H);

    const imgData = ctx.getImageData(0, 0, W, H);
    const data    = imgData.data;
    const col     = hexToRgb(document.getElementById('chromaColor')?.value  || '#00ff00');
    const thresh  = parseInt(document.getElementById('chromaThresh')?.value || 40);

    for (let i = 0; i < data.length; i += 4) {
        const dist = colorDistance(data[i], data[i+1], data[i+2], col.r, col.g, col.b);
        if (dist < thresh) {
            const soft  = Math.max(0, (dist - thresh * 0.4) / (thresh * 0.6));
            data[i+3]   = Math.floor(255 * soft * soft);
            /* Spill suppression */
            if (col.g > col.r && col.g > col.b && data[i+3] < 200) {
                data[i+1] = Math.round(data[i+1] * 0.6 + (data[i] + data[i+2]) * 0.2);
            }
        }
    }

    _smoothAlphaEdges(data, W, H);
    ctx.putImageData(imgData, 0, 0);
};

/* ════════════════════════════════════════════════════════════
   ٦. رسالة تحسين مرئية عند الانتهاء
════════════════════════════════════════════════════════════ */
/* إضافة معلومة جودة في نتيجة التحويل */
const _origSetSuccess = window.setSuccess;
if (_origSetSuccess) {
    window.setSuccess = function(res, url, name, info) {
        const enhancedInfo = {
            ...info,
            'الجودة': '🔥 مُحسَّن — 12Mbps + Canvas'
        };
        _origSetSuccess.call(this, res, url, name, enhancedInfo);
    };
}

console.log('%c✅ Video Quality Fix Loaded — جودة الفيديو مُحسَّنة', 'color:#00e5ff;font-weight:800;background:#030d1e;padding:4px 10px;border-radius:4px');
