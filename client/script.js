function askQuestion() {
    const question = document.getElementById("question").value;
    const chatContainer = document.getElementById("chat-container");
    const loadingScreen = document.getElementById("loading");
    const submitButton = document.getElementById("submit-button");
    if (question === "") {
        alert("tekstbericht is leeg!");
        return;
    }

    submitButton.disabled = true;


    displayMessage(question, true);


    loadingScreen.classList.remove("hidden");

    // Make POST request to server
    fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: question })
    })
        .then(response => response.json())
        .then(data => {
            // Display bot message in chat window
            displayMessage(data, false);


            submitButton.disabled = false;


            loadingScreen.classList.add("hidden");

            // Scroll to bottom of chat window
            chatContainer.scrollTop = chatContainer.scrollHeight;
        })
        .catch(error => {
            console.error("Error:", error);

            displayMessage("server error.", false);

            submitButton.disabled = false;

            loadingScreen.classList.add("hidden");

            chatContainer.scrollTop = chatContainer.scrollHeight;
        });


    document.getElementById("question").value = "";
}

function displayMessage(message, isUser) {
    const chatContainer = document.getElementById("chat-container");
    const messageDiv = document.createElement("div");
    messageDiv.textContent = message;
    messageDiv.classList.add("message");

    if (isUser) {
        messageDiv.classList.add("user-message");
    }

    chatContainer.appendChild(messageDiv);
}
