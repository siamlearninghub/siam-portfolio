/* ===== PARTICLE BACKGROUND ===== */
(function () {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.floor((canvas.width * canvas.height) / 18000);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.6 + 0.2
      });
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(56,189,248,${p.alpha})`;
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    });
    requestAnimationFrame(drawParticles);
  }

  window.addEventListener('resize', () => { resize(); createParticles(); });
  resize();
  createParticles();
  drawParticles();
})();

/* ===== TYPING EFFECT ===== */
(function () {
  const phrases = [
    'Future AI Engineer',
    'Data Scientist',
    'Python Developer 🐍',
    'Deep Learning Fan',
    'ML Researcher',
    'YouTuber & Educator'
  ];
  const el = document.getElementById('typed-text');
  let pi = 0, ci = 0, deleting = false;

  function type() {
    const current = phrases[pi];
    if (!deleting) {
      el.textContent = current.slice(0, ++ci);
      if (ci === current.length) {
        deleting = true;
        setTimeout(type, 1800);
        return;
      }
    } else {
      el.textContent = current.slice(0, --ci);
      if (ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
      }
    }
    setTimeout(type, deleting ? 55 : 90);
  }
  type();
})();

/* ===== SCROLL REVEAL ===== */
(function () {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* ===== ANIMATED COUNTERS ===== */
(function () {
  function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    let current = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current;
      if (current >= target) clearInterval(timer);
    }, 25);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.stat-num').forEach(animateCounter);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.container').forEach(el => observer.observe(el));
})();

/* ===== SKILL BAR ANIMATION ===== */
(function () {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.skill-fill').forEach(bar => {
          bar.style.width = bar.dataset.width + '%';
        });
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.skill-category').forEach(el => observer.observe(el));
})();

/* ===== STICKY HEADER SHADOW ===== */
window.addEventListener('scroll', () => {
  document.getElementById('header').classList.toggle('scrolled', window.scrollY > 20);
});

/* ===== MOBILE NAV ===== */
document.getElementById('menuBtn').addEventListener('click', () => {
  document.getElementById('nav').classList.toggle('open');
});

/* ===== CHATBOT ===== */
const responses = [
  {
    match: ['hello', 'hi', 'hey', 'sup'],
    reply: '👋 Hey there! I\'m Siam\'s AI assistant. Ask me about his Python projects, ML skills, or anything AI!'
  },
  {
    match: ['how are you', 'how r u'],
    reply: '😊 I\'m just Python code, but I\'m running perfectly! How can I help you today?'
  },
  {
    match: ['your name', 'who are you'],
    reply: '🤖 I\'m Siam\'s custom AI chatbot, built with vanilla JavaScript. Siam also builds real ML chatbots with Python and NLP!'
  },
  {
    match: ['project', 'built', 'portfolio'],
    reply: '🗂️ Siam has built 15+ Python projects including:\n• Image Classifier (92% acc, CNN)\n• Sentiment Analyzer (BERT + FastAPI)\n• House Price Predictor (XGBoost)\n• Digit Recognizer (99.1% acc, MNIST)\n• Text Generator (LSTM)\n• Data Dashboard (Dash + Plotly)'
  },
  {
    match: ['python', 'py'],
    reply: '🐍 Python is Siam\'s primary language! He uses it for ML, data science, web APIs, scripting, and automation. 5+ years of experience!'
  },
  {
    match: ['cnn', 'image', 'classifier', 'vision'],
    reply: '🖼️ Siam\'s CNN Image Classifier was trained on CIFAR-10 using TensorFlow/Keras. It achieves 92% accuracy and runs real-time inference via OpenCV webcam feed!'
  },
  {
    match: ['bert', 'nlp', 'sentiment', 'text'],
    reply: '💬 His Sentiment Analyzer uses a fine-tuned BERT model to classify Twitter text as positive/negative/neutral. It\'s served as a REST API using FastAPI!'
  },
  {
    match: ['machine learning', 'ml', 'learn ml', 'how to learn'],
    reply: '📚 To learn ML, Siam recommends:\n1. Python basics first\n2. NumPy & Pandas\n3. scikit-learn for classical ML\n4. TensorFlow/Keras for deep learning\n5. Build real projects!\n\nAlso check Siam\'s YouTube channel for tutorials!'
  },
  {
    match: ['tensorflow', 'keras', 'pytorch', 'deep learning'],
    reply: '🧠 Siam uses TensorFlow/Keras for most deep learning projects and PyTorch for research. He has built CNNs, RNNs, LSTMs, and GANs!'
  },
  {
    match: ['data science', 'data', 'pandas', 'numpy'],
    reply: '📊 Data is the foundation! Siam works with Pandas, NumPy, Matplotlib, Seaborn, and Plotly for analysis and visualisation. He\'s processed 10+ real datasets!'
  },
  {
    match: ['xgboost', 'regression', 'house', 'price'],
    reply: '🏠 The House Price Predictor uses XGBoost regression with a full feature engineering pipeline on the Kaggle dataset — achieving R² = 0.85!'
  },
  {
    match: ['youtube', 'channel', 'tutorials', 'video'],
    reply: '▶️ Siam runs the YouTube channel @SiamLearningHub where he shares Python, ML, and AI tutorials. Go check it out!'
  },
  {
    match: ['school', 'college', 'study', 'student', 'education', 'narsingdi'],
    reply: '🎓 Siam is currently a Class 11 student at Narsingdi Government College, Bangladesh — Science group. He started learning Python and AI alongside his studies and has already built 15+ real projects!'
  },
  {
    match: ['course', 'free course', 'python course', 'learn python', 'tutorial'],
    reply: '🐍 Siam is launching a FREE Python course — Beginner to Master! It will cover:\n• Python Basics\n• Data Science (NumPy, Pandas)\n• Machine Learning (scikit-learn)\n• Deep Learning (TensorFlow, Keras)\n\nSubscribe on YouTube @SiamLearningHub or message him on WhatsApp to get notified!'
  },
  {
    match: ['whatsapp', 'whats app', 'chat', 'message', 'wa'],
    reply: '💬 You can WhatsApp Siam directly at +880 1644171751\nClick the WhatsApp button in the Contact section!'
  },
  {
    match: ['contact', 'hire', 'email', 'reach'],
    reply: '📧 You can reach Siam at:\nmdsiamahmmedloselovestroy@gmail.com\n\n💬 WhatsApp: +880 1644171751\n\nOr connect on GitHub / YouTube via the Contact section!'
  },
  {
    match: ['bye', 'goodbye', 'cya', 'see you'],
    reply: '👋 Bye! Keep coding and stay curious — AI is the future! 🚀'
  }
];

function getBotReply(msg) {
  const lower = msg.toLowerCase();
  for (const r of responses) {
    if (r.match.some(kw => lower.includes(kw))) return r.reply;
  }
  return '🤖 Interesting question! Siam is still teaching me. Try asking about his projects, Python skills, ML models, or how to contact him!';
}

function appendMsg(text, type) {
  const chat = document.getElementById('chat');
  const div = document.createElement('div');
  div.className = 'msg ' + type;

  if (type === 'user-msg') {
    div.innerHTML = `<span class="avatar">👤</span><div class="bubble">${escapeHtml(text)}</div>`;
  } else {
    div.innerHTML = `<span class="avatar">🤖</span><div class="bubble">${escapeHtml(text).replace(/\n/g, '<br>')}</div>`;
  }

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function sendMessage() {
  const input = document.getElementById('input');
  const msg = input.value.trim();
  if (!msg) return;

  appendMsg(msg, 'user-msg');
  input.value = '';

  setTimeout(() => appendMsg(getBotReply(msg), 'bot-msg'), 400);
}

function quickAsk(question) {
  document.getElementById('input').value = question;
  sendMessage();
}

document.getElementById('input').addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});
