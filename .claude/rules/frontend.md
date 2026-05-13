---
description: Frontend guidelines, UI design system, and SolidJS component rules
globs:
  - src/components/**
  - src/pages/**
  - src/layouts/**
  - src/styles/**
---

# Frontend Guidelines

## 1. デザインの美学 (Aesthetics)
ユーザーを魅了（WOW）させる、プレミアムで現代的なUIを目指します。
- **プレミアムな質感**: 単純な原色は避け、HSL値を調整した洗練されたパレットを使用します。
- **奥行きと動き**: Glassmorphism、繊細なボーダー、適切なシャドウ、不透明度を活用して奥行きを表現します。
- **スタイリングの繊細さ**: 強すぎるリングやボーダーを避けます。
    - **ボーダー**: `border: 1px solid hsl(30 10% 88% / 0.3)` のように不透明度を下げて馴染ませます。
    - **フォーカスリング**: `outline: 2px solid hsl(var(--color-ring) / 0.3)` を使用し、デザインを邪魔しない繊細なフィードバックを徹底します。
- **インタラクション**: すべてのユーザー操作に対して、ホバーエフェクトやマイクロアニメーション（タップ時の縮小など）によるフィードバックを実装します。
- **脱プレースホルダー**: デモやプレビューが必要な場合は、具体的なイメージを作成します。

## 2. 実装アーキテクチャ
AstroとSolidJSの役割を明確に分離します。
- **Astro**: ルーティング、SSR、静的レイアウト（`src/pages`, `src/layouts`）を担当。ページ内のインタラクティブなJSは原則として禁止し、SolidJSに委譲します。
- **SolidJS**: クライアントサイドのすべての動的ロジック、状態管理、フォーム処理を担当。
- **Kobalte / SolidUI**: ヘッドレスUIプリミティブおよび基本コンポーネントのベースとして使用します。
    - **原則**: コンポーネントの追加・刷新には `solidui-cli` を使用し、公式の設計標準（`PolymorphicProps` 等）に完全準拠させます。手動での独自実装は最小限に留めます。

## 3. コンポーネント設計と分割
保守性と再利用性を高めるため、コンポーネントを適切に分割します。
- **UIコンポーネント (`src/components/ui`)**:
    - 表示とスタイリングに特化した、ロジックを持たない純粋なコンポーネント。
    - 各コンポーネントは `.tsx` と `.module.css` のペアで構成します。
    - `cx()` ユーティリティ（`~/lib/utils`）を使用して外部から `class` prop でスタイルを上書き可能にします。
- **フィーチャーコンポーネント (`src/components/features`)**:
    - 特定のドメインロジック（API通信、状態管理など）を持つコンポーネント。
    - **適切な分割**: 1つのファイルが肥大化しないよう、サブコンポーネントとして分割し、関心の分離を徹底します。
- **インポートパス**: エイリアス `~/` を使用します（例: `~/components/ui/button`）。

## 4. デザイン標準 (Tokens)
- **CSS カスタムプロパティ (Design Tokens)**:
    - すべてのカラー・スペーシング等は `src/styles/global.css` の `:root {}` で定義されたトークンを使用します。
    - 主なトークン: `--color-primary`, `--color-background`, `--color-foreground`, `--color-border`, `--color-muted-foreground`, `--color-destructive`, `--color-accent`, `--color-secondary` など。
    - **Radius**: カードやメイン要素の角丸は `border-radius: 0.75rem` (12px) を基本とします。
- **スタイリング手法**:
    - **`.tsx` (SolidJS)**: CSS Modules (`.module.css`) を使用します。各コンポーネントと同ディレクトリに配置します。
    - **`.astro`**: Astro scoped `<style>` ブロックを使用します。
    - **variants**: lookup オブジェクト方式（例: `const variantClass = { default: styles.variantDefault, ... }`）で解決します。
    - **Kobalte の状態スタイル**: `[data-expanded]`, `[data-closed]`, `[data-highlighted]`, `[data-invalid]` 等の attribute selector を `.module.css` 内で直接使用します。
- **スマートフォンファースト & タッチターゲット**:
    - **メインアクション**: 高さ `56px` を確保し、指での操作性を最優先します。
    - **アイコンボタン**: 編集・削除などの操作ボタンは `44px` 相当以上を確保し、誤操作を防ぎます。
- **カラーリング**:
    - **背景**: `var(--color-background)` (暖色系ベージュ) を基調とします。
    - **アクセント**: `var(--color-primary)` を基調とします。
- **アイコン**: `lucide-solid` を使用。
- **UXと表記の簡素化**:
    - 視覚的な**アイコン**と**最小限の英単語**で直感的に伝えます。
    - 装飾的な説明テキストは排除します。

## 5. UIコンポーネント規格 (Components)
- **Button**:
    - **メイン (Call to Action)**: `size="xl"` (56px高, `border-radius: 0.75rem`) を使用します。
    - **サブ/アイコン**: `size="icon"` または `variant="ghost"` を使用しますが、サイズは 44px 以上を確保してタップしやすくします。
    - **スタイル上書き**: `class` prop でモジュールクラスを渡すか、CSS カスケードで解決できない場合は `style` prop（インラインスタイル）を使用します。
- **Input / Form**:
    - 入力フィールドも 56px を基準とし、ボタンと高さを揃えます。
- **アニメーション**:
    - Dialog・DropdownMenu・Toast のアニメーションは各コンポーネントの `.module.css` に `@keyframes` をローカル定義します。
    - Kobalte の `[data-expanded]` / `[data-closed]` attribute selector で開閉に対応します。

## 6. 品質・検証ワークフロー (Verification)
UIの追加や変更を行った後は、必ず以下の手順で品質を確認します。
1. **Linterの確認**: `pnpm check` (Biome) を実行し、警告やエラーがないことを確認します。
2. **型チェック**: TypeScriptによる型エラーがないか確認し、`any` の使用を避けます。
3. **実機・ブラウザ検証**: スタイルの崩れがないか、レスポンシブ対応がなされているかを確認します。
