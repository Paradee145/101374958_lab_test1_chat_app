const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

const User = require('./models/userModel');
const GroupMessage = require('./models/groupMessageModel');
const PrivateMessage = require('./models/privateMessageModel');

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
})
.then(() => console.log("MongoDB Connected Successfully"))
.catch(err => console.error("MongoDB Connection Error:", err));

app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const users = {};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('setUsername', (username) => {
        users[username] = socket.id;
        console.log(`User ${username} connected with socket ID: ${socket.id}`);
    });

    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });

    socket.on('sendMessage', async ({ room, from_user, message }) => {
        console.log(`Message in ${room} from ${from_user}: ${message}`);

        try {
            const newMessage = new GroupMessage({ from_user, room, message });
            await newMessage.save();
            io.to(room).emit('receiveMessage', { from_user, message });
        } catch (error) {
            console.error("Error saving message:", error);
        }
    });

    socket.on('sendPrivateMessage', async ({ from_user, to_user, message }) => {
        console.log(`Private message from ${from_user} to ${to_user}: ${message}`);

        try {
            const newPrivateMessage = new PrivateMessage({ from_user, to_user, message });
            await newPrivateMessage.save();

            const recipientSocketId = users[to_user];
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('receivePrivateMessage', { from_user, message });
            }
        } catch (error) {
            console.error("Error saving private message:", error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        for (let username in users) {
            if (users[username] === socket.id) {
                delete users[username];
                console.log(`User ${username} disconnected`);
                break;
            }
        }
    });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
