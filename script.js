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
                    throw an Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Count the production types and display
                const productionTypes = countProductionTypes(data);
                resultDiv.innerHTML = displayProductionTypes(productionTypes);
            })
            .catch(error => {
                resultDiv.innerHTML = `API Request Error: ${error}`;
            });
    });

    function countProductionTypes(data) {
        const productionTypeCounts = {};
        data.forEach(item => {
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
            output += `${type}: ${productionTypes[type]}<br>`;
        }
        return output;
    }
});
