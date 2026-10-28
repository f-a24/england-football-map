const SAMPLE_SIZE = 32;
const LIGHT_LUMINANCE = 225;
const LIGHT_RATIO = 0.9;

/** ロゴがほぼ白一色か（例：Peterborough United）。画像は改変できないため背景側の色で対応する */
export async function isMostlyLight(image: ImageBitmap): Promise<boolean> {
  // 縮小はcreateImageBitmapに任せ、メインスレッドでは小さな画像だけを読む
  const sample = await createImageBitmap(image, {
    resizeWidth: SAMPLE_SIZE,
    resizeHeight: SAMPLE_SIZE,
    resizeQuality: 'medium',
  });
  const canvas = document.createElement('canvas');
  canvas.width = SAMPLE_SIZE;
  canvas.height = SAMPLE_SIZE;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return false;
  ctx.drawImage(sample, 0, 0);
  sample.close();
  const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

  let opaque = 0;
  let light = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    opaque++;
    if ((data[i] + data[i + 1] + data[i + 2]) / 3 > LIGHT_LUMINANCE) light++;
  }
  return opaque > 0 && light / opaque > LIGHT_RATIO;
}
