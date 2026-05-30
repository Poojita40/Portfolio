// --- DYNAMIC INTERACTIVE BEHAVIORS ---

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all elements and handlers
  initParticles();
  initMouseGlow();
  initThemeToggle();
  initScrollReveal();
  initPdfModal();
  initContactForm();
  initMobileMenu();
});

/* ==========================================================================
   1. ZERO-GRAVITY PARTICLES CANVAS EFFECT
   ========================================================================== */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particlesArray = [];
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  // Mouse coords
  const mouse = {
    x: null,
    y: null,
    radius: 120, // Interaction radius
  };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Particle Class
  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height + height; // Start below or randomly within height
      this.baseY = this.y;
      this.radius = Math.random() * 2 + 0.5; // Small, elegant particle size
      
      // Speed of drifting - very slow "anti-gravity" upward float
      this.speedY = -(Math.random() * 0.4 + 0.1); 
      this.speedX = Math.random() * 0.2 - 0.1; // Gentle horizontal sway
      
      // Theme matching color (cyan/purple shades)
      const colors = ['#22D3EE', '#A78BFA', '#2563EB', '#818CF8'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.alpha = Math.random() * 0.5 + 0.15; // Low opacity for subtle look
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      // Add subtle glow to larger particles
      if (this.radius > 1.8) {
        ctx.shadowBlur = 6;
        ctx.shadowColor = this.color;
      }
      ctx.fill();
      ctx.restore();
    }

    update() {
      // Zero-gravity upward drift
      this.y += this.speedY;
      this.x += this.speedX;

      // Wrap around when particle floats off the top
      if (this.y < -10) {
        this.y = height + 10;
        this.x = Math.random() * width;
        this.alpha = Math.random() * 0.5 + 0.15;
      }

      // Keep horizontal sways bounded
      if (this.x < 0 || this.x > width) {
        this.speedX = -this.speedX;
      }

      // Mouse interaction - zero-gravity push
      if (mouse.x != null && mouse.y != null) {
        let dx = this.x - mouse.x;
        let dy = this.y - mouse.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
          // Push particles gently away from cursor
          let force = (mouse.radius - distance) / mouse.radius;
          let directionX = (dx / distance) * force * 1.5;
          let directionY = (dy / distance) * force * 1.5;
          
          this.x += directionX;
          this.y += directionY;
        }
      }

      this.draw();
    }
  }

  // Populate particles list (100 particles for high performance without lag)
  const numberOfParticles = 80;
  function init() {
    particlesArray = [];
    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push(new Particle());
      // Distribute particles across height initially
      particlesArray[i].y = Math.random() * height;
    }
  }

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
    }
    requestAnimationFrame(animate);
  }

  init();
  animate();
}

/* ==========================================================================
   2. SPOTLIGHT MOUSE-GLOW EFFECT
   ========================================================================== */
function initMouseGlow() {
  const cards = document.querySelectorAll('.spotlight-card');
  
  window.addEventListener('mousemove', (e) => {
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x coordinate within the element
      const y = e.clientY - rect.top;  // y coordinate within the element
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* ==========================================================================
   3. THEME SWITCHER (DARK / LIGHT MODE)
   ========================================================================== */
function initThemeToggle() {
  const toggleBtn = document.querySelector('.theme-toggle-btn');
  if (!toggleBtn) return;

  // Check cached preference, default is Dark
  const cachedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', cachedTheme);

  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Smooth transition
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
}

/* ==========================================================================
   4. SCROLL REVEAL & SKILLS PROGRESS ANIMATION
   ========================================================================== */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const skillFills = document.querySelectorAll('.skill-progress-fill');

  const observerOptions = {
    root: null,
    threshold: 0.1, // Trigger when 10% of element is visible
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        
        // If this is the skills section or holds skill elements, trigger progress bars
        if (entry.target.id === 'skills' || entry.target.querySelector('.skill-progress-fill')) {
          animateSkillBars();
        }
        
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  reveals.forEach(el => revealObserver.observe(el));

  function animateSkillBars() {
    skillFills.forEach(fill => {
      const pct = fill.getAttribute('data-percentage');
      if (pct) {
        fill.style.width = pct;
      }
    });
  }

  // Header styling change on scroll
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/* ==========================================================================
   5. RESUME PDF MODAL PREVIEW HANDLERS
   ========================================================================== */
function initPdfModal() {
  const modal = document.querySelector('.modal');
  const openModalBtns = document.querySelectorAll('.open-resume-modal-btn');
  const closeModalBtn = document.querySelector('.modal-close-btn');

  if (!modal || !closeModalBtn) return;

  function openModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Stop scrolling behind modal
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scroll
  }

  openModalBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  }));

  closeModalBtn.addEventListener('click', closeModal);

  // Close when clicking overlay backdrop
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Escape key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   6. CONTACT FORM HANDLING (EmailJS Integration)
   ========================================================================== */

const EMAILJS_SERVICE_ID  = 'service_hat0uim';
const EMAILJS_TEMPLATE_ID = 'template_a4930va';
const EMAILJS_PUBLIC_KEY  = 'ky701ybUTU3sdNMMt';

function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusDiv = document.querySelector('.form-status');

  if (!form || !statusDiv) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name    = document.getElementById('form-name').value.trim();
    const email   = document.getElementById('form-email').value.trim();
    const subject = document.getElementById('form-subject').value.trim();
    const message = document.getElementById('form-message').value.trim();

    if (!name || !email || !subject || !message) {
      statusDiv.textContent = 'Please fill in all fields.';
      statusDiv.className   = 'form-status error';
      statusDiv.style.display = 'block';
      return;
    }

    // Loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg style="width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2C6.477 2 2 6.477 2 12" stroke-linecap="round"></path>
      </svg>
      Sending Message...
    `;

    try {
      // Send via EmailJS v4 — publicKey passed directly to send()
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          name:    name,
          email:   email,
          title:   subject,
          message: message,
        },
        EMAILJS_PUBLIC_KEY   // ← v4: pass the public key string directly (not an object)
      );

      console.log('EmailJS success:', response);

      // ✅ Success
      statusDiv.textContent = `Thank you, ${name}! Your message has been sent. I'll get back to you shortly!`;
      statusDiv.className   = 'form-status success';
      statusDiv.style.display = 'block';
      form.reset();

    } catch (error) {
      console.error('EmailJS error:', error);
      // Show the real error so we can debug
      statusDiv.textContent = `Error: ${error.text || error.message || JSON.stringify(error)}`;
      statusDiv.className   = 'form-status error';
      statusDiv.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
      setTimeout(() => { statusDiv.style.display = 'none'; }, 10000);
    }
  });
}
  });
}

/* ==========================================================================
   7. MOBILE NAVIGATION BAR DRAWER
   ========================================================================== */
function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  
  if (!menuBtn || !navLinks) return;

  menuBtn.addEventListener('click', () => {
    // Basic mobile menu toggle
    navLinks.classList.toggle('active');
    
    // Render sliding animation inside CSS if active
    if (navLinks.classList.contains('active')) {
      navLinks.style.display = 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '100%';
      navLinks.style.left = '0';
      navLinks.style.width = '100%';
      navLinks.style.background = 'var(--bg-secondary)';
      navLinks.style.padding = '2rem';
      navLinks.style.borderBottom = '1px solid var(--border-color)';
      navLinks.style.zIndex = '99';
    } else {
      navLinks.style.display = '';
    }
  });

  // Close menu when clicking nav link on mobile
  const links = navLinks.querySelectorAll('.nav-link');
  links.forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        navLinks.style.display = '';
      }
    });
  });
}
