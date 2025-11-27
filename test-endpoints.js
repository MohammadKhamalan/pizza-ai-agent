const axios = require('axios');

const API_KEY = 'sk_46dc549ec34ef6beafd210a91d748374e42c4e7119cdea3e';
const AGENT_ID = 'agent_3401kax31pw6ew6vw2jyw3f0smy6';

async function testEndpoints() {
  const endpoints = [
    `https://api.elevenlabs.io/v1/agents/${AGENT_ID}`,
    `https://api.elevenlabs.io/v1/voice/agents/${AGENT_ID}`,
    `https://api.elevenlabs.io/v1/conversational-ai/agents/${AGENT_ID}`,
    `https://api.elevenlabs.io/v1/agents`,
    `https://api.elevenlabs.io/v1/voice/agents`,
    `https://api.elevenlabs.io/v1/conversational-ai/agents`,
  ];

  const authMethods = [
    { 'xi-api-key': API_KEY },
    { 'Authorization': `Bearer ${API_KEY}` }
  ];

  console.log('Testing endpoints...\n');

  for (const endpoint of endpoints) {
    for (const authHeaders of authMethods) {
      try {
        const response = await axios.get(endpoint, {
          headers: {
            ...authHeaders,
            'Content-Type': 'application/json'
          }
        });
        console.log(`✅ SUCCESS: ${endpoint}`);
        console.log(`   Auth: ${Object.keys(authHeaders)[0]}`);
        console.log(`   Response:`, JSON.stringify(response.data, null, 2).substring(0, 200));
        console.log('');
      } catch (err) {
        // Only log if it's not 404 (to reduce noise)
        if (err.response?.status !== 404) {
          console.log(`⚠️  ${endpoint} (${Object.keys(authHeaders)[0]}): ${err.response?.status} - ${err.response?.data?.detail || err.message}`);
        }
      }
    }
  }
}

testEndpoints().catch(console.error);

