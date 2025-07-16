// Letters list
const letters = [
    "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"
];
const leftBase = "Left letters/";
const rightBase = "Right letters/";

let quizPool = [...letters]; // pool of remaining letters
let score = 0;
let tried = 0;
let currentSide = null; // 'Left' or 'Right'
let lastSides = [];
let currentLetter = null;
let timerInterval = null;
let startTime = null;

function getLang() {
    return localStorage.getItem('selectedLang') || 'en';
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
    // Randomly pick side and letter, but limit max 3 repetitions
    const idx = Math.floor(Math.random() * quizPool.length);
    currentLetter = quizPool[idx];
    let possibleSides = ['Left', 'Right'];
    if (lastSides.length >= 3 && lastSides.slice(-3).every(s => s === lastSides[lastSides.length-1])) {
        // Last 3 are the same, force switch
        possibleSides = [lastSides[lastSides.length-1] === 'Left' ? 'Right' : 'Left'];
    }
    currentSide = possibleSides[Math.floor(Math.random() * possibleSides.length)];
    lastSides.push(currentSide);
    const imgPath = (currentSide === 'Left' ? leftBase : rightBase) + currentLetter + ".png";
    const symbolImg = document.getElementById('symbol-img');
    symbolImg.src = imgPath;
    symbolImg.alt = currentLetter;
    symbolImg.onerror = function() {
        this.onerror = null;
        this.src = '';
        this.alt = 'Image not found';
        document.getElementById('feedback').textContent = 'Image not found! Check Letters folder and file name.';
    };
    // Render Left/Right on first line, Both on second line, using translations
    const lang = getLang();
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    const row1 = document.createElement('div');
    row1.style.display = 'flex';
    row1.style.justifyContent = 'center';
    row1.style.gap = '32px';
    row1.style.marginBottom = '12px';
    const leftLabel = (window.translations && window.translations[lang] && window.translations[lang].left) ? window.translations[lang].left : 'Left';
    const rightLabel = (window.translations && window.translations[lang] && window.translations[lang].right) ? window.translations[lang].right : 'Right';
    [leftLabel, rightLabel].forEach((sideLabel, idx) => {
        const btn = document.createElement('button');
        btn.textContent = sideLabel;
        btn.style.width = '100px';
        btn.style.fontSize = '1.1em';
        btn.onclick = () => checkAnswer(idx === 0 ? 'Left' : 'Right');
        row1.appendChild(btn);
    });
    optionsDiv.appendChild(row1);
    const row2 = document.createElement('div');
    row2.style.display = 'flex';
    row2.style.justifyContent = 'center';
    const bothLabel = (window.translations && window.translations[lang] && window.translations[lang].both) ? window.translations[lang].both : 'Both';
    const bothBtn = document.createElement('button');
    bothBtn.textContent = bothLabel;
    bothBtn.style.width = '100px';
    bothBtn.style.fontSize = '1.1em';
    bothBtn.onclick = () => checkAnswer('Both');
    row2.appendChild(bothBtn);
    optionsDiv.appendChild(row2);
}

function checkAnswer(selected) {
    const optionButtons = Array.from(document.getElementById('options').querySelectorAll('button'));
    const feedback = document.getElementById('feedback');
    const lang = getLang();
    const correctMsg = (window.translations && window.translations[lang] && window.translations[lang].correctFeedback) ? window.translations[lang].correctFeedback : 'Correct!';
    const wrongMsg = (window.translations && window.translations[lang] && window.translations[lang].wrongFeedback) ? window.translations[lang].wrongFeedback : 'Wrong! The correct answer was';
    optionButtons.forEach(btn => btn.disabled = true);
    // Letters with identical images in both folders
    const bothLetters = ['B','F','H','I','M','Z'];
    let correctIdx = null;
    let answered = false;
    if (bothLetters.includes(currentLetter)) {
        correctIdx = 2; // Both button
        if (selected === 'Both') {
            optionButtons[2].classList.add('correct-answer');
            feedback.textContent = correctMsg;
            feedback.classList.remove('feedback-wrong');
            feedback.classList.add('feedback-correct');
            score++;
            answered = true;
        } else {
            // Mark wrong button
            if (selected === 'Left') optionButtons[0].classList.add('wrong-answer');
            if (selected === 'Right') optionButtons[1].classList.add('wrong-answer');
            optionButtons[2].classList.add('correct-answer');
            // Use translated label for 'Both'
            const bothLabel = (window.translations && window.translations[lang] && window.translations[lang].both) ? window.translations[lang].both : 'Both';
            feedback.textContent = `${wrongMsg} ${bothLabel}.`;
            feedback.classList.remove('feedback-correct');
            feedback.classList.add('feedback-wrong');
            answered = true;
        }
    } else {
        correctIdx = currentSide === 'Left' ? 0 : 1;
        if (selected === currentSide) {
            optionButtons[correctIdx].classList.add('correct-answer');
            feedback.textContent = correctMsg;
            feedback.classList.remove('feedback-wrong');
            feedback.classList.add('feedback-correct');
            score++;
            answered = true;
        } else {
            // Mark wrong button
            if (selected === 'Left') optionButtons[0].classList.add('wrong-answer');
            if (selected === 'Right') optionButtons[1].classList.add('wrong-answer');
            if (selected === 'Both') optionButtons[2].classList.add('wrong-answer');
            optionButtons[correctIdx].classList.add('correct-answer');
            // Use translated label for 'Left' or 'Right'
            let sideLabel = currentSide;
            if (window.translations && window.translations[lang]) {
                if (currentSide === 'Left' && window.translations[lang].left) sideLabel = window.translations[lang].left;
                if (currentSide === 'Right' && window.translations[lang].right) sideLabel = window.translations[lang].right;
            }
            feedback.textContent = `${wrongMsg} ${sideLabel}.`;
            feedback.classList.remove('feedback-correct');
            feedback.classList.add('feedback-wrong');
            answered = true;
        }
    }
    if (answered) {
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
}

document.getElementById('next-btn').onclick = pickQuestion;

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

document.getElementById('start-btn').onclick = restartQuiz;

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

showStart();
