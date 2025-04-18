// Initialize message history
let conversationHistory = [];

// --- Nelson Farms Custom LLM API Configuration ---
const NELSON_FARMS_API_BASE_URL = "https://nelsonexternal.redforest-1a6c6335.centralus.azurecontainerapps.io";
const NELSON_FARMS_USERNAME = "adityasngpta@gmail.com"; // use real creds securely
const NELSON_FARMS_PASSWORD = "bYrR469jVUV#zlPO";
let nelsonFarmsJwtToken = null;

async function getNelsonFarmsAuthToken() {
  if (nelsonFarmsJwtToken) return nelsonFarmsJwtToken;
  const resp = await fetch(`${NELSON_FARMS_API_BASE_URL}/login`, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({username: NELSON_FARMS_USERNAME, password: NELSON_FARMS_PASSWORD})
  });
  if (!resp.ok) throw new Error(`Auth failed: ${resp.status}`);
  const data = await resp.json(); nelsonFarmsJwtToken = data.access_token;
  return nelsonFarmsJwtToken;
}

const SYSTEM_PROMPT = `
You are Nelson Farms Demo LLM, an expert farming advisor.
Provide clear guidance on crop planning, soil health, irrigation,
pest management, harvest timing, and sustainable practices.
Use concise, actionable advice for both small-scale and commercial farmers.
`;

// Audio feedback settings
let audioEnabled = true; // Can be toggled by user

async function getLLMResponse(input) {
  try {
    // Add user message to history
    conversationHistory.push({
      role: "user",
      content: input
    });

    // Ensure system prompt at start of history
    if (conversationHistory[0].role !== 'system') {
      conversationHistory.unshift({ role: 'system', content: SYSTEM_PROMPT });
    }

    // --- Call Custom LLM Agent via Nelson Farms API ---
    console.log("Sending request to custom LLM Agent...");
    // Ensure valid auth token
    const llmToken = await getNelsonFarmsAuthToken();
    const llmResponse = await fetch(`${NELSON_FARMS_API_BASE_URL}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${llmToken}`
      },
      body: JSON.stringify({
        model: "gpt-4.1",  // or your preferred model
        input: input       // single input string
      })
    });
    if (!llmResponse.ok) {
      const errText = await llmResponse.text();
      throw new Error(`Custom LLM request failed: ${llmResponse.status} - ${errText}`);
    }
    const llmJson = await llmResponse.json();
    // Extract the output text (handles various possible fields)
    const llmOutput = llmJson.output_text || llmJson.output || llmJson.choices?.[0]?.message?.content || llmJson.choices?.[0]?.text || JSON.stringify(llmJson);

    // Display and record the assistant's reply
    addChat(input, llmOutput);
    conversationHistory.push({ role: "assistant", content: llmOutput });

    // Optionally trim history
    if (conversationHistory.length > 20) {
        conversationHistory = [conversationHistory[0], ...conversationHistory.slice(-20)];
    }

    return llmOutput;
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