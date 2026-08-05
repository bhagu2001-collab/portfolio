import { photos } from './photos.js';

document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.getElementById('gallery');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const timelineNav = document.getElementById('timeline-nav');

  const uniqueMonths = {};
  const observedElements = [];
  let currentPhotoIndex = 0; // Track the currently open photo

  // 1. Render photos and detect month boundaries
  photos.forEach((photo, index) => {
    const photoCard = document.createElement('div');
    photoCard.className = 'break-inside-avoid mb-1 overflow-hidden cursor-pointer group relative bg-gray-900';
    
    // Parse date for timeline grouping
    if (photo.date) {
      const dateObj = new Date(photo.date);
      if (!isNaN(dateObj.getTime())) {
        const year = dateObj.getFullYear();
        const monthName = dateObj.toLocaleString('default', { month: 'short' });
        const displayLabel = `${monthName} ${year}`;
        const keyId = `${year}-${dateObj.getMonth()}`;

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
      openLightbox(index); // Pass index to openLightbox
    });

    gallery.appendChild(photoCard);
  });

  // 2. Build the Timeline Navigation
  Object.keys(uniqueMonths).forEach(label => {
    const keyId = uniqueMonths[label];
    const navItem = document.createElement('a');
    navItem.href = `#month-${keyId}`;
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

  // 3. Highlight Active Month on Scroll
  if (observedElements.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-10% 0px -70% 0px',
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

  // 4. Lightbox Navigation functions
  function openLightbox(index) {
    currentPhotoIndex = index;
    updateLightboxImage();
    
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

  function updateLightboxImage() {
    const photo = photos[currentPhotoIndex];
    if (photo) {
      lightboxImg.src = photo.url;
      lightboxImg.alt = photo.title || 'Portfolio Image';
    }
  }

  function showNextPhoto() {
    currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
    updateLightboxImage();
  }

  function showPrevPhoto() {
    currentPhotoIndex = (currentPhotoIndex - 1 + photos.length) % photos.length;
    updateLightboxImage();
  }

  // Event Listeners for Nav Arrows
  lightboxPrev.addEventListener('click', (e) => {
    e.stopPropagation(); // Stop click from closing the lightbox
    showPrevPhoto();
  });

  lightboxNext.addEventListener('click', (e) => {
    e.stopPropagation(); // Stop click from closing the lightbox
    showNextPhoto();
  });

  lightboxClose.addEventListener('click', closeLightbox);
  
  // Close if click is outside the image and not on the arrows
  lightbox.addEventListener('click', (e) => {
    const isArrow = e.target.closest('#lightbox-prev') || e.target.closest('#lightbox-next');
    const isImg = e.target === lightboxImg;
    const isClose = e.target.closest('#lightbox-close');

    if (!isArrow && !isImg && !isClose && (e.target === lightbox || e.target.closest('#lightbox-content') === null)) {
       closeLightbox();
    }
  });

  // Keyboard navigation (Escape to close, Arrows to slide)
  document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('hidden')) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      showNextPhoto();
    } else if (e.key === 'ArrowLeft') {
      showPrevPhoto();
    }
  });
});
