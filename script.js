document.addEventListener('DOMContentLoaded', () => {
    const apiKey = 'API_KEY'; // Replace with your JWPlayer API key
    const resultDiv = document.getElementById('result');

    function fetchData(apiUrl) {
        fetch(apiUrl, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                const productionTypes = countProductionTypes(data.media);
                resultDiv.innerHTML = displayProductionTypes(productionTypes);
            })
            .catch((error) => {
                resultDiv.innerHTML = `API Request Error: ${error}`;
            });
    }

    document.getElementById('fetchFirst4').addEventListener('click', () => {
        const apiUrl =
            'https://api.jwplayer.com/v2/sites/MHI47Cs9/media/?q=created:[2021-01-01 TO 2021-04-31]&page_length=10000&page=1';
        fetchData(apiUrl);
    });

    document.getElementById('fetchNext4').addEventListener('click', () => {
        const apiUrl =
            'https://api.jwplayer.com/v2/sites/MHI47Cs9/media/?q=created:[2021-05-01 TO 2021-08-31]&page_length=10000&page=1';
        fetchData(apiUrl);
    });

    document.getElementById('fetchLast4').addEventListener('click', () => {
        const apiUrl =
            'https://api.jwplayer.com/v2/sites/MHI47Cs9/media/?q=created:[2021-09-01 TO 2021-12-31]&page_length=10000&page=1';
        fetchData(apiUrl);
    });

    function countProductionTypes(data) {
        const productionTypeCounts = {};
        data.forEach((item) => {
            const customParams = item.metadata.custom_params;
            if (customParams && customParams.productionType) {
                const productionType = customParams.productionType;
                if (productionTypeCounts.hasOwnProperty(productionType)) {
                    productionTypeCounts[productionType]++;
                } else {
                    productionTypeCounts[productionType] = 1;
                }
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

