// script.js (OTOMATİK BİTİRME MANTIĞI DÜZELTİLMİŞ NİHAİ VERSİYON)

const motivationalQuotes = [ "Hiç hata yapmamış bir insan, yeni bir şey denememiş demektir. - Albert Einstein", "Başarının sırrı, pes etmemektir. - Benjamin Franklin", "Yavaş gitmekten korkma, yerinde durmaktan kork. - Çin Atasözü", "Hatalar, denediğinizin kanıtıdır.", "En büyük zaferimiz hiç düşmemek değil, her düştüğümüzde yeniden ayağa kalkmaktır. - Konfüçyüs" ];
let activeWordList = [];
let currentWordData = {};
let usedWords = [];
let gameState = 'answering';
let currentLevel = 'a1';
let hintsUsed = 0;
let hiddenIndices = new Set();
let currentScore = 0;
let highScore = 0;
let wordHistory = [];

// HTML Element Seçimleri
const levelDisplay = document.getElementById('level-display');
const levelButtons = document.querySelectorAll('.level-btn');
const hintText = document.getElementById('hint-text');
const puzzleWordContainer = document.getElementById('puzzle-word');
const speakerIcon = document.getElementById('speaker-icon');
const userInput = document.getElementById('user-input');
const submitButton = document.getElementById('submit-button');
const hintButton = document.getElementById('hint-button');
const nextButton = document.getElementById('next-button');
const resultContainer = document.getElementById('result-container');
const resultAnswer = document.getElementById('result-answer');
const resultSpeaker = document.getElementById('result-speaker');
const resultMeaning = document.getElementById('result-meaning');
const resultImage = document.getElementById('result-image');
const resultMessage = document.getElementById('result-message');
const scoreDisplay = document.getElementById('score-display');
const highScoreDisplay = document.getElementById('high-score-display');
const historyContainer = document.querySelector('.history-container');
const historyList = document.getElementById('history-list');

// ---- FONKSİYONLAR ----
function updateScoreDisplay() { scoreDisplay.textContent = currentScore; }
function updateHighScoreDisplay() { highScoreDisplay.textContent = highScore; }

function loadHighScore() {
    const savedScore = localStorage.getItem('wordPuzzleHighScore');
    highScore = savedScore ? parseInt(savedScore, 10) : 0;
    updateHighScoreDisplay();
}

function updateHighScore() {
    if (currentScore > highScore) {
        highScore = currentScore;
        localStorage.setItem('wordPuzzleHighScore', highScore);
        updateHighScoreDisplay();
    }
}

function updateHistoryDisplay(word, points, correct) {
    wordHistory.push({ word, points });
    const listItem = document.createElement('li');
    const wordSpan = document.createElement('span');
    wordSpan.classList.add('word');
    wordSpan.textContent = word;
    const pointsSpan = document.createElement('span');
    pointsSpan.classList.add(correct ? 'points-correct' : 'points-incorrect');
    pointsSpan.textContent = `${points} puan`;
    listItem.appendChild(wordSpan);
    listItem.appendChild(pointsSpan);
    historyList.appendChild(listItem);
    historyContainer.classList.remove('hidden');
    historyContainer.scrollTop = historyContainer.scrollHeight;
}

function clearHistoryDisplay() {
    wordHistory = [];
    historyList.innerHTML = '';
    historyContainer.classList.add('hidden');
}

function levelName(level) { return `Level: ${level.toUpperCase()} English`; }

async function loadLevel(level) {
    console.log("loadLevel fonksiyonu çağrıldı, seviye:", level);
    try {
        const response = await fetch(`${level}_words.json`);
        console.log("Fetch response alındı:", response.status);
        if (!response.ok) { throw new Error(`Kelime listesi yüklenemedi! Status: ${response.status}`); }
        const data = await response.json();
        console.log("JSON verisi alındı, kelime sayısı:", data.length);
        activeWordList = data;
        usedWords = [];
        currentLevel = level;
        levelDisplay.textContent = levelName(level);
        clearHistoryDisplay();
        updateScoreDisplay();
        resetForNewWord();
    } catch (error) {
        console.error("Seviye yüklenirken hata oluştu:", error);
        alert(`${level.toUpperCase()} seviyesi yüklenirken bir hata oluştu. Dosya adının doğru (${level}_words.json) ve dosyanın geçerli bir JSON içerdiğinden emin olun. Detaylar için Console'u kontrol edin.`);
    }
}

function getRandomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function resetForNewWord() {
    console.log("resetForNewWord çağrıldı");
    if (activeWordList.length === 0) { console.log("Aktif kelime listesi boş, resetForNewWord durduruldu."); return; }
    if (usedWords.length === activeWordList.length) { usedWords = []; console.log("Seviye tamamlandı, kelime listesi sıfırlandı.");}
    do { currentWordData = getRandomItem(activeWordList); } while (usedWords.includes(currentWordData.word));
    usedWords.push(currentWordData.word);
    console.log("Yeni kelime seçildi:", currentWordData.word);

    hintsUsed = 0;
    hiddenIndices.clear();
    puzzleWordContainer.classList.remove('long-word');
    if (currentWordData.word.length > 10) { puzzleWordContainer.classList.add('long-word'); }
    speakerIcon.classList.add('hidden');
    hintText.textContent = currentWordData.hint;
    puzzleWordContainer.innerHTML = '';
    const wordLetters = currentWordData.word.split('');
    let lettersToHideCount = Math.floor(wordLetters.length * 0.4);
    if (lettersToHideCount >= wordLetters.length && wordLetters.length > 0) { lettersToHideCount = wordLetters.length - 1; }
     if (lettersToHideCount < 0) lettersToHideCount = 0;
    let tempHiddenIndices = new Set();
     if (lettersToHideCount > 0) {
        while (tempHiddenIndices.size < lettersToHideCount) {
             if(wordLetters.length === 0) break;
            tempHiddenIndices.add(Math.floor(Math.random() * wordLetters.length));
        }
    }
    hiddenIndices = new Set(tempHiddenIndices);
    wordLetters.forEach((letter, index) => {
        const span = document.createElement('span');
        span.classList.add('puzzle-letter');
        span.dataset.index = index;
        if (hiddenIndices.has(index)) { span.textContent = '_'; } else { span.textContent = letter; }
        puzzleWordContainer.appendChild(span);
    });
    puzzleWordContainer.classList.remove('highlight', 'incorrect-answer-text');
    userInput.value = '';
    userInput.focus();
    userInput.disabled = false;
    resultContainer.classList.add('hidden');
    submitButton.style.display = "inline-block";
    nextButton.classList.add("hidden");
    hintButton.disabled = hiddenIndices.size === 0;
    hintButton.textContent = `Harf Al (${3 - hintsUsed})`;
    gameState = 'answering';
    console.log("resetForNewWord tamamlandı.");
}

// --- OTOMATİK BİTİRME MANTIĞI DÜZELTİLDİ ---
function revealHintLetter() {
    if (hintsUsed >= 3 || hiddenIndices.size === 0 || gameState !== 'answering') { return; }
    hintsUsed++;
    const indicesArray = Array.from(hiddenIndices);
    const randomIndex = indicesArray[Math.floor(Math.random() * indicesArray.length)];
    const correctLetter = currentWordData.word[randomIndex];
    const spanToReveal = puzzleWordContainer.querySelector(`.puzzle-letter[data-index='${randomIndex}']`);
    if (spanToReveal) { spanToReveal.textContent = correctLetter; spanToReveal.classList.add(`hint-letter-${hintsUsed}`); }
    hiddenIndices.delete(randomIndex); // İndeksi gizlilerden çıkar

    // --- ÖNEMLİ KONTROL BURADA ---
    // Eğer bu harfi açınca HİÇ GİZLİ HARF KALMADIYSA, oyunu bitir.
    if (hiddenIndices.size === 0) {
        hintButton.textContent = `Harf Al (0)`;
        hintButton.disabled = true;
        gameState = 'proceeding';
        userInput.disabled = true;
        showFailure(0); // Puan 0 olarak bilememe göster
        return; // Fonksiyondan çık, aşağıdaki kontrolleri yapma
    }
    // --- KONTROL SONU ---

    // Kalan hakkı normal şekilde güncelle
    hintButton.textContent = `Harf Al (${3 - hintsUsed})`;
    // Eğer hak bittiyse butonu pasif yap
    if (hintsUsed >= 3) {
        hintButton.disabled = true;
    }
}
// --- DÜZELTME SONU ---

function showFailure(points = 0) {
    resultContainer.classList.remove('hidden');
    resultImage.src = currentWordData.image || '';
    resultSpeaker.classList.remove('hidden');
    resultSpeaker.style.display = 'inline-block';
    resultAnswer.textContent = `Doğru Cevap: ${currentWordData.word}`;
    resultAnswer.style.color = 'var(--error-color)';
    resultMeaning.textContent = `Türkçe Anlamı: ${currentWordData.translation}`;
    resultMessage.textContent = getRandomItem(motivationalQuotes);
    resultMessage.style.color = 'var(--text-color)';
    submitButton.style.display = "none";
    nextButton.classList.remove("hidden");
    updateHistoryDisplay(currentWordData.word, points, false);
}
function checkAnswer() {
    const userAnswer = userInput.value.toUpperCase().trim();
    resultContainer.classList.remove('hidden');
    resultImage.src = currentWordData.image || '';
    resultSpeaker.classList.remove('hidden');
    resultSpeaker.style.display = 'inline-block';
    hintButton.disabled = true;
    let points = 0;
    if (userAnswer === currentWordData.word) {
        points = Math.max(0, currentWordData.word.length * 100 - hintsUsed * 100);
        currentScore += points;
        updateScoreDisplay();
        updateHighScore();
        resultAnswer.textContent = currentWordData.word;
        resultAnswer.style.color = 'var(--success-color)';
        resultMeaning.textContent = `Türkçe Anlamı: ${currentWordData.translation}`;
        resultMessage.textContent = `Harika! +${points} puan! ✨`;
        resultMessage.style.color = 'var(--success-color)';
        puzzleWordContainer.querySelectorAll('.puzzle-letter').forEach((span, index) => {
             span.textContent = currentWordData.word[index];
             span.classList.remove('hint-letter-1', 'hint-letter-2', 'hint-letter-3');
        });
        updateHistoryDisplay(currentWordData.word, points, true);
    } else {
        points = 0;
        showFailure(points);
    }
    userInput.disabled = true;
    submitButton.style.display = "none";
    nextButton.classList.remove("hidden");
    gameState = 'proceeding';
}
function speakWord(word) {
    if (!word || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    const voices = window.speechSynthesis.getVoices();
    let preferredVoice = voices.find(voice => voice.name === 'Google US English');
    if (!preferredVoice) { preferredVoice = voices.find(voice => voice.lang === 'en-US'); }
    if (preferredVoice) { utterance.voice = preferredVoice; } else { utterance.lang = 'en-US'; }
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
submitButton.addEventListener('click', () => { if (gameState === 'answering') { checkAnswer(); } });
nextButton.addEventListener('click', () => { if (gameState === 'proceeding') { resetForNewWord(); } });
userInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        if (gameState === 'answering') { submitButton.click(); }
        else if (gameState === 'proceeding') { nextButton.click(); }
    }
});
speakerIcon.addEventListener('click', () => { speakWord(currentWordData.word); });
resultSpeaker.addEventListener('click', () => { speakWord(currentWordData.word); });
hintButton.addEventListener('click', revealHintLetter);
(async () => {
    loadHighScore();
    if (typeof speechSynthesis !== 'undefined') {
        if (speechSynthesis.getVoices().length === 0) {
            await new Promise(resolve => setTimeout(resolve, 50));
            if (speechSynthesis.getVoices().length === 0) {
                 await new Promise(resolve => speechSynthesis.onvoiceschanged = resolve);
             }
         }
     }
    loadLevel('a1');
})(); // <-- Kod burada bitmeli!