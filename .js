const socket = io('http://localhost:5000');  // ✅ Connect to the backend

// ✅ Function to join a room
function joinRoom() {
    const room = document.getElementById('roomInput').value;
    if (room.trim() === "") {
        alert("Please enter a room name.");
        return;
    }
    socket.emit('joinRoom', room);  // Send room join request to the backend
    alert(`Joined room: ${room}`);
}

// ✅ Function to send a message
function sendMessage() {
    const message = document.getElementById('messageInput').value;
    const room = document.getElementById('roomInput').value;
    
    if (room.trim() === "" || message.trim() === "") {
        alert("Please enter a message and select a room.");
        return;
    }

    // Send the message to the backend
    socket.emit('sendMessage', { room, from_user: "testuser", message });

    document.getElementById('messageInput').value = ''; // Clear input
}

// ✅ Receive messages from the backend
socket.on('receiveMessage', (data) => {
    const chatBox = document.getElementById('chatBox');
    chatBox.innerHTML += `<p><strong>${data.from_user}:</strong> ${data.message}</p>`;
});
