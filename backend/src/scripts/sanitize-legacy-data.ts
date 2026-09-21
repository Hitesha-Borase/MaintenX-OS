import fs from 'fs';
import path from 'path';

const REPLACEMENTS: [RegExp, string][] = [
  // Specific titles
  [/Marcus Vance \(Senior Tech\)/g, 'David Markov (Maintenance Lead)'],
  [/Marcus Vance \(Lead Tech\)/g, 'David Markov (Maintenance Lead)'],
  [/Marcus Vance \(Reliability Specialist\)/g, 'David Markov (Maintenance Lead)'],
  [/Senior Reliability Specialist Marcus Vance/g, 'Maintenance Lead David Markov'],
  [/Marcus Vance \(Maint\)/g, 'David Markov (Maint)'],
  [/Marcus Vance/g, 'David Markov'],

  [/Dr\. Rachel Thorne \(Quality Assurance Lead\)/g, 'Stephanie Kuzmych (QA Manager & HACCP Lead)'],
  [/Dr\. Rachel Thorne \(QA Lead\)/g, 'Stephanie Kuzmych (QA Manager & HACCP Lead)'],
  [/Dr\. Rachel Thorne/g, 'Stephanie Kuzmych'],
  [/Rachel Thorne/g, 'Stephanie Kuzmych'],
  [/Dr\. Aris Thorne \(QA\)/g, 'Stephanie Kuzmych (QA)'],

  [/Sarah Jenkins \(Lead Tech\)/g, 'David Markov (Maintenance Lead)'],
  [/Sarah Jenkins \(Quality Tech\)/g, 'Beth Simpson (QA Tech)'],
  [/Sarah Jenkins \(Prod\)/g, 'Ronald Robinson (Prod)'],
  [/Sarah Jenkins/g, 'Stephanie Kuzmych'],

  [/Carlos Mendez \(Mechanical Lead\)/g, 'David Markov (Maintenance Lead)'],
  [/Carlos Mendez/g, 'Ashley Kulcar'],

  [/Elena Rostova \(Autonomous Care\)/g, 'Josiah Leyland (Machine Operator)'],
  [/Elena Rostova \(Lead Planner\)/g, 'Stefan Crawford (Plant Manager)'],
  [/Elena Rostova \(Operator\)/g, 'Josiah Leyland (Operator)'],
  [/Supervisor Elena Rostova/g, 'Supervisor Ronald Robinson'],
  [/Elena Rostova/g, 'Ronald Robinson'],

  [/Alexander Vance \(Lead Scheduler\)/g, 'Stefan Crawford (Plant Manager)'],
  [/Alexander Vance \(Operations Supervisor\)/g, 'Ronald Robinson (Operations Supervisor)'],
  [/Alexander Vance \(Line Operator\)/g, 'Josiah Leyland (Line Operator)'],
  [/Alexander Vance/g, 'Ronald Robinson'],

  [/Dave Miller/g, 'David Markov'],
  [/Arthur Sterling/g, 'Pete Vanslyke'],
  [/Viktor Hayes/g, 'Stefan Crawford'],

  // Specific old facility / company names in UI strings
  [/Indore Mega Bottling & Canning Facility/g, 'Plant 1 - Meat Processing & Smokehouse Facility'],
  [/Indore Mega Bottling Facility/g, 'Plant 1 - Meat Processing & Smokehouse Facility'],
  [/Indore Mega Facility/g, 'Plant 1 - Meat Processing & Smokehouse Facility'],
  [/Indore Plant/g, 'Plant 1 - Meat Processing & Smokehouse Facility'],
  [/Indore Packaging & Beverage Ingredients Ltd/g, 'Winpak Packaging & Specialty Films Ltd'],
  [/Safety Lead \(Indore Plant\)/g, 'Stephanie Kuzmych (QA & Safety Lead)'],
  [/WH-MAIN-INDORE/g, 'WH-MEAT-01'],
];

const TARGET_DIRS = [
  path.resolve('d:/kiaan/Maintenance-os/MaintenX-OS/frontend/src'),
  path.resolve('d:/kiaan/Maintenance-os/MaintenX-OS/backend/src'),
];

function processDirectory(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist' && entry.name !== 'build') {
        processDirectory(fullPath);
      }
    } else if (/\.(jsx?|tsx?|json)$/.test(entry.name)) {
      // Don't modify migration files or this script itself
      if (entry.name === 'sanitize-legacy-data.ts') continue;
      
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      for (const [regex, replacement] of REPLACEMENTS) {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

for (const d of TARGET_DIRS) {
  processDirectory(d);
}
console.log('Sanitization complete!');
