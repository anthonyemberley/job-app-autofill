document.addEventListener('DOMContentLoaded', function() {
    loadPersonalInfo();
    document.getElementById('personalInfoForm').addEventListener('submit', savePersonalInfo);
});

function loadPersonalInfo() {
    chrome.storage.local.get('accessToken', function(result) {
        if (result.accessToken) {
            fetch('http://127.0.0.1:5000/get_info', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + result.accessToken
                }
            })
            .then(response => response.json())
            .then(data => {
                for (let key in data) {
                    const element = document.getElementById(key);
                    if (element) element.value = data[key];
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        } else {
            console.log('No access token found');
        }
    });
}

function savePersonalInfo(event) {
    event.preventDefault();
    const form = event.target;
    const personalInfo = {
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        email: form.email.value,
        phone: form.phone.value,
        address: form.address.value,
        city: form.city.value,
        state: form.state.value,
        zipCode: form.zipCode.value,
        country: form.country.value
    };

    chrome.storage.local.get('accessToken', function(result) {
        if (result.accessToken) {
            fetch('http://127.0.0.1:5000/update_info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + result.accessToken
                },
                body: JSON.stringify(personalInfo)
            })
            .then(response => response.json())
            .then(data => {
                alert('Personal information saved successfully!');
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        } else {
            console.log('No access token found');
        }
    });
}