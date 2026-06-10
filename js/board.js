const Board = {
  currentRows: 5,
  currentCols: 5,
  cells: [],

  render(rows, cols, theme, reversedCols = false, reversedRows = false) {
    this.currentRows = rows;
    this.currentCols = cols;

    const grid = document.getElementById('grid');
    const colLabels = document.getElementById('col-labels');
    const rowLabels = document.getElementById('row-labels');

    const cellSize = getComputedStyle(document.documentElement).getPropertyValue('--cell-size').trim() || '48px';
    const labelSize = getComputedStyle(document.documentElement).getPropertyValue('--label-size').trim() || '32px';

    grid.style.gridTemplateColumns = `repeat(${cols}, ${cellSize})`;
    grid.style.gridTemplateRows = `repeat(${rows}, ${cellSize})`;
    colLabels.style.gridTemplateColumns = `${labelSize} repeat(${cols}, ${cellSize})`;
    rowLabels.style.gridTemplateRows = `repeat(${rows}, ${cellSize})`;

    grid.innerHTML = '';
    colLabels.innerHTML = '';
    rowLabels.innerHTML = '';

    // 空白占位（与行标签列等宽）
    const spacer = document.createElement('div');
    colLabels.appendChild(spacer);

    // 列标签（支持反向）
    for (let c = 0; c < cols; c++) {
      const label = document.createElement('div');
      label.className = 'col-label';
      const displayCol = reversedCols ? cols - 1 - c : c;
      label.textContent = theme.colLabel(displayCol);
      label.dataset.col = c;
      colLabels.appendChild(label);
    }

    // 行标签和格子（支持反向）
    this.cells = [];
    for (let r = 0; r < rows; r++) {
      const rowLabel = document.createElement('div');
      rowLabel.className = 'row-label';
      const displayRow = reversedRows ? rows - 1 - r : r;
      rowLabel.textContent = theme.rowLabel(displayRow);
      rowLabel.dataset.row = r;
      rowLabels.appendChild(rowLabel);

      const rowArr = [];
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.setAttribute('role', 'gridcell');
        const actualRow = reversedRows ? rows - 1 - r : r;
        const actualCol = reversedCols ? cols - 1 - c : c;
        cell.setAttribute('aria-label', `${theme.rowLabel(actualRow)} ${theme.colLabel(actualCol)}`);
        cell.addEventListener('click', () => Game.handleCellClick(r, c));
        cell.addEventListener('mouseenter', () => this.highlightCross(r, c));
        cell.addEventListener('mouseleave', () => this.clearHighlight());
        grid.appendChild(cell);
        rowArr.push(cell);
      }
      this.cells.push(rowArr);
    }
  },

  highlightCross(row, col) {
    this.clearHighlight();

    const rowLabels = document.querySelectorAll('#row-labels .row-label');
    if (rowLabels[row]) rowLabels[row].classList.add('highlight');

    const colLabels = document.querySelectorAll('#col-labels .col-label');
    if (colLabels[col]) colLabels[col].classList.add('highlight');

    this.cells[row]?.forEach(cell => cell.classList.add('row-highlight'));
    for (let r = 0; r < this.currentRows; r++) {
      this.cells[r]?.[col]?.classList.add('col-highlight');
    }
    this.cells[row]?.[col]?.classList.add('cross-highlight');
  },

  clearHighlight() {
    document.querySelectorAll('.row-label, .col-label').forEach(el => el.classList.remove('highlight'));
    document.querySelectorAll('.cell').forEach(el => {
      el.classList.remove('row-highlight', 'col-highlight', 'cross-highlight');
    });
  },

  showCharacter(row, col, character) {
    const cell = this.cells[row]?.[col];
    if (!cell) return;
    cell.textContent = character;
    cell.classList.add('correct');
  },

  showWrong(row, col, correctRow, correctCol) {
    const wrongCell = this.cells[row]?.[col];
    if (wrongCell) {
      wrongCell.classList.add('wrong');
    }

    setTimeout(() => {
      this.highlightCross(correctRow, correctCol);
      const target = this.cells[correctRow]?.[correctCol];
      if (target) {
        target.classList.add('target-reveal');
      }
    }, 500);

    setTimeout(() => {
      this.clearHighlight();
      if (wrongCell) wrongCell.classList.remove('wrong');
      const target = this.cells[correctRow]?.[correctCol];
      if (target) target.classList.remove('target-reveal');
    }, 2200);
  },

  placeDistractors(targetRow, targetCol, count) {
    let placed = 0;
    let attempts = 0;
    while (placed < count && attempts < 100) {
      attempts++;
      const r = Math.floor(Math.random() * this.currentRows);
      const c = Math.floor(Math.random() * this.currentCols);
      if (r === targetRow && c === targetCol) continue;
      const cell = this.cells[r][c];
      if (cell.textContent) continue;
      const char = DISTRACTORS[Math.floor(Math.random() * DISTRACTORS.length)];
      cell.textContent = char;
      cell.dataset.distractor = '1';
      placed++;
    }
  },

  clearDistractors() {
    this.cells.flat().forEach(cell => {
      if (cell.dataset.distractor) {
        cell.textContent = '';
        delete cell.dataset.distractor;
      }
    });
  },

  resetCellStates() {
    this.cells.flat().forEach(cell => {
      cell.className = 'cell';
      cell.textContent = '';
      delete cell.dataset.distractor;
    });
  }
};
