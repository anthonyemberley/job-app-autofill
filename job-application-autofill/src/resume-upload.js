document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('resumeUpload').addEventListener('change', handleResumeUpload);
});

function handleResumeUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            // Here you would typically send this content to a server for parsing
            // For now, we'll just store it locally
            chrome.storage.local.set({resumeContent: content}, function() {
                alert('Resume uploaded successfully!');
                // Here you would typically call a function to parse the resume and fill in the form fields
                parseResumeAndFillForm(content);
            });
        };
        reader.readAsText(file);
    }
}

function parseResumeAndFillForm(content) {
    // This is a placeholder function. In a real implementation, you would use
    // natural language processing or other techniques to extract information from the resume.
    // For now, we'll just do some basic string matching as an example.

    chrome.storage.local.get('userData', function(result) {
        let userData = result.userData || {};

        if (content.includes('@')) {
            const emailMatch = content.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
            if (emailMatch) {
                userData.personalInfo = userData.personalInfo || {};
                userData.personalInfo.email = emailMatch[0];
            }
        }

        // Add more parsing logic here...

        chrome.storage.local.set({userData: userData}, function() {
            alert('Resume parsed and form partially filled. Please review and complete any missing information.');
        });
    });
}