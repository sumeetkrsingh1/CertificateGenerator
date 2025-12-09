// Email sending server for Certificate Generator
const nodemailer = require('nodemailer');

// Gmail configuration with your credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sumitrajput8577@gmail.com',
    pass: 'xkgm koeh bojy sotr'  // Gmail App Password
  }
});

// Function to send emails
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

module.exports = { sendEmails, transporter };
