const processSteps = Array.from(document.querySelectorAll('.process-step'));
const processButtons = Array.from(document.querySelectorAll('.process-content'));

const processObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const activeStep = Number(entry.target.dataset.step);
      processSteps.forEach((step) => {
        const stepIndex = Number(step.dataset.step);
        step.classList.toggle('active', stepIndex <= activeStep);
      });
    });
  },
  { threshold: 0.55 }
);

processSteps.forEach((step) => processObserver.observe(step));

processButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const step = button.closest('.process-step');
    const isExpanded = step.classList.contains('expanded');

    processSteps.forEach((item) => item.classList.remove('expanded'));
    if (!isExpanded) {
      step.classList.add('expanded');
    }
  });
});

const impactSection = document.getElementById('impact');
const impactNumbers = Array.from(document.querySelectorAll('.impact-number'));
let hasAnimated = false;

const runCounters = () => {
  if (hasAnimated) {
    return;
  }
  hasAnimated = true;

  impactNumbers.forEach((item) => {
    const target = Number(item.dataset.count);
    const suffix = target === 100 ? '%' : '+';
    let value = 0;
    const tick = Math.max(1, Math.round(target / 40));

    const interval = window.setInterval(() => {
      value += tick;
      if (value >= target) {
        value = target;
        window.clearInterval(interval);
      }
      item.textContent = `${value}${suffix}`;
    }, 24);
  });
};

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        runCounters();
      }
    });
  },
  { threshold: 0.4 }
);

if (impactSection) {
  counterObserver.observe(impactSection);
}

const faqButtons = Array.from(document.querySelectorAll('.faq-question'));
faqButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    const isOpen = item.classList.contains('open');

    document.querySelectorAll('.faq-item').forEach((faq) => {
      faq.classList.remove('open');
      const question = faq.querySelector('.faq-question');
      question.setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
      item.classList.add('open');
      button.setAttribute('aria-expanded', 'true');
    }
  });
});

const mapElement = document.getElementById('kyrgyzMap');
if (mapElement && window.L) {
  const map = L.map('kyrgyzMap', {
    scrollWheelZoom: false
  }).setView([41.3, 74.6], 7);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const pinIcon = L.divIcon({ className: '', html: '<div class="custom-pin"></div>', iconSize: [18, 18] });
  const hqIcon = L.divIcon({ className: '', html: '<div class="custom-pin hq"></div>', iconSize: [22, 22] });

  L.marker([42.8746, 74.5698], { icon: hqIcon })
    .addTo(map)
    .bindPopup('<strong>Bishkek HQ</strong><br>Aaly Tokombaeva 45/1<br>Current openings: 28');

  L.marker([42.8746, 74.5698], { icon: pinIcon })
    .addTo(map)
    .bindPopup('<strong>Bishkek</strong><br>Current job openings in this region: 28');

  L.marker([40.5138, 72.8161], { icon: pinIcon })
    .addTo(map)
    .bindPopup('<strong>Osh</strong><br>Current job openings in this region: 11');

  L.marker([42.4907, 78.3936], { icon: pinIcon })
    .addTo(map)
    .bindPopup('<strong>Karakol</strong><br>Current job openings in this region: 7');
}

const applyModal = document.getElementById('applyModal');
const applyForm = document.getElementById('applyForm');
const currentLocationSelect = document.getElementById('currentLocation');
const citizenshipSelect = document.getElementById('citizenship');
const phoneCodeSelect = document.getElementById('phoneCode');
const jobCategorySelect = document.getElementById('jobCategory');
const descriptionField = document.getElementById('description');
const resumeAttachmentInput = document.getElementById('resumeAttachment');
const passportAttachmentInput = document.getElementById('passportAttachment');
const resumeAttachmentError = document.getElementById('resumeAttachmentError');
const passportAttachmentError = document.getElementById('passportAttachmentError');
const applyStatus = document.getElementById('applyStatus');
const APPLICATION_ENDPOINT = applyForm?.dataset.endpoint?.trim() || '';
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const ALLOWED_ATTACHMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png'];
const GOOGLE_APPS_SCRIPT_PATTERN = /script\.google(?:usercontent)?\.com/i;

const openApplyButtons = Array.from(document.querySelectorAll('[data-open-apply]'));
const closeApplyElements = Array.from(document.querySelectorAll('[data-close-apply]'));

const toggleApplyModal = (isOpen) => {
  if (!applyModal) {
    return;
  }
  applyModal.classList.toggle('open', isOpen);
  document.body.classList.toggle('modal-open', isOpen);
};

const prefillApplicationForm = (button) => {
  if (!button || !applyForm) {
    return;
  }

  const category = button.dataset.applyCategory;
  const description = button.dataset.applyDescription;

  if (category && jobCategorySelect) {
    jobCategorySelect.value = category;
  }

  if (description && descriptionField && !descriptionField.value.trim()) {
    descriptionField.value = description;
  }
};

openApplyButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    prefillApplicationForm(button);
    toggleApplyModal(true);
  });
});

closeApplyElements.forEach((el) => {
  el.addEventListener('click', () => {
    toggleApplyModal(false);
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    toggleApplyModal(false);
  }
});

const setApplyStatus = (message, type = 'info') => {
  if (!applyStatus) {
    return;
  }
  applyStatus.textContent = message || '';
  applyStatus.hidden = !message;
  applyStatus.dataset.state = message ? type : '';
};

const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();

  reader.onload = () => {
    const result = typeof reader.result === 'string' ? reader.result : '';
    const [, base64 = ''] = result.split(',');
    resolve(base64);
  };

  reader.onerror = () => reject(new Error('Unable to read attachment.'));
  reader.readAsDataURL(file);
});

const buildAttachmentPayload = async (file, label) => ({
  label,
  name: file.name,
  mimeType: file.type || 'application/octet-stream',
  size: file.size,
  base64: await readFileAsBase64(file)
});

const buildApplicationPayload = async () => {
  const resumeFile = resumeAttachmentInput?.files?.[0];
  const passportFile = passportAttachmentInput?.files?.[0];
  const payload = {
    submissionSource: applyForm?.elements?.submissionSource?.value || 'jobsinkyrgyzstan.com',
    submittedAt: new Date().toISOString(),
    fullLegalName: applyForm?.elements?.fullName?.value?.trim() || '',
    currentLocation: currentLocationSelect?.value || '',
    phoneCode: phoneCodeSelect?.value || '',
    phoneNumber: applyForm?.elements?.phoneNumber?.value?.trim() || '',
    fullPhoneNumber: `${phoneCodeSelect?.value || ''} ${applyForm?.elements?.phoneNumber?.value?.trim() || ''}`.trim(),
    email: applyForm?.elements?.email?.value?.trim() || '',
    citizenship: citizenshipSelect?.value || '',
    jobCategory: applyForm?.elements?.jobCategory?.value || '',
    description: applyForm?.elements?.description?.value?.trim() || '',
    attachments: []
  };

  if (resumeFile) {
    payload.attachments.push(await buildAttachmentPayload(resumeFile, 'Resume'));
  }

  if (passportFile) {
    payload.attachments.push(await buildAttachmentPayload(passportFile, 'Documents International Passport'));
  }

  return payload;
};

const sendApplication = async (payload) => {
  if (!APPLICATION_ENDPOINT) {
    throw new Error('Apps Script endpoint is not configured yet. Paste your deployed web app URL into the form data-endpoint attribute in index.html.');
  }

  const requestBody = JSON.stringify(payload);
  const isGoogleAppsScriptEndpoint = GOOGLE_APPS_SCRIPT_PATTERN.test(APPLICATION_ENDPOINT);

  if (isGoogleAppsScriptEndpoint) {
    await fetch(APPLICATION_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: requestBody
    });

    return {
      ok: true,
      accepted: true,
      message: 'Application received. Check your email inbox and Google Drive folder to verify delivery.'
    };
  }

  const response = await fetch(APPLICATION_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: requestBody
  });

  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, ...data };
};

if (applyForm) {
  const setAttachmentError = (input, errorEl, message) => {
    if (!errorEl) {
      return;
    }
    errorEl.textContent = message || '';
    errorEl.hidden = !message;
    if (message) {
      input?.setAttribute('aria-invalid', 'true');
    } else {
      input?.removeAttribute('aria-invalid');
    }
  };

  const validateAttachmentInput = (input, errorEl, fieldLabel) => {
    const file = input?.files?.[0];
    if (!file) {
      setAttachmentError(input, errorEl, '');
      return true;
    }
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_ATTACHMENT_EXTENSIONS.includes(extension)) {
      setAttachmentError(input, errorEl, `${fieldLabel}: unsupported file type. Use PDF, DOC, DOCX, TXT, JPG, JPEG, or PNG.`);
      return false;
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setAttachmentError(input, errorEl, `${fieldLabel}: maximum allowed file size is 5 MB.`);
      return false;
    }
    setAttachmentError(input, errorEl, '');
    return true;
  };

  const validateAttachments = () => {
    const resumeValid = validateAttachmentInput(resumeAttachmentInput, resumeAttachmentError, 'Resume');
    const passportValid = validateAttachmentInput(passportAttachmentInput, passportAttachmentError, 'Documents International Passport');
    return resumeValid && passportValid;
  };

  const updatePhoneCodeWidth = () => {
    if (!phoneCodeSelect) {
      return;
    }

    const wrapper = phoneCodeSelect.closest('.phone-inputs');
    if (!wrapper) {
      return;
    }

    const selectedText = phoneCodeSelect.options[phoneCodeSelect.selectedIndex]?.textContent?.trim() || 'Code';
    const width = Math.max(92, Math.min(150, selectedText.length * 9 + 28));
    wrapper.style.setProperty('--phone-code-width', `${width}px`);
  };

  const syncPhoneCode = (selectEl) => {
    if (!selectEl || !phoneCodeSelect) {
      return;
    }
    const option = selectEl.options[selectEl.selectedIndex];
    const code = option?.dataset?.code;
    if (!code) {
      return;
    }
    const match = Array.from(phoneCodeSelect.options).find((opt) => opt.value === code);
    if (match) {
      phoneCodeSelect.value = code;
      updatePhoneCodeWidth();
    }
  };

  currentLocationSelect?.addEventListener('change', () => syncPhoneCode(currentLocationSelect));
  citizenshipSelect?.addEventListener('change', () => syncPhoneCode(citizenshipSelect));
  phoneCodeSelect?.addEventListener('change', updatePhoneCodeWidth);
  resumeAttachmentInput?.addEventListener('change', () => validateAttachmentInput(resumeAttachmentInput, resumeAttachmentError, 'Resume'));
  passportAttachmentInput?.addEventListener('change', () => validateAttachmentInput(passportAttachmentInput, passportAttachmentError, 'Documents International Passport'));
  updatePhoneCodeWidth();

  applyForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setApplyStatus('');

    if (!validateAttachments()) {
      if (resumeAttachmentError && !resumeAttachmentError.hidden) {
        resumeAttachmentInput?.focus();
      } else if (passportAttachmentError && !passportAttachmentError.hidden) {
        passportAttachmentInput?.focus();
      }
      return;
    }
    const submitButton = applyForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Submitting...';
    }

    try {
      const payload = await buildApplicationPayload();
      const result = await sendApplication(payload);

      if (result.ok && result.success !== false) {
        setApplyStatus('Thank you. Your application has been submitted.', 'success');
        applyForm.reset();
        setAttachmentError(resumeAttachmentInput, resumeAttachmentError, '');
        setAttachmentError(passportAttachmentInput, passportAttachmentError, '');
        updatePhoneCodeWidth();
        window.setTimeout(() => {
          setApplyStatus('');
          toggleApplyModal(false);
        }, 900);
      } else {
        const errorMessage = result.message || 'There was a problem submitting your application. Please try again later.';
        setApplyStatus(errorMessage, 'error');
      }
    } catch (error) {
      setApplyStatus(error.message || 'There was a problem submitting your application. Please try again later.', 'error');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Application';
      }
    }
  });
}
