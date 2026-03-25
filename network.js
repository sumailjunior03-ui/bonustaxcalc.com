window.CALC_HQ_NETWORK = {
  currentDomain: 'bonustaxcalc.com',
  forbiddenDomains: [
    'tokentodollarmargin.com'
  ],
  sites: [
    {
      domain: 'calc-hq.com',
      name: 'Calc HQ',
      url: 'https://calc-hq.com/',
      category: 'Hub',
      description: 'Financial calculator hub and guidance center.',
      live: true,
      related: false
    },
    {
      domain: 'quarterlytaxcalc.com',
      name: 'Quarterly Tax Calc',
      url: 'https://quarterlytaxcalc.com/',
      category: 'Taxes',
      description: 'Quarterly estimated tax calculator.',
      live: true,
      related: true
    },
    {
      domain: '1099vsw2calc.com',
      name: '1099 vs W-2 Calc',
      url: 'https://1099vsw2calc.com/',
      category: 'Taxes',
      description: 'Compare 1099 and W-2 take-home pay.',
      live: true,
      related: true
    },
    {
      domain: 'freelanceratecalc.com',
      name: 'Freelance Rate Calc',
      url: 'https://freelanceratecalc.com/',
      category: 'Income',
      description: 'Freelance rate and pricing calculator.',
      live: true,
      related: true
    },
    {
      domain: 'takehomesalarycalc.com',
      name: 'Take Home Salary Calc',
      url: 'https://takehomesalarycalc.com/',
      category: 'Income',
      description: 'Salary after federal taxes calculator.',
      live: true,
      related: true
    },
    {
      domain: 'bonustaxcalc.com',
      name: 'Bonus Tax Calc',
      url: 'https://bonustaxcalc.com/',
      category: 'Taxes',
      description: 'Federal bonus withholding estimator.',
      live: true,
      related: false
    }
  ]
};

(function () {
  const network = window.CALC_HQ_NETWORK;
  if (!network || !Array.isArray(network.sites)) {
    throw new Error('Network configuration missing.');
  }

  const forbidden = new Set(network.forbiddenDomains || []);
  const allDomains = network.sites.map(site => site.domain);
  forbidden.forEach(domain => {
    if (allDomains.includes(domain)) {
      const site = network.sites.find(item => item.domain === domain);
      if (site && site.live) {
        throw new Error(`Forbidden live domain detected: ${domain}`);
      }
    }
  });

  network.getLiveRelatedSites = function () {
    return network.sites.filter(site => {
      if (!site.live) return false;
      if (!site.related) return false;
      if (site.domain === network.currentDomain) return false;
      if (forbidden.has(site.domain)) return false;
      return true;
    });
  };
})();
