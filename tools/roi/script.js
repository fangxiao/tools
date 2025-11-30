document.addEventListener('DOMContentLoaded', function() {
    // Authentication check function
    function checkAuth() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    }

    // Logout function
    function logout() {
        localStorage.removeItem('currentUser');
        window.location.href = '/login.html';
    }

    // Check if user is logged in
    if (!checkAuth()) {
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Add event listener for back to tools button
    const backToToolsBtn = document.getElementById('back-to-tools');
    if (backToToolsBtn) {
        backToToolsBtn.addEventListener('click', function() {
            window.location.href = '/index.html';
        });
    }

    // Display username
    document.getElementById('username-display').textContent = currentUser.username;
    
    // Logout functionality
    document.getElementById('logout-btn').addEventListener('click', function() {
        logout();
    });

    // 标记值到显示文本的映射表
    const valueTagDisplayMap = {
        'very-value': '利用率很高',
        'free': '空闲',
        'low-usage': '利用率不够'
    };

    // 防抖函数 - 用于限制函数执行频率，只执行最后一次
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            // 清除之前的定时器
            clearTimeout(timeoutId);
            // 设置新的定时器
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // 节流函数 - 用于限制函数执行频率，按固定间隔执行
    function throttle(func, delay) {
        let lastExecTime = 0;
        return function (...args) {
            const now = Date.now();
            if (now - lastExecTime >= delay) {
                func.apply(this, args);
                lastExecTime = now;
            }
        };
    }

    // Collapsible sections functionality
    const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
    collapsibleHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const icon = this.querySelector('.toggle-icon');
            
            content.classList.toggle('collapsed');
            content.classList.toggle('expanded');
            icon.classList.toggle('rotated');
        });
    });

    const categoryForm = document.getElementById('category-form');
    const itemForm = document.getElementById('item-form');
    const categoriesList = document.getElementById('categories-list');
    const itemsList = document.getElementById('items-list');
    const usageLogs = document.getElementById('usage-logs');
    const itemCategorySelect = document.getElementById('item-category');
    const categoryFilterSelect = document.getElementById('category-filter');
    const keywordFilterInput = document.getElementById('keyword-filter');
    const dateFromFilterInput = document.getElementById('date-from-filter');
    const dateToFilterInput = document.getElementById('date-to-filter');
    const applyFilterButton = document.getElementById('apply-filter');
    const resetFilterButton = document.getElementById('reset-filter');
    const logsPagination = document.getElementById('logs-pagination');
    const logsKeywordFilterInput = document.getElementById('logs-keyword-filter');
    const applyLogsFilterButton = document.getElementById('apply-logs-filter');
    const resetLogsFilterButton = document.getElementById('reset-logs-filter');
    let categories = []; // Store categories locally for reference
    const LOGS_PER_PAGE = 10; // Number of logs per page

    // Load data on page load
    loadCategories();
    loadItems();
    loadUsageLogs(1); // Load first page of logs

    // Category form submission
    categoryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('category-name').value;
        // Generate a unique ID for the category
        const id = 'cat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        addCategory({ id, name });

        // Reset form
        categoryForm.reset();
    });

    // Item form submission
    function addItem(item) {
        fetch(`/api/items?userId=${currentUser.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.json().then(err => Promise.reject(err));
            }
        })
        .then(data => {
            loadItems();
        })
        .catch(error => {
            console.error('添加物品时出错:', error);
            alert('添加物品时出错: ' + (error.error || error.message || '未知错误'));
        });
    }

    itemForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('item-name').value;
        const category = document.getElementById('item-category').value;
        const price = document.getElementById('item-price').value;
        const usageCount = document.getElementById('item-usage-count').value;
        const purchaseDate = document.getElementById('purchase-date').value;
        const lastUsed = document.getElementById('last-used-date').value;

        addItem({
            name: name,
            category: category,
            price: price || 0,
            usageCount: usageCount || 0,
            purchaseDate: purchaseDate,
            lastUsed: lastUsed || null
        });

        // Reset form
        itemForm.reset();
    });

    // Filter functionality
    // 使用防抖函数，当用户停止输入300ms后再执行筛选
    const debouncedLoadItems = debounce(function() {
        loadItems(); // Load items with current filter values
    }, 300);

    // 物品关键词搜索添加实时搜索功能
    keywordFilterInput.addEventListener('input', debouncedLoadItems);
    
    // 分类筛选和日期筛选使用节流函数，限制每500ms最多执行一次
    const throttledLoadItems = throttle(function() {
        loadItems();
    }, 500);
    
    categoryFilterSelect.addEventListener('change', throttledLoadItems);
    dateFromFilterInput.addEventListener('change', throttledLoadItems);
    dateToFilterInput.addEventListener('change', throttledLoadItems);
    
    // 点击筛选按钮时立即执行
    applyFilterButton.addEventListener('click', function() {
        loadItems(); // Load items with current filter values
    });

    resetFilterButton.addEventListener('click', function() {
        // Reset all filter inputs
        keywordFilterInput.value = '';
        categoryFilterSelect.value = '';
        dateFromFilterInput.value = '';
        dateToFilterInput.value = '';
        
        // Reload items without filters
        loadItems();
    });

    // Logs filter functionality
    // 使用防抖函数，当用户停止输入300ms后再执行日志搜索
    const debouncedLoadUsageLogs = debounce(function() {
        loadUsageLogs(1); // Load first page with keyword filter
    }, 300);

    // 日志关键词搜索添加实时搜索功能
    logsKeywordFilterInput.addEventListener('input', debouncedLoadUsageLogs);
    
    // 点击日志搜索按钮时立即执行
    applyLogsFilterButton.addEventListener('click', function() {
        loadUsageLogs(1); // Load first page with keyword filter
    });

    resetLogsFilterButton.addEventListener('click', function() {
        // Reset logs keyword filter
        logsKeywordFilterInput.value = '';
        loadUsageLogs(1); // Load first page without keyword filter
    });

    // Function to add a new category
    function addCategory(category) {
        fetch(`/api/categories?userId=${currentUser.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(category)
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.json().then(err => Promise.reject(err));
            }
        })
        .then(data => {
            loadCategories();
        })
        .catch(error => {
            alert('添加分类时出错: ' + (error.error || '未知错误'));
        });
    }

    // Function to delete a category
    function deleteCategory(id) {
        fetch(`/api/categories/${id}?userId=${currentUser.id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                loadCategories();
                loadItems(); // Reload items to update category dropdown
            } else {
                return response.json().then(err => Promise.reject(err));
            }
        })
        .catch(error => {
            alert('删除分类时出错: ' + (error.error || '未知错误'));
        });
    }

    // Function to load categories
    function loadCategories() {
        fetch(`/api/categories?userId=${currentUser.id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应错误 ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            categories = data; // Store categories for reference
            displayCategories(categories);
            updateCategoryDropdowns(categories);
        })
        .catch(error => {
            console.error('加载分类时出错:', error);
            categoriesList.innerHTML = '<div class="no-categories">加载分类时出错: ' + error.message + '</div>';
        });
    }

    // Function to load categories for edit form and select a specific category
    function loadCategoriesForEditForm(selectedCategoryId) {
        fetch(`/api/categories?userId=${currentUser.id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应错误 ' + response.status);
            }
            return response.json();
        })
        .then(categories => {
            const categorySelect = document.getElementById('edit-item-category');
            if (!categorySelect) return;

            // Clear existing options
            categorySelect.innerHTML = '<option value="">选择分类</option>';
            
            // Add categories to the dropdown
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                if (category.id === selectedCategoryId) {
                    option.selected = true;
                }
                categorySelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('加载分类时出错:', error);
        });
    }

    // Function to display categories
    function displayCategories(categories) {
        if (categories.length === 0) {
            categoriesList.innerHTML = '<div class="no-categories">未找到分类。添加一些分类以开始使用。</div>';
            return;
        }

        // Create a grid container for categories
        const categoriesGrid = document.createElement('div');
        categoriesGrid.className = 'categories-grid';
        
        categories.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'category-card';
            categoryElement.innerHTML = `
                <div class="category-header">
                    <div class="category-title">${category.name}</div>
                </div>
                <div class="category-actions">
                    <button class="btn-delete" onclick="deleteCategory('${category.id}')">
                        <span class="icon">🗑️</span>
                        <span>删除</span>
                    </button>
                </div>
            `;
            categoriesGrid.appendChild(categoryElement);
        });
        
        // Clear the categories list and append the grid
        categoriesList.innerHTML = '';
        categoriesList.appendChild(categoriesGrid);
    }

    // Function to update category dropdowns in item form and filter
    function updateCategoryDropdowns(categories) {
        // Update item form dropdown
        itemCategorySelect.innerHTML = '<option value="">选择分类</option>';
        
        // Update filter dropdown
        categoryFilterSelect.innerHTML = '<option value="">所有分类</option>';
        
        categories.forEach(category => {
            // Add to item form dropdown
            const itemOption = document.createElement('option');
            itemOption.value = category.id;
            itemOption.textContent = category.name;
            itemCategorySelect.appendChild(itemOption);
            
            // Add to filter dropdown
            const filterOption = document.createElement('option');
            filterOption.value = category.id;
            filterOption.textContent = category.name;
            categoryFilterSelect.appendChild(filterOption);
        });
    }

    // Function to load items with filters - now using server-side filtering
    function loadItems() {
        // Get filter values
        const keyword = keywordFilterInput.value;
        const category = categoryFilterSelect.value;
        const dateFrom = dateFromFilterInput.value;
        const dateTo = dateToFilterInput.value;
        
        // Build query parameters
        let queryParams = `userId=${currentUser.id}`;
        if (keyword) queryParams += `&keyword=${encodeURIComponent(keyword)}`;
        if (category) queryParams += `&category=${encodeURIComponent(category)}`;
        if (dateFrom) queryParams += `&dateFrom=${encodeURIComponent(dateFrom)}`;
        if (dateTo) queryParams += `&dateTo=${encodeURIComponent(dateTo)}`;
        
        fetch(`/api/items?${queryParams}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应错误 ' + response.status);
            }
            return response.json();
        })
        .then(items => {
            displayItems(items);
        })
        .catch(error => {
            console.error('加载物品时出错:', error);
            itemsList.innerHTML = '<div class="no-items">加载物品时出错: ' + error.message + '</div>';
        });
    }

    // Function to display items
    function displayItems(items) {
        if (items.length === 0) {
            itemsList.innerHTML = '<div class="no-items">未找到物品。添加一些物品以开始使用。</div>';
            return;
        }

        itemsList.innerHTML = '';
        items.forEach(item => {
            // Calculate purchase duration
            let purchaseDuration = '';
            const purchaseDate = item.purchase_date || item.purchaseDate || '';
            if (purchaseDate) {
                const purchaseDateTime = new Date(purchaseDate).getTime();
                const currentDateTime = new Date().getTime();
                const timeDiff = currentDateTime - purchaseDateTime;
                const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                purchaseDuration = daysDiff + ' 天';
            } else {
                purchaseDuration = '未设置';
            }

            // Get item properties
            const purchaseDateDisplay = item.purchase_date || item.purchaseDate || '未设置';
            const valueTag = item.value_tag || '';
            const price = item.price || 0;
            const usageCount = item.usage_count !== undefined ? item.usage_count : (item.usageCount || 0);
            
            // Calculate price per use
            let pricePerUse = '';
            if (usageCount > 0 && price > 0) {
                const calculatedPricePerUse = price / usageCount;
                pricePerUse = calculatedPricePerUse.toFixed(2) + ' 元';
            } else if (price > 0 && usageCount === 0) {
                pricePerUse = '未使用';
            } else {
                pricePerUse = '未设置';
            }
            
            // Auto-set value tag based on usage count and price
            let autoValueTag = valueTag; // Keep existing tag if already set
            if (!valueTag) { // Only auto-set if no tag is already set
                if (usageCount === 0) {
                    autoValueTag = 'free'; // Free if usage count is 0
                } else if (price > 0 && usageCount > 0 && (price / usageCount) <= 1) {
                    autoValueTag = 'very-value'; // Very value if price per use <= 1
                }
            }
            
            const itemElement = document.createElement('div');
            itemElement.className = 'item-card';
            
            // Add stamp for items marked
            let stampHtml = '';
            switch (autoValueTag) {
                case 'very-value':
                    stampHtml = '<div class="stamp stamp-very-value">利用率很高</div>';
                    break;
                case 'free':
                    stampHtml = '<div class="stamp stamp-free">空闲</div>';
                    break;
                case 'low-usage':
                    stampHtml = '<div class="stamp stamp-low-usage">利用率不够</div>';
                    break;
            }
            
            itemElement.innerHTML = `
                ${stampHtml}
                <div class="item-header">
                    <div class="item-title">${item.name}</div>
                </div>
                <div class="item-details">
                    <div class="detail-row">
                        <div class="detail-label">分类:</div>
                        <div class="detail-value">${getCategoryName(item.category)}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">购买日期:</div>
                        <div class="detail-value">${purchaseDateDisplay}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">购买时长:</div>
                        <div class="detail-value">${purchaseDuration}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">价格:</div>
                        <div class="detail-value">${price > 0 ? price.toFixed(2) + ' 元' : '未设置'}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">使用次数:</div>
                        <div class="detail-value">${usageCount}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">每次使用价格:</div>
                        <div class="detail-value">${pricePerUse}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">标记:</div>
                        <div class="detail-value">${valueTagDisplayMap[valueTag] || '无'}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">状态:</div>
                        <div class="detail-value">${item.status || (item.usage_count === 0 ? '未使用' : '使用中')}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">最后使用:</div>
                        <div class="detail-value">${formatLastUsedDate(item.last_used || item.lastUsed)}</div>
                    </div>
                </div>
                <div class="item-actions">
                    ${item.status !== '废弃' && item.status !== '已废弃' ? getUseReminder(item.last_used || item.lastUsed) : ''}
                    ${item.status !== '废弃' && item.status !== '已废弃'
                        ? `<button class="btn-use" onclick="useItem(${item.id})">
                            <span class="icon">✅</span>
                            <span>使用打卡</span>
                        </button>`
                        : ''
                    }
                    <button class="btn-edit" onclick="showEditForm(${item.id})">
                        <span class="icon">✏️</span>
                        <span>编辑</span>
                    </button>
                    <button class="btn-delete" onclick="deleteItem(${item.id})">
                        <span class="icon">🗑️</span>
                        <span>删除</span>
                    </button>
                </div>
            `;
            itemsList.appendChild(itemElement);
        });
    }

    // Function to show edit form
    function showEditForm(itemId) {
        // Find the item to edit
        fetch(`/api/items/${itemId}?userId=${currentUser.id}`)
        .then(response => response.json())
        .then(item => {
            // Create edit form
            const editForm = document.createElement('div');
            editForm.className = 'edit-form-overlay';
            editForm.innerHTML = `
                <div class="edit-form">
                    <h3>编辑物品</h3>
                    <form id="edit-item-form">
                        <div class="form-group">
                            <label for="edit-item-name">物品名称：</label>
                            <input type="text" id="edit-item-name" value="${item.name}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-item-category">分类：</label>
                            <select id="edit-item-category" required>
                                <!-- Options will be populated by JavaScript -->
                            </select>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="edit-item-price">价格（元）：</label>
                                <input type="number" id="edit-item-price" step="0.01" min="0" value="${item.price || ''}">
                            </div>
                            <div class="form-group">
                                <label for="edit-item-usage-count">使用次数：</label>
                                <input type="number" id="edit-item-usage-count" min="0" value="${item.usage_count !== undefined ? item.usage_count : (item.usageCount || 0)}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="edit-item-value-tag">标记：</label>
                                <select id="edit-item-value-tag">
                                    <option value="">无</option>
                                    <option value="very-value" ${item.value_tag === 'very-value' ? 'selected' : ''}>利用率很高</option>
                                    <option value="low-usage" ${item.value_tag === 'low-usage' ? 'selected' : ''}>利用率不够</option>
                                    <option value="free" ${item.value_tag === 'free' ? 'selected' : ''}>空闲</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="edit-item-status">状态：</label>
                                <select id="edit-item-status">
                                    <option value="未使用" ${item.status === '未使用' ? 'selected' : ''}>未使用</option>
                                    <option value="使用中" ${item.status === '使用中' ? 'selected' : ''}>使用中</option>
                                    <option value="已废弃" ${item.status === '已废弃' ? 'selected' : ''}>已废弃</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="edit-purchase-date">购买日期：</label>
                                <input type="date" id="edit-purchase-date" value="${item.purchase_date || item.purchaseDate || ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="edit-last-used-date">最后使用时间：</label>
                                <input type="datetime-local" id="edit-last-used-date" value="${formatLastUsedForInput(item.last_used || item.lastUsed)}">
                            </div>
                        </div>
                        <div class="form-actions">
                            <button type="button" onclick="cancelEdit()">
                                <span class="icon">❌</span>
                                <span>取消</span>
                            </button>
                            <button type="submit">
                                <span class="icon">💾</span>
                                <span>保存</span>
                            </button>
                        </div>
                    </form>
                </div>
            `;

            // Add to document
            document.body.appendChild(editForm);

            // Populate category dropdown
            loadCategoriesForEditForm(item.category);

            // Handle form submission
            document.getElementById('edit-item-form').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const updatedItem = {
                    name: document.getElementById('edit-item-name').value,
                    category: document.getElementById('edit-item-category').value,
                    price: document.getElementById('edit-item-price').value || 0,
                    usageCount: document.getElementById('edit-item-usage-count').value || 0,
                    valueTag: document.getElementById('edit-item-value-tag').value,
                    status: document.getElementById('edit-item-status').value,
                    purchaseDate: document.getElementById('edit-purchase-date').value,
                    lastUsed: document.getElementById('edit-last-used-date').value
                };

                editItem(itemId, updatedItem);
                document.body.removeChild(editForm);
            });

        })
        .catch(error => {
            console.error('加载物品详情时出错:', error);
            alert('加载物品详情时出错: ' + error.message);
        });
    }

    // Function to cancel edit
    function cancelEdit() {
        const editForm = document.querySelector('.edit-form-overlay');
        if (editForm) {
            document.body.removeChild(editForm);
        }
    }

    // Make cancelEdit globally available
    window.cancelEdit = cancelEdit;

    // Function to load usage logs with pagination and keyword search
    function loadUsageLogs(page = 1) {
        // Get logs keyword filter value
        const keyword = logsKeywordFilterInput.value;
        
        // Build query parameters
        let queryParams = `userId=${currentUser.id}&page=${page}&limit=${LOGS_PER_PAGE}`;
        if (keyword) queryParams += `&keyword=${encodeURIComponent(keyword)}`;
        
        fetch(`/api/logs?${queryParams}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应错误 ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            displayUsageLogs(data.logs);
            renderPaginationControls(data.pagination);
        })
        .catch(error => {
            console.error('加载使用日志时出错:', error);
            usageLogs.innerHTML = '<div class="no-logs">加载使用日志时出错: ' + error.message + '</div>';
        });
    }

    // Function to display usage logs
    function displayUsageLogs(logs) {
        if (logs.length === 0) {
            usageLogs.innerHTML = '<div class="no-logs">未找到使用日志。</div>';
            return;
        }

        usageLogs.innerHTML = '';
        logs.forEach(log => {
            const logElement = document.createElement('div');
            logElement.className = 'log-entry';
            logElement.innerHTML = `
                <div class="log-header">
                    <div class="log-item">${log.item_name || log.itemName}</div>
                    <div class="log-date">${new Date(log.used_at || log.usedAt).toLocaleString('zh-CN')}</div>
                </div>
            `;
            usageLogs.appendChild(logElement);
        });
    }

    // Function to render pagination controls
    function renderPaginationControls(pagination) {
        // Clear previous pagination controls
        logsPagination.innerHTML = '';
        
        if (pagination.totalPages <= 1) {
            return; // No need for pagination if there's only one page
        }
        
        // Previous button
        const prevButton = document.createElement('button');
        prevButton.innerHTML = '<span class="icon">◀</span>';
        prevButton.disabled = !pagination.hasPrev;
        prevButton.addEventListener('click', () => {
            if (pagination.hasPrev) {
                loadUsageLogs(pagination.currentPage - 1);
            }
        });
        logsPagination.appendChild(prevButton);
        
        // Page buttons
        for (let i = 1; i <= pagination.totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.classList.toggle('active', i === pagination.currentPage);
            pageButton.addEventListener('click', () => {
                loadUsageLogs(i);
            });
            logsPagination.appendChild(pageButton);
        }
        
        // Next button
        const nextButton = document.createElement('button');
        nextButton.innerHTML = '<span class="icon">▶</span>';
        nextButton.disabled = !pagination.hasNext;
        nextButton.addEventListener('click', () => {
            if (pagination.hasNext) {
                loadUsageLogs(pagination.currentPage + 1);
            }
        });
        logsPagination.appendChild(nextButton);
    }

    // Function to get category name
    function getCategoryName(categoryId) {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.name : categoryId;
    }

    // Function to delete an item
    function deleteItem(id) {
        fetch(`/api/items/${id}?userId=${currentUser.id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                loadItems();
                loadUsageLogs(1); // Reload logs as they might be affected
            } else {
                throw new Error('删除失败');
            }
        })
        .catch(error => {
            console.error('删除物品时出错:', error);
            alert('删除物品时出错: ' + (error.message || '未知错误'));
        });
    }

    // Custom alert function
    function showAlert(message, type = 'info') {
        // Remove any existing alerts
        const existingAlert = document.querySelector('.custom-alert');
        if (existingAlert) {
            document.body.removeChild(existingAlert);
        }
        
        // Create alert element
        const alertElement = document.createElement('div');
        alertElement.className = `custom-alert custom-alert-${type}`;
        alertElement.innerHTML = `
            <div class="custom-alert-content">
                <span class="custom-alert-message">${message}</span>
                <button class="custom-alert-close">&times;</button>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(alertElement);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (alertElement.parentNode) {
                alertElement.parentNode.removeChild(alertElement);
            }
        }, 3000);
        
        // Add close event
        const closeBtn = alertElement.querySelector('.custom-alert-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (alertElement.parentNode) {
                    alertElement.parentNode.removeChild(alertElement);
                }
            });
        }
    }

    // Function to use an item
    function useItem(itemId) {
        // First, get the current item to update its usage count
        fetch(`/api/items/${itemId}?userId=${currentUser.id}`)
            .then(response => response.json())
            .then(item => {
                // Increment usage count
                const updatedItem = {
                    usageCount: (item.usage_count || 0) + 1,
                    lastUsed: new Date().toISOString(),
                    status: '使用中'  // 当使用物品时，将状态更新为"使用中"
                };

                // Update the item
                return fetch(`/api/items/${itemId}?userId=${currentUser.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedItem)
                });
            })
            .then(response => response.json())
            .then(updatedItem => {
                // Reload the items list
                loadItems();
                
                // Show success message
                showAlert(`物品 "${updatedItem.name}" 使用次数已更新！`, 'success');
            })
            .catch(error => {
                console.error('使用物品时出错:', error);
                showAlert('使用物品时出错: ' + error.message, 'error');
            });
    }

    // Function to edit an item
    function editItem(id, itemData) {
        fetch(`/api/items/${id}?userId=${currentUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemData)
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.json().then(err => Promise.reject(err));
            }
        })
        .then(data => {
            loadItems();
        })
        .catch(error => {
            console.error('编辑物品时出错:', error);
            showAlert('编辑物品时出错: ' + (error.error || error.message || '未知错误'), 'error');
        });
    }

    // Function to create a new item
    function createItem() {
        const name = document.getElementById('item-name').value;
        const category = document.getElementById('item-category').value;
        const purchaseDate = document.getElementById('purchase-date').value;
        const price = document.getElementById('item-price').value;
        const usageCount = parseInt(document.getElementById('item-usage-count').value) || 0;
        
        // 根据使用次数确定默认状态
        const status = usageCount === 0 ? '未使用' : '使用中';

        const item = {
            name: name,
            category: category,
            purchaseDate: purchaseDate,
            price: price,
            usageCount: usageCount,
            status: status
        };

        fetch(`/api/items?userId=${currentUser.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        })
        .then(response => response.json())
        .then(createdItem => {
            loadItems();
            document.getElementById('item-form').reset();
            showAlert('物品创建成功！', 'success');
        })
        .catch(error => {
            console.error('创建物品时出错:', error);
            showAlert('创建物品时出错: ' + error.message, 'error');
        });
    }

    // Make functions available globally for inline event handlers
    window.deleteItem = deleteItem;
    window.useItem = useItem;
    window.deleteCategory = deleteCategory;
    window.showEditForm = showEditForm;

    // Helper function to format last used date for input field
    function formatLastUsedForInput(lastUsed) {
        if (!lastUsed || lastUsed === 'null') {
            return '';
        }
        
        // Parse the date string
        const date = new Date(lastUsed);
        if (isNaN(date.getTime())) {
            return '';
        }
        
        // Format as YYYY-MM-DDTHH:mm for datetime-local input
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    // Helper function to format last used date
    function formatLastUsedDate(lastUsed) {
        if (!lastUsed || lastUsed === 'null') {
            return '从未使用';
        }
        
        // Parse the date string
        const date = new Date(lastUsed);
        if (isNaN(date.getTime())) {
            return '从未使用';
        }
        
        // Format as YYYY-MM-DD HH:mm:ss
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    // Helper function to generate use reminder if item hasn't been used for more than 10 days
    function getUseReminder(lastUsed) {
        if (!lastUsed || lastUsed === 'null') {
            return ''; // No reminder for items that were never used
        }
        
        const lastUsedDate = new Date(lastUsed);
        if (isNaN(lastUsedDate.getTime())) {
            return ''; // Invalid date
        }
        
        const now = new Date();
        const diffTime = Math.abs(now - lastUsedDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 10) {
            return '<div class="reminder-banner">💡 超过10天未使用，考虑使用一下吧！</div>';
        }
        
        return '';
    }

    // 先确保html2canvas已加载
    function loadHtml2Canvas() {
        return new Promise((resolve, reject) => {
            // 检查是否已经加载了html2canvas
            if (window.html2canvas) {
                resolve(window.html2canvas);
                return;
            }
            
            // 动态创建script标签加载本地的html2canvas
            const script = document.createElement('script');
            script.src = '/tools/exercise/src/libs/html2canvas.min.js';
            script.onload = () => {
                // 等待一点时间让库初始化
                setTimeout(() => {
                    // 检查各种可能的导出方式
                    if (typeof window.html2canvas === 'function') {
                        resolve(window.html2canvas);
                    } else if (window.html2canvas && typeof window.html2canvas.default === 'function') {
                        window.html2canvas = window.html2canvas.default;
                        resolve(window.html2canvas);
                    } else if (window.html2canvas && typeof window.html2canvas.html2canvas === 'function') {
                        resolve(window.html2canvas.html2canvas);
                    } else if (typeof window.html2canvas === 'object') {
                        // 查找对象中的函数
                        for (let key in window.html2canvas) {
                            if (typeof window.html2canvas[key] === 'function') {
                                window.html2canvas = window.html2canvas[key];
                                resolve(window.html2canvas);
                                return;
                            }
                        }
                        reject(new Error('html2canvas加载完成但未找到可调用的函数'));
                    } else {
                        reject(new Error('html2canvas加载完成但未定义或不是函数'));
                    }
                }, 100);
            };
            script.onerror = () => reject(new Error('html2canvas加载失败'));
            document.head.appendChild(script);
        });
    }

    

});
