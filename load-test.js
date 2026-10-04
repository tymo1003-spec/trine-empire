const http = require('http');

const TOTAL_REQUESTS = 20;
const txHashToTest = "0xloadtest123456";

let completed = 0;
let results = { 201: 0, 200: 0, 409: 0, 500: 0 };

console.log(`🚀 Починаємо тест: відправляємо ${TOTAL_REQUESTS} паралельних запитів для одного txHash...`);

for (let i = 0; i < TOTAL_REQUESTS; i++) {
  const data = JSON.stringify({
    blockNumber: 105,
    txHash: txHashToTest,
    payload: `Concurrent Load Test Payload #${i}`,
    confirmations: 20,
    previousHash: "0x0000000000000000",
    validatorId: `validator-node-${i % 3 + 1}`,
    gasFee: 0.001
  });

  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/events',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-validator-key': 'trine-alpha-secret-key',
      'Content-Length': data.length
    }
  }, (res) => {
    results[res.statusCode] = (results[res.statusCode] || 0) + 1;
    res.on('data', () => {}); // споживаємо потік
    res.on('end', () => {
      completed++;
      if (completed === TOTAL_REQUESTS) {
        console.log('\n📊 Результати навантажувального тесту:');
        console.log(JSON.stringify(results, null, 2));
        console.log('✅ Тест завершено!');
      }
    });
  });

  req.on('error', (err) => {
    results[500]++;
    completed++;
  });

  req.write(data);
  req.end();
}
