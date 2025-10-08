// popup.js (Manifest V3)
// ------------------------------------------------------------------

let button_send_json = document.getElementById('button_send_json');

button_send_json.onclick = function (element) {
    // We use async/await for modern V3 APIs
    chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
        await fill_form_now(tabs[0]);
    });
};

/**
 * Executes the autofill process:
 * 1. Saves JSON data to storage.
 * 2. Injects the content script (inject.js) using the V3 Scripting API.
 * 3. Sends a message to the injected script to start autofilling.
 */
async function fill_form_now(tab) {
    const json_data = document.getElementById("json").value;
    
    // 1. Save JSON to storage using an awaitable Promise wrapper
    await new Promise((resolve) => {
        chrome.storage.local.set({ fill_form_json: json_data }, resolve);
    });

    // 2. Execute the 'inject.js' content script using the V3 Scripting API.
    try {
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['inject.js'] // The file to inject
        });

        // 3. Send the message to the injected script to run the autofill logic
        chrome.tabs.sendMessage(tab.id, { method: 'fill_form_now' }, function (response) {
             // You can add error checking here for the message response if needed
             return true; 
        });

    } catch (e) {
        console.error("Scripting injection failed:", e);
    }
}