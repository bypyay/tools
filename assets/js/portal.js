// ══════════════════════════════════════════════════════════════════
// Daily1Step All Tools Master Portal Engine
// ══════════════════════════════════════════════════════════════════
let activeSuiteFilter = 'all';
let searchQuery = '';

const searchInput = document.getElementById('masterSearchInput');
const searchClearBtn = document.getElementById('searchClearBtn');
const toolsGrid = document.getElementById('toolsMasterGrid');
const emptyState = document.getElementById('emptyStateBox');
const showingCountSubtitle = document.getElementById('showingCountSubtitle');
const searchNoticeBar = document.getElementById('searchNoticeBar');
const activeSearchQuery = document.getElementById('activeSearchQuery');

// Live Search Input Listener
if (searchInput) {
  searchInput.addEventListener('input', function(e) {
    searchQuery = e.target.value.trim().toLowerCase();
    searchClearBtn.style.display = searchQuery ? 'flex' : 'none';
    applyFilters();
  });
}

function clearSearch() {
  if (searchInput) searchInput.value = '';
  searchQuery = '';
  searchClearBtn.style.display = 'none';
  applyFilters();
}

function focusSearch() {
  if (searchInput) {
    searchInput.focus();
    searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// Keyboard Shortcut: '/' to focus search
window.addEventListener('keydown', function(e) {
  if (e.key === '/' && document.activeElement !== searchInput) {
    e.preventDefault();
    focusSearch();
  }
});

// Suite Tabs Filter
window.filterBySuite = function(suite, btnElem) {
  activeSuiteFilter = suite;
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  if (btnElem) btnElem.classList.add('active');
  applyFilters();
};

function applyFilters() {
  const cards = toolsGrid.querySelectorAll('.tool-card');
  let visibleCount = 0;

  cards.forEach(card => {
    const cardSuite = card.getAttribute('data-suite');
    const cardTitle = card.getAttribute('data-title') || '';
    const cardDesc = card.getAttribute('data-desc') || '';

    const matchesSuite = (activeSuiteFilter === 'all') || (cardSuite === activeSuiteFilter);
    const matchesSearch = !searchQuery || cardTitle.includes(searchQuery) || cardDesc.includes(searchQuery);

    if (matchesSuite && matchesSearch) {
      card.style.display = 'flex';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  // Update subtitle & empty state
  if (showingCountSubtitle) {
    showingCountSubtitle.textContent = `Showing ${visibleCount} tools` + (activeSuiteFilter !== 'all' ? ` in ${activeSuiteFilter.toUpperCase()}` : '');
  }

  if (searchNoticeBar && activeSearchQuery) {
    if (searchQuery) {
      searchNoticeBar.style.display = 'block';
      activeSearchQuery.textContent = searchQuery;
    } else {
      searchNoticeBar.style.display = 'none';
    }
  }

  if (emptyState) {
    emptyState.style.display = (visibleCount === 0) ? 'block' : 'none';
  }
}

// FAQ Accordion
document.querySelectorAll('.portal-faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const answer = btn.nextElementSibling;
    const icon = btn.querySelector('i');
    const isOpen = answer.style.display === 'block';

    answer.style.display = isOpen ? 'none' : 'block';
    icon.className = isOpen ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-up';
  });
});
