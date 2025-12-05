// Certificate Generator - n8n Webhook Integration
// Upload CSV/Excel and communicate with n8n workflow

const N8N_WEBHOOK_URL = 'https://n8n-6421999960723536360.kloudbeansite.com/webhook/b6d3fc1a-b549-4b01-9b20-141903ac3e92';

document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('fileInput');
  const fileName = document.getElementById('fileName');
  const submitBtn = document.getElementById('submitBtn');
  const resetBtn = document.getElementById('resetBtn');
  const progressSection = document.getElementById('progressSection');
  const resultsSection = document.getElementById('resultsSection');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');

  // File input change handler
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
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

  // Submit button handler
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

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response from n8n:', data);

      progressSection.style.display = 'none';
      resultsSection.style.display = 'block';

      if (data.status === 'success' || data.jobId || data.processedCount !== undefined) {
        const processedCount = data.processedCount || 1;
        successMessage.innerHTML = `<strong>Success!</strong> Certificates generated and processing initiated. Processed ${processedCount} participant(s).`;
        successMessage.style.display = 'block';
        errorMessage.style.display = 'none';
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

  // Reset button handler
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      fileInput.value = '';
      fileName.textContent = 'No file selected';
      progressSection.style.display = 'none';
      resultsSection.style.display = 'none';
      successMessage.style.display = 'none';
      errorMessage.style.display = 'none';
      submitBtn.disabled = true;
    });
  }
});
