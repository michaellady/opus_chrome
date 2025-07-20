// background.test.js
// Jest unit tests for background.js functionality

// Mock fetch globally
global.fetch = jest.fn();

// Mock chrome APIs
const mockStorage = {};
global.chrome = {
  storage: {
    sync: {
      get: jest.fn((keys, cb) => {
        if (typeof keys === 'string') keys = [keys];
        const result = {};
        if (Array.isArray(keys)) {
          for (const key of keys) {
            result[key] = mockStorage[key] || '';
          }
        } else if (typeof keys === 'object') {
          // Handle default values object
          Object.assign(result, keys); // Set defaults first
          for (const key in keys) {
            if (mockStorage[key] !== undefined) {
              result[key] = mockStorage[key]; // Override with stored values
            }
          }
        }
        cb(result);
      }),
      set: jest.fn((items, cb) => {
        Object.assign(mockStorage, items);
        if (cb) cb();
      })
    }
  },
  runtime: { 
    lastError: null,
    onInstalled: {
      addListener: jest.fn()
    },
    onMessage: {
      addListener: jest.fn()
    }
  }
};

// Mock console.log to suppress output during tests
global.console = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Define getChatGPTResponse function for testing (extracted from background.js)
async function getChatGPTResponse(caption, apiKey, selectedModel) {
  const examples = `
- Lose by Leglock this weekend at ADCC? This game can help!
- Lose by Back Take this weekend at ADCC? This game can help!
- Struggle with Deep Half? This game can help!
- Getting dominated by underhooks?
- Lose by advantage this weekend in LA? This game and concepts can help!
- Stuck in side control?
- Struggling to take the back? This game can help!
- Struggling with class structure? This concept can help!
- Struggle with getting your back taken?
- Trouble finishing takedowns?
- Hard time hand fighting? This game can help!
- Don't know how to set up takedowns? Circling can help!
- Hold your partner down as long as possible!
- Can't get out of side control? Learn how to increase your mobility!
- Keep Getting Caught With The Same Dumb Stuff?
- Keep Losing Leg Lock Positioning?
- Uncertain About What the Goals of Jiu-Jitsu Are?
- Can't Submit Anybody in Jiu-Jitsu? Play this game!
- Injured? Train to minimize risk of injury with @sandboxbjj
- Honestly evaluating injury risk in Jiu-Jitsu
- Why 6am Jiu-Jitsu is the best
- Hard time in Deep Half? Just spend time there!
- Struggle submitting your friends?
- Hard time with Headquarters? This game can help!
- Trouble with leg lock shootouts? This concept can help you stay safe!
- Wrestling too confusing? Here's a simple way to think about it!
- Snapdowns not snapping? Here's a way to improve them!
- Uncertain about how Jiu-Jitsu works? Here's the basic positions!
- Struggle with pressure passing? Tackle pass can help!
- Hard time hand fighting? Dominate with one simple trick!
- Hard time getting mounted? Use the trap and roll!
- Don't know what to do when wrestling? This game can help!
- Trouble finishing straight ankle locks? Try this game to increase your finishing rate!
- Getting sprawled on? Use what Wyatt Hendrickson did to beat Gable Steveson with the knee pound!
- Wrestling too confusing? Push, circle, snap, and two-on-ones are all you need to dominate! Here's how to simplify your wrestling game.
- Can't maintain Cross-Ashi? Play this game to improve your control!
- Feel too amped up after training? Try taking one minute of meditation to "come down" and rest.
- Tired of getting sprawled on? Use this game to improve finishing your shots!
- Embrace the "gray area", the "messy middle" where things don't go perfectly but you still have to fight to attain and maintain postion.
- Having a hard time getting to cross-ashi? Try playing this game!
- Suck at Rubber Guard? Play this game to maintain the position better!
- Suck at finishing from Rubber Guard? Play this game to work on your subs!
- …And he didn't even drill this once…
- Suck at escaping pins? This easy concept will change everything!
- Suck at escaping kneebars? This easy game will change everything! How to Escape Kneebars
- Suck at half guard? This simple game will change everything! How to attain Rollie Pollie half guard posture
- Suck at off balancing? This simple game will change everything! How to off balance from Half Guard
- Suck at being heavy? Don't touch the mat!
- Suck at knee cut passing like I do? This game can help!
- Stuck in the worst case scenario mount? Face your fears with this game!
- Don't want to get brain damage? Want to see how your Jiu-Jitsu guard holds up with strikes safely? Play "don't touch my face"!
- Suck at off-balancing your opponent? Play this half guard game!
- Hate Front Headlock? Let's spend time there with this game!
- Suck at escaping Kimuras? This one is for you!
`;

  const prompt = `Transform the following BJJ video caption into a single, provocative, challenging question aimed at unskilled BJJ white and blue belts. The question MUST be a maximum of 100 characters. Ensure all instances of 'jiu-jitsu', 'jujitsu', and their case variations are replaced with 'BJJ'. The question should be concise, engaging, and in a similar style and tone to the examples provided below.

Examples of desired style and tone:
${examples}

Now, transform this caption: "${caption}"`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 50,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: "Unknown API error from OpenAI" } }));
      return { error: `ChatGPT API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}` };
    }

    const responseData = await response.json();
    let transformedText = responseData.choices?.[0]?.message?.content;

    if (transformedText) {
      transformedText = transformedText.trim();
      // Ensure "BJJ" replacement one last time locally if API missed any (though prompt should handle it)
      transformedText = transformedText.replace(/jiu-jitsu/gi, 'BJJ').replace(/jujitsu/gi, 'BJJ');
      return { transformed: transformedText };
    } else {
      return { error: "Received no content from ChatGPT." };
    }
  } catch (error) {
    return { error: `Network or other error calling API: ${error.message}` };
  }
}

// Create a mock message handler to simulate the actual behavior
function createMessageHandler() {
  return function(request, sender, sendResponse) {
    if (request.action === "transformCaption" || request.action === "regenerateCaption") {
      // Retrieve API key and selected model
      chrome.storage.sync.get(['chatGPTApiKey', 'chatGPTModel'], async (storageData) => {
        if (chrome.runtime.lastError) {
          sendResponse({ error: "Failed to retrieve settings." });
          return;
        }
        const apiKey = storageData.chatGPTApiKey;
        const selectedModel = storageData.chatGPTModel || 'gpt-4.1-2025-04-14';

        if (!apiKey) {
          sendResponse({ error: "API Key not set. Please set it in the extension options." });
          return;
        }
        
        const captionToProcess = request.caption || request.originalCaption;

        if (!captionToProcess) {
          sendResponse({ error: "No caption provided."});
          return;
        }

        const result = await getChatGPTResponse(captionToProcess, apiKey, selectedModel);

        if (result.error) {
          sendResponse({ error: result.error });
        } else {
          // Fetch boilerplate from chrome.storage.sync
          chrome.storage.sync.get({
            boilerplate: `FOLLOW @mikelady to learn how I help busy professionals become semi-pro at BJJ.\n\nComment "sandbox" below to see how this game fits into the bigger picture in my @sandboxbjj course + community\n📸 @vthehoneybadger\n#bjj #grappling #submissiongrappling #jiujitsu #adcc`
          }, function(items) {
            const boilerplate = items.boilerplate.replace(/Jiu-Jitsu/gi, 'BJJ').replace(/Jujitsu/gi, 'BJJ');
            sendResponse({
              transformed: result.transformed,
              boilerplate: boilerplate.trim()
            });
          });
        }
      });
      return true; // Crucial for asynchronous sendResponse
    }
  };
}

describe('Background Script', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.chrome.runtime.lastError = null;
    // Clear mock storage
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    // Reset fetch mock
    global.fetch.mockClear();
  });

  describe('getChatGPTResponse', () => {
    const mockApiKey = 'test-api-key';
    const mockModel = 'gpt-4o';
    const mockCaption = 'Test BJJ caption about jiu-jitsu techniques';

    test('should make successful API call and return transformed text', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Struggling with BJJ techniques? This game can help!'
          }
        }]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await getChatGPTResponse(mockCaption, mockApiKey, mockModel);

      expect(global.fetch).toHaveBeenCalledWith('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockApiKey}`
        },
        body: expect.stringContaining(mockCaption)
      });

      expect(result).toEqual({
        transformed: 'Struggling with BJJ techniques? This game can help!'
      });
    });

    test('should replace jiu-jitsu variations with BJJ in response', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Struggling with Jiu-Jitsu and jujitsu? This game can help!'
          }
        }]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await getChatGPTResponse(mockCaption, mockApiKey, mockModel);

      expect(result.transformed).toBe('Struggling with BJJ and BJJ? This game can help!');
    });

    test('should handle API error responses', async () => {
      const mockErrorResponse = {
        error: { message: 'API quota exceeded' }
      };

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () => Promise.resolve(mockErrorResponse)
      });

      const result = await getChatGPTResponse(mockCaption, mockApiKey, mockModel);

      expect(result).toEqual({
        error: 'ChatGPT API Error: 429 - API quota exceeded'
      });
    });

    test('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getChatGPTResponse(mockCaption, mockApiKey, mockModel);

      expect(result).toEqual({
        error: 'Network or other error calling API: Network error'
      });
    });

    test('should handle empty response content', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: ''
          }
        }]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await getChatGPTResponse(mockCaption, mockApiKey, mockModel);

      expect(result).toEqual({
        error: 'Received no content from ChatGPT.'
      });
    });

    test('should handle malformed API response', async () => {
      const mockResponse = { choices: [] };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await getChatGPTResponse(mockCaption, mockApiKey, mockModel);

      expect(result).toEqual({
        error: 'Received no content from ChatGPT.'
      });
    });
  });

  describe('onMessage handler', () => {
    let messageHandler;

    beforeEach(() => {
      messageHandler = createMessageHandler();
    });

    test('should handle transformCaption action successfully', (done) => {
      // Set up mock storage with API key and model
      mockStorage.chatGPTApiKey = 'test-api-key';
      mockStorage.chatGPTModel = 'gpt-4o';
      mockStorage.boilerplate = 'Test boilerplate text';

      // Mock successful API response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: { content: 'Transformed text' }
          }]
        })
      });

      const mockRequest = {
        action: 'transformCaption',
        caption: 'Test caption'
      };

      const mockSender = {};
      const mockSendResponse = jest.fn((response) => {
        expect(response).toEqual({
          transformed: 'Transformed text',
          boilerplate: 'Test boilerplate text'
        });
        done();
      });

      // Call the message handler
      const result = messageHandler(mockRequest, mockSender, mockSendResponse);
      expect(result).toBe(true); // Should return true for async response
    });

    test('should handle missing API key', (done) => {
      // Don't set API key in mock storage
      mockStorage.chatGPTModel = 'gpt-4o';

      const mockRequest = {
        action: 'transformCaption',
        caption: 'Test caption'
      };

      const mockSendResponse = jest.fn((response) => {
        expect(response).toEqual({
          error: 'API Key not set. Please set it in the extension options.'
        });
        done();
      });

      messageHandler(mockRequest, {}, mockSendResponse);
    });

    test('should handle missing caption', (done) => {
      mockStorage.chatGPTApiKey = 'test-api-key';
      mockStorage.chatGPTModel = 'gpt-4o';

      const mockRequest = {
        action: 'transformCaption'
        // No caption provided
      };

      const mockSendResponse = jest.fn((response) => {
        expect(response).toEqual({
          error: 'No caption provided.'
        });
        done();
      });

      messageHandler(mockRequest, {}, mockSendResponse);
    });

    test('should handle regenerateCaption action', (done) => {
      mockStorage.chatGPTApiKey = 'test-api-key';
      mockStorage.chatGPTModel = 'gpt-4o';
      mockStorage.boilerplate = 'Test boilerplate';

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: { content: 'Regenerated text' }
          }]
        })
      });

      const mockRequest = {
        action: 'regenerateCaption',
        caption: 'Original caption'
      };

      const mockSendResponse = jest.fn((response) => {
        expect(response).toEqual({
          transformed: 'Regenerated text',
          boilerplate: 'Test boilerplate'
        });
        done();
      });

      messageHandler(mockRequest, {}, mockSendResponse);
    });

    test('should handle storage read errors', (done) => {
      // Mock storage error
      chrome.runtime.lastError = { message: 'Storage read failed' };

      const mockRequest = {
        action: 'transformCaption',
        caption: 'Test caption'
      };

      const mockSendResponse = jest.fn((response) => {
        expect(response).toEqual({
          error: 'Failed to retrieve settings.'
        });
        done();
      });

      messageHandler(mockRequest, {}, mockSendResponse);
    });

    test('should use default model when not set', (done) => {
      mockStorage.chatGPTApiKey = 'test-api-key';
      // Don't set chatGPTModel

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: { content: 'Response with default model' }
          }]
        })
      });

      const mockRequest = {
        action: 'transformCaption',
        caption: 'Test caption'
      };

      const mockSendResponse = jest.fn((response) => {
        expect(response.transformed).toBe('Response with default model');
        // Verify the default model was used in the fetch call
        const fetchCall = global.fetch.mock.calls[0];
        const body = JSON.parse(fetchCall[1].body);
        expect(body.model).toBe('gpt-4.1-2025-04-14');
        done();
      });

      messageHandler(mockRequest, {}, mockSendResponse);
    });
  });
});