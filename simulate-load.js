async function sendBlock(id) {
  try {
    const response = await fetch('http://localhost:3000/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blockNumber: 100 + id,
        payload: `Consensus payload from node ${id}`,
        validatorId: `validator-node-${id % 3 === 0 ? 'beta' : 'alpha'}`,
        confirmations: 3 + id,
        previousHash: `0x3acd49029d${id}`,
        gasFee: 0.001 * id
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');
    
    console.log(`Block ${100 + id} committed:`, data.event.txHash);
  } catch (err) {
    console.error(`Error on block ${100 + id}:`, err.message);
  }
}

async function run() {
  console.log('Starting L3 consensus load simulation...');
  const promises = Array.from({ length: 5 }, (_, i) => sendBlock(i + 1));
  await Promise.all(promises);
  console.log('Simulation completed.');
}

run();
