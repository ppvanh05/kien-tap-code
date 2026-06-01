async function main() {
  const API_BASE = 'http://localhost:3000';
  try {
    console.log('Logging in...');
    const loginRes = await fetch(`${API_BASE}/customer/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneOrEmail: '0358794564',
        MatKhau: '000000'
      })
    });
    
    const loginData: any = await loginRes.json();
    const token = loginData.data.token;
    console.log('Token:', token);

    console.log('--- Fetching from /customer/tra-cuu-ve/history ---');
    const res1 = await fetch(`${API_BASE}/customer/tra-cuu-ve/history`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data1 = await res1.json();
    console.log('Results:', JSON.stringify(data1.data, null, 2));

    console.log('--- Fetching from /customer/profile/history ---');
    const res2 = await fetch(`${API_BASE}/customer/profile/history`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data2 = await res2.json();
    console.log('Results:', JSON.stringify(data2.data, null, 2));

  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

main();
