/* ============================================================
   records.js — 📋 回收流水面板逻辑
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
    initTabHighlight('records');
    await loadRecords();
});

/**
 * 加载最近 30 条回收记录
 */
async function loadRecords() {
    try {
        const { data, error } = await supabase
            .from('recycle_records')
            .select('*, students(name)')
            .order('created_at', { ascending: false })
            .limit(30);
        if (error) throw error;

        const tbody = document.getElementById('records-body');
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-400">暂无回收记录</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(r => {
            const catLabel = r.category === 'PET' ? '🍶 PET' : '🥣 PP';
            const catClass = r.category === 'PET' ? 'text-blue-600' : 'text-orange-600';
            return `
                <tr class="border-b border-gray-50 hover:bg-eco-50/50 transition-colors">
                    <td class="py-3 px-3 text-gray-500 text-xs whitespace-nowrap">${formatTime(r.created_at)}</td>
                    <td class="py-3 px-3 font-medium text-gray-800">${esc(r.students?.name || '未知')}</td>
                    <td class="py-3 px-3 ${catClass} font-medium">${catLabel}</td>
                    <td class="py-3 px-3 text-right text-gray-700">${r.quantity}</td>
                    <td class="py-3 px-3 text-right font-bold text-eco-600">+${r.points_earned}</td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error('加载流水失败:', err);
    }
}
