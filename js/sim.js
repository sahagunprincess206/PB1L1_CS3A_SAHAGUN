/*
1. Constructor - Classes (Block, Blockchain)
2. functions (Blockchain) => create of GB
                              getLatestBlock
                              addBlock
                              isValidChain
3. constants
4. HTML elements
*/

class Block {
    constructor(index, timestamp, data, previousHash ='') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    calculateHash(){ //Function
        return CryptoJS.SHA256(
            this.index + this.previousHash + this.timestamp + this.data + this.nonce).toString();
    }
}

class Blockchain {
    constructor(){
        this.chain = [this.createGenesisBlock()];
    }

    createGenesisBlock() {
        return new Block(0, new Date().toLocaleString(), 'Genesis Block', '0');
    }

    getLatestBlock(){
        return this.chain[this.chain.length -1];
    }

    addBlock(data){
        const newBlock = new Block(
            this.chain.length, new Date().toLocaleString(),
            data, this.getLatestBlock().hash
        );
        this.chain.push(newBlock);
    }

    isValidChain(){
        for(let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];
            if (currentBlock.hash !== currentBlock.calculateHash())
                return false;
            if (currentBlock.previousHash !== previousBlock.hash)
                return false;
        }
        return true;
    }
}

const blockchain = new Blockchain();
const chainEl = document.getElementById('chain');
const statusEl = document.getElementById('status');
const addBlockBtn = document.getElementById('addBlockBtn');
const validateBtn = document.getElementById('validateBtn');
const blockDataInput = document.getElementById('blockData');


function renderChain () {
    chainEl.innerHTML ='';
    blockchain.chain.forEach((block, index)  => {
        const blockIsValid = index === 0 ||
            (block.hash === block.calculateHash() &&
            block.previousHash === blockchain.chain[index-1].hash
        );

        const blockDiv = document.createElement('div');
        blockDiv.className = `block ${blockIsValid ? 'valid' : 'invalid'}`;
        blockDiv.innerHTML = `
            <div class="block-header">
                <h3>Block #${block.index}</h3>
                <span class="badge ${blockIsValid ? 'valid' : 'invalid'}">
                    ${blockIsValid ? 'Valid' : 'Invalid'}</span>
            </div>
            <div class="field"><span class="label">Timestamp</span><div class="value">${block.timestamp}</div></div>
            <div class="field"><span class="label">Data</span><div class="value" contenteditable="true" data-index="${index}" data-field="data">${block.data}</div></div>
            <div class="field"><span class="label">Previous Hash</span><div class="value">${block.previousHash}</div></div>
            <div class="field"><span class="label">Hash</span><div class="value">${block.hash}</div></div>
        `;
        chainEl.appendChild(blockDiv);
    });

    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
        el.addEventListener('input', (e) =>{
            const idx = Number(e.target.dataset.index);
            blockchain.chain[idx].data = e.target.innerText.trim();
            blockchain.chain[idx].hash = blockchain.chain[idx].calculateHash();
            for (let i = idx + 1; i < blockchain.chain.length; i++) {
                blockchain.chain[i].previousHash = blockchain.chain[i - 1].hash;
                blockchain.chain[i].hash = blockchain.chain[i].calculateHash();
            }
            updateStatus();
            renderChain();
        });
    });
}

function updateStatus() {
    const valid = blockchain.isValidChain();
    statusEl.textContent = valid ? 'Chain is valid' : 'Chain is invalid';
    statusEl.className = `status ${valid ? 'valid' : 'invalid'}`;
}

addBlockBtn.addEventListener('click', () => {
    const data = blockDataInput.value.trim() || 'Empty Data';
    blockchain.addBlock(data);
    blockDataInput.value = '';
    renderChain();
    updateStatus();
});

validateBtn.addEventListener('click', updateStatus);

blockDataInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addBlockBtn.click();
});

renderChain();
updateStatus();
