const ltLink = "https://dry-parrots-worry.loca.lt";
const fallback = document.getElementById('fallback');
const manualLink = document.getElementById('manualLink');
const retryBtn = document.getElementById('retryBtn');
const loadingAnim = document.getElementById('loadingAnim');
const fallbackCard = document.getElementById('fallbackCard');
const fallbackTitle = document.getElementById('fallbackTitle');
const fallbackDesc = document.getElementById('fallbackDesc');

let isRequestInProgress = false;
let lastFailTime = 0;
const FAIL_CACHE_MS = 10000; // 10 seconds
const RETRY_DEBOUNCE = 12000; // 12 seconds
let retryCountdownInterval = null;

// --- Inactivity reload logic start ---
let inactivityTimeout;
const INACTIVITY_LIMIT_MS = 20000; // 20 seconds

function resetInactivityTimer() {
  clearTimeout(inactivityTimeout);
  inactivityTimeout = setTimeout(() => {
    tryRedirect(true); // Force retry after inactivity
  }, INACTIVITY_LIMIT_MS);
}

// Reset timer on any user interaction
['mousemove', 'keydown', 'mousedown', 'touchstart'].forEach(event => {
  window.addEventListener(event, resetInactivityTimer, true);
});

// Start the inactivity timer on load
resetInactivityTimer();
// --- Inactivity reload logic end ---

function setRetryButtonDisabled(disabled, secondsLeft = 0) {
  retryBtn.disabled = disabled;
  if (disabled && secondsLeft > 0) {
    retryBtn.textContent = `Retry (${secondsLeft}s)`;
    let remaining = secondsLeft;
    retryCountdownInterval = setInterval(() => {
      remaining--;
      if (remaining > 0) {
        retryBtn.textContent = `Retry (${remaining}s)`;
      } else {
        clearInterval(retryCountdownInterval);
        retryBtn.textContent = 'Retry';
        retryBtn.disabled = false;
      }
    }, 1000);
  } else {
    retryBtn.textContent = 'Retry';
    if (retryCountdownInterval) clearInterval(retryCountdownInterval);
  }
}

function tryRedirect(force = false) {
  // If recently failed, don't retry unless forced
  if (!force && Date.now() - lastFailTime < FAIL_CACHE_MS) return;

  fallback.classList.remove('show');
  loadingAnim.style.display = '';
  fallbackCard.style.display = 'none';
  isRequestInProgress = true;
  setRetryButtonDisabled(true, RETRY_DEBOUNCE / 1000);

  fetch(ltLink, { method: 'HEAD', mode: 'no-cors' })
    .then(() => window.location.replace(ltLink))
    .catch(() => {
      loadingAnim.style.display = 'none';
      fallbackCard.style.display = '';
      fallback.classList.add('show');
      manualLink.href = ltLink;
      fallbackTitle.textContent = 'Server is unavailable';
      fallbackDesc.innerHTML = "Our server is currently unreachable or down.<br>We're working to restore service. Please try again in a few minutes.";
      lastFailTime = Date.now();
    })
    .finally(() => {
      isRequestInProgress = false;
      // Button will be re-enabled by countdown
    });
}

manualLink.addEventListener('click', (e) => {
  e.preventDefault();
  fetch(ltLink, { method: 'HEAD', mode: 'no-cors' })
    .then(() => window.location.href = ltLink)
    .catch(() => {
      alert('Server is still unreachable. Please try again later.');
    });
});

retryBtn.addEventListener('click', () => tryRedirect(true));

// Initial state: show loading, hide fallback
loadingAnim.style.display = '';
fallbackCard.style.display = 'none';
tryRedirect(); 
