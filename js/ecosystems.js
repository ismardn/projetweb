function flipCard(event, eco) {
    event.preventDefault();
    event.stopPropagation();
    const card = event.target.closest('.eco-card');
    if (card) {
        card.classList.toggle('flipped');
    }
}