// Certificate Generator - Backend API Integration
// Upload CSV/Excel and generate certificates, then send via Node.js API
const N8N_WEBHOOK_URL = 'https://n8n-6421999607235360.kloudbeansite.com/webhook/b6d3fc1a-b549-4b01-9b20-141903ac3e92';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
let allCertificates = []; // Store certificates for display

document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('fileInput');
  const fileName = document.getElementById('fileName');
  const submitBtn = document.getElementById('submitBtn');
  const resetBtn = document.getElementById('resetBtn');
  const progressSection = document.getElementById('progressSection');
  const resultsSection = document.getElementById('resultsSection');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      const isValidType = validTypes.some(type => file.type.startsWith(type.split('/')[0])) || file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
      
      if (!isValidType) {
        alert('Please select a CSV or Excel file');
        fileInput.value = '';
        fileName.textContent = 'No file selected';
        submitBtn.disabled = true;
        return;
      }
      
      fileName.textContent = file.name;
      submitBtn.disabled = false;
    } else {
      fileName.textContent = 'No file selected';
      submitBtn.disabled = true;
    }
  });

  submitBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
      alert('Please select a file first');
      return;
    }

    progressSection.style.display = 'block';
    resultsSection.style.display = 'none';
    submitBtn.disabled = true;
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';

    try {
      const formData = new FormData();
      formData.append('file', file);
      console.log('Sending file to n8n webhook...', file.name);

      let response;
      try {
        response = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          body: formData,
          mode: 'cors'
        });
      } catch (corsError) {
        console.warn('Direct fetch failed, trying CORS proxy...');
        const encodedURL = encodeURIComponent(N8N_WEBHOOK_URL);
        response = await fetch(CORS_PROXY + encodedURL, {
          method: 'POST',
          body: formData
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response from n8n:', data);

      progressSection.style.display = 'none';
      resultsSection.style.display = 'block';

      if (data.status === 'success' || Array.isArray(data) || data.certificateHtml || (data.length !== undefined)) {
        // Process certificates
        const certificates = Array.isArray(data) ? data : (data.certificates || []);
        allCertificates = certificates.length > 0 ? certificates : data.processedData ? Object.values(data.processedData) : [data];
        
        if (allCertificates.length === 0) {
          allCertificates = [data];
        }

        displayCertificates(allCertificates);
        
        const processedCount = allCertificates.length || 1;
        successMessage.innerHTML = `<strong>Success!</strong> Certificates generated for ${processedCount} participant(s).`;
        successMessage.style.display = 'block';
        errorMessage.style.display = 'none';

        // Update stats
        document.getElementById('totalStudents').textContent = processedCount;
        document.getElementById('certificatesGenerated').textContent = processedCount;
        document.getElementById('emailsSent').textContent = '0'; // Reset email count
      } else if (data.message) {
        throw new Error(data.message);
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      progressSection.style.display = 'none';
      resultsSection.style.display = 'block';
      errorMessage.innerHTML = `<strong>Error!</strong> ${error.message || 'Failed to process file'}`;
      errorMessage.style.display = 'block';
      successMessage.style.display = 'none';
    } finally {
      submitBtn.disabled = false;
    }
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      fileInput.value = '';
      fileName.textContent = 'No file selected';
      progressSection.style.display = 'none';
      resultsSection.style.display = 'none';
      successMessage.style.display = 'none';
      errorMessage.style.display = 'none';
      submitBtn.disabled = true;
      allCertificates = [];
    });
  }
});

function displayCertificates(certificates) {
  const list = document.getElementById('certificatesList');
  list.innerHTML = '';

  certificates.forEach((cert, index) => {
    const fullName = cert.fullName || cert['Full Name'] || 'Student ' + (index + 1);
    const certItem = document.createElement('div');
    certItem.className = 'certificate-item';
    certItem.style.cssText = 'padding:15px;margin:10px 0;border:2px solid #667eea;border-radius:8px;background:#f9f9f9;display:flex;justify-content:space-between;align-items:center;';
    
    certItem.innerHTML = `
      <div>
        <h4 style="margin:0;color:#1a1a1a;">${fullName}</h4>
        <p style="margin:5px 0 0 0;color:#666;font-size:14px;">Certificate of Completion</p>
      </div>
      <div style="display:flex;gap:10px;">
        <button onclick="viewCertificate(${index})" class="btn btn-primary" style="padding:8px 16px;background:#667eea;color:white;border:none;border-radius:4px;cursor:pointer;">👀 View</button>
        <button onclick="downloadCertificatePDF(${index})" class="btn btn-secondary" style="padding:8px 16px;background:#764ba2;color:white;border:none;border-radius:4px;cursor:pointer;">📥 Download</button>
      </div>
    `;
    list.appendChild(certItem);
  });

  const sendEmailsBtn = document.getElementById('sendEmailsBtn');
  if (sendEmailsBtn && certificates.length > 0) {
    sendEmailsBtn.style.display = 'block';
  }
}

function viewCertificate(index) {
  if (!allCertificates[index]) return;
  
  const cert = allCertificates[index];
  const modal = document.getElementById('certificateModal');
  const display = document.getElementById('certificateDisplay');
  
  display.innerHTML = cert.certificateHtml || '<p>No certificate HTML available</p>';
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  window.currentCertificateIndex = index;
}

function closeCertificateModal() {
  const modal = document.getElementById('certificateModal');
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

function downloadCertificatePDF(index) {
  if (!allCertificates[index]) return;
  
  const cert = allCertificates[index];
  const fullName = cert.fullName || 'Certificate';
  const element = document.createElement('div');
  element.innerHTML = cert.certificateHtml || '<p>No certificate available</p>';
  
  const opt = {
    margin: 0,
    filename: `Certificate_${fullName.replace(/\s+/g, '_')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' }
  };
  
  html2pdf().set(opt).from(element).save();
}

window.addEventListener('click', (event) => {
  const modal = document.getElementById('certificateModal');
  if (event.target === modal) {
    closeCertificateModal();
  }
});

// Email Sending Functions
function setupSendEmailsButton() {
  const sendEmailsBtn = document.getElementById('sendEmailsBtn');
  if (sendEmailsBtn) {
    sendEmailsBtn.addEventListener('click', sendEmailsToAllStudents);
  }
}

async function sendEmailsToAllStudents() {
  if (allCertificates.length === 0) {
    alert('No certificates to send. Please generate certificates first.');
    return;
  }

  const sendEmailsBtn = document.getElementById('sendEmailsBtn');
  sendEmailsBtn.disabled = true;
  sendEmailsBtn.textContent = 'Sending emails...';

  try {
    const emailData = allCertificates.map(cert => ({
      fullName: cert.fullName || 'Student',
      email: cert.email || '',
      certificateHtml: cert.certificateHtml || '',
      certificateDate: cert.certificateDate || new Date().toLocaleDateString()
    }));

    console.log('Sending emails for', emailData.length, 'students via Node.js API');

    // Determine the API URL based on current domain
    let apiUrl = '/api/send-emails';
    
    // If running on GitHub Pages, we need to use a full URL to the Vercel deployment
    if (window.location.hostname.includes('github.io')) {
      // For GitHub Pages, construct the Vercel URL from the repo name
      apiUrl = 'https://certificate-generator-git-main-sumeetsprojects.vercel.app/api/send-emails';
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ certificates: emailData })
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Email response:', result);

    // Update stats based on API response
    const emailsSentCount = result.successCount || emailData.length;
    document.getElementById('emailsSent').textContent = emailsSentCount;

    const successMessage = document.getElementById('successMessage');
    successMessage.innerHTML = `<strong>Success!</strong> ${emailsSentCount} email(s) sent successfully to all students.`;
    successMessage.style.display = 'block';

    // Show error details if some emails failed
    if (result.errorCount && result.errorCount > 0) {
      const errorMessage = document.getElementById('errorMessage');
      errorMessage.innerHTML = `<strong>Partial Failure:</strong> ${result.errorCount} email(s) failed to send. Please check the recipient email addresses.`;
      errorMessage.style.display = 'block';
    }
  } catch (error) {
    console.error('Error sending emails:', error);
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.innerHTML = `<strong>Error sending emails!</strong> ${error.message}`;
    errorMessage.style.display = 'block';
  } finally {
    sendEmailsBtn.disabled = false;
    sendEmailsBtn.textContent = '📧 Send Emails to All Students';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupSendEmailsButton);
} else {
  setupSendEmailsButton();
}

// Modal overlay click handler - close when clicking outside modal
if (document.getElementById('certificateModal')) {
  document.getElementById('certificateModal').addEventListener('click', (e) => {
    if (e.target.id === 'certificateModal') {
      closeCertificateModal();
    }
  });
}
