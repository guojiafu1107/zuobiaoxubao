const Game = {
  theme: THEMES.cinema,
  difficulty: DIFFICULTIES[0],
  state: {
    round: 0,
    score: 0,
    combo: 0,
    target: { row: 0, col: 0 },
    answered: false
  },
  timer: null,
  countdown: null,
  remainingTime: 0,

  start(themeKey, difficultyIndex) {
    this.theme = THEMES[themeKey];
    this.difficulty = DIFFICULTIES[difficultyIndex];
    this.state.round = 0;
    this.state.score = 0;
    this.state.combo = 0;
    Board.render(this.difficulty.rows, this.difficulty.cols, this.theme);
    UI.showScreen('game-screen');
    this.nextRound();
  },

  nextRound() {
    if (this.state.round >= TOTAL_ROUNDS) {
      this.endGame();
      return;
    }
    this.state.round++;
    this.state.answered = false;
    Board.resetCellStates();

    // 随机生成目标坐标
    this.state.target = {
      row: Math.floor(Math.random() * this.difficulty.rows),
      col: Math.floor(Math.random() * this.difficulty.cols)
    };

    UI.updatePrompt(this.state.target, this.theme);
    UI.updateProgress(this.state.round, TOTAL_ROUNDS);
    UI.updateScore(this.state.score, this.state.combo);

    if (this.difficulty.timeLimit) {
      this.startTimer();
    } else {
      UI.updateTimer(null);
    }
  },

  handleCellClick(row, col) {
    if (this.state.answered) return;
    this.state.answered = true;
    clearInterval(this.countdown);

    if (row === this.state.target.row && col === this.state.target.col) {
      // 正确
      this.state.combo++;
      const gain = Math.min(this.state.combo, MAX_STARS_PER_ROUND);
      this.state.score += gain;
      Sound.correct();
      if (this.state.combo >= 2) {
        setTimeout(() => Sound.combo(), 300);
      }
      Board.showCharacter(row, col, this.theme.character);
      UI.updateScore(this.state.score, this.state.combo);
      setTimeout(() => this.nextRound(), 1400);
    } else {
      // 错误
      this.state.combo = 0;
      Sound.wrong();
      Board.showWrong(row, col, this.state.target.row, this.state.target.col);
      UI.updateScore(this.state.score, this.state.combo);
      // 允许玩家观察后自动进入下一题
      setTimeout(() => {
        if (this.state.round < TOTAL_ROUNDS) {
          this.nextRound();
        } else {
          this.endGame();
        }
      }, 2500);
    }
  },

  startTimer() {
    clearInterval(this.countdown);
    this.remainingTime = this.difficulty.timeLimit;
    UI.updateTimer(this.remainingTime, false);

    this.countdown = setInterval(() => {
      this.remainingTime--;
      const urgent = this.remainingTime <= 5;
      UI.updateTimer(this.remainingTime, urgent);

      if (this.remainingTime <= 0) {
        clearInterval(this.countdown);
        this.handleTimeout();
      }
    }, 1000);
  },

  handleTimeout() {
    if (this.state.answered) return;
    this.state.answered = true;
    this.state.combo = 0;
    Sound.wrong();
    UI.updateScore(this.state.score, this.state.combo);

    // 自动提示正确位置
    Board.highlightCross(this.state.target.row, this.state.target.col);
    const target = Board.cells[this.state.target.row]?.[this.state.target.col];
    if (target) target.classList.add('target-reveal');

    setTimeout(() => {
      Board.clearHighlight();
      if (target) target.classList.remove('target-reveal');
      if (this.state.round < TOTAL_ROUNDS) {
        this.nextRound();
      } else {
        this.endGame();
      }
    }, 2000);
  },

  endGame() {
    clearInterval(this.countdown);
    Storage.addStars(this.state.score);
    Storage.setHighScore(this.state.score);

    // 解锁主题：达到15分解锁下一个场景
    if (this.state.score >= 15) {
      const keys = Object.keys(THEMES);
      const idx = keys.indexOf(this.getThemeKey());
      if (idx >= 0 && idx + 1 < keys.length) {
        Storage.unlockTheme(keys[idx + 1]);
      }
    }

    UI.showEndScreen(this.state.score, Storage.getHighScore());
    Sound.win();
  },

  getThemeKey() {
    return Object.keys(THEMES).find(k => THEMES[k] === this.theme) || 'cinema';
  }
};
