const Wallet = require('./wallet');

async function sendTestTransaction() {
    // 1. Створюємо новий гаманець (генерується пара ключів)
    const wallet = new Wallet();
    console.log("Wallet created successfully!");

    // 2. Дані транзакції
    const txData = { sender: "Alice", receiver: "Bob", amount: 50 };

    // 3. Підписуємо дані приватним ключем гаманця
    const signature = wallet.sign(txData);
    console.log("Transaction signed.");

    // 4. Формуємо запит на сервер
    const payload = {
        data: txData,
        signature: signature,
        publicKey: wallet.publicKey
    };

    try {
        const response = await fetch('http://127.0.0.1:3001/api/transaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log("Server response:", result);
    } catch (error) {
        console.error("Error sending transaction:", error.message);
    }
}

sendTestTransaction();
