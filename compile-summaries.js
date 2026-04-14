const fs = require('fs');
const path = require('path');

const experimentsWithSubs = [
    "01_Preproduction/03_Decoupage",
    "01_Preproduction/04_Material Experiment",
    "03_Post-production/01_Visual",
    "03_Post-production/02_Audio",
    "03_Post-production/03_Edit"
];

experimentsWithSubs.forEach(expDir => {
    if (!fs.existsSync(expDir)) return;
    
    let mainSummaryPath = path.join(expDir, '_summary.md');
    let mainText = fs.existsSync(mainSummaryPath) ? fs.readFileSync(mainSummaryPath, 'utf8') : '';
    
    // Read all subdirectories
    let hasAdditions = false;
    let appendedText = mainText;

    const subs = fs.readdirSync(expDir);
    subs.sort();
    
    subs.forEach(sub => {
        let subPath = path.join(expDir, sub);
        let stat = fs.statSync(subPath);
        if (stat.isDirectory()) {
            let subSummaryPath = path.join(subPath, '_summary.md');
            if (fs.existsSync(subSummaryPath)) {
                let subText = fs.readFileSync(subSummaryPath, 'utf8');
                let cleanSubName = sub.replace(/^[0-9]+[\W_]*/, '').trim();
                appendedText += `\n\n### ${cleanSubName}\n` + subText;
                hasAdditions = true;
            }
        }
    });

    if (hasAdditions) {
        fs.writeFileSync(mainSummaryPath, appendedText);
        console.log(`Updated combined summary for: ${expDir}`);
    }
});
