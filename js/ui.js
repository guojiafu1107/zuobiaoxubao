const UI = {
  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');
  },

  updatePrompt(target, theme) {
    const prompt = document.getElementById('prompt-area');
    if (prompt) {
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

  showEndScreen(score, highScore) {
    const starsContainer = document.getElementById('final-stars');
    const message = document.getElementById('final-message');
    if (starsContainer) {
      const fullStars = '⭐'.repeat(Math.min(score, 10));
      const emptyStars = '☆'.repeat(Math.max(0, 10 - score));
      starsContainer.textContent = fullStars + emptyStars;
    }
    if (message) {
      if (score >= 25) {
        message.textContent = '太神了！你是坐标大师！🏆';
      } else if (score >= 15) {
        message.textContent = '好厉害！继续保持！🌟';
      } else if (score >= 8) {
        message.textContent = '不错哦，再试一次吧！👍';
      } else {
        message.textContent = '加油！多练习就能找到宝藏啦！💪';
      }
      if (score >= highScore && score > 0) {
        message.textContent += ' （新纪录！）';
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

    // 主题标签
    const themeTitle = document.createElement('div');
    themeTitle.className = 'label-title';
    themeTitle.textContent = '选择场景';
    themeSelector.appendChild(themeTitle);

    let firstThemeBtn = null;
    Object.entries(THEMES).forEach(([key, theme]) => {
      const btn = document.createElement('button');
      btn.className = 'selector-btn';
      btn.textContent = theme.name;
      if (!Storage.isThemeUnlocked(key)) {
        btn.textContent += ' 🔒';
        btn.disabled = true;
        btn.style.opacity = '0.5';
      }
      btn.addEventListener('click', () => {
        themeSelector.querySelectorAll('.selector-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        Sound.click();
        onThemeChange(key);
      });
      themeSelector.appendChild(btn);
      if (!firstThemeBtn && !btn.disabled) firstThemeBtn = btn;
    });
    if (firstThemeBtn) firstThemeBtn.classList.add('selected');

    // 难度标签
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
