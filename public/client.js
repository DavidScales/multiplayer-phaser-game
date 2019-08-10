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

// TODO: ref
document.onkeydown = (event) => {
    if (event.keyCode === 68) { // d
        socket.emit('keyPress', { inputId: 'right' , state: true })
    }
    else if (event.keyCode === 65) { // a
        socket.emit('keyPress', { inputId: 'left' , state: true })
    }
    else if (event.keyCode === 87) { // w
        socket.emit('keyPress', { inputId: 'up' , state: true })
    }
    else if (event.keyCode === 83) { // 2
        socket.emit('keyPress', { inputId: 'down' , state: true })
    }
};

document.onkeyup = (event) => {
    if (event.keyCode === 68) { // d
        socket.emit('keyPress', { inputId: 'right' , state: false })
    }
    else if (event.keyCode === 65) { // a
        socket.emit('keyPress', { inputId: 'left' , state: false })
    }
    else if (event.keyCode === 87) { // w
        socket.emit('keyPress', { inputId: 'up' , state: false })
    }
    else if (event.keyCode === 83) { // 2
        socket.emit('keyPress', { inputId: 'down' , state: false })
    }
};