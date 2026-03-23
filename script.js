/* document.addEventListener('DOMContentLoaded', function () {
    const promptInput = document.getElementById('prompt');
    const generateBtn = document.getElementById('generateBtn');
    const statusDiv = document.getElementById('status');
    const statusText = statusDiv.querySelector('p');
    const videosDiv = document.getElementById('videos');
    const widescreenDiv = document.getElementById('widescreen');
    const verticalDiv = document.getElementById('vertical');

    let pollInterval;

    function pollForStatus(taskId) {
        pollInterval = setInterval(async () => {
            try {
                const response = await fetch(`/check-status?taskId=${taskId}`);
                const data = await response.json();

                statusText.textContent = data.status || 'Checking...';

                if (data.status === 'success') {
                    clearInterval(pollInterval);
                    displayVideo(data);
                } else if (data.status === 'failed') {
                    clearInterval(pollInterval);
                    handleFailure('Video generation failed');
                }
            } catch (error) {
                console.error('Status check failed:', error);
                statusText.textContent = 'Connection error, retrying...';
            }
        }, 10000); // Check every 10 seconds
    }

    function displayVideo(data) {
        statusDiv.classList.add('hidden');
        videosDiv.classList.remove('hidden');
        // Backend will send video tags or public ID - we'll handle both cases later
    }

    function handleFailure(message) {
        statusText.textContent = message;
    }

    async function startGeneration() {
        const prompt = promptInput.value.trim();
        if (!prompt) {
            alert('Please enter a prompt');
            return;
        }

        // Reset UI
        statusDiv.classList.remove('hidden');
        videosDiv.classList.add('hidden');
        statusText.textContent = 'Starting generation...';

        try {
            const response = await fetch('/start-generation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            const data = await response.json();

            if (response.ok) {
                pollForStatus(data.taskId);
            } else {
                handleFailure(data.error || 'Failed to start task');
            }
        } catch (error) {
            handleFailure('Failed to start task');
        }
    }

    generateBtn.addEventListener('click', startGeneration);
});
*/

document.addEventListener('DOMContentLoaded', function() {
    const promptInput = document.getElementById('prompt');
    const generateBtn = document.getElementById('generateBtn');
    const statusDiv = document.getElementById('status');
    const statusText = statusDiv.querySelector('p');
    const videosDiv = document.getElementById('videos');
    const widescreenDiv = document.getElementById('widescreen');
    const verticalDiv = document.getElementById('vertical');
    
    // Remove old polling variables - HF Spaces are synchronous
    // let pollInterval; 
    
    // NEW: Direct video display (no Cloudinary publicId needed)
    function displayVideoFromUrl(videoUrl) {
        statusDiv.classList.add('hidden');
        videosDiv.classList.remove('hidden');

        const videoTag = `
            <video controls style="width:100%; max-height:400px; border-radius:8px;">
                <source src="${videoUrl}" type="video/mp4">
                Your browser does not support video.
            </video>
        `;

        widescreenDiv.innerHTML = videoTag;
        verticalDiv.innerHTML = videoTag;
    }
    
    // FIXED: HF Spaces version (synchronous, no polling)
    async function startGeneration() {
        const prompt = promptInput.value.trim();
        if (!prompt) {
            alert('Please enter a prompt');
            return;
        }
        
        statusDiv.classList.remove('hidden');
        videosDiv.classList.add('hidden');
        statusText.textContent = 'Generating video...';
        
        try {
            const response = await fetch('/api/generate-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            
            const data = await response.json();
            
            if (response.ok && data.ok) {
                // HF Spaces return video immediately - no polling needed!
                displayVideoFromUrl(data.videoUrl);
            } else {
                statusText.textContent = data.error || 'Failed to generate video';
            }
        } catch (error) {
            console.error('Generation failed:', error);
            statusText.textContent = 'Connection error - try again';
        }
    }
    
    generateBtn.addEventListener('click', startGeneration);
});
