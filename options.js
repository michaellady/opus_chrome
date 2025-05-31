// Saves options to chrome.storage
function save_options() {
  const apiKey = document.getElementById('apiKey').value;
  const model = document.getElementById('chatGPTModel').value;
  const boilerplate = document.getElementById('boilerplate').value;
  chrome.storage.sync.set({
    chatGPTApiKey: apiKey,
    chatGPTModel: model,
    boilerplate: boilerplate
  }, function() {
    // Update status to let user know options were saved.
    const status = document.getElementById('status');
    if (chrome.runtime.lastError) {
      status.textContent = 'Error saving settings: ' + chrome.runtime.lastError.message;
      status.className = 'error';
    } else {
      status.textContent = 'Settings saved.';
      status.className = 'success';
    }
    setTimeout(function() {
      status.textContent = '';
      status.className = '';
    }, 2000);
  });
}

// Restores API key and model selection state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    chatGPTApiKey: '', // Default to an empty string if not set
    chatGPTModel: 'gpt-4o', // Default model updated to gpt-4o
    boilerplate: `FOLLOW @mikelady to learn how I help busy professionals become semi-pro at BJJ.\n\nComment “sandbox” below to see how this game fits into the bigger picture in my @sandboxbjj course + community\n📸 @vthehoneybadger\n#bjj #grappling #submissiongrappling #jiujitsu #adcc`
  }, function(items) {
    if (chrome.runtime.lastError) {
      const status = document.getElementById('status');
      status.textContent = 'Error loading settings: ' + chrome.runtime.lastError.message;
      status.className = 'error';
      return;
    }
    document.getElementById('apiKey').value = items.chatGPTApiKey;
    document.getElementById('chatGPTModel').value = items.chatGPTModel;
    document.getElementById('boilerplate').value = items.boilerplate;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);