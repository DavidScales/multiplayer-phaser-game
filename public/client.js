const ctx = document.querySelector('canvas#ctx').getContext('2d');
ctx.font = '30px Roboto';

const socket = io();

socket.on('newPosition', data => {
    ctx.clearRect(0, 0, 500, 500);
    for (let i = 0; i < data.length; i++) {
        let player = data[i]
        ctx.fillText(player.number, player.x, player.y);
    }
});