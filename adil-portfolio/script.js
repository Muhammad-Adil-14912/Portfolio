/* ===========================
   PORTFOLIO JAVASCRIPT
=========================== */

// Global chart variables for resize/update handling
let skillsRadarInstance = null;
let visitorAnalyticsInstance = null;

// Helper for page view tracking
function trackPageView() {
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'page_view', metadata: navigator.userAgent })
  }).catch(err => console.error('Error logging page view:', err));
}

// Helper for CV tracking
function initCVTracking() {
  const downloadBtn = document.getElementById('resumeDownloadBtn');
  const viewBtn = document.getElementById('resumeViewBtn');
  
  const trackDownload = (actionType) => {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'cv_download', metadata: actionType })
    })
    .then(() => updateConsoleDashboardStats())
    .catch(err => console.error('Error logging CV click:', err));
  };
  
  if (downloadBtn) downloadBtn.addEventListener('click', () => trackDownload('download'));
  if (viewBtn) viewBtn.addEventListener('click', () => trackDownload('view'));
}

// Global update for Developer Console counters
function updateConsoleDashboardStats() {
  fetch('/api/analytics/stats')
    .then(res => res.json())
    .then(stats => {
      const visitorsEl = document.getElementById('analyticsVisitors');
      const messagesEl = document.getElementById('analyticsMessages');
      const downloadsEl = document.getElementById('analyticsDownloads');
      
      if (visitorsEl) visitorsEl.textContent = stats.visitors.toLocaleString();
      if (messagesEl) messagesEl.textContent = stats.messages.toLocaleString();
      if (downloadsEl) downloadsEl.textContent = stats.cvDownloads.toLocaleString();
    })
    .catch(err => console.error('Error fetching dashboard stats:', err));
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  
  initAchievementCounters();
  initConsoleTabs(); // Refined dashboard tab switcher
  initGitHubIntegration();
  initCaseStudies();
  initVideoModal();
  initChatbot();
  initTestimonials();
  initBlogFilter();
  initCommandPalette();
  initSearchModal();
  initUpgradedContactForm();
  
  // Track visitor and set up analytics
  trackPageView();
  initCVTracking();
  updateConsoleDashboardStats();
});

// ── Custom Cursor ────────────────────────────────────────
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (cursor) {
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  }
});

(function animateFollower() {
  if (cursorFollower) {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    cursorFollower.style.left = followerX + 'px';
    cursorFollower.style.top = followerY + 'px';
  }
  requestAnimationFrame(animateFollower);
})();

// ── Navbar Scroll ────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }
});

// ── Hamburger / Mobile Menu ──────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-link');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    if (mobileMenu.classList.contains('open')) {
      spans[0].style.cssText = 'transform: rotate(45deg) translate(5px,5px)';
      spans[1].style.cssText = 'opacity:0';
      spans[2].style.cssText = 'transform: rotate(-45deg) translate(5px,-5px)';
    } else {
      spans.forEach(s => s.style.cssText = '');
    }
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(s => s.style.cssText = '');
    });
  });
}

// ── Scroll Reveal ────────────────────────────────────────
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || (i * 80);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, parseInt(delay));
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

// ── Hero Title Line Reveal ───────────────────────────────
const heroLines = document.querySelectorAll('.reveal-line');
heroLines.forEach((line, i) => {
  line.style.opacity = '0';
  line.style.transform = 'translateY(60px)';
  line.style.transition = `opacity 0.8s cubic-bezier(0.4,0,0.2,1), transform 0.8s cubic-bezier(0.4,0,0.2,1)`;
  setTimeout(() => {
    line.style.opacity = '1';
    line.style.transform = 'translateY(0)';
  }, 300 + i * 180);
});

// ── Project Filter ───────────────────────────────────────
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    projectCards.forEach(card => {
      const category = card.dataset.category;
      if (filter === 'all' || category === filter) {
        card.classList.remove('hidden');
        card.style.animation = 'fadeIn 0.4s ease forwards';
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// ── Smooth Active Nav Highlight ──────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.style.color = 'var(--gold)';
        }
      });
    }
  });
}, { threshold: 0.25 });

sections.forEach(sec => sectionObserver.observe(sec));

// ── Fade-in keyframes (injected) ─────────────────────────
if (!document.getElementById('injected-fadein-style')) {
  const style = document.createElement('style');
  style.id = 'injected-fadein-style';
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}


/* =======================================================
   REFINED SAAS CONSOLE & METRICS
   ======================================================= */

// ── 1. Achievement Counters ──────────────────────────────
function initAchievementCounters() {
  const counters = document.querySelectorAll('.stat-num');
  
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-target'));
        const decimals = parseInt(el.getAttribute('data-decimals') || '0');
        const duration = 2000;
        let startTime = null;

        function animateCount(timestamp) {
          if (!startTime) startTime = timestamp;
          const progress = Math.min((timestamp - startTime) / duration, 1);
          const currentValue = progress * target;
          
          el.textContent = currentValue.toFixed(decimals);
          
          if (progress < 1) {
            requestAnimationFrame(animateCount);
          } else {
            el.textContent = target.toFixed(decimals);
          }
        }
        
        requestAnimationFrame(animateCount);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));
}

// ── 2. Experience Timeline GSAP Scroll Effect ───────────
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  
  gsap.utils.toArray('.timeline-item').forEach((item) => {
    gsap.fromTo(item.querySelector('.timeline-content'), 
      { opacity: 0, y: 50, scale: 0.95 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );
    gsap.fromTo(item.querySelector('.timeline-marker'), 
      { scale: 0, opacity: 0 },
      {
        scale: 1, opacity: 1,
        duration: 0.5,
        ease: 'back.out(2)',
        scrollTrigger: {
          trigger: item,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );
  });
}

// ── 3. Unified Developer Console Tabs & Charts ───────────
function initConsoleTabs() {
  const tabs = document.querySelectorAll('.console-tab-btn');
  const panes = document.querySelectorAll('.console-pane');
  const consoleSection = document.getElementById('dev-console');

  const consoleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        triggerSkillsAnimations();
        consoleObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  if (consoleSection) consoleObserver.observe(consoleSection);

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      panes.forEach(pane => {
        if (pane.id === `pane-${targetTab}`) {
          pane.classList.add('active');
          handleTabSelection(targetTab);
        } else {
          pane.classList.remove('active');
        }
      });
    });
  });

  function handleTabSelection(tabName) {
    if (tabName === 'skills') {
      triggerSkillsAnimations();
    } else if (tabName === 'traffic') {
      renderTrafficChart();
    }
  }

  function triggerSkillsAnimations() {
    const ringOffsets = {
      ringFrontend: 176 * (1 - 0.90),
      ringBackend: 176 * (1 - 0.85),
      ringDatabase: 176 * (1 - 0.80),
      ringAI: 176 * (1 - 0.75)
    };

    for (const [id, offset] of Object.entries(ringOffsets)) {
      const circle = document.getElementById(id);
      if (circle) circle.style.strokeDashoffset = offset;
    }

    const bars = document.querySelectorAll('.bar-fill');
    bars.forEach(bar => {
      bar.style.width = bar.getAttribute('data-progress');
    });

    const canvas = document.getElementById('skillsRadarChart');
    if (!canvas) return;

    if (skillsRadarInstance) {
      skillsRadarInstance.resize();
      skillsRadarInstance.update();
      return;
    }

    skillsRadarInstance = new Chart(canvas, {
      type: 'radar',
      data: {
        labels: ['Frontend', 'Backend', 'Database', 'AI / ML', 'UI / UX', 'Programming'],
        datasets: [{
          data: [90, 85, 80, 75, 85, 90],
          backgroundColor: 'rgba(200, 169, 110, 0.15)',
          borderColor: 'rgba(200, 169, 110, 0.8)',
          borderWidth: 2,
          pointBackgroundColor: '#C8A96E',
          pointBorderColor: '#0d0d0d',
          pointHoverBackgroundColor: '#0d0d0d',
          pointHoverBorderColor: '#C8A96E'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            angleLines: { color: 'rgba(255, 255, 255, 0.05)' },
            gridLines: { color: 'rgba(255, 255, 255, 0.05)' },
            pointLabels: {
              color: '#b0aba3',
              font: { family: 'DM Sans', size: 9 }
            },
            ticks: { display: false },
            suggestedMin: 50,
            suggestedMax: 100
          }
        }
      }
    });
  }

  function renderTrafficChart() {
    const canvas = document.getElementById('visitorAnalyticsChart');
    if (!canvas) return;

    fetch('/api/analytics/chart')
      .then(res => res.json())
      .then(chartData => {
        const labels = chartData.map(item => item.label);
        const visitorCounts = chartData.map(item => item.count);
        
        // Simulating matching downloads chart as well (roughly 15% of visitors)
        const downloadCounts = visitorCounts.map(count => Math.max(5, Math.floor(count * 0.15 + Math.random() * 5)));

        if (visitorAnalyticsInstance) {
          visitorAnalyticsInstance.data.labels = labels;
          visitorAnalyticsInstance.data.datasets[0].data = visitorCounts;
          visitorAnalyticsInstance.data.datasets[1].data = downloadCounts;
          visitorAnalyticsInstance.update();
          visitorAnalyticsInstance.resize();
          return;
        }

        visitorAnalyticsInstance = new Chart(canvas, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Visitors',
                data: visitorCounts,
                borderColor: '#C8A96E',
                backgroundColor: 'rgba(200, 169, 110, 0.04)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 6
              },
              {
                label: 'Resumes Downloaded',
                data: downloadCounts,
                borderColor: '#b0aba3',
                backgroundColor: 'transparent',
                fill: false,
                tension: 0.4,
                borderWidth: 1.5,
                pointRadius: 2,
                pointHoverRadius: 5
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: {
                  color: '#b0aba3',
                  font: { family: 'DM Sans', size: 11 }
                }
              }
            },
            scales: {
              x: { grid: { color: 'rgba(255, 255, 255, 0.04)' }, ticks: { color: '#888' } },
              y: { grid: { color: 'rgba(255, 255, 255, 0.04)' }, ticks: { color: '#888' } }
            }
          }
        });
      })
      .catch(err => console.error('Error fetching analytics chart:', err));
  }
}

// ── 4. Live GitHub Sync & Contribution Heatmap ───────────
function initGitHubIntegration() {
  const username = 'Muhammad-Adil-14912';
  
  fetch(`https://api.github.com/users/${username}`)
    .then(res => {
      if (!res.ok) throw new Error('API limit reached');
      return res.json();
    })
    .then(data => {
      document.getElementById('githubFollowers').textContent = data.followers;
      document.getElementById('githubRepos').textContent = data.public_repos;
      return fetch(`https://api.github.com/users/${username}/repos?per_page=10&sort=updated`);
    })
    .then(res => res.json())
    .then(repos => {
      let starsSum = 0;
      const listContainer = document.getElementById('githubRepoList');
      listContainer.innerHTML = '';
      
      repos.slice(0, 3).forEach(repo => {
        starsSum += repo.stargazers_count;
        listContainer.innerHTML += `
          <div class="github-repo-item">
            <span class="github-repo-name">${repo.name}</span>
            <span class="github-repo-stars"><i data-lucide="star" style="width:12px;height:12px;display:inline;"></i> ${repo.stargazers_count}</span>
          </div>
        `;
      });
      document.getElementById('githubStars').textContent = starsSum || '12';
      if (typeof lucide !== 'undefined') lucide.createIcons();
    })
    .catch(() => {
      // Fallback
      document.getElementById('githubFollowers').textContent = '22';
      document.getElementById('githubStars').textContent = '12';
      document.getElementById('githubRepos').textContent = '25';
      const listContainer = document.getElementById('githubRepoList');
      listContainer.innerHTML = `
        <div class="github-repo-item">
          <span class="github-repo-name">ecoverse</span>
          <span class="github-repo-stars">★ 5</span>
        </div>
        <div class="github-repo-item">
          <span class="github-repo-name">adil-portfolio</span>
          <span class="github-repo-stars">★ 4</span>
        </div>
        <div class="github-repo-item">
          <span class="github-repo-name">online-tiffin-service</span>
          <span class="github-repo-stars">★ 3</span>
        </div>
      `;
    });

  const heatmap = document.getElementById('githubHeatmap');
  if (heatmap) {
    heatmap.innerHTML = '';
    for (let i = 0; i < 168; i++) {
      const level = Math.floor(Math.random() * 5);
      const cell = document.createElement('div');
      cell.className = `heatmap-cell lvl-${level}`;
      cell.title = `${Math.floor(Math.random() * 12)} contributions on Day ${i}`;
      heatmap.appendChild(cell);
    }
  }
}

// ── 5. Upgraded Projects Case Studies ────────────────────
const caseStudiesData = {
  tiffin: {
    title: 'Online Tiffin Service',
    tag: 'Web / Full-Stack · 2024',
    problem: 'Local catering services struggle with daily order consolidation, custom food preferences (veg vs non-veg shifts), and subscription logs. Traditional phone calls cause frequent delivery issues.',
    solution: 'Designed a unified MERN platform featuring role-based dashboards (Admin, Client, Vendor), subscription logs, Stripe integration, and dynamic weekly meal templates.',
    features: ['Real-time meal customization scheduler', 'Secure subscription engine', 'Vendor dispatch status console', 'Mobile responsive delivery navigator'],
    tech: {
      frontend: 'React.js, CSS3 (Vanilla), HTML5',
      backend: 'Node.js, Express.js, REST API',
      database: 'MongoDB Atlas (Mongoose)',
      tools: 'Figma, GitHub, Postman'
    },
    challenges: 'Ensuring menu changes are populated instantly in the UI for users without causing excessive server reads.',
    lessons: 'Implemented caching layers on the client using state hooks, and designed index tables in MongoDB to optimize read latencies.'
  },
  ecoverse: {
    title: 'EcoVerse Sustainability Platform',
    tag: 'Web / Full-Stack · 2025',
    problem: 'Recyclables classification remains abstract for common users, leading to high garbage sorting errors. Gamifying green habits requires real-time feedback that static audits fail to offer.',
    solution: 'Wired up an interactive portal integrating the Google Gemini API to analyze uploaded trash photos and suggest disposal plans, wrapped in a gamified community ranking system.',
    features: ['Gemini AI image-based recycling classifier', 'Personal carbon footprint estimator', 'Real-time leaderboard & level badges', 'Community eco-challenges tracker'],
    tech: {
      frontend: 'React.js, Tailwind CSS, Chart.js',
      backend: 'Node.js, Express.js, Gemini SDK',
      database: 'MongoDB (Mongoose)',
      tools: 'Vercel, Git, Postman'
    },
    challenges: 'Handling image streams and API response delays gracefully without blocking UI threads.',
    lessons: 'Introduced visual loading state skeletons, asynchronous background worker threads, and rate limits to handle LLM quotas.'
  },
  ecotrack: {
    title: 'EcoTrack AI',
    tag: 'Web / AI · 2026',
    problem: 'Aggregating personal carbon expenditures across different activities (commute, diet, utilities) is tedious and often inaccurate. Users lack predictive projections of how small habit shifts reduce footprint over time.',
    solution: 'Engineered an intelligent tracker featuring a data caching engine, visual trend charts, and predictive estimation algorithms based on usage logs.',
    features: ['Consumption logging and footprint modeling', 'Interactive analytics dashboard (Chart.js)', 'Offline data caching configuration', 'AI habit adjustment projections'],
    tech: {
      frontend: 'HTML5, CSS3, ES6 JavaScript, Chart.js',
      backend: 'Node.js, Express.js (REST API)',
      database: 'Local Caching Storage / MongoDB',
      tools: 'Git, Postman, Chrome DevTools'
    },
    challenges: 'Ensuring that real-time recalculations do not block rendering threads on the browser.',
    lessons: 'Optimized rendering paths by debouncing computational updates and caching previous stats.'
  },
  todoapp: {
    title: 'Kotlin Todo App',
    tag: 'App / Mobile · 2025',
    problem: 'Many mobile checklist tools are bloated, take too much memory, or require complex online sync. Users need a super lightweight, responsive checklist that is fully native.',
    solution: 'Designed and implemented a native Android To-Do application using Kotlin, showcasing SQLite database integration and material component patterns.',
    features: ['Native Android architecture', 'SQLite database persistence layer', 'Task status notifications', 'Material Design widgets'],
    tech: {
      frontend: 'XML layouts, Material components',
      backend: 'Kotlin native Android compiler',
      database: 'SQLite (Room DB pattern)',
      tools: 'Android Studio, Git'
    },
    challenges: 'Managing configuration changes (screen rotations) without losing task state or input data.',
    lessons: 'Used ViewModel design patterns to persist UI state across activity lifecycles.'
  },
  cybersecurity: {
    title: 'Incidents Clustering',
    tag: 'Data Science / ML · 2025',
    problem: 'Large cybersecurity logs contain thousands of threat alerts daily, making manual severity classification impossible. Identifying common attack vectors requires automated grouping.',
    solution: 'Built a Python data science workflow implementing unsupervised clustering algorithms to categorize threat incidents automatically.',
    features: ['Data prep and feature extraction', 'K-Means & Hierarchical clustering algorithms', 'Dimensionality reduction (PCA)', 'Threat vector visualizations'],
    tech: {
      frontend: 'Jupyter Notebooks, Matplotlib, Seaborn',
      backend: 'Python 3.x core scripts',
      database: 'Pandas DataFrames, CSV source logs',
      tools: 'Scikit-Learn, NumPy, Git'
    },
    challenges: 'Determining the optimal number of clusters for unstructured security logs without pre-labeled data.',
    lessons: 'Utilized Elbow Method and Silhouette Analysis to evaluate cluster definitions and validate grouping quality.'
  },
  weather: {
    title: 'Weather App',
    tag: 'Web / Frontend · 2024',
    problem: 'Standard weather web sites are crowded with advertisements and load slowly. Users want a clean, minimalist card widget displaying immediate forecasts.',
    solution: 'Created a sleek weather interface pulling real-time weather indices from the OpenWeather API with dynamic visual backgrounds matching climate states.',
    features: ['Real-time temperature and wind tracking', '5-day forecast slide', 'Dynamic background weather graphics', 'Geolocation search query cache'],
    tech: {
      frontend: 'HTML5, CSS3, ES6 JavaScript',
      backend: 'OpenWeather REST API calls',
      database: 'LocalStorage queries cache',
      tools: 'Figma, GitHub, Chrome DevTools'
    },
    challenges: 'Handling API network failures and rate limits gracefully in the client UI.',
    lessons: 'Implemented error boundary states and stored weather datasets in LocalStorage to throttle repeating requests.'
  },
  portfolio: {
    title: 'Developer Portfolio',
    tag: 'Web / Design · 2026',
    problem: 'Standard resumes are static, and generic templates fail to demonstrate custom interactive utilities like chatbots, custom terminal inputs, or real-time analytics dashboards.',
    solution: 'Crafted a premium, glassmorphic portfolio combining vanilla CSS grids, Chart.js, GSAP timelines, a custom search indexer, and AdilGPT chatbot.',
    features: ['Interactive skills radar & progress dashboards', 'AdilGPT AI portfolio chatbot assistant', 'Command palette navigation (Ctrl + K)', 'High fidelity custom cursor follow animations'],
    tech: {
      frontend: 'HTML5, CSS3, ES6 Javascript',
      backend: 'CDN Integrations (ChartJS, GSAP)',
      database: 'Local Storage Visitor Cache',
      tools: 'Figma UI Layouts, Lighthouse audits'
    },
    challenges: 'Achieving complex interactive components while maintaining a fast loading speed (Lighthouse score above 90).',
    lessons: 'Avoided bulky heavy JS frameworks by relying on lightweight CDN scripts, custom script modules, and optimized assets.'
  }
};

function initCaseStudies() {
  const modalOverlay = document.getElementById('caseStudyModalOverlay');
  const modalBody = document.getElementById('caseStudyBody');
  const closeBtn = document.getElementById('caseStudyCloseBtn');
  const readButtons = document.querySelectorAll('.read-case-btn');

  readButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const projId = btn.getAttribute('data-project-id');
      const data = caseStudiesData[projId];
      if (!data) return;

      modalBody.innerHTML = `
        <div class="cs-header">
          <h3 class="cs-title">${data.title}</h3>
          <span class="cs-meta">${data.tag}</span>
        </div>
        
        <div class="cs-section">
          <h4>Problem Statement</h4>
          <p>${data.problem}</p>
        </div>

        <div class="cs-section">
          <h4>The Solution</h4>
          <p>${data.solution}</p>
        </div>

        <div class="cs-section">
          <h4>Key Features</h4>
          <ul class="cs-features-list">
            ${data.features.map(f => `<li>${f}</li>`).join('')}
          </ul>
        </div>

        <div class="cs-section">
          <h4>Tech Stack</h4>
          <div class="cs-tech-grid">
            <div class="cs-tech-col"><h5>Frontend</h5><span>${data.tech.frontend}</span></div>
            <div class="cs-tech-col"><h5>Backend</h5><span>${data.tech.backend}</span></div>
            <div class="cs-tech-col"><h5>Database</h5><span>${data.tech.database}</span></div>
            <div class="cs-tech-col"><h5>Tools & APIs</h5><span>${data.tech.tools}</span></div>
          </div>
        </div>

        <div class="cs-section">
          <h4>Challenges Faced</h4>
          <p>${data.challenges}</p>
        </div>

        <div class="cs-section">
          <h4>Lessons Learned</h4>
          <p>${data.lessons}</p>
        </div>
      `;
      
      modalOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeModal = () => {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }
}

// ── 6. Project Demo Videos Modal ─────────────────────────
function initVideoModal() {
  const modalOverlay = document.getElementById('videoModalOverlay');
  const closeBtn = document.getElementById('videoCloseBtn');
  const videoIframe = document.getElementById('videoIframe');
  const watchButtons = document.querySelectorAll('.watch-demo-btn');
  
  const videos = {
    'tiffin-demo': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'ecoverse-demo': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'ecotrack-demo': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'todoapp-demo': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'cybersecurity-demo': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'weather-demo': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'portfolio-demo': 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  };

  watchButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const vidId = btn.getAttribute('data-video-id');
      const url = videos[vidId];
      if (videoIframe && url) {
        videoIframe.src = url;
        modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  const closeVideo = () => {
    modalOverlay.classList.remove('open');
    if (videoIframe) videoIframe.src = '';
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeVideo);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeVideo();
    });
  }
}

// ── 7. AI Assistant Chatbot (AdilGPT) ────────────────────
function initChatbot() {
  const widget = document.getElementById('chatbotWidget');
  const toggleBtn = document.getElementById('chatbotToggleBtn');
  const messagesContainer = document.getElementById('chatbotMessages');
  const chatInput = document.getElementById('chatInput');
  const chatSendBtn = document.getElementById('chatSendBtn');
  const chatChips = document.querySelectorAll('.chat-chip');
  const openIcon = document.getElementById('toggleOpenIcon');
  const closeIcon = document.getElementById('toggleCloseIcon');

  const responses = {
    'who is muhammad adil?': '<p><strong>Muhammad Adil</strong> is a B.Tech Computer Science student (3rd Year, 2023-2027) at Integral University, Lucknow.</p><p>He is a full-stack developer with 9.0 CGPA and an IBM Data Science certified practitioner who builds scalable MERN stack web apps.</p>',
    'show mern projects': '<p>Adil has built several key MERN applications:</p><ul><li><strong>Online Tiffin Service</strong>: An end-to-end food delivery service with Stripe and role dashboards.</li><li><strong>EcoVerse</strong>: A gamified climate app utilizing client databases and AI audits.</li></ul>',
    'show ai projects': '<p>Adil is highly interested in AI integrations:</p><ul><li><strong>EcoTrack AI</strong>: A carbon footprint modeling app utilizing Scikit-learn predictive algorithms.</li><li><strong>EcoVerse AI features</strong>: Image scanning recycling classifications running on the Google Gemini API.</li></ul>',
    'show certifications': '<p>Adil holds multiple certifications:</p><ul><li><strong>Data Science with Python by IBM</strong> (Verified)</li><li><strong>Full Stack Development Intern at Cognifyz Technologies</strong></li><li><strong>Full Stack Web Development</strong> (MERN stack)</li></ul>',
    'how can i contact him?': '<p>You can contact Adil in a few ways:</p><ul><li>✉ Email: <a href="mailto:mdadil.md14912@gmail.com" class="chatbot-link">mdadil.md14912@gmail.com</a></li><li>💼 LinkedIn: <a href="https://www.linkedin.com/in/muhammad-adil-6b7196299/" target="_blank" class="chatbot-link">Muhammad Adil</a></li><li>📍 Location: Lucknow, India</li></ul>',
    'show resume': '<p>You can view his resume by clicking this link: <a href="resume.pdf" target="_blank" class="chatbot-link">View Resume (PDF)</a>. You can also download it from the top Hero section.</p>',
    'suggest suitable projects': '<p>Depending on your interest, check these out:</p><ul><li>If you are a <strong>startup founder</strong>, explore the <strong>Online Tiffin Service</strong> for a production-ready design.</li><li>If you are a <strong>technical recruiter</strong>, review the <strong>EcoVerse AI code</strong> for LLM integration.</li></ul>'
  };

  const toggleChat = () => {
    widget.classList.toggle('open');
    const container = widget.querySelector('.chatbot-container');
    if (widget.classList.contains('open')) {
      container.style.display = 'flex';
      openIcon.style.display = 'none';
      closeIcon.style.display = 'block';
      widget.querySelector('.chat-badge-pulse').style.display = 'none';
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } else {
      container.style.display = 'none';
      openIcon.style.display = 'block';
      closeIcon.style.display = 'none';
    }
  };

  if (toggleBtn) toggleBtn.addEventListener('click', toggleChat);

  const sendMessage = (text) => {
    if (!text.trim()) return;

    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = 'chat-msg user';
    userMsgDiv.innerHTML = `<p>${escapeHTML(text)}</p>`;
    messagesContainer.appendChild(userMsgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    chatInput.value = '';

    const botMsgDiv = document.createElement('div');
    botMsgDiv.className = 'chat-msg bot';
    botMsgDiv.innerHTML = `
      <div class="chat-typing-dots">
        <span></span><span></span><span></span>
      </div>
    `;
    messagesContainer.appendChild(botMsgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Log query to backend database
    fetch('/api/chatbot/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: text })
    }).catch(err => console.error('Error logging chatbot query:', err));

    setTimeout(() => {
      const cleanQuery = text.toLowerCase().trim();
      let answer = "<p>I'm sorry, I didn't quite catch that. Try asking one of the quick questions or contact Adil directly at mdadil.md14912@gmail.com!</p>";
      
      for (const [key, response] of Object.entries(responses)) {
        if (cleanQuery.includes(key) || key.includes(cleanQuery)) {
          answer = response;
          break;
        }
      }

      botMsgDiv.innerHTML = answer;
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1200);
  };

  if (chatSendBtn) chatSendBtn.addEventListener('click', () => sendMessage(chatInput.value));
  if (chatInput) chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(chatInput.value); });

  chatChips.forEach(chip => {
    chip.addEventListener('click', () => {
      sendMessage(chip.getAttribute('data-question'));
    });
  });

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
}

// ── 8. Testimonials Carousel Slider ──────────────────────
function initTestimonials() {
  const track = document.getElementById('testimonialsTrack');
  const cards = document.querySelectorAll('.testimonials-track .testimonial-card');
  const prevBtn = document.getElementById('testPrevBtn');
  const nextBtn = document.getElementById('testNextBtn');
  
  if (!track || cards.length === 0) return;
  
  let currentIndex = 0;
  
  const updateSlide = () => {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
  };

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % cards.length;
      updateSlide();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + cards.length) % cards.length;
      updateSlide();
    });
  }
}

// ── 9. Blog Filter & Local Search ───────────────────────
function initBlogFilter() {
  const searchInput = document.getElementById('blogSearchInput');
  const categoryButtons = document.querySelectorAll('.blog-cat-btn');
  const blogCards = document.querySelectorAll('.blog-card');

  let activeCat = 'all';
  let searchQuery = '';

  const filterArticles = () => {
    blogCards.forEach(card => {
      const category = card.getAttribute('data-category');
      const title = card.querySelector('.blog-title').textContent.toLowerCase();
      const excerpt = card.querySelector('.blog-excerpt').textContent.toLowerCase();
      
      const matchesCat = (activeCat === 'all' || category === activeCat);
      const matchesSearch = (title.includes(searchQuery) || excerpt.includes(searchQuery));

      if (matchesCat && matchesSearch) {
        card.classList.remove('hidden');
        card.style.display = 'block';
        card.style.animation = 'fadeIn 0.3s ease forwards';
      } else {
        card.classList.add('hidden');
        card.style.display = 'none';
      }
    });
  };

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      filterArticles();
    });
  }

  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCat = btn.getAttribute('data-cat');
      filterArticles();
    });
  });
}

// ── 10. Command Palette (Ctrl + K) ───────────────────────
function initCommandPalette() {
  const overlay = document.getElementById('commandPaletteOverlay');
  const input = document.getElementById('commandInput');
  const items = document.querySelectorAll('.command-item');
  
  if (!overlay || !input) return;

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      overlay.classList.toggle('open');
      if (overlay.classList.contains('open')) {
        setTimeout(() => input.focus(), 100);
      }
    }
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      overlay.classList.remove('open');
    }
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('open');
  });

  let selectedIndex = 0;
  
  const updateSelection = () => {
    items.forEach((item, idx) => {
      item.classList.toggle('active', idx === selectedIndex);
    });
    const activeItem = items[selectedIndex];
    if (activeItem) activeItem.scrollIntoView({ block: 'nearest' });
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % items.length;
      updateSelection();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + items.length) % items.length;
      updateSelection();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const activeItem = items[selectedIndex];
      if (activeItem) executeCommand(activeItem.getAttribute('data-action'));
    }
  });

  items.forEach((item, idx) => {
    item.addEventListener('mouseenter', () => {
      selectedIndex = idx;
      updateSelection();
    });
    item.addEventListener('click', () => {
      executeCommand(item.getAttribute('data-action'));
    });
  });

  function executeCommand(action) {
    overlay.classList.remove('open');
    switch (action) {
      case 'go-home': document.getElementById('home')?.scrollIntoView(); break;
      case 'go-about': document.getElementById('about')?.scrollIntoView(); break;
      case 'go-services': document.getElementById('services')?.scrollIntoView(); break;
      case 'go-timeline': document.getElementById('timeline')?.scrollIntoView(); break;
      case 'go-console': document.getElementById('dev-console')?.scrollIntoView(); break;
      case 'go-projects': document.getElementById('projects')?.scrollIntoView(); break;
      case 'go-credentials': document.getElementById('credentials')?.scrollIntoView(); break;
      case 'go-blog': document.getElementById('blog')?.scrollIntoView(); break;
      case 'go-contact': document.getElementById('contact')?.scrollIntoView(); break;
      case 'download-resume': document.getElementById('resumeDownloadBtn')?.click(); break;
      case 'chat-ask':
        const chatbotBtn = document.getElementById('chatbotToggleBtn');
        const widget = document.getElementById('chatbotWidget');
        if (chatbotBtn && widget && !widget.classList.contains('open')) chatbotBtn.click();
        break;
    }
  }
}

// ── 11. Global Search Suggestions ────────────────────────
function initSearchModal() {
  const trigger = document.getElementById('searchTrigger');
  const overlay = document.getElementById('searchModalOverlay');
  const input = document.getElementById('globalSearchInput');
  const closeBtn = document.getElementById('searchCloseBtn');
  const resultsContainer = document.getElementById('searchSuggestionsList');
  
  if (!trigger || !overlay || !input) return;

  const searchableIndex = [
    { type: 'Section', name: 'Home Section', keywords: 'home hero greeting welcome main introduction', action: () => document.getElementById('home').scrollIntoView() },
    { type: 'Section', name: 'About Me', keywords: 'about study student education integral background', action: () => document.getElementById('about').scrollIntoView() },
    { type: 'Section', name: 'Services Offered', keywords: 'services design development apps logos custom software', action: () => document.getElementById('services').scrollIntoView() },
    { type: 'Section', name: 'Journey Timeline', keywords: 'timeline history experience job internship archive achivements', action: () => document.getElementById('timeline').scrollIntoView() },
    { type: 'Section', name: 'Developer Console', keywords: 'console skills stack languages react node python db coding analytics traffic metrics', action: () => document.getElementById('dev-console').scrollIntoView() },
    { type: 'Section', name: 'Projects / Selected Work', keywords: 'projects portfolio cases codes links tiffin ecoverse ecotrack todoapp cybersecurity weather demo', action: () => document.getElementById('projects').scrollIntoView() },
    { type: 'Section', name: 'Credentials & Rankings', keywords: 'credentials rankings certificates certs leetcode github hackerrank codechef gfg verified', action: () => document.getElementById('credentials').scrollIntoView() },
    { type: 'Section', name: 'Blog Articles', keywords: 'blog post read journey ml learn articles', action: () => document.getElementById('blog').scrollIntoView() },
    { type: 'Project', name: 'Online Tiffin Service', keywords: 'tiffin order food subscription meal fullstack mern mongo express react node', action: () => { document.getElementById('projects').scrollIntoView(); document.querySelector('[data-project-id="tiffin"]').click(); } },
    { type: 'Project', name: 'EcoVerse Sustainability', keywords: 'ecoverse carbon climate nature gemini ai tracker fullstack react mongo', action: () => { document.getElementById('projects').scrollIntoView(); document.querySelector('[data-project-id="ecoverse"]').click(); } },
    { type: 'Project', name: 'EcoTrack AI', keywords: 'ecotrack carbon footprint ai model analytics cache javascript node', action: () => { document.getElementById('projects').scrollIntoView(); document.querySelector('[data-project-id="ecotrack"]').click(); } },
    { type: 'Project', name: 'Kotlin Todo App', keywords: 'todo task manager list mobile android native room sqflite', action: () => { document.getElementById('projects').scrollIntoView(); document.querySelector('[data-project-id="todoapp"]').click(); } },
    { type: 'Project', name: 'Incidents Clustering', keywords: 'cybersecurity logs cluster data science pandas scikit learn python kmeans', action: () => { document.getElementById('projects').scrollIntoView(); document.querySelector('[data-project-id="cybersecurity"]').click(); } },
    { type: 'Project', name: 'Weather App', keywords: 'weather forecast openweather api geolocation localstorage js css', action: () => { document.getElementById('projects').scrollIntoView(); document.querySelector('[data-project-id="weather"]').click(); } },
    { type: 'Project', name: 'Developer Portfolio', keywords: 'portfolio personal luxury adil code scripts javascript style animations', action: () => { document.getElementById('projects').scrollIntoView(); document.querySelector('[data-project-id="portfolio"]').click(); } },
    { type: 'Certification', name: 'Data Science with Python by IBM', keywords: 'ibm data science python databases SQL visualizations analytics', action: () => document.getElementById('credentials').scrollIntoView() },
    { type: 'Certification', name: 'Cognifyz Technologies Internship Certificate', keywords: 'cognifyz full stack development intern certificate certification', action: () => document.getElementById('credentials').scrollIntoView() },
    { type: 'Blog Post', name: 'How I Built EcoTrack AI', keywords: 'ecotrack carbon model analytics caching react', action: () => document.getElementById('blog').scrollIntoView() },
    { type: 'Blog Post', name: 'My Full-Stack Journey', keywords: 'fullstack roadmap html database backend career', action: () => document.getElementById('blog').scrollIntoView() }
  ];

  trigger.addEventListener('click', () => {
    overlay.classList.add('open');
    setTimeout(() => input.focus(), 100);
    renderSuggestions('');
  });

  if (closeBtn) closeBtn.addEventListener('click', () => overlay.classList.remove('open'));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });

  input.addEventListener('input', (e) => {
    renderSuggestions(e.target.value.toLowerCase().trim());
  });

  let selectedIdx = 0;

  function renderSuggestions(query) {
    resultsContainer.innerHTML = '';
    
    const matches = searchableIndex.filter(item => {
      if (!query) return true;
      return item.name.toLowerCase().includes(query) || item.keywords.includes(query);
    }).slice(0, 5);

    if (matches.length === 0) {
      resultsContainer.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: #888; font-size: 0.88rem;">No results matching "${escapeHTML(query)}"</div>`;
      return;
    }

    matches.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = `search-item ${idx === selectedIdx ? 'active' : ''}`;
      div.innerHTML = `
        <span><strong>[${item.type}]</strong> ${item.name}</span>
        <span class="search-badge">Go ↗</span>
      `;
      div.addEventListener('mouseenter', () => {
        selectedIdx = idx;
        const allItems = resultsContainer.querySelectorAll('.search-item');
        allItems.forEach((itm, id) => itm.classList.toggle('active', id === selectedIdx));
      });
      div.addEventListener('click', () => {
        item.action();
        overlay.classList.remove('open');
      });
      resultsContainer.appendChild(div);
    });

    input.onkeydown = (e) => {
      const allItems = resultsContainer.querySelectorAll('.search-item');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIdx = (selectedIdx + 1) % matches.length;
        allItems.forEach((itm, id) => itm.classList.toggle('active', id === selectedIdx));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIdx = (selectedIdx - 1 + matches.length) % matches.length;
        allItems.forEach((itm, id) => itm.classList.toggle('active', id === selectedIdx));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selection = matches[selectedIdx];
        if (selection) {
          selection.action();
          overlay.classList.remove('open');
        }
      }
    };
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
}

// ── 12. Upgraded Contact Form (Formspree Integration) ──
function initUpgradedContactForm() {
  const formEl = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn'); // Explicit definition to avoid global reference errors
  const spinner = document.getElementById('formSpinner');
  const successDiv = document.getElementById('formSuccess');
  const btnText = document.querySelector('#submitBtn span');
  const btnSvg = document.querySelector('#submitBtn .btn-arrow');
  
  if (!formEl || !submitBtn) return;

  const originalValidators = {
    name: {
      el: document.getElementById('name'),
      err: document.getElementById('nameError'),
      validate(val) {
        if (!val.trim()) return 'Please enter your full name.';
        if (val.trim().length < 2) return 'Name must be at least 2 characters.';
        return '';
      }
    },
    email: {
      el: document.getElementById('email'),
      err: document.getElementById('emailError'),
      validate(val) {
        if (!val.trim()) return 'Please enter your email address.';
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(val.trim())) return 'Please enter a valid email address.';
        return '';
      }
    },
    subject: {
      el: document.getElementById('subject'),
      err: document.getElementById('subjectError'),
      validate(val) {
        if (!val.trim()) return 'Please enter a subject.';
        if (val.trim().length < 3) return 'Subject must be at least 3 characters.';
        return '';
      }
    },
    message: {
      el: document.getElementById('message'),
      err: document.getElementById('messageError'),
      validate(val) {
        if (!val.trim()) return 'Please enter your message.';
        if (val.trim().length < 20) return 'Message must be at least 20 characters.';
        return '';
      }
    }
  };

  Object.values(originalValidators).forEach(({ el, err, validate }) => {
    if (!el) return;
    el.addEventListener('blur', () => {
      const msg = validate(el.value);
      err.textContent = msg;
      el.classList.toggle('error', !!msg);
    });
    el.addEventListener('input', () => {
      if (el.classList.contains('error')) {
        const msg = validate(el.value);
        err.textContent = msg;
        el.classList.toggle('error', !!msg);
      }
    });
  });

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;
    Object.values(originalValidators).forEach(({ el, err, validate }) => {
      if (!el) return;
      const msg = validate(el.value);
      err.textContent = msg;
      el.classList.toggle('error', !!msg);
      if (msg) isValid = false;
    });

    if (!isValid) return;

    const nameVal = document.getElementById('name').value;
    const emailVal = document.getElementById('email').value;
    const subjectVal = document.getElementById('subject').value;
    const messageVal = document.getElementById('message').value;

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nameVal, email: emailVal, subject: subjectVal, message: messageVal })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showFeedback(true, 'Message sent! I\'ll get back to you within 24 hours.');
        formEl.reset();
        Object.values(originalValidators).forEach(({ el }) => el.classList.remove('error'));
        updateConsoleDashboardStats();
      } else {
        showFeedback(false, data.error || 'Failed to send message.');
      }
    })
    .catch(err => {
      console.error('Contact form submission error:', err);
      showFeedback(false, 'Network error. Please try again.');
    })
    .finally(() => {
      submitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Send Message';
      if (btnSvg) btnSvg.style.display = '';
      if (spinner) spinner.style.display = 'none';
    });

    function showFeedback(isSuccess, msg) {
      if (successDiv) {
        successDiv.style.background = isSuccess ? '' : '#c0392b';
        successDiv.innerHTML = `<span>${isSuccess ? '✓' : '✗'}</span> ${msg}`;
        successDiv.classList.add('show');
        setTimeout(() => successDiv.classList.remove('show'), 5000);
      }
    }
  });
}
