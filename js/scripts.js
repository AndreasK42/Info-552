const chatInput = document.querySelector("#chatInput");
const sendButton = document.querySelector("#enterButton");
const chatContainer = document.querySelector(".chat-container");
const wikiFrame = document.getElementById("wikiFrame");

let userText = null;
const API_KEY = "YOUR_API_KEY";  
let messages = [];

const createElement = (html, className) => {
  const chatDiv = document.createElement("div");
  chatDiv.classList.add("chat", className);
  chatDiv.innerHTML = html;
  return chatDiv; 
}

const navigateToWikiPage = (term) => {
  wikiFrame.src = `https://en.wikipedia.org/wiki/${term}`;
}

function scrollIframe(distance) {
    const iframe = wikiFrame.contentWindow;
    iframe.postMessage({ scrollBy: distance }, '*');
}

const getChatResponse = async (incomingChatDiv) => {
    let responseText = '';

    if (userText.toLowerCase().startsWith("go to")) {
        const topic = userText.slice(6).trim();
        navigateToWikiPage(topic);
        responseText = `Navigating to ${topic}...`;
        messages.push({
            role: 'user',
            content: responseText
        });
    } else if (userText.toLowerCase().includes("scroll up")) {
        scrollIframe(-100);  
        responseText = "Scrolling up... (but not actually, because apperently there is a security limitation that browsers enforce to prevent potentially malicious actions from being taken on iframes from different origins, so i would need access to wikipedia's source code, or to host it myself. I'm sure there are other ways to do it though, and i'll keep looking. But, this would work for sites i own.)";
    } else if (userText.toLowerCase().includes("scroll down")) {
        scrollIframe(100);   
        responseText = "Scrolling down... (but not actually, because apperently there is a security limitation that browsers enforce to prevent potentially malicious actions from being taken on iframes from different origins, so i would need access to wikipedia's source code, or to host it myself. I'm sure there are other ways to do it though, and i'll keep looking. But, this would work for sites i own.)";
    } else {
        messages.push({
            role: 'user',
            content: userText
        });
    }

    const API_URL = "https://api.openai.com/v1/chat/completions";
    const pElement = document.createElement("p");

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: messages,
            max_tokens: 2048,
            temperature: 0.2
        })
    };

    try {
        if (!responseText) {  
            const response = await fetch(API_URL, requestOptions);
            const responseData = await response.json();
            responseText = responseData.choices[0].message.content;
            messages.push({
                role: 'assistant',
                content: responseText
            });
        }
        
        pElement.textContent = responseText;
    } catch (error) {
        console.error(error);
    }

    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chatDetails").appendChild(pElement);
}

const showTypingAnimation = () => {
  const html = `<div class="chatContents">
  <div class="chatDetails">
  <img class="icon" src="ofkuy1b9.bmp" alt="wikipedia logo">
      <div class="typing-animation">
          <div class="typingDot" style="animation-delay: 0.4s;"></div>
          <div class="typingDot" style="animation-delay: 0.3s;"></div>
          <div class="typingDot" style="animation-delay: 0.2s;"></div>
      </div>
  </div>
</div>`;

const incomingChatDiv = createElement(html, "chatRobot");
chatContainer.appendChild(incomingChatDiv);
getChatResponse(incomingChatDiv);
}

const handleOutgoingChat = () => {
  userText = chatInput.value.trim();
  if (userText === "") {
    return;
  }
  const html = `<div class="chatContents">
                  <div class="chatDetails">
                    <p>${userText}</p>
                    <img class="icon" src="publicdomainguy.jpeg" alt="image of user avatar (a black and white image of a person holding an instrument)">
                  </div>
                </div>`;
  const outgoingChatDiv = createElement(html, "chatHuman");
  chatContainer.appendChild(outgoingChatDiv);

  setTimeout(showTypingAnimation, 500);
}

sendButton.addEventListener("click", handleOutgoingChat);

chatInput.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
      handleOutgoingChat();
      event.preventDefault();
  }
}
);
