const socket = io('http://localhost:5000'); // Ensure socket connection

window.onload = function () {
    console.log("✅ chat.js loaded");

    // Get all required elements
    const usernameField = document.getElementById('usernameInput');
    const roomField = document.getElementById('roomInput');
    const messageField = document.getElementById('messageInput');
    const joinRoomBtn = document.getElementById('joinRoomBtn');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const chatBox = document.getElementById('chatBox');

    // Check if any element is missing
    if (!usernameField || !roomField || !messageField || !joinRoomBtn || !sendMessageBtn || !chatBox) {
        console.error("❌ Missing input fields in HTML! Check your `index.html`.");
        return;
    }

    // Join Room Function
    joinRoomBtn.onclick = function () {
        const username = usernameField.value.trim();
        const room = roomField.value.trim();

        if (username === "" || room === "") {
            alert("Please enter a username and a room name.");
            return;
        }

        console.log(` Joining room: ${room} as ${username}`);
        socket.emit('setUsername', username);
        socket.emit('joinRoom', room);
        alert(`Joined room: ${room} as ${username}`);
    };

    // Send Message Function
    sendMessageBtn.onclick = function () {
        const message = messageField.value.trim();
        const room = roomField.value.trim();
        const username = usernameField.value.trim();

        if (room === "" || message === "") {
            alert("Please enter a message and select a room.");
            return;
        }

        console.log(` Sending message: "${message}" from ${username} to room: "${room}"`);
        socket.emit('sendMessage', { room, from_user: username, message });

        messageField.value = ''; // Clear input field
    };

    // Receive Messages and Update Chat Box
    socket.on('receiveMessage', (data) => {
        chatBox.innerHTML += `<p><strong>${data.from_user}:</strong> ${data.message}</p>`;
    });
};








