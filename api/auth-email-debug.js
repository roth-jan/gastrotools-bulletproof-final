module.exports = async (req, res) => {
  try {
    console.log('🔍 EMAIL ENVIRONMENT DEBUG');
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('RESEND_API_KEY length:', process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.length : 'undefined');
    console.log('RESEND_API_KEY starts with re_:', process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.startsWith('re_') : 'undefined');
    
    // Force email send regardless of conditions
    if (process.env.RESEND_API_KEY) {
      console.log('🚀 FORCING EMAIL SEND...');
      
      const { Resend } = require('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const result = await resend.emails.send({
        from: 'GastroTools <noreply@resend.dev>',
        to: 'jhroth@ntconsult.de',
        subject: 'DEBUG: Email System Test',
        html: '<h1>Email System Works!</h1><p>This email confirms the system can send emails.</p>'
      });

      console.log('✅ Email send result:', result);
      
      return res.json({
        success: true,
        message: 'Email debug completed',
        hasApiKey: !!process.env.RESEND_API_KEY,
        result: result
      });
    } else {
      return res.json({
        success: false,
        message: 'RESEND_API_KEY not found',
        envKeys: Object.keys(process.env).filter(key => key.includes('RESEND'))
      });
    }

  } catch (error) {
    console.error('❌ Email debug failed:', error);
    return res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
};