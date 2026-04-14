const fs = require('fs');
const path = require('path');

const summaries = {
    "01_Preproduction/04_Material Experiment": "Before any narrative decisions were made, three analogue film stocks were tested as potential biological substrates: Kodak E100, Scala 50, and Ultra Max 400. The question was not aesthetic but material — which emulsion would accept fungal mold as a participant rather than a contaminant, and what visual qualities would each cultivation produce. The experiments established which stock would carry the organism into the film's logic.",
    "01_Preproduction/04_Material Experiment/01_Kodak E100": "Kodak E100 is a fine-grain colour reversal slide film. This batch of tests documents how the emulsion responded to fungal cultivation — the colour shifts, surface degradation, and growth patterns specific to this stock's chemical composition. The results here informed whether E100 could serve as a substrate for the interval shooting and compositing methods developed later in production.",
    "01_Preproduction/04_Material Experiment/02_Scala 50": "Scala 50 is a black-and-white reversal film with high contrast and fine grain. The cultivation tests on this stock produced a different register of material damage than the colour stocks — more tonal, more graphic. These experiments explored whether the mold's presence would read differently when stripped of colour, and what that difference might mean for the film's visual and narrative grammar.",
    "01_Preproduction/04_Material Experiment/03_Ultramax 400": "Ultra Max 400 is a faster colour negative film with a coarser grain structure. Tested as the third candidate substrate, this stock's higher sensitivity and different base chemistry produced distinct growth behaviour. The documentation here records how the mold metabolised this emulsion and whether the resulting imagery was legible within the fiction the film was constructing.",
    "01_Preproduction/01_Script": "Two drafts of the script were developed for Stains of Fear. The script centres on Jonas, a character whose vision and environment are progressively colonised by mold. These drafts trace the evolution of the narrative logic — how the biological material was written into the story not as visual effect but as structural participant, shaping what Jonas sees, what the camera shows, and how the fiction is organised around an organism that does not follow dramatic convention.",
    "01_Preproduction/03_Decoupage": "Three distinct approaches to shot breakdown were developed before production, each proposing a different relationship between the camera and the mold. The decoupage was not a conventional shooting plan but a series of hypotheses about how biological time and cinematic time could be made to coexist. Each approach carried different implications for editing rhythm, narrative coherence, and the degree to which the material would be legible as story.",
    "01_Preproduction/03_Decoupage/01_Surveillance POV": "The first approach treated the mold as something to be observed — a fixed, surveillance-style camera showing the organism's presence from the outside. This decoupage proposed a clinical distance, framing the mold as subject rather than agent. It was ultimately set aside because it maintained the camera's authority over the material rather than allowing the material to affect the camera's logic.",
    "01_Preproduction/03_Decoupage/02_Classic Decoupage": "The second approach applied conventional continuity editing to the material — shot/reverse shot, eyeline match, motivated cutting. This draft tested whether classical Hollywood grammar could absorb the biological element without erasing it, or whether the mold would remain a decoration within a structure it had no power to alter. The tension between this approach and the material's actual behaviour was productive in defining what the final decoupage needed to resist.",
    "01_Preproduction/03_Decoupage/03_Mould-paced Decoupage": "The third approach allowed the pace and spatial logic of the mold's growth to determine the editing rhythm. Rather than cutting to perception or narrative causality, cuts were organised around the organism's own temporal patterns — slow, irregular, indifferent to story. This became the operative principle for the final film, establishing the mold not as content within the edit but as a structuring force acting on it.",
    "03_Post-production/01_Visual/01_16mm Printing": "Selected sequences were printed onto 16mm film stock, which was then subjected to fungal cultivation and used to construct Jonas's subjective POV — the visual field of a character being consumed by the organism he lives with. The printing process introduced a second layer of material transformation: the image passed through chemical photography, then through biological metabolism, before re-entering the digital edit. This folder documents the printing setup, the cultivated results, and the BTS of that process.",
    "03_Post-production/01_Visual/02_Mould Slides Composited": "Still images of the window — one of the film's recurring spaces — were printed, cultivated with mold, photographed as slides, and then composited onto the screens and photographs visible within the fiction. The mold seen by the audience in these frames is not a digital effect but a material event that occurred on a physical photograph before the film was assembled. This folder documents the cultivation of the slide images, the composite results, and the decisions made in integrating biological and digital material within a single frame.",
    "03_Post-production/01_Visual/03_Interval Shooting": "A single cultivated slide was photographed at timed intervals as the mold developed, producing a sequence that records biological time as cinematic duration. This method was used to show Jonas's vision progressively colonised — each frame a real increment of growth, not a simulation of it. The folder documents the shooting apparatus, the interval sequence, and the organism's behaviour across the full duration of the shoot.",
    "03_Post-production/02_Audio/01_Sound": "Sound design for the film remained open during production. This folder documents the exploration — references, tests, and notes on how the mold's material presence might be given an acoustic dimension. The question of whether biological time could be sounded, and what register that sound should occupy in relation to the image, was not resolved in production and continued into post.",
    "03_Post-production/03_Edit/01_16mm Overlay Modes": "In the edit, the cultivated 16mm material was tested across several modes of overlaying — superimposition, double exposure, blending with digital footage, and frame-by-frame compositing. Each mode produced a different relationship between the biological film and the recorded fiction, and a different claim about what the mold was doing to the image. This folder documents the editing experiments, timeline screenshots, and the decisions that led to the final treatment of the 16mm material within the assembled film."
};

const mappings = [
    { from: "Preproduction/Script", to: "01_Preproduction/01_Script" },
    { from: "Preproduction/Storyboard", to: "01_Preproduction/02_Storyboard" },
    { from: "Preproduction/Decoupage/Var 1", to: "01_Preproduction/03_Decoupage/01_Surveillance POV" },
    { from: "Preproduction/Decoupage/Var 2", to: "01_Preproduction/03_Decoupage/02_Classic Decoupage" },
    { from: "Preproduction/Decoupage/Var 3", to: "01_Preproduction/03_Decoupage/03_Mould-paced Decoupage" },
    { from: "Preproduction/Material Experiments/Kodak E100", to: "01_Preproduction/04_Material Experiment/01_Kodak E100" },
    { from: "Preproduction/Material Experiments/Adox Scala", to: "01_Preproduction/04_Material Experiment/02_Scala 50" },
    // Also handling Illford assuming it might belong somewhere, but user explicitly mentioned Ultramax.
    { from: "Preproduction/Material Experiments/Kodak Ultra Max 400", to: "01_Preproduction/04_Material Experiment/03_Ultramax 400" },
    { from: "Post production/Scan 16 mm", to: "03_Post-production/01_Visual/01_16mm Printing" },
    { from: "Post production/Slides", to: "03_Post-production/01_Visual/02_Mould Slides Composited" },
    { from: "Post production/Interval shooting", to: "03_Post-production/01_Visual/03_Interval Shooting" },
    { from: "Production", to: "02_Production" }
];

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// Ensure all new parent directories exist
mappings.forEach(map => {
    ensureDir(path.dirname(map.to));
});

// Rename existing directories
mappings.forEach(map => {
    if (fs.existsSync(map.from) && !fs.existsSync(map.to)) {
        fs.renameSync(map.from, map.to);
        console.log(`Moved: ${map.from} -> ${map.to}`);
    }
});

// Rename 'Preproduction/Material Experiments/Illford xp2' if it exists to generic fourth element 
if (fs.existsSync('Preproduction/Material Experiments/Illford xp2') && !fs.existsSync('01_Preproduction/04_Material Experiment/04_Illford xp2')) {
    fs.renameSync('Preproduction/Material Experiments/Illford xp2', '01_Preproduction/04_Material Experiment/04_Illford xp2');
}

// Clean up old top directories if empty
for (const oldDir of ['Preproduction/Material Experiments', 'Preproduction/Decoupage', 'Preproduction', 'Post production']) {
    try {
        if (fs.existsSync(oldDir) && fs.readdirSync(oldDir).length === 0) {
            fs.rmdirSync(oldDir);
        }
    } catch(e) {}
}

// Ensure all new target structures exist even if there were no original files
Object.keys(summaries).forEach(dir => ensureDir(dir));
ensureDir("02_Production/01_BTS");

// Write summaries
for (const [dir, text] of Object.entries(summaries)) {
    const summaryFile = path.join(dir, '_summary.md');
    fs.writeFileSync(summaryFile, text);
    console.log(`Wrote summary: ${summaryFile}`);
}

console.log("Migration complete.");
