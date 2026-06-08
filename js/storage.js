const Storage = {
  KEY_STARS: 'ct_stars',
  KEY_UNLOCKED: 'ct_unlocked_themes',
  KEY_HIGHSCORE: 'ct_highscore',

  getStars() {
    return parseInt(localStorage.getItem(this.KEY_STARS) || '0', 10);
  },

  addStars(n) {
    const current = this.getStars();
    localStorage.setItem(this.KEY_STARS, String(current + n));
  },

  unlockTheme(themeKey) {
    const list = this.getUnlockedThemes();
    if (!list.includes(themeKey)) {
      list.push(themeKey);
      localStorage.setItem(this.KEY_UNLOCKED, JSON.stringify(list));
    }
  },

  getUnlockedThemes() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY_UNLOCKED) || '["cinema"]');
    } catch {
      return ['cinema'];
    }
  },

  isThemeUnlocked(themeKey) {
    return this.getUnlockedThemes().includes(themeKey);
  },

  getHighScore() {
    return parseInt(localStorage.getItem(this.KEY_HIGHSCORE) || '0', 10);
  },

  setHighScore(score) {
    if (score > this.getHighScore()) {
      localStorage.setItem(this.KEY_HIGHSCORE, String(score));
    }
  },

  getThemeBestScore(themeKey) {
    try {
      const data = JSON.parse(localStorage.getItem('ct_theme_scores') || '{}');
      return parseInt(data[themeKey] || '0', 10);
    } catch {
      return 0;
    }
  },

  setThemeBestScore(themeKey, score) {
    try {
      const data = JSON.parse(localStorage.getItem('ct_theme_scores') || '{}');
      if (score > (data[themeKey] || 0)) {
        data[themeKey] = score;
        localStorage.setItem('ct_theme_scores', JSON.stringify(data));
      }
    } catch {}
  }
};
