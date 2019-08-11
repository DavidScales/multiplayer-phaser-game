const ctx = document.querySelector('canvas#ctx').getContext('2d');
ctx.font = '30px Roboto';

const socket = io();

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