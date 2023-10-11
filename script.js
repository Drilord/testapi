document.addEventListener('DOMContentLoaded', () => {
    const apiKey = 'GU9Zx0b21jFQaVWBjRk-d2InTTB0Q1dUSkROa2hQTkZKNWVtSmpjbWh1WlRaalZVWksn'; // Replace with your JWPlayer API key
    const apiUrl = 'https://api.jwplayer.com/v2/sites/MHI47Cs9/media/?q=created:[2023-01-01 TO 2023-04-31]&page_length=500&page=1';
    
    const fetchDataButton = document.getElementById('fetchData');
    const resultDiv = document.getElementById('result');
    
    fetchDataButton.addEventListener('click', () => {
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
                // Handle the API response data
                resultDiv.innerHTML = JSON.stringify(data, null, 2);
            })
            .catch(error => {
                resultDiv.innerHTML = `API Request Error: ${error}`;
            });
    });
});
