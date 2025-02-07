<script src="https://cdn.jsdelivr.net/npm/web3@1.5.2/dist/web3.min.js"></script>
<script>
    const rpcURLs = [
        'https://eth-mainnet.g.alchemy.com/v2/Xg5XcX20hA-JpxxOTWUeeUx-ivoxA8L8',
        'https://base-mainnet.g.alchemy.com/v2/Kfa989JONX0bo4YoMQm7wqX-jTbQlTU5',
        'https://polygonzkevm-mainnet.g.alchemy.com/v2/JjslGVmPy5mwIVwBm2ZEShiSA6X8fOWS',
        'https://polygon-mainnet.g.alchemy.com/v2/ZSZhNBn3VM9K2ExZiNtWA8_DUNOlM6FC',
        'https://opt-mainnet.g.alchemy.com/v2/0H0RzuhuOcYKa3AjH0gG-VHkl04MlAJD',
        'https://arb-mainnet.g.alchemy.com/v2/eNpu2Lmbd2ac4hM88-CGnXfXTQzY1g7u',
        'https://starknet-mainnet.g.alchemy.com/v2/O7vVdhUqDLKUKsjR9L_YDgGrREBwKHPB',
        'https://opt-goerli.g.alchemy.com/v2/PK_Nc9RL8LiwcVGiVD1WTDWEJ2zCV6du',
        'https://eth-goerli.g.alchemy.com/v2/gtmRSsa4aXbTQ_wz6TujkqV0hsLIKjU9',
        'https://eth-sepolia.g.alchemy.com/v2/XkDgQAOxqYwHDkkf2ZlzK2qQ56tyQ5bw',
        'https://polygon-mumbai.g.alchemy.com/v2/DztDxW_DxAsV01by5sHKk8YfbasPZV_0',
        'https://arb-sepolia.g.alchemy.com/v2/KmYizOvoJpiVewB9HYCCdRSX8I__pD1q',
        'https://polygonzkevm-testnet.g.alchemy.com/v2/LiBxbRyE5DhHachTyxaWvwTDgOOdxpW9',
        'https://base-goerli.g.alchemy.com/v2/hiFW21zyXjqVR4VoHz5D5tiQ9PL_kYwH',
        'https://base-sepolia.g.alchemy.com/v2/KvDnNSU2lMFywUy7ydFL-_H5IDmJ2O7Y',
        'https://starknet-goerli.g.alchemy.com/v2/j5nnIygJo1Zn4rj1IKupnWCB500OJxbS',
        'https://solana-mainnet.g.alchemy.com/v2/iZUUP01U_1RNugcwldkjZyCaOoqPq7S8',
        'https://solana-devnet.g.alchemy.com/v2/krzgQeKi589S49Q9zgis-5P_BxGQMKH_',
        'https://astar-mainnet.g.alchemy.com/v2/aDbrnhcNeWcvNsDXaAgU3mub6bxqknts',
        'https://opt-sepolia.g.alchemy.com/v2/XWzTDokOxHhyye1mfZrmTKl3Rjy_JiH9'
    ];

    async function getInfoFromInput(input, rpcURLs, index = 0) {
        if (index >= rpcURLs.length) {
            throw new Error('None of the RPCs responded with the data.');
        }

        const web3 = new Web3(new Web3.providers.HttpProvider(rpcURLs[index]));

        try {
            if (/^0x([A-Fa-f0-9]{64})$/.test(input)) {
                return await getTransactionDetails(input, web3);
            } else if (/^0x([A-Fa-f0-9]{40})$/.test(input)) {
                return await getAddressInfo(input, web3);
            } else if (!isNaN(input)) {
                return await getBlockDetails(input, web3);
            } else {
                throw new Error('Input is not recognized as a valid transaction hash, address, or block number.');
            }
        } catch (error) {
            console.log(`RPC URL at index ${index} failed with error: ${error.message}`);
            return getInfoFromInput(input, rpcURLs, index + 1);
        }
    }

    async function getTransactionDetails(txHash, web3) {
        // ... (unchanged function) ...
        const transaction = await web3.eth.getTransaction(txHash);
        const receipt = await web3.eth.getTransactionReceipt(txHash);
        if (!transaction || !receipt) {
            throw new Error('Transaction not found');
        }
        const currentBlock = await web3.eth.getBlockNumber();
        const block = await web3.eth.getBlock(transaction.blockNumber);

        const gasLimit = transaction.gas;
        const gasUsed = receipt.gasUsed;
        const gasPrice = transaction.gasPrice;
        const gasFees = gasUsed * gasPrice;
        const gasBurnt = (gasLimit - gasUsed) * gasPrice;
        const transactionSavings = gasBurnt / gasFees;

        return {
            TransactionHash: transaction.hash,
            Status: receipt.status ? 'Success' : 'Fail',
            BlockNumber: transaction.blockNumber,
            Confirmations: currentBlock - transaction.blockNumber,
            Timestamp: block.timestamp ? new Date(block.timestamp * 1000).toISOString() : null,
            From: transaction.from,
            To: transaction.to,
            Value: web3.utils.fromWei(transaction.value, 'ether') + ' ETH',
            GasLimit: gasLimit,
            GasUsed: gasUsed,
            GasFees: web3.utils.fromWei(gasFees.toString(), 'ether') + ' ETH',
            GasPrice: web3.utils.fromWei(gasPrice, 'gwei') + ' Gwei',
            GasBurnt: web3.utils.fromWei(gasBurnt.toString(), 'ether') + ' ETH',
            TransactionSavings: transactionSavings.toFixed(2),
            TransactionFee: web3.utils.fromWei((receipt.gasUsed * transaction.gasPrice).toString(), 'ether') + ' ETH',
        };
    
    }

    async function getAddressInfo(address, web3) {
        const balance = await web3.eth.getBalance(address);
        const code = await web3.eth.getCode(address);
        const isContract = code !== '0x';

        return {
            Address: address,
            Balance: web3.utils.fromWei(balance, 'ether') + ' ETH',
            IsContract: isContract,
        };
    }

    async function getBlockDetails(blockNumber, web3) {
        const block = await web3.eth.getBlock(blockNumber);
        if (!block) {
            throw new Error('Block not found');
        }

        return {
            BlockNumber: block.number,
            Timestamp: block.timestamp ? new Date(block.timestamp * 1000).toISOString() : null,
            Transactions: block.transactions.length,
        };
    }
    

    function showLoadingSpinner() {
        const spinner = document.getElementById('loadingSpinner');
        spinner.style.display = 'block';
    }

    function hideLoadingSpinner() {
        const spinner = document.getElementById('loadingSpinner');
        spinner.style.display = 'none';
    }

    function searchTransaction() {
            showLoadingSpinner();

            const searchInput = document.getElementById('searchInput').value.trim();
            if (!searchInput) {
                alert('Please enter a valid search term.');
                hideLoadingSpinner();
                return;
            }
            

            const resultContainer = document.getElementById('transactionDetails');
            resultContainer.style.display = 'block';
            document.getElementById('guidanceText').style.display = 'none';

            getInfoFromInput(searchInput, rpcURLs)
                .then(info => {
                    displayTransactionDetails(info);
                })
                .catch(error => {
                    console.error('Error:', error.message);
                    resultContainer.innerHTML = '<p>Error retrieving information. Please try again.</p>';
                })
                .finally(() => {
                    hideLoadingSpinner();
                });
        }

        // Function to copy the text when clicking on it
    function showFullTextPopup(text) {
        const popup = document.createElement('div');
        popup.className = 'popup';
        const content = document.createElement('div');
        content.className = 'popup-content';
        content.textContent = text;
        popup.appendChild(content);
        document.body.appendChild(popup);

    // Close the popup when clicking outside of it
        popup.addEventListener('click', function (event) {
            if (!event.target.closest('.popup-content')) {
                document.body.removeChild(popup);
            }
        });
    }

    function displayTransactionDetails(info) {
        const resultContainer = document.getElementById('transactionDetails');
        resultContainer.innerHTML = '';

        const table = document.createElement('table');
        const tbody = document.createElement('tbody');

        for (const key in info) {
            const tr = document.createElement('tr');
            const th = document.createElement('th');
            const td = document.createElement('td');

            th.textContent = key;
            td.textContent = info[key];

            if (key === 'Status' && info[key] === 'Success') {
                td.style.color = '#4bf20f';
                td.style.fontWeight = 'bold';
           
            }

        
            if (td.cellIndex === 1) {
                td.style.cursor = 'pointer';
                td.addEventListener('click', function () {
                    if (window.innerWidth <= 768) {
                        showFullTextPopup(info[key]);
                    }
                });
            }

            tr.appendChild(th);
            tr.appendChild(td);

            tbody.appendChild(tr);
        }

        table.appendChild(tbody);
        resultContainer.appendChild(table);
    }
</script>
