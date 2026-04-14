document.addEventListener('DOMContentLoaded', () => {
    if (window.SITE_MANIFEST) {
        initBoard(window.SITE_MANIFEST);
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
                    ${thumbnailPath ? `<img src="${thumbnailPath}" class="node-thumbnail" alt="${exp.id} thumbnail" loading="lazy">` : `<div class="node-thumbnail" style="display:flex; align-items:center; justify-content:center; color:#555;">[NO IMAGE]</div>`}
                    <h3 class="node-label">${exp.id}</h3>
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

function renderMediaGrid(mediaArray) {
    if (!mediaArray || mediaArray.length === 0) return '';
    return mediaArray.map(m => {
        if (m.type === 'image') {
            return `<div class="grid-item"><img src="${m.path}" alt="${m.filename}" loading="lazy"></div>`;
        } else if (m.type === 'video') {
            return `<div class="grid-item">
                        <video controls preload="metadata">
                            <source src="${m.path}">
                        </video>
                    </div>`;
        } else if (m.type === 'document') {
            return `<div class="grid-item doc-item">
                        <embed src="${m.path}" type="application/pdf" width="100%" height="800px" />
                        <a href="${m.path}" target="_blank" style="display:block; margin-top:0.5rem; color:#a3a3a3; text-decoration:underline; padding:1rem; text-align:center;">Open PDF in new tab</a>
                    </div>`;
        }
        return '';
    }).join('');
}

function parseText(summaryText) {
    if (!summaryText || typeof summaryText !== 'string') return '';
    const paragraphs = summaryText.split(/\n\n+/);
    return paragraphs.filter(p => !p.startsWith('###') && p.trim()).map(p => `<p>${p.trim()}</p>`).join('');
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
                    return `
                        <div class="subcat-content ${index === 0 ? 'active' : ''}" id="content-${sub.id}">
                            ${parseText(sub.summary) ? `<div class="prose">${parseText(sub.summary)}</div>` : ''}
                            <div class="grid">${renderMediaGrid(sub.media)}</div>
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
