// popup.js - v2 (Manifest V3, new Form III portal)
// ------------------------------------------------------------------

const jsonBox = document.getElementById('json');
const photoInput = document.getElementById('photo');
const photoName = document.getElementById('photo_name');
const statusBox = document.getElementById('status');

// The popup closes whenever you click on the page, so the JSON and photo
// are kept in storage and reloaded each time the popup opens.
chrome.storage.local.get(['fill_form_json', 'fill_form_photo'], (s) => {
    if (s.fill_form_json) jsonBox.value = s.fill_form_json;
    if (s.fill_form_photo) photoName.textContent = 'Photo: ' + s.fill_form_photo.name;
});

jsonBox.addEventListener('input', () => {
    chrome.storage.local.set({ fill_form_json: jsonBox.value });
});

photoInput.addEventListener('change', () => {
    const file = photoInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        const photo = { name: file.name, dataUrl: reader.result };
        chrome.storage.local.set({ fill_form_photo: photo });
        photoName.textContent = 'Photo: ' + file.name;
    };
    reader.readAsDataURL(file);
});

document.getElementById('button_clear').onclick = () => {
    chrome.storage.local.remove(['fill_form_json', 'fill_form_photo']);
    jsonBox.value = '';
    photoInput.value = '';
    photoName.textContent = '';
    statusBox.textContent = '';
};

document.getElementById('button_send_json').onclick = async () => {
    let data;
    try {
        data = JSON.parse(jsonBox.value);
    } catch (e) {
        show('JSON error: ' + e.message, true);
        return;
    }
    chrome.storage.local.set({ fill_form_json: jsonBox.value });

    const { fill_form_photo: photo } = await chrome.storage.local.get('fill_form_photo');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    show('Filling...');
    try {
        await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['inject.js'] });
        const [res] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (d, p) => window.formIIIFill(d, p),
            args: [data, photo || null]
        });
        const r = res.result;
        let msg = 'Filled: ' + r.filled.length;
        if (r.skipped.length) msg += '\nOn next step: ' + r.skipped.join(', ');
        if (r.failed.length) msg += '\nCheck by hand:\n- ' + r.failed.join('\n- ');
        show(msg, r.failed.length > 0);
    } catch (e) {
        show('Could not fill this page: ' + e.message, true);
    }
};

function show(text, isError) {
    statusBox.textContent = text;
    statusBox.style.color = isError ? '#b00020' : '#006600';
}
