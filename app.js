const defaults = { catch: 8 * 60, scribble: 2 * 60, fake: 5 * 60, rooms: 45 * 60 };
const timers = Object.fromEntries(Object.entries(defaults).map(([key, seconds]) => [key, { remaining: seconds, running: false, interval: null }]));

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainder = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}

function updateTimer(key) {
  const timer = timers[key];
  const display = document.querySelector(`[data-display="${key}"]`);
  const button = document.querySelector(`[data-timer="${key}"]`);
  display.textContent = formatTime(timer.remaining);
  button.innerHTML = timer.running ? 'Pause timer <span>Ⅱ</span>' : `Start timer <span>↗</span>`;
  if (timer.remaining === 0) {
    clearInterval(timer.interval);
    timer.running = false;
    button.textContent = 'Done — reset to try again';
    display.classList.add('finished');
  }
}

function toggleTimer(key) {
  const timer = timers[key];
  if (timer.remaining === 0) return;
  timer.running = !timer.running;
  if (timer.running) {
    timer.interval = setInterval(() => {
      timer.remaining -= 1;
      updateTimer(key);
    }, 1000);
  } else {
    clearInterval(timer.interval);
  }
  updateTimer(key);
}

function resetTimer(key) {
  clearInterval(timers[key].interval);
  timers[key].remaining = defaults[key];
  timers[key].running = false;
  document.querySelector(`[data-display="${key}"]`).classList.remove('finished');
  updateTimer(key);
}

document.querySelectorAll('.method-link').forEach((link) => {
  link.addEventListener('click', () => {
    const target = link.dataset.target;
    document.querySelectorAll('.method-link').forEach((item) => item.classList.toggle('active', item === link));
    document.querySelectorAll('.method-panel').forEach((panel) => panel.classList.toggle('active', panel.dataset.method === target || panel.id === `panel-${target}`));
  });
});

document.querySelectorAll('.start-button').forEach((button) => button.addEventListener('click', () => toggleTimer(button.dataset.timer)));
document.querySelectorAll('.reset-button').forEach((button) => button.addEventListener('click', () => resetTimer(button.dataset.reset)));

document.querySelectorAll('.duration-options').forEach((options) => {
  options.addEventListener('click', (event) => {
    if (event.target.tagName !== 'BUTTON') return;
    const key = options.dataset.options;
    const minutes = Number(event.target.dataset.minutes);
    defaults[key] = minutes * 60;
    resetTimer(key);
    options.querySelectorAll('button').forEach((button) => button.classList.toggle('selected', button === event.target));
  });
});

document.querySelector('#themeToggle').addEventListener('click', () => document.body.classList.toggle('soft'));

const sidebar = document.querySelector('.sidebar');
const contentGrid = document.querySelector('.content-grid');
const menuObserver = new IntersectionObserver(([entry]) => {
  sidebar.classList.toggle('is-visible', entry.isIntersecting);
}, { threshold: 0.08 });
menuObserver.observe(contentGrid);

const panelObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const method = entry.target.dataset.method;
    document.querySelectorAll('.method-link').forEach((link) => link.classList.toggle('active', link.dataset.target === method));
  });
}, { rootMargin: '-18% 0px -60% 0px', threshold: 0 });
document.querySelectorAll('.method-panel').forEach((panel) => panelObserver.observe(panel));
