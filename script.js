const diceCountSelect = document.getElementById('diceCount');
const diceSettings = document.getElementById('diceSettings');
const diceContainer = document.getElementById('diceContainer');
const rollButton = document.getElementById('rollButton');
const randomColorsButton = document.getElementById('randomColorsButton');
const clearHistoryButton = document.getElementById('clearHistoryButton');
const historyList = document.getElementById('historyList');
const rollSummary = document.getElementById('rollSummary');

function generateRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  const toHex = (value) => value.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const state = {
  diceCount: Number(diceCountSelect.value),
  diceColors: Array.from({ length: 6 }, () => generateRandomColor()),
  diceValues: Array(6).fill(1),
  history: []
};

function getPipPositions(value) {
  const map = {
    1: ['1,1'],
    2: ['0,2', '2,0'],
    3: ['0,2', '1,1', '2,0'],
    4: ['0,0', '0,2', '2,0', '2,2'],
    5: ['0,0', '0,2', '1,1', '2,0', '2,2'],
    6: ['0,0', '0,2', '1,0', '1,2', '2,0', '2,2']
  };

  return map[value] || [];
}

function renderDiceControls() {
  diceSettings.innerHTML = '';

  for (let index = 0; index < state.diceCount; index += 1) {
    const row = document.createElement('div');
    row.className = 'dice-color-row';

    const label = document.createElement('label');
    label.textContent = `骰子 ${index + 1}`;

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = state.diceColors[index];
    colorInput.setAttribute('aria-label', `設定骰子 ${index + 1} 顏色`);
    colorInput.addEventListener('input', (event) => {
      state.diceColors[index] = event.target.value;
      renderDiceValues();
    });

    row.appendChild(label);
    row.appendChild(colorInput);
    diceSettings.appendChild(row);
  }
}

function renderDiceValues() {
  diceContainer.innerHTML = '';

  for (let index = 0; index < state.diceCount; index += 1) {
    const die = document.createElement('div');
    die.className = 'die';
    die.style.setProperty('--die-color', state.diceColors[index]);

    const pipGrid = document.createElement('div');
    pipGrid.className = 'pip-grid';

    const value = state.diceValues[index] || 1;
    const pipSet = new Set(getPipPositions(value));

    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        const pip = document.createElement('span');
        pip.className = `pip ${pipSet.has(`${row},${col}`) ? 'filled' : ''}`;
        pipGrid.appendChild(pip);
      }
    }

    die.appendChild(pipGrid);
    diceContainer.appendChild(die);
  }
}

function renderHistory() {
  historyList.innerHTML = '';

  if (state.history.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'empty-history';
    emptyItem.textContent = '目前尚無擲骰紀錄';
    historyList.appendChild(emptyItem);
    return;
  }

  state.history.forEach((entry, index) => {
    const item = document.createElement('li');
    item.className = 'history-item';

    const info = document.createElement('div');
    info.innerHTML = `<strong>第 ${state.history.length - index} 次</strong><div>點數: ${entry.values.join(', ')} | 總和: ${entry.total}</div>`;

    item.appendChild(info);
    historyList.appendChild(item);
  });
}

function updateRollSummary(values) {
  const total = values.reduce((sum, value) => sum + value, 0);

  if (values.length === 1) {
    rollSummary.textContent = `結果：${values[0]} 點，總和：${total}`;
    return;
  }

  rollSummary.textContent = `結果：${values.join(', ')}，總和：${total}`;
}

function randomValue() {
  return Math.floor(Math.random() * 6) + 1;
}

function rollDice() {
  const values = [];

  for (let index = 0; index < state.diceCount; index += 1) {
    const die = diceContainer.children[index];
    if (die) {
      die.classList.add('rolling');
    }

    const value = randomValue();
    values.push(value);
    state.diceValues[index] = value;
  }

  setTimeout(() => {
    for (let index = 0; index < state.diceCount; index += 1) {
      const die = diceContainer.children[index];
      if (die) {
        die.classList.remove('rolling');
      }
    }

    renderDiceValues();
    updateRollSummary(values);

    state.history.unshift({
      values: [...values],
      total: values.reduce((sum, value) => sum + value, 0)
    });

    if (state.history.length > 20) {
      state.history = state.history.slice(0, 20);
    }

    renderHistory();
  }, 300);
}

function syncDiceCount() {
  state.diceCount = Number(diceCountSelect.value);

  while (state.diceColors.length < state.diceCount) {
    state.diceColors.push(generateRandomColor());
  }

  state.diceColors = state.diceColors.slice(0, state.diceCount);
  state.diceValues = Array.from({ length: state.diceCount }, (_, index) => state.diceValues[index] || 1);

  renderDiceControls();
  renderDiceValues();
}

function randomizeDiceColors() {
  state.diceColors = Array.from({ length: state.diceCount }, () => generateRandomColor());
  renderDiceControls();
  renderDiceValues();
}

function clearHistory() {
  state.history = [];
  renderHistory();
  rollSummary.textContent = '尚未擲骰';
}

diceCountSelect.addEventListener('change', syncDiceCount);
rollButton.addEventListener('click', rollDice);
randomColorsButton.addEventListener('click', randomizeDiceColors);
clearHistoryButton.addEventListener('click', clearHistory);

syncDiceCount();
renderHistory();
