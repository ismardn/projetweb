let quizData = [];
let selectedQuestions = [];
let multiplier = 1;
let userAnswers = [];
let startTime;
let timer;
let timeLimitSeconds;

document.getElementById("start-quiz-btn").addEventListener("click", async () => {
    multiplier = parseFloat(document.getElementById("time-selector").value);
    const res = await fetch("../json/quizData.json");
    quizData = await res.json();
    selectedQuestions = quizData.sort(() => 0.5 - Math.random()).slice(0, 5);
    startTime = new Date();
    setupTimer();
    showQuiz();
});

function setupTimer() {
    const timeOptions = {
        2: 30,
        1.5: 60,
        1: 120,
        0.5: null
    };

    timeLimitSeconds = timeOptions[multiplier];

    if (timeLimitSeconds) {
        timer = setTimeout(() => {
            showResults(true);
        }, timeLimitSeconds * 1000);
    }
}

function startTimer(displayElement) {
    let remaining = timeLimitSeconds;
    displayElement.textContent = `Temps restant : ${remaining} s`;

    const interval = setInterval(() => {
        remaining--;
        displayElement.textContent = `Temps restant : ${remaining} s`;
        if (remaining <= 0) {
            clearInterval(interval);
        }
    }, 1000);
}

function showQuiz() {
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("attempts-log").style.display = "none";
    const quizContainer = document.getElementById("quiz-screen");
    quizContainer.style.display = "block";
    quizContainer.innerHTML = "";

    if (timeLimitSeconds) {
        const timerDisplay = document.createElement("div");
        timerDisplay.id = "timer-display";
        quizContainer.appendChild(timerDisplay);
        startTimer(timerDisplay);
    }

    selectedQuestions.forEach((q, idx) => {
        const qDiv = document.createElement("div");
        qDiv.className = "question-block";
        qDiv.innerHTML = `<h3>${q.question}</h3>`;

        q.options.forEach((opt, i) => {
            const inputType = q.type === "checkbox" ? "checkbox" : "radio";
            const nameAttr = q.type === "radio" ? `name="q${idx}"` : `name="q${idx}-${i}"`;
            qDiv.innerHTML += `
                <label>
                    <input type="${inputType}" ${nameAttr} value="${opt}">
                    ${opt}
                </label>`;
        });

        quizContainer.appendChild(qDiv);
    });

    const submitBtn = document.createElement("button");
    submitBtn.textContent = "Valider mes réponses";
    submitBtn.onclick = () => showResults(false);
    quizContainer.appendChild(submitBtn);
}

function showResults(forceTimeOut = false) {
    clearTimeout(timer);
    userAnswers = [];
    const questionBlocks = document.querySelectorAll(".question-block");
    let score = 0;

    questionBlocks.forEach((block, idx) => {
        const q = selectedQuestions[idx];
        let userResponse = [];

        const inputs = block.querySelectorAll("input");
        inputs.forEach(input => {
            if (input.checked) {
                userResponse.push(input.value);
            }
        });

        const correctAnswers = Array.isArray(q.answer) ? q.answer : [q.answer];
        let qScore = 0;

        if (q.type === "checkbox") {
            const totalGood = correctAnswers.length;
            const goodSelected = userResponse.filter(ans => correctAnswers.includes(ans)).length;
            const wrongSelected = userResponse.filter(ans => !correctAnswers.includes(ans)).length;
            qScore = Math.max(0, (goodSelected - wrongSelected) / totalGood);
        } else {
            qScore = JSON.stringify(userResponse.sort()) === JSON.stringify(correctAnswers.sort()) ? 1 : 0;
        }

        score += qScore;

        userAnswers.push({
            question: q.question,
            userResponse,
            correct: qScore === 1,
            partial: qScore
        });
    });

    displayFinalScreen(score, forceTimeOut);
}
