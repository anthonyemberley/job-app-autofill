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
      fillField('first name', userData.first_name);
      fillField('first_name', userData.first_name);
  
      // Fill last name
      fillField('lastName', userData.last_name);
      fillField('last name', userData.last_name);
      fillField('last_name', userData.last_name);
  
      // Fill full name or first name and last name
      if (userData.personalInfo && userData.personalInfo.firstName && userData.personalInfo.lastName) {
          const fullName = `${userData.personalInfo.firstName} ${userData.personalInfo.lastName}`;
          fillField('fullName', fullName);
          fillField('full name', fullName);
          fillField('firstName', userData.personalInfo.firstName);
          fillField('first name', userData.personalInfo.firstName);
          fillField('first_name', userData.personalInfo.firstName);
          fillField('lastName', userData.personalInfo.lastName);
          fillField('last name', userData.personalInfo.lastName);
          fillField('last_name', userData.personalInfo.lastName);
      }

    if (userData.personalInfo && userData.personalInfo.country) {
        fillField('country', userData.personalInfo.country);
    }

    // Fill LinkedIn profile
    if (userData.personalInfo && userData.personalInfo.linkedinUrl) {
        fillField('linkedin', userData.personalInfo.linkedinUrl);
        fillField('linkedIn', userData.personalInfo.linkedinUrl);
        fillField('linkedin profile', userData.personalInfo.linkedinUrl);
        fillField('linkedIn profile', userData.personalInfo.linkedinUrl);
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

    if (userData.personalInfo) {
        const { address1, address2, city, state, zip } = userData.personalInfo;
        const fullAddress = [address1, address2, city, state, zip].filter(Boolean).join(', ');
        
        // Try to fill a generic "Street Address" field
        fillField('street address', address1);
        
        // If that doesn't work, try filling individual address fields
        if (!document.querySelector('input[value="' + address1 + '"]')) {
            fillField('address', fullAddress);
            fillField('address1', address1);
            fillField('address2', address2);
        }
        
        // Fill city, state, and zip separately
        fillField('city', city);
        fillField('state', state);
        fillField('zip', zip);
    }

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

// ... existing code ...

function findDemographicSelect(fieldName) {
    // First, try to find by specific EEO-related attributes
    let field = document.querySelector(`select[name="eeo[${fieldName}]"]`);
    if (field) return field;

    // Look for a select element or custom component near a label with the field name
    const labels = Array.from(document.querySelectorAll('label'));
    for (const label of labels) {
        if (label.textContent.toLowerCase().includes(fieldName.toLowerCase())) {
            const id = label.getAttribute('for');
            if (id) {
                field = document.getElementById(id);
                if (field) return field;
            }
            
            // Look for nearby select or custom component
            const container = label.closest('div');
            field = container.querySelector('select') || 
                    container.querySelector('div[role="combobox"]') ||
                    container.querySelector('input[type="text"][aria-autocomplete="list"]');
            if (field) return field;
        }
    }

    // If still not found, try a more general approach
    const allFields = document.querySelectorAll('select, div[role="combobox"], input[type="text"][aria-autocomplete="list"]');
    for (const field of allFields) {
        const nearbyText = field.closest('div').textContent.toLowerCase();
        if (nearbyText.includes(fieldName.toLowerCase())) {
            return field;
        }
    }

    return null;
}

function setFieldValue(field, values) {
    console.log(`Setting field value for:`, field);
    console.log(`Values to set:`, values);

    if (field.tagName === 'SELECT') {
        setSelectValue(field, values);
    } else if (field.tagName === 'DIV' && field.getAttribute('role') === 'combobox') {
        setCustomSelectValue(field, values);
    } else if (field.tagName === 'INPUT' && field.getAttribute('aria-autocomplete') === 'list') {
        setAutocompleteInputValue(field, values);
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

function setSelectValue(select, values) {
    const options = Array.from(select.options);
    console.log(`Select options:`, options.map(o => o.text));
    const bestMatch = findBestMatch(options, values, o => o.text);

    if (bestMatch) {
        select.value = bestMatch.value;
        console.log(`Selected option '${bestMatch.text}' for select`);
    } else {
        console.log(`No matching option found for ${values.join(', ')} in select`);
    }
}

function setCustomSelectValue(customSelect, values) {
    const input = customSelect.querySelector('input');
    const listboxId = customSelect.getAttribute('aria-controls');
    const listbox = document.getElementById(listboxId);
    const options = listbox ? Array.from(listbox.querySelectorAll('[role="option"]')) : [];
    
    console.log(`Custom select options:`, options.map(o => o.textContent));
    const bestMatch = findBestMatch(options, values, o => o.textContent);

    if (bestMatch && input) {
        input.value = bestMatch.textContent.trim();
        input.dispatchEvent(new Event('input', { bubbles: true }));
        bestMatch.click(); // This should select the option
        console.log(`Selected option '${bestMatch.textContent}' for custom select`);
    } else {
        console.log(`No matching option found for ${values.join(', ')} in custom select`);
    }
}

function setAutocompleteInputValue(input, values) {
    input.value = values[0];
    input.dispatchEvent(new Event('input', { bubbles: true }));
    console.log(`Set autocomplete input value to:`, input.value);
    // Note: This might need additional logic to handle the autocomplete dropdown
}

function findBestMatch(options, values, textExtractor) {
    let bestMatch = null;
    let bestMatchScore = 0;

    options.forEach(option => {
        const optionText = textExtractor(option).trim().toLowerCase();
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

    return bestMatch;
}

// ... rest of the existing code ...