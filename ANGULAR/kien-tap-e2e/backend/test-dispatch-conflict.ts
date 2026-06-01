async function testConflict() {
  const API_BASE = 'http://localhost:3000';
  try {
    console.log('Logging in admin...');
    const loginRes = await fetch(`${API_BASE}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'dp1@txpbus.vn',
        matKhau: 'Dieuphoi@123'
      })
    });
    
    const loginData: any = await loginRes.json();
    if (!loginRes.ok) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }

    console.log('Login success!', JSON.stringify(loginData));
    const token = loginData.accessToken || loginData.token || loginData.data?.token;
    console.log('Token:', token);

    console.log('Creating duplicate schedule...');
    const schedulePayload = {
      routeName: 'Đập Đá - Bến xe miền Đông',
      driverName: 'Lý Mẫn Hạo',
      vehiclePlate: '77B-09842',
      departureDate: '2026-06-10',
      departureTime: '01:00'
    };

    const res = await fetch(`${API_BASE}/dieu-hanh/lich-trinh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(schedulePayload)
    });

    console.log('Response status:', res.status);
    const resBody = await res.json();
    console.log('Response body:', JSON.stringify(resBody, null, 2));

  } catch (error: any) {
    console.error('Error testing conflict:', error.message);
  }
}

testConflict();
