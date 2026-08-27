/**
 * Daily1Step Calculator Core — Enterprise-Grade Calculation & Chart Engine
 * Supports Multi-Currency, Data Tables, Growth Charts, Amortization, CSV Export & Printing
 */

var CalcCore = (function() {
  'use strict';

  var currencySymbols = {
    'USD': '$',
    'INR': '₹',
    'EUR': '€',
    'GBP': '£',
    'AUD': 'A$',
    'CAD': 'C$',
    'AED': 'AED ',
    'JPY': '¥',
    'CNY': '¥'
  };

  var activeCurrency = 'USD';

  function setCurrency(code) {
    if (currencySymbols[code]) {
      activeCurrency = code;
    }
  }

  function getCurrencySymbol() {
    return currencySymbols[activeCurrency] || '$';
  }

  function formatCurrency(val, currencyCode) {
    if (isNaN(val) || val === null || val === undefined) return '$0.00';
    var code = currencyCode || activeCurrency;
    var sym = currencySymbols[code] || '$';
    
    // Support Indian number system formatting (Lakhs/Crores)
    if (code === 'INR') {
      try {
        return sym + Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      } catch(e) {}
    }
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
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                var val = context.raw || 0;
                var total = context.dataset.data.reduce(function(a, b) { return a + b; }, 0);
                var pct = total > 0 ? ((val / total) * 100).toFixed(1) + '%' : '';
                return ' ' + context.label + ': ' + formatCurrency(val) + ' (' + pct + ')';
              }
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
            ticks: {
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
              callback: function(value) {
                if (value >= 1000000) return getCurrencySymbol() + (value / 1000000).toFixed(1) + 'M';
                if (value >= 1000) return getCurrencySymbol() + (value / 1000).toFixed(0) + 'k';
                return getCurrencySymbol() + value;
              }
            }
          }
        }
      }
    });
  }

  // Render Area / Growth Chart for Financial Planning
  function renderGrowthAreaChart(canvasId, labels, investedData, interestData, totalData) {
    var canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;

    if (chartInstances[canvasId]) {
      chartInstances[canvasId].destroy();
    }

    chartInstances[canvasId] = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Total Accumulated Wealth',
            data: totalData,
            borderColor: '#0284c7',
            backgroundColor: 'rgba(2, 132, 199, 0.15)',
            fill: true,
            tension: 0.35,
            borderWidth: 3
          },
          {
            label: 'Total Capital Invested',
            data: investedData,
            borderColor: '#0d9488',
            backgroundColor: 'rgba(13, 148, 136, 0.25)',
            fill: true,
            tension: 0.2,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: 700 } }
          },
          tooltip: {
            callbacks: {
              label: function(ctx) {
                return ' ' + ctx.dataset.label + ': ' + formatCurrency(ctx.raw);
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: '#f1f5f9' },
            ticks: {
              callback: function(v) {
                if (v >= 1000000) return getCurrencySymbol() + (v / 1000000).toFixed(1) + 'M';
                if (v >= 1000) return getCurrencySymbol() + (v / 1000).toFixed(0) + 'k';
                return getCurrencySymbol() + v;
              }
            }
          }
        }
      }
    });
  }

  // Render Amortization or Growth Data Table
  function renderTable(containerId, headers, rows) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var html = '<div class="calc-table-responsive"><table class="calc-data-table"><thead><tr>';
    headers.forEach(function(h) {
      html += '<th>' + h + '</th>';
    });
    html += '</tr></thead><tbody>';

    rows.forEach(function(r) {
      html += '<tr>';
      r.forEach(function(cell) {
        html += '<td>' + cell + '</td>';
      });
      html += '</tr>';
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
  }

  // Export Data to CSV File
  function exportCSV(filename, headers, rows) {
    var csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += headers.map(function(h) { return '"' + h + '"'; }).join(',') + '\r\n';

    rows.forEach(function(row) {
      csvContent += row.map(function(c) {
        var str = String(c).replace(/"/g, '""');
        return '"' + str + '"';
      }).join(',') + '\r\n';
    });

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', (filename || 'calculation-schedule') + '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Print Clean Report
  function printReport() {
    window.print();
  }

  // Calculate Rule of 72
  function calculateRuleOf72(rate) {
    if (!rate || rate <= 0) return 'N/A';
    return (72 / rate).toFixed(1) + ' Years';
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
    setCurrency: setCurrency,
    getCurrencySymbol: getCurrencySymbol,
    renderDoughnutChart: renderDoughnutChart,
    renderLineChart: renderLineChart,
    renderGrowthAreaChart: renderGrowthAreaChart,
    renderTable: renderTable,
    exportCSV: exportCSV,
    printReport: printReport,
    calculateRuleOf72: calculateRuleOf72,
    initToolSearch: initToolSearch,
    filterCategory: filterCategory
  };
})();

document.addEventListener('DOMContentLoaded', function() {
  CalcCore.initToolSearch();
});
