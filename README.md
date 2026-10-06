# England Football Map

イングランドのプロサッカークラブ（Premier League / EFL Championship / League One / League Two）を、ホームスタジアムのおおよその位置とともに地図上に表示するインタラクティブなWeb作品。

プロジェクトの目的・方針・設計方針は [CLAUDE.md](./CLAUDE.md) を参照。

## Tech Stack

- Svelte 5 + TypeScript + Vite
- Threlte / Three.js (WebGL)

## Development

```bash
npm install
npm run dev
```

## Data & Assets

- クラブロゴ（クレスト）は [TheSportsDB](https://www.thesportsdb.com/) の無料APIから取得している。取得元の利用規約により、画像は改変せずそのまま使用し、データソースとしてTheSportsDBを明示する必要がある（公開時はサイト上にクレジット表示を行うこと）。
- クラブのクレストは各クラブ・リーグの商標である。個人の非商用利用目的で個別に許諾は取得していないため、公開範囲や使用方法について懸念がある場合は各クラブ・リーグの公式窓口に確認すること。
- ロゴの再取得: `npm run fetch-logos`（`src/data/clubs.json` の各クラブ名でTheSportsDBを検索し、`public/logos/{clubId}.png` に保存する）
