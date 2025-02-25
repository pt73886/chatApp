const express = require('express')
const dotenv = require('dotenv').config()
const bodyParser = require('body-parser')
const { Server } = require('socket.io')
const { createServer } = require('http')
const { default: mongoose } = require('mongoose')

const app = express()
const server = createServer(app)
const io = new Server(server)

app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json())
app.use(express.static(__dirname + '/public'))

const connectToDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log('Database connected ✅')

    } catch (error) {
        console.log('Database error:', error)
    }
}
 const messageSchema = new mongoose.Schema ( {
    name: String,
    room: Number,
    message: String
 })
const Message = mongoose.model('Message', messageSchema)

const savedMessage = async ({ name, message}) => {
    try {

        await Message.create({ name, message})
        console.log('Message synced')


    } catch (error) {
        console.log('Error:', error)
    }
}

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
        // io.emit('joinMessage', `${users[socket.id]} joined`) // it is showing all the clients includes it self
        socket.broadcast.emit('joinMessage', `${users[socket.id]} joined`) // it is showing the all clients except sender
        socket.emit('joinMessage', `You joined`) // send the message to the sender

    })

    // Handle the custom event from the client
    socket.on('newMessage', ( message) => {  
    

    // send custom event from server to sender client
    //socket.emit('severMsg', 'Your Message was received ') // server send the message to client.

    // send custom event from server to all the client
    const newMessageDetails = {
        name: users[socket.id],
        message: message
    }
    savedMessage(newMessageDetails)
    
    io.emit('newMessageToAll', newMessageDetails)
    })
    // handle client dsconnections (event: 'disconnect')
    socket.on('disconnect', () => {
        console.log(`${users[socket.id]} disconnected`)
    
    })
})



server.listen(3000, () => {
    console.log('Server is running')
    connectToDb()
})
