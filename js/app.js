document.addEventListener('DOMContentLoaded', () => {
  const appState = {
    selectedTheme: 'cinema',
    selectedDifficulty: 0
  };

  UI.renderSelectors(
    (key) => { appState.selectedTheme = key; },
    (index) => { appState.selectedDifficulty = index; }
  );

  document.getElementById('btn-start')?.addEventListener('click', () => {
    Sound.click();
    Game.start(appState.selectedTheme, appState.selectedDifficulty);
  });

  document.getElementById('btn-replay')?.addEventListener('click', () => {
    Sound.click();
    Game.start(appState.selectedTheme, appState.selectedDifficulty);
  });

  document.getElementById('btn-change-theme')?.addEventListener('click', () => {
    Sound.click();
    UI.renderSelectors(
      (key) => { appState.selectedTheme = key; },
      (index) => { appState.selectedDifficulty = index; }
    );
    UI.showScreen('start-screen');
  });

  // 用户首次交互解锁音频上下文（浏览器策略）
  document.body.addEventListener('click', () => {
    Sound._ensureCtx();
  }, { once: true });
});
