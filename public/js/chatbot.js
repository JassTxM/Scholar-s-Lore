
document.addEventListener('DOMContentLoaded', function () {
    const chatbotButton = document.getElementById('chatbot-button');
    const chatbotPanel = document.getElementById('chatbot-panel');
    const minimizeButton = document.getElementById('minimize-chat');
    const closeButton = document.getElementById('close-chat');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chatbot-messages');
    const typingIndicator = document.getElementById('chatbot-typing');

    const API_KEY = 'AIzaSyCARawXzMQZxiNXo9pv3QpoWNhOLZPeMBc';
    const MODEL = 'gemini-2.0-flash-lite';
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${API_KEY}`;

    chatbotButton.addEventListener('click', () => {
        const isVisible = chatbotPanel.style.display === 'flex';
        chatbotPanel.style.display = isVisible ? 'none' : 'flex';
        chatbotPanel.style.flexDirection = 'column';
        chatbotPanel.style.right = '20px';
        chatbotPanel.style.transition = 'all 0.3s ease-in-out';
        userInput.focus();
    });

    minimizeButton.addEventListener('click', () => chatbotPanel.style.display = 'none');
    closeButton.addEventListener('click', () => chatbotPanel.style.display = 'none');

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') sendMessage();
    });

    function sendMessage() {
        const message = userInput.value.trim();
        if (message !== '') {
            addMessage(message, 'user');
            userInput.value = '';
            showTypingIndicator();

            getBotResponse(message)
                .then(response => {
                    hideTypingIndicator();
                    addMessage(response, 'bot');
                })
                .catch(() => {
                    hideTypingIndicator();
                    addMessage("Oops! Something went wrong. Try again.", 'bot');
                });
        }
    }

    function addMessage(text, sender) {
        if (sender === 'bot') {
            addTypingMessage(text);
        } else {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'user-message';
            messageDiv.innerText = text;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    function addTypingMessage(fullText) {
        const botMsg = document.createElement('div');
        botMsg.className = 'bot-message typing-message';
        chatMessages.appendChild(botMsg);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        let index = 0;
        const typingInterval = setInterval(() => {
            botMsg.innerHTML = fullText.slice(0, index) + '<span class="blinking-cursor">|</span>';
            index++;
            chatMessages.scrollTop = chatMessages.scrollHeight;

            if (index > fullText.length) {
                clearInterval(typingInterval);
                botMsg.innerHTML = fullText;
            }
        }, 30); // Typing speed
    }

    function showTypingIndicator() {
        typingIndicator.innerHTML = `
            <div class="thinking-message">
                <span>Scholar is thinking</span>
                <span class="thinking-dots"></span>
            </div>
        `;

        // Append styles if not already added
        if (!document.getElementById('thinking-style')) {
            const style = document.createElement('style');
            style.id = 'thinking-style';
            style.textContent = `
                .thinking-message {
                    display: flex;
                    align-items: center;
                    background-color: #ffffff;
                    border-radius: 18px;
                    padding: 8px 12px;
                    font-size: 14px;
                    color: #f9c87b;
                }
                .thinking-dots::after {
                    content: '...';
                    display: inline-block;
                    overflow: hidden;
                    width: 0;
                    animation: thinking 1.5s infinite steps(4);
                }
                @keyframes thinking {
                    0% { width: 0; }
                    100% { width: 24px; }
                }
                .blinking-cursor {
                    font-weight: bold;
                    font-size: 16px;
                    color: #333;
                    animation: blink 1s step-start infinite;
                }
                @keyframes blink {
                    0%, 50%, 100% { opacity: 1; }
                    25%, 75% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    function hideTypingIndicator() {
        typingIndicator.innerHTML = '';
    }

    function isInappropriate(message) {
        const inappropriateKeywords = [
            'stupid', 'idiot', 'hate', 'racist', 'sex', 'disrespect', 'offensive', 'inappropriate', 'fool', 'dumb'
        ];
        return inappropriateKeywords.some(keyword => message.toLowerCase().includes(keyword));
    }

    function getBotResponse(message) {
        const lower = message.toLowerCase();

        if (isInappropriate(message)) {
            return Promise.resolve("Let's keep the conversation respectful and educational. How can I assist you with your learning?");
        }

        const replies = {
            "your name": "I'm Scholar, your AI guide to learning on Scholar's Lore.",
            "your developer name": "I was created by the team at Scholar's Lore.",
            "best plan": "To view our best plans, visit our Plans page.",
            "contact": "To get in touch with our team, drop in your query on the Contact Us page.",
            "who created you": "I was created by the Scholar's Lore team to assist learners like you.",
            "what can you do": "I help explain concepts, answer questions, and support your learning journey.",
            "subjects": "I assist with Science, Math, Programming, Environment and more. Ask me anything!",
            "how to use": "Simply type a question or topic, and I’ll respond with helpful info.",
            "thank you": "You're welcome! Let me know if you have more questions.",
            "hello": "Hello! How can I support your studies today?",
            "bye": "Goodbye! Come back soon for more learning.",
            "mentor": "Think of me as your study mentor, always ready to guide you.",
            "who are you": "I’m Scholar, your friendly AI tutor from Scholar's Lore.",
            "motivate": "You're doing great! Keep moving forward—every step counts.",
            "joke": "Why did the student eat their homework? Because the teacher said it was a piece of cake!",
        };

        for (let key in replies) {
            if (lower.includes(key)) {
                return Promise.resolve(replies[key]);
            }
        }

        // Gemini API fallback
        const systemPrompt = `
You are Scholar, an AI educator on the Scholar's Lore platform. 
Your responses must:
- Sound professional, clear, and supportive.
- Be in an educational tone.
- Be limited to 20–30 words per reply.
- Focus on learning, facts, and explanations.
Always keep the user’s learning in mind while answering.
`;

        return fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [{ text: `${systemPrompt}\n\nUser: ${message}` }]
                    }
                ]
            })
        })
            .then(res => res.json())
            .then(data => data?.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't process that. Please try again.");
    }
});
