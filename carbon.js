/* ============================================================
   carbon.js — 📊 碳减排看板面板逻辑
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
    initTabHighlight('carbon');
    await loadCarbonStats();
});

/**
 * 加载碳减排数据（优先使用视图，失败降级）
 */
async function loadCarbonStats() {
    try {
        const { data, error } = await supabase
            .from('carbon_stats')
            .select('*')
            .single();
        if (!error && data) {
            renderCarbonStats(data);
            return;
        }
        throw new Error('fallback');
    } catch {
        await loadCarbonStatsFallback();
    }
}

/**
 * 渲染碳减排数据到 DOM
 */
function renderCarbonStats(d) {
    const petKg   = parseFloat(d.total_pet_kg)  || 0;
    const ppKg    = parseFloat(d.total_pp_kg)   || 0;
    const totalKg = parseFloat(d.total_weight_kg) || 0;
    const co2     = parseFloat(d.total_co2_saved_kg) || (totalKg * RULES.CO2_FACTOR);

    document.getElementById('stat-pet-kg').textContent = petKg.toFixed(2);
    document.getElementById('stat-pp-kg').textContent  = ppKg.toFixed(2);
    document.getElementById('stat-co2').textContent     = co2.toFixed(2);
    document.getElementById('stat-total').textContent   = (d.total_pet_count || 0) + (d.total_pp_count || 0);
    document.getElementById('stat-trees').textContent   = (co2 / RULES.TREE_KG).toFixed(2);
    document.getElementById('stat-km').textContent      = (co2 / RULES.CAR_KM_KG).toFixed(1);
}

/**
 * 降级方案：手动聚合 recycle_records
 */
async function loadCarbonStatsFallback() {
    try {
        const { data, error } = await supabase
            .from('recycle_records')
            .select('category, quantity, weight_kg');
        if (error) throw error;

        let petKg = 0, ppKg = 0, petCount = 0, ppCount = 0;
        (data || []).forEach(r => {
            const w = parseFloat(r.weight_kg) || 0;
            if (r.category === 'PET') { petKg += w; petCount += r.quantity; }
            else { ppKg += w; ppCount += r.quantity; }
        });

        renderCarbonStats({
            total_pet_count: petCount,
            total_pp_count:  ppCount,
            total_pet_kg:    petKg,
            total_pp_kg:     ppKg,
            total_weight_kg: petKg + ppKg,
        });
    } catch (err) {
        console.error('碳减排加载失败:', err);
    }
}
