const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { WebcastPushConnection } = require('tiktok-live-connector');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

io.on('connection', (socket) => {
    socket.on('set-username', (username) => {
        console.log(`Connecting to: ${username}`);
        const tiktokLiveConnection = new WebcastPushConnection(username);
        
        tiktokLiveConnection.on('chat', async (data) => {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent(Reply briefly to: ${data.comment});
                io.emit('bot-reply', { user: data.uniqueId, text: result.response.text() });
            } catch (error) {
                console.error("AI Error:", error);
            }
        });

        tiktokLiveConnection.connect().catch(err => console.log(err));
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log('Server is running on port 3000');
});
