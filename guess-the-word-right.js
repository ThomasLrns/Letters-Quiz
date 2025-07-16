// List of words (from Word list file)
const englishWords = [
    "BOTTLE","WINDOW","FOREST","SIMPLE","BRIGHT","GARDEN","PENCIL","MIDDLE","CORNER","MOTHER","FATHER","SISTER","BUTTER","ROCKET","PILLOW","MONKEY","SHADOW","ORANGE","FRIEND","CAMERA","ANIMAL","PLANET","CARPET","MIRROR","SUMMER","WINTER","ARTIST","CIRCLE","FLOWER","PURPLE","YELLOW","HAMMER","LADDER","SILVER","FABRIC","GUITAR","DRAWER","COTTON","JUMPER","SOCCER","BASKET","TICKET","TUNNEL","SINGER","POSTER","JACKET","HELMET","TABLET","SCHOOL","ENGINE","CEREAL","COOKIE","NAPKIN","RUBBER","BANANA","PEPPER","LETTER","DANGER","CLOUDY","THUNDER","CASTLE","WAFFLE","DRIVER","ELBOW","ALARM","CLOSET","FREEZER","LAWYER","MUSEUM","CANDLE","DESERT","LIQUID","HANDLE","MAGNET","PIRATE","SHIELD","WALLET","ZIPPER","BUTTON","EFFORT","GENIUS","HEALTH","ISLAND","JUNGLE"
];
// French words loaded from french-word-list.js
// frenchWords

let words = englishWords;
// Use French word list if French is selected
if (localStorage.getItem('selectedLang') === 'fr') {
    if (typeof frenchWords !== 'undefined') {
        words = frenchWords;
    }
const imageBasePath = "Right letters/";

let quizPool = [...words];
let score = 0;
let tried = 0;
let currentWord = null;
let timerInterval = null;
let startTime = null;

function getLang() {
    return localStorage.getItem('selectedLang') || 'en';
}

function updateInputAndSubmit() {
    const lang = getLang();
    if (window.translations) {
        const input = document.getElementById('answer-input');
        const submitBtn = document.getElementById('submit-btn');
        if (input && window.translations[lang].inputPlaceholder) {
            input.placeholder = window.translations[lang].inputPlaceholder;
        }
        if (submitBtn && window.translations[lang].submit) {
            submitBtn.textContent = window.translations[lang].submit;
        }
    }
}

function updateScore() {
    const lang = getLang();
    const label = (window.translations && window.translations[lang] && window.translations[lang].score) ? window.translations[lang].score : 'Score:';
    document.getElementById('score-counter').textContent = `${label} ${score} / ${tried}`;
}

function updateTimer() {
    const lang = getLang();
    const label = (window.translations && window.translations[lang] && window.translations[lang].time) ? window.translations[lang].time : 'Time:';
    if (startTime) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        document.getElementById('timer').textContent = `${label} ${elapsed}s`;
    } else {
        document.getElementById('timer').textContent = `${label} 0s`;
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function pickQuestion() {
    updateInputAndSubmit();
    if (quizPool.length === 0) {
        document.getElementById('quiz').style.display = 'none';
        document.getElementById('result').style.display = 'block';
        document.getElementById('score-timer-wrapper').style.display = 'none';
        let finalTime = 0;
        if (startTime) {
            finalTime = Math.floor((Date.now() - startTime) / 1000);
        }
        const lang = getLang();
        let finishedMsg = (window.translations && window.translations[lang] && window.translations[lang].quizFinished)
            ? window.translations[lang].quizFinished
            : `Quiz finished! Your score: {score} / {total} Time: {time}s`;
        finishedMsg = finishedMsg.replace('{score}', score).replace('{total}', words.length).replace('{time}', finalTime);
        document.getElementById('result').textContent = finishedMsg;
        document.getElementById('restart-btn').style.display = 'inline-block';
        if (timerInterval) clearInterval(timerInterval);
        startTime = null;
        updateTimer();
        score = 0;
        tried = 0;
        updateScore();
        return;
    }
    document.getElementById('feedback').textContent = '';
    document.getElementById('next-btn').style.display = 'none';
    updateScore();
    // Pick a random word
    const idx = Math.floor(Math.random() * quizPool.length);
    currentWord = quizPool[idx];
    // Display images for each letter
    const imagesDiv = document.getElementById('images');
    imagesDiv.innerHTML = '';
    // Flip the order of the images
    for (let letter of [...currentWord].reverse()) {
        if (letter.match(/[A-Z]/)) {
            const img = document.createElement('img');
            img.src = imageBasePath + letter + ".png";
            img.alt = letter;
            img.style.width = '60px';
            img.style.height = '60px';
            img.style.objectFit = 'contain';
            img.style.border = '1px solid #ddd';
            img.style.borderRadius = '8px';
            img.style.background = '#BEBEBE';
            imagesDiv.appendChild(img);
        }
    }
    document.getElementById('answer-input').value = '';
    document.getElementById('answer-input').disabled = false;
    document.getElementById('submit-btn').disabled = false;
}

function checkAnswer() {
    const userInput = document.getElementById('answer-input').value.trim().toUpperCase();
    document.getElementById('answer-input').disabled = true;
    document.getElementById('submit-btn').disabled = true;
    const feedback = document.getElementById('feedback');
    const lang = getLang();
    const correctMsg = (window.translations && window.translations[lang] && window.translations[lang].correctFeedback) ? window.translations[lang].correctFeedback : 'Correct!';
    const wrongMsg = (window.translations && window.translations[lang] && window.translations[lang].wrongFeedback) ? window.translations[lang].wrongFeedback : 'Wrong! The correct answer was';
    if (userInput === currentWord) {
        feedback.textContent = correctMsg;
        feedback.classList.remove('feedback-wrong');
        feedback.classList.add('feedback-correct');
        score++;
    } else {
        feedback.textContent = `${wrongMsg} ${currentWord}.`;
        feedback.classList.remove('feedback-correct');
        feedback.classList.add('feedback-wrong');
    }
}

// Update input, submit, and feedback on language change
document.getElementById('language-select')?.addEventListener('change', () => {
    updateInputAndSubmit();
    // Re-translate feedback if visible
    const feedback = document.getElementById('feedback');
    if (feedback && feedback.textContent) {
        const lang = getLang();
        const correctMsg = (window.translations && window.translations[lang] && window.translations[lang].correctFeedback) ? window.translations[lang].correctFeedback : 'Correct!';
        const wrongMsg = (window.translations && window.translations[lang] && window.translations[lang].wrongFeedback) ? window.translations[lang].wrongFeedback : 'Wrong! The correct answer was';
        if (feedback.classList.contains('feedback-correct')) {
            feedback.textContent = correctMsg;
        } else if (feedback.classList.contains('feedback-wrong')) {
            // Extract the answer from the previous feedback
            const match = feedback.textContent.match(/(?:was|était) (.+)\.?$/);
            const answer = match ? match[1] : '';
            feedback.textContent = `${wrongMsg} ${answer}.`;
        }
    }
});
// Update input, submit, and feedback on language change
document.getElementById('language-select')?.addEventListener('change', () => {
    updateInputAndSubmit();
    // Re-translate feedback if visible
    const feedback = document.getElementById('feedback');
    if (feedback && feedback.textContent) {
        const lang = getLang();
        const correctMsg = (window.translations && window.translations[lang] && window.translations[lang].correctFeedback) ? window.translations[lang].correctFeedback : 'Correct!';
        const wrongMsg = (window.translations && window.translations[lang] && window.translations[lang].wrongFeedback) ? window.translations[lang].wrongFeedback : 'Wrong! The correct answer was';
        if (feedback.classList.contains('feedback-correct')) {
            feedback.textContent = correctMsg;
        } else if (feedback.classList.contains('feedback-wrong')) {
            // Extract the answer from the previous feedback
            const match = feedback.textContent.match(/(?:was|était) (.+)\.?$/);
            const answer = match ? match[1] : '';
            feedback.textContent = `${wrongMsg} ${answer}.`;
        }
    }
});
    quizPool = quizPool.filter(w => w !== currentWord);
    tried++;
    updateScore();
    const nextBtn = document.getElementById('next-btn');
    if (window.translations) {
        const lang = getLang();
        nextBtn.textContent = (window.translations[lang] && window.translations[lang].next) ? window.translations[lang].next : 'Next';
    }
    nextBtn.style.display = 'inline-block';
}

document.getElementById('next-btn').onclick = pickQuestion;
document.getElementById('submit-btn').onclick = checkAnswer;

document.getElementById('answer-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !document.getElementById('submit-btn').disabled) {
        checkAnswer();
    }
});

function restartQuiz() {
    updateInputAndSubmit();
    // Detect language
    let lang = 'en';
    const select = document.getElementById('language-select');
    if (select) lang = select.value;
    words = (lang === 'fr' && typeof frenchWords !== 'undefined') ? frenchWords : englishWords;
    quizPool = [...words];
    score = 0;
    tried = 0;
    updateScore();
    startTime = Date.now();
    updateTimer();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    document.getElementById('score-timer-wrapper').style.display = 'block';
    document.getElementById('quiz').style.display = 'block';
    document.getElementById('result').style.display = 'none';
    document.getElementById('restart-btn').style.display = 'none';
    document.getElementById('start-btn').style.display = 'none';
    pickQuestion();
}

document.getElementById('restart-btn').onclick = restartQuiz;
document.getElementById('start-btn').onclick = restartQuiz;

function showStart() {
    updateInputAndSubmit();
    document.getElementById('quiz').style.display = 'none';
    document.getElementById('result').style.display = 'none';
    document.getElementById('restart-btn').style.display = 'none';
    document.getElementById('start-btn').style.display = 'inline-block';
    document.getElementById('score-timer-wrapper').style.display = 'none';
    if (timerInterval) clearInterval(timerInterval);
    startTime = null;
    updateTimer();
    score = 0;
    tried = 0;
    updateScore();
}

showStart();
// Update input and submit on language change
document.getElementById('language-select')?.addEventListener('change', updateInputAndSubmit);
