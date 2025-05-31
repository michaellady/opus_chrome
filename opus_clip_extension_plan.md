# Project Plan: Opus Clip Post Automation Extension

**I. Core Objective:**
Develop a Chrome extension that automates and enhances the social media post scheduling workflow on `https://clip.opus.pro/auto-post/calendar` by:
*   Automatically detecting the "Schedule Post" interface.
*   Extracting an existing Instagram caption.
*   Using a ChatGPT API (with a user-provided key) to transform this caption into a provocative, BJJ-focused question.
*   Populating the titles and descriptions for Facebook, YouTube, Instagram, TikTok, and X with the transformed content and a standardized boilerplate message (where applicable).

**II. Key Features:**

1.  **Page Detection**:
    *   The extension will activate when the user is on the Opus Clip "Schedule Post" page/modal (URL likely `https://clip.opus.pro/auto-post/calendar` but specific DOM cues for the scheduling interface will be needed).
2.  **API Key Management**:
    *   An options page for the user to securely input and store their ChatGPT API key using `chrome.storage.sync` or `chrome.storage.local`.
3.  **Caption Extraction & Transformation**:
    *   Identify and extract the pre-generated Instagram caption from the "Schedule Post" interface.
    *   Send the extracted caption to the ChatGPT API with the specified prompt for generating a provocative, BJJ-specific question.
    *   The prompt will instruct ChatGPT to convert all "Jiu-Jitsu" and "Jujitsu" (case-insensitive) variants to "BJJ".
4.  **Content Population**:
    *   **Facebook Title**: Set to the AI-generated sentence.
    *   **YouTube Title**: Set to the AI-generated sentence.
    *   **Instagram Description**:
        *   First line: AI-generated sentence.
        *   Appended: Modified boilerplate text.
    *   **TikTok Description**:
        *   First line: AI-generated sentence.
        *   Appended: Modified boilerplate text.
    *   **X (Twitter) Description**:
        *   First line: AI-generated sentence (no boilerplate due to length constraints).
5.  **Boilerplate Management**:
    *   The provided boilerplate text will have "Jiu-Jitsu" instances replaced with "BJJ".
    *   This modified boilerplate will be appended to Instagram and TikTok descriptions.
6.  **Automation**:
    *   The process should run automatically when the "Schedule Post" interface is detected and active.

**III. Technical Components:**

1.  **`manifest.json`**:
    *   `manifest_version`: 3
    *   `name`: "Opus Clip BJJ Post Automator" (or similar)
    *   `version`: "1.0.0"
    *   `description`: "Automates and enhances Opus Clip post scheduling for BJJ content."
    *   `permissions`: \[`storage`, `activeTab`, `scripting`, `https://clip.opus.pro/*`, `https://api.openai.com/*` (or the specific ChatGPT API endpoint)]
    *   `host_permissions`: \[`https://clip.opus.pro/*`, `https://api.openai.com/*`]
    *   `content_scripts`:
        *   `matches`: \[`https://clip.opus.pro/auto-post/calendar*`\]
        *   `js`: \[`content.js`\]
    *   `background`:
        *   `service_worker`: `background.js`
    *   `options_page`: `options.html`
    *   `action`:
        *   `default_popup`: `popup.html` (optional, for status/manual trigger)
        *   `default_icon`: {
            <!-- "16": "icons/icon16.png", -->
            <!-- "48": "icons/icon48.png", -->
            "128": "icons/icon128.png"
          }
2.  **Content Script (`content.js`)**:
    *   Logic to detect if the "Schedule Post" modal/interface is active.
    *   DOM selectors to extract the Instagram caption and target input fields.
    *   Functions to get/set values of these fields.
    *   Communication with `background.js`.
    *   Logic to update fields upon receiving the transformed text.
3.  **Background Script (`background.js`)**:
    *   Listener for messages from `content.js`.
    *   Function to retrieve the API key from `chrome.storage`.
    *   Function to make the `fetch` call to the ChatGPT API.
    *   Error handling for API calls.
    *   Sends the processed response back to `content.js`.
4.  **Options Page (`options.html`, `options.js`)**:
    *   HTML form for API key input.
    *   JavaScript to save/load the API key to/from `chrome.storage.sync`.
5.  **Popup Page (`popup.html`, `popup.js`) (Optional)**:
    *   Basic UI to show status or offer a manual trigger.
6.  **Utility Functions/Modules (e.g., `utils.js`)**:
    *   Function to modify the boilerplate text.
7.  **Icons**:
    <!-- *   `icons/icon16.png` -->
    <!-- *   `icons/icon48.png` -->
    *   `icons/icon128.png`

**IV. Workflow Diagram:**

```mermaid
graph TD
    subgraph User Interaction
        UI1[User navigates to Opus Clip Schedule Post page/modal]
        UI2[User (one-time setup) enters API Key in Extension Options]
    end

    subgraph Extension Setup
        ES1[API Key stored in chrome.storage]
    end

    subgraph Automated Workflow
        AW1(Content Script: Detects Schedule Post Interface) --> AW2{Interface Active?};
        AW2 -- Yes --> AW3[Extract pre-generated Instagram Caption];
        AW3 --> AW4[Send Caption to Background Script];
        AW4 --> BS1(Background Script: Retrieve API Key);
        BS1 --> BS2[Construct ChatGPT Prompt: "Transform the following BJJ video caption into a single, provocative, challenging question aimed at unskilled BJJ white and blue belts. Ensure all instances of 'jiu-jitsu', 'jujitsu', and their case variations are replaced with 'BJJ'. Caption: [extracted_caption]"];
        BS2 --> BS3[Call ChatGPT API (Smallest/Fastest Model)];
        BS3 -- AI-Generated Sentence --> BS4[Send Processed Sentence to Content Script];
        BS4 --> AW5[Content Script: Receives Transformed Sentence];
        AW5 --> AW6[Populate FB & YT Titles];
        AW5 --> AW7[Populate IG, TikTok, X Descriptions (First Line)];
        AW8[Modify Boilerplate: "Jiu-Jitsu" -> "BJJ"];
        AW8 --> AW9[Append modified Boilerplate to IG & TikTok Descriptions];
        AW2 -- No --> AW10[Extension Idle];
    end

    UI2 --> ES1;
    UI1 --> AW1;
```

**V. Development Steps & Considerations:**

1.  **Setup Chrome Extension Boilerplate**: Create `manifest.json`, `options.html`, `options.js`, `content.js`, `background.js`, and an `icons` directory.
2.  **Implement Options Page**: Allow users to save/load their ChatGPT API key.
3.  **DOM Analysis (Crucial First Step for Content Script)**:
    *   Manually navigate to the Opus Clip "Schedule Post" interface.
    *   Use browser developer tools to identify robust selectors for all target elements.
4.  **Implement Content Script - Part 1 (Extraction & Communication)**:
    *   Write logic to reliably detect when the target scheduling interface is visible/active (e.g., using `MutationObserver`).
    *   Extract the Instagram caption.
    *   Send a message to `background.js` with the caption.
5.  **Implement Background Script (API Call)**:
    *   Set up message listener.
    *   Retrieve API key.
    *   Implement the ChatGPT API call.
    *   Handle API response and errors.
    *   Send the transformed sentence back to `content.js`.
6.  **Implement Content Script - Part 2 (Population)**:
    *   Receive the transformed sentence.
    *   Populate the identified fields.
    *   Implement boilerplate modification and appending.
7.  **Testing & Refinement**:
    *   Thoroughly test on the live Opus Clip page.
    *   Test error handling (e.g., missing API key, API errors).
8.  **Error Handling & User Feedback**:
    *   Provide visual feedback for API key status and processing.
    *   Log errors to the console.

**VI. Potential Challenges & Mitigations:**

*   **Opus Clip UI Changes**:
    *   *Mitigation*: Use robust selectors; document them.
*   **ChatGPT API Issues**:
    *   *Mitigation*: Basic error handling; user manages their API key.
*   **Identifying "Schedule Post" State**:
    *   *Mitigation*: Use `MutationObserver` or refine URL matching.