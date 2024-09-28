document.addEventListener('DOMContentLoaded', function () {
    const promptForm = document.getElementById('prompt-form');
    const promptInput = document.getElementById('prompt-input');
    const submitButton = promptForm.querySelector('button[type="submit"]');
    const stopButton = document.getElementById('stop-button');
    const uploadButton = document.querySelector('.btn-upload');
    const uploadedFilesContainer = document.getElementById('uploaded-files');
    const outputElement = document.getElementById('output');

    let isProcessing = false;
    let abortController = null;
    let uploadedFiles = []; // To store selected files

    // Create a file input dynamically
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.xls,.xlsx,.txt,.doc,.docx,.csv,.jpg,.jpeg,.png,.ppt,.pptx,.zip'; // Accepted file formats
    fileInput.multiple = true;
    fileInput.style.display = 'none'; // Hide the input field

    uploadButton.addEventListener('click', function () {
        fileInput.click(); // Trigger file input when upload button is clicked
    });

    // Function to check total file size and return a boolean
    function checkFileSize(files) {
        let totalSize = 0;
        for (let file of files) {
            totalSize += file.size;
        }
        return totalSize <= 15 * 1024 * 1024; // 15MB in bytes
    }

    // Handle file selection
    fileInput.addEventListener('change', function () {
        const files = fileInput.files;
        if (!files.length) return;

        // Validate total file size
        if (!checkFileSize(files)) {
            alert('Total file size exceeds 15MB. Please upload smaller files.');
            return;
        }

        // Clear previously uploaded files in the prompt area
        uploadedFilesContainer.innerHTML = '';
        uploadedFiles = Array.from(files); // Store uploaded files

        // Display uploaded files inline above the prompt bar
        for (let file of uploadedFiles) {
            const fileDiv = document.createElement('div');
            fileDiv.className = 'uploaded-file me-3 text-center';
            fileDiv.style.border = '2px solid #ceb153'; // Golden frame
            fileDiv.style.padding = '10px';
            fileDiv.style.borderRadius = '10px';
            fileDiv.style.width = '120px';  // Wider width for rectangular shape
            fileDiv.style.height = 'auto'; // Adjust height to auto based on content
            fileDiv.style.overflow = 'hidden'; // Hide long file names

            // Create file name element
            const fileName = document.createElement('p');
            fileName.textContent = file.name;
            fileName.style.fontSize = '12px';
            fileName.style.color = '#FFFFFF'; // White text
            fileName.style.margin = '5px 0';
            fileName.style.overflow = 'hidden';
            fileName.style.whiteSpace = 'nowrap';
            fileName.style.textOverflow = 'ellipsis';

            // Create file icon element
            const fileIcon = document.createElement('div');
            fileIcon.innerHTML = '<i class="fas fa-file-alt" style="color: #ceb153; font-size: 24px;"></i>'; // Default file icon
            fileIcon.style.marginBottom = '5px';

            fileDiv.appendChild(fileIcon);
            fileDiv.appendChild(fileName);
            uploadedFilesContainer.appendChild(fileDiv);
        }
    });

    // Form submission handling
    promptForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        if (isProcessing) {
            return;
        }

        abortController = new AbortController();
        const signal = abortController.signal;

        isProcessing = true;

        promptInput.disabled = true;
        submitButton.disabled = true;
        stopButton.disabled = false;

        const prompt = promptInput.value;

        const responseContainer = document.createElement('div');
        responseContainer.className = 'response-container d-flex flex-column align-items-start mb-5';
        outputElement.appendChild(responseContainer);

        // Add User Profile Icon and Name to their Message
        const userMessageHeader = document.createElement('div');
        userMessageHeader.className = 'd-flex align-items-center mb-2';
        const userImage = document.createElement('img');
        userImage.src = 'https://belto.site/static_resources/landing_page_images_v1/BELTO LOGO FINAL.png';
        userImage.className = 'profile-pic';
        const userName = document.createElement('span');
        userName.textContent = 'Emil';  // Changed from "Your Name Here" to "Emil"
        userName.className = 'ms-2';
        userName.style.color = '#FFFFFF';
        userName.style.fontWeight = 'bold';
        userMessageHeader.appendChild(userImage);
        userMessageHeader.appendChild(userName);
        responseContainer.appendChild(userMessageHeader);

        const promptTextContainer = document.createElement('div');
        promptTextContainer.className = 'ms-3';
        responseContainer.appendChild(promptTextContainer);

        const promptElement = document.createElement('div');
        promptElement.textContent = `${prompt}`;
        promptElement.style.fontWeight = 'bold';
        promptElement.style.color = '#ceb153';
        promptTextContainer.appendChild(promptElement);

        // Create a flexbox container to hold the uploaded files and align them horizontally
        const filesContainer = document.createElement('div');
        filesContainer.className = 'd-flex flex-wrap';  // Flexbox container for files
        filesContainer.style.marginTop = '10px';  // Space between prompt text and files

        // Display uploaded files within the prompt response
        for (let file of uploadedFiles) {
            const fileDiv = document.createElement('div');
            fileDiv.className = 'uploaded-file me-3 text-center';
            fileDiv.style.border = '2px solid #ceb153'; // Golden frame
            fileDiv.style.padding = '10px';
            fileDiv.style.borderRadius = '10px';
            fileDiv.style.width = '120px'; // Wider width for rectangular shape
            fileDiv.style.height = 'auto'; // Adjust height to auto based on content
            fileDiv.style.overflow = 'hidden'; // Hide long file names

            // Create file name element
            const fileName = document.createElement('p');
            fileName.textContent = file.name;
            fileName.style.fontSize = '12px';
            fileName.style.color = '#FFFFFF'; // White text
            fileName.style.margin = '5px 0';
            fileName.style.overflow = 'hidden';
            fileName.style.whiteSpace = 'nowrap';
            fileName.style.textOverflow = 'ellipsis';

            // Create file icon element
            const fileIcon = document.createElement('div');
            fileIcon.innerHTML = '<i class="fas fa-file-alt" style="color: #ceb153; font-size: 24px;"></i>'; // Default file icon
            fileIcon.style.marginBottom = '5px';

            fileDiv.appendChild(fileIcon);
            fileDiv.appendChild(fileName);
            filesContainer.appendChild(fileDiv);  // Add each file to the flexbox container
        }

        // Append the file container to the prompt response
        promptTextContainer.appendChild(filesContainer);

        const divider = document.createElement('hr');
        divider.style.border = '1px solid #ceb153';
        divider.style.display = 'inline-block'; // Ensure the divider only takes up as much space as the content
        divider.style.marginTop = '10px'; // Add space above the divider

        promptTextContainer.appendChild(divider);

        const scrollToBottom = () => {
            outputElement.scrollTop = outputElement.scrollHeight;
        };

        try {
            const response = await fetch("/completion", {
                method: 'POST',
                body: JSON.stringify({ prompt, n_predict: 512, stream: true }),
                headers: { 'Content-Type': 'application/json' },
                signal: signal
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");

            const responseText = document.createElement('div');
            responseText.className = 'ai-response mb-4';
            promptTextContainer.appendChild(responseText);

            // Add Bot Profile Icon and Name to Bot's Response BEFORE the text
            const botMessageHeader = document.createElement('div');
            botMessageHeader.className = 'd-flex align-items-center mb-2';
            const botImage = document.createElement('img');
            botImage.src = 'https://belto.site/static_resources/landing_page_images_v1/BELTO LOGO FINAL.png';
            botImage.className = 'profile-pic';
            const botName = document.createElement('span');
            botName.textContent = 'BELTO';
            botName.className = 'ms-2';
            botName.style.color = '#ceb153';
            botName.style.fontWeight = 'bold';

            // Append bot header (logo and name) first, then response text
            responseContainer.appendChild(botMessageHeader);
            botMessageHeader.appendChild(botImage);
            botMessageHeader.appendChild(botName);

            responseContainer.appendChild(responseText); // Bot response text appended after profile info

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                responseText.textContent += chunk;

                // Adjust the divider width to match the response text
                divider.style.width = `${responseText.offsetWidth}px`; // Match the width of the generated response
                scrollToBottom();
            }

        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Request aborted');
            } else {
                console.error('Error:', error);
            }
        } finally {
            // Clear uploaded files preview after submission
            uploadedFilesContainer.innerHTML = '';
            uploadedFiles = [];

            promptInput.disabled = false;
            submitButton.disabled = false;
            stopButton.disabled = true;
            isProcessing = false;
            abortController = null;

            promptInput.value = '';
        }
    });

    stopButton.addEventListener('click', function () {
        if (abortController) {
            abortController.abort();
        }
    });
});
