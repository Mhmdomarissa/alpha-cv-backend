// Simple test script to verify API connectivity

const API_URL = 'http://13.61.179.54:8000';

async function testAPI() {
  console.log('🧪 Testing API connectivity...\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing /health endpoint...');
    const healthResponse = await fetch(`${API_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData.status);
    console.log('   Qdrant:', healthData.qdrant.status);
    console.log('   Version:', healthData.version);
    
    // Test 2: System status
    console.log('\n2. Testing /api/upload/system-status endpoint...');
    const statusResponse = await fetch(`${API_URL}/api/upload/system-status`);
    const statusData = await statusResponse.json();
    console.log('✅ System Status:', statusData.status);
    
    // Test 3: List CVs
    console.log('\n3. Testing /api/jobs/list-cvs endpoint...');
    const cvsResponse = await fetch(`${API_URL}/api/jobs/list-cvs`);
    const cvsData = await cvsResponse.json();
    console.log('✅ CVs in database:', cvsData.cvs.length);
    
    // Test 4: List Job Descriptions
    console.log('\n4. Testing /api/jobs/list-jds endpoint...');
    const jdsResponse = await fetch(`${API_URL}/api/jobs/list-jds`);
    const jdsData = await jdsResponse.json();
    console.log('✅ Job Descriptions in database:', jdsData.jds.length);
    
    console.log('\n✨ All API tests passed successfully!');
    
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
  }
}

testAPI();