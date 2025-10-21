const motivationalQuotes = [
    "Hiç hata yapmamış bir insan, yeni bir şey denememiş demektir. - Albert Einstein",
    "Başarının sırrı, pes etmemektir. - Benjamin Franklin",
    "Yavaş gitmekten korkma, yerinde durmaktan kork. - Çin Atasözü",
    "Hatalar, denediğinizin kanıtıdır.",
    "En büyük zaferimiz hiç düşmemek değil, her düştüğümüzde yeniden ayağa kalkmaktır. - Konfüçyüs"
];
let activeWordList = [];
let currentWordData = {};
let usedWords = [];
let gameState = 'answering';
let currentLevel = 'a1';

const levelDisplay = document.getElementById('level-display');
const levelButtons = document.querySelectorAll('.level-btn');
const hintText = document.getElementById('hint-text');
const puzzleWordContainer = document.getElementById('puzzle-word');
const speakerIcon = document.getElementById('speaker-icon');
const userInput = document.getElementById('user-input');
const checkButton = document.getElementById('check-button');
const nextButton = document.getElementById('next-button');

// Sonuç kartı elemanları
const resultContainer = document.getElementById('result-container');
const resultAnswer = document.getElementById('result-answer');
const resultSpeaker = document.getElementById('result-speaker');
const resultMeaning = document.getElementById('result-meaning');
const resultImage = document.getElementById('result-image');
const resultMessage = document.getElementById('result-message');

function levelName(level) {
    return `Level: ${level.toUpperCase()} English`;
}

async function loadLevel(level) {
    try {
        const response = await fetch(`${level}_words.json`);
        if (!response.ok) { throw new Error('Kelime listesi yüklenemedi!'); }
        const data = await response.json();
        activeWordList = data;
        usedWords = [];
        currentLevel = level;
        levelDisplay.textContent = levelName(level);
        resetForNewWord();
    } catch (error) {
        console.error(error);
        alert(`${level.toUpperCase()} seviyesi yüklenirken bir hata oluştu. Lütfen dosyanın mevcut olduğundan emin olun.`);
    }
}

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function resetForNewWord() {
    if (activeWordList.length === 0) return;
    if (usedWords.length === activeWordList.length) { usedWords = []; }
    do {
        currentWordData = getRandomItem(activeWordList);
    } while (usedWords.includes(currentWordData.word));
    usedWords.push(currentWordData.word);

    puzzleWordContainer.classList.remove('long-word');
    if (currentWordData.word.length > 10) {
        puzzleWordContainer.classList.add('long-word');
    }

    speakerIcon.classList.add('hidden');
    hintText.textContent = currentWordData.hint;

    let display = '';
    const wordLetters = currentWordData.word.split('');
    const lettersToHide = Math.floor(wordLetters.length * 0.4);
    let hiddenIndices = new Set();
    while (hiddenIndices.size < lettersToHide) {
        hiddenIndices.add(Math.floor(Math.random() * wordLetters.length));
    }
    wordLetters.forEach((letter, index) => {
        display += hiddenIndices.has(index) ? ' _ ' : ` ${letter} `;
    });

    puzzleWordContainer.textContent = display;
    puzzleWordContainer.classList.remove('highlight', 'incorrect-answer-text');
    userInput.value = '';
    userInput.focus();
    userInput.disabled = false;

    resultContainer.classList.add('hidden');
    resultAnswer.textContent = '';
    resultSpeaker.classList.add('hidden');
    resultMeaning.textContent = '';
    resultImage.src = '';
    resultMessage.textContent = '';
    checkButton.style.display = "inline-block";
    nextButton.classList.add("hidden");

    gameState = 'answering';
}

function checkAnswer() {
    const userAnswer = userInput.value.toUpperCase().trim();

    resultContainer.classList.remove('hidden');
    resultImage.src = currentWordData.image || '';
    resultSpeaker.classList.remove('hidden');
    resultSpeaker.style.display = 'inline-block';

    if (userAnswer === currentWordData.word) {
        resultAnswer.textContent = currentWordData.word;
        resultAnswer.style.color = 'var(--success-color)';
        resultMeaning.textContent = `Türkçe Anlamı: ${currentWordData.translation}`;
        resultMessage.textContent = 'Harika! Doğru bildin! ✨';
        resultMessage.style.color = 'var(--success-color)';
    } else {
        resultAnswer.textContent = `Doğru Cevap: ${currentWordData.word}`;
        resultAnswer.style.color = 'var(--error-color)';
        resultMeaning.textContent = `Türkçe Anlamı: ${currentWordData.translation}`;
        resultMessage.textContent = getRandomItem(motivationalQuotes);
        resultMessage.style.color = 'var(--text-color)';
    }

    userInput.disabled = true;
    checkButton.style.display = "none";
    nextButton.classList.remove("hidden");
    gameState = 'proceeding';
}

function speakWord(word) {
    if (!word || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);

    const voices = window.speechSynthesis.getVoices();
    const googleVoice = voices.find(voice => voice.name === 'Google US English');
    if (googleVoice) {
        utterance.voice = googleVoice;
    } else {
        utterance.lang = 'en-US';
    }
    window.speechSynthesis.speak(utterance);
}

levelButtons.forEach(button => {
    button.addEventListener('click', () => {
        levelButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const level = button.dataset.level;
        loadLevel(level);
    });
});

checkButton.addEventListener('click', () => {
    if (gameState === 'answering') {
        checkAnswer();
    }
});

nextButton.addEventListener('click', () => {
    if (gameState === 'proceeding') {
        resetForNewWord();
    }
});

userInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        if (gameState === 'answering') {
            checkButton.click();
        } else if (gameState === 'proceeding') {
            nextButton.click();
        }
    }
});

speakerIcon.addEventListener('click', () => {
    speakWord(currentWordData.word);
});
resultSpeaker.addEventListener('click', () => {
    speakWord(currentWordData.word);
});

window.onload = () => {
    loadLevel('a1');
};