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
  traag: '30s',
  gewoon: '20s',
  snel: '10s'
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

let usedLeftPositions = [];

function createWord(word, side, index) {
  const div = document.createElement('div');
  div.className = 'word';
  div.textContent = word;
  div.dataset.index = index;

  const maxColumns = 6;
  if (usedLeftPositions.length >= maxColumns) {
    usedLeftPositions = [];
  }

  let column;
  do {
    column = Math.floor(Math.random() * maxColumns);
  } while (usedLeftPositions.includes(column));

  usedLeftPositions.push(column);

  const leftPercent = 10 + column * (80 / maxColumns);
  div.style.left = `${leftPercent}%`;

  div.style.animationDuration = valTijden[snelheid];
  div.addEventListener('click', () => selectWord(side, div));
  div.addEventListener('animationend', () => {
    if (div.parentElement) div.remove();
  });
  return div;
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

  let delay = 0;
  leftWords.forEach(wordObj => {
    setTimeout(() => {
      const wordDiv = createWord(wordObj.word, 'left', wordObj.index);
      left.appendChild(wordDiv);
    }, delay);
    delay += 300;
  });

  delay = 0;
  rightWords.forEach(wordObj => {
    setTimeout(() => {
      const wordDiv = createWord(wordObj.word, 'right', wordObj.index);
      right.appendChild(wordDiv);
    }, delay);
    delay += 300;
  });
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
