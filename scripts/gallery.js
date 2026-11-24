(() => {
  'use strict';

  const byId = id => document.getElementById(id);
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const status = byId('gallery-status');
  const retry = byId('retry-gallery');
  const jump = byId('activity-jump');
  const viewer = byId('photo-viewer');
  const stage = byId('viewer-stage');
  const viewerImage = byId('viewer-image');
  const imageStatus = byId('viewer-image-status');
  const totalPhotos = byId('total-photos');
  const totalAlbums = byId('total-albums');
  const close = byId('viewer-close');
  const previous = byId('viewer-prev');
  const next = byId('viewer-next');
  const spans = [15, 19, 13, 17, 20, 14, 18, 16, 21, 14, 17, 15];
  let copy;
  let catalog;
  let activeDay;
  let activeAlbum;
  let activeIndex = 0;
  let returnFocus;
  let loadVersion = 0;
  let preloads = [];
  let swipeStart;

  function text(tag, className, value = '') {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = value;
    return node;
  }

  function albumTitle(album) {
    return copy.albums[album.id]?.title ?? album.title;
  }

  function albumSubtitle(album) {
    return copy.albums[album.id]?.subtitle ?? album.subtitle;
  }

  function translateAlbum(section, album) {
    const title = albumTitle(album);
    const count = album.photos.length;
    section.querySelector('h2').textContent = title;
    const subtitle = section.querySelector('.album-subtitle');
    if (subtitle) subtitle.textContent = albumSubtitle(album);
    section.querySelector('.album-count').textContent = `${count} ${copy.photos(count)}`;
    for (const tile of section.querySelectorAll('.photo-tile')) {
      tile.setAttribute('aria-label', copy.openPhoto(Number(tile.dataset.photoIndex) + 1, count, title));
      tile.dataset.imageError = copy.thumbnailError;
    }
  }

  function renderDay(day) {
    const panel = byId(`panel-${day.id}`);
    if (panel.dataset.rendered) return;
    const fragment = document.createDocumentFragment();
    day.albums.forEach((album, albumIndex) => {
      const section = document.createElement('section');
      section.id = album.id;
      section.className = 'album';
      section.setAttribute('aria-labelledby', `${album.id}-heading`);
      const header = document.createElement('div');
      header.className = 'album-header';
      const heading = document.createElement('div');
      heading.className = 'album-heading';
      const number = text('span', 'album-number', album.order === null ? '＋' : String(album.order).padStart(2, '0'));
      number.setAttribute('aria-hidden', 'true');
      const titleGroup = document.createElement('div');
      const title = text('h2', '');
      title.id = `${album.id}-heading`;
      titleGroup.append(title);
      if (album.subtitle) titleGroup.append(text('p', 'album-subtitle'));
      heading.append(number, titleGroup);
      header.append(heading, text('p', 'album-count'));
      const grid = document.createElement('div');
      grid.className = 'photo-grid';
      album.photos.forEach((photo, index) => {
        const tile = document.createElement('button');
        tile.type = 'button';
        tile.className = 'photo-tile';
        tile.dataset.photoIndex = index;
        tile.setAttribute('aria-haspopup', 'dialog');
        tile.style.setProperty('--span', photo.height > photo.width ? 21 : spans[(index + albumIndex * 3) % spans.length]);
        const image = document.createElement('img');
        image.alt = ''; // El nombre accesible está en el botón.
        image.width = photo.width;
        image.height = photo.height;
        image.loading = 'lazy';
        image.decoding = 'async';
        image.src = photo.thumbnail;
        image.addEventListener('error', () => tile.classList.add('image-error'), { once: true });
        const caption = document.createElement('span');
        caption.className = 'tile-caption';
        caption.setAttribute('aria-hidden', 'true');
        caption.append(text('span', '', String(index + 1).padStart(2, '0')), text('span', '', '↗'));
        tile.append(image, caption);
        grid.append(tile);
      });
      // Un solo listener por actividad; el visor recibe únicamente ese álbum.
      grid.addEventListener('click', event => {
        const tile = event.target.closest('.photo-tile');
        if (tile && grid.contains(tile)) openViewer(day, album, Number(tile.dataset.photoIndex), tile);
      });
      section.append(header, grid);
      translateAlbum(section, album);
      fragment.append(section);
    });
    panel.append(fragment);
    panel.dataset.rendered = 'true';
  }

  function updateSummary(day) {
    const date = copy.days[day.id]?.date ?? day.date;
    const activities = day.albums.length;
    byId('day-description').textContent = `${date} · ${activities} ${copy.activities(activities)} · ${day.count} ${copy.photos(day.count)}`;
    const selected = jump.value;
    jump.replaceChildren(new Option(copy.choose, ''));
    day.albums.forEach(album => {
      const prefix = album.order === null ? '' : `${String(album.order).padStart(2, '0')} · `;
      jump.add(new Option(prefix + albumTitle(album), album.id));
    });
    if (day.albums.some(album => album.id === selected)) jump.value = selected;
  }

  function updateTotals() {
    byId('total-photos-label').textContent = copy.photos(Number(totalPhotos.textContent));
    byId('total-albums-label').textContent = copy.activities(Number(totalAlbums.textContent));
  }

  function updateLoadStatus() {
    const loading = retry.hidden;
    byId('gallery-loading-dot').hidden = !loading;
    byId('gallery-status-text').textContent = loading ? copy.loading : copy.loadError;
    byId('day-description').textContent = loading ? copy.loadingSummary : copy.unavailable;
    retry.textContent = copy.retry;
  }

  function changeLanguage(language) {
    copy = window.galleryTranslations[language];
    document.title = copy.title;
    document.querySelector('meta[name="description"]').content = copy.description;
    for (const node of document.querySelectorAll('[data-i18n]')) {
      node.textContent = copy[node.dataset.i18n];
    }
    for (const node of document.querySelectorAll('[data-i18n-label]')) {
      node.setAttribute('aria-label', copy[node.dataset.i18nLabel]);
    }
    for (const tab of tabs) {
      const day = copy.days[tab.dataset.day];
      if (!day) continue;
      tab.firstElementChild.textContent = day.label;
      tab.lastElementChild.textContent = day.shortDate;
    }
    updateTotals();
    if (!activeDay) {
      updateLoadStatus();
      return;
    }
    for (const day of catalog.days) {
      if (!byId(`panel-${day.id}`).dataset.rendered) continue;
      for (const album of day.albums) translateAlbum(byId(album.id), album);
    }
    updateSummary(activeDay);
  }

  function switchDay(id, { focus = false, scroll = false, updateUrl = false } = {}) {
    if (!catalog) return;
    const day = catalog.days.find(item => item.id === id);
    if (!day) return;
    if (viewer.open) viewer.close();
    activeDay = day;
    renderDay(day);
    tabs.forEach(tab => {
      const selected = tab.dataset.day === id;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      byId(`panel-${tab.dataset.day}`).hidden = !selected;
      if (selected && focus) tab.focus();
    });
    updateSummary(day);
    if (updateUrl) history.replaceState(null, '', `#${id}`);
    const bar = document.querySelector('.day-bar');
    if (scroll && window.scrollY > bar.offsetTop) bar.scrollIntoView({ block: 'start' });
  }

  async function loadGallery() {
    status.hidden = false;
    retry.hidden = true;
    updateLoadStatus();
    try {
      const response = await fetch('scripts/albums.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      catalog = await response.json();
      if (!catalog.days?.length || !catalog.days.every(day => Array.isArray(day.albums) && day.albums.length)) {
        throw new Error('Catálogo no válido');
      }
      totalPhotos.textContent = catalog.count;
      totalAlbums.textContent = catalog.days.reduce((count, day) => count + day.albums.length, 0);
      updateTotals();
      switchDay(location.hash.slice(1) || 'dia-1');
      // Un fragmento ajeno a las pestañas no debe dejar la galería vacía.
      if (!activeDay) switchDay('dia-1');
      status.hidden = true;
      document.querySelector('.activity-select').hidden = false;
    } catch (error) {
      retry.hidden = false;
      updateLoadStatus();
      console.error('No se pudo cargar la galería:', error);
    }
  }

  function showPhoto(index) {
    if (!activeAlbum) return;
    activeIndex = (index + activeAlbum.photos.length) % activeAlbum.photos.length;
    const photo = activeAlbum.photos[activeIndex];
    const version = ++loadVersion;
    byId('viewer-counter').textContent = `${activeIndex + 1} / ${activeAlbum.photos.length}`;
    const subtitle = albumSubtitle(activeAlbum);
    const subject = subtitle ? `${albumTitle(activeAlbum)} — ${subtitle}` : albumTitle(activeAlbum);
    viewerImage.alt = `${subject}. ${copy.viewerPhoto(activeIndex + 1, activeAlbum.photos.length)}.`;
    viewerImage.src = photo.thumbnail;
    stage.setAttribute('aria-busy', 'true');
    imageStatus.hidden = false;
    imageStatus.textContent = copy.photoLoading;
    previous.disabled = next.disabled = activeAlbum.photos.length < 2;
    const full = new Image();
    full.onload = () => {
      if (version !== loadVersion || !viewer.open) return;
      viewerImage.src = photo.src;
      stage.setAttribute('aria-busy', 'false');
      imageStatus.hidden = true;
      // Solo las imágenes vecinas de la actividad actual se anticipan.
      const neighbors = new Set([
        (activeIndex + 1) % activeAlbum.photos.length,
        (activeIndex - 1 + activeAlbum.photos.length) % activeAlbum.photos.length,
      ]);
      neighbors.delete(activeIndex);
      preloads = [...neighbors].map(neighbor => {
        const image = new Image();
        image.src = activeAlbum.photos[neighbor].src;
        return image;
      });
    };
    full.onerror = () => {
      if (version !== loadVersion || !viewer.open) return;
      stage.setAttribute('aria-busy', 'false');
      imageStatus.textContent = copy.photoError;
    };
    full.src = photo.src;
  }

  function openViewer(day, album, index, tile) {
    activeAlbum = album;
    returnFocus = tile;
    const localizedDay = copy.days[day.id];
    byId('viewer-title').textContent = albumTitle(album);
    byId('viewer-day').textContent = `${localizedDay?.label ?? day.label} · ${albumSubtitle(album) || localizedDay?.date || day.date}`;
    viewer.showModal();
    document.body.classList.add('viewer-open');
    showPhoto(index);
    close.focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => switchDay(tab.dataset.day, { scroll: true, updateUrl: true }));
    tab.addEventListener('keydown', event => {
      let destination;
      if (event.key === 'ArrowRight') destination = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') destination = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') destination = 0;
      if (event.key === 'End') destination = tabs.length - 1;
      if (destination === undefined) return;
      event.preventDefault();
      switchDay(tabs[destination].dataset.day, { focus: true, scroll: true, updateUrl: true });
    });
  });
  window.addEventListener('hashchange', () => switchDay(location.hash.slice(1)));
  jump.addEventListener('change', () => {
    if (!jump.value) return;
    const section = byId(jump.value);
    section.scrollIntoView({ block: 'start' });
    // El siguiente Tab entra a las fotos de la actividad seleccionada.
    section.querySelector('.photo-tile')?.focus({ preventScroll: true });
  });
  retry.addEventListener('click', loadGallery);
  close.addEventListener('click', () => viewer.close());
  previous.addEventListener('click', () => showPhoto(activeIndex - 1));
  next.addEventListener('click', () => showPhoto(activeIndex + 1));
  viewer.addEventListener('close', () => {
    loadVersion++;
    preloads = [];
    swipeStart = undefined;
    activeAlbum = undefined;
    document.body.classList.remove('viewer-open');
    returnFocus?.focus({ preventScroll: true });
    viewerImage.removeAttribute('src');
    viewerImage.alt = '';
  });
  viewer.addEventListener('click', event => {
    if (event.target === viewer || event.target === stage || event.target.classList.contains('viewer-figure')) viewer.close();
  });
  viewer.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || !activeAlbum) return;
    const destinations = { ArrowLeft: activeIndex - 1, ArrowRight: activeIndex + 1, Home: 0, End: activeAlbum.photos.length - 1 };
    if (Object.hasOwn(destinations, event.key)) {
      event.preventDefault();
      showPhoto(destinations[event.key]);
    }
  });
  stage.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch' && event.isPrimary) swipeStart = { x: event.clientX, y: event.clientY };
  });
  stage.addEventListener('pointerup', event => {
    if (!swipeStart || !activeAlbum) return;
    const dx = event.clientX - swipeStart.x;
    const dy = event.clientY - swipeStart.y;
    swipeStart = undefined;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.3) showPhoto(activeIndex + (dx < 0 ? 1 : -1));
  });
  stage.addEventListener('pointercancel', () => { swipeStart = undefined; });
  window.siteLanguage.init(changeLanguage);
  loadGallery();
})();
