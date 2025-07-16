
const translations = {
    en: {
        appTitle: "Syfkan Letters Quiz",
        leftTitle: "Left Letters Quiz",
        rightTitle: "Right Letters Quiz",
        leftOrRightTitle: "Left or Right Quiz",
        guessWordTitle: "Guess the Word Quiz",
        leftBtn: "Left Letters Quiz",
        rightBtn: "Right Letters Quiz",
        leftOrRightBtn: "Left or Right Quiz",
        guessWordBtn: "Guess the Word Quiz",
        langLabel: "Language:",
        chooseQuiz: "Choose a quiz to begin:",
        chooseMode: "Choose your mode:",
        backBtn: "Back to Home Page",
        startBtn: "Start Quiz",
        score: "Score:",
        time: "Time:",
        next: "Next",
        inputPlaceholder: "TYPE THE WORD HERE",
        submit: "Submit",
        left: "Left",
        right: "Right",
        both: "Both",
        quizFinished: "Quiz finished! Your score: {score} / {total} Time: {time}s",
        correctFeedback: "Correct!",
        wrongFeedback: "Wrong! The correct answer was",
    },
    fr: {
        appTitle: "Quiz Lettres Syfkanes",
        leftTitle: "Quiz Lettres Gauches",
        rightTitle: "Quiz Lettres Droites",
        leftOrRightTitle: "Quiz Gauche ou Droite",
        guessWordTitle: "Quiz Devine le Mot",
        leftBtn: "Quiz Lettres Gauches",
        rightBtn: "Quiz Lettres Droites",
        leftOrRightBtn: "Quiz Gauche ou Droite",
        guessWordBtn: "Quiz Devine le Mot",
        langLabel: "Langue :",
        chooseQuiz: "Choisis un quiz pour commencer :",
        chooseMode: "Choisis ton mode :",
        backBtn: "Retour au Menu Principal",
        startBtn: "Commencer Quiz",
        score: "Score :",
        time: "Chrono :",
        next: "Suivant",
        inputPlaceholder: "ÉCRIS LE MOT ICI",
        submit: "Soumettre",
        left: "Gauche",
        right: "Droite",
        both: "Les Deux",
        quizFinished: "Quiz fini ! Ton Score : {score} / {total} Chrono : {time}s",
        correctFeedback: "Correct !",
        wrongFeedback: "Incorrect ! La bonne réponse était",
    }
};

// Make translations globally accessible
window.translations = translations;

function setLanguage(lang) {
    // Translate all elements with data-translate-key
    document.querySelectorAll('[data-translate-key]').forEach(el => {
        const key = el.getAttribute('data-translate-key');
        if (key && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    // Home page
    if (document.querySelector('h1')) {
        const h1 = document.querySelector('h1');
        if (h1.textContent.includes('Syfkan')) h1.textContent = translations[lang].appTitle;
        if (h1.textContent.includes('Left Letters')) h1.textContent = translations[lang].leftTitle;
        if (h1.textContent.includes('Right Letters')) h1.textContent = translations[lang].rightTitle;
        if (h1.textContent.includes('Left or Right')) h1.textContent = translations[lang].leftOrRightTitle;
        if (h1.textContent.includes('Guess the Word')) h1.textContent = translations[lang].guessWordTitle;
    }
    // Main buttons
    const btns = document.querySelectorAll('button');
    // Translate all elements with data-translate-key
    const translatable = document.querySelectorAll('[data-translate-key]');
    translatable.forEach(el => {
        const key = el.getAttribute('data-translate-key');
        if (key && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    // Language label
    var langLabel = document.querySelector('label[for="language-select"]');
    if (langLabel) { langLabel.textContent = translations[lang].langLabel; }
    // Choose quiz text
    var chooseQuiz = document.querySelector('p');
    if (chooseQuiz && chooseQuiz.textContent.includes('Choose a quiz')) { chooseQuiz.textContent = translations[lang].chooseQuiz; }
}

document.addEventListener('DOMContentLoaded', function() {
    const select = document.getElementById('language-select');
    if (select) {
        // Set dropdown to stored value if available
        const storedLang = localStorage.getItem('selectedLang');
        if (storedLang && select.value !== storedLang) {
            select.value = storedLang;
        }
        setLanguage(select.value);
        select.addEventListener('change', function() {
            localStorage.setItem('selectedLang', this.value);
            setLanguage(this.value);
        });
    }
});
