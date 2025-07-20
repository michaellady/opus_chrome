chrome.runtime.onInstalled.addListener(() => {
  console.log('Opus Clip BJJ Post Automator installed.');
  // You could set a default (empty) API key here if needed,
  // but options.js already handles defaulting to an empty string on load.
  // chrome.storage.sync.get('chatGPTApiKey', (data) => {
  //   if (typeof data.chatGPTApiKey === 'undefined') {
  //     chrome.storage.sync.set({ chatGPTApiKey: '' });
  //   }
  // });
});

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
- ...And he didn't even drill this once...
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
  console.log(`Sending prompt to ${selectedModel}. Caption: ${caption.substring(0,50)}...`);

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
      console.error('ChatGPT API Error:', response.status, errorData);
      return { error: `ChatGPT API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}` };
    }

    const responseData = await response.json();
    let transformedText = responseData.choices?.[0]?.message?.content;

    if (transformedText) {
      transformedText = transformedText.trim();
      // Ensure "BJJ" replacement one last time locally if API missed any (though prompt should handle it)
      transformedText = transformedText.replace(/jiu-jitsu/gi, 'BJJ').replace(/jujitsu/gi, 'BJJ');
      console.log("Transformed text from ChatGPT:", transformedText);
      return { transformed: transformedText };
    } else {
      console.error("No content in ChatGPT response:", responseData);
      return { error: "Received no content from ChatGPT." };
    }
  } catch (error) {
    console.error('Error calling ChatGPT API:', error);
    return { error: `Network or other error calling API: ${error.message}` };
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "transformCaption" || request.action === "regenerateCaption") {
    // Retrieve API key, selected model, and boilerplate
    chrome.storage.sync.get(['chatGPTApiKey', 'chatGPTModel', 'postBoilerplate'], async (storageData) => {
      if (chrome.runtime.lastError) {
        console.error("Error retrieving settings from chrome.storage:", chrome.runtime.lastError.message);
        sendResponse({ error: "Failed to retrieve settings." });
        return; // Exit if storage read fails
      }
      const apiKey = storageData.chatGPTApiKey;
      const selectedModel = storageData.chatGPTModel || 'gpt-4.1-2025-04-14'; // Default if not set, updated to gpt-4.1-2025-04-14
      const boilerplate = storageData.postBoilerplate || `FOLLOW @mikelady to learn how I help busy professionals become semi-pro at BJJ.

Comment "sandbox" below to see how this game fits into the bigger picture in my @sandboxbjj course + community
📸 @vthavillain
#bjj #grappling #submissiongrappling #jiujitsu #adcc`; // Default boilerplate if not set

      if (!apiKey) {
        console.error("API Key not set in storage.");
        sendResponse({ error: "API Key not set. Please set it in the extension options." });
        return; // Exit if no API key
      }
      
      console.log(`Action: ${request.action}. Using API Key (first 5 chars): ${apiKey.substring(0,5)}, Model: ${selectedModel}`);
      const captionToProcess = request.caption || request.originalCaption; // Use originalCaption for regenerate

      if (!captionToProcess) {
        console.error("No caption provided for transformation/regeneration.");
        sendResponse({ error: "No caption provided."});
        return;
      }

      const result = await getChatGPTResponse(captionToProcess, apiKey, selectedModel);

      if (result.error) {
        sendResponse({ error: result.error });
      } else {
        // Use the configurable boilerplate and ensure BJJ replacements
        const processedBoilerplate = boilerplate.replace(/Jiu-Jitsu/gi, 'BJJ').replace(/Jujitsu/gi, 'BJJ');

        sendResponse({
          transformed: result.transformed,
          boilerplate: processedBoilerplate.trim()
        });
      }
    });
    return true; // Crucial for asynchronous sendResponse
  }
  // Handle other actions if any in the future
  // else if (request.action === "someOtherAction") { ... }
});

console.log("Background script loaded. v2 (with regenerate logic)");