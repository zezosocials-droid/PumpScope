document.addEventListener('DOMContentLoaded', () => {
  enforceAuth();
  const grid = document.getElementById('trendingGrid');
  const errorEl = document.getElementById('trendError');

  const fallbackEmojis = ['🐸','💀','🤡','🪙','🐶'];

  loadTrending();

  async function loadTrending() {
    try {
      const res = await fetch('https://api.dexscreener.com/latest/dex/search?q=solana');
      if (!res.ok) throw new Error('bad status');
      const data = await res.json();
      const pairs = data?.pairs?.slice(0, 8) || [];
      if (pairs.length === 0) throw new Error('no pairs');
      renderCards(pairs.map(formatPair));
    } catch (err) {
      console.warn('Dexscreener fallback', err);
      errorEl.classList.remove('hidden');
      renderCards(mockPairs());
    }
  }

  function formatPair(pair) {
    return {
      name: pair?.baseToken?.name || 'Mystery Meme',
      symbol: pair?.baseToken?.symbol || 'VIBE',
      price: pair?.priceUsd ? `$${parseFloat(pair.priceUsd).toFixed(4)}` : '$0.0000',
      marketCap: pair?.fdv ? `$${Number(pair.fdv).toLocaleString()}` : '$?-',
      volume: pair?.volume?.h24 ? `$${Number(pair.volume.h24).toLocaleString()}` : '$0',
      address: pair?.pairAddress || 'unknown',
      heat: Math.min(100, Math.max(5, Math.round(Math.random() * 100))),
      logo: pair?.info?.imageUrl || fallbackEmojis[Math.floor(Math.random() * fallbackEmojis.length)],
      mood: moodTag(pair?.txns?.h24?.buys || 0, pair?.txns?.h24?.sells || 0)
    };
  }

  function mockPairs() {
    const names = ['Frognova', 'GoblinGas', 'VibeBeam', 'LaserDog', 'ChaosNeko'];
    return names.map((n, i) => ({
      name: n,
      symbol: n.slice(0, 5).toUpperCase(),
      price: `$${(Math.random() * 0.05).toFixed(4)}`,
      marketCap: `$${(Math.random() * 1_000_000).toFixed(0)}`,
      volume: `$${(Math.random() * 200_000).toFixed(0)}`,
      address: `mock${i}`,
      heat: Math.floor(20 + Math.random() * 80),
      logo: fallbackEmojis[i % fallbackEmojis.length],
      mood: ['going wild rn fr','mid vibes','spicy volatility no cap','ape responsibly','floor to the moon'][i % 5]
    }));
  }

  function moodTag(buys, sells) {
    const delta = buys - sells;
    if (delta > 50) return 'going wild rn fr';
    if (delta > 10) return 'spicy volatility no cap';
    if (delta > 0) return 'humming steady';
    if (delta > -10) return 'mid vibes';
    return 'cooldown szn';
  }

  function renderCards(list) {
    grid.innerHTML = '';
    list.forEach((coin, idx) => {
      const card = document.createElement('div');
      card.className = 'trend-card';
      card.style.animationDelay = `${idx * 70}ms`;
      const logo = coin.logo.startsWith('http') ? `<img src="${coin.logo}" alt="${coin.name}" class="meme-img">` : `<div class="meme-img" style="display:grid;place-items:center;font-size:42px;">${coin.logo}</div>`;
      card.innerHTML = `
        ${logo}
        <h3>${coin.name} <span class="tag">${coin.symbol}</span></h3>
        <p>Price: ${coin.price}</p>
        <p>MC: ${coin.marketCap}</p>
        <p>24h Vol: ${coin.volume}</p>
        <p class="helper">Mood: ${coin.mood}</p>
        <div class="progress"><span style="width:${coin.heat}%"></span></div>
        <a class="btn gradient" href="https://pump.fun/${coin.address}" target="_blank" rel="noopener">View on Pump.fun</a>
      `;
      grid.appendChild(card);
    });
  }
});

