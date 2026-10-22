const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

const menuToggle = $('.menu-toggle');
const navLinks = $('#nav-links');
menuToggle?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', open);
});
$$('#nav-links a').forEach(a => a.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded','false');
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
showPage(window.location.hash || '#home', false);window.addEventListener('scroll', setActive, {passive:true});
setActive();

const header = document.querySelector('.site-header');
const syncHeader = () => header?.classList.toggle('scrolled', window.scrollY > 12);
window.addEventListener('scroll', syncHeader, {passive:true});
syncHeader();

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

const search = $('#resource-search');
const filters = $$('.filter');
const cards = $$('.resource-card');
const noResults = $('#no-results');
let category = 'all';
function filterResources(){
  const q = (search.value || '').trim().toLowerCase();
  let shown = 0;
  cards.forEach(card => {
    const matchCategory = category === 'all' || card.dataset.category === category;
    const matchSearch = !q || card.dataset.title.toLowerCase().includes(q) || card.textContent.toLowerCase().includes(q);
    const visible = matchCategory && matchSearch;
    card.hidden = !visible;
    if(visible) shown++;
  });
  noResults.hidden = shown !== 0;
}
search?.addEventListener('input', filterResources);
filters.forEach(btn => btn.addEventListener('click', () => {
  filters.forEach(b => b.classList.remove('active'));
  btn.classList.add('active'); category = btn.dataset.filter; filterResources();
}));

const modal = $('#modal'), modalTitle = $('#modal-title'), modalContent = $('#modal-content');
function openModal(title, content){
  modalTitle.textContent = title; modalContent.innerHTML = content;
  modal.classList.add('show'); modal.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open');
  $('.modal-close')?.focus();
}
function closeModal(){ modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); document.body.classList.remove('modal-open'); }
$$('[data-close]').forEach(el => el.addEventListener('click', closeModal));
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModal(); });

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

    const img = document.createElement('img');
    img.src = imagePath;
    img.alt = caption;
    img.style.width = '100%';
    img.style.display = 'block';

    if (!modal || !modalTitle || !modalContent) return;

    modalTitle.textContent = caption;
    modalContent.replaceChildren(img);
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  });
});
$('#contact-form')?.addEventListener('submit', e => {
  e.preventDefault();
  $('#form-status').textContent = 'Thanks — your enquiry has been captured in this demo. Connect the form to your email/backend before publishing.';
  e.target.reset();
});

function openPDF1() {
    window.open("Map.pdf", "_blank");
}

/* =================================
   NCC WING INFORMATION TOGGLE
================================= */

function toggleWingInfo(infoId, button) {
  const info = document.getElementById(infoId);

  if (!info || !button) return;

  const isOpening = info.hidden;

  // Open or close the selected wing's information
  info.hidden = !isOpening;

  // Update the button text and accessibility state
  button.setAttribute("aria-expanded", String(isOpening));

  const wingName = button.textContent.includes("Army")
    ? "Army Wing"
    : button.textContent.includes("Naval")
    ? "Naval Wing"
    : "Air Wing";

  button.innerHTML = isOpening
    ? "Close " + wingName + " information <span>−</span>"
    : "Explore " + wingName + " <span>＋</span>";
}


/* NCC FAQ accordion */

document.querySelectorAll(".faq-question").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const isOpen = item.classList.contains("active");

    // Close all FAQ answers
    document.querySelectorAll(".faq-item").forEach((faq) => {
      faq.classList.remove("active");

      const question = faq.querySelector(".faq-question");
      question.setAttribute("aria-expanded", "false");
    });

    // Open the selected answer if it was previously closed
    if (!isOpen) {
      item.classList.add("active");
      button.setAttribute("aria-expanded", "true");
    }
  });
});


