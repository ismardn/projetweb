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

function displayFinalScreen(score, timeExpired = false) {
    document.getElementById("quiz-screen").style.display = "none";
    const resultContainer = document.getElementById("results-screen");
    resultContainer.style.display = "block";

    const finalScore = Math.round(score * multiplier * 100) / 100;
    const endTime = new Date();
    const timeTakenSec = Math.round((endTime - startTime) / 1000);
    const currentDateTime = new Date().toLocaleString("fr-FR");

    let resultHTML = `<h2>Résultats</h2>`;

    if (timeExpired) {
        resultHTML += `<p style="color:red;"><strong>⏰ Temps écoulé !</strong> Résultats enregistrés.</p>`;
    }

    resultHTML += `
        <p><strong>Score brut :</strong> ${score.toFixed(2)} / 5</p>
        <p><strong>Multiplicateur :</strong> x${multiplier}</p>
        <p><strong>Score final :</strong> ${finalScore}</p>
        <p><strong>Temps écoulé :</strong> ${timeTakenSec} secondes</p>`;

    resultContainer.innerHTML = resultHTML;

    userAnswers.forEach(ans => {
        const div = document.createElement("div");
        div.className = ans.correct ? "correct" : "incorrect";
        div.innerHTML = `<p><strong>${ans.question}</strong></p>`;
        div.innerHTML += `<p>Votre réponse : ${ans.userResponse.join(", ") || "Aucune sélection"}</p>`;
        div.innerHTML += ans.correct
            ? `<p style="color: green;">Bonne réponse : 1/1</p>`
            : `<p style="color: red;">Mauvaise réponse : ${ans.partial.toFixed(2)}/1</p>`;
        resultContainer.appendChild(div);
    });

    resultContainer.innerHTML += `
        <button class="return-button" onclick="location.href='./quiz.html'">Retour à la page d'accueil</button>
    `;

    saveAttemptToLocalStorage(currentDateTime, finalScore, timeTakenSec, multiplier);
}

function saveAttemptToLocalStorage(date, score, duration, mult) {
    const attempts = JSON.parse(localStorage.getItem("quizAttempts") || "[]");
    attempts.unshift({ date, score, duration, mult });
    localStorage.setItem("quizAttempts", JSON.stringify(attempts));
}

window.addEventListener("DOMContentLoaded", () => {
    const log = document.querySelector("#attempts-log");
    const tableBody = document.querySelector("#attempts-table tbody");

    if (log && tableBody) {
        const attempts = JSON.parse(localStorage.getItem("quizAttempts") || "[]");
        attempts.forEach(a => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${a.date}</td>
                <td>${a.score}</td>
                <td>${a.duration} s</td>
                <td>x${a.mult}</td>
            `;
            tableBody.appendChild(row);
        });
    }
});
