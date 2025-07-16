// List of letters and image paths
const letters = [
    "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"
];
const imageBasePath = "Left letters/";

let quizPool = [...letters];
let score = 0;
let tried = 0;
function getLang() {
    return localStorage.getItem('selectedLang') || 'en';
}

function updateScore() {
    const lang = getLang();
    const label = (window.translations && window.translations[lang] && window.translations[lang].score) ? window.translations[lang].score : 'Score:';
    document.getElementById('score-counter').textContent = `${label} ${score} / ${tried}`;
}
let currentLetter = null;
let timerInterval = null;
let startTime = null;

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
        finishedMsg = finishedMsg.replace('{score}', score).replace('{total}', 26).replace('{time}', finalTime);
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
    const idx = Math.floor(Math.random() * quizPool.length);
    currentLetter = quizPool[idx];
    const imgPath = imageBasePath + currentLetter + ".png";
    const symbolImg = document.getElementById('symbol-img');
    console.log('Trying to load image:', imgPath);
    symbolImg.src = imgPath;
    symbolImg.alt = currentLetter;
    symbolImg.onerror = function() {
        this.onerror = null;
        this.src = '';
        this.alt = 'Image not found';
        document.getElementById('feedback').textContent = 'Image not found! Check Letters folder and file name.';
    };
    document.getElementById('feedback').textContent = '';
    // Prepare options
    let options = [currentLetter];
    let others = letters.filter(l => l !== currentLetter);
    shuffle(others);
    options.push(others[0], others[1]);
    shuffle(options);
    // Render buttons
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.textContent = opt;
        btn.onclick = () => checkAnswer(opt);
        optionsDiv.appendChild(btn);
    });
}

function checkAnswer(selected) {
    const optionButtons = Array.from(document.getElementById('options').children);
    let correctIdx = null;
    optionButtons.forEach((btn, idx) => {
        if (btn.textContent === currentLetter) correctIdx = idx;
    });
    const feedback = document.getElementById('feedback');
    const lang = getLang();
    const correctMsg = (window.translations && window.translations[lang] && window.translations[lang].correctFeedback) ? window.translations[lang].correctFeedback : 'Correct!';
    const wrongMsg = (window.translations && window.translations[lang] && window.translations[lang].wrongFeedback) ? window.translations[lang].wrongFeedback : 'Wrong! The correct answer was';
    optionButtons.forEach((btn, idx) => {
        btn.disabled = true;
        if (btn.textContent === selected) {
            if (selected === currentLetter) {
                btn.classList.add('correct-answer');
                feedback.textContent = correctMsg;
                feedback.classList.remove('feedback-wrong');
                feedback.classList.add('feedback-correct');
                score++;
                updateScore();
            } else {
                btn.classList.add('wrong-answer');
                feedback.textContent = `${wrongMsg} ${currentLetter}.`;
                feedback.classList.remove('feedback-correct');
                feedback.classList.add('feedback-wrong');
            }
        }
    });
    // Highlight correct answer if user was wrong
    if (selected !== currentLetter && correctIdx !== null) {
        optionButtons[correctIdx].classList.add('correct-answer');
    }
    // Remove used letter
    quizPool = quizPool.filter(l => l !== currentLetter);
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

// Start quiz
function restartQuiz() {
    quizPool = [...letters];
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

function showStart() {
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

document.getElementById('start-btn').onclick = restartQuiz;

showStart();
