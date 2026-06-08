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
  wrongCount: 0,
  timer: null,
  countdown: null,
  remainingTime: 0,
  reversedCols: false,
  reversedRows: false,

  start(themeKey, difficultyIndex) {
    this.theme = THEMES[themeKey];
    this.difficulty = DIFFICULTIES[difficultyIndex];
    this.state.round = 0;
    this.state.score = 0;
    this.state.combo = 0;
    this.wrongCount = 0;
    this.reversedCols = false;
    this.reversedRows = false;

    // 挑战模式：随机反转行列标签方向，考验空间感
    if (this.difficulty.mode === 'mixed') {
      this.reversedCols = Math.random() > 0.5;
      this.reversedRows = Math.random() > 0.5;
    }

    Board.render(this.difficulty.rows, this.difficulty.cols, this.theme, this.reversedCols, this.reversedRows);
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

    this.state.target = {
      row: Math.floor(Math.random() * this.difficulty.rows),
      col: Math.floor(Math.random() * this.difficulty.cols)
    };

    const mode = this.difficulty.mode;

    // 基础模式：放置干扰小动物
    if (mode === 'distract') {
      const count = Math.min(3, Math.floor(this.difficulty.rows * this.difficulty.cols / 5));
      Board.placeDistractors(this.state.target.row, this.state.target.col, count);
    }

    // 进阶模式（反向考）：先显示角色，让孩子回答坐标
    if (mode === 'reverse') {
      Board.showCharacter(this.state.target.row, this.state.target.col, this.theme.character);
      // 移除 correct 类，只是展示而非答对
      const targetCell = Board.cells[this.state.target.row]?.[this.state.target.col];
      if (targetCell) targetCell.classList.remove('correct');
    }

    UI.updatePrompt(this.state.target, this.theme, mode);
    UI.updateProgress(this.state.round, TOTAL_ROUNDS);
    UI.updateScore(this.state.score, this.state.combo);
    UI.clearHint();

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

    const isCorrect = row === this.state.target.row && col === this.state.target.col;
    const mode = this.difficulty.mode;

    if (isCorrect) {
      this.state.combo++;
      const gain = Math.min(this.state.combo, MAX_STARS_PER_ROUND);
      this.state.score += gain;
      Sound.correct();
      if (this.state.combo >= 2) {
        setTimeout(() => Sound.combo(), 300);
      }
      Board.showCharacter(row, col, this.theme.character);
      UI.updateScore(this.state.score, this.state.combo);

      if (mode === 'reverse') {
        UI.showHint(`答对啦！这是 ${this.theme.rowLabel(row)} ${this.theme.colLabel(col)}！`);
      }

      setTimeout(() => this.nextRound(), 1600);
    } else {
      this.state.combo = 0;
      this.wrongCount++;
      Sound.wrong();

      // 教学化提示：根据错因给出不同引导
      const clickedCell = Board.cells[row]?.[col];
      const isDistractor = clickedCell && clickedCell.dataset.distractor;
      const rowCorrect = row === this.state.target.row;
      const colCorrect = col === this.state.target.col;

      if (isDistractor) {
        UI.showHint(`这里住着 ${clickedCell.textContent}，不是我们要找的位置哦～要找的是 ${this.theme.rowLabel(this.state.target.row)} ${this.theme.colLabel(this.state.target.col)}`);
      } else if (rowCorrect && !colCorrect) {
        const dir = col < this.state.target.col ? '往右' : '往左';
        UI.showHint(`嗯～${this.theme.rowLabel(row)} 对了，但座号不对哦，${dir}数几格试试？`);
      } else if (!rowCorrect && colCorrect) {
        const dir = row < this.state.target.row ? '往下' : '往上';
        UI.showHint(`嗯～${this.theme.colLabel(col)} 对了，但排数不对哦，${dir}数一排试试？`);
      } else {
        UI.showHint(`嗯～我们找的是 ${this.theme.rowLabel(this.state.target.row)} ${this.theme.colLabel(this.state.target.col)}，从这里开始数：先找排，再找座！`);
      }

      Board.showWrong(row, col, this.state.target.row, this.state.target.col);
      UI.updateScore(this.state.score, this.state.combo);

      setTimeout(() => {
        if (this.state.round < TOTAL_ROUNDS) {
          this.nextRound();
        } else {
          this.endGame();
        }
      }, 2800);
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
    this.wrongCount++;
    Sound.wrong();
    UI.updateScore(this.state.score, this.state.combo);
    UI.showHint(`时间到！正确答案是 ${this.theme.rowLabel(this.state.target.row)} ${this.theme.colLabel(this.state.target.col)}，下次加油！`);

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
    }, 2200);
  },

  endGame() {
    clearInterval(this.countdown);
    const themeKey = this.getThemeKey();
    Storage.addStars(this.state.score);
    Storage.setHighScore(this.state.score);
    Storage.setThemeBestScore(themeKey, this.state.score);

    // 解锁逻辑：当前主题拿到 8 星以上即可解锁下一个
    const keys = Object.keys(THEMES);
    const idx = keys.indexOf(themeKey);
    if (this.state.score >= 8 && idx >= 0 && idx + 1 < keys.length) {
      Storage.unlockTheme(keys[idx + 1]);
    }

    UI.showEndScreen(this.state.score, Storage.getHighScore(), this.theme.name, this.wrongCount);
    Sound.win();
  },

  getThemeKey() {
    return Object.keys(THEMES).find(k => THEMES[k] === this.theme) || 'cinema';
  }
};
