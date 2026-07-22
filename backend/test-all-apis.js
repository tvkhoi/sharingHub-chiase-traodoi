const BASE_URL = 'http://localhost:5000/api/v1';

async function runTests() {
  console.log('🧪 Starting End-to-End API Integration Test Matrix (DSD Compliant)...\n');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(` ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(` ❌ FAIL: ${name} ->`, err.message);
      failed++;
    }
  }

  let adminToken = '';
  let userToken = '';
  let memberUserId = '';
  let categoryId = '';
  let uploadedImageUrl = '';
  let assetId = '';
  let proposalId = '';
  let transactionId = '';

  // 1. Auth Module
  await test('POST /auth/login (Admin)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tai_khoan: 'admin@assetsharing.com', mat_khau: 'Admin@123456' }),
    });
    const data = await res.json();
    if (res.status !== 200 || !data.access_token) throw new Error(JSON.stringify(data));
    adminToken = data.access_token;
  });

  const testUserEmail = `testuser_${Date.now()}@gmail.com`;
  await test('POST /auth/register (New User)', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUserEmail,
        mat_khau: 'Password123',
        xac_nhan_mat_khau: 'Password123',
        ho_ten: 'Tester Pro',
        so_dien_thoai: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.user) throw new Error(JSON.stringify(data));
    memberUserId = data.user.nguoi_dung_id;
  });

  await test('POST /auth/login (New User)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tai_khoan: testUserEmail, mat_khau: 'Password123' }),
    });
    const data = await res.json();
    if (res.status !== 200 || !data.access_token) throw new Error(JSON.stringify(data));
    userToken = data.access_token;
  });

  await test('GET /auth/me (Logged-in User Profile)', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const data = await res.json();
    if (res.status !== 200 || !data.nguoi_dung_id) throw new Error(JSON.stringify(data));
  });

  // 2. Categories & Users
  await test('GET /categories', async () => {
    const res = await fetch(`${BASE_URL}/categories`);
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data) || data.length === 0) throw new Error(JSON.stringify(data));
    categoryId = data[0].danh_muc_id;
  });

  await test('GET /users/profile/:id', async () => {
    const res = await fetch(`${BASE_URL}/users/profile/${memberUserId}`);
    const data = await res.json();
    if (res.status !== 200 || !data.ho_so) throw new Error(JSON.stringify(data));
  });

  await test('PUT /users/profile', async () => {
    const res = await fetch(`${BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ ho_ten: 'Tester Pro Updated', dia_chi: 'Quận 1, TP.HCM' }),
    });
    const data = await res.json();
    if (res.status !== 200 || !data.ho_so || data.ho_so.ho_ten !== 'Tester Pro Updated') throw new Error(JSON.stringify(data));
  });

  // 3. Upload & Assets Module (Option 2: 2-Step File Upload Pattern)
  await test('POST /upload/single (Upload Image via Standalone Upload API)', async () => {
    const formData = new FormData();
    const blob = new Blob(['fake image data'], { type: 'image/png' });
    formData.append('file', blob, 'sample.png');

    const res = await fetch(`${BASE_URL}/upload/single`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formData,
    });
    const data = await res.json();
    if (res.status !== 201 || !data.url) throw new Error(JSON.stringify(data));
    uploadedImageUrl = data.url;
  });

  await test('POST /assets (Create Asset with Image URL Array)', async () => {
    const res = await fetch(`${BASE_URL}/assets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        danh_muc_id: categoryId,
        ten_tai_san: 'Sách Lập Trình Node.js',
        mo_ta_hien_trang: 'Sách mới 99%, chưa viết vẽ gì',
        so_luong_tong: 5,
        hinh_thuc_chia_se: 'CHO_TANG',
        dia_diem: '123 Nguyễn Thị Minh Khai, Q3',
        hinh_anh: [uploadedImageUrl],
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.bai_dang_id) throw new Error(JSON.stringify(data));
    assetId = data.bai_dang_id;
  });

  await test('GET /assets (Public Feed)', async () => {
    const res = await fetch(`${BASE_URL}/assets`);
    const data = await res.json();
    if (res.status !== 200 || !data.items) throw new Error(JSON.stringify(data));
  });

  await test('GET /assets/:id (Asset Detail)', async () => {
    const res = await fetch(`${BASE_URL}/assets/${assetId}`);
    const data = await res.json();
    if (res.status !== 200 || !data.ten_tai_san) throw new Error(JSON.stringify(data));
  });

  await test('GET /assets/my (My Assets)', async () => {
    const res = await fetch(`${BASE_URL}/assets/my`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data)) throw new Error(JSON.stringify(data));
  });

  // 4. Proposals Module
  await test('POST /proposals (Create Proposal by User)', async () => {
    const res = await fetch(`${BASE_URL}/proposals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        bai_dang_id: assetId,
        so_luong_yeu_cau: 1,
        loi_nhan: 'Xin chào admin, mình muốn nhận cuốn sách này ạ',
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.de_xuat_id) throw new Error(JSON.stringify(data));
    proposalId = data.de_xuat_id;
  });

  await test('GET /proposals/sent (Sent Proposals)', async () => {
    const res = await fetch(`${BASE_URL}/proposals/sent`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data)) throw new Error(JSON.stringify(data));
  });

  await test('GET /proposals/received (Received Proposals for Admin)', async () => {
    const res = await fetch(`${BASE_URL}/proposals/received`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data)) throw new Error(JSON.stringify(data));
  });

  // 5. Negotiation Module
  await test('POST /proposals/:id/messages (Send Negotiation Message)', async () => {
    const res = await fetch(`${BASE_URL}/proposals/${proposalId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ noi_dung: 'Em có thể qua lấy trực tiếp lúc 5h chiều không ạ?' }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.tin_nhan_id) throw new Error(JSON.stringify(data));
  });

  await test('GET /proposals/:id/messages (Get Messages History)', async () => {
    const res = await fetch(`${BASE_URL}/proposals/${proposalId}/messages`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data)) throw new Error(JSON.stringify(data));
  });

  // 6. Transactions & Accept Proposal
  await test('PUT /proposals/:id/accept (Accept Proposal -> Auto Transaction)', async () => {
    const res = await fetch(`${BASE_URL}/proposals/${proposalId}/accept`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    if (res.status !== 200 || !data.giao_dich) throw new Error(JSON.stringify(data));
    transactionId = data.giao_dich.giao_dich_id;
  });

  await test('GET /transactions (My Transactions)', async () => {
    const res = await fetch(`${BASE_URL}/transactions`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data)) throw new Error(JSON.stringify(data));
  });

  await test('PUT /transactions/:id/confirm (Owner Confirm Delivery)', async () => {
    const res = await fetch(`${BASE_URL}/transactions/${transactionId}/confirm`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    if (res.status !== 200 || !data.giao_dich || !data.giao_dich.xac_nhan_nguoi_so_huu) throw new Error(JSON.stringify(data));
  });

  await test('PUT /transactions/:id/confirm (Receiver Confirm Receipt -> Complete)', async () => {
    const res = await fetch(`${BASE_URL}/transactions/${transactionId}/confirm`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const data = await res.json();
    if (res.status !== 200 || !data.giao_dich || data.giao_dich.trang_thai !== 'HOAN_TAT') throw new Error(JSON.stringify(data));
  });

  // 7. Reviews Module
  await test('POST /reviews (Submit Review)', async () => {
    const res = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        giao_dich_id: transactionId,
        diem_sao: 5,
        nhan_xet: 'Giao dịch nhanh chóng, anh chủ rất nhiệt tình!',
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.danh_gia) throw new Error(JSON.stringify(data));
  });

  // 8. Reports Module
  await test('POST /reports (Create Violation Report)', async () => {
    const res = await fetch(`${BASE_URL}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        bai_dang_bi_bao_cao_id: assetId,
        ly_do_bao_cao: 'Thử nghiệm báo cáo vi phạm',
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.bao_cao_id) throw new Error(JSON.stringify(data));
  });

  await test('GET /reports ([Admin] Get Reports List)', async () => {
    const res = await fetch(`${BASE_URL}/reports`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data)) throw new Error(JSON.stringify(data));
  });

  console.log(`\n========================================`);
  console.log(`🎉 ALL TESTS PASSED: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();
