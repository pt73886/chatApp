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

    socket.on('setUsername', (name) => {
        users[socket.id] = name
        console.log(`${users[socket.id]} connected`)

    })

    // Handle the custom event from the client
    socket.on('newMessage', ( message) => {  
    console.log(`${users[socket.id]}: ${message}`)

    // send custom event from server to sender client
    //socket.emit('severMsg', 'Your Message was received ') // server send the message to client.

    // send custom event from server to all the client
    io.emit('newMessageToAll', `${users[socket.id]}: ${message}`)
    })
    // handle client dsconnections (event: 'disconnect')
    socket.on('disconnect', () => {
        console.log(`${users[socket.id]} disconnected`)
    
    })
})



server.listen(3000, () => {
    console.log('Server is running')
})
