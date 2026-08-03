# 使用者美術工作單：人物、武器、敵人與成人 CG

- 版本：1.0
- 日期：2026-08-03
- 你的交付總數：63 個 PNG
- 交付根目錄：`art-drop/`
- 對應逐檔清單：`user-art-checklist.csv`

這份工作單只包含你需要製作的美術。UI、背景、按鈕、框體、屬性徽章、特效、WebP 轉檔與程式整合全部由 Codex 負責。

## 1. 交付數量

| 類別 | 數量 |
|---|---:|
| 成年男女艦長 | 12 |
| 四名成年女性隊員 | 28 |
| `CHR_02` 額外艙室服裝 | 1 |
| `CHR_02` 成人事件 CG | 3 |
| 武器 | 12 |
| 召喚核心 | 2 |
| 一般敵人 | 3 |
| 海上 Boss 狀態 | 2 |
| **合計** | **63** |

## 2. 資料夾

```text
art-drop/
  captains/
    cap_m/
    cap_f/
  characters/
    chr_01/
    chr_02/
    chr_03/
    chr_04/
  weapons/
  summons/
  enemies/
  bosses/
  events/
    chr_02/
```

檔名與路徑請完全依照 `user-art-checklist.csv` 的 `expected_path`。不要在檔名加入顯示名稱、日期、`final`、`new` 或版本編號。

## 3. 通用輸出

- 色彩空間：sRGB IEC61966-2.1。
- 格式：8-bit PNG；需要透明背景的圖必須保留透明 Alpha。
- 透明邊緣：不可帶白邊、黑邊或底色。
- 圖內不可包含名稱、台詞、數值、UI、浮水印或第三方標誌。
- 工作來源檔可自行保留；只需交付符合規格的平面 PNG。
- 顯示名稱由遊戲資料控制，之後可以自由修改，不影響資產 ID。
- 所有成人畫面人物必須明確為成年人，且不得使用第三方作品角色或素材。

## 4. 角色設定與 ID

| ID | 年齡 | 屬性／職能 | 美術方向 |
|---|---:|---|---|
| `cap_m` | 25 | 男性艦長 | 地表遠征艦長；與女性艦長同級裝備風格 |
| `cap_f` | 25 | 女性艦長 | 地表遠征艦長；與男性艦長同級裝備風格 |
| `chr_01` | 28 | 火／先鋒 | 港都防衛官；近戰與防護裝備 |
| `chr_02` | 27 | 水／術師 | 海洋工程師；第一版完整成人關係線 |
| `chr_03` | 24 | 風／支援 | 遠征飛行員；輕量機動裝備 |
| `chr_04` | 31 | 光／治療 | 外星生物研究醫師；研究與醫療裝備 |

## 5. 艦長：每人 6 張，共 12 張

每名艦長需要：

1. `portrait_neutral`
2. `portrait_happy`
3. `portrait_tense`
4. `portrait_hurt`
5. `battle_idle`
6. `card`

### 主立繪與表情

- 畫布：2048×3072，透明背景。
- 雙腳中心錨點：`(1024, 2960)`。
- 安全區：左右各 164 px、頂端 164 px、底端 80 px。
- 四張表情的身體、服裝與外輪廓必須完全對齊。
- 不要繪製地面陰影。

### 戰鬥姿勢

- 畫布：1600×1600，透明背景。
- 腳底中心錨點：`(800, 1504)`。
- 四周至少 96 px 安全區，武器不可碰到邊界。
- 只需一張待機姿勢，攻擊動作由程式動畫處理。

### 角色卡

- 畫布：1024×1536，不透明背景。
- 臉部位於 X 15%–85%、Y 12%–58%。
- 頂端 12% 保留稀有度框，底端 20% 保留名稱與數值。
- 不要烘焙文字或遊戲框體。

## 6. 女性隊員：基本 7 張 × 4 人，共 28 張

每名隊員需要：

1. `portrait_neutral`
2. `portrait_happy`
3. `portrait_angry`
4. `portrait_hurt`
5. `battle_idle`
6. `card`
7. `cabin_base`

主立繪、表情、戰鬥姿勢與角色卡沿用艦長尺寸及錨點。

### 私人艙室姿勢

- 畫布：2048×3072，透明背景。
- 雙腳中心錨點：`(1024, 2960)`。
- 角色臉部不可位於畫面最右側 32%，該區會放關係面板。
- `CHR_02` 另需一張 `chr_02_cabin_outfit_02.png`，與 `cabin_base` 完全對齊。

## 7. `CHR_02` 成人事件 CG：3 張

| 檔名 | 用途 |
|---|---|
| `evt_chr02_bond03_cg01.png` | 關係 Lv.3 主事件 |
| `evt_chr02_status_cg01.png` | 特殊狀態收藏事件 |
| `evt_chr02_defeat_cg01.png` | 首次敗北收藏事件 |

共同規格：

- 畫布：2560×1440，sRGB PNG，不透明背景。
- 重要人物與動作保留在 X 6%–94%、Y 6%–78%。
- 底端 22% 會顯示事件文字，不放關鍵臉部或重要細節。
- 不烘焙台詞、對話框、事件名稱、按鈕或浮水印。
- 第一批只交付三張基礎 CG；差分日後使用新資產 ID 增加。

## 8. 武器：12 張

- 畫布：1024×1024，透明背景。
- 四周至少 92 px 安全區。
- 武器由左下指向右上，主要軸線約 55°–70°。
- 武器長度佔畫布對角線的 68%–82%。
- 可以有貼身光暈，但不要滿版背景粒子或文字。

```text
wpn_01_sunblade.png
wpn_02_molten_lance.png
wpn_03_tidemark_axe.png
wpn_04_resonance_staff.png
wpn_05_fireline_dagger.png
wpn_06_route_bow.png
wpn_07_expedition_rifle.png
wpn_08_shoreguard_shield.png
wpn_09_astrolabe.png
wpn_10_dawn_greatblade.png
wpn_11_depth_anchor.png
wpn_12_void_prism.png
```

## 9. 召喚核心：2 張

- 畫布：1600×1600，透明背景。
- 四周至少 128 px 安全區。
- 單一大型生物、機械體或能量核心，輪廓必須清楚。
- 可包含局部光暈，不要加入文字或滿版背景。

```text
smn_01_solar_leviathan.png
smn_02_abyssal_oracle.png
```

## 10. 一般敵人：3 張

- 畫布：1600×1600，透明背景。
- 接地中心錨點：`(800, 1504)`。
- 四周至少 96 px 安全區。
- 面向左下方，對準位於畫面下方的玩家隊伍。
- 不要繪製地面投影。

```text
enm_01_port_raider.png
enm_02_tide_drone.png
enm_03_ruin_guardian.png
```

## 11. 海上 Boss：2 張

- 畫布：3072×2048，透明背景。
- 接地／接水中心錨點：`(1536, 1940)`。
- 安全區：左右 180 px、頂端 128 px、底端 80 px。
- `idle` 與 `break` 的輪廓、比例及錨點完全一致。
- 正面偏向玩家隊伍，保留大型 Raid Boss 壓迫感。

```text
boss_01_tidal_watchkeeper_idle.png
boss_01_tidal_watchkeeper_break.png
```

## 12. 交付步驟

1. 先製作一張 `chr_02_portrait_neutral.png` 作為錨點與畫風樣張。
2. 樣張確認後，完成兩名艦長及四名隊員的主立繪、表情與戰鬥姿勢。
3. 接著完成角色卡、艙室姿勢與 `CHR_02` 替換服裝。
4. 完成武器、召喚、一般敵人與 Boss。
5. 最後交付三張成人事件 CG。
6. 在 `user-art-checklist.csv` 將已完成項目的 `status` 從 `needed` 改成 `ready`。
7. 將整個 `art-drop` 資料夾及更新後的 CSV 一起提供；Codex 會批次驗證後整合。
