/* ============================================================
   config.js — Supabase 配置 & 积分规则常量
   ============================================================ */

// ⚠️ 请替换为你的 Supabase 项目凭据
// 在 Supabase 控制台 → Settings → API 中获取
const SUPABASE_URL  = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON = 'YOUR_ANON_KEY_HERE';

// Supabase 客户端（全局单例）
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

/* ---------- 积分 & 重量规则 ---------- */
const RULES = {
    PET: {
        basePoints: 10,          // PET瓶基础分/个
        weightPerUnit: 0.02,     // 每个 PET 瓶重量 (kg)
        bonuses: {
            cleaned:   5,        // 已清洗
            flattened: 3,        // 已压扁
            capped:    2,        // 瓶盖分离
        }
    },
    PP: {
        basePoints: 15,          // PP碗基础分/个
        weightPerUnit: 0.018,    // 每个 PP 碗重量 (kg)
        bonuses: {
            cleaned: 8,          // 已清洗
            stacked: 3,          // 叠放整齐
        }
    },
    CO2_FACTOR:  2.0,   // 每 kg 塑料减排 CO₂ (kg)
    TREE_KG:     20,    // 每棵树年固碳 (kg)
    CAR_KM_KG:   0.2,   // 每公里汽车排放 (kg CO₂)
};
