# プロジェクト概要: Lost Items

このプロジェクトは、Cloudflare (D1, R2, Workers) 上で動作する、忘れ物・落とし物管理Webアプリケーションです。

## アーキテクチャ

Astro をベースに、静的構造とSSRを担当させ、動的なUI部分は SolidJS に完全に委譲する構成を採用しています。

- **Frontend**: Astro (SSR) + SolidJS (Interactive)
- **Backend/Edge**: Cloudflare Workers / Pages Functions
- **Database**: Cloudflare D1 (SQLite) via Drizzle ORM
- **Storage**: Cloudflare R2
- **UI Framework**: Tailwind CSS v4 + SolidUI (Kobalte)
- **Tooling**: Biome (Lint/Format), TypeScript (Strict), pnpm

## コミットメッセージ規約

開発履歴の可読性を高めるため、以下のプレフィックスを使用し、**メッセージ本体は英語で記述してください**。

- **feat**: 新機能
- **fix**: バグ修正
- **docs**: ドキュメント変更
- **style**: フォーマット等のコード動作に影響しない変更
- **refactor**: リファクタリング
- **perf**: パフォーマンス改善
- **test**: テスト関連
- **chore**: ビルド設定やツール関連

## 開発・運用ルール

- UI/コンポーネント実装の詳細は `frontend.md` を参照のこと。
- コードは `.agent/rules` 内のルールに従うこと。
