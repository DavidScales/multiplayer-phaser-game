const ctx = document.querySelector('canvas#ctx').getContext('2d');
ctx.font = '30px Roboto';

const chatText = document.querySelector('div#chat-text');
const chatInput = document.querySelector('input#chat-input');
const chatForm = document.querySelector('form#chat-form');

const socket = io();

socket.on('evalAnswer', (data) => {
    console.log(data);
});

socket.on('addToChat', (data) => {
    // TODO: sanitize of course
    chatText.innerHTML += `<p>${data}</p>`;
});

chatForm.addEventListener('submit', (event) => {
    event.preventDefault()
    if (chatInput.value[0] === '/') {
        socket.emit('evalServer', chatInput.value.slice(1));
    } else {
        socket.emit('sendMessageToServer', chatInput.value);
    }
    chatInput.value = '';
})

socket.on('newPositions', data => {
    ctx.clearRect(0, 0, 500, 500);
    const players = data.players;
    for (let i = 0; i < players.length; i++) {
        let player = players[i]
        ctx.fillText(player.number, player.x, player.y);
    }
    const bullets = data.bullets;
    for (let i = 0; i < bullets.length; i++) {
        let bullet = bullets[i]
        // ctx.fillText('o', bullet.x, bullet.y);
        ctx.fillRect(bullet.x - 5, bullet.y - 5, 10, 10);
    }
});

const keyMap = {
    68: 'right', // d
    65: 'left', // a
    87: 'up', // w
    83: 'down', // d
}
document.onkeydown = (event) => {
    socket.emit('keyPress', { inputId: keyMap[event.keyCode] , state: true })
};
document.onkeyup = (event) => {
    socket.emit('keyPress', { inputId: keyMap[event.keyCode] , state: false })
};