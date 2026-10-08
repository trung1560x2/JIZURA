import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { J } from './jizura-core.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

console.log('Testing JIZURA Core & MCP functions...');

// Test 1: Create project
const prj = J.defaultProject();
prj.title = 'Test Song';
prj.lyrics = `[00:00.00]Ánh sáng nơi chân trời/dần hé mở
[00:04.00]Từng bước chân âm thầm trong đêm
[00:08.00]*Hy vọng* chưa bao giờ dập tắt!
[00:12.00]Ta sẽ bay lên đỉnh vinh quang`;
prj.lang = 'vi';
prj.style = 'cyber';

const plan = J.plan(prj);
console.log('✓ Test 1: Created project. Duration:', plan.duration, 'Cuts count:', plan.cuts.length);

// Test 2: Generate variation
const varPrj = J.omakase(prj, Math.random, 'kinetic');
console.log('✓ Test 2: Variation style:', varPrj.style, 'mood:', varPrj.mood);

// Test 3: Plan for AE
const aeData = J.planForAE(plan, prj);
console.log('✓ Test 3: AE Export dimensions:', aeData.width, 'x', aeData.height, 'AE cuts:', aeData.cuts.length);

// Test 4: Parse lyrics
const parsed = J.parseLyrics(prj.lyrics);
console.log('✓ Test 4: Parse lyrics count:', parsed.lines.length);

console.log('All tests passed successfully!');
