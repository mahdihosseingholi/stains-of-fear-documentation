document.addEventListener('DOMContentLoaded', () => {
    if (window.SITE_MANIFEST) {
        initBoard(window.SITE_MANIFEST);
        initLightbox();
    } else {
        document.getElementById('board').innerHTML = '<p style="padding: 2rem; color: #ff5555;">Failed to load manifest.js. Did you run the generation script?</p>';
    }
});

let manifestData = null;

function initBoard(data) {
    manifestData = data;
    const board = document.getElementById('board');

    if (!data.stages || data.stages.length === 0) {
        board.innerHTML = '<p style="padding: 2rem;">No data found in manifest.</p>';
        return;
    }

    // Prepend film overview panel
    const overviewEl = document.createElement('div');
    overviewEl.className = 'stage overview-stage';
    overviewEl.innerHTML = buildOverviewPanel();
    board.appendChild(overviewEl);

    data.stages.forEach(stage => {
        const stageEl = document.createElement('div');
        stageEl.className = 'stage';
        
        const titleEl = document.createElement('h1');
        titleEl.className = 'stage-title';
        titleEl.textContent = stage.id;
        stageEl.appendChild(titleEl);

        const expContainer = document.createElement('div');
        expContainer.className = 'experiments';

        stage.experiments.forEach(exp => {
            const expEl = document.createElement('div');
            expEl.className = 'experiment-node';
            
            // Thumbnail preference
            let thumbnailPath = '';
            const allImages = [];
            
            // Search top level images
            exp.media.forEach(m => { if(m.type === 'image') allImages.push(m); });
            // Search subcategory images
            if (exp.subCategories) {
                exp.subCategories.forEach(sub => {
                    sub.media.forEach(m => { if(m.type === 'image') allImages.push(m); });
                });
            }

            const reliableImg = allImages.find(m => !m.path.toLowerCase().endsWith('.heic'));
            if (reliableImg) {
                thumbnailPath = reliableImg.path;
            } else if (allImages.length > 0) {
                thumbnailPath = allImages[0].path;
            }

            expEl.innerHTML = `
                <div class="node-frame">
                    ${thumbnailPath ? `<img src="${thumbnailPath}" class="node-thumbnail" alt="${exp.id} thumbnail" loading="lazy">` : `<div class="node-thumbnail node-thumbnail--empty"><span>${docCount(exp)}</span></div>`}
                    <h3 class="node-label">${exp.id}</h3>
                    ${buildNodeIndex(exp)}
                </div>
                <div class="node-content-wrapper"></div>
            `;

            expEl.addEventListener('click', (e) => {
                if (e.target.closest('.node-expanded-content')) {
                    if (e.target.closest('.close-panel-btn')) {
                        toggleNode(expEl, false, null, null);
                    }
                    if (e.target.closest('.subcat-tab')) {
                        const subId = e.target.closest('.subcat-tab').dataset.subid;
                        activateSubcategory(expEl, subId);
                    }
                    return;
                }
                const isExpanded = expEl.classList.contains('expanded');
                
                document.querySelectorAll('.experiment-node.expanded').forEach(node => {
                    if (node !== expEl) toggleNode(node, false, null, null);
                });

                toggleNode(expEl, !isExpanded, stage, exp);
            });
            expContainer.appendChild(expEl);
        });

        stageEl.appendChild(expContainer);
        board.appendChild(stageEl);
    });

    // Native trackpad scrolling works by default! No wheel listener needed.
}

/* Show what is inside a section before it is opened, so the board can be
   read as a table of contents rather than a row of unlabelled thumbnails. */
function countItems(node) {
    let n = (node.media || []).length;
    (node.groups || []).forEach(g => n += g.media.length);
    return n;
}

function buildNodeIndex(exp) {
    const subs = exp.subCategories || [];
    if (subs.length) {
        return `<ul class="node-index">` + subs.map(s => {
            const n = countItems(s);
            return `<li><span class="node-index-name">${s.id}</span>${n ? `<span class="node-index-count">${n}</span>` : ''}</li>`;
        }).join('') + `</ul>`;
    }
    const n = countItems(exp);
    return n ? `<ul class="node-index"><li><span class="node-index-name">${n} item${n === 1 ? '' : 's'}</span></li></ul>` : '';
}

/* Describe what a node holds when it has no image to show for itself. */
function docCount(exp) {
    const all = [...(exp.media || [])];
    (exp.subCategories || []).forEach(s => all.push(...(s.media || [])));
    const docs = all.filter(m => m.type === 'document').length;
    const vids = all.filter(m => m.type === 'video').length;
    if (docs) return docs === 1 ? '1 document' : `${docs} documents`;
    if (vids) return vids === 1 ? '1 video' : `${vids} videos`;
    return 'No preview';
}

function renderMediaGrid(mediaArray) {
    if (!mediaArray || mediaArray.length === 0) return '';
    return mediaArray.map(m => {
        const caption = m.label ? `<figcaption class="media-caption">${m.label}</figcaption>` : '';
        if (m.type === 'image') {
            return `<figure class="grid-item"><img src="${m.path}" alt="${m.label || m.filename}" loading="lazy">${caption}</figure>`;
        } else if (m.type === 'video') {
            return `<figure class="grid-item">
                        <video controls preload="metadata">
                            <source src="${m.path}">
                        </video>${caption}
                    </figure>`;
        } else if (m.type === 'document') {
            return `<figure class="grid-item doc-item">
                        <embed src="${m.path}" type="application/pdf" width="100%" height="640px" />
                        <a href="${m.path}" target="_blank">Open ${m.filename} ↗</a>
                    </figure>`;
        }
        return '';
    }).join('');
}

/* A `group` is an ordered run of frames read left-to-right — the E100
   cultivation series, where the sequence itself is the evidence. */
function renderGroups(groups) {
    if (!groups || groups.length === 0) return '';
    return `<div class="series-set">` + groups.map(g => `
        <section class="series">
            <header class="series-head">
                <h4 class="series-title">${g.id}</h4>
                ${g.note ? g.note.split(/\n\n+/).filter(p => p.trim())
                    .map(p => `<p class="series-note">${parseInline(p.trim())}</p>`).join('') : ''}
            </header>
            <div class="series-strip">
                ${g.media.map(m => `
                    <figure class="series-frame">
                        <img src="${m.path}" alt="${m.label || m.filename}" loading="lazy">
                        ${m.label ? `<figcaption>${m.label}</figcaption>` : ''}
                    </figure>`).join('')}
            </div>
        </section>`).join('') + `</div>`;
}

/* Inline markdown only — for captions and notes that aren't block content. */
function parseInline(text) {
    if (!text) return '';
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^*])\*(?!\s)([^*]+?)\*(?!\*)/g, '$1<em>$2</em>')
        .replace(/—/g, '&thinsp;—&thinsp;');
}

function parseText(summaryText) {
    if (!summaryText || typeof summaryText !== 'string') return '';
    const paragraphs = summaryText.split(/\n\n+/);
    return paragraphs.filter(p => p.trim()).map(p => {
        // Strip ### headers but render ## as a label
        if (p.startsWith('###')) return '';
        let html = p.trim();
        // Render **bold** before *italic* so the greedy pair wins
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/(^|[^*])\*(?!\s)([^*]+?)\*(?!\*)/g, '$1<em>$2</em>');
        // Render em-dash spacing
        html = html.replace(/—/g, '&thinsp;—&thinsp;');
        return `<p>${html}</p>`;
    }).filter(Boolean).join('');
}

function buildOverviewPanel() {
    return `
    <div id="film-overview">
        <div class="overview-eyebrow">Practice-Based Research Film</div>
        <h1 class="overview-title">Stains of Fear</h1>
        <div class="overview-meta">
            <span>ARRI Alexa LF &nbsp;·&nbsp; Short Possession Film</span>
            <span>Kodak E100 &nbsp;·&nbsp; Ambient Fungal Cultivation</span>
        </div>

        <p class="overview-logline"><em>Stains of Fear</em> is a short possession film co-directed by <strong>Mahdi Hosseingholi</strong> and <strong>Mojtaba Zarghampour</strong>, made as a practice-based research project and written up in two master theses. The mould in it is not an effect. It is a living organism, cultivated on photographic emulsion, feeding on the gelatin that holds the image.</p>
        <p class="overview-logline">Possession films are usually told from the side of the person under threat, and narrative cinema is built so that its images are looked through rather than at. Here both were turned around. The film is told from the side of the force doing the taking, and that force is a material acting on the film itself.</p>
        <p class="overview-logline">The story starts with a man who spends the night alone in his office. He senses something in the office facing his, tries to photograph it, and the pictures come back stained. Those stains are cultivated slides scanned back into the edit, so the story had to be built with somewhere for the growth to go.</p>

        <div class="overview-section">
            <h2 class="overview-section-title">Research &amp; practice</h2>
            <p class="overview-note">This is where the two theses part. One asks how a force that neither perceives nor speaks can hold the position a film is told from, and calls it <em>the otherness</em>. The other asks how a living organism can act inside a fiction without shrinking into a surface effect, and follows the <em>trophic event</em> and the <em>second index</em> it leaves behind.</p>
            <p class="overview-note">Neither of us could direct the growth. We decided where the mould went and what stayed in the film; what it made there was its own.</p>
        </div>

        <div class="overview-section">
            <h2 class="overview-section-title">Scope &amp; authorship</h2>
            <p class="overview-note">The film was directed jointly. <strong>Both of us worked actively on every aspect of it, and all creative decisions were shared.</strong> Within that, Mahdi Hosseingholi concentrated more on the material process — the experimentation, the choice of stock, and its uses — and Mojtaba Zarghampour more on the narrative side. That is a difference of emphasis in the written research, not a division of the filmmaking.</p>
            <p class="overview-note">This documentation is shared between both theses, and it is only a small part of the steps actually taken. Decisions on lighting setups, lens choice, costume, set design, make-up and much else were either impossible to document as they happened or fall outside the scope of these theses. What is collected here is the strand each thesis needed in order to argue — not a complete record of how the film was made.</p>
        </div>
    </div>`;
}

function toggleNode(nodeEl, forceOpen, stage, exp) {
    if (forceOpen) {
        nodeEl.classList.add('expanded');
        const wrapper = nodeEl.querySelector('.node-content-wrapper');
        
        if (!wrapper.innerHTML.trim()) {
            let textHtml = parseText(exp.summary);
            let topMediaHtml = renderMediaGrid(exp.media);

            let subButtonsHtml = '';
            let subContentsHtml = '';
            
            if (exp.subCategories && exp.subCategories.length > 0) {
                subButtonsHtml = `<div class="subcat-tabs">` + exp.subCategories.map((sub, index) => {
                    return `<button class="subcat-tab ${index === 0 ? 'active' : ''}" data-subid="${sub.id}">${sub.id}</button>`;
                }).join('') + `</div>`;

                subContentsHtml = `<div class="subcat-contents">` + exp.subCategories.map((sub, index) => {
                    const grid = renderMediaGrid(sub.media);
                    return `
                        <div class="subcat-content ${index === 0 ? 'active' : ''}" id="content-${sub.id}">
                            ${parseText(sub.summary) ? `<div class="prose">${parseText(sub.summary)}</div>` : ''}
                            ${renderGroups(sub.groups)}
                            ${grid ? `<div class="grid">${grid}</div>` : ''}
                        </div>
                    `;
                }).join('') + `</div>`;
            }

            wrapper.innerHTML = `
                <div class="node-expanded-content">
                    <button class="close-panel-btn">✕ CLOSE</button>
                    <div class="expanded-header">
                        <h2>${exp.id}</h2>
                    </div>
                    ${textHtml ? `<div class="prose top-prose">${textHtml}</div>` : ''}
                    ${renderGroups(exp.groups)}
                    ${topMediaHtml ? `<div class="grid top-media">${topMediaHtml}</div>` : ''}

                    ${subButtonsHtml}
                    ${subContentsHtml}
                </div>
            `;
        }
        
        setTimeout(() => {
            nodeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }, 100);

    } else {
        nodeEl.classList.remove('expanded');
    }
}

/* ---------------- Lightbox ----------------
   Images in the grids and series strips are small by design; the detail
   is the point of the research, so any of them can be opened full size.
   Navigation stays inside the set the image was clicked in. */
let lightboxSet = [];
let lightboxIndex = 0;

function buildLightbox() {
    const el = document.createElement('div');
    el.id = 'lightbox';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `
        <button class="lb-close" aria-label="Close">✕</button>
        <button class="lb-nav lb-prev" aria-label="Previous">‹</button>
        <button class="lb-nav lb-next" aria-label="Next">›</button>
        <figure class="lb-figure">
            <img class="lb-image" alt="">
            <figcaption class="lb-caption"></figcaption>
        </figure>`;
    document.body.appendChild(el);

    el.addEventListener('click', (e) => {
        if (e.target.closest('.lb-close')) return closeLightbox();
        if (e.target.closest('.lb-prev')) return stepLightbox(-1);
        if (e.target.closest('.lb-next')) return stepLightbox(1);
        if (!e.target.closest('.lb-figure')) closeLightbox();   // backdrop
    });
    return el;
}

function captionFor(img) {
    const fig = img.closest('figure');
    const cap = fig && fig.querySelector('figcaption');
    if (cap && cap.textContent.trim()) return cap.textContent.trim();
    // Alt falls back to the filename elsewhere; a filename is not a caption.
    const alt = (img.getAttribute('alt') || '').trim();
    return /\.(jpe?g|png|gif|webp|heic|jp2|raf)$/i.test(alt) ? '' : alt;
}

function openLightbox(img) {
    // Prefer the run the image belongs to, so arrows walk the series in order.
    const scope = img.closest('.series-strip') || img.closest('.grid') || img.closest('.node-expanded-content');
    lightboxSet = scope ? [...scope.querySelectorAll('img')] : [img];
    lightboxIndex = Math.max(0, lightboxSet.indexOf(img));
    const el = document.getElementById('lightbox') || buildLightbox();
    renderLightbox();
    el.classList.add('open');
    el.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lb-locked');
}

function renderLightbox() {
    const el = document.getElementById('lightbox');
    const img = lightboxSet[lightboxIndex];
    if (!el || !img) return;
    const target = el.querySelector('.lb-image');
    target.src = img.currentSrc || img.src;
    target.alt = img.alt || '';
    const cap = captionFor(img);
    const counter = lightboxSet.length > 1 ? `<span class="lb-count">${lightboxIndex + 1} / ${lightboxSet.length}</span>` : '';
    el.querySelector('.lb-caption').innerHTML = (cap ? `<span>${cap}</span>` : '') + counter;
    el.querySelectorAll('.lb-nav').forEach(b => b.hidden = lightboxSet.length < 2);
}

function stepLightbox(dir) {
    if (lightboxSet.length < 2) return;
    lightboxIndex = (lightboxIndex + dir + lightboxSet.length) % lightboxSet.length;
    renderLightbox();
}

function closeLightbox() {
    const el = document.getElementById('lightbox');
    if (!el) return;
    el.classList.remove('open');
    el.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lb-locked');
}

function initLightbox() {
    buildLightbox();
    document.addEventListener('click', (e) => {
        const img = e.target.closest('.node-expanded-content img');
        if (!img) return;
        e.stopPropagation();
        openLightbox(img);
    });
    document.addEventListener('keydown', (e) => {
        const el = document.getElementById('lightbox');
        if (!el || !el.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') stepLightbox(-1);
        else if (e.key === 'ArrowRight') stepLightbox(1);
    });
}

function activateSubcategory(nodeEl, subId) {
    // Update active tab logic
    const tabs = nodeEl.querySelectorAll('.subcat-tab');
    tabs.forEach(t => {
        if(t.dataset.subid === subId) t.classList.add('active');
        else t.classList.remove('active');
    });

    const contents = nodeEl.querySelectorAll('.subcat-content');
    contents.forEach(c => {
        if(c.id === `content-${subId}`) c.classList.add('active');
        else c.classList.remove('active');
    });
}
