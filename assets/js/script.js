/* =========================================================
   SIAM.DEV — PREMIUM AI PORTFOLIO — SCRIPT
   ========================================================= */

/* ---------- CONFIG ---------- */
const STORAGE_KEY = 'siam_portfolio_users';
const ACTIVE_USER_KEY = 'siam_portfolio_active_user';
const DEFAULT_LOGIN_USER = {
  id: 'default-siam',
  name: 'Siam',
  email: 'siam@example.com',
  username: 'siam',
  password: 'siam0087',
  provider: 'local'
};

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
  const authStatus = document.getElementById('authStatus');
  const loginPanel = document.getElementById('loginFormPanel');
  const registerPanel = document.getElementById('registerFormPanel');
  const showRegisterBtn = document.getElementById('showRegisterBtn');
  const showLoginBtn = document.getElementById('showLoginBtn');
  const showRegisterTab = document.getElementById('showRegisterTab');
  const showLoginTab = document.getElementById('showLoginTab');
  const registerHint = document.getElementById('registerHint');
  const loginHint = document.getElementById('loginHint');
  const registerBtn = document.getElementById('registerBtn');
  const verifyOtpBtn = document.getElementById('verifyOtpBtn');
  const registerName = document.getElementById('registerName');
  const registerEmail = document.getElementById('registerEmail');
  const registerPhone = document.getElementById('registerPhone');
  const registerPass = document.getElementById('registerPass');
  const registerConfirm = document.getElementById('registerConfirm');
  const otpPanel = document.getElementById('otpPanel');
  const otpInput = document.getElementById('otpInput');

  function getStoredUsers(){
    try {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if(!Array.isArray(users)) return [];
      return users;
    } catch {
      return [];
    }
  }

  function ensureDefaultUser(){
    const users = getStoredUsers();
    const exists = users.some(user =>
      user.username?.toLowerCase() === DEFAULT_LOGIN_USER.username.toLowerCase() ||
      user.email?.toLowerCase() === DEFAULT_LOGIN_USER.email.toLowerCase()
    );
    if(!exists){
      users.push(DEFAULT_LOGIN_USER);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }
  }

  function saveUser(user){
    const users = getStoredUsers();
    const existing = users.find(item =>
      item.email.toLowerCase() === user.email.toLowerCase() ||
      item.username.toLowerCase() === user.username.toLowerCase()
    );
    if(existing) return false;
    users.push(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    return true;
  }

  function findUser(identifier, password){
    ensureDefaultUser();
    const users = getStoredUsers();
    const normalized = (identifier || '').trim().toLowerCase();
    return users.find(user => {
      const emailMatch = user.email?.toLowerCase() === normalized;
      const usernameMatch = user.username?.toLowerCase() === normalized;
      return (emailMatch || usernameMatch) && user.password === password;
    });
  }

  function setAuthMessage(message, type = 'error'){
    if(!authStatus) return;
    authStatus.textContent = message;
    authStatus.className = `auth-status show ${type}`;
  }

  function clearAuthMessage(){
    if(!authStatus) return;
    authStatus.textContent = '';
    authStatus.className = 'auth-status';
  }

  function toggleAuthView(showRegister){
    loginPanel?.classList.toggle('hidden', showRegister);
    registerPanel?.classList.toggle('hidden', !showRegister);
    otpPanel?.classList.add('hidden');
    showRegisterTab?.classList.toggle('active', showRegister);
    showLoginTab?.classList.toggle('active', !showRegister);
    registerHint?.classList.toggle('hidden', showRegister);
    loginHint?.classList.toggle('hidden', !showRegister);
    clearAuthMessage();
    if(showRegister){
      registerName?.focus();
    } else {
      userInput?.focus();
    }
  }

  function unlock(persist, user = null){
    lock.classList.add('unlocked');
    siteRoot.classList.add('show');
    siteRoot.style.display = 'block';
    lock.style.display = 'none';
    sessionStorage.setItem('siam_unlocked', '1');
    if(user){
      sessionStorage.setItem(ACTIVE_USER_KEY, JSON.stringify({
        name: user.name || user.username,
        provider: user.provider || 'local'
      }));
    }
    if(persist) localStorage.setItem('siam_unlocked_persist', '1');
    setTimeout(() => {
      loadCourses()
        .then(() => initSiteEffects())
        .catch(error => {
          console.error('loadCourses() after unlock failed:', error);
          initSiteEffects();
        });
    }, 100);
  }

  function tryUnlock(){
    const u = (userInput?.value || '').trim();
    const p = (passInput?.value || '').trim();
    const user = findUser(u, p);
    if(user){
      unlock(remember?.checked, user);
      setAuthMessage(`Welcome back, ${user.name || user.username}!`, 'success');
    } else {
      err.classList.remove('show');
      void err.offsetWidth;
      err.classList.add('show');
      passInput.value = '';
      passInput.focus();
    }
  }

  function createAccount(){
    const name = (registerName?.value || '').trim();
    const email = (registerEmail?.value || '').trim();
    const phone = (registerPhone?.value || '').trim();
    const password = (registerPass?.value || '').trim();
    const confirm = (registerConfirm?.value || '').trim();

    if(!name || !email || !phone || !password || !confirm){
      setAuthMessage('Please fill in all fields to create your account.', 'error');
      return;
    }

    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      setAuthMessage('Please enter a valid email address.', 'error');
      return;
    }

    if(!/^[0-9+\-() ]{7,15}$/.test(phone)){
      setAuthMessage('Please enter a valid phone number.', 'error');
      return;
    }

    if(password.length < 6){
      setAuthMessage('Password must be at least 6 characters.', 'error');
      return;
    }

    if(password !== confirm){
      setAuthMessage('Passwords do not match.', 'error');
      return;
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    sessionStorage.setItem('siam_pending_otp', otp);
    sessionStorage.setItem('siam_pending_user', JSON.stringify({
      name,
      email,
      phone,
      password,
      username: email.split('@')[0],
      provider: 'local'
    }));

    registerPanel?.classList.add('hidden');
    otpPanel?.classList.remove('hidden');
    otpInput?.focus();
    setAuthMessage(`OTP sent to ${email} / ${phone}. Use code ${otp}`, 'success');
  }

  function verifyOtp(){
    const enteredOtp = (otpInput?.value || '').trim();
    const pendingUser = JSON.parse(sessionStorage.getItem('siam_pending_user') || 'null');
    const expectedOtp = sessionStorage.getItem('siam_pending_otp');

    if(!pendingUser){
      setAuthMessage('No pending sign-up found. Please start again.', 'error');
      return;
    }

    if(enteredOtp !== expectedOtp){
      setAuthMessage('Invalid OTP. Please try again.', 'error');
      return;
    }

    if(saveUser(pendingUser)){
      unlock(remember?.checked, pendingUser);
      sessionStorage.removeItem('siam_pending_otp');
      sessionStorage.removeItem('siam_pending_user');
      setAuthMessage(`Account verified. Welcome, ${pendingUser.name}!`, 'success');
    } else {
      setAuthMessage('An account with that email or username already exists.', 'error');
    }
  }

  function openSocialAuthModal(provider){
    const overlay = document.createElement('div');
    overlay.className = 'auth-modal';
    overlay.innerHTML = `
      <div class="auth-modal-card">
        <h3>Continue with ${provider}</h3>
        <p>Enter your name and email to continue.</p>
        <input type="text" id="socialNameInput" class="modal-input" placeholder="Your name" />
        <input type="email" id="socialEmailInput" class="modal-input" placeholder="you@example.com" />
        <div class="modal-actions">
          <button type="button" class="modal-btn secondary" id="cancelSocialAuth">Cancel</button>
          <button type="button" class="modal-btn primary" id="confirmSocialAuth">Continue</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const cancel = overlay.querySelector('#cancelSocialAuth');
    const confirm = overlay.querySelector('#confirmSocialAuth');
    const nameInput = overlay.querySelector('#socialNameInput');
    const emailInput = overlay.querySelector('#socialEmailInput');

    cancel?.addEventListener('click', () => overlay.remove());
    confirm?.addEventListener('click', () => {
      const name = (nameInput?.value || '').trim() || `${provider} User`;
      const email = (emailInput?.value || '').trim();
      if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
        setAuthMessage('Please enter a valid email to continue with social login.', 'error');
        overlay.remove();
        return;
      }

      const user = {
        id: `${provider.toLowerCase()}-${Date.now()}`,
        name,
        email,
        username: email.split('@')[0],
        password: `social-${Date.now()}`,
        provider
      };

      saveUser(user);
      unlock(remember?.checked, user);
      setAuthMessage(`Signed in with ${provider}. Welcome, ${name}!`, 'success');
      overlay.remove();
    });
  }

  // Already unlocked this session, or "remember me" was checked previously
  if(sessionStorage.getItem('siam_unlocked') === '1' || localStorage.getItem('siam_unlocked_persist') === '1'){
    lock.style.display = 'none';
    siteRoot.classList.add('show');
    loadCourses()
      .then(() => initSiteEffects())
      .catch(error => {
        console.error('loadCourses() during startup failed:', error);
        initSiteEffects();
      });
  } else {
    initLockParticles();
    setTimeout(()=> userInput && userInput.focus(), 500);
  }

  btn?.addEventListener('click', tryUnlock);
  registerBtn?.addEventListener('click', createAccount);
  verifyOtpBtn?.addEventListener('click', verifyOtp);
  showRegisterBtn?.addEventListener('click', () => toggleAuthView(true));
  showLoginBtn?.addEventListener('click', () => toggleAuthView(false));
  showRegisterTab?.addEventListener('click', () => toggleAuthView(true));
  showLoginTab?.addEventListener('click', () => toggleAuthView(false));
  userInput?.addEventListener('keydown', e => { if(e.key === 'Enter') passInput?.focus(); });
  passInput?.addEventListener('keydown', e => { if(e.key === 'Enter') tryUnlock(); });
  registerName?.addEventListener('keydown', e => { if(e.key === 'Enter') registerEmail?.focus(); });
  registerEmail?.addEventListener('keydown', e => { if(e.key === 'Enter') registerPhone?.focus(); });
  registerPhone?.addEventListener('keydown', e => { if(e.key === 'Enter') registerPass?.focus(); });
  registerPass?.addEventListener('keydown', e => { if(e.key === 'Enter') registerConfirm?.focus(); });
  registerConfirm?.addEventListener('keydown', e => { if(e.key === 'Enter') createAccount(); });
  otpInput?.addEventListener('keydown', e => { if(e.key === 'Enter') verifyOtp(); });
  document.querySelectorAll('.social-btn').forEach(button => {
    button.addEventListener('click', () => openSocialAuthModal(button.dataset.provider || 'Social'));
  });
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
    ctx.fillStyle = 'rgba(255,212,59,0.5)';
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
  initChatToggle();
  initCourseDeck();
}

const MAX_COURSE_VIDEO_DATA = 5 * 1024 * 1024; // 5MB safe limit for stored course media
const COURSE_STORAGE_KEY = 'siam_portfolio_admin_courses';
const COURSE_PROGRESS_KEY = 'siam_portfolio_course_progress';
let cachedCourses = [];
let coursePlatformInitialized = false;
let selectedCourseId = null;
let selectedLessonId = null;
let currentCourseProgress = {};
let currentSearchValue = '';
let activeCourse = null;
let activeLessonNotes = '';
let collapsedModules = new Set();

function getCourseProgress() {
  try {
    const parsed = JSON.parse(localStorage.getItem(COURSE_PROGRESS_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function getYoutubeEmbedUrl(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}?rel=0` : null;
}

function saveCourseProgress(progress) {
  localStorage.setItem(COURSE_PROGRESS_KEY, JSON.stringify(progress));
  currentCourseProgress = progress;
}

function getSeedCourses() {
  return [
    {
      id: 'python-for-ai-builders',
      title: 'Python for AI Builders',
      status: 'published',
      serial: 1,
      description: 'A premium learning path from Python fundamentals to real-world AI projects.',
      category: 'Python',
      moduleTitle: 'Core Python & AI Foundations',
      lessons: [
        // 👇 Paste YouTube links here in the order you want them to play (serial 1, 2, 3...)
        // Works with any youtube.com/watch?v=... or youtu.be/... link — just paste the full URL.
        {
          id: 'lesson-1',
          title: 'Welcome & Setup',
          duration: '12 min',
          notes: 'Set up Python, VS Code, and your first workflow in under 15 minutes.',
          resources: ['Installation checklist', 'Starter notebook'],
          videoUrl: '' // <-- paste YouTube link #1 here
        },
        {
          id: 'lesson-2',
          title: 'Python Basics',
          duration: '18 min',
          notes: 'Practice variables, loops, functions, and conditionals with small coding exercises.',
          resources: ['Practice sheet', 'Syntax cheat sheet'],
          videoUrl: '' // <-- paste YouTube link #2 here
        },
        {
          id: 'lesson-3',
          title: 'AI With Python',
          duration: '22 min',
          notes: 'Explore how Python powers machine learning, data analysis, and automation.',
          resources: ['Mini project prompt', 'API guide'],
          videoUrl: '' // <-- paste YouTube link #3 here
        }
      ],
      modules: [
        {
          id: 'module-1',
          title: 'Core Python & AI Foundations',
          lessons: [
            { id: 'lesson-1', title: 'Welcome & Setup', duration: '12 min' },
            { id: 'lesson-2', title: 'Python Basics', duration: '18 min' },
            { id: 'lesson-3', title: 'AI With Python', duration: '22 min' }
          ]
        }
      ],
      createdAt: Date.now()
    },
    {
      id: 'next-gen-data-science',
      title: 'Next Gen Data Science',
      status: 'upcoming',
      serial: 2,
      description: 'A deeper dive into real datasets, visualization, and analysis workflows.',
      category: 'Data Science',
      moduleTitle: 'Data Science Essentials',
      lessons: [
        { id: 'up-1', title: 'Data cleaning', duration: '15 min', notes: 'Clean and prepare messy data.', resources: ['Dataset template'], videoUrl: '' }
      ],
      modules: [
        { id: 'module-up-1', title: 'Data Science Essentials', lessons: [{ id: 'up-1', title: 'Data cleaning', duration: '15 min' }] }
      ],
      createdAt: Date.now() + 1
    }
  ];
}

function normalizeCourse(course) {
  const lessons = Array.isArray(course.lessons) ? course.lessons : [];
  const modules = Array.isArray(course.modules) && course.modules.length
    ? course.modules.map(module => ({
        id: module.id || `${course.id}-${Math.random().toString(36).slice(2, 8)}`,
        title: module.title || course.moduleTitle || 'Course Module',
        lessons: Array.isArray(module.lessons) ? module.lessons : lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          duration: lesson.duration || '0 min'
        }))
      }))
    : [{
        id: `${course.id}-module-1`,
        title: course.moduleTitle || 'Course Module',
        lessons: lessons.map(lesson => ({ id: lesson.id, title: lesson.title, duration: lesson.duration || '0 min' }))
      }];

  return {
    ...course,
    id: course.id || `course-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    lessons,
    modules,
    description: course.description || 'A premium course designed to help you build real-world skills.',
    status: course.status || 'published',
    category: course.category || 'Python',
    moduleTitle: course.moduleTitle || 'Course Module',
    createdAt: course.createdAt || Date.now()
  };
}

async function openCourseDB() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open('siam_portfolio_courses', 1);
    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('media')) {
        db.createObjectStore('media');
      }
    };
    request.onsuccess = event => resolve(event.target.result);
    request.onerror = () => reject(new Error('IndexedDB unavailable'));
  });
}

async function getMediaBlob(key) {
  if (!key) return null;
  const db = await openCourseDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('media', 'readonly');
    const store = tx.objectStore('media');
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function loadCourses() {
  let parsed = [];
  try {
    parsed = JSON.parse(localStorage.getItem(COURSE_STORAGE_KEY) || '[]');
  } catch (error) {
    console.warn('loadCourses() parse failed:', error);
  }

  const storedCourses = Array.isArray(parsed) ? parsed : [];
  const seededCourses = getSeedCourses();
  const merged = [...seededCourses, ...storedCourses.filter(item => !seededCourses.some(course => course.id === item.id))];
  cachedCourses = merged.map(normalizeCourse).sort((a, b) => (a.serial || 0) - (b.serial || 0));

  for (const course of cachedCourses) {
    if (course.thumbKey) {
      const blob = await getMediaBlob(course.thumbKey).catch(() => null);
      if (blob) {
        course.thumbUrl = URL.createObjectURL(blob);
      }
    }
    for (const lesson of course.lessons) {
      if (lesson.videoKey) {
        const blob = await getMediaBlob(lesson.videoKey).catch(() => null);
        if (blob) {
          lesson.videoUrl = URL.createObjectURL(blob);
        }
      }
    }
  }

  localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(cachedCourses));
}

function getCurrentCourse() {
  if (!cachedCourses.length) return null;
  const publishedCourses = cachedCourses.filter(course => course.status === 'published');
  if (!publishedCourses.length) return null;
  const selected = publishedCourses.find(course => course.id === selectedCourseId) || publishedCourses[0];
  selectedCourseId = selected.id;
  return selected;
}

function getCurrentLesson(course) {
  if (!course || !Array.isArray(course.lessons) || !course.lessons.length) return null;
  const lesson = course.lessons.find(item => item.id === selectedLessonId);
  if (lesson) return lesson;
  const progress = getCourseProgress();
  const savedLessonId = progress?.[course.id]?.lastLessonId;
  if (savedLessonId) {
    const fromProgress = course.lessons.find(item => item.id === savedLessonId);
    if (fromProgress) {
      selectedLessonId = fromProgress.id;
      return fromProgress;
    }
  }
  selectedLessonId = course.lessons[0].id;
  return course.lessons[0];
}

function getCompletedLessons(course) {
  const progress = getCourseProgress();
  return new Set(progress?.[course.id]?.completedLessons || []);
}

function updateProgressBar(course) {
  const progress = getCourseProgress();
  const completed = getCompletedLessons(course).size;
  const total = course.lessons.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  const bar = document.getElementById('courseProgressBar');
  const text = document.getElementById('courseProgressText');
  if (bar) bar.style.width = `${percent}%`;
  if (text) text.textContent = `${percent}% complete`;
  if (progress?.[course.id]) {
    progress[course.id].completion = percent;
    saveCourseProgress(progress);
  }
}

function updateHeroMetrics() {
  const published = cachedCourses.filter(course => course.status === 'published').length;
  const upcoming = cachedCourses.filter(course => course.status === 'upcoming').length;
  const lessonCount = cachedCourses.reduce((total, course) => total + (Array.isArray(course.lessons) ? course.lessons.length : 0), 0);
  document.getElementById('courseCount').textContent = published;
  document.getElementById('lessonCount').textContent = lessonCount;
  document.getElementById('upcomingCount').textContent = upcoming;
}

function renderUpcomingCourses() {
  const section = document.getElementById('upcomingCoursesSection');
  const list = document.getElementById('upcomingCourseList');
  const upcoming = cachedCourses.filter(course => course.status === 'upcoming');
  if (!section || !list) return;
  if (!upcoming.length) {
    section.classList.add('hidden');
    return;
  }
  section.classList.remove('hidden');

  // Category → { gradient, icon } so every course card gets a distinct, colorful thumbnail
  const THEME_BY_CATEGORY = {
    'Data Science': { gradient: 'linear-gradient(135deg,#f5576c,#f093fb)', icon: 'fa-chart-line' },
    'Python':        { gradient: 'linear-gradient(135deg,#4b8bbe,#ffd43b)', icon: 'fa-brands fa-python' },
    'Web Development': { gradient: 'linear-gradient(135deg,#00c6ff,#0072ff)', icon: 'fa-code' },
    'Machine Learning': { gradient: 'linear-gradient(135deg,#a18cd1,#fbc2eb)', icon: 'fa-brain' },
    'default':       { gradient: 'linear-gradient(135deg,#43cea2,#185a9d)', icon: 'fa-graduation-cap' },
  };

  list.innerHTML = upcoming.map(course => {
    const theme = THEME_BY_CATEGORY[course.category] || THEME_BY_CATEGORY.default;
    const lessonCount = Array.isArray(course.lessons) ? course.lessons.length : 0;
    return `
    <article class="upcoming-card">
      <div class="upcoming-thumb" style="background:${theme.gradient}">
        <span class="upcoming-soon-badge">Coming Soon</span>
        <i class="fa-solid ${theme.icon}"></i>
      </div>
      <div class="upcoming-card-body">
        <p class="eyebrow">${course.category || 'Coming soon'}</p>
        <h4>${course.title}</h4>
        <p>${course.description}</p>
        <span class="course-badge">${lessonCount} lesson${lessonCount === 1 ? '' : 's'}</span>
      </div>
    </article>
  `;
  }).join('');
}

function renderModuleList(course) {
  const container = document.getElementById('moduleList');
  if (!container) return;
  const completed = getCompletedLessons(course);
  const query = currentSearchValue.trim().toLowerCase();
  const content = course.modules.map(module => {
    const visibleLessons = (module.lessons || []).filter(lesson => {
      const text = `${lesson.title} ${lesson.duration || ''}`.toLowerCase();
      return !query || text.includes(query);
    });
    if (!visibleLessons.length) return '';
    const collapsed = collapsedModules.has(module.id);
    return `
      <div class="module-group ${collapsed ? 'is-collapsed' : ''}">
        <button type="button" class="module-toggle" data-module-id="${module.id}" aria-expanded="${collapsed ? 'false' : 'true'}">
          <strong>${module.title}</strong>
          <span class="course-badge">${visibleLessons.length}</span>
        </button>
        <div class="module-lessons">
          ${visibleLessons.map(lesson => `
            <button type="button" class="lesson-button ${lesson.id === selectedLessonId ? 'active' : ''} ${completed.has(lesson.id) ? 'complete' : ''}" data-lesson-id="${lesson.id}">
              <span class="lesson-info">
                ${completed.has(lesson.id) ? '<span class="lesson-check">✓</span>' : '<span class="lesson-check"></span>'}
                <span class="lesson-title">${lesson.title}</span>
              </span>
              <span class="lesson-duration">${lesson.duration || '0 min'}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
  container.innerHTML = content || '<p class="course-description">No lessons match your search.</p>';
}

function getLessonNotesKey(courseId, lessonId) {
  return `siam_course_notes_${courseId}_${lessonId}`;
}

function getLessonPlaybackKey(courseId, lessonId) {
  return `siam_course_playback_${courseId}_${lessonId}`;
}

function saveLessonNotes(course, lesson, notes) {
  if (!course || !lesson) return;
  activeLessonNotes = notes;
  localStorage.setItem(getLessonNotesKey(course.id, lesson.id), notes);
}

function loadLessonNotes(course, lesson) {
  if (!course || !lesson) return '';
  const notes = localStorage.getItem(getLessonNotesKey(course.id, lesson.id)) || '';
  activeLessonNotes = notes;
  return notes;
}

function renderCourseDetail(course) {
  activeCourse = course;
  const lesson = getCurrentLesson(course);
  if (!lesson) {
    document.getElementById('courseProgressText').textContent = 'No lessons';
    return;
  }

  const video = document.getElementById('courseVideo');
  const placeholder = document.getElementById('videoPlaceholder');
  const skeleton = document.getElementById('videoSkeleton');
  const currentLessonTitle = document.getElementById('currentLessonTitle');
  const currentLessonMeta = document.getElementById('currentLessonMeta');
  const currentLessonDuration = document.getElementById('currentLessonDuration');
  const currentLessonStatus = document.getElementById('currentLessonStatus');
  const currentLessonDescription = document.getElementById('currentLessonDescription');
  const lessonNotesInput = document.getElementById('lessonNotesInput');
  const lessonResources = document.getElementById('lessonResources');
  const totalLessonsBadge = document.getElementById('totalLessonsBadge');
  const totalDurationBadge = document.getElementById('totalDurationBadge');
  const sidebarCourseTitle = document.getElementById('sidebarCourseTitle');

  if (sidebarCourseTitle) sidebarCourseTitle.textContent = course.title;
  if (totalLessonsBadge) totalLessonsBadge.textContent = `${course.lessons.length} lessons`;
  const totalDuration = course.lessons.reduce((sum, item) => sum + (parseInt(String(item.duration).match(/\d+/)?.[0] || '0', 10)), 0);
  if (totalDurationBadge) totalDurationBadge.textContent = `${totalDuration} min`;

  if (currentLessonTitle) currentLessonTitle.textContent = lesson.title;
  if (currentLessonMeta) currentLessonMeta.textContent = course.title;
  if (currentLessonDuration) currentLessonDuration.textContent = lesson.duration || '0 min';
  if (currentLessonStatus) currentLessonStatus.textContent = getCompletedLessons(course).has(lesson.id) ? 'Completed' : 'Queued';
  if (currentLessonDescription) currentLessonDescription.textContent = lesson.notes || course.description;
  if (lessonNotesInput) {
    lessonNotesInput.value = loadLessonNotes(course, lesson);
    lessonNotesInput.placeholder = lesson.notes ? `Notes for ${lesson.title}` : 'Capture key ideas, reminders, and setup steps...';
  }
  if (lessonResources) {
    const resources = Array.isArray(lesson.resources) && lesson.resources.length ? lesson.resources : ['Practice prompt', 'Supplementary guide'];
    // Build resource list with download links where possible
    lessonResources.innerHTML = '';
    resources.forEach(res => {
      const li = document.createElement('li');
      if (typeof res === 'string' && /^(https?:\/\/)/i.test(res)) {
        const a = document.createElement('a');
        a.href = res;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = res.split('/').pop() || res;
        a.setAttribute('aria-label', `Open resource ${a.textContent}`);
        li.appendChild(a);
      } else if (typeof res === 'string' && /\.(pdf|zip|py|js|txt)$/i.test(res)) {
        // treat as filename placeholder: create downloadable blob with placeholder content
        const blob = new Blob([`Resource: ${res}\n\nThis is a placeholder file generated by CodeWithSiam.`], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = res;
        a.textContent = res;
        a.setAttribute('aria-label', `Download ${res}`);
        li.appendChild(a);
      } else {
        const span = document.createElement('span');
        span.textContent = res;
        li.appendChild(span);
      }
      lessonResources.appendChild(li);
    });
  }

  if (video) {
    const src = lesson.videoUrl || course.videoUrl || '';
    const ytFrame = document.getElementById('courseYoutubeFrame');
    const videoControls = document.getElementById('videoControls');
    const ytEmbed = getYoutubeEmbedUrl(src);

    if (ytEmbed) {
      // YouTube link: show the iframe, hide the native player + custom controls
      video.removeAttribute('src');
      video.load();
      video.classList.add('hidden');
      videoControls?.classList.add('hidden');
      if (ytFrame) {
        ytFrame.src = ytEmbed;
        ytFrame.classList.remove('hidden');
      }
      skeleton?.classList.add('hidden');
      placeholder?.classList.add('hidden');
    } else if (src) {
      video.classList.remove('hidden');
      videoControls?.classList.remove('hidden');
      if (ytFrame) { ytFrame.classList.add('hidden'); ytFrame.src = ''; }
      video.src = src;
      video.load();
      skeleton?.classList.remove('hidden');
      placeholder?.classList.add('hidden');
    } else {
      video.classList.remove('hidden');
      videoControls?.classList.remove('hidden');
      if (ytFrame) { ytFrame.classList.add('hidden'); ytFrame.src = ''; }
      video.removeAttribute('src');
      video.load();
      skeleton?.classList.add('hidden');
      placeholder?.classList.remove('hidden');
    }
  }

  // Restore saved playback rate for this lesson (persist per-lesson)
  try {
    const savedRate = parseFloat(localStorage.getItem(getLessonPlaybackKey(course.id, lesson.id)) || '1');
    if (video && Number.isFinite(savedRate) && savedRate > 0) {
      video.playbackRate = savedRate;
      const speedSelect = document.getElementById('speedSelect');
      if (speedSelect) speedSelect.value = String(savedRate);
    }
  } catch (e) {
    // ignore
  }

  const progress = getCourseProgress();
  if (progress?.[course.id]?.lessonProgress?.[lesson.id]) {
    if (video && !Number.isNaN(progress[course.id].lessonProgress[lesson.id])) {
      video.currentTime = progress[course.id].lessonProgress[lesson.id];
    }
  }

  saveCourseProgress({
    ...progress,
    [course.id]: {
      ...(progress[course.id] || {}),
      lastLessonId: lesson.id,
      lastUpdated: Date.now()
    }
  });

  updateProgressBar(course);
  renderModuleList(course);
}

function saveLessonProgress(course, lesson, time = 0) {
  const progress = getCourseProgress();
  const courseProgress = progress[course.id] || {};
  progress[course.id] = {
    ...courseProgress,
    lastLessonId: lesson.id,
    lastUpdated: Date.now(),
    lessonProgress: {
      ...(courseProgress.lessonProgress || {}),
      [lesson.id]: time
    }
  };
  saveCourseProgress(progress);
}

function toggleLessonComplete(course, lesson) {
  const progress = getCourseProgress();
  const courseProgress = progress[course.id] || {};
  const completed = new Set(courseProgress.completedLessons || []);
  if (completed.has(lesson.id)) {
    completed.delete(lesson.id);
  } else {
    completed.add(lesson.id);
  }
  progress[course.id] = {
    ...courseProgress,
    completedLessons: Array.from(completed),
    lastLessonId: lesson.id,
    lastUpdated: Date.now()
  };
  saveCourseProgress(progress);
  updateProgressBar(course);
  renderModuleList(course);
  document.getElementById('currentLessonStatus').textContent = completed.has(lesson.id) ? 'Completed' : 'Queued';
}

function switchLesson(course, direction) {
  const lessons = Array.isArray(course.lessons) ? course.lessons : [];
  if (!lessons.length) return;
  const currentIndex = lessons.findIndex(lesson => lesson.id === selectedLessonId);
  const nextIndex = direction === 'next' ? Math.min(lessons.length - 1, currentIndex + 1) : Math.max(0, currentIndex - 1);
  selectedLessonId = lessons[nextIndex].id;
  renderCourseDetail(course);
}

function handleVideoEnded(course) {
  const lessons = Array.isArray(course.lessons) ? course.lessons : [];
  if (!lessons.length) return;
  const currentIndex = lessons.findIndex(lesson => lesson.id === selectedLessonId);
  if (currentIndex < lessons.length - 1) {
    selectedLessonId = lessons[currentIndex + 1].id;
    renderCourseDetail(course);
    const video = document.getElementById('courseVideo');
    if (video) video.play().catch(() => {});
  }
}

function attachCourseEvents(course) {
  const searchInput = document.getElementById('lessonSearch');
  const prevBtn = document.getElementById('prevLessonBtn');
  const nextBtn = document.getElementById('nextLessonBtn');
  const completeBtn = document.getElementById('markCompleteBtn');
  const restartBtn = document.getElementById('restartLessonBtn');
  const speedSelect = document.getElementById('speedSelect');
  const pipBtn = document.getElementById('pipBtn');
  const video = document.getElementById('courseVideo');
  const playPauseBtn = document.getElementById('videoPlayPauseBtn');
  const progressTrack = document.getElementById('videoProgressTrack');
  const progressFill = document.getElementById('videoProgressFill');
  const timeLabel = document.getElementById('videoTimeLabel');
  const muteBtn = document.getElementById('videoMuteBtn');
  const fullscreenBtn = document.getElementById('videoFullscreenBtn');
  const notesInput = document.getElementById('lessonNotesInput');

  searchInput?.addEventListener('input', event => {
    currentSearchValue = event.target.value;
    renderModuleList(course);
  });

  prevBtn?.addEventListener('click', () => switchLesson(course, 'prev'));
  nextBtn?.addEventListener('click', () => switchLesson(course, 'next'));
  completeBtn?.addEventListener('click', () => toggleLessonComplete(course, getCurrentLesson(course)));
  restartBtn?.addEventListener('click', () => {
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  });
  speedSelect?.addEventListener('change', event => {
    if (video) {
      const r = Number(event.target.value);
      video.playbackRate = r;
      try { localStorage.setItem(getLessonPlaybackKey(course.id, getCurrentLesson(course).id), String(r)); } catch(e){}
    }
  });
  pipBtn?.addEventListener('click', async () => {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture().catch(() => {});
    } else if (video && typeof video.requestPictureInPicture === 'function') {
      await video.requestPictureInPicture().catch(() => {});
    }
  });
  notesInput?.addEventListener('input', event => {
    const lesson = getCurrentLesson(course);
    saveLessonNotes(course, lesson, event.target.value);
  });

  function updateVideoUI() {
    if (!video) return;
    const ratio = video.duration ? video.currentTime / video.duration : 0;
    if (progressFill) progressFill.style.width = `${Math.min(100, ratio * 100)}%`;
    if (timeLabel) timeLabel.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
    if (playPauseBtn) {
      const icon = playPauseBtn.querySelector('i');
      if (icon) {
        icon.className = video.paused ? 'fa-solid fa-play' : 'fa-solid fa-pause';
      }
    }
  }

  function formatTime(value) {
    if (!Number.isFinite(value) || value < 0) return '0:00';
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  video?.addEventListener('loadedmetadata', updateVideoUI);
  video?.addEventListener('timeupdate', () => {
    updateVideoUI();
    const lesson = getCurrentLesson(course);
    if (lesson && video.currentTime > 1) {
      // throttle saves to reduce DOM/storage churn
      const progressKey = `__lastSave_${course.id}_${lesson.id}`;
      const last = Number(sessionStorage.getItem(progressKey) || '0');
      const now = Date.now();
      if (!last || (now - last) > 2000) {
        saveLessonProgress(course, lesson, video.currentTime);
        sessionStorage.setItem(progressKey, String(now));
      }
    }
  });
  video?.addEventListener('play', updateVideoUI);
  video?.addEventListener('pause', updateVideoUI);
  video?.addEventListener('ended', () => handleVideoEnded(course));
  video?.addEventListener('volumechange', () => {
    if (muteBtn) {
      const icon = muteBtn.querySelector('i');
      if (icon) icon.className = video.muted || video.volume === 0 ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
    }
  });

  playPauseBtn?.addEventListener('click', () => {
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
  progressTrack?.addEventListener('click', event => {
    if (!video || !Number.isFinite(video.duration)) return;
    const rect = progressTrack.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    video.currentTime = Math.max(0, Math.min(video.duration, ratio * video.duration));
  });
  progressTrack?.addEventListener('keydown', event => {
    if (!video) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      video.currentTime = Math.min(video.duration || 0, video.currentTime + 5);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      video.currentTime = Math.max(0, video.currentTime - 5);
    }
  });
  muteBtn?.addEventListener('click', () => {
    if (!video) return;
    video.muted = !video.muted;
  });
  fullscreenBtn?.addEventListener('click', async () => {
    if (!video) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
    } else {
      await video.requestFullscreen().catch(() => {});
    }
  });

  document.addEventListener('keydown', event => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    const key = event.key;
    // Global player shortcuts when video is present
    if (!video) return;
    switch (key) {
      case ' ':
      case 'Spacebar': // legacy
        event.preventDefault();
        video.paused ? video.play().catch(() => {}) : video.pause();
        break;
      case 'k':
      case 'K':
        event.preventDefault();
        video.paused ? video.play().catch(() => {}) : video.pause();
        break;
      case 'ArrowRight':
        event.preventDefault();
        video.currentTime = Math.min(video.duration || 0, video.currentTime + 5);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        video.currentTime = Math.max(0, video.currentTime - 5);
        break;
      case '.': // increase speed
        event.preventDefault();
        video.playbackRate = Math.min(2, +(video.playbackRate + 0.25).toFixed(2));
        speedSelect && (speedSelect.value = String(video.playbackRate));
        try { localStorage.setItem(getLessonPlaybackKey(course.id, getCurrentLesson(course).id), String(video.playbackRate)); } catch(e){}
        break;
      case ',': // decrease speed
        event.preventDefault();
        video.playbackRate = Math.max(0.5, +(video.playbackRate - 0.25).toFixed(2));
        speedSelect && (speedSelect.value = String(video.playbackRate));
        try { localStorage.setItem(getLessonPlaybackKey(course.id, getCurrentLesson(course).id), String(video.playbackRate)); } catch(e){}
        break;
      case 'f':
      case 'F':
        event.preventDefault();
        if (document.fullscreenElement) { document.exitFullscreen().catch(()=>{}); } else { video.requestFullscreen().catch(()=>{}); }
        break;
      case 'p':
      case 'P':
        event.preventDefault();
        if (document.pictureInPictureElement) { document.exitPictureInPicture().catch(()=>{}); }
        else if (video && typeof video.requestPictureInPicture === 'function') { video.requestPictureInPicture().catch(()=>{}); }
        break;
      case 'n':
      case 'N':
        event.preventDefault();
        switchLesson(course, 'next');
        break;
      case 'b':
      case 'B':
        event.preventDefault();
        switchLesson(course, 'prev');
        break;
      default:
        break;
    }
  });

  document.getElementById('moduleList')?.addEventListener('click', event => {
    const moduleToggle = event.target.closest('.module-toggle');
    if (moduleToggle) {
      const moduleId = moduleToggle.dataset.moduleId;
      if (collapsedModules.has(moduleId)) {
        collapsedModules.delete(moduleId);
      } else {
        collapsedModules.add(moduleId);
      }
      renderModuleList(course);
      return;
    }

    const button = event.target.closest('.lesson-button');
    if (!button) return;
    selectedLessonId = button.dataset.lessonId;
    renderCourseDetail(course);
  });
}

async function initCoursePlatform() {
  const platform = document.getElementById('coursePlatform');
  const loading = document.getElementById('courseLoadingState');
  const empty = document.getElementById('courseEmptyState');
  const continueBtn = document.getElementById('continueLearningHeroBtn');
  const continueBtn2 = document.getElementById('continueLearningBtn');
  if (!platform) return;

  loading?.classList.remove('hidden');
  platform.classList.add('hidden');
  empty?.classList.add('hidden');

  await loadCourses();
  updateHeroMetrics();
  renderUpcomingCourses();

  const course = getCurrentCourse();
  if (!course) {
    loading?.classList.add('hidden');
    empty?.classList.remove('hidden');
    return;
  }

  if (!coursePlatformInitialized) {
    attachCourseEvents(course);
    coursePlatformInitialized = true;
  }

  const progress = getCourseProgress();
  if (progress?.[course.id]?.lastLessonId) {
    selectedLessonId = progress[course.id].lastLessonId;
  }

  renderCourseDetail(course);
  updateProgressBar(course);
  loading?.classList.add('hidden');
  platform.classList.remove('hidden');

  if (continueBtn) {
    continueBtn.textContent = progress?.[course.id]?.lastLessonId ? 'Continue Learning' : 'Start Learning';
  }
  if (continueBtn2) {
    continueBtn2.textContent = progress?.[course.id]?.lastLessonId ? 'Continue Learning' : 'Start Learning';
  }
}

async function initCourseDeck(){
  await initCoursePlatform();
}

/* If already unlocked this session on load */
document.addEventListener('DOMContentLoaded', () => {
  const unlocked = sessionStorage.getItem('siam_unlocked') === '1' || localStorage.getItem('siam_unlocked_persist') === '1';
  if(unlocked){
    loadCourses()
      .then(() => initSiteEffects())
      .catch(error => {
        console.error('loadCourses() on DOMContentLoaded failed:', error);
        initSiteEffects();
      });
  }
  // ensure chat toggle is present even if not unlocked yet
  try { initChatToggle(); } catch(e){}
});

/* ---------- Ambient background dust (quiet, no connecting lines) ---------- */
function initParticles(){
  const canvas = document.getElementById('particles');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, dots;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = document.documentElement.scrollHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const count = Math.min(36, Math.floor(window.innerWidth/40));
  dots = Array.from({length: count}, () => ({
    x: Math.random()*w, y: Math.random()*h,
    vy: -(Math.random()*0.12 + 0.03),
    r: Math.random()*1.3+0.5
  }));

  function draw(){
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = 'rgba(255,212,59,0.28)';
    dots.forEach(p=>{
      p.y += p.vy;
      if(p.y < -10) p.y = h + 10;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
    });
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
let chatBotInitialized = false;
let chatToggleInitialized = false;

function initChatbot(){
  if (chatBotInitialized) return;
  chatBotInitialized = true;
  const input = document.getElementById('input');
  input?.addEventListener('keydown', e=>{ if(e.key==='Enter') sendMessage(); });

  initVoiceToggle();
  initMic();
}

/* ---------- Chat toggle (floating button) ---------- */
function initChatToggle(){
  if (chatToggleInitialized) return;
  const toggle = document.getElementById('chatToggleBtn');
  const chat = document.getElementById('siteChatbox') || document.querySelector('.chatbox');
  if(!toggle || !chat) return;

  function setOpen(open){
    chat.classList.toggle('active', open);
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    chat.setAttribute('aria-hidden', String(!open));
    if(open){
      // ensure chatbot subsystems are ready
      try { initChatbot(); } catch(e){}
      setTimeout(()=> document.getElementById('input')?.focus(), 180);
    } else {
      toggle.focus();
    }
  }

  toggle.addEventListener('click', ()=>{
    const isOpen = chat.classList.contains('active');
    setOpen(!isOpen);
  });

  // Close chat with Escape
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && chat.classList.contains('active')){
      setOpen(false);
    }
  });

  chatToggleInitialized = true;
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

/* ===== SIMPLE COURSE FIX ===== */

setTimeout(() => {

try {

const courses = JSON.parse(localStorage.getItem('siam_portfolio_admin_courses') || '[]');

if (courses.length > 0) {

cachedCourses = courses.map(normalizeCourse);

if (typeof renderCoursePlatform === 'function') {

renderCoursePlatform();

}

if (typeof renderUpcomingCourses === 'function') {

renderUpcomingCourses();

}

console.log('Courses loaded successfully');

} else {

console.log('No courses found in localStorage');

}

} catch (e) {

console.error(e);

}

}, 1000);