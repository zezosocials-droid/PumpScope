document.addEventListener('DOMContentLoaded', () => {
  enforceAuth();
  const grid = document.getElementById('memeGrid');
  const singleBtn = document.getElementById('singleMode');
  const galleryBtn = document.getElementById('galleryMode');
  const uploadInput = document.getElementById('memeUpload');
  const errorEl = document.getElementById('generatorError');
  let galleryMode = false;

  const builtInMemes = [
    { url: 'https://i.imgur.com/3ZQ3Z4T.jpeg', alt: 'goofy cat' },
    { url: 'https://i.imgur.com/V6xGD6O.jpeg', alt: 'confused dog' },
    { url: 'https://i.imgur.com/Zq0VQ50.jpeg', alt: 'laser eyes frog' },
    { url: 'https://i.imgur.com/Iva0t5y.jpeg', alt: 'shocked raccoon' }
  ];

  singleBtn.addEventListener('click', () => {
    galleryMode = false;
    singleBtn.classList.add('active', 'gradient');
    galleryBtn.classList.remove('active');
    galleryBtn.classList.add('ghost');
    generateMemes(1);
  });

  galleryBtn.addEventListener('click', () => {
    galleryMode = true;
    galleryBtn.classList.add('active', 'gradient');
    singleBtn.classList.remove('active');
    singleBtn.classList.add('ghost');
    generateMemes(4);
  });

  uploadInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const clean = { url: reader.result, alt: file.name };
        renderTokens([buildToken(clean)]);
      };
      reader.readAsDataURL(file);
    }
  });

  generateMemes(1);

  async function generateMemes(count) {
    grid.classList.add('fade-slide-out');
    setTimeout(async () => {
      grid.classList.remove('fade-slide-out');
      const memes = await collectMemes(count);
      renderTokens(memes.map(buildToken));
    }, 200);
  }

  async function collectMemes(count) {
    const memes = [];
    try {
      const res = await fetch('https://api.imgflip.com/get_memes');
      const data = await res.json();
      const valid = (data?.data?.memes || []).filter(filterMeme).slice(0, 20);
      while (memes.length < count && valid.length) {
        memes.push(valid[Math.floor(Math.random() * valid.length)]);
      }
    } catch (err) {
      console.warn('Imgflip blocked, trying reddit', err);
    }

    if (memes.length === 0) {
      try {
        const res = await fetch('https://www.reddit.com/r/memes+r/dankmemes+r/wholesomememes/top.json?limit=50&t=week');
        const data = await res.json();
        const posts = data?.data?.children || [];
        const valid = posts
          .map(p => p.data)
          .filter(p => p.thumbnail && p.thumbnail.startsWith('http'))
          .filter(filterReddit)
          .slice(0, 30);
        while (memes.length < count && valid.length) {
          memes.push(valid[Math.floor(Math.random() * valid.length)]);
        }
      } catch (err) {
        console.warn('Reddit blocked', err);
      }
    }

    if (memes.length === 0) {
      memes.push(...builtInMemes.slice(0, count));
      errorEl.classList.remove('hidden');
    } else {
      errorEl.classList.add('hidden');
    }

    if (memes.length < count) {
      const missing = count - memes.length;
      for (let i = 0; i < missing; i++) {
        memes.push(builtInMemes[i % builtInMemes.length]);
      }
    }

    return memes;
  }

  function filterMeme(meme) {
    const banned = /(trump|biden|obama|elon|netflix|disney|marvel|dc|warner|universal|hbo|apple|google|microsoft|amazon|nike|adidas|rapper|movie|tv)/i;
    if (!meme?.url) return false;
    if (banned.test(meme.name) || banned.test(meme.url)) return false;
    return true;
  }

  function filterReddit(post) {
    const banned = /(celebrity|elon|trump|biden|netflix|disney|marvel|dc|warner|logo|watermark|official)/i;
    const title = post.title || '';
    if (banned.test(title) || banned.test(post.url || '')) return false;
    return true;
  }

  function buildToken(meme) {
    const nameSeeds = ['Frog','Goblin','Laser','Turbo','Chaos','Neko','Degen','Pixel','Glow','Nova'];
    const vibeSeeds = ['Drip','Blast','Pulse','Warp','Wub','Meme','Flex','Flux','Wen','Zing'];
    const name = `${nameSeeds[Math.floor(Math.random()*nameSeeds.length)]}${vibeSeeds[Math.floor(Math.random()*vibeSeeds.length)]}`;
    const ticker = name.slice(0, 5).toUpperCase();
    const categories = ['Animal','Chaos','Crypto Joke','Object','Drama'];
    const category = categories[Math.floor(Math.random()*categories.length)];
    const energy = Math.floor(40 + Math.random()*60);
    const freshness = ['fresh drop','kinda spicy','day-old but bussin','vintage vibe'][Math.floor(Math.random()*4)];
    const desc = 'Built for clout goblins and sleep-deprived degens. Zero mid.';
    const hashtags = ['#solana','#pumpfun','#memecoin','#vibes'];
    return { name, ticker, category, energy, freshness, desc, hashtags, meme };
  }

  function renderTokens(tokens) {
    grid.innerHTML = '';
    tokens.forEach((token, idx) => {
      const card = document.createElement('div');
      card.className = 'meme-card fade-slide-in';
      card.style.animationDelay = `${idx * 80}ms`;
      const meme = token.meme;
      const img = meme.url?.startsWith('http') || meme.url?.startsWith('data:')
        ? `<img src="${meme.url}" alt="${meme.alt || token.name}" class="meme-img">`
        : `<div class="meme-img" style="display:grid;place-items:center;font-size:38px;">🌀</div>`;
      card.innerHTML = `
        ${img}
        <h3>${token.name} <span class="tag">${token.ticker}</span></h3>
        <p>Category: ${token.category}</p>
        <p>Freshness: ${token.freshness}</p>
        <p class="helper">${token.desc}</p>
        <p>${token.hashtags.join(' ')}</p>
        <div class="progress"><span style="width: 0%" data-target="${token.energy}"></span></div>
      `;
      grid.appendChild(card);
      setTimeout(() => {
        const bar = card.querySelector('span');
        bar.style.width = `${token.energy}%`;
      }, 120);
    });
  }
});
