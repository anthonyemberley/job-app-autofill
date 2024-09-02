chrome.runtime.onInstalled.addListener(function() {
    console.log('Extension installed');
    initializeDefaultData();
});

function initializeDefaultData() {
    const defaultData = {
        personalInfo: {
            firstName: '',
            lastName: '',
            preferredName: '',
            email: '',
            phone: '',
            phoneCountryCode: '',
            phoneDeviceType: '',
            address: '',
            addressLine2: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
        },
        workExperience: [],
        education: [],
        skills: [],
        demographics: {
            gender: '',
            raceEthnicity: '',
            veteranStatus: '',
            disabilityStatus: ''
        },
        workAuthorization: {
            authorizedToWork: false,
            requireSponsorship: false
        },
        politicalExposure: {
            isPEP: false,
            relatedToPEP: false,
            relatedToPayPalEmployee: false
        },
        resumeData: null,
        howHeardAboutUs: ''
    };

    chrome.storage.local.set({userData: defaultData}, function() {
        console.log('Default user data initialized');
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "parseResume") {
        // This would typically be handled by a server-side API
        // For demonstration, we'll just log the request
        console.log("Resume parsing requested", request.resumeData);
        sendResponse({success: true, message: "Resume parsing initiated"});
    }
});