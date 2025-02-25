const express = require('express')
const dotenv = require('dotenv').config()
const bodyParser = require('body-parser')
const { Server } = require('socket.io')
const { createServer } = require('http')

const app = express()
const server = createServer(app)
const io = new Server(server)

app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json())
app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    res.status(200).json({
        status:'SUCCESS',
        currentTime: new Date().toLocaleString()
    })
})

const users = {
    // 'oUKrCONZdvGrc1uuAAAJ': 'Pankaj',
    // 'oUKrCONZdvGrc1uuAAAY': 'Komal'// this is referces to the name

}
// handle client connection (event: 'connection')
 
io.on('connection', (socket) => {
    console.log('A new user connected', socket.id)

    socket.on('setRoomUsername', ({ name, room }) => {
        users[socket.id] = { name, room }
        socket.join(room) // user join the room provide with the socket.id
        console.log(`${users[socket.id].name} connected`)
        // io.emit('joinMessage', `${users[socket.id]} joined`) // it is showing all the clients includes it self
        // socket.broadcast.emit('joinMessage', `${ users[socket.id].name } joined`) // it is showing the all clients except sender
        // socket.to(room).emit('joinMessage', `You joined`) // send the message to the sender
        socket.broadcast.to(room).emit('joinMessage', `${ users[socket.id].name } joined`)
        // io.to(room).emit('joinMessage', `${ users[socket.id].name } joined`)
        // socket.to(room).emit('joinMessage',  ' You joined')

    })

    // Handle the custom event from the client
    socket.on('newMessage', ( message) => {  

    // send custom event from server to sender client
    //socket.emit('severMsg', 'Your Message was received ') // server send the message to client.

    // send custom event from server to all the client
    const newMessageDetails = {
        name: users[socket.id].name,
        message: message
    }
    console.log(newMessageDetails)
    io.to(users[socket.id].room).emit('newMessageToAll', newMessageDetails)
    })

    // handle client dsconnections (event: 'disconnect')
    socket.on('disconnect', () => {
        console.log(`${ users[socket.id] && users[socket.id].name } disconnected`)
    
    })
})



server.listen(3000, () => {
    console.log('Server is running')
})

/*
  # Socket Programming
    - Rooms: Group multiple clients together so that they can send messages to each other
    - socket.io: javascript library
    - Server:
       - socket.join(room): joining a secific room by the roomId
       - socket.emit('event', message): send the custom event from the server to sender client
       - socket.broadcast.to(room).emit('event', message): send the custom event from the server to all clients except sender in the room
       - io.to(room).emit('event', message): send a custom event from the server to all the clients in the room


*/
