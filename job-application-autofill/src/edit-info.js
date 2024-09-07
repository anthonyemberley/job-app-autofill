document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    document.getElementById('userInfoForm').addEventListener('submit', saveUserData);
    document.getElementById('addWorkExperience').addEventListener('click', () => addWorkExperienceField());
    document.getElementById('addEducation').addEventListener('click', () => addEducationField());
});

function loadUserData() {
    chrome.storage.local.get('accessToken', function(result) {
        if (result.accessToken) {
            console.log('Access token found:', result.accessToken);
            fetch('http://127.0.0.1:5000/get_user_data', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + result.accessToken,
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        console.log('No user data found on server. Using default empty data.');
                        return {};
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(userData => {
                console.log('Loaded user data from server:', JSON.stringify(userData, null, 2));
                populateFormFields(userData);
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
                alert('Failed to load user data from the server. Using local data if available.');
                loadLocalUserData();
            });
        } else {
            console.log('No access token found. Using local data if available.');
            loadLocalUserData();
        }
    });
}

function populateFormFields(userData) {
    // Ensure userData has all necessary properties, even if empty
    userData = {
        personalInfo: userData.personalInfo || {},
        workExperience: userData.workExperience || [],
        education: userData.education || [],
        skills: userData.skills || [],
        authorizedToWork: userData.authorizedToWork || false,
        requireSponsorship: userData.requireSponsorship || false,
        isPEP: userData.isPEP || false,
        relatedToPEP: userData.relatedToPEP || false,
        relatedToPayPalEmployee: userData.relatedToPayPalEmployee || false,
        howHeardAboutUs: userData.howHeardAboutUs || '',
        autoConsent: userData.autoConsent || false
    };

    // Populate form fields with userData
}


function loadLocalUserData() {
    chrome.storage.local.get('userData', function(result) {
        const userData = result.userData || {};
        console.log('Loading local user data:', JSON.stringify(userData, null, 2));
        populateFormFields(userData);
    });
}

function populateFormFields(userData) {
    // Load personal info
    const personalInfoFields = [
        'firstName', 'lastName', 'preferredName', 'email', 'phoneType', 'countryPhoneCode',
        'phone', 'address1', 'address2', 'city', 'state', 'postalCode', 'country',
        'gender', 'raceEthnicity', 'veteranStatus', 'disabilityStatus'
    ];

    personalInfoFields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            if (element.type === 'checkbox') {
                    element.checked = userData.personalInfo[field] || false;
                } else {
                    element.value = userData.personalInfo[field] || '';
                }
                console.log(`Loaded ${field}:`, element.type === 'checkbox' ? element.checked : element.value);
            } else {
                console.warn(`Element not found for field: ${field}`);
            }
        });

        // Load work experience
        const workExperienceContainer = document.getElementById('workExperienceContainer');
        if (workExperienceContainer) {
            console.log('Loading work experience:', userData.workExperience);
            workExperienceContainer.innerHTML = ''; // Clear existing fields
            (userData.workExperience || []).forEach(job => addWorkExperienceField(job));
        }

        // Load education
        const educationContainer = document.getElementById('educationContainer');
        if (educationContainer) {
            console.log('Loading education:', userData.education);
            educationContainer.innerHTML = ''; // Clear existing fields
            (userData.education || []).forEach(edu => addEducationField(edu));
        }

        // Load skills
        const skillsElement = document.getElementById('skills');
        if (skillsElement) {
            skillsElement.value = (userData.skills || []).join(', ');
            console.log('Loaded skills:', userData.skills);
        }

        // Load work authorization
        ['authorizedToWork', 'requireSponsorship'].forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.checked = userData[field] || false;
                console.log(`Loaded ${field}:`, element.checked);
            }
        });

        // Load political exposure
        ['isPEP', 'relatedToPEP', 'relatedToPayPalEmployee'].forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.checked = userData[field] || false;
                console.log(`Loaded ${field}:`, element.checked);
            }
        });

        // Load other info
        const howHeardElement = document.getElementById('howHeardAboutUs');
        if (howHeardElement) {
            howHeardElement.value = userData.howHeardAboutUs || '';
            console.log('Loaded howHeardAboutUs:', userData.howHeardAboutUs);
        }

        // Load auto-consent setting
        const autoConsentElement = document.getElementById('autoConsentCheckbox');
        if (autoConsentElement) {
            autoConsentElement.checked = userData.autoConsent || false;
            console.log('Loaded autoConsent:', userData.autoConsent);
        }

    console.log('User data loading complete');
}


function refreshToken() {
    return fetch('http://127.0.0.1:5000/refresh_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.access_token) {
            chrome.storage.local.set({accessToken: data.access_token});
            return data.access_token;
        }
        return null;
    })
    .catch(error => {
        console.error('Error refreshing token:', error);
        return null;
    });
}

function saveUserData(event) {
    event.preventDefault();
    
    const userData = {
        personalInfo: {},
        workExperience: getWorkExperience(),
        education: getEducation(),
        skills: [],
        howHeardAboutUs: '',
        autoConsent: false
    };

    // List of all possible personal info fields
    const personalInfoFields = [
        'firstName', 'lastName', 'preferredName', 'email', 'phoneType', 'countryPhoneCode',
        'phone', 'address1', 'address2', 'city', 'state', 'postalCode', 'country',
        'gender', 'raceEthnicity', 'veteranStatus', 'disabilityStatus', 'authorizedToWork',
        'requireSponsorship', 'isPEP', 'relatedToPEP', 'relatedToPayPalEmployee'
    ];

    // Populate personalInfo object
    personalInfoFields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            if (element.type === 'checkbox') {
                userData.personalInfo[field] = element.checked;
            } else {
                userData.personalInfo[field] = element.value;
            }
        }
    });

    // Handle skills
    const skillsElement = document.getElementById('skills');
    if (skillsElement) {
        userData.skills = skillsElement.value.split(',').map(skill => skill.trim());
    }

    // Handle howHeardAboutUs
    const howHeardElement = document.getElementById('howHeardAboutUs');
    if (howHeardElement) {
        userData.howHeardAboutUs = howHeardElement.value;
    }

    // Handle autoConsent
    const autoConsentElement = document.getElementById('autoConsentCheckbox');
    if (autoConsentElement) {
        userData.autoConsent = autoConsentElement.checked;
    }

    chrome.storage.local.get('accessToken', function(result) {
        if (result.accessToken) {
            fetch('http://127.0.0.1:5000/update_user_data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + result.accessToken
                },
                body: JSON.stringify(userData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Your information has been saved to your account.');
                } else {
                    alert('An error occurred while saving your information: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('error' + error);
            });
        } else {
            alert('You must be logged in to save your information.');
        }
    });
}
function getWorkExperience() {
    const workExperiences = [];
    const workExperienceFields = document.querySelectorAll('.work-experience');
    workExperienceFields.forEach(field => {
        workExperiences.push({
            jobTitle: field.querySelector('.job-title').value,
            company: field.querySelector('.company').value,
            startDate: field.querySelector('.start-date').value,
            endDate: field.querySelector('.end-date').value,
            location: field.querySelector('.location').value,
            description: field.querySelector('.description').value
        });
    });
    return workExperiences;
}

function getEducation() {
    const educations = [];
    const educationFields = document.querySelectorAll('.education');
    educationFields.forEach(field => {
        educations.push({
            school: field.querySelector('.school').value,
            degree: field.querySelector('.degree').value,
            graduationDate: field.querySelector('.graduation-date').value,
            gpa: field.querySelector('.gpa').value
        });
    });
    return educations;
}

function addWorkExperienceField(job = {}) {
    const container = document.getElementById('workExperienceContainer');
    const fieldSet = document.createElement('fieldset');
    fieldSet.className = 'work-experience';
    fieldSet.innerHTML = `
        <input type="text" class="job-title" placeholder="Job Title" value="${job.jobTitle || ''}">
        <input type="text" class="company" placeholder="Company" value="${job.company || ''}">
        <input type="date" class="start-date" placeholder="Start Date" value="${job.startDate || ''}">
        <input type="date" class="end-date" placeholder="End Date" value="${job.endDate || ''}">
        <input type="text" class="location" placeholder="Location" value="${job.location || ''}">
        <textarea class="description" placeholder="Role Description">${job.description || ''}</textarea>
        <button type="button" class="remove-work-experience">Remove</button>
    `;
    container.appendChild(fieldSet);
    fieldSet.querySelector('.remove-work-experience').addEventListener('click', () => fieldSet.remove());
}

function addEducationField(edu = {}) {
    const container = document.getElementById('educationContainer');
    const fieldSet = document.createElement('fieldset');
    fieldSet.className = 'education';
    fieldSet.innerHTML = `
        <input type="text" class="school" placeholder="School" value="${edu.school || ''}">
        <input type="text" class="degree" placeholder="Degree" value="${edu.degree || ''}">
        <input type="date" class="graduation-date" placeholder="Graduation Date" value="${edu.graduationDate || ''}">
        <input type="number" step="0.01" min="0" max="4" class="gpa" placeholder="Overall GPA" value="${edu.gpa || ''}">
        <button type="button" class="remove-education">Remove</button>
    `;
    container.appendChild(fieldSet);
    fieldSet.querySelector('.remove-education').addEventListener('click', () => fieldSet.remove());
}