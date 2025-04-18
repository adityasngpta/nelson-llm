// Farming‑related user prompts
const prompts = [
  ["crop rotation", "what is crop rotation", "rotate crops"],
  ["soil pH", "how to test soil pH", "optimal pH for vegetables"],
  ["irrigation", "drip irrigation", "sprinkler system tips"],
  ["pest control", "natural pest control", "how to manage aphids"],
  ["fertilizer", "organic fertilizer", "how much compost to add"],
  ["harvest", "when to harvest tomatoes", "harvest timing"],
  ["weather", "frost protection", "weather forecast for farms"]
];

// Sample static replies (in practice LLM will handle most)
const replies = [
  ["Crop rotation improves soil fertility and reduces pests."],
  ["Aim for a pH between 6.0 and 7.0 for most vegetables."],
  ["Drip irrigation minimizes water waste and delivers moisture directly to roots."],
  ["Introduce ladybugs or neem oil for eco‑friendly pest control."],
  ["Use well‑composted manure or balanced N-P-K blends sparingly."],
  ["Tomatoes are usually ready 60–85 days after planting."],
  ["Install frost cloths or use row covers for early‑season crops."]
];

const alternative = [
  "Can you clarify your farming question?",
  "I’m here to help with farm tips—what do you need?",
  "Tell me more about your crop or soil concerns."
];