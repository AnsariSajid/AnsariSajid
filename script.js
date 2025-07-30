const toggleButton = document.getElementsByClassName('toggle-button')[0];
const navbarLinks = document.getElementsByClassName('navbar-links')[0];

toggleButton.addEventListener('click', (e) => {
    e.preventDefault();
    navbarLinks.classList.toggle('active');
});

const chatbotToggler = document.querySelector(".chatbot-toggler");
const chatInput = document.getElementById("chat-input");
const sendChatBtn = document.getElementById("chat-send-btn");
const chatbox = document.querySelector(".chatbox");
let chatHistory = [];

chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));

const handleChat = async () => {
    const userInput = chatInput.value.trim();
    if(!userInput) return;
    
    chatInput.value = "";
    appendMessage(userInput, "user");
    
    const thinkingMessage = appendMessage("...", "bot");
    
    try {
        const botResponse = await getGeminiResponse(userInput);
        thinkingMessage.querySelector("p").textContent = botResponse;
    } catch (error) {
        console.error("Chatbot Error:", error);
        thinkingMessage.querySelector("p").textContent = "Oops! Something went wrong. Please try again.";
    }
}

sendChatBtn.addEventListener("click", handleChat);
chatInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleChat();
    }
});

function appendMessage(message, type) {
    const messageLi = document.createElement("li");
    messageLi.classList.add("chat-message", type);
    const messageP = document.createElement("p");
    messageP.textContent = message;
    messageLi.appendChild(messageP);
    chatbox.appendChild(messageLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    return messageLi;
}

async function getGeminiResponse(userInput) {
    const context = `You are a helpful AI assistant for Sajid Ansari's portfolio.
    Here is information about him:
    - Name: Sajid Ansari
    - Education: B.Tech in CSE student at Ramchandra Chandravansi Institute of Technology.
    - Skills: HTML (90%), CSS (85%), JavaScript (70%), Python (50%).
    - Goal: To become a skilled full-stack developer.
    - Contact: Users can email him via the contact button.
    
    Based on this information and the conversation history, answer the user's questions about Sajid. Keep answers concise and friendly. If you don't know the answer, say that you don't have that information.`;

    chatHistory.push({ role: "user", parts: [{ text: userInput }] });
    
    const payload = {
        contents: [
            { role: "user", parts: [{ text: context }] },
            ...chatHistory
        ]
    };

    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error("API request failed");
    }

    const result = await response.json();
    
    if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0]) {
        const botResponseText = result.candidates[0].content.parts[0].text;
        chatHistory.push({ role: "model", parts: [{ text: botResponseText }] });
        return botResponseText;
    } else {
        throw new Error("Invalid API response.");
    }
}
