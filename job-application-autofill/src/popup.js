document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('signupButton').addEventListener('click', showSignupForm);
    document.getElementById('loginButton').addEventListener('click', showLoginForm);
    document.getElementById('submitSignup').addEventListener('click', signup);
    document.getElementById('submitLogin').addEventListener('click', login);
    document.getElementById('fillFormButton').addEventListener('click', fillForm);
    document.getElementById('editInfoButton').addEventListener('click', editInfo);
    document.getElementById('uploadResumeButton').addEventListener('click', uploadResume);
    document.getElementById('logoutButton').addEventListener('click', logout);

    checkLoginStatus();
});

function showSignupForm() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
}

function showLoginForm() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

// ... existing code ...

// Add this function
function testServerConnection() {
    fetch('http://127.0.0.1:5000/test')
        .then(response => response.json())
        .then(data => console.log('Server test response:', data))
        .catch(error => console.error('Server test error:', error));
}

// Call this function when the popup loads
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    testServerConnection();
});



function signup(event) {
    event.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    console.log('Attempting to sign up with:', { email, password });

    fetch('http://127.0.0.1:5000/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => {
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        return response.text();
    })
    .then(text => {
        console.log('Response text:', text);
        if (text) {
            return JSON.parse(text);
        }
        throw new Error('Empty response');
    })
    .then(data => {
        console.log('Parsed data:', data);
        if (data.message === "User created successfully") {
            alert('Signup successful! Please log in.');
            showLoginForm();
        } else {
            alert(data.message || 'An error occurred during signup');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('An error occurred during signup: ' + error.message);
    });
}

// ... existing code ...


function login(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid credentials');
            }
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.access_token) {
            chrome.storage.local.set({ accessToken: data.access_token }, function() {
                fetchUserData(data.access_token);
            });
        } else {
            throw new Error('No access token received');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Login failed: ' + error.message);
    });
}

// ... existing code ...

function fetchUserData(accessToken) {
    fetch('http://127.0.0.1:5000/get_user_data', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    })
    .then(response => response.json())
    .then(userData => {
        chrome.storage.local.set({ userData: userData }, function() {
            showMainContainer();
        });
    })
    .catch((error) => {
        console.error('Error fetching user data:', error);
        showMainContainer();
    });
}
    


function checkLoginStatus() {
    chrome.storage.local.get('accessToken', function(result) {
        if (result.accessToken) {
            showMainContainer();
        }
    });
}

function showMainContainer() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('mainContainer').style.display = 'block';
}

function logout() {
    chrome.storage.local.remove('accessToken', function() {
        document.getElementById('authContainer').style.display = 'block';
        document.getElementById('mainContainer').style.display = 'none';
        showLoginForm();
    });
}

// Keep the existing fillForm, editInfo, and uploadResume functions

function fillForm() {
    console.log('Fill form function called');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "fillForm"}, function(response) {
            console.log('Form fill request sent');
        });
    });
}

function editInfo() {
    console.log('Edit info function called');
    // Implement edit info logic here
}

function uploadResume() {
    console.log('Upload resume function called');
    // Implement resume upload logic here
}

function editInfo() {
    const editInfoUrl = chrome.runtime.getURL('src/edit-info.html');
    console.log('Edit Info URL:', editInfoUrl);
    chrome.tabs.create({url: editInfoUrl});
}