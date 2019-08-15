const socket = io();

// Auth
const authDiv = document.querySelector('div#auth');
const usernameInput = document.querySelector('input#username');
const passwordInput = document.querySelector('input#password');
const signInBtn = document.querySelector('button#sign-in');
const signUpBtn = document.querySelector('button#sign-up');

signInBtn.addEventListener('click', (event) => {
    socket.emit('signIn', {
        username: usernameInput.value, password: passwordInput.value
    })
});
socket.on('signInResponse', (data) => {
    if (data.success) {
        authDiv.style.display = 'none';
        gameDiv.style.display = 'inline-block';
    } else {
        // TODO: instead display error div
        alert('Sign in failed :/');
    }
});

signUpBtn.addEventListener('click', (event) => {
    socket.emit('signUp', {
        username: usernameInput.value, password: passwordInput.value
    })
});
socket.on('signUpResponse', (data) => {
    if (data.success) {
        // TODO: instead display success div && sign in automatically
        alert('Sign up successful :D');
    } else {
        // TODO: instead display error div
        alert(`Sign up failed: ${data.message}`);
    }
});

// Game
const gameDiv = document.querySelector('div#game');
const ctx = document.querySelector('canvas#ctx').getContext('2d');
ctx.font = '30px Roboto';
const chatText = document.querySelector('div#chat-text');
const chatInput = document.querySelector('input#chat-input');
const chatForm = document.querySelector('form#chat-form');

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
    socket.emit('keyPress', { inputId: keyMap[event.keyCode], state: true });
};
document.onkeyup = (event) => {
    socket.emit('keyPress', { inputId: keyMap[event.keyCode], state: false });
};
document.onmousedown = (event) => {
    socket.emit('keyPress', { inputId: 'attack', state: true });
};
document.onmouseup = (event) => {
    socket.emit('keyPress', { inputId: 'attack', state: false });
};
document.onmousemove = (event) => {
    // TODO: clean up magic numbers
    const x = -250 + event.clientX - 8;
    const y = -250 + event.clientY - 8;
    const angle = Math.atan2(y, x) / Math.PI * 180;
    socket.emit('keyPress', { inputId: 'mouseAngle', state: angle });
};