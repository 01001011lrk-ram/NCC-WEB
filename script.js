const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

/* =====================================
   THEME (LIGHT / DARK)
   - Uses data-theme on <html>
   - Saved in localStorage ("ncc-theme")
   - If nothing is saved, follows the system preference
     (light when the system has no dark preference)
   - The same initial value is also set by a tiny inline script in
     <head> so the page never flashes the wrong theme.
===================================== */
(function () {
  const KEY = 'ncc-theme';
  const root = document.documentElement;
  const btn = $('#theme-toggle');
  const metaTheme = $('meta[name="theme-color"]');
  const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  const getSaved = () => {
    try {
      const v = localStorage.getItem(KEY);
      return v === 'dark' || v === 'light' ? v : null;
    } catch (e) { return null; }
  };
  const save = theme => { try { localStorage.setItem(KEY, theme); } catch (e) {} };
  const systemTheme = () => (mq && mq.matches ? 'dark' : 'light');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (metaTheme) metaTheme.setAttribute('content', theme === 'dark' ? '#101A16' : '#F7F8F3');
    if (btn) {
      const next = theme === 'dark' ? 'light' : 'dark';
      btn.setAttribute('aria-label', 'Switch to ' + next + ' mode');
      btn.setAttribute('title', 'Light Mode / Dark Mode');
    }
  }

  applyTheme(root.getAttribute('data-theme') || getSaved() || systemTheme());

  btn?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.classList.add('theme-transition');
    applyTheme(next);
    save(next);
    setTimeout(() => root.classList.remove('theme-transition'), 400);
  });

  /* Follow system changes only while the visitor has not chosen a theme */
  const onSystemChange = () => { if (!getSaved()) applyTheme(systemTheme()); };
  if (mq) {
    if (mq.addEventListener) mq.addEventListener('change', onSystemChange);
    else if (mq.addListener) mq.addListener(onSystemChange);
  }
})();

/* =====================================
   MOBILE MENU
===================================== */
const menuToggle = $('.menu-toggle');
const navLinks = $('#nav-links');
menuToggle?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', open);
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
$$('#nav-links a').forEach(a => a.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.setAttribute('aria-label', 'Open navigation');
}));

/* =====================================
   NCC WEBSITE PAGE NAVIGATION
===================================== */

const main = document.querySelector('main');
const statsStrip = document.querySelector('.stats-strip');
const navItems = $$('#nav-links a');

function showPage(hash, updateURL = true) {

    // Read the page name from the link
    let pageId = (hash || '#home').replace('#', '');

    // Home and Back to top should open Home
    if (pageId === 'top' || pageId === 'main') {
        pageId = 'home';
    }

    // Find the requested element
    const target = document.getElementById(pageId);

    if (!target || !main.contains(target)) {
        return;
    }

    // Find the main section containing that element
    const page = target.closest('main > section');

    if (!page) {
        return;
    }

    // Hide all other sections
    Array.from(main.children).forEach(element => {
        if (element === statsStrip) {
            element.classList.toggle(
                'page-hidden',
                page.id !== 'home'
            );
        } else {
            element.classList.toggle(
                'page-hidden',
                element !== page
            );
        }
    });

    // Highlight the selected navigation link
    navItems.forEach(link => {
        link.classList.toggle(
            'active',
            link.getAttribute('href') === '#' + page.id
        );
    });

    // Close the mobile menu
    navLinks?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Open navigation');

    // Update the URL
    if (updateURL) {
        history.pushState(null, '', '#' + page.id);
    }

    // Start at the top without scrolling through the page
    window.scrollTo(0, 0);

    // Display reveal animations for the selected page
    page.querySelectorAll('.reveal').forEach(element => {
        element.classList.add('visible');
    });
}

/* Handle clicks on internal links */
document.addEventListener('click', function (event) {

    const link = event.target.closest('a[href^="#"]');

    if (!link) return;

    const hash = link.getAttribute('href');

    if (!hash || hash === '#') return;

    const pageId = hash.slice(1);

    // Special links that return to Home
    if (pageId === 'top' || pageId === 'main') {
        event.preventDefault();
        showPage('#home');
        return;
    }

    const target = document.getElementById(pageId);

    if (target && main.contains(target)) {
        event.preventDefault();
        showPage(hash);
    }
});

/* Support browser Back and Forward buttons */
window.addEventListener('popstate', function () {
    showPage(window.location.hash || '#home', false);
});

/* Open the correct page when the website loads */
showPage(window.location.hash || '#home', false);

/* =====================================
   HEADER SHADOW ON SCROLL
===================================== */
const header = document.querySelector('.site-header');
const syncHeader = () => header?.classList.toggle('scrolled', window.scrollY > 12);
window.addEventListener('scroll', syncHeader, {passive:true});
syncHeader();

/* =====================================
   REVEAL ANIMATIONS
===================================== */
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  $$('.reveal').forEach(el => revealObserver.observe(el));
} else {
  $$('.reveal').forEach(el => el.classList.add('visible'));
}

/* =====================================
   RESOURCE SEARCH + FILTERS
===================================== */
const search = $('#resource-search');
const filters = $$('.filter');
const cards = $$('.resource-card');
const noResults = $('#no-results');
let category = 'all';
function filterResources(){
  const q = (search?.value || '').trim().toLowerCase();
  let shown = 0;
  cards.forEach(card => {
    const matchCategory = category === 'all' || card.dataset.category === category;
    const matchSearch = !q || card.dataset.title.toLowerCase().includes(q) || card.textContent.toLowerCase().includes(q);
    const visible = matchCategory && matchSearch;
    card.hidden = !visible;
    if(visible) shown++;
  });
  if (noResults) noResults.hidden = shown !== 0;
}
search?.addEventListener('input', filterResources);
filters.forEach(btn => btn.addEventListener('click', () => {
  filters.forEach(b => b.classList.remove('active'));
  btn.classList.add('active'); category = btn.dataset.filter; filterResources();
}));

/* =====================================
   MODAL
===================================== */
const modal = $('#modal'), modalTitle = $('#modal-title'), modalContent = $('#modal-content');
let lastFocused = null;

function showModal(){
  lastFocused = document.activeElement;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
  $('.modal-close')?.focus();
}
function openModal(title, content){
  modalTitle.textContent = title;
  modalContent.innerHTML = content;
  showModal();
}
function closeModal(){
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
  if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
}
$$('[data-close]').forEach(el => el.addEventListener('click', closeModal));
document.addEventListener('keydown', e => { if(e.key === 'Escape' && modal.classList.contains('show')) closeModal(); });

$$('[data-demo]').forEach(link => link.addEventListener('click', e => {
  e.preventDefault();
  const title = link.dataset.demo;
  openModal(title, `<p>This demo card is ready to connect to your real NCC PDF or document.</p><ul><li>Replace this action with the file path or official resource URL.</li><li>Keep the resource title, category and description concise.</li><li>Use accessible PDF filenames such as <strong>ncc-camp-preparation-checklist.pdf</strong>.</li></ul>`);
}));

$$('[data-video]').forEach(btn => btn.addEventListener('click', () => {
  openModal(btn.dataset.video, `<p>Video placeholder: connect this card to an official NCC-hosted video, YouTube embed, or local MP4 file.</p><p><strong>Suggested format:</strong> 16:9 video with captions and a clear title.</p>`);
}));
$$('[data-podcast]').forEach(btn => btn.addEventListener('click', () => {
  const ep = btn.dataset.podcast;
  openModal(`Podcast Episode ${ep}`, `<p>Audio player placeholder for Episode ${ep}. Add your MP3/stream URL to make the play button live.</p>`);
}));
$$('[data-modal="camp"]').forEach(btn => btn.addEventListener('click', () => {
  openModal('Annual Training Camp — Checklist', `<p>Before departure, confirm the unit's latest instructions.</p><ul><li>Valid ID and required permissions</li><li>Prescribed uniform and footwear</li><li>Personal hygiene and essential medicines as advised</li><li>Stationery, water bottle and necessary training items</li><li>Emergency contact details</li><li>Arrive at the reporting point on time</li></ul>`);
}));
$$('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const caption = item.querySelector('span')?.textContent?.trim();
    const imagePath = item.dataset.full;

    if (!caption || !imagePath) return;
    if (!modal || !modalTitle || !modalContent) return;

    const img = document.createElement('img');
    img.src = imagePath;
    img.alt = caption;
    img.style.width = '100%';
    img.style.display = 'block';

    modalTitle.textContent = caption;
    modalContent.replaceChildren(img);
    showModal();
  });
});

/* =====================================
   CONTACT FORM (demo)
===================================== */
$('#contact-form')?.addEventListener('submit', e => {
  e.preventDefault();
  $('#form-status').textContent = 'Thanks — your enquiry has been captured in this demo. Connect the form to your email/backend before publishing.';
  e.target.reset();
});

/* Opens the Map reading PDF (used by the resource cover images) */
function openPDF1() {
    window.open("assets/Map.pdf", "_blank");
}
const showButton = document.getElementById("showImagesBtn");
const imageContainer = document.getElementById("imageContainer");
const detailContainer = document.getElementById("detailContainer");
const detailImage = document.getElementById("detailImage");
const backButton = document.getElementById("backBtn");

// Step 1: Show the three images
showButton.addEventListener("click", function () {
    imageContainer.classList.remove("hidden");
    detailContainer.classList.add("hidden");
});

// Step 2: Open the selected image
function openImage(imagePath) {
    detailImage.src = imagePath;

    imageContainer.classList.add("hidden");
    detailContainer.classList.remove("hidden");
}

// Step 3: Return to the three images
backButton.addEventListener("click", function () {
    detailContainer.classList.add("hidden");
    imageContainer.classList.remove("hidden");
});

