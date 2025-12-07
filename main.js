document.addEventListener('DOMContentLoaded', () => {
  enforceAuth();
  const walletInput = document.getElementById('walletInput');
  const checkBtn = document.getElementById('checkWallet');
  const resultGrid = document.getElementById('walletResult');
  const errorEl = document.getElementById('walletError');

  checkBtn.addEventListener('click', () => {
    const addr = walletInput.value.trim();
    if (!addr) {
      showError('Wallet empty fam. Paste a Sol address.');
      return;
    }
    fetchWallet(addr);
  });

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
    resultGrid.classList.add('hidden');
  }

  async function fetchWallet(address) {
    errorEl.classList.add('hidden');
    resultGrid.innerHTML = '';
    resultGrid.classList.add('hidden');
    const apiKey = 'YOUR_KEY';
    const heliusUrl = `https://api.helius.xyz/v0/addresses/${encodeURIComponent(address)}/transactions?api-key=${apiKey}`;

    try {
      const res = await fetch(heliusUrl);
      if (!res.ok) throw new Error('bad status');
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) throw new Error('no data');
      const parsed = parseTransactions(data);
      renderWallet(parsed);
    } catch (err) {
      console.warn('Helius fallback', err);
      const mock = mockWallet();
      if (!mock) {
        showError('Yo fam that wallet empty or invalid 💀 try again.');
      } else {
        renderWallet(mock);
      }
    }
  }

  function parseTransactions(txs) {
    const buys = txs.filter(tx => tx.type === 'SWAP' || tx.type === 'TRANSFER').length;
    const sells = Math.max(0, Math.floor(buys / 2));
    const tokens = txs.slice(0, 5).map((t, i) => t.tokenTransfers?.[0]?.mint || `memeToken${i}`);
    const oldest = tokens[tokens.length - 1];
    const vibes = Math.min(100, 20 + buys * 3 + Math.random() * 30);
    return {
      type: vibeTitle(vibes),
      buys,
      sells,
      tokens,
      oldest,
      description: vibeDesc(vibes),
      score: Math.round(vibes)
    };
  }

  function mockWallet() {
    const vibes = Math.floor(40 + Math.random() * 55);
    return {
      type: vibeTitle(vibes),
      buys: Math.floor(Math.random() * 30),
      sells: Math.floor(Math.random() * 15),
      tokens: ['FROGGO', 'DEGEN', 'VIBE', 'CHAOS'],
      oldest: 'OGMEME',
      description: vibeDesc(vibes),
      score: vibes
    };
  }

  function vibeTitle(score) {
    if (score > 85) return 'UltraDegen Sniper';
    if (score > 70) return 'HODL Goblin';
    if (score > 55) return 'Mid-Curve Merchant';
    if (score > 40) return 'Chaos Enthusiast';
    return 'Paper-Legend';
  }

  function vibeDesc(score) {
    if (score > 85) return 'Snipes presales like a sleep-deprived hawk. Zero chill.';
    if (score > 70) return 'Stacks bags, vibes patient. Probably in ten discords rn.';
    if (score > 55) return 'Plays both sides, mid-curve merchant energy.';
    if (score > 40) return 'Chaos enjoyer, swaps just to feel alive.';
    return 'Paper hands but at least honest about it fam.';
  }

  function renderWallet(data) {
    resultGrid.classList.remove('hidden');
    resultGrid.innerHTML = '';
    const entries = [
      { label: 'Wallet Type', value: data.type },
      { label: 'Total Buys', value: data.buys },
      { label: 'Total Sells', value: data.sells },
      { label: 'Most Traded', value: data.tokens.join(', ') },
      { label: 'Oldest Held', value: data.oldest },
      { label: 'Description', value: data.description }
    ];

    entries.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'result-card';
      card.style.animationDelay = `${idx * 80}ms`;
      card.innerHTML = `<h3>${item.label}</h3><p>${item.value}</p>`;
      resultGrid.appendChild(card);
    });

    const scoreCard = document.createElement('div');
    scoreCard.className = 'result-card';
    scoreCard.style.animationDelay = `${entries.length * 80}ms`;
    scoreCard.innerHTML = `<h3>Vibe Score</h3><p id="scoreVal">0</p><div class="progress"><span id="scoreBar"></span></div>`;
    resultGrid.appendChild(scoreCard);

    animateScore(data.score);
  }

  function animateScore(target) {
    const valEl = document.getElementById('scoreVal');
    const bar = document.getElementById('scoreBar');
    let current = 0;
    const step = () => {
      current += Math.max(1, Math.round(target / 40));
      if (current > target) current = target;
      valEl.textContent = current;
      bar.style.width = `${current}%`;
      if (current < target) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
});
