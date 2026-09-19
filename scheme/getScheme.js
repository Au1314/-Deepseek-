/**
 * 方案定制表单 - JavaScript
 */

function getLifeScheme() {
    const selects = document.querySelectorAll('select');
    const [sleep, cook, diet, exercise, drink] = Array.from(selects).map(s => s.value);

    // 校验所有下拉
    if ([sleep, cook, diet, exercise, drink].some(v => v === '请选择')) {
        return Swal.fire({
            title: '请完善生活习惯信息',
            text: '所有生活习惯选项都需要选择',
            icon: 'warning'
        });
    }

    const age = document.getElementById('age').textContent;
    const sex = document.getElementById('sex').textContent;
    const height = document.getElementById('height').textContent;
    const weight = document.getElementById('weight').textContent;
    const disease = document.getElementById('disease').textContent;
    const suggestion = document.querySelector('textarea').value;

    const userInfo = `个人信息: 年龄: ${age} 性别: ${sex} 身高: ${height} 体重: ${weight} 是否患病: ${disease}`;
    const habit = `生活习惯: 作息: ${sleep} 做饭: ${cook} 口味: ${diet} 运动: ${exercise} 饮酒: ${drink}`;

    const user = getUserInfo();
    if (!user) return;

    // 显示加载动画
    const loading = startLoading('正在生成方案...');

    // 调用生活方案生成工作流
    fetchLifePlansWorkflow({ userInfo, habit, suggestion, userId: user.user_id }, user.user_id)
        .then(res => {
            // 关闭加载动画
            stopLoading(loading);

            // 判断是否成功（有返回数据即成功）
            if (res && (Array.isArray(res) ? res.length > 0 : true)) {
                Swal.fire({
                    title: '方案生成成功',
                    text: '点击确认跳转至方案详情页',
                    icon: 'success',
                    confirmButtonText: '确定'
                }).then(result => {
                    if (result.isConfirmed) {
                        window.location.replace('scheme.html');
                    }
                });
            } else {
                Swal.fire({
                    title: '方案生成失败',
                    text: '请稍后再试',
                    icon: 'error',
                    confirmButtonText: '确定'
                });
            }
        })
        .catch(err => {
            // 关闭加载动画
            stopLoading(loading);
            console.error('方案生成失败:', err);
            Swal.fire({
                title: '方案生成失败',
                text: err.message || '请稍后再试',
                icon: 'error',
                confirmButtonText: '确定'
            });
        });
}

window.onload = function () {
    // 清除旧的方案缓存
    sessionStorage.removeItem('scheme');

    // 显示加载动画
    const loading = startLoading('正在加载用户信息...');

    getUserRiskInfo().then(riskInfo => {
        if (riskInfo) {
            // 填充个人信息卡片：5 个只读字段
            document.getElementById('age').textContent = riskInfo.age;
            document.getElementById('sex').textContent = riskInfo.sex;
            document.getElementById('height').textContent = riskInfo.height + 'cm';
            document.getElementById('weight').textContent = riskInfo.weight + 'kg';
            document.getElementById('disease').textContent = riskInfo.disease;
        } else {
            // 无数据 → 提示用户先填写个人信息
            Swal.fire({
                title: '请先添加用户信息',
                text: '需先完善个人信息才能生成方案',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: '去完善',
                cancelButtonText: '取消'
            }).then(result => {
                if (result.isConfirmed) {
                    window.location.href = '/userinfo/userinfo.html';
                }
            });
        }
    }).catch(err => {
        console.error('获取用户信息失败:', err);
    }).finally(() => {
        // 数据加载完成后关闭加载动画
        stopLoading(loading);
    });
};
