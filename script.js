const left = document.getElementById('left');
const right = document.getElementById('right');
const scoreDisplay = document.getElementById('score');
const taalKeuzeDiv = document.getElementById('taalkeuze');

let pairs = [];
let selected = { left: null, right: null };
let score = 0;
let huidigeTaal = null;
let snelheid = 'gewoon';

const valTijden = {
  traag: 30000,
  gewoon: 20000,
  snel: 10000
};

function kiesTaal(taal) {
  huidigeTaal = taal;
  taalKeuzeDiv.style.display = 'none';

  fetch(`woorden_${taal}.csv`)
    .then(res => res.text())
    .then(text => {
      const lines = text.trim().split('\n');
      pairs = lines.map(line => {
        const [leftWord, rightWord] = line.split(',');
        return { left: leftWord.trim(), right: rightWord.trim() };
      });
      startGame();
    })
    .catch(err => console.error('Fout bij laden CSV:', err));
}

function kiesSnelheid(s) {
  snelheid = s;
  document.querySelectorAll("#snelheidskeuze button").forEach(btn => btn.disabled = false);
  event.target.disabled = true;
}

function startGame() {
  left.innerHTML = '';
  right.innerHTML = '';
  score = 0;
  updateScore();

  const leftWords = pairs.map((pair, index) => ({ word: pair.left, index }));
  const rightWords = pairs.map((pair, index) => ({ word: pair.right, index }));

  shuffleArray(leftWords);
  shuffleArray(rightWords);

  const leftSchedule = scheduleWords(leftWords, 'left');
  const rightSchedule = scheduleWords(rightWords, 'right');

  leftSchedule.forEach(({ wordObj, delay, column }) => {
    setTimeout(() => {
      const wordDiv = createWord(wordObj.word, 'left', wordObj.index, column);
      left.appendChild(wordDiv);
    }, delay);
  });

  rightSchedule.forEach(({ wordObj, delay, column }) => {
    setTimeout(() => {
      const wordDiv = createWord(wordObj.word, 'right', wordObj.index, column);
      right.appendChild(wordDiv);
    }, delay);
  });
}

function scheduleWords(wordList, side) {
  const maxColumns = 6;
  const columnTimers = new Array(maxColumns).fill(0); // Tijd beschikbaar per kolom
  const spacing = 1000; // minimaal 1 seconde tussen woorden in dezelfde kolom
  const duration = valTijden[snelheid];

  const result = [];

  wordList.forEach((wordObj, i) => {
    let chosenColumn = 0;
    let earliestTime = columnTimers[0];

    for (let col = 1; col < maxColumns; col++) {
      if (columnTimers[col] < earliestTime) {
        earliestTime = columnTimers[col];
        chosenColumn = col;
      }
    }

    const delay = columnTimers[chosenColumn];
    columnTimers[chosenColumn] = delay + spacing;

    result.push({ wordObj, delay: delay + i * 100, column: chosenColumn });
  });

  return result;
}

function createWord(word, side, index, column) {
  const div = document.createElement('div');
  div.className = 'word';
  div.textContent = word;
  div.dataset.index = index;

  const maxColumns = 6;
  const columnWidth = 80 / maxColumns;
  const baseOffset = 10;

  const leftPercent = baseOffset + column * columnWidth;
  div.style.left = `${leftPercent}%`;

  div.style.animationDuration = `${valTijden[snelheid]}ms`;
  div.addEventListener('click', () => selectWord(side, div));
  div.addEventListener('animationend', () => {
    if (div.parentElement) div.remove();
  });
  return div;
}

function resetSpel() {
  if (huidigeTaal) kiesTaal(huidigeTaal);
}

function naarHome() {
  left.innerHTML = '';
  right.innerHTML = '';
  score = 0;
  updateScore();
  taalKeuzeDiv.style.display = 'block';
}

function selectWord(side, element) {
  const otherSide = side === 'left' ? 'right' : 'left';

  if (selected[side]) selected[side].classList.remove('selected');
  selected[side] = element;
  element.classList.add('selected');

  if (selected.left && selected.right) {
    const leftIndex = selected.left.dataset.index;
    const rightIndex = selected.right.dataset.index;

    if (leftIndex === rightIndex) {
      selected.left.remove();
      selected.right.remove();
      score++;
      updateScore();
    }

    selected.left.classList.remove('selected');
    selected.right.classList.remove('selected');
    selected.left = null;
    selected.right = null;
  }
}

function updateScore() {
  scoreDisplay.textContent = score;
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}
