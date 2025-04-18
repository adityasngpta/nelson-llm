# Nelson Farms Demo LLM — Farming Advisor Chatbot

A friendly and knowledgeable farming advisor powered by the Nelson Farms custom LLM Agent.

## Features

- 🌱 Expert guidance on crop planning, soil health, irrigation, and pest management
- 🛢️ Fuel usage reporting and crop storage insights via farm API
- 🔊 Text-to-speech capability for accessibility
- 🎨 Clean, responsive interface for all devices

## Technical Details

- Frontend: Vanilla JavaScript, HTML5, CSS3
- LLM: Custom Nelson Farms Agent (`/responses` endpoint)
- API: Farm data from Nelson Farms (`/login`, `/fuel_reporting`, `/crop_storage`)
- Speech: Web Speech API

## Setup

1. Clone this repository
2. In `index.js`, update the following constants with your farm API credentials:
   - `NELSON_FARMS_USERNAME`
   - `NELSON_FARMS_PASSWORD`
3. Serve the files using a local web server (e.g., `npx http-server` or similar)
4. Open `index.html` in your browser

## Usage

- Ask about farming topics such as soil health or irrigation.
- Query "fuel report" or "crop storage" to fetch live farm data.
- Use voice input or quick response buttons for faster interaction.

## License

MIT License — Feel free to use and modify for your own projects!
