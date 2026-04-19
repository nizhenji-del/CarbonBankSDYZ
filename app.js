/* ============================================================
   app.js — 全局初始化 & 共享逻辑
   被所有页面加载，负责：
   1. Tab 导航高亮
   2. 学生缓存（跨页面共享）
   3. 页面初始化入口
   ============================================================ */

// ---------- 全局学生缓存（所有页面共享） ----------
let studentsCache = [];

/**
 * Tab 导航高亮
 * 每个页面在自身 script 中传入当前 tab 名称
 */
function initTabHighlight(activeTab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const tab = btn.getAttribute('data-tab');
        if (tab === activeTab) {
            btn.classList.add('tab-active', 'text-eco-700');
            btn.classList.remove('text-gray-500');
        } else {
            btn.classList.remove('tab-active', 'text-eco-700');
            btn.classList.add('text-gray-500');
        }
    });
}

/**
 * 加载学生列表到全局缓存
 */
async function loadStudentsToCache() {
    try {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        studentsCache = data || [];
    } catch (err) {
        console.error('加载学生缓存失败:', err);
        studentsCache = [];
    }
    return studentsCache;
}

/**
 * 填充学生下拉框
 * @param {string} selectId - select 元素 id
 */
async function fillStudentSelect(selectId) {
    await loadStudentsToCache();
    const select = document.getElementById(selectId);
    if (!select) return;
    const currentVal = select.value;
    select.innerHTML = '<option value="">-- 请选择学生 --</option>';
    studentsCache.forEach(s => {
        select.innerHTML += '<option value="' + s.id + '">' + esc(s.name) + '（' + esc(s.class_name) + '）</option>';
    });
    if (currentVal) select.value = currentVal;
}
