// Initialize message history
let conversationHistory = [];

const API_BASE_URL = "https://nelsonexternal.redforest-1a6c6335.centralus.azurecontainerapps.io";
const FARM_USERNAME = "adityasngpta@gmail.com";
const FARM_PASSWORD = "bYrR469jVUV#zlPO";

// Audio feedback settings
let audioEnabled = true; // Can be toggled by user

// Helper: Get JWT token from farm API
async function getAuthToken() {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: FARM_USERNAME,
      password: FARM_PASSWORD
    })
  });
  if (!response.ok) throw new Error("Failed to get auth token");
  const data = await response.json();
  return data.access_token;
}

// Helper: Get fuel reporting
async function getFuelReporting(jwtToken) {
  const response = await fetch(`${API_BASE_URL}/fuel_reporting`, {
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${jwtToken}`
    }
  });
  if (!response.ok) return `Error: ${response.status} - ${await response.text()}`;
  return await response.json();
}

// Helper: Get crop storage
async function getCropStorage(jwtToken) {
  const response = await fetch(`${API_BASE_URL}/crop_storage`, {
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${jwtToken}`
    }
  });
  if (!response.ok) return `Error: ${response.status} - ${await response.text()}`;
  return await response.json();
}

// Main LLM agent logic (demo: simple tool-calling based on keywords)
async function getLLMResponse(input) {
  try {
    // Add user message to history
    conversationHistory.push({
      role: "user",
      content: input
    });

    // Tool-calling: check for keywords and call farm API tools
    let toolResponse = null;
    let toolUsed = null;
    let jwtToken = null;

    // Simple keyword-based tool selection (replace with LLM function-calling if needed)
    if (/fuel|diesel|gas|usage|tank/i.test(input)) {
      toolUsed = "fuel_reporting";
    } else if (/storage|bin|crop|bushel|capacity/i.test(input)) {
      toolUsed = "crop_storage";
    }

    if (toolUsed) {
      // Get JWT token and call the tool
      jwtToken = await getAuthToken();
      if (toolUsed === "fuel_reporting") {
        toolResponse = await getFuelReporting(jwtToken);
      } else if (toolUsed === "crop_storage") {
        toolResponse = await getCropStorage(jwtToken);
      }
    }

    // Compose assistant reply
    let assistantReply = "";
    if (toolUsed && toolResponse) {
      if (toolUsed === "fuel_reporting") {
        assistantReply = "Here is the latest fuel usage report for your farm equipment:<br><pre>" +
          JSON.stringify(toolResponse, null, 2) + "</pre>";
      } else if (toolUsed === "crop_storage") {
        assistantReply = "Here is the current crop storage information:<br><pre>" +
          JSON.stringify(toolResponse, null, 2) + "</pre>";
      }
    } else {
      // Fallback: Use OpenAI LLM for general farming advice (replace with your own LLM if needed)
      // For demo, use a static response
      assistantReply = "I'm Nelson Farms Demo LLM. Please ask about fuel usage or crop storage for live data, or any farming question for advice.";
    }

    // Render Markdown (if needed)
    function formatMarkdown(text) {
      return text
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/`([^`]+)`/gim, '<code>$1</code>')
        .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>')
        .replace(/\n/g, '<br/>');
    }

    // Show bot response
    const botText = addChat(input, "");
    botText.innerHTML = formatMarkdown(assistantReply);

    // Add assistant's response to history
    conversationHistory.push({
      role: "assistant",
      content: assistantReply
    });

    // Scroll to bottom
    const messagesContainer = document.getElementById("messages");
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    return assistantReply;
  } catch (error) {
    console.error('Error:', error);
    return "Sorry, I'm having trouble connecting right now.";
  }
}

async function output(input) {
  try {
    console.log('Processing user input:', input);
    const reply = await getLLMResponse(input);
    
    // Check if audio is enabled before speaking
    if (audioEnabled && typeof textToSpeech === 'function') {
      console.log('Starting text-to-speech for response');
      await textToSpeech(reply);
    } else {
      console.log('Audio output skipped (disabled or not available)');
    }
  } catch (error) {
    console.error('Error in output function:', error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize with system prompt
  conversationHistory = [{
    role: "system",
    content: SYSTEM_PROMPT
  }];
  
  const welcome = "Hi, I'm Nelson Farms Demo LLM! 🌽 Ready to help with all your farming questions.";
  addChat("", welcome, true);
  
  // Add welcome message to history
  conversationHistory.push({
    role: "assistant",
    content: welcome
  });

  // Initialize speech capabilities
  if (typeof initSpeechRecognition === 'function') {
    initSpeechRecognition();
  }

  const inputField = document.getElementById("input");
  inputField.addEventListener("keydown", async (e) => {
    if (e.key === "Enter" && inputField.value.trim() !== "") {
      let input = inputField.value;
      inputField.value = "";
      await output(input);
    }
  });

  // Add audio toggle button if available
  const audioToggleBtn = document.getElementById("audioToggleBtn");
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener("click", () => {
      audioEnabled = !audioEnabled;
      audioToggleBtn.innerHTML = audioEnabled ? 
        '<i class="fas fa-volume-up"></i>' : 
        '<i class="fas fa-volume-mute"></i>';
      audioToggleBtn.title = audioEnabled ? "Mute Audio" : "Enable Audio";
    });
  }
  
  // Add send button functionality
  const sendBtn = document.getElementById("sendBtn");
  if (sendBtn) {
    sendBtn.addEventListener("click", () => {
      if (inputField.value.trim() !== "") {
        const event = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
          bubbles: true
        });
        inputField.dispatchEvent(event);
      }
    });
  }
});

function addChat(input, placeholder, isWelcome = false) {
  const messagesContainer = document.getElementById("messages");

  if (!isWelcome) {
    // Create user message
    let userDiv = document.createElement("div");
    userDiv.id = "user";
    userDiv.className = "user response";
    userDiv.innerHTML = `<img src="user.png" class="avatar"><span>${input}</span>`;
    messagesContainer.appendChild(userDiv);
  }

  // Create bot message
  let botDiv = document.createElement("div");
  let botImg = document.createElement("img");
  let botText = document.createElement("span");
  botDiv.id = "bot";
  botImg.src = "bot-mini.png";
  botImg.className = "avatar";
  botDiv.className = "bot response";
  botText.innerText = placeholder;
  botDiv.appendChild(botImg);
  botDiv.appendChild(botText);
  messagesContainer.appendChild(botDiv);

  // Keep messages at most recent
  messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;
  return botText;
}