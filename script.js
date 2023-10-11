document.addEventListener('DOMContentLoaded', () => {
    const apiKey = 'GU9Zx0b21jFQaVWBjRk-d2InTTB0Q1dUSkROa2hQTkZKNWVtSmpjbWh1WlRaalZVWksn'; // Replace with your JWPlayer API key
    const resultDiv = document.getElementById('result');
    
    function fetchData(apiUrl) {
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
                const productionTypes = countProductionTypes(data.media.metadata);
                resultDiv.innerHTML = displayProductionTypes(productionTypes);
            })
            .catch(error => {
                resultDiv.innerHTML = `API Request Error: ${error}`;
            });
    }

    document.getElementById('fetchFirst4').addEventListener('click', () => {
        const apiUrl = 'https://api.jwplayer.com/v2/sites/MHI47Cs9/media/?q=created:[2023-01-01 TO 2023-04-31]&page_length=3000&page=1';
        fetchData(apiUrl);
    });

    document.getElementById('fetchNext4').addEventListener('click', () => {
        const apiUrl = 'https://api.jwplayer.com/v2/sites/MHI47Cs9/media/?q=created:[2023-05-01 TO 2023-08-31]&page_length=3000&page=1';
        fetchData(apiUrl);
    });

    document.getElementById('fetchLast4').addEventListener('click', () => {
        const apiUrl = 'https://api.jwplayer.com/v2/sites/MHI47Cs9/media/?q=created:[2023-09-01 TO 2023-12-31]&page_length=3000&page=1';
        fetchData(apiUrl);
    });

    function countProductionTypes(data) {
        const productionTypeCounts = {};
        data.media.metadata.custom_params.forEach(item => {
            const productionType = item.productionType;
            if (productionTypeCounts.hasOwnProperty(productionType)) {
                productionTypeCounts[productionType]++;
            } else {
                productionTypeCounts[productionType] = 1;
            }
        });
        return productionTypeCounts;
    }

    function displayProductionTypes(productionTypes) {
        let output = 'Production Types and Counts:<br>';
        for (const type in productionTypes) {
            output += `type: ${type} count: ${productionTypes[type]}<br>`;
        }
        return output;
    }
});

