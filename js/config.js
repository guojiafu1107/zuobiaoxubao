const THEMES = {
  cinema: {
    name: '🎬 电影院',
    rowLabel: (i) => `第${i + 1}排`,
    colLabel: (i) => `第${i + 1}座`,
    character: '🐰',
    color: '#FFB347',
    unlockCost: 0
  },
  classroom: {
    name: '🏫 教室',
    rowLabel: (i) => `第${i + 1}排`,
    colLabel: (i) => `第${i + 1}桌`,
    character: '🐻',
    color: '#87CEEB',
    unlockCost: 8
  },
  playground: {
    name: '🎡 游乐场',
    rowLabel: (i) => `第${i + 1}行`,
    colLabel: (i) => `第${i + 1}列`,
    character: '🦁',
    color: '#FF69B4',
    unlockCost: 8
  }
};

const DIFFICULTIES = [
  { name: '🌱 入门', rows: 3, cols: 3, timeLimit: null, mode: 'normal' },
  { name: '🌿 基础', rows: 5, cols: 5, timeLimit: null, mode: 'distract' },
  { name: '🌳 进阶', rows: 7, cols: 7, timeLimit: 15, mode: 'reverse' },
  { name: '🏆 挑战', rows: 10, cols: 10, timeLimit: 10, mode: 'mixed' }
];

const DISTRACTORS = ['🐱', '🐶', '🐭', '🦊', '🐼'];
const TOTAL_ROUNDS = 10;
const MAX_STARS_PER_ROUND = 3;
