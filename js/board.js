const Board = {
  currentRows: 5,
  currentCols: 5,
  cells: [],

  render(rows, cols, theme) {
    this.currentRows = rows;
    this.currentCols = cols;

    const grid = document.getElementById('grid');
    const colLabels = document.getElementById('col-labels');
    const rowLabels = document.getElementById('row-labels');

    grid.style.setProperty('--rows', rows);
    grid.style.setProperty('--cols', cols);
    colLabels.style.setProperty('--cols', cols);
    rowLabels.style.setProperty('--rows', rows);

    grid.innerHTML = '';
    colLabels.innerHTML = '';
    rowLabels.innerHTML = '';

    // 空白占位
    const spacer = document.createElement('div');
    colLabels.appendChild(spacer);

    // 列标签
    for (let c = 0; c < cols; c++) {
      const label = document.createElement('div');
      label.className = 'col-label';
      label.textContent = theme.colLabel(c);
      label.dataset.col = c;
      colLabels.appendChild(label);
    }

    // 行标签和格子
    this.cells = [];
    for (let r = 0; r < rows; r++) {
      const rowLabel = document.createElement('div');
      rowLabel.className = 'row-label';
      rowLabel.textContent = theme.rowLabel(r);
      rowLabel.dataset.row = r;
      rowLabels.appendChild(rowLabel);

      const rowArr = [];
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.setAttribute('role', 'gridcell');
        cell.setAttribute('aria-label', `${theme.rowLabel(r)} ${theme.colLabel(c)}`);
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

    // 短暂提示正确位置
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

  resetCellStates() {
    this.cells.flat().forEach(cell => {
      cell.className = 'cell';
      cell.textContent = '';
    });
  }
};
