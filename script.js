/* script.js - Aura Gym
   Key features:
   - Startup questionnaire (MCQ) saved to localStorage
   - Parallax/Slideshow hero
   - Diet plan toggle (Veg/Non-Veg) with collapsible day cards
   - Workout cards with Start Timer per workout
   - Simple form validation for contact
   - Scroll animations and sticky nav behavior
*/

/* ------------------------------
   Helper & Initialization
   ------------------------------ */
document.addEventListener('DOMContentLoaded', () => {
  // UI elements
  const loader = document.getElementById('loader');
  const overlay = document.getElementById('quizOverlay');
  const openQuizBtn = document.getElementById('openQuiz');
  const skipQuiz = document.getElementById('skipQuiz');
  const quizForm = document.getElementById('quizForm');
  const choicesBtns = Array.from(document.querySelectorAll('.choices button'));
  const vegBtn = document.getElementById('vegBtn');
  const nonvegBtn = document.getElementById('nonvegBtn');
  const dietPlansContainer = document.getElementById('dietPlans');
  const workoutGrid = document.getElementById('workoutGrid');
  const musicToggle = document.getElementById('musicToggle');
  const bgMusic = document.getElementById('bgMusic');
  const loaderDelay = 800; // ms

  // Hide loader after small delay
  setTimeout(() => {
    loader.style.display = 'none';
    startHeroSlideshow();
  }, loaderDelay);

  // Show or hide the startup overlay based on localStorage
  const storedQuiz = localStorage.getItem('aura_quiz');
  if (!storedQuiz) {
    showOverlay();
  } else {
    // If stored, we can greet (optional). For now, leave overlay closed.
    // You can uncomment following to show overlay always:
    // showOverlay();
  }

  // Open quiz from header
  openQuizBtn.addEventListener('click', showOverlay);
  skipQuiz.addEventListener('click', () => {
    hideOverlay();
    // Mark skipped so overlay doesn't return
    localStorage.setItem('aura_quiz', JSON.stringify({ skipped: true, date: new Date().toISOString() }));
  });

  // MCQ button logic (select one per group)
  document.querySelectorAll('.mcq').forEach(mcq => {
    mcq.addEventListener('click', e => {
      if (e.target.tagName === 'BUTTON') {
        // Remove active in same group
        mcq.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      }
    });
  });

  // Quiz form submit: collect MCQ choices + fields, save to localStorage
  quizForm.addEventListener('submit', (ev) => {
    ev.preventDefault();

    // Collect answers
    const mcqNodes = quizForm.querySelectorAll('.mcq');
    const answers = {};
    mcqNodes.forEach((mcq, idx) => {
      const active = mcq.querySelector('button.active');
      const label = mcq.querySelector('label').innerText;
      answers[label] = active ? active.dataset.value : null;
    });

    const name = quizForm.name.value.trim();
    const email = quizForm.email.value.trim();
    const phone = quizForm.phone.value.trim();

    if (!name || !email || !phone) {
      alert('Please fill in Name, Email, and Phone.');
      return;
    }

    const payload = {
      meta: answers,
      name, email, phone,
      savedAt: new Date().toISOString()
    };

    // Save to localStorage
    localStorage.setItem('aura_quiz', JSON.stringify(payload));

    // Friendly UX
    hideOverlay();
    flashMessage(`Thanks ${name}! Your preferences are saved.`);
  });

  // Make the overlay closable by clicking outside
  overlay.addEventListener('click', (ev) => {
    if (ev.target === overlay) {
      // Do not auto-close — but allow skip
    }
  });

  // Open overlay helper
  function showOverlay() {
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
  function hideOverlay() {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  // Simple flash message
  function flashMessage(msg) {
    const el = document.createElement('div');
    el.textContent = msg;
    el.style.position = 'fixed';
    el.style.left = '50%';
    el.style.top = '14%';
    el.style.transform = 'translateX(-50%)';
    el.style.background = 'linear-gradient(90deg,var(--accent), #ff6b6b)';
    el.style.color = '#fff';
    el.style.padding = '8px 14px';
    el.style.borderRadius = '8px';
    el.style.zIndex = 99999;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  /* ------------------------------
     Hero slideshow
     ------------------------------ */
  let slideIndex = 0;
  let slideTimer;
  function startHeroSlideshow() {
    const slides = document.querySelectorAll('.hero .slide');
    if (!slides.length) return;
    slides.forEach(s => s.classList.remove('active'));
    slides[0].classList.add('active');
    slideIndex = 0;
    slideTimer = setInterval(() => {
      slides[slideIndex].classList.remove('active');
      slideIndex = (slideIndex + 1) % slides.length;
      slides[slideIndex].classList.add('active');
    }, 5000);
  }

  /* ------------------------------
     Populate Diet Plans (Veg & Non-Veg)
     ------------------------------ */
  // Simple example data structure - expand as needed
  const dietData = {
    veg: [
      { day: "Day 1", meals: ["6:30 AM — Oats porridge with milk & banana", "9:30 AM — Peanut butter sandwich", "12:30 PM — Paneer bhurji + roti", "4:00 PM — Nuts & fruit shake", "7:30 PM — Dal + Rice + Veg sabzi", "9:30 PM — Glass of milk"] },
      { day: "Day 2", meals: ["6:30 AM — Poha + milk", "9:30 AM — Sprouts salad", "12:30 PM — Rajma + Rice", "4:00 PM — Protein smoothie (milk, banana, oats)", "7:30 PM — Paneer tikka + roti", "9:30 PM — Greek yogurt"] },
      { day: "Day 3", meals: ["6:30 AM — Idli + sambar + coconut chutney", "9:30 AM — Fruit & nuts", "12:30 PM — Chole + rice", "4:00 PM — Peanut-choco shake", "7:30 PM — Mixed veg + quinoa", "9:30 PM — Warm milk"] },
      { day: "Day 4", meals: ["6:30 AM — Upma + milk", "9:30 AM — Banana & almonds", "12:30 PM — Veg pulao + raita", "4:00 PM — Hummus & veg sticks", "7:30 PM — Paneer curry + chapati", "9:30 PM — Cottage cheese"] },
      { day: "Day 5", meals: ["6:30 AM — Paratha + curd", "9:30 AM — Protein smoothie", "12:30 PM — Dal + rice + salad", "4:00 PM — Cheese sandwich", "7:30 PM — Rajma + roti", "9:30 PM — Milk & honey"] },
      { day: "Day 6", meals: ["6:30 AM — Smoothie bowl", "9:30 AM — Nuts & dried fruit", "12:30 PM — Soya chaap + rice", "4:00 PM — Protein shake", "7:30 PM — Mixed lentils + veg", "9:30 PM — Curd & fruit"] },
      { day: "Day 7", meals: ["6:30 AM — Muesli with milk", "9:30 AM — Peanut butter toast", "12:30 PM — Paneer biryani", "4:00 PM — Fruit shake", "7:30 PM — Veg kebabs + roti", "9:30 PM — Warm milk"] },
    ],
    nonveg: [
      { day: "Day 1", meals: ["6:30 AM — Eggs (3) + toast", "9:30 AM — Chicken sandwich", "12:30 PM — Chicken curry + rice", "4:00 PM — Tuna salad", "7:30 PM — Fish + veg", "9:30 PM — Glass of milk"] },
      { day: "Day 2", meals: ["6:30 AM — Omelette + oats", "9:30 AM — Greek yogurt + honey", "12:30 PM — Grilled chicken + quinoa", "4:00 PM — Nuts & boiled egg", "7:30 PM — Egg fried rice", "9:30 PM — Cottage cheese"] },
      { day: "Day 3", meals: ["6:30 AM — Scrambled eggs + avocado", "9:30 AM — Protein shake", "12:30 PM — Fish curry + rice", "4:00 PM — Chicken salad", "7:30 PM — Grilled prawns", "9:30 PM — Warm milk"] },
      { day: "Day 4", meals: ["6:30 AM — Egg whites + toast", "9:30 AM — Nut butter banana", "12:30 PM — Mutton curry + rice", "4:00 PM — Protein bar", "7:30 PM — Chicken stir-fry", "9:30 PM — Yogurt"] },
      { day: "Day 5", meals: ["6:30 AM — Boiled eggs + fruit", "9:30 AM — Paneer and egg sandwich", "12:30 PM — Fish + potatoes", "4:00 PM — Smoothie", "7:30 PM — Grilled chicken", "9:30 PM — Milk"] },
      { day: "Day 6", meals: ["6:30 AM — Omelette + veggies", "9:30 AM — Cheese & fruit", "12:30 PM — Chicken biryani", "4:00 PM — Nuts & protein shake", "7:30 PM — Fish curry", "9:30 PM — Curd"] },
      { day: "Day 7", meals: ["6:30 AM — Eggs + oats", "9:30 AM — Protein shake", "12:30 PM — Grilled mackerel + rice", "4:00 PM — Chicken wrap", "7:30 PM — Lamb stew", "9:30 PM — Warm milk"] },
    ]
  };

  function renderDietPlan(type = 'veg') {
    dietPlansContainer.innerHTML = '';
    const arr = dietData[type];
    arr.forEach((d, i) => {
      const card = document.createElement('div');
      card.className = 'day-card card-anim';
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <h4>${d.day}</h4>
          <button class="btn small toggleDay">View</button>
        </div>
        <div class="collapse">
          <ul>
            ${d.meals.map(m => `<li>${m}</li>`).join('')}
          </ul>
        </div>
      `;
      dietPlansContainer.appendChild(card);
    });

    // Add toggles
    dietPlansContainer.querySelectorAll('.toggleDay').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const collapse = e.target.parentElement.nextElementSibling;
        if (collapse.style.maxHeight && collapse.style.maxHeight !== '0px') {
          collapse.style.maxHeight = null;
          e.target.textContent = 'View';
        } else {
          collapse.style.maxHeight = collapse.scrollHeight + 'px';
          e.target.textContent = 'Hide';
        }
      });
    });

    // Animate visibility
    revealOnScroll();
  }

  // Toggle buttons
  vegBtn.addEventListener('click', () => {
    vegBtn.classList.add('active');
    nonvegBtn.classList.remove('active');
    renderDietPlan('veg');
  });
  nonvegBtn.addEventListener('click', () => {
    nonvegBtn.classList.add('active');
    vegBtn.classList.remove('active');
    renderDietPlan('nonveg');
  });

  // Initial render
  renderDietPlan('veg');

  /* ------------------------------
     Workout routine & Timer logic
     ------------------------------ */
  const workouts = [
    { name: "Chest & Triceps", durationMin: 45, img: "https://connect.healthkart.com/wp-content/uploads/2016/03/banner-7.jpg", exercises: ["Bench Press - 4x8", "Incline Dumbbell - 4x10", "Dips - 3xMax", "Triceps Pushdown - 3x12"] },
    { name: "Back & Biceps", durationMin: 45, img: "https://www.onnit.com/cdn/shop/articles/backopener-1440x960_c99d7901-3d88-4470-8841-b8e84a0d6a35.jpg?v=1755197542&width=1080", exercises: ["Deadlift - 4x6", "Pull-Ups - 4xMax", "Bent-over Row - 4x8", "Bicep Curl - 3x12"] },
    { name: "Shoulders", durationMin: 45, img: "https://hips.hearstapps.com/menshealth-uk/main/thumbs/34592/shoulder-exercises.jpg?crop=1.00xw:1.00xh;0,0&resize=1800:*", exercises: ["Overhead Press - 4x8", "Lateral Raises - 3x15", "Face Pulls - 3x15"] },
    { name: "Legs", durationMin: 45, img: "https://cdn.shopify.com/s/files/1/0471/3332/7519/files/leg-workouts-for-men-7-best-workouts-for-quads-glutes-hams-v2-2.jpg?v=1729636016", exercises: ["Squats - 5x5", "Leg Press - 4x10", "Hamstring Curl - 3x12"] },
    { name: "Core & Abs", durationMin: 30, img: "https://i.insider.com/609420e5f22c6b00185dcaa1?width=1300&format=jpeg&auto=webp", exercises: ["Plank 3x60s", "Hanging Leg Raise - 4x12", "Russian Twists - 3x20"] },
    { name: "Full Body Functional", durationMin: 45, img: "https://cdn.muscleandstrength.com/sites/default/files/ms_full_body_routine_-_1200x630.jpg", exercises: ["Kettlebell Swings - 4x12", "Burpees - 3x15", "Farmer Carry - 3x60s"] },
  ];

  function renderWorkouts() {
    workoutGrid.innerHTML = '';
    workouts.forEach((w, idx) => {
      const card = document.createElement('div');
      card.className = 'workout-card card-anim';
      card.innerHTML = `
        <img src="${w.img}" alt="${w.name}">
        <h3>${w.name}</h3>
        <p class="muted">${w.exercises.slice(0,3).join(' • ')}</p>
        <div class="meta">
          <div>Est. <strong>${w.durationMin} min</strong></div>
          <div class="timer-display" data-min="${w.durationMin}" id="timer-${idx}">00:00</div>
        </div>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="btn primary startTimer" data-idx="${idx}">Start Timer</button>
          <button class="btn ghost stopTimer" data-idx="${idx}">Stop</button>
        </div>
      `;
      workoutGrid.appendChild(card);
    });

    // Attach timer handlers
    attachTimerHandlers();
    revealOnScroll();
  }

  // Timer store per workout
  const timers = {};

  function attachTimerHandlers() {
    workoutGrid.querySelectorAll('.startTimer').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.target.dataset.idx;
        startWorkoutTimer(idx);
      });
    });
    workoutGrid.querySelectorAll('.stopTimer').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.target.dataset.idx;
        stopWorkoutTimer(idx);
      });
    });
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // Starts countdown with duration in minutes from data-min attribute
  function startWorkoutTimer(idx) {
    // If already running, do nothing
    if (timers[idx] && timers[idx].running) return;

    const display = document.getElementById(`timer-${idx}`);
    const minutes = parseInt(display.dataset.min) || 45;
    let secondsLeft = minutes * 60;

    // Clear any previous interval
    stopWorkoutTimer(idx);

    display.textContent = formatTime(secondsLeft);
    timers[idx] = {
      running: true,
      interval: setInterval(() => {
        secondsLeft -= 1;
        display.textContent = formatTime(secondsLeft);
        if (secondsLeft <= 0) {
          stopWorkoutTimer(idx);
          flashMessage(`${workouts[idx].name} complete! Great job.`);
        }
      }, 1000)
    };
  }

  function stopWorkoutTimer(idx) {
    if (timers[idx]) {
      clearInterval(timers[idx].interval);
      timers[idx].running = false;
      // reset display
      const display = document.getElementById(`timer-${idx}`);
      if (display) display.textContent = '00:00';
    }
  }

  renderWorkouts();

  // Background Music Control
const Music = document.getElementById('bg-music');
const music = document.getElementById('music-toggle');


  /* ------------------------------
     Contact form validation
     ------------------------------ */
  const contactForm = document.getElementById('contactForm');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = contactForm.cname.value.trim();
    const email = contactForm.cemail.value.trim();
    const message = contactForm.cmessage.value.trim();

    if (!name || !email || !message) {
      alert('Please fill all fields');
      return;
    }

    // Since no backend, save message to local storage as demo
    const msgs = JSON.parse(localStorage.getItem('aura_messages') || '[]');
    msgs.push({ name, email, message, date: new Date().toISOString() });
    localStorage.setItem('aura_messages', JSON.stringify(msgs));

    flashMessage('Message saved locally. We will contact you soon.');
    contactForm.reset();
  });

  /* ------------------------------
     Small UX: sticky nav behavior & scroll to top
     ------------------------------ */
  const header = document.getElementById('mainHeader');
  const scrollTopBtn = document.getElementById('scrollTop');
  const yearEl = document.getElementById('year');
  yearEl.textContent = new Date().getFullYear();

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 80) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    if (y > 400) {
      scrollTopBtn.style.display = 'block';
    } else {
      scrollTopBtn.style.display = 'none';
    }

    // Reveal animations for card elements
    revealOnScroll();
  });

  scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Smooth scrolling for nav links
  document.querySelectorAll('.nav-link').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const href = a.getAttribute('href').replace('#','');
      scrollToSection(href);
    });
  });

  // Expose scrollToSection for brand logo
  window.scrollToSection = function(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* ------------------------------
     Reveal on scroll (simple)
     ------------------------------ */
  function revealOnScroll() {
    document.querySelectorAll('.card-anim').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 60) {
        el.classList.add('visible');
      }
    });
  }

  // run once at start
  revealOnScroll();

  /* ------------------------------
     Small mobile nav (toggle)
     ------------------------------ */
  const menuBtn = document.getElementById('menuBtn');
  menuBtn.addEventListener('click', () => {
    document.body.classList.toggle('menu-open');
  });

  /* ------------------------------
     Misc: show overlay if user clears storage or wants to update
     ------------------------------ */
  // If user reloads and wants to update their quiz, they can click "Update Quiz" (already wired)

});
