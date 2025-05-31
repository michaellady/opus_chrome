console.log("Opus Clip Automator content script loaded. v2");

// Store selectors and platform identification logic
const SELECTORS = {
  modalContainer: 'div[role="dialog"][data-state="open"][aria-labelledby^="radix-"]',
  platformSectionContainer: 'div.flex.w-\\[683px\\].flex-col.gap-6.overflow-y-auto.p-4', // Parent of all platform sections (escaped brackets)
  platformSection: 'div.flex.gap-4', // Each platform's editing block
  platformIconSvgContainer: 'div > div > span[style*="width: 32px"] div.border-border svg', // Path to the platform icon SVG
  draftEditor: 'div.public-DraftEditor-content[contenteditable="true"]',
  // Platform specific title inputs (using starts-with for name)
  facebookTitleInput: 'input[name^="FACEBOOK_PAGE"][name$=".title"]',
  youtubeTitleInput: 'input[name^="YOUTUBE"][name$=".title"]',
};

function getPlatformFromSVG(svgElement) {
  if (!svgElement) return null;

  // Instagram: rect fill="url(#pattern...)"
  const igRect = svgElement.querySelector('rect[fill^="url(#pattern"]');
  if (igRect) return 'instagram';

  // Facebook: path fill="#0866FF"
  const fbPath = svgElement.querySelector('path[fill="#0866FF"]');
  if (fbPath) return 'facebook';

  // YouTube: rect fill="#FF0000"
  const ytRect = svgElement.querySelector('rect[fill="#FF0000"]');
  if (ytRect) return 'youtube';

  // TikTok: rect fill="black" and specific color paths
  const tkRectBlack = svgElement.querySelector('rect[fill="black"]');
  if (tkRectBlack) {
    const tkPathPink = svgElement.querySelector('path[fill="#FF004F"]');
    const tkPathCyan = svgElement.querySelector('path[fill="#00F2EA"]');
    if (tkPathPink || tkPathCyan) return 'tiktok';
  }

  // X (Twitter): rect fill="black" (smaller viewBox for X icon) and path fill="white"
  // The X icon SVG has viewBox="0 0 18 18", others are "0 0 24 24"
  if (svgElement.getAttribute('viewBox') === '0 0 18 18') {
    const xRectBlack = svgElement.querySelector('rect[fill="black"]');
    const xPathWhite = svgElement.querySelector('path[fill="white"]');
    if (xRectBlack && xPathWhite) return 'twitter';
  }
  return null; // Unknown platform
}

function extractSourceCaption(platformSections) {
  for (const section of platformSections) {
    const svgIcon = section.querySelector(SELECTORS.platformIconSvgContainer);
    const platform = getPlatformFromSVG(svgIcon);

    if (platform === 'instagram') {
      const editor = section.querySelector(SELECTORS.draftEditor);
      if (editor) {
        let caption = "";
        editor.querySelectorAll('span[data-text="true"]').forEach(span => {
          caption += span.innerText;
        });
        if (caption.trim()) {
            console.log("Extracted Instagram caption:", caption.trim());
            return caption.trim();
        }
        // Fallback for direct text if no spans
        const directText = editor.innerText.trim();
        if(directText){
            console.log("Extracted Instagram caption (direct text):", directText);
            return directText;
        }
      }
    }
  }
  console.warn("Could not find Instagram section or caption to extract.");
  return null;
}

function populateFields(transformedText, boilerplate, platformSections) {
  if (!platformSections) {
    console.error("Platform sections not provided for populating fields.");
    return;
  }

  function setDraftEditorValue(editor, text) {
    // Clear existing content
    const contentHost = editor.querySelector('div[data-contents="true"]');
    if (contentHost) {
      contentHost.innerHTML = ''; // Clear all blocks
    } else {
      // Fallback if data-contents isn't found, clear the editor directly
      // This might be less effective for Draft.js but is a fallback.
      editor.innerHTML = '';
    }
    
    // Create the new content structure for Draft.js
    // This needs to mimic what Draft.js expects for a single line of text.
    // A single block with a single span.
    const newContentHost = document.createElement('div');
    newContentHost.setAttribute('data-contents', 'true');

    const dataBlock = document.createElement('div');
    dataBlock.setAttribute('data-block', 'true');
    // dataBlock.setAttribute('data-editor', editor.id || 'temp-editor'); // editor might not have an id
    dataBlock.setAttribute('data-offset-key', `tempblock-${Math.random().toString(36).substring(2, 9)}-0-0`);

    const offsetKey = `${Math.random().toString(36).substring(2, 7)}-0-0`;
    const innerDiv = document.createElement('div');
    innerDiv.setAttribute('data-offset-key', offsetKey);
    innerDiv.className = 'public-DraftStyleDefault-block public-DraftStyleDefault-ltr';

    const span = document.createElement('span');
    span.setAttribute('data-offset-key', offsetKey);

    const textSpan = document.createElement('span');
    textSpan.setAttribute('data-text', 'true');
    textSpan.textContent = text;

    span.appendChild(textSpan);
    innerDiv.appendChild(span);
    dataBlock.appendChild(innerDiv);
    newContentHost.appendChild(dataBlock);
    
    // Replace the editor's content with the new structure
    if (contentHost) {
        editor.replaceChild(newContentHost, contentHost);
    } else {
        editor.appendChild(newContentHost); // Append if no contentHost was found to replace
    }


    // Dispatch input event to notify the page of changes
    editor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    console.log(`Populated editor for a platform with: ${text.substring(0, 30)}...`);
  }

  function setInputValue(inputElement, text) {
    if (inputElement) {
      inputElement.value = ''; // Clear existing value
      inputElement.value = text;
      inputElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
      console.log(`Populated input field with: ${text}`);
    }
  }

  for (const section of platformSections) {
    const svgIcon = section.querySelector(SELECTORS.platformIconSvgContainer);
    const platform = getPlatformFromSVG(svgIcon);
    const editor = section.querySelector(SELECTORS.draftEditor);

    if (!platform || !editor) {
      console.warn("Skipping a section, platform or editor not identified.", section);
      continue;
    }

    switch (platform) {
      case 'facebook':
        const fbTitleInput = section.querySelector(SELECTORS.facebookTitleInput);
        setInputValue(fbTitleInput, transformedText);
        setDraftEditorValue(editor, `${transformedText}\n\n${boilerplate}`);
        break;
      case 'youtube':
        const ytTitleInput = section.querySelector(SELECTORS.youtubeTitleInput);
        setInputValue(ytTitleInput, transformedText);
        setDraftEditorValue(editor, `${transformedText}\n\n${boilerplate}`);
        break;
      case 'instagram':
        setDraftEditorValue(editor, `${transformedText}\n\n${boilerplate}`);
        break;
      case 'tiktok':
        setDraftEditorValue(editor, `${transformedText}\n\n${boilerplate}`);
        break;
      case 'twitter':
        setDraftEditorValue(editor, transformedText); // No boilerplate for X
        break;
      default:
        console.warn(`Unknown platform section encountered: ${platform}`);
    }
  }
  console.log("Finished attempting to populate fields.");
}

let originalSourceCaption = null; // Variable to store the original caption
let regenerateButton = null; // Variable to store the regenerate button

function createRegenerateButton(modalNode, platformSections) {
  if (regenerateButton && regenerateButton.isConnected) {
    // Button already exists and is in the DOM, ensure it's visible or update if needed
    regenerateButton.style.display = 'block';
    return regenerateButton;
  }

  const button = document.createElement('button');
  button.textContent = '🔄 Regenerate AI Text';
  button.style.cssText = `
    margin-top: 15px;
    margin-bottom: 10px;
    padding: 8px 15px;
    background-color: #5a67d8; /* Indigo-ish */
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    display: block; /* Or inline-block depending on desired layout */
  `;
  button.id = 'bjjAutomatorRegenerateBtn';

  button.addEventListener('click', () => {
    if (!originalSourceCaption) {
      console.warn("No original caption stored to regenerate.");
      alert("Could not find the original caption to regenerate. Please try closing and reopening the schedule modal.");
      return;
    }
    if (!chrome.runtime?.id) {
      console.warn("Extension context invalidated. Cannot regenerate.");
      alert("Extension context error. Please try reloading the extension or the page.");
      return;
    }
    
    button.textContent = ' regenerating...';
    button.disabled = true;

    chrome.runtime.sendMessage({ action: "regenerateCaption", caption: originalSourceCaption }, (response) => {
      button.textContent = '🔄 Regenerate AI Text';
      button.disabled = false;
      if (chrome.runtime.lastError) {
        console.error("Error during regenerateCaption:", chrome.runtime.lastError.message);
        alert(`Error during regeneration: ${chrome.runtime.lastError.message}`);
        return;
      }
      if (response && response.error) {
        console.error("Error from background script (regenerate):", response.error);
        alert(`Error from AI: ${response.error}`);
      } else if (response && response.transformed) {
        console.log("Received regenerated text:", response.transformed);
        populateFields(response.transformed, response.boilerplate, platformSections); // Re-populate fields
      } else {
        console.error("Invalid response from background script (regenerate):", response);
        alert("Received an invalid response during regeneration.");
      }
    });
  });

  // Try to append it in a reasonable place, e.g., after the platform sections container
  const container = modalNode.querySelector(SELECTORS.platformSectionContainer);
  if (container && container.parentNode) {
    container.parentNode.insertBefore(button, container.nextSibling); // Insert after the container
  } else {
    // Fallback: append to modal if specific container not found
    modalNode.appendChild(button);
    console.warn("Could not find ideal placement for regenerate button, appending to modal.");
  }
  regenerateButton = button;
  return button;
}


function mainScript() {
  const modalNode = document.querySelector(SELECTORS.modalContainer);
  if (!modalNode) {
    return;
  }

  const isReprocessingAllowed = modalNode.classList.contains('automator-allow-reprocess');
  const alreadyProcessed = modalNode.hasAttribute('data-automator-processed');

  if (alreadyProcessed && !isReprocessingAllowed) {
    // console.log("Modal already processed and not marked for re-processing.");
    return;
  }

  modalNode.setAttribute('data-automator-processed', 'true');
  if (isReprocessingAllowed) {
    modalNode.classList.remove('automator-allow-reprocess'); // Consume the flag
  }
  console.log("Schedule Post Modal detected for processing!");

  const platformSectionsContainer = modalNode.querySelector(SELECTORS.platformSectionContainer);
  if (!platformSectionsContainer) {
    console.error("Platform sections container not found within modal.");
    modalNode.removeAttribute('data-automator-processed');
    return;
  }
  const platformSections = platformSectionsContainer.querySelectorAll(`:scope > ${SELECTORS.platformSection}`);

  if (platformSections.length === 0) {
    console.warn("No platform sections found within the modal content area.");
    modalNode.removeAttribute('data-automator-processed');
    return;
  }
  console.log(`Found ${platformSections.length} potential platform sections.`);

  // Only extract original caption if it's the first run for this modal instance
  if (!originalSourceCaption || isReprocessingAllowed) { // also re-extract if we are reprocessing (though it should be the same)
    const extractedCap = extractSourceCaption(platformSections);
    if (extractedCap) {
        originalSourceCaption = extractedCap;
    } else if (!originalSourceCaption) { // If still no caption and it was needed
        console.warn("No source caption extracted on initial run. Cannot proceed.");
        modalNode.removeAttribute('data-automator-processed');
        return;
    }
  }
  
  if (originalSourceCaption) {
    if (!chrome.runtime?.id) {
      console.warn("Extension context invalidated. Skipping message to background.");
      modalNode.removeAttribute('data-automator-processed');
      return;
    }

    const currentAction = isReprocessingAllowed ? "regenerateCaption" : "transformCaption";
    console.log(`Sending action: ${currentAction} with caption: ${originalSourceCaption.substring(0,30)}...`);

    // Visually indicate processing on the button if it exists
    const regenBtn = document.getElementById('bjjAutomatorRegenerateBtn');
    if (regenBtn) {
        regenBtn.textContent = `🔄 ${currentAction === 'regenerateCaption' ? 'Regenerating' : 'Processing'}...`;
        regenBtn.disabled = true;
    }

    chrome.runtime.sendMessage({ action: currentAction, caption: originalSourceCaption }, (response) => {
      if (regenBtn) {
          regenBtn.textContent = '🔄 Regenerate AI Text';
          regenBtn.disabled = false;
      }
      if (chrome.runtime.lastError) {
        console.error("Error during sendMessage or in response handling:", chrome.runtime.lastError.message);
        modalNode.removeAttribute('data-automator-processed');
        return;
      }
      
      if (response && response.error) {
        console.error("Error from background script:", response.error);
        alert(`Error from AI: ${response.error}`);
        modalNode.removeAttribute('data-automator-processed'); // Allow retry by user action
      } else if (response && response.transformed) {
        console.log("Received transformed text from background:", response.transformed);
        populateFields(response.transformed, response.boilerplate, platformSections);
        createRegenerateButton(modalNode, platformSections); // Ensure button is present and visible
      } else {
        console.error("Invalid or no response from background script:", response);
        alert("Received an invalid response from the AI. Please try again.");
        modalNode.removeAttribute('data-automator-processed'); // Allow retry
      }
    });
  } else {
    console.warn("No source caption available. Cannot proceed.");
    modalNode.removeAttribute('data-automator-processed');
  }
}

const observer = new MutationObserver((mutationsList, obs) => {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      const modalNode = document.querySelector(SELECTORS.modalContainer);
      if (modalNode && !modalNode.hasAttribute('data-automator-processed')) {
        // Using setTimeout to ensure the modal's content is fully rendered
        // especially Draft.js editors.
        // Also, ensure we don't run mainScript if it's already being processed from another mutation
        if (!modalNode.hasAttribute('data-automator-processing-lock')) {
            modalNode.setAttribute('data-automator-processing-lock', 'true');
            setTimeout(() => {
                mainScript();
                modalNode.removeAttribute('data-automator-processing-lock');
            }, 1000);
        }
        // obs.disconnect(); // Disconnect after finding and processing once if desired
        // break; // Exit loop once modal is found and processing initiated
      }
    } else if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
        mutation.removedNodes.forEach(removedNode => {
            if (removedNode.nodeType === Node.ELEMENT_NODE && removedNode.matches(SELECTORS.modalContainer)) {
                if (removedNode.hasAttribute('data-automator-processed') || removedNode.classList.contains('automator-allow-reprocess')) {
                    console.log("Processed modal removed. Resetting for next instance.");
                    removedNode.removeAttribute('data-automator-processed');
                    removedNode.classList.remove('automator-allow-reprocess');
                    removedNode.removeAttribute('data-automator-processing-lock'); // Clean up lock
                    
                    const currentRegenButton = document.getElementById('bjjAutomatorRegenerateBtn');
                    if (currentRegenButton) {
                        currentRegenButton.remove();
                    }
                    regenerateButton = null;
                    originalSourceCaption = null;
                }
            }
        });
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial check
setTimeout(() => {
    const modalNode = document.querySelector(SELECTORS.modalContainer);
    if (modalNode && !modalNode.hasAttribute('data-automator-processed') && !modalNode.classList.contains('automator-allow-reprocess')) {
        if (!modalNode.hasAttribute('data-automator-processing-lock')) {
            modalNode.setAttribute('data-automator-processing-lock', 'true');
            console.log("Schedule Post Modal detected on initial script load!");
            mainScript(); // Call mainScript directly
            // The lock is removed inside mainScript after processing or if it bails early
            // No, mainScript doesn't remove the lock, it should be removed after the async sendMessage completes or mainScript exits
            // For simplicity, let's ensure it's removed after the setTimeout completes its attempt.
             setTimeout(() => modalNode.removeAttribute('data-automator-processing-lock'), 50); // Small delay after mainScript call
        }
    }
}, 1500);