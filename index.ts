/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

interface PresetItem {
  label: string;
  prompt: string;
  category: 'Nature' | 'Cities' | 'History';
}

const presets: PresetItem[] = [
  {
    label: '🌿 Green',
    prompt: 'Take me somewhere with beautiful nature and greenery. What makes it special?',
    category: 'Nature',
  },
  {
    label: '❄️ Cold',
    prompt: 'Where is somewhere really cold and icy on Earth? Tell me what it is like.',
    category: 'Nature',
  },
  {
    label: '🏔️ Remote',
    prompt: 'If I wanted to go off grid, where is one of the most remote places on earth? How would I get there?',
    category: 'Nature',
  },
  {
    label: '🌌 Surreal',
    prompt: 'Think of a totally surreal natural location, where is it? What makes it so surreal?',
    category: 'Nature',
  },
  {
    label: '🗽 Metropolitan',
    prompt: 'Show me a really interesting large city with vibrant urban life and landmark architecture.',
    category: 'Cities',
  },
  {
    label: '🏮 Neon Nights',
    prompt: 'Take me to a vibrant city known for its bustling night markets, street life, and illuminated skyline.',
    category: 'Cities',
  },
  {
    label: '🎨 Cultural Hub',
    prompt: 'Show me a world-renowned city celebrated for arts, culture, historic streets, and cuisine.',
    category: 'Cities',
  },
  {
    label: '🗿 Ancient',
    prompt: 'Tell me about somewhere rich in ancient history and archaeological wonder.',
    category: 'History',
  },
  {
    label: '🏰 Medieval',
    prompt: 'Take me to an incredible preserved medieval city, fortress, or castle and explain its history.',
    category: 'History',
  },
  {
    label: '🏺 Lost Civilizations',
    prompt: 'Where can I explore the ruins and mysteries of an extraordinary lost civilization?',
    category: 'History',
  },
];

const apiKey =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
  'AIzaSyD1rDDP6T-gXOTFWeN8OY_xVry7g09jDyY';

const rootDiv = document.querySelector('#root') as HTMLDivElement;
const captionDiv = document.querySelector('#caption') as HTMLDivElement;
const captionText = document.querySelector('#caption-text') as HTMLSpanElement;
const captionToggleBtn = document.querySelector(
  '#caption-toggle-btn',
) as HTMLButtonElement;

const presetsContainer = document.querySelector(
  '#presets-container',
) as HTMLDivElement;
const presetsHeader = document.querySelector(
  '#presets-header',
) as HTMLDivElement;
const presetsToggleBtn = document.querySelector(
  '#presets-toggle-btn',
) as HTMLButtonElement;

const customLocationForm = document.querySelector(
  '#custom-location-form',
) as HTMLFormElement;
const customLocationInput = document.querySelector(
  '#custom-location-input',
) as HTMLInputElement;
const customLocationSubmit = document.querySelector(
  '#custom-location-submit',
) as HTMLButtonElement;

const frame = document.querySelector('#embed-map') as HTMLIFrameElement;
const presetsDiv = document.querySelector('#presets') as HTMLDivElement;

let isLoading = false;
let currentCategory = 'all';

function updatePresetsHeight() {
  if (!presetsContainer) return;
  const height = Math.round(presetsContainer.getBoundingClientRect().height);
  if (height > 0) {
    document.documentElement.style.setProperty(
      '--presets-panel-height',
      `${height}px`,
    );
  }
}

function updateResponsivePlaceholder() {
  if (!customLocationInput) return;
  if (window.innerWidth <= 360) {
    customLocationInput.placeholder = 'Location (e.g. Kyoto)...';
  } else if (window.innerWidth <= 480) {
    customLocationInput.placeholder = 'Search location (e.g. Kyoto)...';
  } else if (window.innerWidth <= 768) {
    customLocationInput.placeholder = 'Enter location (e.g. Kyoto, Serengeti)...';
  } else {
    customLocationInput.placeholder =
      'Or enter a location name (e.g. Kyoto, Serengeti, Reykjavik)...';
  }
}

function renderMap(location: string) {
  frame.src = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(
    location,
  )}`;
}

function setCaption(text: string) {
  if (captionText) {
    captionText.textContent = text;
  }
  captionDiv.classList.remove('hidden');
  captionDiv.classList.remove('collapsed');
  if (captionToggleBtn) {
    captionToggleBtn.setAttribute('aria-expanded', 'true');
    captionToggleBtn.setAttribute('title', 'Collapse message');
  }
  requestAnimationFrame(updatePresetsHeight);
}

function togglePresets(forceCollapse?: boolean) {
  if (!presetsContainer) return;
  const isCollapsed = presetsContainer.classList.contains('collapsed');
  const shouldCollapse =
    forceCollapse !== undefined ? forceCollapse : !isCollapsed;

  if (shouldCollapse) {
    presetsContainer.classList.add('collapsed');
    rootDiv?.classList.add('presets-collapsed');
    presetsToggleBtn?.setAttribute('aria-expanded', 'false');
    presetsToggleBtn?.setAttribute('title', 'Expand presets panel');
  } else {
    presetsContainer.classList.remove('collapsed');
    rootDiv?.classList.remove('presets-collapsed');
    presetsToggleBtn?.setAttribute('aria-expanded', 'true');
    presetsToggleBtn?.setAttribute('title', 'Collapse presets panel');
  }

  requestAnimationFrame(updatePresetsHeight);
  setTimeout(updatePresetsHeight, 280);
}

function toggleCaption(forceCollapse?: boolean) {
  if (!captionDiv) return;
  const isCollapsed = captionDiv.classList.contains('collapsed');
  const shouldCollapse =
    forceCollapse !== undefined ? forceCollapse : !isCollapsed;

  if (shouldCollapse) {
    captionDiv.classList.add('collapsed');
    captionToggleBtn?.setAttribute('aria-expanded', 'false');
    captionToggleBtn?.setAttribute('title', 'Expand message');
  } else {
    captionDiv.classList.remove('collapsed');
    captionToggleBtn?.setAttribute('aria-expanded', 'true');
    captionToggleBtn?.setAttribute('title', 'Collapse message');
  }
}

function renderPresets(category: string = 'all') {
  if (!presetsDiv) return;
  presetsDiv.innerHTML = '';

  const filtered =
    category === 'all'
      ? presets
      : presets.filter(
          (p) => p.category.toLowerCase() === category.toLowerCase(),
        );

  for (const preset of filtered) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = preset.label;
    btn.disabled = isLoading;
    btn.addEventListener('click', async () => {
      await generateContent(preset.prompt, btn);
    });
    presetsDiv.appendChild(btn);
  }

  requestAnimationFrame(updatePresetsHeight);
}

async function generateContent(prompt: string, clickedBtn?: HTMLButtonElement) {
  if (isLoading) return;
  isLoading = true;

  const buttons = presetsDiv.querySelectorAll('button');
  buttons.forEach((btn) => (btn.disabled = true));
  if (customLocationInput) customLocationInput.disabled = true;
  if (customLocationSubmit) customLocationSubmit.disabled = true;

  const originalBtnText = clickedBtn ? clickedBtn.textContent : '';
  if (clickedBtn) {
    clickedBtn.textContent = '✨ Finding...';
  }

  setCaption('Asking Gemini...');

  try {
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server returned ${response.status}`);
    }

    const data = await response.json();
    if (data.location) {
      renderMap(data.location);
    }
    if (data.caption) {
      setCaption(data.caption);
    }
  } catch (error: any) {
    console.error('API error:', error);
    setCaption(
      `Could not load recommendation: ${error?.message || 'Please try again'}`,
    );
  } finally {
    isLoading = false;
    const currentBtns = presetsDiv.querySelectorAll('button');
    currentBtns.forEach((btn) => (btn.disabled = false));
    if (customLocationInput) customLocationInput.disabled = false;
    if (customLocationSubmit) customLocationSubmit.disabled = false;
    if (clickedBtn && originalBtnText) {
      clickedBtn.textContent = originalBtnText;
    }
    requestAnimationFrame(updatePresetsHeight);
  }
}

function setupEventHandlers() {
  if (presetsToggleBtn) {
    presetsToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePresets();
    });
  }

  if (presetsHeader) {
    presetsHeader.addEventListener('click', () => {
      if (presetsContainer?.classList.contains('collapsed')) {
        togglePresets(false);
      }
    });
  }

  if (captionToggleBtn) {
    captionToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCaption();
    });
  }

  if (captionDiv) {
    captionDiv.addEventListener('click', () => {
      if (captionDiv.classList.contains('collapsed')) {
        toggleCaption(false);
      }
    });
  }

  if (customLocationForm && customLocationInput) {
    customLocationForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const query = customLocationInput.value.trim();
      if (!query) return;
      await generateContent(
        `Explore location: "${query}". Tell me what makes it fascinating and show it on the map.`,
        customLocationSubmit,
      );
    });
  }

  const categoryChips =
    document.querySelectorAll<HTMLButtonElement>('.category-chip');
  categoryChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      categoryChips.forEach((c) => {
        c.classList.remove('active');
        c.setAttribute('aria-selected', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-selected', 'true');
      const cat = chip.getAttribute('data-category') || 'all';
      currentCategory = cat;
      renderPresets(cat);
    });
  });
}

async function main() {
  if (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }

  setupEventHandlers();
  updateResponsivePlaceholder();
  renderPresets(currentCategory);
  updatePresetsHeight();

  if (typeof ResizeObserver !== 'undefined' && presetsContainer) {
    const ro = new ResizeObserver(() => {
      updatePresetsHeight();
    });
    ro.observe(presetsContainer);
  }

  window.addEventListener(
    'resize',
    () => {
      updateResponsivePlaceholder();
      updatePresetsHeight();
    },
    { passive: true },
  );

  renderMap('World');
}

main();
