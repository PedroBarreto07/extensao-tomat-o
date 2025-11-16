document.addEventListener('DOMContentLoaded', () => {
  // --- Seletores de Elementos ---
  const timerDisplay = document.getElementById('timer');
  const startBtn = document.getElementById('start');
  const pauseBtn = document.getElementById('pause');
  const resetBtn = document.getElementById('reset');
  const getQuoteBtn = document.getElementById('getQuote');
  const quoteTextEl = document.getElementById('quoteText');
  const toggleHighlightBtn = document.getElementById('toggleHighlight');
  const apiStatusEl = document.getElementById('apiStatus');
  const themeToggleBtn = document.getElementById('themeToggle');
  const alarmSound = document.getElementById('alarm-sound');
  const installBtn = document.getElementById('btnInstall');

  // --- Variáveis de Estado ---
  let timerInterval = null;
  let totalSeconds = 25 * 60; // 25 minutos
  let isRunning = false;
  let isHighlighting = false;
  let highlightIntervalId = null;
  let deferredInstallPrompt = null; // guarda o beforeinstallprompt
  const API_URL = 'http://localhost:3000/api/quote'; // URL da API Docker

  // --- 1. Lógica do Pomodoro ---

  function updateTimerDisplay() {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(
      seconds
    ).padStart(2, '0')}`;
  }

  function startTimer() {
    if (isRunning) return;
    isRunning = true;
    startBtn.innerHTML = '<i class="fas fa-pause"></i> Pausar';
    pauseBtn.style.display = 'inline-flex';

    timerInterval = setInterval(() => {
      totalSeconds--;
      updateTimerDisplay();

      if (totalSeconds <= 0) {
        finishPomodoro();
      }
    }, 1000);
  }

  function pauseTimer() {
    if (!isRunning) return;
    isRunning = false;
    clearInterval(timerInterval);
    startBtn.innerHTML = '<i class="fas fa-play"></i> Continuar';
    pauseBtn.style.display = 'none';
  }

  function resetTimer(autoStart = false) {
    clearInterval(timerInterval);
    isRunning = false;
    totalSeconds = 25 * 60;
    updateTimerDisplay();
    startBtn.innerHTML = '<i class="fas fa-play"></i> Iniciar';
    pauseBtn.style.display = 'none';

    if (autoStart) {
      setTimeout(startTimer, 1000);
    }
  }

  function finishPomodoro() {
    clearInterval(timerInterval);
    isRunning = false;

    if (alarmSound) {
      alarmSound.currentTime = 0;
      alarmSound.play().catch((e) => console.warn('Erro ao tocar som:', e));
    }

    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }

    const oldTitle = document.title;
    document.title = 'Pomodoro Finalizado!';
    alert('Pomodoro finalizado! Hora de uma pausa.');
    document.title = oldTitle;

    resetTimer(true);
  }

  // --- 2. Lógica da API de Frases ---

  async function fetchQuote() {
    quoteTextEl.textContent = 'Buscando nova frase...';
    quoteTextEl.dataset.author = '';

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.statusText}`);
      }
      const data = await response.json();

      quoteTextEl.textContent = `${data.content}`;
      quoteTextEl.dataset.author = `— ${data.author}`;

      apiStatusEl.classList.remove('offline');
      apiStatusEl.classList.add('online');
    } catch (error) {
      console.error('Falha ao buscar frase:', error);
      quoteTextEl.textContent =
        'Não foi possível carregar a frase. Verifique a API.';
      quoteTextEl.dataset.author = 'Erro';

      apiStatusEl.classList.add('offline');
      apiStatusEl.classList.remove('online');
    }
  }

  // --- 3. Lógica do Destaque de Links ---

  function highlightLinks() {
    if (!isHighlighting) return;

    document
      .querySelectorAll('a[href]:not(.highlighted)')
      .forEach((link) => {
        link.classList.add('highlighted');
        link.classList.add('highlight-link');
        setTimeout(() => {
          link.classList.remove('highlight-link');
        }, 2000);
      });
  }

  function toggleHighlighting() {
    isHighlighting = !isHighlighting;

    if (isHighlighting) {
      toggleHighlightBtn.innerHTML =
        '<i class="fas fa-highlighter"></i> Destacar Links (ON)';
      toggleHighlightBtn.classList.add('active');
      highlightLinks();

      if (highlightIntervalId === null) {
        highlightIntervalId = setInterval(highlightLinks, 3000);
      }
    } else {
      toggleHighlightBtn.innerHTML =
        '<i class="fas fa-highlighter"></i> Destacar Links (OFF)';
      toggleHighlightBtn.classList.remove('active');
      if (highlightIntervalId !== null) {
        clearInterval(highlightIntervalId);
        highlightIntervalId = null;
      }
    }
  }

  // --- 4. Lógica do Tema (Light/Dark) ---

  function applyTheme(theme) {
    const icon = theme === 'dark' ? 'fa-moon' : 'fa-sun';
    document.documentElement.setAttribute('data-theme', theme);
    themeToggleBtn.innerHTML = `<i class="fas ${icon}"></i>`;
    localStorage.setItem('theme', theme);
  }

  function toggleTheme() {
    const currentTheme =
      document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
  }

  // --- 5. Lógica de Registro do PWA (Service Worker) ---

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      // caminho relativo para funcionar em GitHub Pages também
      navigator.serviceWorker
        .register('sw.js')
        .then((registration) => {
          console.log('Service Worker registrado com sucesso:', registration);
        })
        .catch((error) => {
          console.error('Falha ao registrar Service Worker:', error);
        });
    }
  }

  // --- 6. Lógica do botão de instalação do PWA ---

  // Escuta quando o navegador detecta que o app pode ser instalado
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    if (installBtn) {
      installBtn.style.display = 'block';
    }
  });

  // Clique no botão dispara o prompt nativo
  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;

      installBtn.disabled = true;
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      console.log('Resultado da instalação:', outcome);

      deferredInstallPrompt = null;
      installBtn.style.display = 'none';
    });
  }

  // --- Inicialização e Event Listeners ---

  // Botões do Pomodoro
  startBtn.addEventListener('click', () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  });

  pauseBtn.addEventListener('click', pauseTimer);
  resetBtn.addEventListener('click', () => resetTimer(false));

  // Botões de Ferramentas
  getQuoteBtn.addEventListener('click', fetchQuote);
  toggleHighlightBtn.addEventListener('click', toggleHighlighting);
  themeToggleBtn.addEventListener('click', toggleTheme);

  // Tema inicial
  const prefersDark =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('theme');
  applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

  // Atualiza o timer na tela
  updateTimerDisplay();

  // Busca a frase inicial
  fetchQuote();

  // Destaque automático de links
  toggleHighlighting();

  // Registra o Service Worker
  registerServiceWorker();
});