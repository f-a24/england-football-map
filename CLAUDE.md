# CLAUDE.md

## 概要

イングランドのプロサッカークラブ（Premier League / EFL Championship / EFL League One / EFL League Two、最大92クラブ）のロゴを、ホームスタジアムのおおよその位置に置いて地図上に表示するWebアプリ。実用的な地図サービスではなく、**イングランドのフットボールを題材にした、視覚的でインタラクティブなWeb作品**（個人サイトのGallery掲載予定）を目指す。

優先順位：①一目でイングランドの地図と分かる ②クラブのおおよその位置関係が分かる ③ロゴが見やすい ④インタラクションが気持ちよい ⑤全体として魅力的。位置の正確さは不要で、視認性のために意図的にずらしてよい。主役は地図とロゴであり、UIはシンプルに保つ（ダッシュボード化しない）。

## 技術構成

- Svelte 5（runes）+ TypeScript + Vite の静的SPA（SvelteKit・バックエンドなし）
- Threlte（`@threlte/core` / `@threlte/extras`）+ Three.js。地図とマーカーはWebGL、UIはDOM/CSS
- ESLint + Prettier
- GitHub Pagesで公開（[deploy.yml](.github/workflows/deploy.yml)：`main`へのpushで check → lint → build → 公開）

```text
npm run dev / build / check / lint / format
npm run layout-clubs   # clubs.jsonのpositionを再計算
npm run fetch-logos    # TheSportsDBからロゴを取得
```

サブパス公開時の動作は`.claude/launch.json`の`pages-preview`で確認する（事前に`npm run build`）。

```text
src/
  lib/map/     # Threlteシーン（MapCanvas / Scene / Sea / Terrain / CountryPlate / ClubMarkers / ClubMarker）
  lib/ui/      # DOM UI（LeagueFilter / ClubInfoPanel / ClubListFallback）
  lib/stores/  # 状態（mapState / locale / viewport）
  lib/data/    # types / loadSeason / projection / publicUrl
  data/        # leagues.json / clubs.json / seasons/*.json
public/
  logos/       # クラブロゴ（{clubId}.png）
  map/         # england.json / uk-context.json / neighbors.json（海岸線、座標変換済み）
scripts/       # fetch-logos.ts / layout-clubs.ts
```

`scripts/*.ts`はNode 26の型ストリッピングで直接実行する。そのため、`enum`・`namespace`など型を消すだけでは実行できない構文は使えない（`erasableSyntaxOnly`で検出される）。`npm run check` / `npm run lint`の対象に含まれる。

## データ

- `leagues.json`（リーグのメタ情報）/ `clubs.json`（クラブの静的情報）/ `seasons/{season}.json`（そのシーズンの`{ clubId, leagueId }`の割り当てのみ）に分けている。型は[types.ts](src/lib/data/types.ts)を参照。
- 表示するシーズンは[mapState.svelte.ts](src/lib/stores/mapState.svelte.ts)の`allClubs`で指定する。シーズンのJSONは`import.meta.glob`で自動的に読み込まれる。
- クラブ数や所属クラブはコードにハードコードしない。所属リーグは常に`seasons/*.json`を正とする（TheSportsDBの`strLeague`は古い場合があるため使わない）。
- 対象4リーグに所属していれば、ウェールズのクラブ（Cardiff等）も含める。
- `nameJa` / `stadium.nameJa`は必須。表記は日本のサッカーメディアで一般的なカタカナを基準にする（例：リヴァプール）。
- `position`は`npm run layout-clubs`で`location`（緯度経度）から計算する。反発と、元の位置への復元力を釣り合わせて、密集地域の重なりを減らす方式。手で編集しても上書きされる。クラブを追加・変更したら再実行する。マーカーの大きさ（`ClubMarker.svelte`の`BASE_SCALE`）を変えたら、スクリプトの`MARKER_SIZE`も合わせる。
- 緯度経度・所属などの事実情報は、公式情報源で確認する。

## クラブロゴ（TheSportsDB）

- 商標リスクがあることを認識した上で、TheSportsDB経由で公式クレストを使うとユーザーが判断している。
- 利用規約上、画像は改変しない（再配色・切り出し等をしない）。クレジットの表示も必須（`App.svelte`のフッター）。
- 白一色のロゴは、[logoTone.ts](src/lib/map/logoTone.ts)で判定して、背後の円を濃紺にする（画像自体は変えない）。
- ロゴは`createImageBitmap`でメインスレッドの外でデコードし、表示用に256pxに縮小してテクスチャにする（ファイルは変更しない）。`imageOrientation: 'flipY'`で読み込むため、テクスチャは`flipY = false`にする。

## 地図・描画

- 3D部分は[MapCanvas.svelte](src/lib/map/MapCanvas.svelte)を入口に別チャンクにし、`App.svelte`でDOMのUIを描画した後に`import()`で読み込む。three.js・Threlteを`App.svelte`やDOMのUIから静的にimportしない（最初のJSに含まれ、FCP/LCPが遅れる）。

- 海岸線は[georgique/world-geojson](https://github.com/georgique/world-geojson)を[projection.ts](src/lib/data/projection.ts)の規則で変換したもの（`{ polygons }`形式）。生成スクリプトはリポジトリにないため、作り直す場合は`scripts/`に置く。Isle of Wightなど、元データで別ポリゴンになっていない島は表示されない。
- 地図はフラットな平面（`ShapeGeometry` + `MeshBasicMaterial`）。イングランドは緑`#7cc576`、それ以外の陸地はすべてグレー`#6b7378`（[Terrain.svelte](src/lib/map/Terrain.svelte)）。国境を共有する地域は、`layer`で高さを0.1ずつずらしてちらつきを防ぐ。グレーの地域は国境線のずれを`seamWidth`の帯で埋める。
- 海（[Sea.svelte](src/lib/map/Sea.svelte)）は、中心`#38c4ea`→外側`#1e9bd7`のグラデーションにゆるい波を重ねたShaderMaterial。
- カメラはOrthographicCamera。操作はパンのみで回転はしない（1本指でパン、2本指でピンチズーム）。注視点は`ENGLAND_BOUNDS`内に制限する（`screenSpacePanning={false}`が必須。外すと制限をすり抜ける）。ズームの範囲は、イングランド全体が収まる倍率（`fitZoom`、初期表示もこれ）から、その4倍まで。操作していない間は、注視点がわずかに漂う。
- 座標変換は[mapTransform.ts](src/lib/map/mapTransform.ts)の`toWorldXZ`で、画面の上が北になる。符号を変えるときは、CountryPlateのShape構築も一緒に直す。
- マーカー（[ClubMarker.svelte](src/lib/map/ClubMarker.svelte)）は、外側から「リーグ色の縁取り」→「白地」→「ロゴ」の順に重ねたSprite。サイズはPC 40、スマホ 52。ホバーすると拡大・浮上し、リーグ色の発光が出て、他のクラブはフェードする。重なる所では南（画面手前）のクラブを上にし、ホバー中のクラブは最前面に出す。
- 指定した色がそのまま出るよう、次の3点を守る：ロゴのテクスチャに`SRGBColorSpace`を指定する／陸地・マーカーは`toneMapped={false}`にする／ShaderMaterialの最後に`#include <colorspace_fragment>`を入れる。
- `public/`内のファイルをコードから参照するときは、必ず[publicUrl()](src/lib/data/publicUrl.ts)を通す（`base: './'`のため。通さないと公開先で404になる）。

## UI

- 「地図に貼ったステッカー」風：白地に濃紺の文字（`--color-ink` `#17324d`）、下にずらした影、フォントはM PLUS Rounded 1c（Google Fonts。描画を止めないよう`media="print"`+`onload`で読み込む）。フォーカス枠は濃紺3px。色の定義は[app.css](src/app.css)にまとめている。
- [LeagueFilter](src/lib/ui/LeagueFilter.svelte)：複数選択できるトグルチップ。オンはリーグ色で塗り、オフは白。状態は先頭の丸の形（塗りつぶし／リング）でも示す。リーグ色の上の文字色は`readableTextOn`で自動的に選ぶ。
- [ClubInfoPanel](src/lib/ui/ClubInfoPanel.svelte)：表示するのはクラブ名とスタジアム名のみ。
- [ClubListFallback](src/lib/ui/ClubListFallback.svelte)：アクセシビリティのための**必須要件**。WebGLのマーカーはDOMに存在しないため、同じ情報をDOMの一覧でも提供する。Tabキーまたは「クラブ一覧」ボタンで開く。フォーカスすると、マーカーのハイライトと情報パネルが連動する。リーグごとに見出しを付け、各行には視覚的に隠したリーグ名を入れる。PCでは左のパネル、スマホではボトムシートとして表示する。
- 言語：`navigator.languages[0]`が`ja`で始まれば日本語、それ以外は英語で表示し、`<html lang>`も合わせる。手動で切り替えるUIはない。UI文言を追加するときは、[locale.svelte.ts](src/lib/stores/locale.svelte.ts)の`messages`に英日両方を書く。
- レスポンシブのブレークポイントは640px。スマホでは、マーカーを大きめにし、ボタンの高さを44pxにする。タップで情報を表示し、背景をタップすると閉じる。
- 情報を色だけで伝えない（形・文字も併用する）。

## 採用しないと決めたもの

状況が変わらない限り、再提案しない。

- 地図とロゴの視認性を損なう装飾：環境パーティクル、ゲームマップ風の海（浅瀬・泡など）
- 立体的な地図（`ExtrudeGeometry`）：側面が影のように見え、陸地が浮いて見える
- カメラの自由回転
- Biome / Oxc：`.svelte`のテンプレートで使われているimportやpropsを「未使用」と誤検知し、自動修正で壊れる
- TypeScript 7：typescript-eslintが対応しておらず、`svelte-check --tsgo`は型エラーを見逃す

## 未対応・課題

- Lighthouse（モバイル）のTBTが約1秒残る。主な原因は地図の初期化（92クラブ×Threlteコンポーネント）とクラブ一覧のDOM作成。減らすには構成の変更が必要で、効果は未検証
- リーグ切り替え時のトランジションなど、演出の強化
- 地図データの生成スクリプトの整備

## 進め方

- 実装者であると同時に、設計・UI/UX・技術選定の相談相手として振る舞う。より良い方法があれば、理由とともに提案する。
- 仕様が曖昧なときは、選択肢・メリットとデメリット・推奨案を示し、実装前に相談する（特に地図の表現、WebGL、UIデザイン、データ構造、アニメーション、ライブラリ、構成、92クラブ表示時の視認性）。
- このファイルに書かれていない仕様を、勝手に補完して固定化しない。
- 新しい決定事項は、経緯ではなく現在の仕様として、該当するセクションに反映する。
