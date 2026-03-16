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

const APPLICATION_ENDPOINT = 'https://api.web3forms.com/submit';

const applyModal = document.getElementById('applyModal');
const applyForm = document.getElementById('applyForm');
const currentLocationSelect = document.getElementById('currentLocation');
const citizenshipSelect = document.getElementById('citizenship');
const phoneCodeSelect = document.getElementById('phoneCode');

const openApplyButtons = Array.from(document.querySelectorAll('[data-open-apply]'));
const closeApplyElements = Array.from(document.querySelectorAll('[data-close-apply]'));

const toggleApplyModal = (isOpen) => {
  if (!applyModal) {
    return;
  }
  applyModal.classList.toggle('open', isOpen);
  document.body.classList.toggle('modal-open', isOpen);
};

openApplyButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
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

const sendApplication = async (formData) => {
  if (!APPLICATION_ENDPOINT) {
    return Promise.resolve({ ok: false, success: false });
  }

  const response = await fetch(APPLICATION_ENDPOINT, {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  return { ok: response.ok, ...data };
};

if (applyForm) {
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
  updatePhoneCodeWidth();

  applyForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(applyForm);

    try {
      const result = await sendApplication(formData);
      if (result.ok && result.success !== false) {
        alert('Thank you. Your application has been submitted.');
        applyForm.reset();
        toggleApplyModal(false);
      } else {
        alert('There was a problem submitting your application. Please try again later.');
      }
    } catch (error) {
      alert('There was a problem submitting your application. Please try again later.');
    }
  });
}
