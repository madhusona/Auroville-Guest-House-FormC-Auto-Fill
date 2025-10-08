

# 🇮🇳 Auroville Guest House FormC Auto Fill

**A Google Chrome Extension designed for the Auroville Foundation to simplify and automate the mandatory online FRRO Form C submission for foreign guests.**

This tool significantly reduces the manual effort and potential errors associated with entering guest details into the official Indian Foreigners Regional Registration Office (FRRO) portal.

## ✨ Key Features

  * **Manifest V3 Compliant:** Built on the latest, most secure version of the Chrome extension platform.
  * **Secure & Local Data Handling:** Guest data is pasted by the user and transferred via local browser storage (`chrome.storage.local`). **No guest information leaves the user's browser or is transmitted over the internet by this extension.**
  * **Targeted Autofill:** Optimized specifically to identify and populate the fields on the official Indian FRRO Form C portal.
  * **Minimalist Interface:** A simple popup focused solely on the "Paste JSON and Fill" task.

## 🛠️ Installation & Setup (Developer Mode)

Since this is a specialized, internal tool, the easiest way to deploy it is via Chrome's Developer Mode.

1.  **Download the Code:**

      * Click the green **`< > Code`** button at the top of the GitHub repository.
      * Select **"Download ZIP"** and extract the contents to a folder on your computer (e.g., `~/Documents/AGH-FormC Autofill`).

2.  **Load the Extension in Chrome:**

      * Open your Chrome browser and navigate to `chrome://extensions`.
      * In the top-right corner, ensure **Developer mode** is toggled **ON**.
      * Click the **"Load unpacked"** button.
      * Navigate to and select the extracted extension folder (`AGH-FormC Autofill`).

3.  **Pin the Extension:**

      * Click the puzzle piece icon ($\puzzle$) next to your profile picture in Chrome.
      * Find **"Auroville Guest House FormC Auto Fill"** and click the pin icon ($\pin$) to keep it visible on your toolbar.

## 🚀 Usage

1.  **Prepare Data:** Obtain the standardized JSON data for the foreign guest (e.g., from the internal Auroville JSON generator).
2.  **Open Form C:** Navigate to the specific registration page on `https://www.indianfrro.gov.in/*`.
3.  **Activate Extension:** Click the **Auroville Form C** icon ($\icon$ or $\icon{32}$ based on your icon).
4.  **Paste & Click:**
      * Paste the JSON data into the text box.
      * Click the **"FILL FORM NOW"** button.

The extension will inject the data into the active Form C webpage fields.

## 📁 Project Structure

This extension uses a clean Manifest V3 structure:

```
/Auroville_FormC_Autofill/
├── manifest.json       <-- Extension Blueprint (Manifest V3)
├── popup.html          <-- The UI for pasting JSON
├── popup.js            <-- Handles button click, saves JSON, and injects script
├── inject.js           <-- The Content Script with the actual autofill logic
└── /icons/             <-- Directory for all required icon sizes
```

## 📞 Support & Contact

This tool is maintained by the Auroville Foundation IT team.

For support, inquiries, or bug reports, please contact:

> madusudhanan\_avf@auroville.org.in

-----