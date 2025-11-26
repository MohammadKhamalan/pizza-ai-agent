// This script will make a test call and show you exactly what endpoints are being tried
const axios = require('axios');

const API_KEY = 'sk_46dc549ec34ef6beafd210a91d748374e42c4e7119cdea3e';
const AGENT_ID = 'agent_3401kax31pw6ew6vw2jyw3f0smy6';

console.log('='.repeat(60));
console.log('Testing ElevenLabs API Endpoints');
console.log('='.repeat(60));
console.log(`Agent ID: ${AGENT_ID}`);
console.log(`API Key: ${API_KEY.substring(0, 20)}...`);
console.log('='.repeat(60));
console.log('');

const endpoints = [
  `https://api.elevenlabs.io/v1/agents/${AGENT_ID}/calls`,
  `https://api.elevenlabs.io/v1/voice/agents/${AGENT_ID}/calls`,
  `https://api.elevenlabs.io/v1/conversational-ai/agents/${AGENT_ID}/calls`,
  `https://api.elevenlabs.io/v1/agents/${AGENT_ID}/start`,
  `https://api.elevenlabs.io/v1/voice/agents/${AGENT_ID}/start`,
];

const authMethods = [
  { name: 'xi-api-key', headers: { 'xi-api-key': API_KEY } },
  { name: 'Bearer Token', headers: { 'Authorization': `Bearer ${API_KEY}` } }
];

async function testEndpoints() {
  let successFound = false;

  for (const endpoint of endpoints) {
    for (const auth of authMethods) {
      try {
        console.log(`Testing: ${endpoint}`);
        console.log(`  Auth: ${auth.name}`);
        
        const response = await axios.post(
        endpoint,
        {},
        {
          headers: {
            ...auth.headers,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      );
      
      console.log(`  ✅ SUCCESS! Status: ${response.status}`);
      console.log(`  Response:`, JSON.stringify(response.data, null, 2));
      console.log('');
      successFound = true;
      break;
    } catch (err) {
      const status = err.response?.status || 'NO RESPONSE';
      const detail = err.response?.data?.detail || err.response?.data?.message || err.message;
      console.log(`  ❌ Failed: ${status} - ${detail}`);
      console.log('');
    }
  }
  if (successFound) break;
}

if (!successFound) {
  console.log('='.repeat(60));
  console.log('❌ ALL ENDPOINTS FAILED');
  console.log('='.repeat(60));
  console.log('');
  console.log('Possible issues:');
  console.log('1. Agent ID is incorrect - check your ElevenLabs dashboard');
  console.log('2. API endpoints are different - check ElevenLabs documentation');
  console.log('3. Agent might need to be activated/enabled in dashboard');
  console.log('4. Your API key might not have access to this agent');
  console.log('');
  console.log('Next steps:');
  console.log('- Verify the agent ID in your ElevenLabs dashboard');
  console.log('- Check your n8n workflow to see what endpoint it uses');
  console.log('- Look at ElevenLabs Conversational AI documentation');
}

testEndpoints().catch(console.error);

