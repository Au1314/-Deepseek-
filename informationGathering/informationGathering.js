/**
 * informationGathering.js — 健康信息填写表单逻辑
 * 
 * 数据流：
 *   diabetesinfo.html → URL disease 参数 → 本页表单收集
 *   → fetchDiabetesDetectionWorkflow() → localStorage.setItem("riskInfo", res)
 *   → res.disease == "否" ? riskOutcome.html : userinfo.html
 */

window.onload = function() {
    // ① 清除旧的 sessionStorage 缓存（确保获取最新数据）
    Object.keys(sessionStorage).forEach(function(key) {
        if (key.startsWith('risk_info_')) {
            sessionStorage.removeItem(key);
        }
    });

    // ② 从 URL 获取 disease 参数（由 diabetesinfo.html 传入）
    const disease = new URLSearchParams(window.location.search).get('disease');
    const user = JSON.parse(localStorage.getItem('user'));

    // ③ 性别切换 → 条件显示妊娠期
    const pregnancyGroup = document.getElementById('pregnancyGroup');
    document.querySelectorAll('input[name="sex"]').forEach(function(radio) {
        radio.addEventListener('change', function() {
            pregnancyGroup.style.display = this.value === '女' ? 'block' : 'none';
        });
    });

    // ④ 表单提交
    document.getElementById('personalInfoForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        // 收集表单数据
        const formData = new FormData(this);
        let data = Object.fromEntries(formData.entries());

        // 追加额外字段
        data.userId = user.user_id;
        data.disease = disease;

        // 手动拼装家族病史（复选框 → 逗号分隔字符串）
        let familyHistory = '';
        document.querySelectorAll('input[name="familyHistory"]').forEach(function(cb) {
            if (cb.checked) {
                familyHistory += cb.value + ',';
            }
        });
        // 处理"其他"复选框
        const otherCheckbox = document.getElementById('otherCheckbox');
        const otherInput = document.getElementById('otherInput');
        if (otherCheckbox && otherCheckbox.checked && otherInput && otherInput.value.trim()) {
            familyHistory += otherInput.value.trim() + ',';
        }
        // 去掉末尾逗号，若无选中则设为"无"
        data.familyHistory = familyHistory.replace(/,$/, '') || '无';

        // ⑤ 调用糖尿病检测 API
        try {
            const overlay = startLoading('正在提交评估...');
            const res = await fetchDiabetesDetectionWorkflow(data, "users");
            stopLoading(overlay);

            // ⑥ 结果存入 localStorage（供结果页/信息展示页读取）
            localStorage.setItem("riskInfo", JSON.stringify(res));

            // ⑦ 根据检测结果分流
            if (res.disease == "否") {
                window.location.replace("/riskOutcome/riskOutcome.html");  // 无风险 → 结果页
            } else {
                window.location.replace("/userinfo/userinfo.html");        // 有风险 → 信息展示页
            }
        } catch (err) {
            console.error('提交失败:', err);
            alert('提交失败，请稍后重试');
        }
    });
};