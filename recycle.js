/* ============================================================
   recycle.js — 📝 登记回收面板逻辑
   ============================================================ */

let currentCategory = 'PET';  // 当前选中品类

// ---------- 页面初始化 ----------
document.addEventListener('DOMContentLoaded', async () => {
    initTabHighlight('recycle');
    await fillStudentSelect('recycle-student');
    await loadTodayStats();
    updatePreview();
});

// ---------- 品类切换 ----------
function switchCategory(cat) {
    currentCategory = cat;

    // 按钮样式
    document.getElementById('cat-pet').classList.toggle('active', cat === 'PET');
    document.getElementById('cat-pp').classList.toggle('active', cat === 'PP');

    // 非激活按钮
    const inactive = cat === 'PET' ? document.getElementById('cat-pp') : document.getElementById('cat-pet');
    inactive.classList.remove('active');

    // 附加选项显隐
    document.getElementById('bonus-pet').classList.toggle('hidden', cat !== 'PET');
    document.getElementById('bonus-pp').classList.toggle('hidden', cat !== 'PP');

    // 重置复选框
    document.querySelectorAll('#bonus-pet input, #bonus-pp input').forEach(cb => cb.checked = false);

    updatePreview();
}

// ---------- 数量调节 ----------
function adjustQty(delta) {
    const input = document.getElementById('recycle-qty');
    let val = parseInt(input.value) || 1;
    val = Math.max(1, val + delta);
    input.value = val;
    updatePreview();
}

// ---------- 积分预估 ----------
function updatePreview() {
    const qty  = Math.max(1, parseInt(document.getElementById('recycle-qty').value) || 1);
    const rule = RULES[currentCategory];
    let total  = rule.basePoints * qty;
    let detail = `基础 ${rule.basePoints}分 × ${qty}个`;

    if (currentCategory === 'PET') {
        if (document.getElementById('bonus-cleaned').checked) {
            total += rule.bonuses.cleaned * qty;
            detail += ` + 清洗${rule.bonuses.cleaned}×${qty}`;
        }
        if (document.getElementById('bonus-flattened').checked) {
            total += rule.bonuses.flattened * qty;
            detail += ` + 压扁${rule.bonuses.flattened}×${qty}`;
        }
        if (document.getElementById('bonus-capped').checked) {
            total += rule.bonuses.capped * qty;
            detail += ` + 瓶盖${rule.bonuses.capped}×${qty}`;
        }
    } else {
        if (document.getElementById('bonus-cleaned-pp').checked) {
            total += rule.bonuses.cleaned * qty;
            detail += ` + 清洗${rule.bonuses.cleaned}×${qty}`;
        }
        if (document.getElementById('bonus-stacked').checked) {
            total += rule.bonuses.stacked * qty;
            detail += ` + 叠放${rule.bonuses.stacked}×${qty}`;
        }
    }

    document.getElementById('preview-points').textContent = total;
    document.getElementById('preview-detail').textContent = detail;
}

// ---------- 提交回收记录 ----------
async function submitRecycle() {
    const studentId = document.getElementById('recycle-student').value;
    const qty = Math.max(1, parseInt(document.getElementById('recycle-qty').value) || 1);

    if (!studentId) { showToast('请先选择学生', 'error'); return; }

    const rule = RULES[currentCategory];
    let totalPoints = rule.basePoints * qty;
    let bonusFlags  = {};

    if (currentCategory === 'PET') {
        bonusFlags = {
            bonus_cleaned:   document.getElementById('bonus-cleaned').checked,
            bonus_flattened: document.getElementById('bonus-flattened').checked,
            bonus_capped:    document.getElementById('bonus-capped').checked,
        };
        if (bonusFlags.bonus_cleaned)   totalPoints += rule.bonuses.cleaned * qty;
        if (bonusFlags.bonus_flattened)  totalPoints += rule.bonuses.flattened * qty;
        if (bonusFlags.bonus_capped)     totalPoints += rule.bonuses.capped * qty;
    } else {
        bonusFlags = {
            bonus_cleaned: document.getElementById('bonus-cleaned-pp').checked,
            bonus_stacked: document.getElementById('bonus-stacked').checked,
        };
        if (bonusFlags.bonus_cleaned) totalPoints += rule.bonuses.cleaned * qty;
        if (bonusFlags.bonus_stacked) totalPoints += rule.bonuses.stacked * qty;
    }

    const weightKg = qty * rule.weightPerUnit;
    const btn      = document.getElementById('submit-btn');
    btn.disabled   = true;
    btn.textContent = '⏳ 提交中...';

    try {
        // 写入回收记录
        const { data: record, error: recErr } = await supabase
            .from('recycle_records')
            .insert([{
                student_id:      parseInt(studentId),
                category:        currentCategory,
                quantity:        qty,
                bonus_cleaned:   bonusFlags.bonus_cleaned   || false,
                bonus_flattened: bonusFlags.bonus_flattened || false,
                bonus_capped:    bonusFlags.bonus_capped    || false,
                bonus_stacked:   bonusFlags.bonus_stacked   || false,
                points_earned:   totalPoints,
                weight_kg:       weightKg,
            }])
            .select()
            .single();
        if (recErr) throw recErr;

        // 写入积分流水
        const { error: txErr } = await supabase
            .from('point_transactions')
            .insert([{
                student_id: parseInt(studentId),
                amount:     totalPoints,
                reason:     `回收${currentCategory === 'PET' ? 'PET瓶' : 'PP碗'} ${qty}个`,
                record_id:  record.id,
            }]);
        if (txErr) throw txErr;

        showToast(`✅ 成功登记！获得 ${totalPoints} 积分`, 'success');

        // 重置表单
        document.getElementById('recycle-qty').value = 1;
        document.querySelectorAll('#bonus-pet input, #bonus-pp input').forEach(cb => cb.checked = false);
        updatePreview();
        loadTodayStats();

    } catch (err) {
        console.error('提交失败:', err);
        showToast(`❌ 提交失败: ${err.message}`, 'error');
    } finally {
        btn.disabled   = false;
        btn.textContent = '✅ 提交回收记录';
    }
}

// ---------- 今日统计 ----------
async function loadTodayStats() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
            .from('recycle_records')
            .select('category, quantity, weight_kg')
            .gte('created_at', today.toISOString());
        if (error) throw error;

        let petCount = 0, ppCount = 0, totalWeight = 0;
        (data || []).forEach(r => {
            if (r.category === 'PET') petCount += r.quantity;
            else ppCount += r.quantity;
            totalWeight += parseFloat(r.weight_kg) || 0;
        });

        document.getElementById('today-pet').textContent   = petCount;
        document.getElementById('today-pp').textContent    = ppCount;
        document.getElementById('today-total').textContent = petCount + ppCount;
        document.getElementById('today-co2').textContent   = (totalWeight * RULES.CO2_FACTOR).toFixed(2);
    } catch (err) {
        console.error('加载今日统计失败:', err);
    }
}
