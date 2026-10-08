#!/usr/bin/env node
/**
 * JIZURA MCP Server
 * Model Context Protocol Server for JIZURA — Kinetic Typography Lyric Video Maker
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec, spawn } from 'child_process';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { J } from './jizura-core.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

const server = new McpServer({
  name: 'jizura-mcp-server',
  version: '1.0.0'
});

// Helper: load or resolve a project
function resolveProject(projectPath, projectData, lyrics) {
  if (projectPath) {
    const fullPath = path.isAbsolute(projectPath) ? projectPath : path.join(ROOT, projectPath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Project file not found at: ${fullPath}`);
    }
    const raw = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(raw);
  }
  if (projectData) {
    if (typeof projectData === 'string') {
      return JSON.parse(projectData);
    }
    return projectData;
  }
  const prj = J.defaultProject();
  if (lyrics) {
    prj.lyrics = lyrics;
  }
  return prj;
}

// -------------------------------------------------------------------------
// Tools
// -------------------------------------------------------------------------

// 1. Create Project
server.tool(
  'jizura_create_project',
  'Create a new JIZURA lyric motion video project with customizable lyrics, style, theme, mood, aspect ratio, and timing parameters.',
  {
    lyrics: z.string().describe('Lyrics text. Supports plain text, LRC tags [mm:ss.xx], manual cuts with "/", emphasis with *words*, notes with word|note, and interludes [interlude 8].'),
    title: z.string().optional().describe('Song title.'),
    artist: z.string().optional().describe('Artist name.'),
    style: z.string().optional().describe('Visual style key (e.g. noir, crimson, caution, magenta, paper, hud, mint, specimen, transit, blueprint).'),
    theme: z.enum(['lyricpv', 'kinetic', 'wa', 'horror', 'pop', 'ballad']).optional().describe('High-level theme to guide the visual direction and animations.'),
    mood: z.enum(['glitch', 'calm', 'pop', 'graphic', 'editorial', 'emotional', 'horror', 'chaos']).optional().describe('Emotional mood affecting glitch, camera, and layout choices.'),
    aspect: z.enum(['16:9', '9:16', '1:1']).optional().default('16:9').describe('Aspect ratio.'),
    res: z.number().optional().default(1080).describe('Resolution height in pixels (e.g. 720, 1080).'),
    fps: z.number().optional().default(24).describe('Video framerate (e.g. 24, 30, 60).'),
    bpm: z.number().optional().describe('Song tempo in beats per minute for beat-synced cuts.'),
    lang: z.enum(['auto', 'ja', 'zh-Hant', 'zh-Hans', 'ko', 'en', 'vi']).optional().default('auto').describe('Lyrics language font tuning.'),
    wa: z.boolean().optional().describe('Include Japanese traditional visual motifs (shoji, lanterns, kamon).'),
    horror: z.boolean().optional().describe('Include horror typography pack.'),
    typo: z.boolean().optional().describe('Include typographic kinetic effects.'),
    unify: z.boolean().optional().describe('Enforce unified style across repeated phrases and choruses.'),
    typeset: z.boolean().optional().describe('Enable fine typographic spacing and punctuation adjustments.'),
    center_free: z.boolean().optional().describe('Keep center screen clear for video subject or character illustration.'),
    seed: z.number().optional().describe('Random seed for layout generator.'),
    output_path: z.string().optional().describe('Optional file path to save the .jizura.json project file directly.')
  },
  async (args) => {
    let prj = J.defaultProject();
    prj.lyrics = args.lyrics;
    if (args.title) prj.title = args.title;
    if (args.artist) prj.artist = args.artist;
    if (args.aspect) prj.aspect = args.aspect;
    if (args.res) prj.res = args.res;
    if (args.fps) prj.fps = args.fps;
    if (args.lang) prj.lang = args.lang;
    if (args.seed !== undefined) prj.seed = args.seed;
    if (args.wa !== undefined) prj.wa = args.wa;
    if (args.horror !== undefined) prj.horror = args.horror;
    if (args.typo !== undefined) prj.typo = args.typo;
    if (args.unify !== undefined) prj.unify = args.unify;
    if (args.typeset !== undefined) prj.typeset = args.typeset;
    if (args.center_free !== undefined) prj.centerFree = args.center_free;
    if (args.bpm) prj.timing.bpm = args.bpm;

    if (args.theme) {
      Object.assign(prj, J.omakase(prj, Math.random, args.theme));
    }
    if (args.style) {
      prj.style = args.style;
    }
    if (args.mood) {
      prj.mood = args.mood;
    }

    const plan = J.plan(prj);

    let savedPath = null;
    if (args.output_path) {
      savedPath = path.isAbsolute(args.output_path) ? args.output_path : path.join(ROOT, args.output_path);
      fs.mkdirSync(path.dirname(savedPath), { recursive: true });
      fs.writeFileSync(savedPath, JSON.stringify(prj, null, 2), 'utf8');
    }

    const response = {
      message: 'JIZURA project created successfully',
      project_summary: {
        title: prj.title || '(Untitled)',
        artist: prj.artist || '(Unknown)',
        style: prj.style,
        theme: prj.themeId || args.theme || 'default',
        mood: prj.mood || 'default',
        aspect: prj.aspect,
        fps: prj.fps,
        seed: prj.seed,
        duration_seconds: plan.duration ? +plan.duration.toFixed(2) : 0,
        total_cuts: plan.cuts ? plan.cuts.length : 0,
        detected_language: plan.lang
      },
      saved_path: savedPath,
      project_data: prj
    };

    return {
      content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
    };
  }
);

// 2. Generate Variation (Omakase)
server.tool(
  'jizura_generate_variation',
  'Roll a coherent new aesthetic variation (style, animations, camera motion, fonts, and layout) using JIZURA omakase generator.',
  {
    project_path: z.string().optional().describe('Path to an existing .jizura.json project file.'),
    project_data: z.string().optional().describe('Existing project JSON string.'),
    lyrics: z.string().optional().describe('Lyrics text if starting new.'),
    theme: z.enum(['lyricpv', 'kinetic', 'wa', 'horror', 'pop', 'ballad']).optional().describe('Theme to steer the variation.'),
    seed: z.number().optional().describe('Custom seed. If omitted, a fresh random seed is picked.'),
    output_path: z.string().optional().describe('Optional path to save the new variation as a .jizura.json file.')
  },
  async (args) => {
    let basePrj = resolveProject(args.project_path, args.project_data, args.lyrics);
    let nextPrj = JSON.parse(JSON.stringify(basePrj));
    Object.assign(nextPrj, J.omakase(nextPrj, Math.random, args.theme || basePrj.themeId || null));
    if (args.seed !== undefined) {
      nextPrj.seed = args.seed;
    }

    const plan = J.plan(nextPrj);

    let savedPath = null;
    if (args.output_path) {
      savedPath = path.isAbsolute(args.output_path) ? args.output_path : path.join(ROOT, args.output_path);
      fs.mkdirSync(path.dirname(savedPath), { recursive: true });
      fs.writeFileSync(savedPath, JSON.stringify(nextPrj, null, 2), 'utf8');
    }

    const response = {
      message: 'Generated new creative variation',
      variation_details: {
        style: nextPrj.style,
        theme: nextPrj.themeId,
        mood: nextPrj.mood,
        seed: nextPrj.seed,
        duration: plan.duration ? +plan.duration.toFixed(2) : 0,
        cuts_count: plan.cuts ? plan.cuts.length : 0,
        sample_first_cut: plan.cuts && plan.cuts[0] ? {
          text: plan.cuts[0].text,
          layout: plan.cuts[0].layout,
          enter: plan.cuts[0].enter,
          exit: plan.cuts[0].exit
        } : null
      },
      saved_path: savedPath,
      project_data: nextPrj
    };

    return {
      content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
    };
  }
);

// 3. Plan Timeline
server.tool(
  'jizura_plan_timeline',
  'Calculate and inspect the full timed cut plan, animations, camera movements, decorations, and transitions for each line/phrase of the song.',
  {
    project_path: z.string().optional().describe('Path to .jizura.json project file.'),
    project_data: z.string().optional().describe('Project JSON string.'),
    lyrics: z.string().optional().describe('Lyrics text if planning directly from lyrics.')
  },
  async (args) => {
    const prj = resolveProject(args.project_path, args.project_data, args.lyrics);
    const plan = J.plan(prj);

    const cutsSummary = (plan.cuts || []).map((c, idx) => ({
      index: idx + 1,
      text: c.text,
      line_text: c.lineText,
      start: +c.start.toFixed(2),
      end: +c.end.toFixed(2),
      dur: +c.dur.toFixed(2),
      layout: c.layout,
      enter: c.enter,
      exit: c.exit,
      hold: c.hold,
      decor: c.decor,
      treat: c.treat,
      bg: c.bg,
      cam: c.cam,
      trans: c.trans
    }));

    const response = {
      title: plan.title,
      artist: plan.artist,
      style: plan.styleKey,
      aspect: `${plan.W}x${plan.H}`,
      fps: plan.fps,
      total_duration_seconds: plan.duration ? +plan.duration.toFixed(2) : 0,
      total_cuts: cutsSummary.length,
      cuts: cutsSummary
    };

    return {
      content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
    };
  }
);

// 4. Parse Lyrics
server.tool(
  'jizura_parse_lyrics',
  'Parse raw lyrics text to inspect lines, timing tags (LRC), manual split cuts (/), emphasis (*words*), ruby text, and interludes.',
  {
    lyrics: z.string().describe('Raw lyrics string to parse.')
  },
  async (args) => {
    const parsed = J.parseLyrics(args.lyrics);
    const lines = parsed.lines || [];
    const meta = parsed.meta || {};

    const response = {
      total_lines: lines.length,
      metadata: meta,
      lines: lines.map((l, idx) => ({
        index: idx + 1,
        text: l.text,
        time: l.lrc !== undefined && l.lrc !== null ? +l.lrc.toFixed(2) : null,
        emphasis: l.emph || [],
        manual_cuts: l.manual || null,
        note: l.note || null,
        impact: l.impact || false,
        is_interlude: l.interlude || false,
        interlude_seconds: l.secs || null
      }))
    };

    return {
      content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
    };
  }
);

// 5. Export for Adobe After Effects
server.tool(
  'jizura_export_ae',
  'Export project composition to After Effects JSON v2 format, ready for import into Adobe After Effects via JIZURA_AE_en.jsx or CEP panel.',
  {
    project_path: z.string().optional().describe('Path to .jizura.json project file.'),
    project_data: z.string().optional().describe('Project JSON string.'),
    output_path: z.string().describe('File path to write the AE JSON (e.g. E:\\JIZURA\\export_ae.json).'),
    range_start: z.number().optional().describe('Start line index (0-indexed) for partial export.'),
    range_end: z.number().optional().describe('End line index (0-indexed) for partial export.')
  },
  async (args) => {
    const prj = resolveProject(args.project_path, args.project_data);
    const plan = J.plan(prj);

    let range = null;
    if (args.range_start !== undefined && args.range_end !== undefined) {
      range = { from: args.range_start, to: args.range_end };
    }

    const aeData = J.planForAE(plan, prj, range);

    const outPath = path.isAbsolute(args.output_path) ? args.output_path : path.join(ROOT, args.output_path);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(aeData, null, 2), 'utf8');

    const response = {
      message: 'Exported After Effects JSON successfully',
      output_file: outPath,
      ae_version: aeData.version,
      dimension: `${aeData.width}x${aeData.height}`,
      duration: aeData.duration ? +aeData.duration.toFixed(2) : 0,
      total_cuts: aeData.cuts ? aeData.cuts.length : 0,
      instructions: 'Open Adobe After Effects -> File -> Scripts -> Run Script File -> Select JIZURA_AE_en.jsx (or use Window -> Extensions -> JIZURA CEP Panel) and import this JSON file.'
    };

    return {
      content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
    };
  }
);

// 6. List Presets & Capabilities
server.tool(
  'jizura_list_presets',
  'Get comprehensive lists of all 27 visual styles, moods, themes, aspect ratios, and animation categories in JIZURA.',
  {},
  async () => {
    const styles = J.STYLE_ORDER.map(k => {
      const s = J.STYLES[k];
      return {
        key: k,
        name: s.name || k,
        dark: s.dark,
        colors: {
          bg: s.bg,
          text: s.text,
          accent: s.accent
        }
      };
    });

    const themes = Object.entries(J.THEMES).map(([k, t]) => ({
      key: k,
      name: t.name,
      moods: t.moods || []
    }));

    const moods = Object.entries(J.MOODS).map(([k, m]) => ({
      key: k,
      name: m.name
    }));

    const response = {
      styles_count: styles.length,
      styles,
      themes,
      moods,
      aspect_ratios: ['16:9', '9:16', '1:1'],
      supported_languages: ['auto', 'ja', 'zh-Hant', 'zh-Hans', 'ko', 'en', 'vi'],
      techniques: J.GROUP_KEYS
    };

    return {
      content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
    };
  }
);

// 7. Preview in Browser
server.tool(
  'jizura_preview_in_browser',
  'Open the JIZURA web interface in the browser with the project preloaded and ready to edit or play.',
  {
    project_path: z.string().optional().describe('Path to .jizura.json project file.'),
    project_data: z.string().optional().describe('Project JSON string.'),
    lyrics: z.string().optional().describe('Lyrics text if creating a preview directly.'),
    lang: z.enum(['vi', 'en', 'ja', 'ko', 'zh-hant', 'zh-hans', 'id']).optional().default('vi').describe('Language of UI to open (default: vi).')
  },
  async (args) => {
    const prj = resolveProject(args.project_path, args.project_data, args.lyrics);
    const previewFile = path.join(ROOT, 'preview_project.json');
    fs.writeFileSync(previewFile, JSON.stringify(prj, null, 2), 'utf8');

    const port = 8000;
    const url = `http://localhost:${port}/${args.lang}/?load=/preview_project.json`;

    // Attempt to open URL in default browser
    if (process.platform === 'win32') {
      exec(`start "" "${url}"`);
    } else if (process.platform === 'darwin') {
      exec(`open "${url}"`);
    } else {
      exec(`xdg-open "${url}"`);
    }

    const response = {
      message: 'Project saved and browser launched',
      preview_file: previewFile,
      url: url,
      tip: 'Ensure the local server is running (double-click start-jizura.bat or run "python serve.py") to view the project.'
    };

    return {
      content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
    };
  }
);

// 8. Batch Variations
server.tool(
  'jizura_batch_variations',
  'Generate multiple distinct aesthetic variations for the same lyrics, saving each variation as a project file for side-by-side comparison.',
  {
    lyrics: z.string().describe('Lyrics text.'),
    count: z.number().optional().default(3).describe('Number of variations to generate (default: 3).'),
    themes: z.array(z.enum(['lyricpv', 'kinetic', 'wa', 'horror', 'pop', 'ballad'])).optional().describe('Specific themes to cycle through.'),
    output_dir: z.string().optional().describe('Directory to save project files (default: E:\\JIZURA\\variations).')
  },
  async (args) => {
    const targetDir = args.output_dir
      ? (path.isAbsolute(args.output_dir) ? args.output_dir : path.join(ROOT, args.output_dir))
      : path.join(ROOT, 'variations');

    fs.mkdirSync(targetDir, { recursive: true });

    const themePool = args.themes && args.themes.length > 0
      ? args.themes
      : ['lyricpv', 'kinetic', 'wa', 'horror', 'pop', 'ballad'];

    const results = [];
    const count = Math.min(Math.max(args.count || 3, 1), 10);

    for (let i = 0; i < count; i++) {
      const theme = themePool[i % themePool.length];
      let prj = J.defaultProject();
      prj.lyrics = args.lyrics;
      Object.assign(prj, J.omakase(prj, Math.random, theme));
      prj.seed = Math.floor(Math.random() * 100000000);

      const filename = `variation_${i + 1}_${theme}_${prj.style}.jizura.json`;
      const filePath = path.join(targetDir, filename);
      fs.writeFileSync(filePath, JSON.stringify(prj, null, 2), 'utf8');

      const plan = J.plan(prj);

      results.push({
        variation: i + 1,
        file: filePath,
        filename: filename,
        theme: theme,
        style: prj.style,
        mood: prj.mood,
        seed: prj.seed,
        duration: plan.duration ? +plan.duration.toFixed(2) : 0,
        cuts: plan.cuts ? plan.cuts.length : 0
      });
    }

    const response = {
      message: `Generated ${results.length} variations successfully`,
      output_directory: targetDir,
      variations: results
    };

    return {
      content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
    };
  }
);

// 9. Auto-Sync Audio with Whisper AI
server.tool(
  'jizura_auto_sync_audio',
  'Transcribe an audio file using Whisper AI to automatically synchronize lyrics and generate precise LRC timestamps ([mm:ss.xx]).',
  {
    audio_path: z.string().describe('Path to the audio file (.mp3, .wav, .m4a, .ogg, .flac).'),
    lyrics: z.string().optional().describe('Optional existing lyric lines to align with the vocal track.'),
    model_size: z.enum(['tiny', 'base', 'small']).optional().default('base').describe('Whisper model size (default: base).'),
    lang: z.string().optional().describe('Language hint (e.g. vi, en, ja). Default: auto-detect.'),
    output_lrc_path: z.string().optional().describe('Optional file path to save the generated .lrc file.')
  },
  async (args) => {
    const fullAudioPath = path.isAbsolute(args.audio_path) ? args.audio_path : path.join(ROOT, args.audio_path);
    if (!fs.existsSync(fullAudioPath)) {
      throw new Error(`Audio file not found at: ${fullAudioPath}`);
    }

    const scriptPath = path.join(ROOT, 'tools', 'whisper_sync.py');
    const cmdArgs = [scriptPath, '--audio', fullAudioPath, '--model', args.model_size || 'base'];
    if (args.lang) {
      cmdArgs.push('--lang', args.lang);
    }

    let tempLyricsFile = null;
    if (args.lyrics) {
      tempLyricsFile = path.join(ROOT, 'temp_lyrics.txt');
      fs.writeFileSync(tempLyricsFile, args.lyrics, 'utf8');
      cmdArgs.push('--lyrics', tempLyricsFile);
    }

    let outLrcPath = args.output_lrc_path
      ? (path.isAbsolute(args.output_lrc_path) ? args.output_lrc_path : path.join(ROOT, args.output_lrc_path))
      : null;

    if (outLrcPath) {
      cmdArgs.push('--out', outLrcPath);
    }

    const proc = await new Promise((resolve, reject) => {
      const child = spawn('python', cmdArgs, { stdio: ['ignore', 'pipe', 'pipe'] });
      let stdout = '';
      let stderr = '';
      child.stdout.on('data', d => { stdout += d.toString(); });
      child.stderr.on('data', d => { stderr += d.toString(); });
      child.on('close', code => {
        if (tempLyricsFile && fs.existsSync(tempLyricsFile)) {
          try { fs.unlinkSync(tempLyricsFile); } catch (e) {}
        }
        if (code === 0) resolve({ stdout, stderr });
        else reject(new Error(`Whisper process failed (code ${code}): ${stderr}`));
      });
      child.on('error', err => {
        if (tempLyricsFile && fs.existsSync(tempLyricsFile)) {
          try { fs.unlinkSync(tempLyricsFile); } catch (e) {}
        }
        reject(err);
      });
    });

    let lrcText = proc.stdout.trim();
    if (outLrcPath && fs.existsSync(outLrcPath)) {
      lrcText = fs.readFileSync(outLrcPath, 'utf8');
    }

    const response = {
      message: 'Audio synchronized successfully with Whisper AI',
      audio_file: fullAudioPath,
      output_lrc_path: outLrcPath,
      lrc: lrcText
    };

    return {
      content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
    };
  }
);

// -------------------------------------------------------------------------
// Resources
// -------------------------------------------------------------------------

server.resource(
  'styles-reference',
  'jizura://styles',
  async (uri) => {
    const data = J.STYLE_ORDER.map(k => ({
      key: k,
      name: J.STYLES[k].name,
      bg: J.STYLES[k].bg,
      text: J.STYLES[k].text,
      accent: J.STYLES[k].accent
    }));
    return {
      contents: [{
        uri: uri.href,
        text: JSON.stringify(data, null, 2),
        mimeType: 'application/json'
      }]
    };
  }
);

server.resource(
  'syntax-reference',
  'jizura://syntax',
  async (uri) => {
    const guide = `# JIZURA Lyrics Syntax Guide

1. Line Breaks:
   Each line corresponds to one phrase/sentence in the song.

2. Timing Tags (LRC):
   [01:23.45]Lyric line here
   Specifies the exact timestamp when this line starts.

3. Interludes:
   [interlude 8]
   Inserts an 8-second instrumental interlude with background graphics and camera animation only.

4. Manual Cuts:
   Remember/the dawn/that came
   Splits a single lyric line across multiple rapid kinetic cuts using "/".

5. Emphasis:
   *word*
   Marks a word for dramatic typographic accentuation.

6. Exclamation:
   End a line with "!" to trigger screen flash, shake, and high-energy impact.

7. Ruby / Pronunciation:
   kanji|furigana
   Adds tiny annotation text above or beside the main word.

8. Comments:
   # Lines starting with # are comments and ignored.
`;
    return {
      contents: [{
        uri: uri.href,
        text: guide,
        mimeType: 'text/markdown'
      }]
    };
  }
);

// -------------------------------------------------------------------------
// Prompts
// -------------------------------------------------------------------------

server.prompt(
  'create_lyric_video',
  {
    song_genre: z.string().describe('Genre of the song (e.g. J-Pop, Rock, Ballad, Cyberpunk, Hip-hop, EDM)'),
    mood: z.string().describe('Desired emotion (e.g. upbeat, melancholic, intense, aesthetic, serene)')
  },
  ({ song_genre, mood }) => ({
    messages: [{
      role: 'user',
      content: {
        type: 'text',
        text: `Please help me write or format lyrics and configure a JIZURA lyric motion video for a ${song_genre} song with a ${mood} mood. Recommend suitable JIZURA theme, style preset, aspect ratio, and typography cuts.`
      }
    }]
  })
);

// -------------------------------------------------------------------------
// Start Server
// -------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('JIZURA MCP Server running on stdio');
}

main().catch((err) => {
  console.error('Fatal error in JIZURA MCP Server:', err);
  process.exit(1);
});
