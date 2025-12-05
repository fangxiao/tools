// 工具函数集合
const helpers = {
    // 格式化日期
    formatDate(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // 生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // 深拷贝对象
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item));
        }
        
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    },

    // 防抖函数
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    // 节流函数
    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // 关闭模态框
    closeModal(modalId) {
        // 如果提供了modalId，则隐藏特定的模态框
        if (modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
                // 如果有遮罩层也一起隐藏
                const overlay = modal.closest('.modal-overlay');
                if (overlay) {
                    overlay.style.display = 'none';
                }
            }
        } else {
            // 如果没有提供modalId，则隐藏所有模态框
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                modal.style.display = 'none';
                // 如果有遮罩层也一起隐藏
                const overlay = modal.closest('.modal-overlay');
                if (overlay) {
                    overlay.style.display = 'none';
                }
            });
        }
    },
    
    // 显示成功消息
    showSuccess(title, message) {
        showMessage(title, message, 'success');
    },
    
    // 显示错误消息
    showError(title, message) {
        showMessage(title, message, 'error');
    }
};

// 显示消息函数
function showMessage(title, message, type) {
    // Remove any existing messages
    const existingMessage = document.querySelector('.custom-message-overlay');
    if (existingMessage && existingMessage.parentNode) {
        existingMessage.parentNode.removeChild(existingMessage);
    }
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `custom-message-overlay custom-message-${type}`;
    messageElement.innerHTML = `
        <div class="custom-message">
            <div class="custom-message-header">
                <h4>${title}</h4>
                <span class="custom-message-close">&times;</span>
            </div>
            <div class="custom-message-content">
                <p>${message}</p>
            </div>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(messageElement);
    
    // Add close event
    const closeBtn = messageElement.querySelector('.custom-message-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            if (messageElement && messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        });
    }
    
    // Auto remove after 3 seconds
    setTimeout(function() {
        if (messageElement && messageElement.parentNode) {
            messageElement.parentNode.removeChild(messageElement);
        }
    }, 3000);
}

// 在非模块环境中将Helpers对象挂载到window对象上
window.Helpers = helpers;