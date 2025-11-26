const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('.')); 

const ELEVENLABS_API_KEY = 'sk_46dc549ec34ef6beafd210a91d748374e42c4e7119cdea3e';
const agentId = 'agent_3401kax31pw6ew6vw2jyw3f0smy6';

const activeCalls = new Map();

app.post('/start-call', async (req, res) => {
  try {
    console.log('Starting call to agent:', agentId);
    
    let response;
    let lastError;
    
    const endpoints = [
      `https://api.elevenlabs.io/v1/agents/${agentId}/calls`,
      `https://api.elevenlabs.io/v1/voice/agents/${agentId}/calls`,
      `https://api.elevenlabs.io/v1/conversational-ai/agents/${agentId}/calls`,
      `https://api.elevenlabs.io/v1/agents/${agentId}/start`,
      `https://api.elevenlabs.io/v1/voice/agents/${agentId}/start`,
      `https://api.elevenlabs.io/v1/agents/${agentId}/call`,
      `https://api.elevenlabs.io/v1/voice/agents/${agentId}/call`
    ];
    
    const authMethods = [
      { 'xi-api-key': ELEVENLABS_API_KEY },
      { 'Authorization': `Bearer ${ELEVENLABS_API_KEY}` },
      { 'Authorization': `Bearer ${ELEVENLABS_API_KEY}`, 'xi-api-key': ELEVENLABS_API_KEY }
    ];
    
    for (const endpoint of endpoints) {
      for (const authHeaders of authMethods) {
        try {
          console.log(`Trying endpoint: ${endpoint} with auth: ${Object.keys(authHeaders)[0]}`);
          response = await axios.post(
            endpoint,
            {
            
            },
            {
              headers: {
                ...authHeaders,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              timeout: 30000 
            }
          );
          console.log(`Success with endpoint: ${endpoint}`);
          break;
        } catch (err) {
          lastError = err;
          console.log(`Failed with endpoint ${endpoint} (${Object.keys(authHeaders)[0]}):`, err.response?.status, err.response?.data?.detail || err.message);
        }
      }
      if (response) break; 
    }
    
    if (!response) {
      throw lastError || new Error('All API endpoints failed');
    }
    
    const callId = response.data.call_id || 'call_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    activeCalls.set(callId, {
      startedAt: new Date(),
      status: 'active',
      agentId: agentId,
      callData: response.data,
      websocketUrl: response.data.websocket_url || null
    });
    
    console.log('Call started successfully. Call ID:', callId);
    console.log('Call data:', JSON.stringify(response.data, null, 2));
    
    res.json({ 
      success: true, 
      message: 'Call started successfully',
      callId: callId,
      data: response.data,
      websocketUrl: response.data.websocket_url || null
    });
    
  } catch (error) {
    console.error('Start call error details:');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Message:', error.message);
    
    let errorMessage = 'Failed to start call';
    
    if (error.response?.status === 401) {
      errorMessage = 'Invalid API key - check your ElevenLabs API key';
    } else if (error.response?.status === 404) {
      errorMessage = 'Agent not found - check your agent ID';
    } else if (error.response?.status === 400) {
      errorMessage = error.response.data?.detail || 'Bad request - check agent configuration';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Cannot connect to ElevenLabs API - check internet connection';
    } else if (error.response?.data) {
      errorMessage = error.response.data.detail || error.response.data.message || JSON.stringify(error.response.data);
    }
    
    res.status(500).json({ 
      success: false,
      error: errorMessage,
      details: error.response?.data || error.message 
    });
  }
});

app.post('/end-call', async (req, res) => {
  try {
    const { callId } = req.body;
    
    console.log('Ending call:', callId);
    
    const callData = activeCalls.get(callId);
    
    if (callData && callData.callData?.call_id) {
      try {
        const response = await axios.post(
          `https://api.elevenlabs.io/v1/voice/agents/${agentId}/calls/${callData.callData.call_id}/end`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${ELEVENLABS_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('Call ended via API:', response.data);
      } catch (endError) {
        console.warn('Could not end call via API:', endError.response?.data || endError.message);
      }
    }
    
    if (callId) {
      activeCalls.delete(callId);
    }
    
    res.json({ 
      success: true, 
      message: 'Call ended successfully'
    });
    
  } catch (error) {
    console.error('End call error:', error.response?.data || error.message);
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to end call',
      details: error.response?.data || error.message 
    });
  }
});

app.get('/call-status/:callId', (req, res) => {
  const callData = activeCalls.get(req.params.callId);
  if (callData) {
    res.json({ 
      active: true, 
      ...callData 
    });
  } else {
    res.json({ 
      active: false,
      message: 'Call not found or ended'
    });
  }
});

app.get('/active-calls', (req, res) => {
  const calls = Array.from(activeCalls.entries()).map(([id, data]) => ({
    callId: id,
    ...data
  }));
  res.json({ activeCalls: calls });
});

app.get('/my-agents', async (req, res) => {
  try {
    console.log('Fetching agents from ElevenLabs...');
    
    const endpoints = [
      'https://api.elevenlabs.io/v1/agents',
      'https://api.elevenlabs.io/v1/voice/agents',
      'https://api.elevenlabs.io/v1/conversational-ai/agents',
      'https://api.elevenlabs.io/v1/conversationalai/agents'
    ];
    
    const authMethods = [
      { 'xi-api-key': ELEVENLABS_API_KEY },
      { 'Authorization': `Bearer ${ELEVENLABS_API_KEY}` }
    ];
    
    let response;
    let lastError;
    
    for (const endpoint of endpoints) {
      for (const authHeaders of authMethods) {
        try {
          console.log(`Trying endpoint: ${endpoint} with auth: ${Object.keys(authHeaders)[0]}`);
          response = await axios.get(
            endpoint,
            {
              headers: {
                ...authHeaders,
                'Content-Type': 'application/json'
              }
            }
          );
          console.log(`Success with endpoint: ${endpoint}`);
          break; 
        } catch (err) {
          lastError = err;
          console.log(`Failed: ${endpoint} (${Object.keys(authHeaders)[0]}) - ${err.response?.status} ${err.response?.data?.detail || err.message}`);
        }
      }
      if (response) break; 
    }
    
    if (!response) {
      throw lastError || new Error('All endpoints failed');
    }
    
    console.log('Agents found:', response.data.agents?.length || 0);
    
    res.json({
      success: true,
      agents: response.data.agents?.map(agent => ({
        id: agent.agent_id,
        name: agent.name,
        description: agent.description,
        status: agent.status,
        voice: agent.voice
      })) || []
    });
    
  } catch (error) {
    console.error('Error fetching agents:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agents',
      details: error.response?.data || error.message
    });
  }
});

app.get('/agent/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    console.log('Fetching agent details for:', agentId);
    
    const endpoints = [
      `https://api.elevenlabs.io/v1/agents/${agentId}`,
      `https://api.elevenlabs.io/v1/voice/agents/${agentId}`,
      `https://api.elevenlabs.io/v1/conversational-ai/agents/${agentId}`,
      `https://api.elevenlabs.io/v1/conversationalai/agents/${agentId}`
    ];
    
    const authMethods = [
      { 'xi-api-key': ELEVENLABS_API_KEY },
      { 'Authorization': `Bearer ${ELEVENLABS_API_KEY}` }
    ];
    
    let response;
    let lastError;
    
    for (const endpoint of endpoints) {
      for (const authHeaders of authMethods) {
        try {
          console.log(`Trying endpoint: ${endpoint} with auth: ${Object.keys(authHeaders)[0]}`);
          response = await axios.get(
            endpoint,
            {
              headers: {
                ...authHeaders,
                'Content-Type': 'application/json'
              }
            }
          );
          console.log(`Success with endpoint: ${endpoint}`);
          break;
        } catch (err) {
          lastError = err;
          console.log(`Failed: ${endpoint} (${Object.keys(authHeaders)[0]}) - ${err.response?.status} ${err.response?.data?.detail || err.message}`);
        }
      }
      if (response) break;
    }
    
    if (!response) {
      throw lastError || new Error('All endpoints failed');
    }
    
    res.json({
      success: true,
      agent: response.data
    });
    
  } catch (error) {
    console.error('Error fetching agent:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent',
      details: error.response?.data || error.message
    });
  }
});

app.get('/verify-api-key', async (req, res) => {
  try {
    let response;
    try {
      response = await axios.get(
        'https://api.elevenlabs.io/v1/user',
        {
          headers: {
            'Authorization': `Bearer ${ELEVENLABS_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (err) {
      response = await axios.get(
        'https://api.elevenlabs.io/v1/user',
        {
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    res.json({
      success: true,
      user: {
        subscription: response.data.subscription,
        is_new_user: response.data.is_new_user
      }
    });
    
  } catch (error) {
    console.error('API key verification failed:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Invalid API key',
      details: error.response?.data || error.message
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    activeCalls: activeCalls.size
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Endpoints:`);
  console.log(`- Health: http://localhost:${PORT}/health`);
  console.log(`- Verify API Key: http://localhost:${PORT}/verify-api-key`);
  console.log(`- List Agents: http://localhost:${PORT}/my-agents`);
  console.log(`- Start Call: http://localhost:${PORT}/start-call (POST)`);
  console.log(`- End Call: http://localhost:${PORT}/end-call (POST)`);
});