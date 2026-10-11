async function testSecurity() {
    try {
        const response = await fetch('http://localhost:3001/api/blocks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: "Malicious Block",
                prevHash: "fake_hash_123456789"
            })
        });

        const result = await response.json();
        console.log("Status Code:", response.status);
        console.log("Response:", result);
    } catch (error) {
        console.error("Test failed:", error);
    }
}

testSecurity();
