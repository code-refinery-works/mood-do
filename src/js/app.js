(() => {
    /* =============================================
       THEME DATA
    ============================================= */
    const themes = {
      energy: {
        bodyClass: 'mood-energy',
        quotes: [
          '🔥 今日は絶好調！ガンガン片付けて最高の一日にしよう！',
          '💪 お前ならできる。全部終わらせて笑顔でゴールテープを切れ！',
          '⚡ 限界は決めるな。今日の自分、昨日の自分を超えろ！'
        ],
        placeholder: '今日やっつけるタスクは？💪',
        allDoneMsg: '🎉 全タスク完了！今日の自分は最強だ！！！',
        completionMsg: (text) => `🔥 「${text}」 爆速でクリア！！`,
      },
      chill: {
        bodyClass: 'mood-chill',
        quotes: [
          '🌿 焦らなくて大丈夫。お茶でも飲みながらマイペースに。',
          '☁️ 今日もゆるりと。できたことを褒めてあげてね。',
          '🍃 急がなくていいよ。自分のペースが一番。'
        ],
        placeholder: 'のんびりやりたいこと... 🍵',
        allDoneMsg: '🌿 全部できたね。今日もお疲れ様でした、えらい！',
        completionMsg: (text) => `🌿 「${text}」 ゆっくりお疲れ様〜`,
      },
      low: {
        bodyClass: 'mood-low',
        quotes: [
          '🌙 無理は禁物。生きてるだけで100点満点。1個できたら奇跡！',
          '💜 今日は休む日でもいい。それだけで十分。',
          '🌛 小さな一歩でいい。あなたは今日もよくがんばってる。'
        ],
        placeholder: '今日だけは外せないこと（1つでOK）',
        allDoneMsg: '💜 全部できた…！ほんとに、ほんとにえらかった。',
        completionMsg: (text) => `💜 「${text}」 えらい！ほんとによくやった🌙`,
      },
      focus: {
        bodyClass: 'mood-focus',
        quotes: [
          '🎯 余計なことは考えない。目の前の1つに没頭する時間。',
          '⬛ ノイズを消せ。タスクと自分だけの空間を作れ。',
          '▶ 考えるな、動け。完璧より完了を。'
        ],
        placeholder: '次のアクションを入力...',
        allDoneMsg: '✓ ALL TASKS COMPLETED. 完璧な集中力だった。',
        completionMsg: (text) => `✓ DONE: 「${text}」`,
      }
    };

    /* =============================================
       STATE
    ============================================= */
    let currentMood = localStorage.getItem('mooddo_mood') || 'energy';
    let todos = [];
    try { todos = JSON.parse(localStorage.getItem('mooddo_todos')) || []; } catch(e) { todos = []; }
    if (todos.length === 0) {
      todos = [{ id: Date.now(), text: 'アプリの気分をいろいろ変えてみる', completed: false }];
    }
    let quoteIndex = {};

    /* =============================================
       DATE
    ============================================= */
    const now = new Date();
    const dateStr = now.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
    document.getElementById('today-date').textContent = dateStr;

    /* =============================================
       APPLY THEME
    ============================================= */
    function applyTheme(mood) {
      const theme = themes[mood];
      const body = document.body;

      // body class
      body.className = theme.bodyClass;

      // Quote（ランダム or インクリメント）
      const qi = quoteIndex[mood] !== undefined ? quoteIndex[mood] : Math.floor(Math.random() * theme.quotes.length);
      quoteIndex[mood] = qi;
      const quoteEl = document.getElementById('mood-quote');
      quoteEl.style.opacity = '0';
      quoteEl.style.transform = 'translateY(4px)';
      setTimeout(() => {
        quoteEl.textContent = theme.quotes[qi];
        quoteEl.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        quoteEl.style.opacity = '1';
        quoteEl.style.transform = 'translateY(0)';
      }, 200);

      // Input placeholder
      document.getElementById('todo-input').placeholder = theme.placeholder;

      // Active mood button
      document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mood === mood);
      });

      renderTodos();
    }

    /* =============================================
       SET MOOD
    ============================================= */
    function setMood(mood) {
      currentMood = mood;
      localStorage.setItem('mooddo_mood', mood);
      applyTheme(mood);
    }
    window.setMood = setMood;

    /* =============================================
       SAVE
    ============================================= */
    function save() {
      localStorage.setItem('mooddo_todos', JSON.stringify(todos));
    }

    /* =============================================
       RENDER
    ============================================= */
    function renderTodos() {
      const list = document.getElementById('todo-list');
      const allDoneEl = document.getElementById('all-done');
      const theme = themes[currentMood];
      list.innerHTML = '';

      const total = todos.length;
      const done = todos.filter(t => t.completed).length;

      // Progress
      const pct = total === 0 ? 0 : Math.round((done / total) * 100);
      document.getElementById('progress-label').textContent = `${done} / ${total} 完了`;
      document.getElementById('progress-percent').textContent = pct + '%';
      document.getElementById('progress-fill').style.width = pct + '%';

      // All done
      if (total > 0 && done === total) {
        allDoneEl.style.display = 'block';
        allDoneEl.textContent = theme.allDoneMsg;
        allDoneEl.style.marginBottom = todos.length ? '12px' : '0';
      } else {
        allDoneEl.style.display = 'none';
      }

      if (todos.length === 0) {
        const emptyLi = document.createElement('li');
        emptyLi.className = 'empty-state';
        emptyLi.innerHTML = `<div class="empty-icon">📋</div>タスクはありません<br><span style="font-size:11px">上のフォームから追加してみよう</span>`;
        list.appendChild(emptyLi);
        return;
      }

      todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item' + (todo.completed ? ' completed' : '');
        li.dataset.id = todo.id;

        // Checkmark SVG
        const checkSVG = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2 6L5 9L10 3" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

        li.innerHTML = `
          <div class="todo-check ${todo.completed ? 'checked' : ''}" onclick="toggleTodo(${todo.id})">
            ${todo.completed ? checkSVG : ''}
          </div>
          <span class="todo-text" onclick="toggleTodo(${todo.id})">${escapeHtml(todo.text)}</span>
          <button class="todo-delete" onclick="deleteTodo(${todo.id})" title="削除">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        `;

        // Animate in
        li.style.opacity = '0';
        li.style.transform = 'translateY(6px)';
        list.appendChild(li);
        requestAnimationFrame(() => {
          li.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
          li.style.opacity = todo.completed ? '0.45' : '1';
          li.style.transform = 'translateY(0)';
        });
      });
    }

    /* =============================================
       TOGGLE
    ============================================= */
    function toggleTodo(id) {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;
      todo.completed = !todo.completed;
      save();

      if (todo.completed) {
        const theme = themes[currentMood];
        if (currentMood === 'energy') {
          launchConfetti();
        } else {
          showToast(theme.completeMsg);
        }
      }
      renderTodos();
    }
    window.toggleTodo = toggleTodo;

    /* =============================================
       DELETE
    ============================================= */
    function deleteTodo(id) {
      const li = document.querySelector(`.todo-item[data-id="${id}"]`);
      if (li) {
        li.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        li.style.opacity = '0';
        li.style.transform = 'translateX(12px)';
        setTimeout(() => {
          todos = todos.filter(t => t.id !== id);
          save();
          renderTodos();
        }, 200);
      } else {
        todos = todos.filter(t => t.id !== id);
        save();
        renderTodos();
      }
    }
    window.deleteTodo = deleteTodo;

    /* =============================================
       ESCAPE HTML
    ============================================= */
    function escapeHtml(str) {
      return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    /* =============================================
       TOAST
    ============================================= */
    function showToast(msg) {
      const toast = document.getElementById('toast');
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2800);
    }

    /* =============================================
       CONFETTI (energy mode)
    ============================================= */
    function launchConfetti() {
      const canvas = document.getElementById('confetti-canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.display = 'block';

      const colors = ['#f97316','#facc15','#fb923c','#fde68a','#ef4444','#fbbf24'];
      const particles = Array.from({length: 80}, () => ({
        x: Math.random() * canvas.width,
        y: -10,
        r: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 4 + 2,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.2,
        shape: Math.random() > 0.5 ? 'rect' : 'circle'
      }));

      let frame = 0;
      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.fillStyle = p.color;
          if (p.shape === 'rect') {
            ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.r, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
          p.x += p.vx;
          p.y += p.vy;
          p.angle += p.spin;
          p.vy += 0.08;
        });
        frame++;
        if (frame < 90) requestAnimationFrame(draw);
        else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          canvas.style.display = 'none';
        }
      }
      draw();
      showToast('🔥 やったー！最高だ！');
    }

    /* =============================================
       FOCUS TIMER
    ============================================= */
    let timerInterval = null;
    let timerSeconds = 25 * 60;
    let timerRunning = false;

    function formatTime(s) {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    }

    function updateTimerDisplay() {
      const el = document.getElementById('timer-display');
      if (el) el.textContent = formatTime(timerSeconds);
    }

    function toggleTimer() {
      const btn = document.getElementById('timer-btn');
      if (!timerRunning) {
        timerRunning = true;
        if (btn) btn.textContent = '⏸ 一時停止';
        timerInterval = setInterval(() => {
          timerSeconds--;
          updateTimerDisplay();
          if (timerSeconds <= 0) {
            clearInterval(timerInterval);
            timerRunning = false;
            timerSeconds = 25 * 60;
            updateTimerDisplay();
            if (btn) btn.textContent = '▶ 開始';
            showToast('🎯 25分集中、お疲れ様！');
          }
        }, 1000);
      } else {
        timerRunning = false;
        clearInterval(timerInterval);
        if (btn) btn.textContent = '▶ 再開';
      }
    }

    function resetTimer() {
      clearInterval(timerInterval);
      timerRunning = false;
      timerSeconds = 25 * 60;
      updateTimerDisplay();
      const btn = document.getElementById('timer-btn');
      if (btn) btn.textContent = '▶ 開始';
    }

    window.toggleTimer = toggleTimer;
    window.resetTimer = resetTimer;

    /* =============================================
       FORM SUBMIT
    ============================================= */
    document.getElementById('todo-form').addEventListener('submit', e => {
      e.preventDefault();
      const input = document.getElementById('todo-input');
      const text = input.value.trim();
      if (!text) return;
      todos.push({ id: Date.now(), text, completed: false });
      input.value = '';
      save();
      renderTodos();
      // Pulse add button
      const btn = document.getElementById('add-btn');
      btn.style.transform = 'scale(0.92)';
      setTimeout(() => btn.style.transform = 'scale(1)', 150);
    });

    /* =============================================
       INIT
    ============================================= */
    // Date
    const now = new Date();
    const dateStr = now.toLocaleDateString('ja-JP', { year:'numeric', month:'short', day:'numeric', weekday:'short' });
    document.getElementById('today-date').textContent = dateStr;

    applyTheme(currentMood);