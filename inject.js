// inject.js - v2 (new Form III portal, Angular Material)
// Defines window.formIIIFill(data, photo) in the extension's isolated world.
// popup.js injects this file, then calls the function with the guest JSON.
// ------------------------------------------------------------------

(() => {
    if (window.formIIIFill) return;

    // Old Form C keys -> new Form III keys, so old JSON still partly works.
    const ALIASES = {
        applicant_givenname: 'given_name',
        applicant_surname: 'surname',
        applicant_sex: 'gender',
        applicant_nationality: 'nationality',
        applicant_dob: 'dob',
        applicant_contactnoinindia: 'phnnuminind',
        applicant_mcontactnoinindia: 'phnnuminind',
        applicant_email: 'emailId',
        applicant_remark: 'remark',
        applicant_passpno: 'passnum',
        applicant_visano: 'visanum',
        applicant_visatype: 'visatype',
        applicant_visa_subtype_code: 'visasubtype',
        applicant_arrivedfromplace: 'arrivedFromPlace',
        applicant_doarrivalhotel: 'dateOfArrivalInHotel',
        applicant_timeoarrivalhotel: 'timeOfArrivalInHotel',
        applicant_purpovisit: 'purposeOfVisit',
        applicant_intnddurhotel: 'durationofstay',
        applicant_special_category: 'spl_category_code'
    };

    // Dropdowns, in the order they must be set (subtype loads after visa type).
    const SELECTS = ['gender', 'nationality', 'spl_category_code', 'visatype', 'visasubtype', 'purposeOfVisit'];

    // Calculated by the site - never touch.
    const SKIP = ['expectedCheckoutDate'];

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const norm = (s) => String(s).trim().toUpperCase().replace(/\s+/g, ' ');

    // Is the element on the step that is currently shown?
    function onVisibleStep(el) {
        const panel = el.closest('.mat-horizontal-stepper-content');
        return !panel || panel.getAttribute('aria-expanded') === 'true';
    }

    function fire(el, type) {
        el.dispatchEvent(new Event(type, { bubbles: true }));
    }

    function setText(el, value) {
        el.removeAttribute('readonly');
        el.value = value;
        fire(el, 'input');
        fire(el, 'change');
        fire(el, 'blur');
    }

    function closePanel(el) {
        el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
        const backdrop = document.querySelector('.cdk-overlay-backdrop');
        if (backdrop) backdrop.click();
    }

    async function setSelect(el, value) {
        const wanted = norm(value);
        const current = el.querySelector('.mat-select-value-text');
        if (current && norm(current.textContent) === wanted) return 'ok';

        (el.querySelector('.mat-select-trigger') || el).click();

        let opts = [];
        for (let i = 0; i < 30; i++) {            // wait up to 3 s for the list
            await sleep(100);
            opts = Array.from(document.querySelectorAll('.cdk-overlay-container mat-option'));
            if (opts.length) break;
        }
        if (!opts.length) { closePanel(el); return 'no options'; }

        const text = (o) => norm(o.textContent);
        const opt = opts.find((o) => text(o) === wanted)
            || opts.find((o) => text(o).startsWith(wanted))
            || opts.find((o) => text(o).includes(wanted));

        if (!opt) { closePanel(el); return 'no match for "' + value + '"'; }

        opt.scrollIntoView({ block: 'nearest' });
        opt.click();
        await sleep(400);
        return 'ok';
    }

    function setPhoto(photo) {
        const input = document.getElementById('imageUpload');
        if (!input) return 'upload box not found';
        const [meta, b64] = photo.dataUrl.split(',');
        const type = (meta.match(/data:(.*?);/) || [])[1] || 'image/jpeg';
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        const file = new File([bytes], photo.name || 'photo.jpg', { type });
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        fire(input, 'change');
        return 'ok';
    }

    window.formIIIFill = async function (raw, photo) {
        // Normalise keys (new keys win over old aliases).
        const data = {};
        const entries = Object.entries(raw).filter(([, v]) => v !== null && v !== undefined && v !== '');
        for (const [k, v] of entries) {
            if (!(k in ALIASES)) data[k] = String(v);
        }
        for (const [k, v] of entries) {
            const key = ALIASES[k];
            if (key && !(key in data)) data[key] = String(v);
        }

        const report = { filled: [], skipped: [], failed: [] };

        // 1. Text, date and time fields (all steps - harmless to refill).
        for (const [key, value] of Object.entries(data)) {
            if (SELECTS.includes(key) || SKIP.includes(key)) continue;
            const el = document.querySelector('input[formcontrolname="' + key + '"], textarea[formcontrolname="' + key + '"]');
            if (!el) continue;
            if (el.disabled) continue;
            setText(el, value);
            report.filled.push(key);
        }

        // 2. Dropdowns - only on the step that is showing.
        for (const key of SELECTS) {
            if (!(key in data)) continue;
            const el = document.querySelector('mat-select[formcontrolname="' + key + '"]');
            if (!el) continue;
            if (!onVisibleStep(el)) { report.skipped.push(key); continue; }
            const res = await setSelect(el, data[key]);
            if (res === 'ok') report.filled.push(key);
            else report.failed.push(key + ': ' + res);
            if (key === 'visatype') await sleep(800);   // let subtypes load
        }

        // 3. Photo - only when the Photo Upload step is showing.
        const upload = document.getElementById('imageUpload');
        if (photo && upload && onVisibleStep(upload)) {
            const res = setPhoto(photo);
            if (res === 'ok') report.filled.push('photo');
            else report.failed.push('photo: ' + res);
        }

        return report;
    };
})();
