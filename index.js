// Initialize message history
let conversationHistory = [];

// Nelson Farms API configuration
const API_BASE_URL = "https://nelsonexternal.redforest-1a6c6335.centralus.azurecontainerapps.io";
const FARM_USERNAME = "adityasngpta@gmail.com";
const FARM_PASSWORD = "bYrR469jVUV#zlPO";

// System prompt definition
const SYSTEM_PROMPT = `
You are Nelson Farms Demo LLM, a friendly and knowledgeable farming advisor.
Provide clear, practical guidance on crop planning, soil health, irrigation,
pest management, harvest timing, and sustainable practices.
`;

// Audio feedback settings
let audioEnabled = true;

// Farm API helper functions
async function getAuthToken() {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: FARM_USERNAME,
        password: FARM_PASSWORD
      })
    });
    
    if (!response.ok) throw new Error(`Auth failed: ${response.status}`);
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
}

async function getFuelReporting(jwtToken) {
  const response = await fetch(`${API_BASE_URL}/fuel_reporting`, {
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${jwtToken}`
    }
  });
  
  if (response.ok) return await response.json();
  return `Error fetching fuel data: ${response.status}`;
}

async function getCropStorage(jwtToken) {
  const response = await fetch(`${API_BASE_URL}/crop_storage`, {
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${jwtToken}`
    }
  });
  
  if (response.ok) return await response.json();
  return `Error fetching crop storage data: ${response.status}`;
}

// Main LLM agent function
async function getLLMResponse(input) {
  try {
    // Add user message to history
    conversationHistory.push({ role: "user", content: input });
    
    // Detect intent from user message
    let response = "";
    let jwtToken = null;
    
    // Simple intent detection
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes("fuel") || lowerInput.includes("gas") || 
        lowerInput.includes("diesel") || lowerInput.includes("usage")) {
      // Handle fuel reporting request
      try {
        jwtToken = await getAuthToken();
        const fuelData = await getFuelReporting(jwtToken);
        response = `Here's the latest fuel usage report for your farm equipment:\n\n${formatDataAsTable(fuelData)}`;
      } catch (error) {
        response = "I couldn't retrieve the fuel report. There might be an authentication issue.";
      }
    } 
    else if (lowerInput.includes("storage") || lowerInput.includes("inventory") || 
             lowerInput.includes("crop") || lowerInput.includes("bushel") || 
             lowerInput.includes("silo")) {
      // Handle crop storage request
      try {
        jwtToken = await getAuthToken();
        const storageData = await getCropStorage(jwtToken);
        response = `Here's your current crop storage information:\n\n${formatDataAsTable(storageData)}`;
      } catch (error) {
        response = "I couldn't retrieve crop storage data. There might be an authentication issue.";
      }
    }
    else {
      // Generic farming advice for other queries
      response = getGenericFarmingAdvice(lowerInput);
    }
    
    // Add response to history
    conversationHistory.push({ role: "assistant", content: response });
    
    // Return formatted response
    const botText = addChat(input, "");
    botText.innerHTML = formatMarkdown(response);
    
    // Scroll to the most recent message
    const messagesContainer = document.getElementById("messages");
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return response;
  } catch (error) {
    console.error("Error in agent response:", error);
    return "Sorry, I'm having trouble processing your request right now.";
  }
}

// Helper function to format API data as a readable table
function formatDataAsTable(data) {
  if (!data || typeof data !== 'object') return "No data available";
  
  // For arrays of objects
  if (Array.isArray(data)) {
    if (data.length === 0) return "No entries found";
    
    // Create markdown table
    const keys = Object.keys(data[0]);
    let table = `| ${keys.join(' | ')} |\n| ${keys.map(() => '---').join(' | ')} |\n`;
    
    data.forEach(item => {
      table += `| ${keys.map(key => item[key]).join(' | ')} |\n`;
    });
    
    return table;
  }
  
  // For simple objects
  let result = '';
  for (const [key, value] of Object.entries(data)) {
    result += `**${key}**: ${value}\n`;
  }
  
  return result;
}

// Farm advice knowledge base
function getGenericFarmingAdvice(input) {
  // Simple farming advice based on keywords
  if (input.includes("crop rotation")) {
    return "Crop rotation is essential for soil health. I recommend rotating between legumes, root crops, and leafy vegetables to maximize soil nutrients and minimize pest problems. For example, follow tomatoes with beans, then leafy greens.";
  } 
  if (input.includes("soil health") || input.includes("soil improvement")) {
    return "Healthy soil is the foundation of farming. I recommend regular soil testing, adding organic matter through compost, using cover crops during off-seasons, and maintaining proper pH (typically 6.0-7.0 for most crops).";
  }
  if (input.includes("pest")) {
    return "For sustainable pest management, try companion planting, introducing beneficial insects like ladybugs, using row covers for physical barriers, and applying neem oil as a natural pesticide. Prevention through healthy soil and crop rotation is also key.";
  }
  if (input.includes("irrigat") || input.includes("water")) {
    return "Efficient irrigation saves water and improves crop health. Consider drip irrigation for precise water application, water early in the morning to reduce evaporation, and use soil moisture sensors to prevent over-watering.";
  }
  if (input.includes("fertiliz")) {
    return "For balanced fertilization, consider slow-release organic options like compost, well-rotted manure, or cover crops. Apply nitrogen-rich amendments earlier in the growing season, and phosphorus/potassium-rich amendments when fruiting begins.";
  }
  if (input.includes("harvest")) {
    return "Proper harvest timing depends on the crop, but generally look for: firm texture, appropriate size, characteristic color, and ease of separation from the plant. Morning harvesting typically provides the best flavor and shelf life.";
  }
  if (input.includes("weed")) {
    return "For effective weed management, use mulch to suppress weeds, consider landscape fabric in pathways, hoe when weeds are small, practice regular cultivation, and consider cover crops during fallow periods.";
  }
  
  // Default response
  return "I can provide farming advice on topics like soil health, irrigation, pest management, crop rotation, fertilization, harvesting, and more. I can also show you fuel usage reports or crop storage data. What specific information do you need?";
}

// Helper to format text with Markdown
function formatMarkdown(text) {
  return text
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>')
    .replace(/\n/g, '<br/>')
    // Table formatting (basic support)
    .replace(/\|(.+)\|/g, '<table><tr><td>$1</td></tr></table>')
    .replace(/<td>\s*---\s*<\/td>/g, ''); // Remove separator rows
}

async function output(input) {
  try {
    console.log('Processing user input:', input);
    const reply = await getLLMResponse(input);
    
    // Check if audio is enabled before speaking
    if (audioEnabled && typeof textToSpeech === 'function') {
      console.log('Starting text-to-speech for response');
      await textToSpeech(reply);
    }
  } catch (error) {
    console.error('Error in output function:', error);
  }
}

// Make output function available globally
window.output = output;

document.addEventListener("DOMContentLoaded", () => {
  // Initialize with system prompt
  conversationHistory = [{
    role: "system",
    content: SYSTEM_PROMPT
  }];
  
  const welcome = "Hi, I'm Nelson Farms Demo LLM! 🌽 Ready to help with all your farming questions. You can ask about fuel usage, crop storage, or general farming advice.";
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

  // Audio toggle button
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
  
  // Send button functionality
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