const UI = {
  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');
  },

  updatePrompt(target, theme, mode) {
    const prompt = document.getElementById('prompt-area');
    if (!prompt) return;
    if (mode === 'reverse') {
      prompt.innerHTML = `${theme.character} 坐在哪里？请点一下它的位置！`;
    } else {
      prompt.innerHTML = `请找到 <strong>${theme.rowLabel(target.row)} ${theme.colLabel(target.col)}</strong>`;
    }
  },

  updateScore(score, combo) {
    const scoreArea = document.getElementById('score-area');
    if (scoreArea) {
      scoreArea.innerHTML = `⭐ ${score} / 连击 ×${combo}`;
    }
  },

  updateProgress(current, total) {
    const progress = document.getElementById('progress');
    if (progress) {
      progress.textContent = `第 ${current}/${total} 题`;
    }
  },

  updateTimer(seconds, urgent) {
    const timer = document.getElementById('timer');
    if (!timer) return;
    if (seconds === null) {
      timer.textContent = '';
      timer.classList.remove('urgent');
      return;
    }
    timer.textContent = `⏱️ ${seconds}s`;
    timer.classList.toggle('urgent', urgent);
  },

  showToast(message, duration = 2200) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
  },

  showHint(text) {
    let hint = document.getElementById('hint-bar');
    if (!hint) {
      hint = document.createElement('div');
      hint.id = 'hint-bar';
      const topBar = document.getElementById('top-bar');
      if (topBar) topBar.after(hint);
    }
    hint.textContent = text;
    hint.classList.add('show');
    clearTimeout(this._hintTimer);
    this._hintTimer = setTimeout(() => hint.classList.remove('show'), 3500);
  },

  clearHint() {
    const hint = document.getElementById('hint-bar');
    if (hint) hint.classList.remove('show');
  },

  showEndScreen(score, highScore, themeName, wrongCount) {
    const starsContainer = document.getElementById('final-stars');
    const message = document.getElementById('final-message');

    if (starsContainer) {
      starsContainer.innerHTML = '';
      const bigStars = Math.min(Math.floor(score / 3), 10);
      for (let i = 0; i < 10; i++) {
        const s = document.createElement('span');
        s.textContent = i < bigStars ? '⭐' : '☆';
        s.style.fontSize = 'clamp(1.5rem, 5vw, 2.5rem)';
        s.style.margin = '0 2px';
        starsContainer.appendChild(s);
      }
      const summary = document.createElement('div');
      summary.style.fontSize = '1rem';
      summary.style.color = 'var(--text-light)';
      summary.style.marginTop = '10px';
      summary.textContent = `共获得 ${score} 颗星（满分 30 颗）`;
      starsContainer.appendChild(summary);
    }

    if (message) {
      if (wrongCount === 0) {
        message.innerHTML = `🏆 全部找对啦！你在${themeName}当了一回超棒的导座员！`;
      } else if (wrongCount <= 2) {
        message.innerHTML = `🌟 真棒！只错了 ${wrongCount} 题，继续加油！`;
      } else if (wrongCount <= 5) {
        message.innerHTML = `👍 完成了！错了 ${wrongCount} 题，下次一定能更好！`;
      } else {
        message.innerHTML = `💪 完成了！多练习就能全对啦！`;
      }
      if (score >= highScore && score > 0) {
        message.innerHTML += '<br><small>（新纪录！）</small>';
      }
    }
    this.showScreen('end-screen');
  },

  renderSelectors(onThemeChange, onDifficultyChange) {
    const themeSelector = document.getElementById('theme-selector');
    const diffSelector = document.getElementById('difficulty-selector');
    if (!themeSelector || !diffSelector) return;

    themeSelector.innerHTML = '';
    diffSelector.innerHTML = '';

    const themeTitle = document.createElement('div');
    themeTitle.className = 'label-title';
    themeTitle.textContent = '选择场景';
    themeSelector.appendChild(themeTitle);

    const allKeys = Object.keys(THEMES);
    let firstThemeBtn = null;

    Object.entries(THEMES).forEach(([key, theme]) => {
      const btn = document.createElement('button');
      btn.className = 'selector-btn';
      btn.textContent = theme.name;
      const isLocked = !Storage.isThemeUnlocked(key);

      if (isLocked) {
        btn.textContent += ' 🔒';
        btn.style.opacity = '0.6';
        btn.style.cursor = 'not-allowed';
        const idx = allKeys.indexOf(key);
        const prevKey = idx > 0 ? allKeys[idx - 1] : null;
        const need = theme.unlockCost || 8;
        btn.addEventListener('click', () => {
          const prevName = prevKey ? THEMES[prevKey].name : '前一个场景';
          this.showToast(`先在${prevName}拿到 ${need}颗星 就能解锁哦～`);
        });
      } else {
        btn.addEventListener('click', () => {
          themeSelector.querySelectorAll('.selector-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          Sound.click();
          onThemeChange(key);
        });
      }

      themeSelector.appendChild(btn);
      if (!firstThemeBtn && !isLocked) firstThemeBtn = btn;
    });
    if (firstThemeBtn) firstThemeBtn.classList.add('selected');

    const diffTitle = document.createElement('div');
    diffTitle.className = 'label-title';
    diffTitle.textContent = '选择难度';
    diffSelector.appendChild(diffTitle);

    DIFFICULTIES.forEach((diff, index) => {
      const btn = document.createElement('button');
      btn.className = 'selector-btn';
      btn.textContent = diff.name;
      btn.addEventListener('click', () => {
        diffSelector.querySelectorAll('.selector-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        Sound.click();
        onDifficultyChange(index);
      });
      diffSelector.appendChild(btn);
    });
    diffSelector.querySelector('.selector-btn')?.classList.add('selected');
  }
};
