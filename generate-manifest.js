/* ============================================================
 * ⚠️  DO NOT RUN THIS WITHOUT READING THIS FIRST.
 *
 * manifest.js is now maintained BY HAND. It holds work this
 * script cannot reproduce and WILL overwrite:
 *
 *   · every long-form summary (drawn from the finished theses)
 *   · the Audio experiment (03_Post-production/02_Audio)
 *   · the `groups` structure — the six E100 cultivation series,
 *     which this script flattens into one undifferentiated grid
 *     because it scans subcategories recursively
 *   · per-image `label` captions (dates, video descriptions)
 *
 * The _summary.md files on disk are OLDER and SHORTER than what
 * manifest.js contains, so regenerating is a downgrade, not a refresh.
 *
 * To add new media: drop the files in, then hand-edit manifest.js.
 * If you ever do need to regenerate, back up manifest.js first and
 * re-apply the above by hand.
 * ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();
const OUTPUT_FILE = path.join(ROOT_DIR, 'manifest.js');

// Ignore old raw folders and standard build files
const IGNORE_LIST = [
    '.git', 'node_modules', '.DS_Store', 'generate-manifest.js', 
    'index.html', 'style.css', 'main.js', 'manifest.json', 'manifest.js', 
    'migrate-folders.js', 'compile-summaries.js',
    'Preproduction', 'Production', 'Post production' // explicitly ignore un-prefixed old folders
];

function cleanName(name) {
    return name.replace(/^[0-9]+[\W_]*/, '').trim();
}

function getMediaType(filename) {
    const ext = path.extname(filename).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic'].includes(ext)) {
        return 'image';
    }
    if (['.mp4', '.webm', '.mov', '.m4v'].includes(ext)) {
        return 'video';
    }
    if (['.pdf'].includes(ext)) {
        return 'document';
    }
    return null;
}

function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
        return null;
    }
}

// Flat media finder for a specific directory (non-recursive now, because deep dirs are subcategories)
function getMediaFlat(dirPath, rootRelativePath) {
    let media = [];
    if (!fs.existsSync(dirPath)) return media;

    const items = fs.readdirSync(dirPath);
    for (const item of items) {
        if (IGNORE_LIST.includes(item)) continue;
        
        const fullPath = path.join(dirPath, item);
        let stat;
        try { stat = fs.statSync(fullPath); } catch(e) { continue; }

        if (!stat.isDirectory()) {
            const type = getMediaType(item);
            if (type) {
                const relPath = path.join(rootRelativePath, item);
                media.push({
                    type: type,
                    path: relPath.split(path.sep).join('/'),
                    filename: item
                });
            }
        }
    }
    return media;
}

function processDirectory() {
    const manifest = { stages: [] };

    const items = fs.readdirSync(ROOT_DIR);
    items.sort();

    for (const stageName of items) {
        if (IGNORE_LIST.includes(stageName)) continue;
        
        const stagePath = path.join(ROOT_DIR, stageName);
        let stageStat;
        try { stageStat = fs.statSync(stagePath); } catch(e) { continue; }

        if (!stageStat.isDirectory()) continue;

        const stageNode = {
            id: cleanName(stageName),
            originalName: stageName,
            experiments: []
        };

        const expItems = fs.readdirSync(stagePath);
        expItems.sort();

        for (const expName of expItems) {
            if (IGNORE_LIST.includes(expName)) continue;

            const expPath = path.join(stagePath, expName);
            let expStat;
            try { expStat = fs.statSync(expPath); } catch(e) { continue; }

            if (!expStat.isDirectory()) continue;

            const summaryPath = path.join(expPath, '_summary.md');
            const summary = fs.existsSync(summaryPath) ? readFile(summaryPath) : null;
            
            const relExpPath = path.join(stageName, expName);
            const topMedia = getMediaFlat(expPath, relExpPath);
            
            let subCategories = [];
            const subItems = fs.readdirSync(expPath);
            subItems.sort();
            
            for (const subItem of subItems) {
                if (IGNORE_LIST.includes(subItem)) continue;
                const subPath = path.join(expPath, subItem);
                let subStat;
                try { subStat = fs.statSync(subPath); } catch(e) { continue; }
                
                if (subStat.isDirectory()) {
                    const subSummaryPath = path.join(subPath, '_summary.md');
                    const subSummary = fs.existsSync(subSummaryPath) ? readFile(subSummaryPath) : null;
                    const subRelPath = path.join(relExpPath, subItem);
                    // For subcategories, we scan deeply in case there are further nested files.
                    // But actually just flat scan is fine, or we use recursive for subcategories.
                    // Let's use recursive for subcategories just in case they have folders like `Var 1/raw/`.
                    const subMedia = getMediaRecursive(subPath, subRelPath);
                    subCategories.push({
                        id: cleanName(subItem),
                        originalName: subItem,
                        summary: subSummary,
                        media: subMedia
                    });
                }
            }

            stageNode.experiments.push({
                id: cleanName(expName),
                originalName: expName,
                summary: summary,
                media: topMedia,
                subCategories: subCategories
            });
        }

        if (stageNode.experiments.length > 0) {
            manifest.stages.push(stageNode);
        }
    }

    const jsContent = `window.SITE_MANIFEST = ${JSON.stringify(manifest, null, 2)};`;
    fs.writeFileSync(OUTPUT_FILE, jsContent);
    console.log(`Manifest generated successfully at ${OUTPUT_FILE}`);
}

function getMediaRecursive(dirPath, rootRelativePath = '') {
    let media = [];
    if (!fs.existsSync(dirPath)) return media;

    const items = fs.readdirSync(dirPath);
    for (const item of items) {
        if (IGNORE_LIST.includes(item)) continue;
        
        const fullPath = path.join(dirPath, item);
        const relPath = path.join(rootRelativePath, item);
        let stat;
        try { stat = fs.statSync(fullPath); } catch(e) { continue; }

        if (stat.isDirectory()) {
            media = media.concat(getMediaRecursive(fullPath, relPath));
        } else {
            const type = getMediaType(item);
            if (type) {
                media.push({
                    type: type,
                    path: relPath.split(path.sep).join('/'),
                    filename: item
                });
            }
        }
    }
    return media;
}

processDirectory();
