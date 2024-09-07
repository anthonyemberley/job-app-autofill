chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "fillForm") {
        fillForm(request.userData);
    }
});

function fillForm(userData) {
    console.log('fillForm function called');
    console.log('userData:', userData);
    if (!userData) return;
    console.log(userData);

    // Fill first name
    fillField('firstName', userData.first_name);

    // Fill last name
    fillField('lastName', userData.last_name);

    // Fill email
    fillField('email', userData.email);
    const personalInfo = userData.personalInfo || {};

    // Fill personal info
    Object.keys(personalInfo).forEach(key => {
        fillField(key, personalInfo[key]);
    });

    // Fill work experience
    if (userData.workExperience && userData.workExperience.length > 0) {
        userData.workExperience.forEach((job, index) => {
            Object.keys(job).forEach(key => {
                fillField(`job${index+1}${key.charAt(0).toUpperCase() + key.slice(1)}`, job[key]);
            });
        });
    }

    // Fill education
    if (userData.education && userData.education.length > 0) {
        userData.education.forEach((edu, index) => {
            Object.keys(edu).forEach(key => {
                fillField(`edu${index+1}${key.charAt(0).toUpperCase() + key.slice(1)}`, edu[key]);
            });
        });
    }

    // Fill skills
    if (userData.skills && userData.skills.length > 0) {
        fillField('skills', userData.skills.join(', '));
    }

    // Fill demographics
    Object.keys(userData.demographics || {}).forEach(key => {
        fillField(key, userData.demographics[key]);
    });

    // Fill work authorization
    Object.keys(userData.workAuthorization || {}).forEach(key => {
        fillField(key, userData.workAuthorization[key]);
    });

    // Fill political exposure
    Object.keys(userData.politicalExposure || {}).forEach(key => {
        fillField(key, userData.politicalExposure[key]);
    });

    // Fill other fields
    fillField('howHeardAboutUs', userData.howHeardAboutUs);

        // Fill country
    fillField('country', personalInfo.country);

    // Handle consent checkboxes
    if (userData.autoConsent) {
        const consentCheckboxes = document.querySelectorAll('input[type="checkbox"][id$="Agreement"], input[type="checkbox"][id$="OptIn"]');
        consentCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        });
    }
}

function fillField(name, value) {
    if (value === undefined || value === null) return;

    const selectors = [
        `input[name="${name}"]`,
        `input[id="${name}"]`,
        `input[name*="${name}" i]`,
        `input[id*="${name}" i]`,
        `textarea[name="${name}"]`,
        `textarea[id="${name}"]`,
        `textarea[name*="${name}" i]`,
        `textarea[id*="${name}" i]`,
        `select[name="${name}"]`,
        `select[id="${name}"]`,
        `select[name*="${name}" i]`,
        `select[id*="${name}" i]`
    ];

    let field = null;
    for (let selector of selectors) {
        field = document.querySelector(selector);
        if (field) break;
    }

    if (field) {
        if (field.tagName === 'SELECT') {
            const option = Array.from(field.options).find(opt => 
                opt.text.toLowerCase().includes(String(value).toLowerCase())
            );
            if (option) field.value = option.value;
        } else if (field.type === 'checkbox') {
            field.checked = Boolean(value);
        } else {
            field.value = value;
        }
        field.dispatchEvent(new Event('change', { bubbles: true }));
        field.dispatchEvent(new Event('input', { bubbles: true }));
    }
}