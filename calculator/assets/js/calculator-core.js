/**
 * Daily1Step Calculator Core — Utility Functions & Chart Helpers
 */

var CalcCore = (function() {
  'use strict';

  function formatCurrency(val, currencySymbol) {
    if (isNaN(val) || val === null || val === undefined) return '$0.00';
    var sym = currencySymbol || '$';
    return sym + Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatNumber(val, decimals) {
    if (isNaN(val) || val === null || val === undefined) return '0';
    var dec = decimals !== undefined ? decimals : 2;
    return Number(val).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }

  function formatPercent(val) {
    if (isNaN(val) || val === null || val === undefined) return '0.00%';
    return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
  }

  // Chart instances registry
  var chartInstances = {};

  function renderDoughnutChart(canvasId, labels, data, colors) {
    var canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;

    if (chartInstances[canvasId]) {
      chartInstances[canvasId].destroy();
    }

    var defaultColors = ['#0d9488', '#0284c7', '#f59e0b', '#ec4899', '#8b5cf6'];

    chartInstances[canvasId] = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors || defaultColors,
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: 600 },
              padding: 14
            }
          }
        },
        cutout: '65%'
      }
    });
  }

  function renderLineChart(canvasId, labels, datasets) {
    var canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;

    if (chartInstances[canvasId]) {
      chartInstances[canvasId].destroy();
    }

    chartInstances[canvasId] = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: 600 } }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 } }
          },
          y: {
            grid: { color: '#f1f5f9' },
            ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 } }
          }
        }
      }
    });
  }

  // Live filter for homepage tools
  function initToolSearch() {
    var searchInput = document.getElementById('searchToolsInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', function(e) {
      var query = e.target.value.toLowerCase().trim();
      var cards = document.querySelectorAll('.tool-card');
      var visibleCount = 0;

      cards.forEach(function(card) {
        var title = (card.querySelector('.tool-card-title') ? card.querySelector('.tool-card-title').textContent : '').toLowerCase();
        var desc = (card.querySelector('.tool-card-desc') ? card.querySelector('.tool-card-desc').textContent : '').toLowerCase();

        if (title.indexOf(query) > -1 || desc.indexOf(query) > -1) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      // Show / hide section headers if all cards in group are hidden
      document.querySelectorAll('.category-group-section').forEach(function(sec) {
        var secCards = sec.querySelectorAll('.tool-card');
        var anyVisible = false;
        secCards.forEach(function(c) {
          if (c.style.display !== 'none') anyVisible = true;
        });
        sec.style.display = anyVisible ? 'block' : 'none';
      });
    });
  }

  // Category filter tabs on homepage
  function filterCategory(catKey, btn) {
    document.querySelectorAll('.cat-tab-btn').forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');

    document.querySelectorAll('.category-group-section').forEach(function(sec) {
      if (catKey === 'all' || sec.getAttribute('data-cat') === catKey) {
        sec.style.display = 'block';
      } else {
        sec.style.display = 'none';
      }
    });
  }

  return {
    formatCurrency: formatCurrency,
    formatNumber: formatNumber,
    formatPercent: formatPercent,
    renderDoughnutChart: renderDoughnutChart,
    renderLineChart: renderLineChart,
    initToolSearch: initToolSearch,
    filterCategory: filterCategory
  };
})();

document.addEventListener('DOMContentLoaded', function() {
  CalcCore.initToolSearch();
});
