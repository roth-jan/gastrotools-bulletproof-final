module.exports = async (req, res) => {
  try {
    console.log('🔍 EMAIL DEBUG TEST');
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('RESEND_API_KEY value:', process.env.RESEND_API_KEY ? 'SET' : 'NOT SET');
    
    if (!process.env.RESEND_API_KEY) {
      return res.json({ error: 'RESEND_API_KEY not found', env: process.env });
    }

    console.log('🚀 Attempting to send test email...');
    
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const result = await resend.emails.send({
      from: 'GastroTools <test@resend.dev>',
      to: 'test@example.com', // This will fail but show if API works
      subject: 'Test Email from GastroTools',
      html: '<h1>Test Email</h1><p>If you see this, email system works!</p>'
    });

    console.log('✅ Email API call successful:', result);
    
    return res.json({
      success: true,
      message: 'Email system working',
      result: result
    });

  } catch (error) {
    console.error('❌ Email test failed:', error);
    return res.status(500).json({
      error: error.message,
      details: error.toString()
    });
  }
};