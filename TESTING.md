# Testing Guide

This Chrome extension now has comprehensive unit tests covering all core functionality.

## Running Tests

### Prerequisites
- Node.js installed
- Jest testing framework (already installed as dev dependency)

### Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npx jest background.test.js
npx jest content.test.js
npx jest options.test.js

# Run tests with verbose output
npx jest --verbose
```

## Test Coverage

### Background Script (`background.test.js`) - 12 tests
- **getChatGPTResponse function**: Tests API calls, response processing, text transformations (jiu-jitsu -> BJJ), error handling
- **onMessage handler**: Tests message processing for `transformCaption` and `regenerateCaption` actions
- **Error scenarios**: Missing API key, network failures, malformed responses, storage errors

### Content Script (`content.test.js`) - 24 tests  
- **getPlatformFromSVG**: Platform detection for Instagram, Facebook, YouTube, TikTok, Twitter/X
- **extractSourceCaption**: Caption extraction from Instagram draft editors with fallback mechanisms
- **populateFields**: Field population logic for different social media platforms
- **Chrome runtime integration**: Message passing between content and background scripts
- **Error handling**: Missing elements, invalid DOM structures, edge cases

### Options Script (`options.test.js`) - 11 tests
- **save_options function**: Settings persistence, error handling, status message display
- **restore_options function**: Settings loading, default values, storage error handling  
- **Form validation**: Edge cases with empty fields, special characters, very long text

## Test Structure

All tests follow Jest conventions and include:
- Proper mocking of Chrome APIs (`chrome.storage`, `chrome.runtime`)
- DOM manipulation testing with JSDOM environment
- Async operation testing with proper callbacks/promises
- Error boundary testing for robustness
- Edge case coverage for real-world scenarios

## Mock Coverage

Tests properly mock:
- Chrome Extension APIs (storage, runtime, messaging)
- Fetch API for OpenAI calls
- DOM methods and querySelector operations
- Console output to keep test output clean

## Continuous Integration

These tests can be easily integrated into CI/CD pipelines and provide confidence in:
- Code functionality across different scenarios
- Error handling and edge cases
- Chrome API integration
- Cross-platform compatibility