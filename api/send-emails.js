// Vercel API Handler for sending emails
const nodemailer = require('nodemailer');

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sumitrajput8577@gmail.com',
    pass: 'xkgm koeh bojy sotr' // Gmail App Password
  }
});

// Email sending function
async function sendEmails(certificatesData) {
  try {
    if (!certificatesData || !Array.isArray(certificatesData)) {
      throw new Error('Invalid certificates data');
    }

    let successCount = 0;
    let errorCount = 0;
    const results = [];

    // Send emails to each student
    for (const cert of certificatesData) {
      try {
        if (!cert.email || !cert.fullName) {
          errorCount++;
          results.push({
            email: cert.email,
            status: 'failed',
            error: 'Missing email or fullName'
          });
          continue;
        }

        const mailOptions = {
          from: 'sumitrajput8577@gmail.com',
          to: cert.email,
          subject: `Your Certificate - ${cert.fullName}`,
          html: cert.certificateHtml || '',
          replyTo: 'sumitrajput8577@gmail.com'
        };

        const info = await transporter.sendMail(mailOptions);
        successCount++;
        results.push({
          email: cert.email,
          status: 'success',
          messageId: info.messageId
        });
        console.log(`Email sent to ${cert.email}`);
      } catch (error) {
        errorCount++;
        results.push({
          email: cert.email,
          status: 'failed',
          error: error.message
        });
        console.error(`Failed to send email to ${cert.email}:`, error);
      }
    }

    return {
      success: true,
      successCount,
      errorCount,
      totalCount: certificatesData.length,
      results
    };
  } catch (error) {
    console.error('Error in sendEmails:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Vercel API Handler
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { certificates } = req.body;

    if (!certificates) {
      return res.status(400).json({ error: 'No certificates provided' });
    }

    const result = await sendEmails(certificates);
    return res.status(200).json(result);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Email sending failed'
    });
  }
}
