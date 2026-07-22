require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSmtp() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

  console.log(`🔍 SMTP_HOST: ${host}`);
  console.log(`🔍 SMTP_PORT: ${port}`);
  console.log(`🔍 SMTP_USER: ${user}`);
  console.log(`🔍 SMTP_PASS (length ${pass.length}): ${pass}`);
  console.log(`🔍 SMTP_USER includes @: ${user?.includes('@')}`);

  if (!user || !pass) {
    console.error('❌ ERROR: SMTP_USER or SMTP_PASS is empty!');
    process.exit(1);
  }

  if (!user.includes('@')) {
    console.error('❌ ERROR: SMTP_USER is missing the @ symbol! Got:', user);
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
    auth: { user, pass },
  });

  try {
    console.log('🔌 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP Connection OK!');

    console.log('📧 Sending test email...');
    const info = await transporter.sendMail({
      from: `"ShareHub Test" <${user}>`,
      to: user,
      subject: '[ShareHub SMTP Test] Kết nối thành công!',
      text: 'SMTP hoạt động đúng trên Render!',
    });
    console.log('🎉 Email sent! MessageId:', info.messageId);
  } catch (err) {
    console.error('❌ SMTP Error:', err.message);
    console.error('❌ Error code:', err.code);
    console.error('❌ Response:', err.response);
  }
}

testSmtp();
