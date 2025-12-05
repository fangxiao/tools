// 模态框模块
const ModalModule = (function() {
    // 显示自定义模态框
    function showCustomModal(title, content, type = 'info', confirmText = '确定', onConfirm = null) {
        // 移除任何现有的模态框
        const existingModal = document.querySelector('.custom-modal-overlay');
        if (existingModal && existingModal.parentNode) {
            existingModal.parentNode.removeChild(existingModal);
        }
        
        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.className = 'custom-modal-overlay';
        
        // 根据类型确定图标
        let iconHtml = '';
        switch(type) {
            case 'success':
                iconHtml = '<i class="modal-icon success">✓</i>';
                break;
            case 'error':
                iconHtml = '<i class="modal-icon error">✗</i>';
                break;
            case 'warning':
                iconHtml = '<i class="modal-icon warning">!</i>';
                break;
            default:
                iconHtml = '<i class="modal-icon info">i</i>';
        }
        
        // 创建模态框
        overlay.innerHTML = `
            <div class="custom-modal">
                <div class="modal-header">
                    ${iconHtml}
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="window.ModalModule.closeCustomModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <p>${content}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-confirm ${type}" onclick="window.ModalModule.handleModalConfirm(${onConfirm ? 'true' : 'false'})">${confirmText}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // 存储回调函数
        if (onConfirm) {
            overlay.dataset.onConfirm = 'true';
            // 将回调函数存储为字符串
            overlay.dataset.confirmCallback = onConfirm.toString();
        }
        
        // 点击遮罩层关闭模态框
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeCustomModal();
            }
        });
    }
    
    // 显示确认模态框
    function showCustomConfirm(title, content, onConfirm, cancelText = '取消', confirmText = '确定') {
        // 移除任何现有的模态框
        const existingModal = document.querySelector('.custom-modal-overlay');
        if (existingModal && existingModal.parentNode) {
            existingModal.parentNode.removeChild(existingModal);
        }
        
        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.className = 'custom-modal-overlay';
        
        // 创建带确认按钮的模态框
        overlay.innerHTML = `
            <div class="custom-modal">
                <div class="modal-header">
                    <i class="modal-icon warning">?</i>
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="window.ModalModule.closeCustomModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <p>${content}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" onclick="window.ModalModule.closeCustomModal()">${cancelText}</button>
                    <button class="btn-confirm warning" onclick="window.ModalModule.handleModalConfirm(true)">${confirmText}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // 存储回调函数
        overlay.dataset.onConfirm = 'true';
        if (onConfirm) {
            overlay.dataset.confirmCallback = onConfirm.toString();
        }
        
        // 点击遮罩层关闭模态框
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeCustomModal();
            }
        });
    }
    
    // 关闭自定义模态框
    function closeCustomModal() {
        const modal = document.querySelector('.custom-modal-overlay');
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }
    
    // 处理模态框确认操作
    function handleModalConfirm(shouldConfirm) {
        const modal = document.querySelector('.custom-modal-overlay');
        if (modal && shouldConfirm && modal.dataset.confirmCallback) {
            try {
                // 提取并执行回调函数
                const callbackFunction = new Function('return (' + modal.dataset.confirmCallback + ')')();
                callbackFunction();
            } catch (e) {
                console.error('执行确认回调函数时出错:', e);
            }
        }
        closeCustomModal();
    }
    
    // 公共接口
    return {
        showCustomModal,
        showCustomConfirm,
        closeCustomModal,
        handleModalConfirm
    };
})();

// 使模块在全局范围内可用
window.ModalModule = ModalModule;