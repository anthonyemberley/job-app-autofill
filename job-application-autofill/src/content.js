chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "fillForm") {
        fillForm(request.userData);
    }
});

function fillForm(userData) {
    console.log("userData:", userData)
    if (!userData) return;

    if (userData.personalInfo && userData.personalInfo.preferredName) {
        fillField('preferred', userData.personalInfo.preferredName);
    }

    // Fill first name
    fillField('firstName', userData.first_name);

    // Fill last name
    fillField('lastName', userData.last_name);

     // Fill full name or first name and last name
     if (userData.personalInfo && userData.personalInfo.firstName && userData.personalInfo.lastName) {
        const fullName = `${userData.personalInfo.firstName} ${userData.personalInfo.lastName}`;
        fillField('fullName', fullName);
        fillField('name', fullName);  // Added this line for generic name fields
        fillField('firstName', userData.personalInfo.firstName);
        fillField('lastName', userData.personalInfo.lastName);
    }

    if (userData.personalInfo && userData.personalInfo.country) {
        fillField('country', userData.personalInfo.country);
    }

    if (userData.personalInfo && userData.personalInfo.state && userData.personalInfo.city) {

        fillField('location', userData.personalInfo.state + ', ' + userData.personalInfo.city);
    }

    if(userData.authorizedToWork !== undefined) {
        const authorizedValue = typeof userData.authorizedToWork === 'boolean'
            ? (userData.authorizedToWork ? 'Yes' : 'No')
            : userData.authorizedToWork;
        fillField('authorized', authorizedValue);
    }

    if (userData.requireSponsorship !== undefined) {
        const requireSponsorshipValue = typeof userData.requireSponsorship === 'boolean'
            ? (userData.requireSponsorship ? 'Yes' : 'No')
            : userData.requireSponsorship;
        fillField('sponsorship', requireSponsorshipValue);
    }


    if (userData.personalInfo && userData.personalInfo.postalCode) {
        fillField('zip', userData.personalInfo.postalCode);
        fillField('postal', userData.personalInfo.postalCode);
    }

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

    // Handle special cases for demographics
    fillDemographicField('gender', userData.personalInfo.gender);
    fillDemographicField('race', userData.personalInfo.raceEthnicity);
    fillDemographicField('veteran', userData.personalInfo.veteranStatus);
    fillDemographicField('disability', userData.personalInfo.disabilityStatus);


    // Fill work authorization
    Object.keys(userData.workAuthorization || {}).forEach(key => {
        fillField(key, userData.workAuthorization[key]);
    });

    // Fill political exposure
    Object.keys(userData.politicalExposure || {}).forEach(key => {
        fillField(key, userData.politicalExposure[key]);
    });

    // Fill other fields
    fillField('heard', userData.howHeardAboutUs);

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

// ... existing code ...

function fillDemographicField(fieldName, value) {
    const mappings = {
        gender: {
            'male': ['Male', 'Man', 'He', 'Him'],
            'female': ['Female', 'Woman', 'She', 'Her'],
            'other': ['Other', 'Non-binary', 'Prefer to self-describe', 'They', 'Them'],
            'prefer_not_to_say': ['Decline to self-identify', 'Prefer not to say', 'I don\'t wish to answer', 'Not specified']
        },
        race: {
            'american_indian_alaska_native': ['American Indian or Alaska Native', 'Native American', 'Indigenous'],
            'asian': ['Asian', 'Asian (Not Hispanic or Latino)', 'Asian American'],
            'black_african_american': ['Black or African American', 'Black or African American (Not Hispanic or Latino)', 'African American'],
            'hispanic_latino': ['Hispanic or Latino', 'Latino', 'Latinx', 'Hispanic'],
            'native_hawaiian_pacific_islander': ['Native Hawaiian or Other Pacific Islander', 'Native Hawaiian or Other Pacific Islander (Not Hispanic or Latino)', 'Pacific Islander'],
            'white': ['White', 'White (Not Hispanic or Latino)', 'Caucasian'],
            'two_or_more_races': ['Two or More Races', 'Two or More Races (Not Hispanic or Latino)', 'Multiracial', 'Mixed Race'],
            'other': ['Other', 'Not Listed'],
            'prefer_not_to_say': ['Decline to self-identify', 'Prefer not to say', 'I don\'t wish to answer', 'Not specified']
        },
        veteran: {
            'veteran': ['I am a veteran', 'Veteran', 'Protected veteran', 'Yes, I am a veteran'],
            'non_veteran': ['I am not a veteran', 'Non-veteran', 'I am not a protected veteran', 'No, I am not a veteran'],
            'prefer_not_to_say': ['Decline to self-identify', 'Prefer not to say', 'I don\'t wish to answer', 'Not specified']
        },
        disability: {
            'disabled': ['Person with a disability', 'Yes, I have a disability (or previously had a disability)', 'Disabled'],
            'not_disabled': ['Person without a disability', 'No, I don\'t have a disability', 'Not disabled'],
            'prefer_not_to_say': ['Decline to self-identify', 'Prefer not to say', 'I don\'t wish to answer', 'Not specified']
        }
    };

    const possibleValues = mappings[fieldName][value] || [value];
    console.log(`Filling ${fieldName} with possible values:`, possibleValues);

    // Find the select element specifically for this demographic field
    const selectElement = findDemographicSelect(fieldName);

    if (selectElement) {
        setFieldValue(selectElement, possibleValues);
    } else {
        console.log(`No select element found for ${fieldName}`);
    }
}

function fillField(name, values) {
    if (!Array.isArray(values)) {
        values = [values];
    }
    if (values[0] === undefined || values[0] === null) return;

    let bestMatch = null;
    let bestScore = 0;

    // First, try to find by label
    const labels = document.querySelectorAll('label');
    labels.forEach(label => {
        const labelText = label.textContent.trim().toLowerCase();
        if (labelText.includes(name.toLowerCase())) {
            let score = 4;
            if (labelText === name.toLowerCase()) {
                score += 3; // Boost for exact match
            }

            // Find the associated input or select
            let input = label.querySelector('input, select, textarea');
            if (!input) {
                const forAttribute = label.getAttribute('for');
                if (forAttribute) {
                    input = document.getElementById(forAttribute);
                }
            }

            if (input && score > bestScore) {
                bestMatch = input;
                bestScore = score;
            }
        }
    });

    // If no match found by label, try other methods
    if (!bestMatch) {
        const elements = document.querySelectorAll('input, select, textarea');
        elements.forEach(element => {
            let score = 0;

            // Check various attributes
            const attributes = ['name', 'id', 'placeholder', 'aria-label', 'data-test', 'data-cy'];
            attributes.forEach(attr => {
                const attrValue = element.getAttribute(attr);
                if (attrValue && attrValue.toLowerCase().includes(name.toLowerCase())) {
                    score += 2;
                    if (attrValue.toLowerCase() === name.toLowerCase()) {
                        score += 3; // Boost for exact match
                    }
                }
            });

            // Check for nearby div or span with matching text
            const nearbyText = element.closest('div, li')?.textContent.toLowerCase() || '';
            if (nearbyText.includes(name.toLowerCase())) {
                score += 2;
            }

            if (score > bestScore) {
                bestScore = score;
                bestMatch = element;
            }
        });
    }

    if (bestMatch && bestScore > 2) {
        console.log(`Found best match for '${name}':`, bestMatch);
        setFieldValue(bestMatch, values);
    } else {
        console.log(`No match found for field '${name}'`);
    }
}

function findDemographicSelect(fieldName) {
    // First, try to find by specific EEO-related attributes
    let select = document.querySelector(`select[name="eeo[${fieldName}]"]`);
    if (select) return select;

    // If not found, look for a select element near a label with the field name
    const labels = Array.from(document.querySelectorAll('label'));
    for (const label of labels) {
        if (label.textContent.toLowerCase().includes(fieldName.toLowerCase())) {
            // Check if the label is associated with a select element
            const id = label.getAttribute('for');
            if (id) {
                select = document.getElementById(id);
                if (select && select.tagName === 'SELECT') return select;
            }
            
            // If not, look for a nearby select element
            select = label.closest('div').querySelector('select');
            if (select) return select;
        }
    }

    // If still not found, try a more general approach
    const allSelects = document.querySelectorAll('select');
    for (const select of allSelects) {
        const nearbyText = select.closest('div').textContent.toLowerCase();
        if (nearbyText.includes(fieldName.toLowerCase())) {
            return select;
        }
    }

    return null;
}

function setFieldValue(field, values) {
    console.log(`Setting field value for:`, field);
    console.log(`Values to set:`, values);

    if (field.tagName === 'SELECT') {
        const options = Array.from(field.options);
        console.log(`Select options:`, options.map(o => o.text));
        let bestMatch = null;
        let bestMatchScore = 0;

        options.forEach(option => {
            const optionText = option.text.toLowerCase();
            values.forEach(value => {
                const valueText = value.toLowerCase();
                if (optionText.includes(valueText) || valueText.includes(optionText)) {
                    const score = optionText.length - Math.abs(optionText.length - valueText.length);
                    if (score > bestMatchScore) {
                        bestMatch = option;
                        bestMatchScore = score;
                    }
                }
            });
        });

        if (bestMatch) {
            field.value = bestMatch.value;
            console.log(`Selected option '${bestMatch.text}' for field`);
        } else {
            console.log(`No matching option found for ${values.join(', ')} in select field`);
        }
    } else if (field.type === 'checkbox') {
        field.checked = Boolean(values[0]);
        console.log(`Set checkbox to:`, field.checked);
    } else {
        field.value = values[0];
        console.log(`Set field value to:`, field.value);
    }
    
    // Trigger events
    field.dispatchEvent(new Event('change', { bubbles: true }));
    field.dispatchEvent(new Event('input', { bubbles: true }));
}