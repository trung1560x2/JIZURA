import fs from 'fs';
import path from 'path';
import { J } from './jizura-core.js';

const lyrics = `[00:00.00][interlude 3]
[00:03.00]Ánh bình minh/rực rỡ/nơi chân trời xa
[00:07.50]Bước chân qua muôn trùng sóng gió
[00:11.00]*Khát vọng* cháy bỏng trong từng con tim!
[00:15.50]Cất cao lời ca/bay về phía tương lai`;

let prj = J.defaultProject();
prj.title = 'Ánh Sáng Tương Lai';
prj.artist = 'AI Creator';
prj.lyrics = lyrics;
prj.lang = 'vi';
prj.aspect = '16:9';
prj.fps = 24;
Object.assign(prj, J.omakase(prj, Math.random, 'kinetic'));
prj.style = 'magenta';

const plan = J.plan(prj);
const ae = J.planForAE(plan, prj);

const prjPath = 'E:/JIZURA/demo_vietnam.jizura.json';
const aePath = 'E:/JIZURA/demo_vietnam_ae.json';

fs.writeFileSync(prjPath, JSON.stringify(prj, null, 2));
fs.writeFileSync(aePath, JSON.stringify(ae, null, 2));
console.log('Demo created! Duration:', plan.duration, 'Cuts:', plan.cuts.length, 'AE cuts:', ae.cuts.length);
