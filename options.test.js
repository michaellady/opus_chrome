// options.test.js
// Jest test for boilerplate configurability in options.js

// Mock chrome.storage.sync
const mockStorage = {};
global.chrome = {
  storage: {
    sync: {
      get: jest.fn((keys, cb) => {
        if (typeof keys === 'string') keys = [keys];
        const result = {};
        for (const key in keys) {
          result[keys[key]] = mockStorage[keys[key]] || '';
        }
        if (typeof keys === 'object' && !Array.isArray(keys)) {
          Object.assign(result, keys);
        }
        cb(result);
      }),
      set: jest.fn((items, cb) => {
        Object.assign(mockStorage, items);
        if (cb) cb();
      })
    }
  },
  runtime: { lastError: null }
};

document.body.innerHTML = `
  <input type="password" id="apiKey" />
  <select id="chatGPTModel"><option value="gpt-4o"></option></select>
  <textarea id="boilerplate"></textarea>
  <button id="save"></button>
  <div id="status"></div>
`;

require('./options.js');

describe('Options Script', () => {
  beforeEach(() => {
    // Clear mock storage
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    // Reset form fields
    document.getElementById('apiKey').value = '';
    document.getElementById('chatGPTModel').value = 'gpt-4o';
    document.getElementById('boilerplate').value = '';
    document.getElementById('status').textContent = '';
    document.getElementById('status').className = '';
    // Reset runtime error
    chrome.runtime.lastError = null;
    // Clear mock calls
    jest.clearAllMocks();
  });

  describe('save_options function', () => {
    test('should save all settings to storage successfully', (done) => {
      // Set form values
      document.getElementById('apiKey').value = 'test-api-key-123';
      document.getElementById('chatGPTModel').value = 'gpt-4o';
      document.getElementById('boilerplate').value = 'Test boilerplate text';

      // Click save button
      document.getElementById('save').click();

      setTimeout(() => {
        // Verify storage was called with correct values
        expect(chrome.storage.sync.set).toHaveBeenCalledWith({
          chatGPTApiKey: 'test-api-key-123',
          chatGPTModel: 'gpt-4o',
          boilerplate: 'Test boilerplate text'
        }, expect.any(Function));

        // Verify success status
        expect(document.getElementById('status').textContent).toBe('Settings saved.');
        expect(document.getElementById('status').className).toBe('success');
        done();
      }, 10);
    });

    test('should handle storage save errors', (done) => {
      chrome.runtime.lastError = { message: 'Storage quota exceeded' };
      
      document.getElementById('apiKey').value = 'test-key';
      document.getElementById('save').click();

      setTimeout(() => {
        expect(document.getElementById('status').textContent).toBe('Error saving settings: Storage quota exceeded');
        expect(document.getElementById('status').className).toBe('error');
        done();
      }, 10);
    });

    test('should clear status message after timeout', (done) => {
      document.getElementById('apiKey').value = 'test-key';
      document.getElementById('save').click();

      setTimeout(() => {
        // Status should be cleared after 2 seconds
        expect(document.getElementById('status').textContent).toBe('');
        expect(document.getElementById('status').className).toBe('');
        done();
      }, 2100); // Wait just over 2 seconds
    });
  });

  describe('restore_options function', () => {
    test('should load all settings from storage', (done) => {
      chrome.storage.sync.get.mockImplementationOnce((defaults, cb) => {
        cb({
          chatGPTApiKey: 'restored-api-key',
          chatGPTModel: 'gpt-4o',
          boilerplate: 'Restored boilerplate text'
        });
      });

      document.dispatchEvent(new Event('DOMContentLoaded'));

      setTimeout(() => {
        expect(document.getElementById('apiKey').value).toBe('restored-api-key');
        expect(document.getElementById('chatGPTModel').value).toBe('gpt-4o');
        expect(document.getElementById('boilerplate').value).toBe('Restored boilerplate text');
        done();
      }, 10);
    });

    test('should use default values when storage is empty', (done) => {
      chrome.storage.sync.get.mockImplementationOnce((defaults, cb) => {
        // Return defaults (empty storage)
        cb(defaults);
      });

      document.dispatchEvent(new Event('DOMContentLoaded'));

      setTimeout(() => {
        expect(document.getElementById('apiKey').value).toBe('');
        expect(document.getElementById('chatGPTModel').value).toBe('gpt-4o');
        expect(document.getElementById('boilerplate').value).toContain('FOLLOW @mikelady');
        done();
      }, 10);
    });

    test('should handle storage read errors', (done) => {
      chrome.runtime.lastError = { message: 'Storage read failed' };
      
      chrome.storage.sync.get.mockImplementationOnce((defaults, cb) => {
        cb(null);
      });

      document.dispatchEvent(new Event('DOMContentLoaded'));

      setTimeout(() => {
        expect(document.getElementById('status').textContent).toBe('Error loading settings: Storage read failed');
        expect(document.getElementById('status').className).toBe('error');
        done();
      }, 10);
    });
  });

  describe('Legacy tests (boilerplate specific)', () => {
    test('loads boilerplate from storage', done => {
      // Simulate restore_options
      chrome.storage.sync.get.mockImplementationOnce((defaults, cb) => {
        cb({ boilerplate: 'Loaded from storage' });
      });
      document.dispatchEvent(new Event('DOMContentLoaded'));
      setTimeout(() => {
        expect(document.getElementById('boilerplate').value).toBe('Loaded from storage');
        done();
      }, 10);
    });

    test('saves boilerplate to storage', done => {
      document.getElementById('boilerplate').value = 'New boilerplate';
      document.getElementById('save').click();
      setTimeout(() => {
        expect(mockStorage.boilerplate).toBe('New boilerplate');
        done();
      }, 10);
    });
  });

  describe('Form validation and edge cases', () => {
    test('should handle empty API key', (done) => {
      document.getElementById('apiKey').value = '';
      document.getElementById('save').click();

      setTimeout(() => {
        expect(mockStorage.chatGPTApiKey).toBe('');
        expect(document.getElementById('status').textContent).toBe('Settings saved.');
        done();
      }, 10);
    });

    test('should handle very long boilerplate text', (done) => {
      const longText = 'A'.repeat(10000);
      document.getElementById('boilerplate').value = longText;
      document.getElementById('save').click();

      setTimeout(() => {
        expect(mockStorage.boilerplate).toBe(longText);
        done();
      }, 10);
    });

    test('should handle special characters in all fields', (done) => {
      document.getElementById('apiKey').value = 'key-with-special!@#$%^&*()_+';
      document.getElementById('boilerplate').value = 'Text with emojis 🥋🔥 and special chars ñáéíóú';
      document.getElementById('save').click();

      setTimeout(() => {
        expect(mockStorage.chatGPTApiKey).toBe('key-with-special!@#$%^&*()_+');
        expect(mockStorage.boilerplate).toBe('Text with emojis 🥋🔥 and special chars ñáéíóú');
        done();
      }, 10);
    });
  });
});
