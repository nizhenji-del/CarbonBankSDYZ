/* ============================================================
   ranking.js — 🏆 积分排行榜面板逻辑
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
    initTabHighlight('ranking');
    await loadRanking();
});

/**
 * 加载排行榜（优先使用视图，失败则降级手动聚合）
 */
async function loadRanking() {
    try {
        const { data, error } = await supabase
            .from('student_ranking')
            .select('*');
        if (error) throw error;
        renderRanking(data);
    } catch {
        await loadRankingFallback();
    }
}

/**
 * 渲染排行榜表格
 */
function renderRanking(data) {
    const tbody = document.getElementById('ranking-body');
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-gray-400">暂无数据</td></tr>';
        return;
    }

    tbody.innerHTML = data.map((row, idx) => {
        const rankIcon = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`;
        const rowClass = idx < 3 ? 'bg-yellow-50/50' : '';
        return `
            <tr class="border-b border-gray-50 hover:bg-eco-50/50 transition-colors ${rowClass}">
                <td class="py-3 px-3 font-bold text-lg">${rankIcon}</td>
                <td class="py-3 px-3 font-medium text-gray-800">${esc(row.name)}</td>
                <td class="py-3 px-3 text-gray-600">${esc(row.class_name)}</td>
                <td class="py-3 px-3 text-right font-bold text-eco-600">${row.total_points}</td>
            </tr>
        `;
    }).join('');
}

/**
 * 降级方案：手动关联 students 和 point_transactions
 */
async function loadRankingFallback() {
    try {
        const res1 = await supabase.from('students').select('*');
        const res2 = await supabase.from('point_transactions').select('student_id, amount');
        const students = res1.data;
        const txs = res2.data;

        const pointMap = {};
        (txs || []).forEach(tx => {
            pointMap[tx.student_id] = (pointMap[tx.student_id] || 0) + tx.amount;
        });

        const ranking = (students || [])
            .map(s => ({ ...s, total_points: pointMap[s.id] || 0 }))
            .sort((a, b) => b.total_points - a.total_points);

        renderRanking(ranking);
    } catch (err) {
        console.error('排行榜加载失败:', err);
    }
}
