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
    if (!localStorage.getItem('NelsonFarmsWelcomeSeen')) {
        welcomeModal.style.display = 'flex';
    }
    closeButton.addEventListener('click', () => {
        welcomeModal.style.display = 'none';
        localStorage.setItem('NelsonFarmsWelcomeSeen', 'true');
    });
    getStartedBtn.addEventListener('click', () => {
        welcomeModal.style.display = 'none';
        localStorage.setItem('NelsonFarmsWelcomeSeen', 'true');
    });

    // 2. Quick Response Buttons - direct calls to window.output
    quickResponses.querySelectorAll('.quick-response-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const text = this.dataset.response;
            input.value = text;
            await window.output(text);
            input.value = '';
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

    // 4. Send Button - direct call to window.output
    sendBtn.addEventListener('click', async () => {
        if (input.value.trim()) {
            const text = input.value.trim();
            input.value = '';
            await window.output(text);
        }
    });

    // 5. Input keydown - direct call to window.output
    input.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
            const text = input.value.trim();
            input.value = '';
            await window.output(text);
        }
    });
});
