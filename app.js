import { photos } from './photos.js';

document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.getElementById('gallery');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const timelineNav = document.getElementById('timeline-nav');

  const uniqueMonths = {}; // Key: "MONTH YYYY", Value: keyId
  const observedElements = [];

  // 1. Render photos and detect month boundaries
  photos.forEach(photo => {
    const photoCard = document.createElement('div');
    photoCard.className = 'break-inside-avoid mb-1 overflow-hidden cursor-pointer group relative bg-gray-900';
    
    // Parse date for timeline grouping
    if (photo.date) {
      const dateObj = new Date(photo.date);
      if (!isNaN(dateObj.getTime())) {
        const year = dateObj.getFullYear();
        const monthName = dateObj.toLocaleString('default', { month: 'short' }); // "Jan", "Feb" etc.
        const displayLabel = `${monthName} ${year}`; // "Jan 2026"
        const keyId = `${year}-${dateObj.getMonth()}`; // "2026-0" for Jan

        // If this is the first photo we encounter for this month
        if (!uniqueMonths[displayLabel]) {
          uniqueMonths[displayLabel] = keyId;
          photoCard.id = `month-${keyId}`;
          observedElements.push(photoCard);
        }
      }
    }

    photoCard.innerHTML = `
      <div class="overflow-hidden">
        <img src="${photo.url}" alt="${photo.title || 'Portfolio Image'}" loading="lazy" class="w-full h-auto object-cover transition-transform duration-500 ease-out group-hover:scale-105">
      </div>
    `;

    photoCard.addEventListener('click', () => {
      openLightbox(photo);
    });

    gallery.appendChild(photoCard);
  });

  // 2. Build the Timeline Navigation
  // The keys of uniqueMonths are already sorted because photos are sorted by date descending
  Object.keys(uniqueMonths).forEach(label => {
    const keyId = uniqueMonths[label];
    const navItem = document.createElement('a');
    navItem.href = `#month-${keyId}`;
    // Minimal vertical bar style on the right
    navItem.className = 'py-1 pr-3 text-right transition-all duration-300 block border-r-2 border-white/10 text-white/40 hover:text-white hover:border-white/50';
    navItem.textContent = label;
    
    navItem.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(`month-${keyId}`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    
    timelineNav.appendChild(navItem);
  });

  // 3. Highlight Active Month on Scroll (Intersection Observer)
  if (observedElements.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-10% 0px -70% 0px', // Triggers when the section starts to occupy the upper part of the screen
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          const allLinks = timelineNav.querySelectorAll('a');
          
          allLinks.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('text-white', 'border-white/60', 'scale-105');
              link.classList.remove('text-white/40', 'border-white/10');
            } else {
              link.classList.remove('text-white', 'border-white/60', 'scale-105');
              link.classList.add('text-white/40', 'border-white/10');
            }
          });
        }
      });
    }, observerOptions);

    observedElements.forEach(el => observer.observe(el));
  }

  // 4. Lightbox functions
  function openLightbox(photo) {
    lightboxImg.src = photo.url;
    lightboxImg.alt = photo.title || 'Portfolio Image';
    
    lightbox.classList.remove('hidden');
    lightbox.classList.add('flex');
    document.body.classList.add('overflow-hidden');
  }

  function closeLightbox() {
    lightbox.classList.add('hidden');
    lightbox.classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
    setTimeout(() => {
      lightboxImg.src = '';
    }, 200);
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || (e.target.closest('#lightbox-content') === null && e.target !== lightboxImg)) {
       closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) {
      closeLightbox();
    }
  });
});
