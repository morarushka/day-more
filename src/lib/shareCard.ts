import type { Scenario } from '../types';
import { formatBudget, formatCompany, formatDuration, formatLocation } from './options';

const WIDTH = 1080;
const HEIGHT = 1920;
const MARGIN = 96;

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function fitTitle(ctx: CanvasRenderingContext2D, title: string, maxWidth: number) {
  let size = 92;
  let lines: string[] = [];
  while (size > 52) {
    ctx.font = `600 ${size}px Fraunces, serif`;
    lines = wrapText(ctx, title, maxWidth);
    if (lines.length <= 4 && lines.every((l) => ctx.measureText(l).width <= maxWidth)) break;
    size -= 4;
  }
  return { size, lines };
}

async function ensureFontsReady() {
  try {
    await document.fonts.load('600 92px Fraunces');
    await document.fonts.load('500 36px Inter');
    await document.fonts.ready;
  } catch {
    // fonts API not available — draw with fallback fonts
  }
}

export async function renderScenarioShareCard(scenario: Scenario): Promise<Blob> {
  await ensureFontsReady();

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2d context unavailable');

  const bg = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  bg.addColorStop(0, '#f9f2e4');
  bg.addColorStop(1, '#f0e3cd');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const glow = ctx.createRadialGradient(WIDTH * 0.85, HEIGHT * 0.08, 0, WIDTH * 0.85, HEIGHT * 0.08, 620);
  glow.addColorStop(0, 'rgba(175, 74, 41, 0.14)');
  glow.addColorStop(1, 'rgba(175, 74, 41, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const contentWidth = WIDTH - MARGIN * 2;
  let y = 220;

  ctx.fillStyle = '#af4a29';
  ctx.font = '600 30px Inter, sans-serif';
  const eyebrow = 'СЕГОДНЯШНИЙ ПЛАН';
  ctx.fillRect(MARGIN, y - 34, 40, 4);
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(spacedCaps(eyebrow), MARGIN + 60, y);
  y += 90;

  ctx.fillStyle = '#241f18';
  const { size: titleSize, lines: titleLines } = fitTitle(ctx, scenario.title, contentWidth);
  ctx.font = `600 ${titleSize}px Fraunces, serif`;
  const titleLineHeight = titleSize * 1.16;
  for (const line of titleLines) {
    ctx.fillText(line, MARGIN, y);
    y += titleLineHeight;
  }
  y += 36;

  ctx.fillStyle = '#4a4136';
  ctx.font = '400 40px Fraunces, serif';
  const descLines = wrapText(ctx, scenario.shortDescription, contentWidth).slice(0, 6);
  for (const line of descLines) {
    ctx.fillText(line, MARGIN, y);
    y += 56;
  }

  const tags = [
    formatDuration(scenario.durationMin, scenario.durationMax),
    formatBudget(scenario.budgetLevel),
    formatCompany(scenario.company),
    formatLocation(scenario.location),
  ];

  let tagY = y + 40;
  let tagX = MARGIN;
  ctx.font = '600 28px Inter, sans-serif';
  const tagPaddingX = 28;
  const tagHeight = 62;
  const tagGap = 16;

  for (const tag of tags) {
    const label = spacedCaps(tag);
    const w = ctx.measureText(label).width + tagPaddingX * 2;
    if (tagX + w > WIDTH - MARGIN) {
      tagX = MARGIN;
      tagY += tagHeight + tagGap;
    }
    drawPill(ctx, tagX, tagY, w, tagHeight, 'rgba(36, 31, 24, 0.06)');
    ctx.fillStyle = '#4a4136';
    ctx.fillText(label, tagX + tagPaddingX, tagY + tagHeight / 2 + 10);
    tagX += w + tagGap;
  }

  ctx.fillStyle = '#928572';
  ctx.font = '600 26px Inter, sans-serif';
  ctx.fillText(spacedCaps('МАЛЕНЬКИЕ ПЛАНЫ'), MARGIN, HEIGHT - MARGIN);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/png');
  });
}

function spacedCaps(text: string): string {
  return text.split('').join(' ');
}

function drawPill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string) {
  const r = h / 2;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

export async function shareScenarioCard(scenario: Scenario): Promise<'shared' | 'downloaded'> {
  const blob = await renderScenarioShareCard(scenario);
  const file = new File([blob], `${scenario.id}.png`, { type: 'image/png' });

  const nav = navigator as Navigator & { canShare?: (data: { files: File[] }) => boolean };
  if (nav.canShare?.({ files: [file] }) && navigator.share) {
    await navigator.share({ files: [file], title: scenario.title, text: scenario.title });
    return 'shared';
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${scenario.id}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return 'downloaded';
}
