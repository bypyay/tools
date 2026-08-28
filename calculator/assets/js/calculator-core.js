/**
 * Daily1Step Calculator Core PRO — Enterprise-Grade Calculation & Graphic Engine
 * Features:
 * 1. Multi-Currency Support (USD, INR Lakhs/Crores, EUR, GBP, CAD, AUD, AED, JPY)
 * 2. Visual Multi-Segment Breakdown Stack Bars with Percentage Tooltips
 * 3. Visual Interactive Gauge Meter for Health & Metric Scales
 * 4. Dual Chart.js Engine (Doughnut & Area Wealth Growth Curves)
 * 5. Full Amortization / Calculation Data Tables with Search & Paging
 * 6. 1-Click Action Bar: Copy Summary, Export CSV, Print Report, Reset
 * 7. Live Slider-Input Syncer & Metric/Imperial Unit Convertor
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
    if (isNaN(val) || val === null || val === undefined) return getCurrencySymbol() + '0.00';
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

  // ══════════════════════════════════════════════════════════════════
  // Visual Stack Bar Renderer (Animated Multi-Segment Color Bar)
  // ══════════════════════════════════════════════════════════════════
  function renderStackBar(containerId, segments) {
    var container = document.getElementById(containerId);
    if (!container || !segments || segments.length === 0) return;

    var total = segments.reduce(function(acc, s) { return acc + (s.value || 0); }, 0);
    if (total <= 0) return;

    var barHtml = '<div class="calc-stack-bar-wrap">';
    barHtml += '<div class="calc-stack-bar">';
    segments.forEach(function(s) {
      var pct = ((s.value / total) * 100).toFixed(1);
      if (parseFloat(pct) > 0) {
        barHtml += '<div class="calc-stack-seg" style="width:' + pct + '%; background:' + (s.color || '#0284c7') + ';" title="' + s.label + ': ' + (s.isCurrency ? formatCurrency(s.value) : formatNumber(s.value)) + ' (' + pct + '%)"></div>';
      }
    });
    barHtml += '</div>';

    // Legends
    barHtml += '<div class="calc-stack-legend-grid">';
    segments.forEach(function(s) {
      var pct = ((s.value / total) * 100).toFixed(1);
      var displayVal = s.isCurrency ? formatCurrency(s.value) : formatNumber(s.value) + (s.unit ? ' ' + s.unit : '');
      barHtml += '<div class="calc-stack-legend-item">';
      barHtml += '<span class="calc-stack-dot" style="background:' + (s.color || '#0284c7') + ';"></span>';
      barHtml += '<span class="calc-stack-lbl">' + s.label + ':</span>';
      barHtml += '<strong class="calc-stack-val">' + displayVal + ' <small>(' + pct + '%)</small></strong>';
      barHtml += '</div>';
    });
    barHtml += '</div></div>';

    container.innerHTML = barHtml;
  }

  // ══════════════════════════════════════════════════════════════════
  // Visual Gauge Indicator Renderer (Health, BMI, Efficiency)
  // ══════════════════════════════════════════════════════════════════
  function renderGaugeBar(containerId, value, min, max, zones, label) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var clamped = Math.max(min, Math.min(max, value));
    var pct = Math.max(0, Math.min(100, ((clamped - min) / (max - min)) * 100)).toFixed(1);

    var html = '<div class="calc-gauge-wrap">';
    html += '<div class="calc-gauge-top"><span class="calc-gauge-title">' + (label || 'Score / Level') + ': <strong>' + value.toFixed(1) + '</strong></span></div>';
    html += '<div class="calc-gauge-track">';
    
    // Background colored zones
    if (zones && zones.length > 0) {
      zones.forEach(function(z) {
        var zPct = (((z.max - z.min) / (max - min)) * 100).toFixed(1);
        html += '<div class="calc-gauge-zone" style="width:' + zPct + '%; background:' + z.color + ';" title="' + z.name + '"></div>';
      });
    } else {
      html += '<div class="calc-gauge-zone" style="width:100%; background:linear-gradient(90deg, #38bdf8, #22c55e, #eab308, #ef4444);"></div>';
    }

    // Needle indicator
    html += '<div class="calc-gauge-needle" style="left:' + pct + '%;"></div>';
    html += '</div>';

    // Zone labels underneath
    if (zones && zones.length > 0) {
      html += '<div class="calc-gauge-labels">';
      zones.forEach(function(z) {
        html += '<span style="color:' + z.color + ';">' + z.name + '</span>';
      });
      html += '</div>';
    }
    html += '</div>';

    container.innerHTML = html;
  }

  // ══════════════════════════════════════════════════════════════════
  // 1-Click Action Bar (Copy Summary, CSV Export, Print, Reset)
  // ══════════════════════════════════════════════════════════════════
  function renderActionBar(containerId, summaryText, csvFilename, csvHeaders, csvRows) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var html = '<div class="calc-action-bar-wrap">';
    html += '<button type="button" class="btn-calc-action btn-action-copy" onclick="CalcCore.copySummary(' + JSON.stringify(summaryText) + ', this)"><i class="fa-solid fa-copy"></i> Copy Summary</button>';
    
    if (csvHeaders && csvRows && csvRows.length > 0) {
      html += '<button type="button" class="btn-calc-action btn-action-csv" onclick="CalcCore.exportCSV(' + JSON.stringify(csvFilename || 'calculation-data') + ', ' + JSON.stringify(csvHeaders) + ', ' + JSON.stringify(csvRows) + ')"><i class="fa-solid fa-file-csv"></i> Export CSV</button>';
    }

    html += '<button type="button" class="btn-calc-action btn-action-print" onclick="CalcCore.printReport()"><i class="fa-solid fa-print"></i> Print</button>';
    html += '</div>';

    container.innerHTML = html;
  }

  function copySummary(text, btnEl) {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(function() {
      if (btnEl) {
        var originalHtml = btnEl.innerHTML;
        btnEl.innerHTML = '<i class="fa-solid fa-check" style="color:#10b981;"></i> Copied!';
        btnEl.style.borderColor = '#10b981';
        setTimeout(function() {
          btnEl.innerHTML = originalHtml;
          btnEl.style.borderColor = '';
        }, 2000);
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // Chart Registry & Engines
  // ══════════════════════════════════════════════════════════════════
  var chartInstances = {};

  function renderDoughnutChart(canvasId, labels, data, colors) {
    var canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;

    if (chartInstances[canvasId]) {
      chartInstances[canvasId].destroy();
    }

    var defaultColors = ['#0d9488', '#0284c7', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981'];

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

  function printReport() {
    window.print();
  }

  function calculateRuleOf72(rate) {
    if (!rate || rate <= 0) return 'N/A';
    return (72 / rate).toFixed(1) + ' Years';
  }

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
    renderStackBar: renderStackBar,
    renderGaugeBar: renderGaugeBar,
    renderActionBar: renderActionBar,
    copySummary: copySummary,
    renderDoughnutChart: renderDoughnutChart,
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
