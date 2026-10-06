/** app.cssの--color-inkと同じ濃紺 */
export const INK = '#17324d';

function relativeLuminance(hex: string) {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a: string, b: string) {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** 背景色の上でコントラスト比が高い方の文字色（白または濃紺）を返す */
export function readableTextOn(background: string) {
  return contrastRatio('#ffffff', background) >= contrastRatio(INK, background) ? '#ffffff' : INK;
}
