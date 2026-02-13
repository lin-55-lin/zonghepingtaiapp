// AI软件数据（从本地存储加载或使用默认数据）
let aiSoftwareData = loadAICardsFromStorage();

// 如果没有保存的数据，使用默认数据
if (!aiSoftwareData || aiSoftwareData.length === 0) {
    aiSoftwareData = [
        // 文本处理类
        {
            id: 1,
            name: "DeepSeek",
            category: "text",
            icon: "🤖",
            website: "https://chat.deepseek.com"
        },
        {
            id: 2,
            name: "Kimi",
            category: "text",
            icon: "🌙",
            website: "https://kimi.moonshot.cn"
        },
        {
            id: 3,
            name: "豆包",
            category: "text",
            icon: "🥟",
            website: "https://www.doubao.com"
        }
    ];
}

// 全局变量
let currentCategory = 'all';
let searchTerm = '';

// 搜索引擎配置
const searchEngines = {
    baidu: {
        name: '百度',
        url: 'https://www.baidu.com/s?wd='
    },
    google: {
        name: '谷歌',
        url: 'https://www.google.com/search?q='
    },
    bing: {
        name: '必应',
        url: 'https://www.bing.com/search?q='
    },
    duckduckgo: {
        name: 'DuckDuckGo',
        url: 'https://duckduckgo.com/?q='
    }
};

// DOM元素
const aiCardsContainer = document.getElementById('ai-cards');
const searchInput = document.getElementById('search-input');
const searchEngineSelect = document.getElementById('search-engine');
const searchBtn = document.getElementById('search-btn');
const tabButtons = document.querySelectorAll('.tab-btn');
const addCardBtn = document.getElementById('add-card-btn');
const manageModeBtn = document.getElementById('manage-mode-btn');
const toggleCardsBtn = document.getElementById('toggle-cards-btn');
const managePanel = document.getElementById('manage-panel');
const importBtn = document.getElementById('import-btn');
const exportBtn = document.getElementById('export-btn');
const addCardForm = document.getElementById('add-card-form');
const newCardForm = document.getElementById('new-card-form');

// 显示/隐藏卡片状态
let cardsVisible = true;
const cancelBtn = document.getElementById('cancel-btn');
const cardCategory = document.getElementById('card-category');
const customCategoryGroup = document.getElementById('custom-category-group');
const customCategoryInput = document.getElementById('custom-category');
const appTitle = document.getElementById('app-title');
const editTitleBtn = document.getElementById('edit-title-btn');

// 管理模式状态
let isManageMode = false;

// 分类事件监听器
function setupCategoryEventListeners() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    if (tabButtons) {
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                // 移除所有按钮的激活状态
                tabButtons.forEach(btn => btn.classList.remove('active'));
                // 激活当前按钮
                this.classList.add('active');
                // 更新当前分类
                currentCategory = this.dataset.category;
                renderAICards();
            });
        });
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 搜索功能
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchTerm = this.value.trim();
            // 重置页码到第一页
            localStorage.setItem('currentPage', '1');
            renderAICards();
        });
    }
    
    // 搜索按钮功能
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    // 分类标签功能
    setupCategoryEventListeners();
    
    // 添加卡片功能
    if (addCardBtn) {
        addCardBtn.addEventListener('click', function() {
            addCardForm.style.display = 'block';
            addCardBtn.style.display = 'none';
        });
    }
    
    // 取消添加卡片
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            addCardForm.style.display = 'none';
            addCardBtn.style.display = 'block';
            newCardForm.reset();
        });
    }
    
    // 表单提交
    if (newCardForm) {
        newCardForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleAddCard();
        });
    }
    
    // 分类选择变化
    if (cardCategory) {
        cardCategory.addEventListener('change', function() {
            if (this.value === 'custom') {
                customCategoryGroup.style.display = 'block';
                customCategoryInput.required = true;
            } else {
                customCategoryGroup.style.display = 'none';
                customCategoryInput.required = false;
            }
        });
    }
    
    // 管理模式切换
    if (manageModeBtn) {
        manageModeBtn.addEventListener('click', function() {
            isManageMode = !isManageMode;
            if (isManageMode) {
                this.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>';
                this.style.background = 'rgba(255, 123, 0, 0.1)';
                this.style.color = '#ff7b00';
                managePanel.style.display = 'block';
                if (editTitleBtn) editTitleBtn.style.display = 'inline-block';
                // 启用分类拖拽功能
                setupCategoryDragEvents();
                alert('已进入管理模式，可拖拽分类标签和卡片调整顺序，点击卡片右上角的按钮可删除或编辑卡片，点击标题可编辑应用名称');
            } else {
                this.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>';
                this.style.background = 'rgba(255, 255, 255, 0.8)';
                this.style.color = '#666';
                managePanel.style.display = 'none';
                if (editTitleBtn) editTitleBtn.style.display = 'none';
                // 退出编辑模式
                if (appTitle && appTitle.classList.contains('editing')) {
                    exitTitleEditMode();
                }
                // 禁用分类拖拽功能
                setupCategoryDragEvents();
            }
            renderAICards();
        });
    }
    
    // 导入功能
    if (importBtn) {
        importBtn.addEventListener('click', function() {
            handleImportBookmarks();
        });
    }
    
    // 显示/隐藏卡片功能
    if (toggleCardsBtn) {
        toggleCardsBtn.addEventListener('click', function() {
            cardsVisible = !cardsVisible;
            
            // 获取所有卡片容器、分类容器和分类按钮容器
            const cardsContainer = document.querySelector('.ai-cards-container');
            const categoriesContainer = document.querySelector('.categories');
            const categoryTabs = document.querySelector('.category-tabs');
            
            if (cardsContainer) {
                cardsContainer.style.display = cardsVisible ? 'grid' : 'none';
            }
            
            if (categoriesContainer) {
                categoriesContainer.style.display = cardsVisible ? 'flex' : 'none';
            }
            
            if (categoryTabs) {
                categoryTabs.style.display = cardsVisible ? 'flex' : 'none';
            }
            
            // 更新按钮状态
            if (cardsVisible) {
                this.style.background = 'rgba(255, 255, 255, 0.8)';
                this.style.color = '#666';
            } else {
                this.style.background = 'rgba(0, 123, 255, 0.2)';
                this.style.color = '#007bff';
            }
        });
    }
    
    // 导出功能
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            handleExportData();
        });
    }
    
    // 批量删除功能
    const batchDeleteBtn = document.getElementById('batch-delete-btn');
    if (batchDeleteBtn) {
        batchDeleteBtn.addEventListener('click', function() {
            handleBatchDelete();
        });
    }
    
    // 全选功能
    const selectAllBtn = document.getElementById('select-all-btn');
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', function() {
            handleSelectAll();
        });
    }
    
    // 标题编辑功能
    if (appTitle) {
        appTitle.addEventListener('click', function() {
            if (isManageMode) {
                enterTitleEditMode();
            }
        });
    }
    
    if (editTitleBtn) {
        editTitleBtn.addEventListener('click', function() {
            if (isManageMode) {
                enterTitleEditMode();
            }
        });
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    // 使用新的分类标签渲染函数
    renderCategoryTabs();
    
    // 尝试加载保存的卡片顺序
    reorderCardsBySavedOrder();
    
    renderAICards();
    setupEventListeners();
    // 初始设置分类拖拽功能
    setupCategoryDragEvents();
    // 设置壁纸功能
    setupWallpaperFunctionality();
    // 设置布局功能
    setupLayoutFunctionality();
    
    // 应用保存的布局设置
    const savedSettings = JSON.parse(localStorage.getItem('layoutSettings') || '{}');
    if (Object.keys(savedSettings).length > 0) {
        applyLayoutSettingsToUI(savedSettings);
    }
});

// 执行搜索
function performSearch() {
    const searchText = searchInput.value.trim();
    
    if (searchText) {
        // 如果搜索词不为空，使用百度搜索引擎
        const searchUrl = searchEngines.baidu.url + encodeURIComponent(searchText);
        window.open(searchUrl, '_blank');
    } else {
        // 如果搜索词为空，执行本地搜索
        searchTerm = searchInput.value.trim();
        renderAICards();
    }
}

// 渲染AI软件卡片
function renderAICards() {
    let filteredAIs = aiSoftwareData;

    // 根据分类过滤
    if (currentCategory !== 'all') {
        filteredAIs = filteredAIs.filter(ai => ai.category === currentCategory);
    }

    // 根据搜索查询过滤
    if (searchTerm) {
        filteredAIs = filteredAIs.filter(ai => 
            ai.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    // 清空容器
    aiCardsContainer.innerHTML = '';

    // 获取当前布局设置
    const savedSettings = JSON.parse(localStorage.getItem('layoutSettings') || '{}');
    const rows = savedSettings.rows || 3;
    const columns = savedSettings.columns || 10;
    
    // 计算每页显示的最大卡片数量
    const maxCardsPerPage = rows * columns;
    
    // 如果没有结果，显示提示
    if (filteredAIs.length === 0) {
        aiCardsContainer.innerHTML = `
            <div class="no-results">
                <h3>未找到匹配的AI软件</h3>
                <p>尝试使用不同的搜索词或选择其他分类</p>
            </div>
        `;
        return;
    }

    // 如果卡片数量超过最大显示数量，启用分页
    if (filteredAIs.length > maxCardsPerPage) {
        // 计算总页数
        const totalPages = Math.ceil(filteredAIs.length / maxCardsPerPage);
        
        // 获取当前页码（从本地存储或默认为1）
        let currentPage = parseInt(localStorage.getItem('currentPage') || '1');
        currentPage = Math.min(Math.max(currentPage, 1), totalPages);
        
        // 计算当前页的卡片范围
        const startIndex = (currentPage - 1) * maxCardsPerPage;
        const endIndex = Math.min(startIndex + maxCardsPerPage, filteredAIs.length);
        const currentPageAIs = filteredAIs.slice(startIndex, endIndex);
        
        // 渲染当前页的卡片
        currentPageAIs.forEach(ai => {
            const card = createAICard(ai);
            aiCardsContainer.appendChild(card);
        });
        
        // 创建分页指示器
        createPaginationDots(totalPages, currentPage);
    } else {
        // 如果卡片数量不超过最大显示数量，直接渲染所有卡片
        filteredAIs.forEach(ai => {
            const card = createAICard(ai);
            aiCardsContainer.appendChild(card);
        });
        
        // 移除分页指示器（如果有）
        removePaginationDots();
    }
    
    // 每次渲染后都重新应用布局设置，确保卡片尺寸一致
    if (Object.keys(savedSettings).length > 0) {
        applyLayoutSettingsToUI(savedSettings);
    }
}

// 创建分页指示器
function createPaginationDots(totalPages, currentPage) {
    // 移除现有的分页指示器
    removePaginationDots();
    
    // 创建分页容器
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination-dots';
    paginationContainer.style.display = 'flex';
    paginationContainer.style.justifyContent = 'center';
    paginationContainer.style.alignItems = 'center';
    paginationContainer.style.gap = '8px';
    paginationContainer.style.marginTop = '20px';
    paginationContainer.style.padding = '10px';
    
    // 创建分页小圆点
    for (let i = 1; i <= totalPages; i++) {
        const dot = document.createElement('button');
        dot.className = 'pagination-dot';
        dot.dataset.page = i;
        dot.style.width = '12px';
        dot.style.height = '12px';
        dot.style.borderRadius = '50%';
        dot.style.border = 'none';
        dot.style.backgroundColor = i === currentPage ? '#ff7b00' : '#ccc';
        dot.style.cursor = 'pointer';
        dot.style.transition = 'all 0.3s ease';
        
        dot.addEventListener('click', function() {
            localStorage.setItem('currentPage', i.toString());
            renderAICards();
        });
        
        paginationContainer.appendChild(dot);
    }
    
    // 将分页指示器添加到页面
    const container = document.querySelector('.container');
    if (container) {
        container.appendChild(paginationContainer);
    }
}

// 移除分页指示器
function removePaginationDots() {
    const existingPagination = document.querySelector('.pagination-dots');
    if (existingPagination) {
        existingPagination.remove();
    }
}

// 创建AI软件卡片
function createAICard(ai) {
    const card = document.createElement('div');
    card.className = 'ai-card';
    card.draggable = isManageMode; // 只在管理模式下可拖拽
    
    // 在管理模式下显示选择框和管理按钮
    let manageButtonsHtml = '';
    if (isManageMode) {
        manageButtonsHtml = `
            <div class="manage-buttons">
                <input type="checkbox" class="card-checkbox" data-id="${ai.id}">
                <button class="edit-btn" data-id="${ai.id}">✏️</button>
                <button class="delete-btn" data-id="${ai.id}" title="删除卡片">×</button>
            </div>
        `;
    }
    
    card.innerHTML = `
        <div class="ai-card-top">
            ${manageButtonsHtml}
        </div>
        <div class="ai-card-content">
            <div class="ai-card-title">
                <div class="ai-icon category-${ai.category}">${ai.icon}</div>
                <div>
                    <h3>${ai.name}</h3>
                </div>
            </div>
        </div>
    `;

    // 添加点击卡片访问网站的功能（仅在非管理模式下生效）
    card.addEventListener('click', function(e) {
        // 防止点击管理按钮时触发网站访问
        if (!isManageMode && !e.target.classList.contains('delete-btn') && !e.target.classList.contains('edit-btn')) {
            window.open(ai.website, '_blank');
        }
    });

    // 在管理模式下添加按钮事件
    if (isManageMode) {
        const deleteBtn = card.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止事件冒泡
            deleteAICard(ai.id);
        });
        
        const editBtn = card.querySelector('.edit-btn');
        editBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止事件冒泡
            editAICard(ai.id);
        });
        
        // 添加拖拽事件
        setupDragEvents(card, ai.id);
    }

    return card;
}



// 获取分类名称
function getCategoryName(category) {
    const categoryNames = {
        'all': '全部',
        'text': '文本处理',
        'image': '图像生成',
        'voice': '语音识别',
        'office': '办公软件',
        'fog-computing': '雾计算AI',
        'large-model': '大模型平台'
    };
    return categoryNames[category] || category;
}

// 获取所有可用的分类
function getAvailableCategories() {
    const categories = new Set();
    aiSoftwareData.forEach(ai => {
        categories.add(ai.category);
    });
    return Array.from(categories);
}

// 更新分类下拉菜单选项
function updateCategoryDropdown() {
    const categorySelect = document.getElementById('card-category');
    if (!categorySelect) return;
    
    // 保存当前选中的值
    const currentValue = categorySelect.value;
    
    // 清空现有选项（保留第一个"请选择分类"选项）
    categorySelect.innerHTML = '<option value="">请选择分类</option>';
    
    // 获取所有可用的分类
    const availableCategories = getAvailableCategories();
    
    // 添加预设分类
    const presetCategories = {
        'text': '文本处理',
        'image': '图像生成',
        'voice': '语音识别',
        'office': '办公软件'
    };
    
    // 添加预设分类选项
    Object.entries(presetCategories).forEach(([value, text]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        categorySelect.appendChild(option);
    });
    
    // 添加已存在的自定义分类（排除预设分类）
    availableCategories.forEach(category => {
        if (!presetCategories[category]) {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = getCategoryName(category);
            categorySelect.appendChild(option);
        }
    });
    
    // 添加自定义分类选项
    const customOption = document.createElement('option');
    customOption.value = 'custom';
    customOption.textContent = '自定义分类';
    categorySelect.appendChild(customOption);
    
    // 恢复之前选中的值（如果仍然存在）
    if (currentValue && categorySelect.querySelector(`option[value="${currentValue}"]`)) {
        categorySelect.value = currentValue;
    }
}

// 更新分类标签
function updateCategoryTabs() {
    const categories = getAvailableCategories();
    const categoryTabs = document.querySelector('.category-tabs');
    
    if (categoryTabs) {
        // 保留"全部"按钮
        const allButton = categoryTabs.querySelector('[data-category="all"]');
        categoryTabs.innerHTML = '';
        categoryTabs.appendChild(allButton);
        
        // 添加现有分类按钮
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'tab-btn';
            button.dataset.category = category;
            button.textContent = getCategoryName(category);
            
            button.addEventListener('click', function() {
                // 移除所有按钮的激活状态
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                // 激活当前按钮
                this.classList.add('active');
                // 更新当前分类
                currentCategory = this.dataset.category;
                // 重置页码到第一页
                localStorage.setItem('currentPage', '1');
                renderAICards();
            });
            
            categoryTabs.appendChild(button);
        });
    }
}

// 编辑AI软件卡片
function editAICard(cardId) {
    // 找到卡片数据
    const cardIndex = aiSoftwareData.findIndex(ai => ai.id === cardId);
    if (cardIndex === -1) return;
    
    const ai = aiSoftwareData[cardIndex];
    
    // 填充表单数据
    document.getElementById('card-name').value = ai.name;
    document.getElementById('card-website').value = ai.website;
    document.getElementById('card-icon').value = ai.icon;
    
    // 处理分类
    const categoryNames = {
        'text': '文本处理',
        'image': '图像生成', 
        'voice': '语音识别',
        'office': '办公软件'
    };
    
    let categoryValue = ai.category;
    if (!categoryNames[ai.category]) {
        // 自定义分类
        categoryValue = 'custom';
        document.getElementById('custom-category').value = ai.category;
        customCategoryGroup.style.display = 'block';
        customCategoryInput.required = true;
    }
    
    document.getElementById('card-category').value = categoryValue;
    
    // 显示编辑表单
    addCardForm.style.display = 'block';
    addCardBtn.style.display = 'none';
    
    // 修改表单标题和按钮文字
    addCardForm.querySelector('h3').textContent = '编辑软件卡片';
    addCardForm.querySelector('.submit-btn').textContent = '保存修改';
    
    // 修改表单提交行为
    newCardForm.onsubmit = function(e) {
        e.preventDefault();
        updateAICard(cardId);
    };
}

// 更新AI软件卡片
function updateAICard(cardId) {
    const name = document.getElementById('card-name').value.trim();
    const website = document.getElementById('card-website').value.trim();
    const category = document.getElementById('card-category').value;
    const customCategory = document.getElementById('custom-category').value.trim();
    const icon = document.getElementById('card-icon').value.trim() || '🤖';
    
    // 验证必填字段
    if (!name || !website || !category) {
        alert('请填写所有必填字段！');
        return;
    }
    
    // 处理自定义分类
    let finalCategory = category;
    if (category === 'custom') {
        if (!customCategory) {
            alert('请填写自定义分类名称！');
            return;
        }
        finalCategory = customCategory.toLowerCase().replace(/\s+/g, '-');
    }
    
    // 找到卡片索引
    const cardIndex = aiSoftwareData.findIndex(ai => ai.id === cardId);
    if (cardIndex === -1) return;
    
    // 更新卡片数据
    aiSoftwareData[cardIndex] = {
        ...aiSoftwareData[cardIndex],
        name: name,
        category: finalCategory,
        icon: icon,
        website: website
    };
    
    // 保存到本地存储
    saveAICardsToStorage();
    
    // 重置表单并隐藏
    newCardForm.reset();
    addCardForm.style.display = 'none';
    addCardBtn.style.display = 'block';
    customCategoryGroup.style.display = 'none';
    
    // 恢复表单标题和按钮文字
    addCardForm.querySelector('h3').textContent = '添加新软件卡片';
    addCardForm.querySelector('.submit-btn').textContent = '添加卡片';
    
    // 恢复表单提交行为
    newCardForm.onsubmit = function(e) {
        e.preventDefault();
        handleAddCard();
    };
    
    // 重新渲染卡片和分类标签
    renderAICards();
    updateCategoryTabs();
    updateCategoryDropdown(); // 更新分类下拉菜单
    
    // 显示成功消息
alert(`成功更新软件卡片：${name}`);
}

// 导入功能主入口
function handleImportBookmarks() {
    // 创建导入选项对话框
    const importType = prompt('请选择导入类型：\n1. 书签HTML文件（.html）\n2. JSON数据文件（.json）\n3. Infinity文件（.infinity）\n\n请输入 1、2 或 3：');
    
    if (!importType) return;
    
    let acceptType, importFunction;
    
    if (importType === '1') {
        acceptType = '.html,.htm';
        importFunction = importBookmarkHTML;
    } else if (importType === '2') {
        acceptType = '.json';
        importFunction = importFromJSON;
    } else if (importType === '3') {
        acceptType = '.infinity';
        importFunction = importFromInfinity;
    } else {
        alert('请输入有效的选项（1、2 或 3）');
        return;
    }
    
    // 创建文件输入元素
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = acceptType;
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        importFunction(file);
    });
    
    fileInput.click();
}

// 导入书签HTML文件
function importBookmarkHTML(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const htmlContent = e.target.result;
            const importedCards = parseBookmarkHTML(htmlContent);
            
            if (importedCards.length === 0) {
                alert('未找到有效的书签数据，请检查文件格式');
                return;
            }
            
            // 去重处理
            const newCards = importedCards.filter(newCard => {
                return !aiSoftwareData.some(existingCard => 
                    existingCard.name.toLowerCase() === newCard.name.toLowerCase() ||
                    existingCard.website.toLowerCase() === newCard.website.toLowerCase()
                );
            });
            
            if (newCards.length === 0) {
                alert('所有书签都已存在，没有新卡片需要添加');
                return;
            }
            
            // 添加新卡片
            aiSoftwareData.push(...newCards);
            
            // 保存到本地存储
            saveAICardsToStorage();
            
            // 重新渲染
            renderAICards();
            updateCategoryTabs();
            updateCategoryDropdown(); // 更新分类下拉菜单
            
            alert(`成功导入 ${newCards.length} 个新软件卡片！`);
            
        } catch (error) {
            console.error('导入失败:', error);
            alert('导入失败，请检查文件格式是否正确');
        }
    };
    
    reader.readAsText(file);
}

// 解析书签HTML文件
function parseBookmarkHTML(htmlContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    const cards = [];
    let idCounter = Math.max(...aiSoftwareData.map(card => card.id), 0) + 1;
    
    // 获取所有文件夹和链接
    const folders = doc.querySelectorAll('h3, dl');
    const folderMap = new Map(); // 存储文件夹名称和对应的链接
    
    // 解析文件夹结构
    let currentFolder = '未分类';
    folders.forEach(element => {
        if (element.tagName === 'H3') {
            // 文件夹标题
            currentFolder = element.textContent.trim() || '未分类';
        } else if (element.tagName === 'DL') {
            // 文件夹内的链接
            const links = element.querySelectorAll('a');
            const folderLinks = [];
            
            links.forEach(link => {
                const name = link.textContent.trim();
                const website = link.href;
                
                // 过滤无效链接
                if (!name || !website || website === '#' || website.startsWith('javascript:')) {
                    return;
                }
                
                // 检查是否是AI相关网站（简单过滤）
                const aiKeywords = ['ai', 'artificial', 'intelligence', 'deep', 'neural', 'machine', 'learning', 'chat', 'bot', 'gpt', 'llm'];
                const isAISite = aiKeywords.some(keyword => 
                    name.toLowerCase().includes(keyword) || website.toLowerCase().includes(keyword)
                );
                
                if (!isAISite) return;
                
                folderLinks.push({ name, website });
            });
            
            if (folderLinks.length > 0) {
                folderMap.set(currentFolder, folderLinks);
            }
        }
    });
    
    // 如果没有找到文件夹结构，尝试直接解析所有链接
    if (folderMap.size === 0) {
        const links = doc.querySelectorAll('a');
        const defaultLinks = [];
        
        links.forEach(link => {
            const name = link.textContent.trim();
            const website = link.href;
            
            // 过滤无效链接
            if (!name || !website || website === '#' || website.startsWith('javascript:')) {
                return;
            }
            
            // 检查是否是AI相关网站
            const aiKeywords = ['ai', 'artificial', 'intelligence', 'deep', 'neural', 'machine', 'learning', 'chat', 'bot', 'gpt', 'llm'];
            const isAISite = aiKeywords.some(keyword => 
                name.toLowerCase().includes(keyword) || website.toLowerCase().includes(keyword)
            );
            
            if (!isAISite) return;
            
            defaultLinks.push({ name, website });
        });
        
        if (defaultLinks.length > 0) {
            folderMap.set('书签导入', defaultLinks);
        }
    }
    
    // 根据文件夹创建卡片
    folderMap.forEach((links, folderName) => {
        // 根据文件夹名称生成分类名称
        const categoryName = generateCategoryFromFolder(folderName);
        
        links.forEach(link => {
            const card = {
                id: idCounter++,
                name: link.name,
                category: categoryName,
                // 移除软件介绍和功能特点字段
                icon: '🔗',
                website: link.website
            };
            
            cards.push(card);
        });
    });
    
    return cards;
}

// 根据文件夹名称生成分类名称
function generateCategoryFromFolder(folderName) {
    // 常见分类映射
    const categoryMappings = {
        '文本': 'text',
        '文字': 'text',
        '写作': 'text',
        '图像': 'image',
        '图片': 'image',
        '绘画': 'image',
        '语音': 'voice',
        '音频': 'voice',
        '声音': 'voice',
        '视频': 'video',
        '编程': 'code',
        '代码': 'code',
        '开发': 'code'
    };
    
    // 检查文件夹名称是否包含关键词
    const lowerFolderName = folderName.toLowerCase();
    for (const [keyword, category] of Object.entries(categoryMappings)) {
        if (lowerFolderName.includes(keyword.toLowerCase())) {
            return category;
        }
    }
    
    // 如果没有匹配到预设分类，使用文件夹名称作为自定义分类
    return folderName.toLowerCase().replace(/\s+/g, '-');
}

// 导出数据到本地文件
function handleExportData() {
    if (aiSoftwareData.length === 0) {
        alert('没有数据可以导出');
        return;
    }
    
    // 创建导出数据
    const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        totalCards: aiSoftwareData.length,
        cards: aiSoftwareData
    };
    
    // 创建下载链接
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AI软件集成_导出_${new Date().toISOString().split('T')[0]}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert(`成功导出 ${aiSoftwareData.length} 个软件卡片数据！`);
}

// 从JSON文件导入数据
function importFromJSON(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            
            if (!importData.cards || !Array.isArray(importData.cards)) {
                alert('导入文件格式不正确');
                return;
            }
            
            // 去重处理
            const newCards = importData.cards.filter(newCard => {
                return !aiSoftwareData.some(existingCard => 
                    existingCard.id === newCard.id ||
                    existingCard.name.toLowerCase() === newCard.name.toLowerCase() ||
                    existingCard.website.toLowerCase() === newCard.website.toLowerCase()
                );
            });
            
            if (newCards.length === 0) {
                alert('所有数据都已存在，没有新卡片需要添加');
                return;
            }
            
            // 更新ID以避免冲突
            const maxId = Math.max(...aiSoftwareData.map(card => card.id), 0);
            newCards.forEach((card, index) => {
                card.id = maxId + index + 1;
            });
            
            // 添加新卡片
            aiSoftwareData.push(...newCards);
            
            // 保存到本地存储
            saveAICardsToStorage();
            
            // 重新渲染
            renderAICards();
            updateCategoryTabs();
            
            alert(`成功导入 ${newCards.length} 个软件卡片！`);
            
        } catch (error) {
            console.error('导入失败:', error);
            alert('导入失败，请检查文件格式是否正确');
        }
    };
    
    reader.readAsText(file);
}

// 从Infinity文件导入数据
function importFromInfinity(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const infinityData = JSON.parse(e.target.result);
            
            // Infinity文件格式解析
            let importedCards = [];
            
            // 检查是否为标准的Infinity格式
            if (infinityData.items && Array.isArray(infinityData.items)) {
                // Infinity书签格式
                importedCards = infinityData.items.map(item => ({
                    id: Math.max(...aiSoftwareData.map(card => card.id), 0) + 1,
                    name: item.title || '未命名',
                    website: item.url || '',
                    category: 'text', // 默认分类
                    icon: item.icon || '🔗',
                    description: item.description || ''
                }));
            } else if (infinityData.cards && Array.isArray(infinityData.cards)) {
                // 兼容本应用的卡片格式
                importedCards = infinityData.cards;
            } else if (Array.isArray(infinityData)) {
                // 直接是卡片数组
                importedCards = infinityData;
            } else {
                alert('Infinity文件格式不正确');
                return;
            }
            
            if (importedCards.length === 0) {
                alert('未找到有效的卡片数据');
                return;
            }
            
            // 去重处理
            const newCards = importedCards.filter(newCard => {
                return !aiSoftwareData.some(existingCard => 
                    existingCard.id === newCard.id ||
                    existingCard.name.toLowerCase() === newCard.name.toLowerCase() ||
                    existingCard.website.toLowerCase() === newCard.website.toLowerCase()
                );
            });
            
            if (newCards.length === 0) {
                alert('所有数据都已存在，没有新卡片需要添加');
                return;
            }
            
            // 更新ID以避免冲突
            const maxId = Math.max(...aiSoftwareData.map(card => card.id), 0);
            newCards.forEach((card, index) => {
                card.id = maxId + index + 1;
            });
            
            // 添加新卡片
            aiSoftwareData.push(...newCards);
            
            // 保存到本地存储
            saveAICardsToStorage();
            
            // 重新渲染
            renderAICards();
            updateCategoryTabs();
            
            alert(`成功从Infinity文件导入 ${newCards.length} 个软件卡片！`);
            
        } catch (error) {
            console.error('Infinity导入失败:', error);
            alert('Infinity文件导入失败，请检查文件格式是否正确');
        }
    };
    
    reader.readAsText(file);
}

// 删除AI软件卡片
function deleteAICard(cardId) {
    if (confirm('确定要删除这个软件卡片吗？')) {
        // 找到卡片索引
        const cardIndex = aiSoftwareData.findIndex(ai => ai.id === cardId);
        
        if (cardIndex !== -1) {
            // 从数组中删除
            aiSoftwareData.splice(cardIndex, 1);
            
            // 保存到本地存储
            saveAICardsToStorage();
            
            // 退出管理模式
            isManageMode = false;
            if (manageModeBtn) {
                manageModeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>';
                manageModeBtn.style.background = 'rgba(255, 255, 255, 0.8)';
                manageModeBtn.style.color = '#666';
            }
            if (managePanel) {
                managePanel.style.display = 'none';
            }
            
            // 重新渲染卡片和分类标签
            renderAICards();
            updateCategoryTabs();
            updateCategoryDropdown(); // 更新分类下拉菜单
            
            // 显示成功消息
            alert('软件卡片已成功删除！');
        }
    }
}

// 处理添加卡片
function handleAddCard() {
    const name = document.getElementById('card-name').value.trim();
    const website = document.getElementById('card-website').value.trim();
    const category = document.getElementById('card-category').value;
    const customCategory = document.getElementById('custom-category').value.trim();
    const icon = document.getElementById('card-icon').value.trim() || '🤖';
    
    // 验证必填字段
    if (!name || !website || !category) {
        alert('请填写所有必填字段！');
        return;
    }
    
    // 处理自定义分类
    let finalCategory = category;
    if (category === 'custom') {
        if (!customCategory) {
            alert('请填写自定义分类名称！');
            return;
        }
        finalCategory = customCategory.toLowerCase().replace(/\s+/g, '-');
    }
    
    // 创建新卡片数据
    const newAI = {
        id: Math.max(...aiSoftwareData.map(a => a.id)) + 1,
        name: name,
        category: finalCategory,
        icon: icon,
        website: website
    };
    
    // 添加到数据数组
    aiSoftwareData.push(newAI);
    
    // 保存到本地存储
    saveAICardsToStorage();
    
    // 重置表单并隐藏
    newCardForm.reset();
    addCardForm.style.display = 'none';
    addCardBtn.style.display = 'block';
    customCategoryGroup.style.display = 'none';
    
    // 重新渲染卡片和分类标签
    renderAICards();
    updateCategoryTabs();
    updateCategoryDropdown(); // 更新分类下拉菜单
    
    // 显示成功消息
    alert(`成功添加软件卡片：${name}`);
}

// 导出功能（供其他模块使用）
window.AIPlatform = {
    addAISoftware: (newAI) => {
        aiSoftwareData.push({
            ...newAI,
            id: Math.max(...aiSoftwareData.map(a => a.id)) + 1
        });
        renderAICards();
    }
};

// 分类标签拖拽排序功能
function setupCategoryDragEvents() {
    const categoryTabs = document.getElementById('category-tabs');
    if (!categoryTabs) return;
    
    const tabButtons = categoryTabs.querySelectorAll('.tab-btn');
    
    tabButtons.forEach((tab, index) => {
        // 只在管理模式下启用拖拽
        tab.draggable = isManageMode;
        
        // 拖拽开始
        tab.addEventListener('dragstart', function(e) {
            if (!isManageMode) {
                e.preventDefault();
                return;
            }
            this.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', this.dataset.category);
        });
        
        // 拖拽结束
        tab.addEventListener('dragend', function() {
            this.classList.remove('dragging');
            tabButtons.forEach(t => t.classList.remove('drag-over'));
        });
        
        // 拖拽经过
        tab.addEventListener('dragover', function(e) {
            if (!isManageMode) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            const draggedCategory = e.dataTransfer.getData('text/plain');
            if (draggedCategory !== this.dataset.category) {
                this.classList.add('drag-over');
            }
        });
        
        // 拖拽离开
        tab.addEventListener('dragleave', function() {
            this.classList.remove('drag-over');
        });
        
        // 放置
        tab.addEventListener('drop', function(e) {
            if (!isManageMode) return;
            e.preventDefault();
            this.classList.remove('drag-over');
            
            const draggedCategory = e.dataTransfer.getData('text/plain');
            const targetCategory = this.dataset.category;
            
            if (draggedCategory !== targetCategory) {
                // 重新排列分类顺序
                reorderCategories(draggedCategory, targetCategory);
            }
        });
    });
}

// 重新排列分类顺序
function reorderCategories(draggedCategory, targetCategory) {
    // 获取所有分类按钮
    const tabButtons = document.querySelectorAll('.tab-btn');
    const categories = Array.from(tabButtons).map(tab => tab.dataset.category);
    
    // 移除"全部"分类，因为它应该始终在第一个位置
    const allIndex = categories.indexOf('all');
    if (allIndex > -1) {
        categories.splice(allIndex, 1);
    }
    
    // 找到拖拽分类和目标分类的索引
    const draggedIndex = categories.indexOf(draggedCategory);
    const targetIndex = categories.indexOf(targetCategory);
    
    if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
        // 从原位置移除拖拽的分类
        const [draggedItem] = categories.splice(draggedIndex, 1);
        
        // 插入到新位置
        categories.splice(targetIndex, 0, draggedItem);
        
        // 重新构建分类顺序（"全部"始终在第一个位置）
        const newOrder = ['all', ...categories];
        
        // 保存分类顺序到localStorage
        saveCategoryOrder(newOrder);
        
        // 重新渲染分类标签
        renderCategoryTabs(newOrder);
        
        // 重新渲染卡片
        renderAICards();
    }
}

// 保存分类顺序到localStorage
function saveCategoryOrder(categoryOrder) {
    try {
        localStorage.setItem('categoryOrder', JSON.stringify(categoryOrder));
    } catch (error) {
        console.warn('无法保存分类顺序到localStorage:', error);
    }
}

// 从localStorage加载分类顺序
function loadCategoryOrder() {
    try {
        const savedOrder = localStorage.getItem('categoryOrder');
        if (savedOrder) {
            return JSON.parse(savedOrder);
        }
    } catch (error) {
        console.warn('无法从localStorage加载分类顺序:', error);
    }
    return null;
}

// 根据保存的顺序渲染分类标签
function renderCategoryTabs(customOrder = null) {
    const categoryTabs = document.getElementById('category-tabs');
    if (!categoryTabs) return;
    
    // 获取当前激活的分类
    const activeCategory = currentCategory;
    
    // 获取所有可用的分类
    const availableCategories = getAvailableCategories();
    
    // 使用自定义顺序或默认顺序
    let categoryOrder = customOrder;
    if (!categoryOrder) {
        categoryOrder = loadCategoryOrder();
    }
    
    // 如果没有保存的顺序，使用默认顺序
    if (!categoryOrder) {
        categoryOrder = ['all', 'text', 'image', 'voice', 'office'];
        // 添加自定义分类到顺序中
        availableCategories.forEach(category => {
            if (!categoryOrder.includes(category) && category !== 'all') {
                categoryOrder.push(category);
            }
        });
        // 保存更新后的分类顺序
        saveCategoryOrder(categoryOrder);
    } else {
        // 如果有保存的顺序，检查是否需要添加新分类
        const newCategories = availableCategories.filter(cat => 
            !categoryOrder.includes(cat) && cat !== 'all'
        );
        if (newCategories.length > 0) {
            categoryOrder = categoryOrder.concat(newCategories);
            saveCategoryOrder(categoryOrder);
        }
    }
    
    // 检查是否需要重新创建按钮（只在分类数量变化时）
    const existingButtons = categoryTabs.querySelectorAll('.tab-btn');
    const existingCategories = Array.from(existingButtons).map(btn => btn.dataset.category);
    const newCategories = categoryOrder.filter(cat => 
        cat === 'all' || availableCategories.includes(cat)
    );
    
    // 如果分类数量或内容发生变化，重新创建按钮
    if (existingCategories.length !== newCategories.length || 
        !existingCategories.every((cat, index) => cat === newCategories[index])) {
        
        // 清空分类标签容器
        categoryTabs.innerHTML = '';
        
        // 按照顺序创建分类按钮
        categoryOrder.forEach(category => {
            if (category === 'all' || availableCategories.includes(category)) {
                const button = document.createElement('button');
                button.className = 'tab-btn';
                button.dataset.category = category;
                button.textContent = getCategoryName(category);
                
                // 设置激活状态
                if (category === activeCategory) {
                    button.classList.add('active');
                }
                
                categoryTabs.appendChild(button);
            }
        });
        
        // 重新设置事件监听器
        setupCategoryEventListeners();
        
        // 设置拖拽事件
        setupCategoryDragEvents();
    } else {
        // 只是更新按钮顺序，不重新创建
        const buttons = {};
        existingButtons.forEach(btn => {
            buttons[btn.dataset.category] = btn;
        });
        
        // 清空容器
        categoryTabs.innerHTML = '';
        
        // 按照新顺序重新添加按钮
        categoryOrder.forEach(category => {
            if (buttons[category]) {
                categoryTabs.appendChild(buttons[category]);
            }
        });
        
        // 更新激活状态
        existingButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === activeCategory);
        });
    }
}

// 卡片拖拽排序功能
function setupDragEvents(card, cardId) {
    let dragStartIndex;
    
    // 拖拽开始
    card.addEventListener('dragstart', function(e) {
        if (!isManageMode) {
            e.preventDefault();
            return;
        }
        dragStartIndex = aiSoftwareData.findIndex(ai => ai.id === cardId);
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', cardId.toString());
    });
    
    // 拖拽结束
    card.addEventListener('dragend', function() {
        card.classList.remove('dragging');
        document.querySelectorAll('.ai-card').forEach(c => {
            c.classList.remove('drag-over');
        });
    });
    
    // 拖拽经过
    card.addEventListener('dragover', function(e) {
        if (!isManageMode) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        // 只对不是当前拖拽的卡片添加drag-over效果
        if (parseInt(e.dataTransfer.getData('text/plain')) !== cardId) {
            card.classList.add('drag-over');
        }
    });
    
    // 拖拽离开
    card.addEventListener('dragleave', function() {
        card.classList.remove('drag-over');
    });
    
    // 放置
    card.addEventListener('drop', function(e) {
        if (!isManageMode) return;
        e.preventDefault();
        card.classList.remove('drag-over');
        
        const draggedCardId = parseInt(e.dataTransfer.getData('text/plain'));
        const dragEndIndex = aiSoftwareData.findIndex(ai => ai.id === cardId);
        const dragStartIndex = aiSoftwareData.findIndex(ai => ai.id === draggedCardId);
        
        // 确保不是拖拽到自身，且索引有效
        if (dragStartIndex !== -1 && dragEndIndex !== -1 && dragStartIndex !== dragEndIndex) {
            // 从原位置移除拖拽的卡片
            const [draggedItem] = aiSoftwareData.splice(dragStartIndex, 1);
            
            // 计算新的插入位置（考虑拖拽方向）
            let insertIndex = dragEndIndex;
            if (dragStartIndex < dragEndIndex) {
                // 向下拖拽时，插入到目标位置之后
                insertIndex = dragEndIndex + 1;
            } else {
                // 向上拖拽时，插入到目标位置之前
                insertIndex = dragEndIndex;
            }
            
            // 插入到新位置
            aiSoftwareData.splice(insertIndex, 0, draggedItem);
            
            // 保存卡片顺序到localStorage
            saveCardOrder();
            
            // 保存到本地存储
            saveAICardsToStorage();
            
            // 重新渲染卡片
            renderAICards();
        }
    });
}

// 保存卡片顺序到localStorage
function saveCardOrder() {
    try {
        // 只保存卡片的ID顺序
        const cardOrder = aiSoftwareData.map(ai => ai.id);
        localStorage.setItem('cardOrder', JSON.stringify(cardOrder));
    } catch (error) {
        console.warn('无法保存卡片顺序到localStorage:', error);
    }
}

// 从localStorage加载卡片顺序
function loadCardOrder() {
    try {
        const savedOrder = localStorage.getItem('cardOrder');
        if (savedOrder) {
            return JSON.parse(savedOrder);
        }
    } catch (error) {
        console.warn('无法从localStorage加载卡片顺序:', error);
    }
    return null;
}

// 根据保存的顺序重新排列卡片数据
function reorderCardsBySavedOrder() {
    const savedOrder = loadCardOrder();
    if (!savedOrder || savedOrder.length !== aiSoftwareData.length) {
        return false;
    }
    
    // 创建ID到卡片对象的映射
    const cardMap = new Map();
    aiSoftwareData.forEach(card => {
        cardMap.set(card.id, card);
    });
    
    // 按照保存的顺序重新排列
    const reorderedData = [];
    savedOrder.forEach(id => {
        const card = cardMap.get(id);
        if (card) {
            reorderedData.push(card);
        }
    });
    
    // 更新数据
    if (reorderedData.length === aiSoftwareData.length) {
        aiSoftwareData.length = 0;
        aiSoftwareData.push(...reorderedData);
        
        // 保存到本地存储
        saveAICardsToStorage();
        
        return true;
    }
    
    return false;
}

// 标题编辑功能
function enterTitleEditMode() {
    if (!appTitle || appTitle.classList.contains('editing')) return;
    
    const currentTitle = appTitle.textContent;
    
    // 创建输入框
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentTitle;
    input.style.cssText = `
        font-size: 2.2rem;
        font-weight: bold;
        background: transparent;
        border: none;
        color: white;
        text-align: center;
        width: 100%;
        outline: none;
        font-family: inherit;
    `;
    
    // 替换标题为输入框
    appTitle.innerHTML = '';
    appTitle.appendChild(input);
    appTitle.classList.add('editing');
    
    // 聚焦并选中所有文本
    input.focus();
    input.select();
    
    // 保存事件
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            saveTitleEdit(input.value.trim());
        } else if (e.key === 'Escape') {
            exitTitleEditMode();
        }
    });
    
    // 失去焦点事件
    input.addEventListener('blur', function() {
        saveTitleEdit(input.value.trim());
    });
}

function saveTitleEdit(newTitle) {
    if (!appTitle) return;
    
    if (newTitle && newTitle !== appTitle.textContent) {
        appTitle.textContent = newTitle;
        // 更新页面标题
        document.title = newTitle;
        alert('应用名称已更新！');
    }
    
    exitTitleEditMode();
}

function exitTitleEditMode() {
    if (!appTitle) return;
    
    appTitle.classList.remove('editing');
    
    // 如果正在编辑，恢复原始标题显示
    if (appTitle.querySelector('input')) {
        const input = appTitle.querySelector('input');
        const currentText = input.value.trim() || '打工牛马软件集成';
        appTitle.textContent = currentText;
    }
}

// 批量删除功能
function handleBatchDelete() {
    // 获取所有选中的卡片
    const selectedCheckboxes = document.querySelectorAll('.card-checkbox:checked');
    
    if (selectedCheckboxes.length === 0) {
        alert('请先选择要删除的卡片！');
        return;
    }
    
    const selectedCount = selectedCheckboxes.length;
    if (!confirm(`确定要删除选中的 ${selectedCount} 个软件卡片吗？此操作不可撤销。`)) {
        return;
    }
    
    // 获取选中的卡片ID
    const selectedIds = Array.from(selectedCheckboxes).map(checkbox => 
        parseInt(checkbox.dataset.id)
    );
    
    // 从数据中删除选中的卡片
    const newAIData = aiSoftwareData.filter(ai => !selectedIds.includes(ai.id));
    
    // 更新数据
    aiSoftwareData.length = 0;
    aiSoftwareData.push(...newAIData);
    
    // 保存到本地存储
    saveAICardsToStorage();
    
    // 重新渲染卡片和分类标签
    renderAICards();
    updateCategoryTabs();
    updateCategoryDropdown(); // 更新分类下拉菜单
    
    // 显示成功消息
    alert(`成功删除 ${selectedCount} 个软件卡片！`);
}

// 全选功能
function handleSelectAll() {
    const checkboxes = document.querySelectorAll('.card-checkbox');
    const selectAllBtn = document.getElementById('select-all-btn');
    
    if (checkboxes.length === 0) {
        alert('当前没有可选的卡片');
        return;
    }
    
    // 检查是否已经全选
    const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
    
    if (allChecked) {
        // 如果已经全选，则取消全选
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        selectAllBtn.textContent = '全选';
    } else {
        // 如果未全选，则全选
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        selectAllBtn.textContent = '取消全选';
    }
}

// 布局功能
function setupLayoutFunctionality() {
    const layoutBtn = document.getElementById('layout-btn');
    const layoutModal = document.getElementById('layout-modal');
    const closeLayoutModal = document.getElementById('close-layout-modal');
    
    // 布局按钮点击事件
    if (layoutBtn) {
        layoutBtn.addEventListener('click', function() {
            if (layoutModal) {
                // 加载保存的设置
                loadLayoutSettings();
                layoutModal.style.display = 'flex';
            }
        });
    }
    
    // 关闭布局弹窗
    if (closeLayoutModal) {
        closeLayoutModal.addEventListener('click', function() {
            if (layoutModal) {
                layoutModal.style.display = 'none';
            }
        });
    }
    
    // 点击弹窗外部关闭
    if (layoutModal) {
        layoutModal.addEventListener('click', function(e) {
            if (e.target === layoutModal) {
                layoutModal.style.display = 'none';
            }
        });
    }
    
    // 设置快捷布局按钮事件
    setupQuickLayoutButtons();
    
    // 设置布局输入框事件
    setupLayoutInputs();
    
    // 设置布局按钮事件
    setupLayoutButtons();
}

// 设置快捷布局按钮事件
function setupQuickLayoutButtons() {
    const quickLayoutButtons = document.querySelectorAll('.layout-btn-quick');
    const customLayout = document.getElementById('custom-layout');
    
    quickLayoutButtons.forEach(button => {
        button.addEventListener('click', function() {
            const layout = this.dataset.layout;
            
            // 移除所有按钮的active类
            quickLayoutButtons.forEach(btn => btn.classList.remove('active'));
            
            // 添加active类到当前按钮
            this.classList.add('active');
            
            if (layout === 'custom') {
                // 显示自定义设置
                customLayout.style.display = 'block';
            } else {
                // 隐藏自定义设置
                customLayout.style.display = 'none';
                
                // 应用快捷布局
                applyQuickLayout(layout);
            }
        });
    });
}

// 应用快捷布局
function applyQuickLayout(layout) {
    let rows, columns;
    
    switch (layout) {
        case '2x4':
            rows = 2; columns = 4;
            break;
        case '2x5':
            rows = 2; columns = 5;
            break;
        case '2x6':
            rows = 2; columns = 6;
            break;
        case '2x7':
            rows = 2; columns = 7;
            break;
        case '3x3':
            rows = 3; columns = 3;
            break;
        default:
            rows = 3; columns = 10;
    }
    
    const settings = {
        rows: rows,
        columns: columns,
        iconSize: 100,
        layoutType: layout
    };
    
    // 保存设置到本地存储
    localStorage.setItem('layoutSettings', JSON.stringify(settings));
    
    // 应用设置到界面
    applyLayoutSettingsToUI(settings);
    
    alert(`已应用 ${layout} 布局！`);
}

// 设置布局输入框事件
function setupLayoutInputs() {
    const rowsInput = document.getElementById('rows-input');
    const columnsInput = document.getElementById('columns-input');
    const iconSizeInput = document.getElementById('icon-size-slider');
    const rowsValue = document.getElementById('rows-value');
    const columnsValue = document.getElementById('columns-value');
    const iconSizeValue = document.getElementById('icon-size-value');
    
    // 行数输入变化
    if (rowsInput) {
        rowsInput.addEventListener('input', function() {
            rowsValue.textContent = this.value;
        });
    }
    
    // 列数输入变化
    if (columnsInput) {
        columnsInput.addEventListener('input', function() {
            columnsValue.textContent = this.value;
        });
    }
    
    // 图标大小滑块变化
    if (iconSizeInput) {
        iconSizeInput.addEventListener('input', function() {
            iconSizeValue.textContent = this.value + '%';
        });
    }
}

// 设置布局按钮事件
function setupLayoutButtons() {
    const applyLayoutBtn = document.getElementById('apply-layout');
    const resetLayoutBtn = document.getElementById('reset-layout');
    
    // 应用设置按钮
    if (applyLayoutBtn) {
        applyLayoutBtn.addEventListener('click', function() {
            applyCustomLayout();
            const layoutModal = document.getElementById('layout-modal');
            if (layoutModal) {
                layoutModal.style.display = 'none';
            }
        });
    }
    
    // 重置设置按钮
    if (resetLayoutBtn) {
        resetLayoutBtn.addEventListener('click', function() {
            resetLayoutSettings();
        });
    }
}

// 应用自定义布局
function applyCustomLayout() {
    const rowsInput = document.getElementById('rows-input');
    const columnsInput = document.getElementById('columns-input');
    const iconSizeInput = document.getElementById('icon-size-slider');
    
    if (!rowsInput || !columnsInput || !iconSizeInput) return;
    
    const settings = {
        rows: parseInt(rowsInput.value) || 3,
        columns: parseInt(columnsInput.value) || 10,
        iconSize: parseInt(iconSizeInput.value) || 100,
        layoutType: 'custom'
    };
    
    // 保存设置到本地存储
    localStorage.setItem('layoutSettings', JSON.stringify(settings));
    
    // 应用设置到界面
    applyLayoutSettingsToUI(settings);
    
    alert('自定义布局已应用！');
}

// 加载布局设置
function loadLayoutSettings() {
    const savedSettings = JSON.parse(localStorage.getItem('layoutSettings') || '{}');
    
    const rowsInput = document.getElementById('rows-input');
    const columnsInput = document.getElementById('columns-input');
    const iconSizeInput = document.getElementById('icon-size-slider');
    const rowsValue = document.getElementById('rows-value');
    const columnsValue = document.getElementById('columns-value');
    const iconSizeValue = document.getElementById('icon-size-value');
    const quickLayoutButtons = document.querySelectorAll('.layout-btn-quick');
    const customLayout = document.getElementById('custom-layout');
    
    // 设置快捷布局按钮状态
    if (savedSettings.layoutType && savedSettings.layoutType !== 'custom') {
        quickLayoutButtons.forEach(btn => {
            if (btn.dataset.layout === savedSettings.layoutType) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        customLayout.style.display = 'none';
    } else {
        // 自定义布局
        const customBtn = document.querySelector('.layout-btn-quick[data-layout="custom"]');
        if (customBtn) {
            customBtn.classList.add('active');
        }
        customLayout.style.display = 'block';
    }
    
    // 设置输入框值
    if (rowsInput && savedSettings.rows) {
        rowsInput.value = savedSettings.rows;
        rowsValue.textContent = savedSettings.rows;
    }
    
    if (columnsInput && savedSettings.columns) {
        columnsInput.value = savedSettings.columns;
        columnsValue.textContent = savedSettings.columns;
    }
    
    if (iconSizeInput && savedSettings.iconSize) {
        iconSizeInput.value = savedSettings.iconSize;
        iconSizeValue.textContent = savedSettings.iconSize + '%';
    }
}

// 重置布局设置
function resetLayoutSettings() {
    const rowsInput = document.getElementById('rows-input');
    const columnsInput = document.getElementById('columns-input');
    const iconSizeInput = document.getElementById('icon-size-slider');
    const rowsValue = document.getElementById('rows-value');
    const columnsValue = document.getElementById('columns-value');
    const iconSizeValue = document.getElementById('icon-size-value');
    const quickLayoutButtons = document.querySelectorAll('.layout-btn-quick');
    const customLayout = document.getElementById('custom-layout');
    
    // 重置输入框
    if (rowsInput) {
        rowsInput.value = 3;
        rowsValue.textContent = '3';
    }
    
    if (columnsInput) {
        columnsInput.value = 10;
        columnsValue.textContent = '10';
    }
    
    if (iconSizeInput) {
        iconSizeInput.value = 100;
        iconSizeValue.textContent = '100%';
    }
    
    // 重置按钮状态
    quickLayoutButtons.forEach(btn => btn.classList.remove('active'));
    customLayout.style.display = 'none';
    
    // 清除本地存储的设置
    localStorage.removeItem('layoutSettings');
    
    // 应用默认设置到界面
    applyLayoutSettingsToUI({
        rows: 3,
        columns: 10,
        iconSize: 100,
        layoutType: '3x10'
    });
    
    alert('已重置为默认布局！');
}

// 应用布局设置到界面
function applyLayoutSettingsToUI(settings) {
    const cardsContainer = document.getElementById('ai-cards');
    
    if (cardsContainer) {
        // 设置网格列数
        cardsContainer.style.gridTemplateColumns = `repeat(${settings.columns}, 1fr)`;
        
        // 计算固定卡片尺寸以确保稳定性
        const containerWidth = cardsContainer.clientWidth;
        const gap = 4; // 卡片间距
        const availableWidth = containerWidth - (gap * (settings.columns - 1));
        const cardWidth = Math.floor(availableWidth / settings.columns);
        
        // 设置固定卡片尺寸（确保内容大小稳定）
                const cards = cardsContainer.querySelectorAll('.ai-card');
                cards.forEach(card => {
                    // 使用固定尺寸而不是自动调整
                    card.style.width = cardWidth + 'px';
                    card.style.height = '50px'; // 固定高度
                    card.style.minHeight = '50px'; // 最小高度
                    card.style.maxHeight = '50px'; // 最大高度
                    card.style.overflow = 'hidden'; // 防止内容溢出
                });
                
                // 设置容器高度（根据行数和卡片高度）
                const cardHeight = 50; // 卡片基础高度
                const containerHeight = (settings.rows * cardHeight) + ((settings.rows - 1) * gap);
                cardsContainer.style.minHeight = containerHeight + 'px';
        
        // 设置卡片图标大小
        const scale = settings.iconSize / 100;
        cards.forEach(card => {
            const icon = card.querySelector('.ai-icon');
            if (icon) {
                icon.style.transform = `scale(${scale})`;
                icon.style.transformOrigin = 'center';
            }
        });
        
        // 确保卡片均匀分布
        cardsContainer.style.justifyItems = 'center';
        cardsContainer.style.alignItems = 'center';
    }
}

// 壁纸功能
function setupWallpaperFunctionality() {
    const wallpaperBtn = document.getElementById('wallpaper-btn');
    const wallpaperModal = document.getElementById('wallpaper-modal');
    const closeWallpaperModal = document.getElementById('close-wallpaper-modal');
    const wallpaperOptions = document.querySelectorAll('.wallpaper-option h4');
    const colorOptions = document.querySelectorAll('.color-option');
    
    // 壁纸按钮点击事件
    if (wallpaperBtn) {
        wallpaperBtn.addEventListener('click', function() {
            if (wallpaperModal) {
                wallpaperModal.style.display = 'flex';
                // 每次打开弹窗时加载已保存的壁纸
                loadSavedWallpapers();
            }
        });
    }
    
    // 关闭壁纸弹窗
    if (closeWallpaperModal) {
        closeWallpaperModal.addEventListener('click', function() {
            if (wallpaperModal) {
                wallpaperModal.style.display = 'none';
            }
        });
    }
    
    // 点击弹窗外部关闭
    if (wallpaperModal) {
        wallpaperModal.addEventListener('click', function(e) {
            if (e.target === wallpaperModal) {
                wallpaperModal.style.display = 'none';
            }
        });
    }
    
    // 壁纸选项点击事件
    wallpaperOptions.forEach(option => {
        option.addEventListener('click', function() {
            const type = this.parentElement.dataset.type;
            const content = this.parentElement.querySelector(`.${type}-wallpapers`);
            
            // 切换显示/隐藏
            if (content) {
                const isVisible = content.style.display !== 'none';
                content.style.display = isVisible ? 'none' : 'block';
            }
        });
    });
    
    // 纯色壁纸选择事件
    colorOptions.forEach(color => {
        color.addEventListener('click', function() {
            const colorValue = this.dataset.color;
            
            // 移除其他颜色的激活状态
            colorOptions.forEach(c => c.classList.remove('active'));
            
            // 设置当前颜色为激活状态
            this.classList.add('active');
            
            // 应用背景色
            document.body.style.background = colorValue;
            
            // 保存到本地存储
            localStorage.setItem('wallpaper', JSON.stringify({
                type: 'solid',
                value: colorValue
            }));
        });
    });
    
    // 添加壁纸按钮事件
    const addWallpaperBtn = document.querySelector('.add-wallpaper-btn');
    if (addWallpaperBtn) {
        addWallpaperBtn.addEventListener('click', function() {
            // 创建文件输入元素
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.multiple = true; // 允许选择多个文件
            
            // 设置webkitdirectory属性以支持文件夹选择
            fileInput.setAttribute('webkitdirectory', '');
            fileInput.setAttribute('directory', '');
            
            fileInput.addEventListener('change', function(e) {
                const files = e.target.files;
                if (files.length > 0) {
                    Array.from(files).forEach(file => {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            // 保存壁纸到本地存储
                            saveWallpaperToStorage(file.name, e.target.result);
                            // 创建壁纸预览
                            createWallpaperPreview(file.name, e.target.result);
                        };
                        reader.readAsDataURL(file);
                    });
                }
            });
            
            fileInput.click();
        });
    }
    
    // 加载保存的壁纸设置
    loadWallpaperSettings();
    // 初始加载已保存的壁纸
    loadSavedWallpapers();
}

// 加载壁纸设置
function loadWallpaperSettings() {
    const savedWallpaper = localStorage.getItem('wallpaper');
    if (savedWallpaper) {
        try {
            const wallpaper = JSON.parse(savedWallpaper);
            
            if (wallpaper.type === 'solid') {
                document.body.style.background = wallpaper.value;
                
                // 激活对应的颜色选项
                const colorOption = document.querySelector(`.color-option[data-color="${wallpaper.value}"]`);
                if (colorOption) {
                    colorOption.classList.add('active');
                }
            } else if (wallpaper.type === 'image') {
                document.body.style.backgroundImage = `url(${wallpaper.value})`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
            }
        } catch (e) {
            console.error('加载壁纸设置失败:', e);
        }
    }
}

// 保存壁纸到本地存储
function saveWallpaperToStorage(filename, dataUrl) {
    try {
        // 获取已保存的壁纸列表
        let savedWallpapers = JSON.parse(localStorage.getItem('savedWallpapers') || '[]');
        
        // 检查是否已存在同名壁纸
        const existingIndex = savedWallpapers.findIndex(w => w.name === filename);
        
        if (existingIndex !== -1) {
            // 更新现有壁纸
            savedWallpapers[existingIndex] = {
                name: filename,
                data: dataUrl,
                timestamp: Date.now()
            };
        } else {
            // 添加新壁纸
            savedWallpapers.push({
                name: filename,
                data: dataUrl,
                timestamp: Date.now()
            });
        }
        
        // 保存到本地存储
        localStorage.setItem('savedWallpapers', JSON.stringify(savedWallpapers));
        
        console.log(`壁纸 "${filename}" 已保存到本地存储`);
    } catch (e) {
        console.error('保存壁纸失败:', e);
    }
}

// 创建壁纸预览
function createWallpaperPreview(filename, dataUrl) {
    const wallpaperGrid = document.querySelector('.wallpaper-grid');
    
    // 检查是否已存在同名壁纸预览
    const existingPreview = document.querySelector(`[data-filename="${filename}"]`);
    if (existingPreview) {
        existingPreview.remove();
    }
    
    const wallpaperItem = document.createElement('div');
    wallpaperItem.className = 'wallpaper-item';
    wallpaperItem.dataset.filename = filename;
    wallpaperItem.style.backgroundImage = `url(${dataUrl})`;
    wallpaperItem.style.backgroundSize = 'cover';
    wallpaperItem.style.backgroundPosition = 'center';
    wallpaperItem.style.width = '80px';
    wallpaperItem.style.height = '80px';
    wallpaperItem.style.borderRadius = '4px';
    wallpaperItem.style.cursor = 'pointer';
    wallpaperItem.style.border = '2px solid transparent';
    wallpaperItem.style.transition = 'all 0.3s ease';
    wallpaperItem.style.position = 'relative';
    
    // 添加删除按钮
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '×';
    deleteBtn.style.position = 'absolute';
    deleteBtn.style.top = '-5px';
    deleteBtn.style.right = '-5px';
    deleteBtn.style.background = '#ff4444';
    deleteBtn.style.color = 'white';
    deleteBtn.style.border = 'none';
    deleteBtn.style.borderRadius = '50%';
    deleteBtn.style.width = '20px';
    deleteBtn.style.height = '20px';
    deleteBtn.style.fontSize = '12px';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.style.display = 'none';
    deleteBtn.style.zIndex = '10';
    
    deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        deleteWallpaper(filename);
        wallpaperItem.remove();
    });
    
    wallpaperItem.appendChild(deleteBtn);
    
    wallpaperItem.addEventListener('click', function() {
        // 应用壁纸
        document.body.style.backgroundImage = `url(${dataUrl})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        
        // 保存到本地存储
        localStorage.setItem('wallpaper', JSON.stringify({
            type: 'image',
            value: dataUrl,
            filename: filename
        }));
    });
    
    wallpaperItem.addEventListener('mouseenter', function() {
        this.style.borderColor = '#007bff';
        this.style.transform = 'scale(1.05)';
        deleteBtn.style.display = 'block';
    });
    
    wallpaperItem.addEventListener('mouseleave', function() {
        this.style.borderColor = 'transparent';
        this.style.transform = 'scale(1)';
        deleteBtn.style.display = 'none';
    });
    
    wallpaperGrid.appendChild(wallpaperItem);
}

// 加载已保存的壁纸
function loadSavedWallpapers() {
    try {
        const savedWallpapers = JSON.parse(localStorage.getItem('savedWallpapers') || '[]');
        const wallpaperGrid = document.querySelector('.wallpaper-grid');
        
        // 清空现有预览（除了添加按钮）
        const existingItems = wallpaperGrid.querySelectorAll('.wallpaper-item');
        existingItems.forEach(item => item.remove());
        
        // 按时间戳排序（最新的在前）
        savedWallpapers.sort((a, b) => b.timestamp - a.timestamp);
        
        // 创建壁纸预览
        savedWallpapers.forEach(wallpaper => {
            createWallpaperPreview(wallpaper.name, wallpaper.data);
        });
        
        console.log(`已加载 ${savedWallpapers.length} 个壁纸`);
    } catch (e) {
        console.error('加载已保存壁纸失败:', e);
    }
}

// 删除壁纸
function deleteWallpaper(filename) {
    try {
        let savedWallpapers = JSON.parse(localStorage.getItem('savedWallpapers') || '[]');
        
        // 过滤掉要删除的壁纸
        savedWallpapers = savedWallpapers.filter(w => w.name !== filename);
        
        // 保存更新后的列表
        localStorage.setItem('savedWallpapers', JSON.stringify(savedWallpapers));
        
        // 如果当前使用的是被删除的壁纸，则恢复默认背景
        const currentWallpaper = JSON.parse(localStorage.getItem('wallpaper') || '{}');
        if (currentWallpaper.filename === filename) {
            document.body.style.backgroundImage = 'none';
            document.body.style.background = '#f0f0f0';
            localStorage.removeItem('wallpaper');
        }
        
        console.log(`壁纸 "${filename}" 已删除`);
    } catch (e) {
        console.error('删除壁纸失败:', e);
    }
}

// 保存AI卡片数据到本地存储
function saveAICardsToStorage() {
    try {
        localStorage.setItem('aiSoftwareData', JSON.stringify(aiSoftwareData));
        console.log('AI卡片数据已保存到本地存储');
    } catch (error) {
        console.warn('无法保存AI卡片数据到localStorage:', error);
    }
}

// 从本地存储加载AI卡片数据
function loadAICardsFromStorage() {
    try {
        const savedData = localStorage.getItem('aiSoftwareData');
        if (savedData) {
            return JSON.parse(savedData);
        }
    } catch (error) {
        console.warn('无法从localStorage加载AI卡片数据:', error);
    }
    return null;
}