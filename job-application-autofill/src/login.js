document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginForm').addEventListener('submit', login);
});

function login(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // In a real application, you would verify this with a server
    // For this example, we'll just check if the email exists in local storage
    chrome.storage.local.get('userData', function(result) {
        if (result.userData && result.userData.email === email) {
            result.userData.loggedIn = true;
            chrome.storage.local.set({userData: result.userData}, function() {
                alert('Login successful!');
                window.close();
            });
        } else {
            alert('Login failed. Please check your credentials.');
        }
    });
}