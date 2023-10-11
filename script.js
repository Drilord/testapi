document.addEventListener('DOMContentLoaded', () => {
    const apiKey = 'GU9Zx0b21jFQaVWBjRk-d2InTTB0Q1dUSkROa2hQTkZKNWVtSmpjbWh1WlRaalZVWksn'; // Replace with your JWPlayer API key
    let apiUrl = 'https://api.jwplayer.com/v2/sites/MHI47Cs9/media/?q=created:[2023-01-01 TO 2023-04-31]&page_length=7000&page=1';
    
    const fetchDataButtonFirst4 = document.getElementById('fetchFirst4');
    const fetchDataButtonNext4 = document.getElementById('fetchNext4');
    const fetchDataButtonLast4 = document.getElementById('fetchLast4');
    const resultDiv = document.getElementById('result');
    
    fetchDataButtonFirst4.addEventListener('click', () => {
        fetchAndDisplayData(apiKey, apiUrl);
    });
    
    fetchDataButtonNext4.addEventListener('click', () => {
        apiUrl = 'https://api.jwplayer.com/v2/sites/MHI47Cs9/media/?q=created:[2023-05-01 TO 2023-08-31]&page_length=7000&page=1';
        fetchAndDisplayData(apiKey, apiUrl);
    });
    
    fetchDataButtonLast4.addEventListener('click', () => {
        apiUrl = 'https://api.jwplayer.com/v2/sites/MHI47Cs9/media/?q=created:[2023-09-01 TO 2023-12-31]&page_length=7000&page=1';
        fetchAndDisplayData(apiKey, apiUrl);
    });

    function fetchAndDisplayData(apiKey, apiUrl) {
        fetch(apiUrl, {
            headers: {
                Authorization: `Bearer ${apiKey}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Count the production types and display
                const mediaTypes = countMediaTypes(data);
                resultDiv.innerHTML = displayMediaTypes(mediaTypes);
            })
            .catch(error => {
                resultDiv.innerHTML = `API Request Error: ${error}`;
            });
    }

    function countMediaTypes(data) {
        const mediaTypeCounts = {};
        data.media.forEach(item => {
            const mediaType = item.media_type;
            if (mediaTypeCounts.hasOwnProperty(mediaType)) {
                mediaTypeCounts[mediaType]++;
            } else {
                mediaTypeCounts[mediaType] = 1;
            }
        });
        return mediaTypeCounts;
    }

    function displayMediaTypes(mediaTypes) {
        let output = 'Media Types and Counts:<br>';
        for (const type in mediaTypes) {
            output += `Type: ${type} Count: ${mediaTypes[type]}<br>`;
        }
        return output;
    }
});

