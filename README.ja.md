# Ephemeral Time - p5.js インタラクティブ可視化

![License](https://img.shields.io/badge/License-MIT-blue.svg) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000) ![Version](https://img.shields.io/badge/Version-0.1.0-blue) ![GitHub stars](https://img.shields.io/github/stars/salieri009/EphemeralTime) ![GitHub issues](https://img.shields.io/github/issues/salieri009/EphemeralTime) ![Live Demo](https://img.shields.io/badge/Live%20Demo-View%20Here-brightgreen)

![p5.js](https://img.shields.io/badge/p5%20js-ED225D?style=for-the-badge&logo=p5dotjs&logoColor=white) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) ![Visual Studio Code](https://img.shields.io/badge/Visual_Studio_Code-0078D4?style=for-the-badge&logo=visual%20studio%20code&logoColor=white)

![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) ![Made with p5.js](https://img.shields.io/badge/Made%20with-p5.js-ED225D?style=for-the-badge&logo=p5.js&logoColor=white) ![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)

[한국어](README.ko.md) | [English](README.en.md) | [日本語](README.ja.md)

時間の流れを紙上のインクの広がりとして表現したインタラクティブアートプロジェクトです。
毎秒新しいインク滴が生成され、流体流に従って広がります。時間が経つにつれて徐々に消えていく「儚い(ephemeral)」効果を実装しています。

---

## プロジェクト構造

```
/EphemeralTime/
│
├── index.html           # プロジェクトエントリーポイント
├── style.css            # キャンバスおよび全体レイアウトスタイル
├── sketch.js            # p5.js メインlogic (setup(), draw())
├── .gitignore           # Git 除外ファイル設定
├── README.md            # プロジェクト文書
│
├── js/
│   ├── Clock.js         # 時間追跡および「新しい秒」検知
│   ├── InkDrop.js       # 個別インク滴クラス
│   ├── Fluid.js         # Perlin Noise ベース流体シミュレーション
│   └── Audio.js         # オーディオ効果管理（将来実装）
│
├── lib/                 # 外部ライブラリ
│   ├── p5.js            # p5.js ライブラリ
│   └── p5.sound.js      # p5.sound ライブラリ
│
└── sounds/              # オーディオファイル（将来追加）
    ├── drop.mp3
    └── ambience.mp3
```

---

## コア機能

### 1. **時間管理 (Clock.js)**
- 現在のシステム時間追跡
- 「新しい秒」検知 → 新しいインク滴生成
- 「新しい時間」検知 → 時間洗浄効果トリガー
- 時間進行率(hourProgress)返却（視覚/聴覚効果用）

### 2. **インク滴 (InkDrop.js)**
- 個別インク滴の状態管理（位置、サイズ、色、不透明度、寿命）
- 流体フィールドの影響を受けて移動
- 時間経過とともに徐々に透明化

### 3. **流体シミュレーション (Fluid.js)**
- Perlin Noise ベースベクトルフィールド生成
- 時間による滑らかな基本流
- マウスインタラクションで渦効果作成

### 4. **オーディオ (Audio.js - 将来実装)**
- インク滴生成時のサウンド効果
- 時間帯別アンビエントサウンド
- マウス速度ベース効果変調

---

## 視覚レイヤー構造（パフォーマンス最適化）

**毎時間3600個のオブジェクトを処理するために3つの `p5.Graphics` レイヤーを使用：**

| レイヤー | 名前 | 役割 | 更新頻度 |
|----------|------|------|----------|
| 1 | `bgLayer` | 背景（紙質感） | setup() / 毎正時 |
| 2 | `historyLayer` | 蓄積インク（過去） | インク滴「死亡時」 |
| 3 | `activeLayer` | アクティブインク（現在） | 毎フレーム |

**レンダリング順序：** bgLayer → historyLayer → activeLayer

---

## 時間帯別カラーパレット

| 時間帯 | 主色 | 副色 |
|--------|------|------|
| 00:00 ~ 06:00 (深夜~夜明け) | 濃紺 (`#1a1a2e`) | 青 (`#0f3460`) |
| 06:00 ~ 12:00 (朝~正午) | 黄 (`#ffd93d`) | オレンジ (`#ff6b6b`) |
| 12:00 ~ 18:00 (午後) | 緑 (`#6bcf7f`) | シアン (`#4d96ff`) |
| 18:00 ~ 24:00 (夕方~夜) | 紫 (`#a855f7`) | ピンク (`#ec4899`) |

---

## 技術スタック

- **p5.js**: キャンバスレンダリングおよび基本グラフィック
- **JavaScript (ES6+)**: 全モジュール開発
- **Perlin Noise**: 流体シミュレーション
- **p5.sound**: オーディオ効果（将来）

---

## 開発進捗状況

- [x] プロジェクト構造設計
- [ ] Clock.js 実装
- [ ] InkDrop.js 実装
- [ ] Fluid.js 実装
- [ ] sketch.js メインlogic実装
- [ ] HTML & CSS 作成
- [ ] Audio.js 実装およびサウンドファイル追加
- [ ] 時間洗浄効果詳細調整

---

## 実行方法

1. プロジェクトディレクトリを開く
2. ローカルサーバー実行（例: `python -m http.server 8000`）
3. ブラウザで `http://localhost:8000` にアクセス

---

## 注意事項

- 全モジュールは独立してテスト可能に設計
- パフォーマンス最適化のためグラフィックレイヤー分離
- 将来GLSLシェーダーにアップグレード可能な構造</content>
<parameter name="filePath">d:\UTS\p5j\EphemeralTime\README.ja.md