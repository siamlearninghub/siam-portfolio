/* =========================================================
   SIAM.DEV — PREMIUM AI PORTFOLIO — SCRIPT
   ========================================================= */

/* ---------- CONFIG ---------- */
// ⚠️ Client-side credentials. This blocks casual visitors but is
// visible to anyone who reads this file — do not use for real secrets.
const SITE_USERNAME = "siam";
const SITE_PASSWORD = "siam0087";

/* =========================================================
   LOCK SCREEN
   ========================================================= */
(function lockScreen(){
  const lock      = document.getElementById('lockscreen');
  const siteRoot  = document.getElementById('siteRoot');
  const userInput = document.getElementById('lockUser');
  const passInput = document.getElementById('lockInput');
  const remember  = document.getElementById('lockRemember');
  const btn       = document.getElementById('lockBtn');
  const err       = document.getElementById('lockError');

  function unlock(persist){
    lock.classList.add('unlocked');
    siteRoot.classList.add('show');
    sessionStorage.setItem('siam_unlocked', '1');
    if(persist) localStorage.setItem('siam_unlocked_persist', '1');
    setTimeout(()=>{ lock.style.display = 'none'; initSiteEffects(); }, 650);
  }

  function tryUnlock(){
    const u = (userInput?.value || '').trim().toLowerCase();
    const p = (passInput?.value || '').trim();
    if(u === SITE_USERNAME.toLowerCase() && p === SITE_PASSWORD){
      unlock(remember?.checked);
    } else {
      err.classList.remove('show');
      void err.offsetWidth; // restart animation
      err.classList.add('show');
      passInput.value = '';
      passInput.focus();
    }
  }

  // Already unlocked this session, or "remember me" was checked previously
  if(sessionStorage.getItem('siam_unlocked') === '1' || localStorage.getItem('siam_unlocked_persist') === '1'){
    lock.style.display = 'none';
    siteRoot.classList.add('show');
  } else {
    initLockParticles();
    setTimeout(()=> userInput && userInput.focus(), 500);
  }

  btn?.addEventListener('click', tryUnlock);
  userInput?.addEventListener('keydown', e => { if(e.key === 'Enter') passInput?.focus(); });
  passInput?.addEventListener('keydown', e => { if(e.key === 'Enter') tryUnlock(); });
})();

/* Lock screen ambient particle canvas */
function initLockParticles(){
  const canvas = document.getElementById('lockParticles');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  particles = Array.from({length: 50}, () => ({
    x: Math.random()*w, y: Math.random()*h,
    vx: (Math.random()-0.5)*0.3, vy: (Math.random()-0.5)*0.3,
    r: Math.random()*1.5+0.5
  }));

  function draw(){
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = 'rgba(0,232,255,0.6)';
    particles.forEach(p=>{
      p.x += p.vx; p.y += p.vy;
      if(p.x<0||p.x>w) p.vx*=-1;
      if(p.y<0||p.y>h) p.vy*=-1;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* =========================================================
   MAIN SITE EFFECTS (init after unlock)
   ========================================================= */
let siteEffectsInitialized = false;
function initSiteEffects(){
  if(siteEffectsInitialized) return;
  siteEffectsInitialized = true;

  initParticles();
  initHeader();
  initTypedText();
  initRevealOnScroll();
  initStatCounters();
  initSkillBars();
  initTiltCards();
  initMobileMenu();
  initChatbot();
}

/* If already unlocked via sessionStorage on load */
document.addEventListener('DOMContentLoaded', () => {
  if(sessionStorage.getItem('siam_unlocked') === '1'){
    initSiteEffects();
  }
});

/* ---------- Background particle network ---------- */
function initParticles(){
  const canvas = document.getElementById('particles');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = document.documentElement.scrollHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const count = Math.min(70, Math.floor(window.innerWidth/22));
  particles = Array.from({length: count}, () => ({
    x: Math.random()*w, y: Math.random()*h,
    vx: (Math.random()-0.5)*0.25, vy: (Math.random()-0.5)*0.25,
    r: Math.random()*1.6+0.6
  }));

  function draw(){
    ctx.clearRect(0,0,w,h);
    for(let i=0;i<particles.length;i++){
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if(p.x<0||p.x>w) p.vx*=-1;
      if(p.y<0||p.y>h) p.vy*=-1;

      ctx.beginPath();
      ctx.fillStyle = 'rgba(0,232,255,0.45)';
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();

      for(let j=i+1;j<particles.length;j++){
        const q = particles[j];
        const dx = p.x-q.x, dy = p.y-q.y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if(dist < 130){
          ctx.beginPath();
          ctx.strokeStyle = `rgba(124,92,255,${0.15*(1-dist/130)})`;
          ctx.lineWidth = 1;
          ctx.moveTo(p.x,p.y);
          ctx.lineTo(q.x,q.y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

/* ---------- Header scroll state + smooth nav ---------- */
function initHeader(){
  const header = document.getElementById('header');
  if(!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 30);
  });

  document.querySelectorAll('#nav a').forEach(a=>{
    a.addEventListener('click', () => {
      document.getElementById('nav')?.classList.remove('open');
    });
  });
}

function initMobileMenu(){
  const btn = document.getElementById('menuBtn');
  const nav = document.getElementById('nav');
  btn?.addEventListener('click', () => nav?.classList.toggle('open'));
}

/* ---------- Typed hero text ---------- */
function initTypedText(){
  const el = document.getElementById('typed-text');
  if(!el) return;
  const phrases = [
    'AI Engineer', 'Data Scientist', 'Python Developer',
    'ML Researcher', 'Computer Vision Enthusiast'
  ];
  let pIdx = 0, charIdx = 0, deleting = false;

  function tick(){
    const phrase = phrases[pIdx];
    if(!deleting){
      el.textContent = phrase.slice(0, ++charIdx);
      if(charIdx === phrase.length){
        deleting = true;
        setTimeout(tick, 1400);
        return;
      }
    } else {
      el.textContent = phrase.slice(0, --charIdx);
      if(charIdx === 0){
        deleting = false;
        pIdx = (pIdx+1) % phrases.length;
      }
    }
    setTimeout(tick, deleting ? 45 : 85);
  }
  tick();
}

/* ---------- Scroll reveal ---------- */
function initRevealOnScroll(){
  const items = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('in');
        obs.unobserve(e.target);
      }
    });
  }, { threshold:0.15 });
  items.forEach(i=>obs.observe(i));
}

/* ---------- Animated stat counters ---------- */
function initStatCounters(){
  const nums = document.querySelectorAll('.stat-num');
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        animateCount(e.target);
        obs.unobserve(e.target);
      }
    });
  }, { threshold:0.5 });
  nums.forEach(n=>obs.observe(n));
}
function animateCount(el){
  const target = parseInt(el.dataset.target, 10) || 0;
  const dur = 1400;
  const start = performance.now();
  function step(now){
    const p = Math.min((now-start)/dur, 1);
    const eased = 1 - Math.pow(1-p, 3);
    el.textContent = Math.round(eased*target);
    if(p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ---------- Skill bar fill on scroll ---------- */
function initSkillBars(){
  const bars = document.querySelectorAll('.skill-fill');
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.style.width = e.target.dataset.width + '%';
        obs.unobserve(e.target);
      }
    });
  }, { threshold:0.3 });
  bars.forEach(b=>obs.observe(b));
}

/* ---------- 3D tilt on cards ---------- */
function initTiltCards(){
  const cards = document.querySelectorAll('.tilt-card');
  const maxTilt = 7;

  cards.forEach(card=>{
    card.addEventListener('mousemove', (e)=>{
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width/2, cy = rect.height/2;
      const rotX = ((y-cy)/cy) * -maxTilt;
      const rotY = ((x-cx)/cx) * maxTilt;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', ()=>{
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
}

/* ---------- Hero 3D parallax (mouse-follow) ---------- */
document.addEventListener('mousemove', (e)=>{
  const stage = document.getElementById('hero3d');
  if(!stage) return;
  const x = (e.clientX/window.innerWidth - 0.5) * 14;
  const y = (e.clientY/window.innerHeight - 0.5) * 14;
  stage.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
});

/* =========================================================
   AI CHATBOT — real Claude API + voice in/out
   ========================================================= */

// Where the secure backend lives. Works automatically once deployed
// on Vercel (see api/chat.js — Vercel auto-detects files in /api).
// On localhost without `vercel dev` running, calls fail gracefully
// and the chatbot falls back to built-in replies below.
const CHAT_API_ENDPOINT = '/api/chat';

let chatHistory = [];      // [{role:'user'|'assistant', content:'...'}]
let voiceOutputOn = true;  // bot speaks replies by default
let recognizing = false;
let speechRecognizer = null;

function initChatbot(){
  const input = document.getElementById('input');
  input?.addEventListener('keydown', e=>{ if(e.key==='Enter') sendMessage(); });

  initVoiceToggle();
  initMic();
}

/* ---------- local fallback replies (used only if the API call fails) ---------- */
const fallbackReplies = [
  { keys: ['project','built','made'], reply: "I've built 10 Python/AI projects — an Image Classifier (92% CNN), Sentiment Analyzer (BERT), Data Dashboard, House Price Predictor, Text Generator (LSTM), Digit Recognizer (99.1%), AI Chatbot, Fake News Detector, Stock Price Predictor, and a Face Recognition Attendance system! Check the Projects section above 👆" },
  { keys: ['python skill','best skill','skill'], reply: "Python is my strongest skill at 95%! I'm also strong in NumPy/Pandas (90%), scikit-learn (88%), and TensorFlow/Keras (85%). Check the Skills section for the full breakdown 📊" },
  { keys: ['cnn','convolutional'], reply: "My CNN model is an image classifier trained on CIFAR-10, hitting 92% accuracy, with real-time webcam inference via OpenCV 🖼️" },
  { keys: ['course','free python'], reply: "Yes! I'm launching a completely free Python course — Beginner to Master — on YouTube. Subscribe to get notified! 🐍" },
  { keys: ['contact','email','reach','hire'], reply: "You can reach me via WhatsApp (fastest!), email, or any of my social links in the Contact section below 👇" },
  { keys: ['college','school','study','education'], reply: "I'm currently a Class 11 Science student at Narsingdi Government College, Bangladesh — studying alongside my AI/ML work! 🎓" },
  { keys: ['hi','hello','hey'], reply: "Hey there! 👋 Ask me about my Python projects, ML skills, or the free Python course!" },
];
function fallbackResponse(msg){
  const lower = msg.toLowerCase();
  for(const r of fallbackReplies){
    if(r.keys.some(k=>lower.includes(k))) return r.reply;
  }
  return "I couldn't reach the AI backend just now, so here's a quick answer: for specifics, the fastest way is to message Siam directly on WhatsApp 🙂";
}

/* ---------- message bubble rendering ---------- */
function appendMessage(text, isUser){
  const chat = document.getElementById('chat');
  if(!chat) return null;
  const wrap = document.createElement('div');
  wrap.className = 'msg ' + (isUser ? 'user-msg' : 'bot-msg');
  wrap.innerHTML = `<span class="avatar">${isUser ? '🧑' : '🤖'}</span><div class="bubble"></div>`;
  wrap.querySelector('.bubble').textContent = text;
  chat.appendChild(wrap);
  chat.scrollTop = chat.scrollHeight;
  return wrap;
}

function appendTypingIndicator(){
  const chat = document.getElementById('chat');
  if(!chat) return null;
  const wrap = document.createElement('div');
  wrap.className = 'msg bot-msg';
  wrap.innerHTML = `<span class="avatar">🤖</span><div class="bubble typing"><span></span><span></span><span></span></div>`;
  chat.appendChild(wrap);
  chat.scrollTop = chat.scrollHeight;
  return wrap;
}

/* ---------- core send flow: call backend, fall back locally on failure ---------- */
async function getBotReply(userMsg){
  chatHistory.push({ role: 'user', content: userMsg });

  try{
    const res = await fetch(CHAT_API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatHistory }),
    });
    if(!res.ok) throw new Error('backend not available');
    const data = await res.json();
    if(!data.reply) throw new Error('empty reply');
    chatHistory.push({ role: 'assistant', content: data.reply });
    return data.reply;
  } catch(err){
    // Backend not deployed yet, or call failed — use local fallback so the
    // chatbox still feels alive during development / before Netlify setup.
    const fallback = fallbackResponse(userMsg);
    chatHistory.push({ role: 'assistant', content: fallback });
    return fallback;
  }
}

async function sendMessage(){
  const input = document.getElementById('input');
  const msg = input.value.trim();
  if(!msg) return;
  appendMessage(msg, true);
  input.value = '';

  const typingEl = appendTypingIndicator();
  const reply = await getBotReply(msg);
  typingEl?.remove();
  appendMessage(reply, false);
  speak(reply);
}

async function quickAsk(text){
  appendMessage(text, true);
  const typingEl = appendTypingIndicator();
  const reply = await getBotReply(text);
  typingEl?.remove();
  appendMessage(reply, false);
  speak(reply);
}

/* =========================================================
   VOICE OUTPUT (text-to-speech) — browser built-in, free
   ========================================================= */
function initVoiceToggle(){
  const btn = document.getElementById('voiceToggle');
  if(!btn) return;
  btn.addEventListener('click', () => {
    voiceOutputOn = !voiceOutputOn;
    btn.textContent = voiceOutputOn ? '🔊' : '🔇';
    btn.classList.toggle('muted', !voiceOutputOn);
    btn.setAttribute('aria-pressed', String(voiceOutputOn));
    if(!voiceOutputOn) window.speechSynthesis?.cancel();
  });
}

function speak(text){
  if(!voiceOutputOn) return;
  if(!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel(); // stop any prior utterance
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1.0;
  utter.pitch = 1.0;
  utter.lang = 'en-US';
  window.speechSynthesis.speak(utter);
}

/* =========================================================
   VOICE INPUT (speech-to-text) — browser built-in, free
   ========================================================= */
function initMic(){
  const micBtn = document.getElementById('micBtn');
  const status = document.getElementById('micStatus');
  if(!micBtn) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SpeechRecognition){
    micBtn.classList.add('unsupported');
    micBtn.title = 'Voice input is not supported in this browser';
    return;
  }

  speechRecognizer = new SpeechRecognition();
  speechRecognizer.lang = 'en-US';
  speechRecognizer.interimResults = false;
  speechRecognizer.maxAlternatives = 1;

  speechRecognizer.addEventListener('start', () => {
    recognizing = true;
    micBtn.classList.add('listening');
    status.textContent = '🎙️ Listening...';
    status.classList.add('show');
  });

  speechRecognizer.addEventListener('end', () => {
    recognizing = false;
    micBtn.classList.remove('listening');
    status.classList.remove('show');
  });

  speechRecognizer.addEventListener('error', () => {
    recognizing = false;
    micBtn.classList.remove('listening');
    status.textContent = "Didn't catch that — try again.";
    setTimeout(()=> status.classList.remove('show'), 1800);
  });

  speechRecognizer.addEventListener('result', (e) => {
    const transcript = e.results[0][0].transcript;
    const input = document.getElementById('input');
    input.value = transcript;
    sendMessage();
  });

  micBtn.addEventListener('click', () => {
    if(recognizing){
      speechRecognizer.stop();
    } else {
      window.speechSynthesis?.cancel();
      try{ speechRecognizer.start(); } catch(e){ /* already started */ }
    }
  });
}