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

  const delayBetweenWords = 500;
  const leftSchedule = makeWordSchedule(leftWords, 'left', delayBetweenWords);
  const rightSchedule = makeWordSchedule(rightWords, 'right', delayBetweenWords);

  leftSchedule.forEach(({ wordObj, delay }) => {
    setTimeout(() => {
      const wordDiv = createWord(wordObj.word, 'left', wordObj.index);
      left.appendChild(wordDiv);
    }, delay);
  });

  rightSchedule.forEach(({ wordObj, delay }) => {
    setTimeout(() => {
      const wordDiv = createWord(wordObj.word, 'right', wordObj.index);
      right.appendChild(wordDiv);
    }, delay);
  });
}

function makeWordSchedule(wordList, side, baseDelay) {
  const maxColumns = 6;
  const columnStatus = new Array(maxColumns).fill(0); // houdt tijd bij per kolom
  const scheduled = [];

  wordList.forEach(wordObj => {
    // Zoek eerste vrije kolom
    let chosenColumn = 0;
    let earliest = columnStatus[0];
    for (let i = 1; i < maxColumns; i++) {
      if (columnStatus[i] < earliest) {
        earliest = columnStatus[i];
        chosenColumn = i;
      }
    }

    // Plan woord na earliest + kleine buffer (hier 200ms)
    const delay = columnStatus[chosenColumn] + 200;
    columnStatus[chosenColumn] = delay + valTijden[snelheid];
    wordObj.column = chosenColumn;
    scheduled.push({ wordObj, delay });
  });

  return scheduled;
}

function createWord(word, side, index) {
  const div = document.createElement('div');
  div.className = 'word';
  div.textContent = word;
  div.dataset.index = index;

  const maxColumns = 6;
  const columnWidth = 80 / maxColumns;
  const offset = side === 'left' ? 10 : 10; // Begin bij 10% van zijkant

  // Haal kolom uit geplande waarde op basis van dataset (ingepland in startGame)
  const existingWord = pairs.find(pair => pair.left === word || pair.right === word);
  const column = existingWord && existingWord.column !== undefined ? existingWord.column : Math.floor(Math.random() * maxColumns);
  const leftPercent = offset + column * columnWidth;
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
