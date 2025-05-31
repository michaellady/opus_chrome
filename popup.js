document.addEventListener('DOMContentLoaded', function() {
  console.log("Popup opened.");
  // Future: Add logic to display status or interact with the background script.
  // For example, to get status from background:
  // chrome.runtime.sendMessage({ action: "getStatus" }, (response) => {
  //   if (chrome.runtime.lastError) {
  //     console.error(chrome.runtime.lastError.message);
  //     document.getElementById('status').textContent = 'Error.';
  //     return;
  //   }
  //   if (response && response.status) {
  //     document.getElementById('status').textContent = response.status;
  //   } else {
  //     document.getElementById('status').textContent = 'Ready.';
  //   }
  // });
});