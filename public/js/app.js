(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const NS = 'http://www.w3.org/2000/svg';

  let site = null;
  let selected = null; // service choisi dans le hero

  // ---------- Utilitaires ----------
  function icon(name) {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'ic');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS(NS, 'use');
    use.setAttribute('href', '#i-' + name);
    svg.appendChild(use);
    return svg;
  }

  function el(tag, props, children) {
    const node = document.createElement(tag);
    Object.assign(node, props || {});
    (children || []).forEach((c) => node.append(c));
    return node;
  }

  function namePart(name) {
    const clean = (name || '').trim();
    return clean ? "\nJe m'appelle " + clean + '.' : '';
  }

  function buildMessage(service, name) {
    const wa = site.whatsapp;
    if (!service) {
      return wa.otherMessage.replace('{name}', namePart(name));
    }
    return wa.messageTemplate
      .replace('{service}', service.title)
      .replace('{name}', namePart(name));
  }

  function waLink(message) {
    return 'https://wa.me/' + site.whatsapp.number + '?text=' + encodeURIComponent(message);
  }

  // ---------- Hero : choix du service + aperçu du message ----------
  function renderChips() {
    const box = $('#chips');
    box.textContent = '';
    site.services.forEach((s, i) => {
      const chip = el('button', { type: 'button', className: 'chip', textContent: s.title });
      chip.setAttribute('role', 'radio');
      chip.setAttribute('aria-checked', i === 0 ? 'true' : 'false');
      chip.addEventListener('click', () => {
        selected = s;
        box.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-checked', 'false'));
        chip.setAttribute('aria-checked', 'true');
        updatePreview(true);
      });
      box.appendChild(chip);
    });
    selected = site.services[0];
  }

  function updatePreview(animate) {
    const name = $('#firstName').value;
    const message = buildMessage(selected, name);
    const bubble = $('#bubble');
    bubble.textContent = message;
    $('#composerCta').href = waLink(message);
    if (animate) {
      bubble.classList.remove('pop');
      void bubble.offsetWidth; // relance l'animation
      bubble.classList.add('pop');
    }
  }

  // ---------- Liste des services ----------
  function renderServices() {
    const list = $('#servicesList');
    list.textContent = '';

    site.services.forEach((s) => {
      const link = el('a', {
        className: 'service',
        href: waLink(buildMessage(s, '')),
        target: '_blank',
        rel: 'noopener',
      });
      link.setAttribute('aria-label', 'Commander ' + s.title + ' sur WhatsApp');

      const ic = el('span', { className: 'service-ic' }, [icon(s.icon)]);
      const tags = el('ul', { className: 'tags' }, (s.includes || []).map((t) => el('li', { textContent: t })));
      const body = el('div', {}, [
        el('h3', { textContent: s.title }),
        el('p', { textContent: s.description }),
        tags,
      ]);
      const go = el('span', { className: 'service-go' }, [icon('wa'), 'Commander sur WhatsApp']);
      link.append(ic, body, go);
      list.appendChild(link);
    });

    // Autre demande
    const other = el('a', {
      className: 'service',
      href: waLink(buildMessage(null, '')),
      target: '_blank',
      rel: 'noopener',
    });
    other.setAttribute('aria-label', 'Faire une autre demande sur WhatsApp');
    other.append(
      el('span', { className: 'service-ic' }, [icon('chat')]),
      el('div', {}, [
        el('h3', { textContent: 'Autre demande' }),
        el('p', { textContent: 'Votre besoin ne figure pas dans la liste ? Décrivez-le nous, nous trouverons une solution.' }),
      ]),
      el('span', { className: 'service-go' }, [icon('wa'), 'Écrire sur WhatsApp'])
    );
    list.appendChild(other);
  }

  // ---------- Contact ----------
  function fillContactList(list) {
    const c = site.contact;
    list.textContent = '';
    const rows = [
      ['wa', 'WhatsApp', el('a', { href: waLink(buildMessage(null, '')), target: '_blank', rel: 'noopener', textContent: site.whatsapp.display })],
      ['pin', 'Lieu', document.createTextNode(c.city)],
      ['clock', 'Horaires', document.createTextNode(c.hours)],
    ];
    if (c.email) {
      rows.push(['mail', 'E-mail', el('a', { href: 'mailto:' + c.email, textContent: c.email })]);
    }
    rows.forEach(([ic, label, value]) => {
      const text = el('span', {}, [el('strong', { textContent: label }), el('br'), value]);
      list.appendChild(el('li', {}, [icon(ic), text]));
    });
  }

  function renderContact() {
    fillContactList($('#contactList'));

    const select = $('#cService');
    select.textContent = '';
    site.services.forEach((s) => select.appendChild(el('option', { value: s.id, textContent: s.title })));
    select.appendChild(el('option', { value: '', textContent: 'Autre demande' }));

    $('#contactForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#cName').value;
      const service = site.services.find((s) => s.id === select.value) || null;
      let message = buildMessage(service, name);
      const extra = $('#cMsg').value.trim();
      if (extra) message += '\n\n' + extra;
      window.open(waLink(message), '_blank', 'noopener');
    });
  }

  // ---------- Pied de page ----------
  function renderFooter() {
    $('#footWa').href = waLink(buildMessage(null, ''));
    const list = $('#footServices');
    list.textContent = '';
    site.services.forEach((s) => {
      list.appendChild(el('li', {}, [el('a', { href: '#services', textContent: s.title })]));
    });
    fillContactList($('#footContact'));
  }

  // ---------- Réalisations (balises <img> écrites dans index.html) ----------
  function imageOk(img) {
    return new Promise((resolve) => {
      if (img.complete) return resolve(img.naturalWidth > 0);
      img.addEventListener('load', () => resolve(true), { once: true });
      img.addEventListener('error', () => resolve(false), { once: true });
    });
  }

  async function setupProjects() {
    const section = $('#realisations');
    const grid = $('#projectsGrid');
    const filters = $('#projectFilters');
    const cards = [...grid.querySelectorAll('.project')];
    if (!cards.length) return;

    // On ne garde que les cartes dont la photo existe vraiment
    const results = await Promise.all(cards.map((card) => imageOk(card.querySelector('img'))));
    const valid = cards.filter((card, i) => {
      card.hidden = !results[i];
      return results[i];
    });
    if (!valid.length) return; // aucune photo : la section reste masquée

    section.hidden = false;
    document.querySelectorAll('[data-needs-projects]').forEach((n) => (n.hidden = false));

    // Boutons de filtre créés d'après les catégories écrites dans le HTML
    const categoryOf = (card) => card.querySelector('.project-cat').textContent.trim();
    const categories = [...new Set(valid.map(categoryOf))];
    if (categories.length > 1) {
      ['Tous', ...categories].forEach((cat, i) => {
        const b = el('button', { type: 'button', className: 'filter', textContent: cat });
        b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
        b.addEventListener('click', () => {
          filters.querySelectorAll('.filter').forEach((f) => f.setAttribute('aria-pressed', 'false'));
          b.setAttribute('aria-pressed', 'true');
          valid.forEach((card) => {
            card.hidden = i !== 0 && categoryOf(card) !== cat;
          });
        });
        filters.appendChild(b);
      });
    }

    // Fenêtre d'agrandissement
    const box = $('#lightbox');
    valid.forEach((card) => {
      card.addEventListener('click', () => {
        const img = card.querySelector('img');
        const title = card.querySelector('.project-title').textContent.trim();
        $('#lbImg').src = img.currentSrc || img.src;
        $('#lbImg').alt = img.alt;
        $('#lbCat').textContent = categoryOf(card);
        $('#lbTitle').textContent = title;
        $('#lbDesc').textContent = card.dataset.desc || '';
        const msg = "Bonjour ADS 👋\nJ'ai vu votre réalisation « " + title + ' » et je souhaite un projet similaire.';
        $('#lbCta').href = waLink(msg);
        box.showModal();
      });
    });
    $('#lbClose').addEventListener('click', () => box.close());
    box.addEventListener('click', (e) => {
      if (e.target === box) box.close(); // clic en dehors du contenu
    });
  }

  // ---------- Menu mobile ----------
  function setupMenu() {
    const btn = $('#menuBtn');
    const nav = $('#nav');
    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      })
    );
  }

  // ---------- Démarrage ----------
  async function init() {
    $('#year').textContent = new Date().getFullYear();
    setupMenu();

    try {
      const res = await fetch('/api/site');
      if (!res.ok) throw new Error('Réponse ' + res.status);
      site = await res.json();
    } catch (err) {
      $('#servicesList').textContent =
        'Impossible de charger les services. Écrivez-nous directement sur WhatsApp : +229 01 58 94 77 66.';
      return;
    }

    renderChips();
    renderServices();
    renderContact();
    renderFooter();
    setupProjects();
    updatePreview(false);
    $('#firstName').addEventListener('input', () => updatePreview(false));
    $('#waFloat').href = waLink(buildMessage(null, ''));
  }

  init();
})();
