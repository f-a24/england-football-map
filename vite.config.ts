import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  // GitHub Pagesでは https://<user>.github.io/<repo>/ のサブパスで公開されるため、
  // ビルド結果のアセットを相対パスで参照する。リポジトリ名の変更や独自ドメイン、
  // 個人サイトのGalleryへの設置など、どこに置いても動く（ルーティングのない単一ページのため相対パスで問題ない）。
  base: './',
});
