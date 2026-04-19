/* ============================================================
   students.js — 👥 学生管理面板逻辑
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
    initTabHighlight('students');
    await loadStudentsList();
});

/**
 * 加载学生列表并渲染表格
 */
async function loadStudentsList() {
    try {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;

        const list = data || [];
        const tbody = document.getElementById('students-body');

        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-gray-400">暂无学生数据，请先添加</td></tr>';
        } else {
            tbody.innerHTML = list.map(s => `
                <tr class="border-b border-gray-50 hover:bg-eco-50/50 transition-colors">
                    <td class="py-3 px-3 font-medium text-gray-800">${esc(s.name)}</td>
                    <td class="py-3 px-3 text-gray-600">${esc(s.class_name)}</td>
                    <td class="py-3 px-3 text-gray-500 font-mono text-xs">${esc(s.student_no)}</td>
                    <td class="py-3 px-3 text-gray-400 text-xs">${formatTime(s.created_at)}</td>
                </tr>
            `).join('');
        }

        document.getElementById('student-count').textContent = `共 ${list.length} 人`;
    } catch (err) {
        console.error('加载学生列表失败:', err);
    }
}

/**
 * 添加新学生
 */
async function addStudent() {
    const name      = document.getElementById('new-name').value.trim();
    const className = document.getElementById('new-class').value.trim();
    const studentNo = document.getElementById('new-student-no').value.trim();

    if (!name || !className || !studentNo) {
        showToast('请填写完整信息', 'error');
        return;
    }

    try {
        const { error } = await supabase
            .from('students')
            .insert([{ name, class_name: className, student_no: studentNo }]);
        if (error) throw error;

        showToast(`✅ 已添加学生：${name}`, 'success');

        // 清空表单
        document.getElementById('new-name').value        = '';
        document.getElementById('new-class').value       = '';
        document.getElementById('new-student-no').value  = '';

        // 刷新列表
        await loadStudentsList();
    } catch (err) {
        console.error('添加学生失败:', err);
        showToast(`❌ 添加失败: ${err.message}`, 'error');
    }
}
