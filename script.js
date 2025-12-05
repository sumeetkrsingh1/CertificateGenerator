// Certificate Generator - n8n Webhook Integration
// Upload CSV/Excel and communicate with n8n workflow

const N8N_WEBHOOK_URL = 'https://n8n-6421999960723536360.kloudbeansite.com/webhook/b6d3fc1a-b549-4b01-9b20-141903ac3e92';}
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
      alert('Please select a file');
      return;
    }

    progressSection.style.display = 'block';
    resultsSection.style.display = 'none';
    submitBtn.disabled = true;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      progressSection.style.display = 'none';
      resultsSection.style.display = 'block';

      if (data.status === 'success' || data.jobId) {
        successMessage.innerHTML = '<strong>Success!</strong> Certificates processed.';
        successMessage.style.display = 'block';
        errorMessage.style.display = 'none';
      } else {
        throw new Error(data.message || 'Error');
      }
    } catch (error) {
      console.error('Error:', error);
      progressSection.style.display = 'none';
      resultsSection.style.display = 'block';
      errorMessage.innerHTML = `<strong>Error!</strong> ${error.message}`;
      errorMessage.style.display = 'block';
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
      submitBtn.disabled = true;
    });
  }
});
