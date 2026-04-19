/* ============================================================
   utils.js — 通用工具函数
   ============================================================ */

/**
 * HTML 转义 — 防止 XSS 攻击
 * 将用户输入中的特殊字符转换为 HTML 实体
 */
function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * 格式化 ISO 时间为可读格式
 * 输出：MM-DD HH:mm
 */
function formatTime(isoStr) {
    if (!isoStr) return '-';
    const d   = new Date(isoStr);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getMonth() + 1}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Toast 通知
 * @param {string}  msg   - 通知文本
 * @param {'success'|'error'|'info'} type - 类型
 */
function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const colors = {
        success: 'bg-eco-600 text-white',
        error:   'bg-red-500 text-white',
        info:    'bg-gray-800 text-white',
    };
    const toast = document.createElement('div');
    toast.className = `toast px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${colors[type] || colors.info}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
