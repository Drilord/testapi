document.addEventListener('DOMContentLoaded', () => {
    const apiKey = 'GU9Zx0b21jFQaVWBjRk-d2InTTB0Q1dUSkROa2hQTkZKNWVtSmpjbWh1WlRaalZVWksn'; // Replace with your JWPlayer API key
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

    document.getElementById('21mayaug').addEventListener('click', () => {
        const apiUrl =
            'https://api.jwplayer.com/v2/sites/MHI47Cs9/media/?q=created:[2021-05-01 TO 2021-08-31]&page_length=10000&page=1';
        fetchData(apiUrl);
    });

    document.getElementById('21sepdec').addEventListener('click', () => {
        const apiUrl =
            'https://api.jwplayer.com/v2/sites/MHI47Cs9/media/?q=created:[2021-09-01 TO 2021-12-31]&page_length=10000&page=1';
        fetchData(apiUrl);
    });

    document.getElementById('22janapr').addEventListener('click', () => {
        const apiUrl =
            'https://api.jwplayer.com/v2/sites/MHI47Cs9/media/?q=created:[2022-01-01 TO 2022-04-31]&page_length=10000&page=1';
        fetchData(apiUrl);
    });
    
    document.getElementById('22mayaug').addEventListener('click', () => {
        const apiUrl =
            'https://api.jwplayer.com/v2/sites/MHI47Cs9/media/?q=created:[2022-05-01 TO 2022-08-31]&page_length=10000&page=1';
        fetchData(apiUrl);
    });

    document.getElementById('22sepdec').addEventListener('click', () => {
        const apiUrl =
            'https://api.jwplayer.com/v2/sites/MHI47Cs9/media/?q=created:[2022-09-01 TO 2022-12-31]&page_length=10000&page=1';
        fetchData(apiUrl);
    });

    document.getElementById('23janapr').addEventListener('click', () => {
        const apiUrl =
            'https://api.jwplayer.com/v2/sites/MHI47Cs9/media/?q=created:[2023-01-01 TO 2023-04-31]&page_length=10000&page=1';
        fetchData(apiUrl);
    });
    
    document.getElementById('23mayaug').addEventListener('click', () => {
        const apiUrl =
            'https://api.jwplayer.com/v2/sites/MHI47Cs9/media/?q=created:[2023-05-01 TO 2023-08-31]&page_length=10000&page=1';
        fetchData(apiUrl);
    });

    document.getElementById('23sepdec').addEventListener('click', () => {
        const apiUrl =
            'https://api.jwplayer.com/v2/sites/MHI47Cs9/media/?q=created:[2023-09-01 TO 2023-12-31]&page_length=10000&page=1';
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

