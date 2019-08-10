console.log('hello world');

const socket = io();

const emitGreeting = () => {
    socket.emit('greeting', {
        content: 'some content'
    })
}
document.querySelector('button').addEventListener('click', emitGreeting)