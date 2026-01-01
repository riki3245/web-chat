document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('loginScreen');
    const chatScreen = document.getElementById('chatScreen');
    const usernameInput = document.getElementById('usernameInput');
    const joinBtn = document.getElementById('joinBtn');
    const displayName = document.getElementById('displayName');

    const handleLogin = () => {
        const username = usernameInput.value.trim();
        if (username) {
            displayName.textContent = username.toUpperCase(); // Uppercase for box style
            
            // Just swap display classes
            loginScreen.classList.add('hidden');
            chatScreen.classList.remove('hidden');
            chatScreen.style.display = 'flex'; // Ensure flex is applied
        } else {
            // Shake effect logic could go here
            usernameInput.style.background = "#ffcccc";
            setTimeout(() => usernameInput.style.background = "#fff", 500);
        }
    };

    joinBtn.addEventListener('click', handleLogin);
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
});