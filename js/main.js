function playVideo(card) {
    const video = card.querySelector("video");
    video.play();
}

function pauseVideo(card) {
    const video = card.querySelector("video");
    video.pause();
}



function flipCard(event) {
    event.preventDefault();
    event.stopPropagation();
    const card = event.target.closest('.eco-card');
    if (card) {
        card.classList.toggle('flipped');
    }
}



const funfacts = [
    { img: '../assets/images/funfacts/immortal_jellyfish.jpg', text: "La méduse Turritopsis dohrnii est surnommée \"immortelle\" car elle peut inverser son processus de vieillissement." },
    { img: '../assets/images/funfacts/octopus.jpg', text: "Le poulpe a trois cœurs et du sang bleu !" },
    { img: '../assets/images/funfacts/unexplored_seabed.jpg', text: "Plus de 80% des fonds marins restent inexplorés par l’homme." },
    { img: '../assets/images/funfacts/blue_whale.jpg', text: "La baleine bleue est l’animal le plus grand jamais connu sur Terre, plus grande qu’un diplodocus." },
    { img: '../assets/images/funfacts/clown_fish.jpg', text: "Le poisson clown change de sexe naturellement au cours de sa vie." },
    { img: '../assets/images/funfacts/corals.jpg', text: "Les coraux peuvent vivre pendant des milliers d'années s'ils ne sont pas perturbés." },
    { img: '../assets/images/funfacts/whale_under_water.jpg', text: "Les chants de baleines peuvent parcourir des centaines de kilomètres sous l'eau." },
    { img: '../assets/images/funfacts/seahorse.jpg', text: "Chez les hippocampes, ce sont les mâles qui portent les bébés." },
    { img: '../assets/images/funfacts/white_shark.jpg', text: "Le grand requin blanc peut détecter une goutte de sang dans 10 milliards de gouttes d'eau." },
];

let currentIndex;

function setupFunfactsPage() {
    const funfactImage = document.getElementById('funfact-image');
    const funfactText = document.getElementById('funfact-text');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (!funfactImage || !funfactText || !prevBtn || !nextBtn) {
        return;
    }

    function displayFunfact(index) {
        const funfact = funfacts[index];
        funfactImage.src = funfact.img;
        funfactText.textContent = funfact.text;
    }

    currentIndex = Math.floor(Math.random() * funfacts.length);
    displayFunfact(currentIndex);

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % funfacts.length;
        displayFunfact(currentIndex);
    });

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + funfacts.length) % funfacts.length;
        displayFunfact(currentIndex);
    });
}

document.addEventListener('DOMContentLoaded', setupFunfactsPage);
