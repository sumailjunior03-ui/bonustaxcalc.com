function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(value);
}

function getFederalRate(totalSupplementalWages) {
  return totalSupplementalWages > 1000000 ? 0.37 : 0.22;
}

function calculateBonusWithholding() {
  const bonus = Number(document.getElementById('bonusAmount')?.value) || 0;
  const ytd = Number(document.getElementById('yearToDateSupplemental')?.value) || 0;
  const filingStatus = document.getElementById('filingStatus')?.value || 'Single';

  const totalSupplemental = bonus + ytd;
  const federalRate = getFederalRate(totalSupplemental);
  const federalWithholding = bonus * federalRate;
  const netAfterFederal = bonus - federalWithholding;
  const thresholdText = totalSupplemental > 1000000
    ? 'Because total supplemental wages exceed $1,000,000, this estimate uses the 37% federal supplemental withholding rate.'
    : 'Because total supplemental wages do not exceed $1,000,000, this estimate uses the 22% federal supplemental withholding rate.';

  const resultHtml = `
    <div class="result-grid">
      <div class="result-card">
        <span class="label">Current bonus amount</span>
        <strong>${formatCurrency(bonus)}</strong>
      </div>
      <div class="result-card">
        <span class="label">Year-to-date supplemental wages</span>
        <strong>${formatCurrency(ytd)}</strong>
      </div>
      <div class="result-card">
        <span class="label">Federal withholding rate</span>
        <strong>${(federalRate * 100).toFixed(0)}%</strong>
      </div>
      <div class="result-card">
        <span class="label">Estimated federal withholding</span>
        <strong>${formatCurrency(federalWithholding)}</strong>
      </div>
      <div class="result-card">
        <span class="label">Estimated net after federal withholding</span>
        <strong>${formatCurrency(netAfterFederal)}</strong>
      </div>
    </div>
    <p class="result-note">${thresholdText}</p>
    <p class="result-note">Filing status selected: <strong>${filingStatus}</strong>. This calculator provides a narrow federal estimate only and does not apply state taxes, Social Security, Medicare, retirement deductions, or employer-specific payroll settings.</p>
  `;

  const resultsNode = document.getElementById('results');
  if (resultsNode) {
    resultsNode.innerHTML = resultHtml;
  }
}

function getFallbackRelatedSites() {
  return [
    { name: 'Calc-HQ', url: 'https://calc-hq.com/', description: 'Financial calculator hub and reference layer.' }
  ];
}

function buildRelatedHtml(relatedSites) {
  return relatedSites.map(site => `
    <li><a href="${site.url}">${site.name}</a><span> — ${site.description}</span></li>
  `).join('');
}

function renderFooter() {
  const footerMounts = document.querySelectorAll('[data-footer]');
  const relatedMounts = document.querySelectorAll('[data-related-calculators]');

  let relatedSites = [];
  try {
    const network = window.CALC_HQ_NETWORK;
    if (!network || typeof network.getLiveRelatedSites !== 'function') {
      throw new Error('Network footer renderer unavailable.');
    }
    relatedSites = network.getLiveRelatedSites();
  } catch (error) {
    console.error(error);
    relatedSites = getFallbackRelatedSites();
  }

  const relatedHtml = buildRelatedHtml(relatedSites);

  footerMounts.forEach(node => {
    node.innerHTML = `
      <div class="footer-inner">
        <div>
          <p class="footer-title">${document.body.dataset.siteName || 'BonusTaxCalc.com'}</p>
          <p class="footer-copy">Federal bonus withholding estimates run locally in your browser.</p>
        </div>
        <div>
          <p class="footer-title">Related tools</p>
          <ul class="footer-links">${relatedHtml}</ul>
        </div>
        <div>
          <p class="footer-title">Resources</p>
          <ul class="footer-links">
            <li><a href="https://calc-hq.com/" target="_blank" rel="noopener">Financial Calculator Hub</a></li>
          </ul>
        </div>
        <div>
          <p class="footer-title">Pages</p>
          <ul class="footer-links">
            <li><a href="/">Calculator</a></li>
            <li><a href="/privacy.html">Privacy Policy</a></li>
            <li><a href="/legal.html">Legal / Disclaimer</a></li>
            <li><a href="/faq.html">FAQ</a></li>
            <li><a href="/contact.html">Contact</a></li>
          </ul>
          <p class="footer-copy"><a href="mailto:partnerships@calc-hq.com">partnerships@calc-hq.com</a></p>
        </div>
      </div>
    `;
  });

  relatedMounts.forEach(node => {
    node.innerHTML = `<ul class="related-list">${relatedHtml}</ul>`;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderFooter();
  const form = document.getElementById('bonusTaxForm');
  if (form) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      calculateBonusWithholding();
    });
    calculateBonusWithholding();
  }
});
