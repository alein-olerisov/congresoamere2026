(() => {
  'use strict';

  const languages = ['es', 'pt', 'ru'];
  const storageKey = 'amere-language';
  const selectors = { es: 'Seleccionar idioma', pt: 'Selecionar idioma', ru: 'Выбрать язык' };
  const headerLogos = {
    es: 'media/IMG/HEADER-LOGO-DIAL-ES.png',
    pt: 'media/IMG/HEADER-LOGO-DIAL-PT.png',
    ru: 'media/IMG/HEADER-LOGO-DIAL-RU.png',
  };

  function savedLanguage() {
    try {
      return localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  }

  function init(render) {
    const selector = document.getElementById('selectorIdioma');
    const links = [...document.querySelectorAll('[data-language-link]')];
    const headerLogo = document.getElementById('logoHeader');

    function apply(language) {
      document.documentElement.lang = language;
      selector.value = language;
      selector.setAttribute('aria-label', selectors[language]);
      headerLogo.src = headerLogos[language];
      for (const link of links) {
        const url = new URL(link.href);
        url.searchParams.set('lang', language);
        link.href = url.href;
      }
      render(language);
    }

    const url = new URL(location.href);
    const requested = url.searchParams.get('lang');
    const initial = [requested, savedLanguage()].find(language => languages.includes(language));
    apply(initial ?? 'es');

    selector.addEventListener('change', () => {
      const language = selector.value;
      if (!languages.includes(language)) return;
      try {
        localStorage.setItem(storageKey, language);
      } catch {
        // Los enlaces siguen llevando el idioma si el navegador bloquea el almacenamiento.
      }
      const current = new URL(location.href);
      current.searchParams.set('lang', language);
      apply(language);
      history.replaceState(null, '', current);
    });
  }

  window.siteLanguage = { init };
})();
