// Features.js - Additional functionality for He@lio

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const welcomeModal = document.getElementById('welcomeModal');
    const closeButton = document.querySelector('.close-button');
    const getStartedBtn = document.getElementById('getStartedBtn');
    const input = document.getElementById('input');
    const voiceInputBtn = document.getElementById('voiceInputBtn');
    const sendBtn = document.getElementById('sendBtn');
    const quickResponses = document.getElementById('quickResponses');

    // 1. Welcome Modal
    if (!localStorage.getItem('He@lioWelcomeSeen')) {
        welcomeModal.style.display = 'flex';
    }
    closeButton.addEventListener('click', () => {
        welcomeModal.style.display = 'none';
        localStorage.setItem('He@lioWelcomeSeen', 'true');
    });
    getStartedBtn.addEventListener('click', () => {
        welcomeModal.style.display = 'none';
        localStorage.setItem('He@lioWelcomeSeen', 'true');
    });

    // 2. Quick Response Buttons
    quickResponses.querySelectorAll('.quick-response-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const resp = this.dataset.response;
            input.value = '';
            // directly call the LLM handler
            await output(resp);
        });
    });

    // 3. Voice Input
    voiceInputBtn.addEventListener('click', () => {
        if (typeof startSpeechRecognition === 'function') {
            startSpeechRecognition();
            voiceInputBtn.classList.add('recording');
            document.addEventListener('speechRecognitionEnd', () => {
                voiceInputBtn.classList.remove('recording');
            }, { once: true });
        } else {
            alert('Speech recognition not available.');
        }
    });

    // 4. Send Button
    sendBtn.addEventListener('click', async () => {
        const text = input.value.trim();
        if (text) {
            input.value = '';
            await output(text);
        }
    });
});
