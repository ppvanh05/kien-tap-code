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
    if (!loginRes.ok) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }

    console.log('Login success!');
    const token = loginData.data.token;
    console.log('Token:', token);

    console.log('Fetching profile...');
    const profileRes = await fetch(`${API_BASE}/customer/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const profileData = await profileRes.json();
    console.log('Profile:', profileData);

    console.log('Fetching history...');
    const historyRes = await fetch(`${API_BASE}/customer/tra-cuu-ve/history`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const historyData = await historyRes.json();
    console.log('History count:', historyData.data?.length);
    console.log('First history item:', historyData.data?.[0]);

  } catch (error: any) {
    console.error('API Error:', error.message);
  }
}

main();
