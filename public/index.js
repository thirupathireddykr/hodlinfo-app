document.addEventListener('DOMContentLoaded', () => {
    const cryptoSelect = document.getElementById('crypto-select');
    const cryptoData = document.getElementById('crypto-data');

    // Fetch data from the backend
    fetch('http://localhost:3000/data')
        .then(response => response.json())
        .then(data => {
            populateDropdown(data);
            cryptoSelect.addEventListener('change', () => filterData(data));
        })
        .catch(error => console.error('Error fetching data:', error));

    function populateDropdown(data) {
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = data[key].name.toUpperCase();
                cryptoSelect.appendChild(option);
            }
        }
    }

    function filterData(data) {
        const selectedCrypto = cryptoSelect.value;
        if (selectedCrypto) {
            const cryptoInfo = data[selectedCrypto];
            displayData(cryptoInfo);
        } else {
            cryptoData.innerHTML = '';
        }
    }

    function displayData(data) {
        cryptoData.innerHTML = `
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Last Price:</strong> ${data.last}</p>
            <p><strong>Buy Price:</strong> ${data.buy}</p>
            <p><strong>Volume:</strong> ${data.volume}</p>
            <p><strong>Sell price:</strong> ${data.sell}</p>
            <p><strong>Base Unit:</strong> ${data.base_unit}</p>
        `;
    }
});
