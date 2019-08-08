const socketio = require('socket.io');
const express = require('express');
const path = require('path');
const http = require('http');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/message');
const {addUsers, removeUser, getUser, getUsersInRoom} = require('./utils/users');

const app = express();
const publicFolder = path.join(__dirname, '../publicFolder');
app.use(express.static(publicFolder));

const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;



io.on('connection', (socket) => {
    
    socket.on('join', (options, callback) => {
        const {user, error} = addUsers({id: socket.id, ...options});
        
        if(error){
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('welcomeMsg', generateMessage('Admin', 'Welcome to Mars Chat Application'));
        socket.broadcast.to(user.room).emit('welcomeMsg', generateMessage(`${user.username} has joined!`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()

    })

    socket.on('sendMsg', (message, callback) => {
        const user = getUser(socket.id);
        const filter = new Filter();

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('welcomeMsg', generateMessage(user.username, message));
        callback('Message was received')
    });
    socket.on('getLocation', (location, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://www.google.com/maps?q=${location.latitude},${location.longitude}`));
        callback();
    });

   
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if(user){
            io.to(user.room).emit('welcomeMsg', generateMessage('Admin', `${user.username} has left the room`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
   
    })
})



server.listen(port, () => {
    console.log(`Server has started on port ${port}`)
})










