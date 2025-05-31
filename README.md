# Opus Clip BJJ Post Automator

## Overview

This Chrome extension automates and enhances the social media post scheduling workflow on `https://clip.opus.pro/auto-post/calendar`. It is designed specifically for users who create BJJ (Brazilian Jiu-Jitsu) content and want to streamline their posting process.

[![Opus Clip Automator Demo Video](https://img.youtube.com/vi/uWlh8Py8Pdw/0.jpg)](https://www.youtube.com/watch?v=uWlh8Py8Pdw "Watch the Opus Clip Automator Demo")

## Core Objective

The primary goal of this extension is to:

*   Automatically detect when the user is on the Opus Clip "Schedule Post" interface.
*   Extract an existing Instagram caption from this interface.
*   Utilize a user-provided ChatGPT API key to transform this caption into a provocative, BJJ-focused question.
*   Populate the titles and descriptions for Facebook, YouTube, Instagram, TikTok, and X (formerly Twitter) with the AI-generated question and a standardized boilerplate message (where applicable for Instagram and TikTok).

## Key Features

1.  **Page Detection**: Activates automatically on the Opus Clip "Schedule Post" page/modal.
2.  **API Key Management**: Provides an options page for users to securely input and store their ChatGPT API key.
3.  **Caption Extraction & Transformation**:
    *   Identifies and extracts the pre-generated Instagram caption.
    *   Sends the caption to the ChatGPT API with a prompt to generate a BJJ-specific provocative question.
    *   Ensures "Jiu-Jitsu" and "Jujitsu" variants are converted to "BJJ" in the AI output.
4.  **Automated Content Population**:
    *   **Facebook Title**: AI-generated question.
    *   **YouTube Title**: AI-generated question.
    *   **Instagram Description**: AI-generated question (first line) + modified boilerplate.
    *   **TikTok Description**: AI-generated question (first line) + modified boilerplate.
    *   **X (Twitter) Description**: AI-generated question (no boilerplate).
5.  **Boilerplate Management**: Modifies a standard boilerplate text to replace "Jiu-Jitsu" with "BJJ" before appending it to Instagram and TikTok descriptions.
6.  **Automation**: The entire process runs automatically upon detection of the scheduling interface.

## How It Works (Technical Components)

The extension is built using standard Chrome extension technologies:

*   **[`manifest.json`](manifest.json:1)**: Defines the extension's properties, permissions, and components.
*   **[`content.js`](content.js:1)**: Injected into the Opus Clip page. Responsible for:
    *   Detecting the "Schedule Post" interface.
    *   Extracting the Instagram caption.
    *   Communicating with the background script.
    *   Populating the social media fields with transformed content.
*   **[`background.js`](background.js:1)**: The extension's service worker. Responsible for:
    *   Listening for messages from the content script.
    *   Retrieving the user's ChatGPT API key from storage.
    *   Making the API call to ChatGPT.
    *   Sending the processed response back to the content script.
*   **[`options.html`](options.html:1)** & **[`options.js`](options.js:1)**: Provide a user interface for inputting and saving the ChatGPT API key using `chrome.storage`.
*   **[`popup.html`](popup.html:1)** & **[`popup.js`](popup.js:1)** (Optional): Can be used for status display or manual triggers.

## Setup

1.  Clone or download this repository.
2.  Open Chrome and navigate to `chrome://extensions`.
3.  Enable "Developer mode" (usually a toggle in the top right).
4.  Click "Load unpacked" and select the directory where you cloned/downloaded the extension.
5.  Once loaded, click on the extension icon (or find it in the extensions menu) and go to "Options".
6.  Enter your ChatGPT API key and save it.

The extension will now be active and will attempt to automate posts when you are on the Opus Clip auto-post calendar page and a scheduling modal is open.
