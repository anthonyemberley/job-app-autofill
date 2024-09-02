document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('signupForm').addEventListener('submit', signup);
});

function signup(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // In a real application, you would send this data to a server
    // For this example, we'll just store it locally
    chrome.storage.local.set({
        userData: {
            email: email,
            loggedIn: true
        }
    }, function() {
        alert('Signup successful! Please fill in your information.');
        window.location.href = 'edit-info.html';
    });
}