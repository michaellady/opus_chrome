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
  <textarea id="boilerplate"></textarea>
  <button id="save"></button>
  <div id="status"></div>
`;

require('./options.js');

describe('Boilerplate Option', () => {
  beforeEach(() => {
    mockStorage.boilerplate = 'Initial boilerplate';
    document.getElementById('boilerplate').value = '';
    document.getElementById('status').textContent = '';
  });

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
