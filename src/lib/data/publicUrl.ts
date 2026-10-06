/**
 * `public/` ルートからのパスに公開先のベースパスを付ける。
 * JSON内のパスや実行時にfetchするパスはViteが書き換えないため、サブパス公開時に404になるのを防ぐ。
 */
export function publicUrl(path: string): string {
  return import.meta.env.BASE_URL + path.replace(/^\//, '');
}
