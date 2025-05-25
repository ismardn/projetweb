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
