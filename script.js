// ============ script.js 共享版 ============

// 全局变量
let currentCategory = 'all';
let searchTerm = '';
let isManageMode = false;
let selectedCards = new Set();

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
const searchBtn = document.getElementById('search-btn');
const addCardBtn = document.getElementById('add-card-btn');
const manageModeBtn = document.getElementById('manage-mode-btn');
const toggleCardsBtn = document.getElementById('toggle-cards-btn');
const managePanel = document.getElementById('manage-panel');
const importBtn = document.getElementById('import-btn');
const exportBtn = document.getElementById('export-btn');
const addCardForm = document.getElementById('add-card-form');
const newCardForm = document.getElementById('new-card-form');
const cancelBtn = document.getElementById('cancel-btn');
const cardCategory = document.getElementById('card-category');
const customCategoryGroup = document.getElementById('custom-category-group');
const customCategoryInput = document.getElementById('custom-category');
const batchDeleteBtn = document.getElementById('batch-delete-btn');
const selectAllBtn = document.getElementById('select-all-btn');

// 显示/隐藏卡片状态
let cardsVisible = true;

// ============ 初始化 ============

document.addEventListener('DOMContentLoaded', function() {
    // 从GitHub加载数据
    if (typeof loadAllData === 'function') {
        loadAllData();
    }
    
    // 渲染分类标签
    renderCategoryTabs();
    
    // 设置事件监听器
    setupEventListeners();
    
    // 设置壁纸功能
    setupWallpaperFunctionality();
    
    // 设置布局功能
    setupLayoutFunctionality();
    
    // 加载布局设置
    loadLayoutSettings();
});

// ============ 事件监听器 ============

function setupEventListeners() {
    // 搜索输入
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchTerm = this.value.trim();
            filterCards();
        });
    }
    
    // 搜索按钮
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    // 添加卡片按钮
    if (addCardBtn) {
        addCardBtn.addEventListener('click', function() {
            addCardForm.style.display = 'block';
            addCardBtn.style.display = 'none';
        });
    }
    
    // 取消按钮
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            addCardForm.style.display = 'none';
            addCardBtn.style.display = 'block';
            newCardForm.reset();
            customCategoryGroup.style.display = 'none';
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
        manageModeBtn.addEventListener('click', toggleManageMode);
    }
    
    // 显示/隐藏卡片
    if (toggleCardsBtn) {
        toggleCardsBtn.addEventListener('click', toggleCardsVisibility);
    }
    
    // 导入
    if (importBtn) {
        importBtn.addEventListener('click', handleImport);
    }
    
    // 导出
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExport);
    }
    
    // 批量删除
    if (batchDeleteBtn) {
        batchDeleteBtn.addEventListener('click', handleBatchDelete);
    }
    
    // 全选
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', handleSelectAll);
    }
    
    // 壁纸按钮
    const wallpaperBtn = document.getElementById('wallpaper-btn');
    if (wallpaperBtn) {
        wallpaperBtn.addEventListener('click', function() {
            document.getElementById('wallpaper-modal').style.display = 'flex';
            loadCurrentWallpaperPreview();
        });
    }
    
    // 布局按钮
    const layoutBtn = document.getElementById('layout-btn');
    if (layoutBtn) {
        layoutBtn.addEventListener('click', function() {
            document.getElementById('layout-modal').style.display = 'flex';
            loadLayoutSettings();
        });
    }
    
    // 同步按钮
    const syncBtn = document.getElementById('sync-btn');
    if (syncBtn) {
        syncBtn.addEventListener('click', forceRefresh);
    }
    
    // 关闭弹窗按钮
    setupModalCloseButtons();
}

// 设置弹窗关闭按钮
function setupModalCloseButtons() {
    // 关闭壁纸弹窗
    const closeWallpaper = document.getElementById('close-wallpaper-modal');
    if (closeWallpaper) {
        closeWallpaper.addEventListener('click', function() {
            document.getElementById('wallpaper-modal').style.display = 'none';
        });
    }
    
    // 关闭布局弹窗
    const closeLayout = document.getElementById('close-layout-modal');
    if (closeLayout) {
        closeLayout.addEventListener('click', function() {
            document.getElementById('layout-modal').style.display = 'none';
        });
    }
    
    // 点击外部关闭
    window.addEventListener('click', function(e) {
        const wallpaperModal = document.getElementById('wallpaper-modal');
        const layoutModal = document.getElementById('layout-modal');
        
        if (e.target === wallpaperModal) {
            wallpaperModal.style.display = 'none';
        }
        if (e.target === layoutModal) {
            layoutModal.style.display = 'none';
        }
    });
}

// ============ 卡片渲染 ============

// 渲染卡片
function renderCards(cards) {
    if (!aiCardsContainer) return;
    
    if (!cards || cards.length === 0) {
        aiCardsContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #666; grid-column: 1/-1;">暂无卡片，点击右下角 + 添加</div>';
        return;
    }
    
    // 根据当前分类和搜索词过滤
    let filteredCards = cards;
    
    if (currentCategory !== 'all') {
        filteredCards = filteredCards.filter(card => card.category === currentCategory);
    }
    
    if (searchTerm) {
        filteredCards = filteredCards.filter(card => 
            card.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    if (filteredCards.length === 0) {
        aiCardsContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #666; grid-column: 1/-1;">没有匹配的卡片</div>';
        return;
    }
    
    // 获取布局设置
    const layoutSettings = JSON.parse(localStorage.getItem('layoutSettings') || '{}');
    const columns = layoutSettings.columns || 10;
    
    // 设置网格列数
    aiCardsContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    
    // 生成卡片HTML
    let html = '';
    filteredCards.forEach(card => {
        const category = card.category || '其他';
        
        // 管理模式下的复选框和按钮
        const checkboxHtml = `<input type="checkbox" class="card-checkbox" data-id="${card.id}" onchange="handleCardCheck(this)" style="margin: 0;">`;
        const deleteBtnHtml = `<button class="delete-btn" onclick="deleteCard('${card.id}')" style="background: none; border: none; color: #ff4444; cursor: pointer; font-size: 16px; padding: 0;">×</button>`;
        const editBtnHtml = `<button class="edit-btn" onclick="editCard('${card.id}')" style="background: none; border: none; color: #4CAF50; cursor: pointer; font-size: 16px; padding: 0;">✏️</button>`;
        
        html += `
            <div class="ai-card" data-id="${card.id}" data-category="${category}" data-website="${card.website}" onclick="handleCardClick('${card.website}')" style="background: rgba(255, 255, 255, 0.5); backdrop-filter: blur(5px); cursor: pointer; height: 60px; display: flex; flex-direction: column; border-radius: 8px; overflow: hidden;">
                ${isManageMode ? `
                <div style="display: flex; justify-content: flex-end; gap: 8px; padding: 4px 8px; background: rgba(0,0,0,0.03); border-bottom: 1px solid rgba(0,0,0,0.1);">
                    ${checkboxHtml}
                    ${editBtnHtml}
                    ${deleteBtnHtml}
                </div>
                ` : ''}
                <div style="flex-grow: 1; display: flex; align-items: center; justify-content: center; padding: 0 8px;">
                    <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${card.name}</span>
                </div>
            </div>
        `;
    });
    
    aiCardsContainer.innerHTML = html;
}
        // 编辑按钮
        const editBtnHtml = isManageMode ?
            `<button class="edit-btn" onclick="editCard('${card.id}')" style="background: none; border: none; color: #4CAF50; cursor: pointer; font-size: 16px; padding: 0 4px;">✏️</button>` : '';
        
html += `
    <div class="ai-card" data-id="${card.id}" data-category="${category}" data-website="${card.website}" onclick="handleCardClick('${card.website}')" style="background: rgba(255, 255, 255, 0.5); backdrop-filter: blur(5px); cursor: pointer; height: 60px; display: flex; flex-direction: column; border-radius: 8px; overflow: hidden;">
        ${isManageMode ? `
        <div style="display: flex; justify-content: flex-end; gap: 8px; padding: 4px 8px; background: rgba(0,0,0,0.03); border-bottom: 1px solid rgba(0,0,0,0.1);">
            ${checkboxHtml}
            ${editBtnHtml}
            ${deleteBtnHtml}
        </div>
        ` : ''}
        <div style="flex-grow: 1; display: flex; align-items: center; justify-content: center; padding: 0 8px;">
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${card.name}</span>
        </div>
    </div>
`;
    });
    
    aiCardsContainer.innerHTML = html;
}

// 卡片点击处理 - 直接打开网址
function handleCardClick(website) {
    if (!isManageMode && website) {
        window.open(website, '_blank');
    }
}

// 编辑卡片
function editCard(cardId) {
    if (!isManageMode) return;
    
    // 找到卡片数据
    const card = window.cards.find(c => c.id == cardId);
    if (!card) return;
    
    // 填充表单
    document.getElementById('card-name').value = card.name;
    document.getElementById('card-website').value = card.website;
    
    // 处理分类
    const categorySelect = document.getElementById('card-category');
    const customGroup = document.getElementById('custom-category-group');
    const customInput = document.getElementById('custom-category');
    
    // 检查是否是预设分类
    const presetCategories = ['text', 'image', 'voice', 'office'];
    if (presetCategories.includes(card.category)) {
        categorySelect.value = card.category;
        customGroup.style.display = 'none';
        customInput.required = false;
    } else {
        categorySelect.value = 'custom';
        customGroup.style.display = 'block';
        customInput.value = card.category;
        customInput.required = true;
    }
    
    // 修改表单标题和按钮
    addCardForm.querySelector('h3').textContent = '编辑卡片';
    const submitBtn = addCardForm.querySelector('.submit-btn');
    submitBtn.textContent = '保存修改';
    
    // 移除原提交事件，添加编辑提交事件
    newCardForm.onsubmit = async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('card-name').value.trim();
        const website = document.getElementById('card-website').value.trim();
        const category = document.getElementById('card-category').value;
        const customCategory = document.getElementById('custom-category').value.trim();
        
        if (!name || !website || !category) {
            alert('请填写所有必填字段！');
            return;
        }
        
        let finalCategory = category;
        if (category === 'custom') {
            if (!customCategory) {
                alert('请填写自定义分类名称！');
                return;
            }
            finalCategory = customCategory;
        }
        
        // 更新卡片数据
        if (typeof updateCard === 'function') {
            const success = await updateCard(cardId, name, website, finalCategory);
            if (success) {
                // 重置表单
                newCardForm.reset();
                addCardForm.style.display = 'none';
                addCardBtn.style.display = 'block';
                customGroup.style.display = 'none';
                
                // 恢复表单
                addCardForm.querySelector('h3').textContent = '添加新软件卡片';
                submitBtn.textContent = '添加卡片';
                newCardForm.onsubmit = null; // 移除自定义事件
                
                // 重新加载数据
                await loadAllData();
                renderCategoryTabs();
            }
        }
    };
    
    addCardForm.style.display = 'block';
    addCardBtn.style.display = 'none';
}

// 卡片复选框处理
function handleCardCheck(checkbox) {
    const cardId = checkbox.dataset.id;
    if (checkbox.checked) {
        selectedCards.add(cardId);
    } else {
        selectedCards.delete(cardId);
    }
    
    // 更新全选按钮状态
    updateSelectAllButton();
}

// 更新全选按钮状态
function updateSelectAllButton() {
    if (!selectAllBtn) return;
    
    const checkboxes = document.querySelectorAll('.card-checkbox');
    const allChecked = checkboxes.length > 0 && 
        Array.from(checkboxes).every(cb => cb.checked);
    
    selectAllBtn.textContent = allChecked ? '取消全选' : '全选';
}

// 筛选卡片
function filterCards() {
    if (typeof window.cards !== 'undefined') {
        renderCards(window.cards);
    }
}

// ============ 卡片操作 ============

// 处理添加卡片
async function handleAddCard() {
    const name = document.getElementById('card-name').value.trim();
    const website = document.getElementById('card-website').value.trim();
    const category = document.getElementById('card-category').value;
    const customCategory = document.getElementById('custom-category').value.trim();
    
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
        finalCategory = customCategory;
    }
    
    // 保存到GitHub
    if (typeof saveCard === 'function') {
        const success = await saveCard(name, website, finalCategory);
        if (success) {
            // 重置表单
            newCardForm.reset();
            addCardForm.style.display = 'none';
            addCardBtn.style.display = 'block';
            customCategoryGroup.style.display = 'none';
            
            // 重新加载数据
            await loadAllData();
            
            // 更新分类标签
            renderCategoryTabs();
        }
    }
}

// 删除卡片
async function deleteCard(cardId) {
    if (!confirm('确定要删除这个卡片吗？')) return;
    
    if (typeof deleteCardById === 'function') {
        const success = await deleteCardById(cardId);
        if (success) {
            await loadAllData();
            renderCategoryTabs();
        }
    }
}

// ============ 分类标签 ============

// 获取分类名称
function getCategoryName(category) {
    const categoryNames = {
        'text': '文本处理',
        'image': '图像生成',
        'voice': '语音识别',
        'office': '办公软件',
        'all': '全部'
    };
    return categoryNames[category] || category;
}

// 渲染分类标签
function renderCategoryTabs() {
    const tabsContainer = document.getElementById('category-tabs');
    if (!tabsContainer) return;
    
    if (!window.cards || window.cards.length === 0) {
        tabsContainer.innerHTML = '<button class="tab-btn active" data-category="all">全部</button>';
        return;
    }
    
    // 获取所有分类
    const categories = new Set(['all']);
    window.cards.forEach(card => {
        if (card.category) categories.add(card.category);
    });
    
    // 生成标签HTML
    let html = '';
    categories.forEach(category => {
        const activeClass = category === currentCategory ? 'active' : '';
        html += `<button class="tab-btn ${activeClass}" data-category="${category}" onclick="switchCategory('${category}')">${getCategoryName(category)}</button>`;
    });
    
    tabsContainer.innerHTML = html;
    
    // 渲染分类标签后更新下拉菜单
    updateCategoryDropdown();
}

// 切换分类
function switchCategory(category) {
    currentCategory = category;
    
    // 更新按钮样式
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
    
    // 重新渲染卡片
    if (window.cards) {
        renderCards(window.cards);
    }
}

// 更新分类下拉菜单
function updateCategoryDropdown() {
    const categorySelect = document.getElementById('card-category');
    if (!categorySelect || !window.cards) return;
    
    // 保存当前选中的值
    const currentValue = categorySelect.value;
    
    // 清空现有选项
    categorySelect.innerHTML = '<option value="">请选择分类</option>';
    
    // 添加预设分类
    const presetCategories = [
        { value: 'text', text: '文本处理' },
        { value: 'image', text: '图像生成' },
        { value: 'voice', text: '语音识别' },
        { value: 'office', text: '办公软件' }
    ];
    
    presetCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.value;
        option.textContent = cat.text;
        categorySelect.appendChild(option);
    });
    
    // 获取所有已存在的分类
    const existingCategories = new Set();
    window.cards.forEach(card => {
        if (card.category && !presetCategories.some(p => p.value === card.category)) {
            existingCategories.add(card.category);
        }
    });
    
    // 添加已存在的自定义分类
    existingCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
    
    // 添加自定义分类选项
    const customOption = document.createElement('option');
    customOption.value = 'custom';
    customOption.textContent = '自定义分类';
    categorySelect.appendChild(customOption);
    
    // 恢复之前选中的值
    if (currentValue) {
        categorySelect.value = currentValue;
    }
}

// ============ 搜索 ============

// 执行搜索
function performSearch() {
    const searchText = searchInput.value.trim();
    
    if (searchText) {
        // 如果搜索词不为空，使用百度搜索引擎
        const searchUrl = searchEngines.baidu.url + encodeURIComponent(searchText);
        window.open(searchUrl, '_blank');
    }
}

// ============ 管理模式 ============

// 切换管理模式
function toggleManageMode() {
    isManageMode = !isManageMode;
    
    const managePanel = document.getElementById('manage-panel');
    
    if (isManageMode) {
        // 进入管理模式
        manageModeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
        manageModeBtn.style.background = 'rgba(255, 123, 0, 0.1)';
        manageModeBtn.style.color = '#ff7b00';
        managePanel.style.display = 'flex';
    } else {
        // 退出管理模式
        manageModeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
        manageModeBtn.style.background = 'rgba(255, 255, 255, 0.8)';
        manageModeBtn.style.color = '#666';
        managePanel.style.display = 'none';
    }
    
    // 重新渲染卡片以显示/隐藏管理按钮
    if (window.cards) {
        renderCards(window.cards);
    }
}

// 切换卡片可见性
function toggleCardsVisibility() {
    cardsVisible = !cardsVisible;
    
    const cardsContainer = document.getElementById('ai-cards');
    const categoryTabs = document.getElementById('category-tabs');
    
    if (cardsContainer) {
        cardsContainer.style.display = cardsVisible ? 'grid' : 'none';
    }
    
    if (categoryTabs) {
        categoryTabs.style.display = cardsVisible ? 'flex' : 'none';
    }
    
    if (cardsVisible) {
        toggleCardsBtn.style.background = 'rgba(255, 255, 255, 0.8)';
        toggleCardsBtn.style.color = '#666';
    } else {
        toggleCardsBtn.style.background = 'rgba(0, 123, 255, 0.2)';
        toggleCardsBtn.style.color = '#007bff';
    }
}

// ============ 全选/批量删除 ============

// 处理全选
function handleSelectAll() {
    const checkboxes = document.querySelectorAll('.card-checkbox');
    
    if (checkboxes.length === 0) return;
    
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
        if (cb.checked) {
            selectedCards.add(cb.dataset.id);
        } else {
            selectedCards.delete(cb.dataset.id);
        }
    });
    
    selectAllBtn.textContent = allChecked ? '全选' : '取消全选';
}

// 处理批量删除
async function handleBatchDelete() {
    if (selectedCards.size === 0) {
        alert('请先选择要删除的卡片');
        return;
    }
    
    if (!confirm(`确定要删除选中的 ${selectedCards.size} 个卡片吗？`)) return;
    
    if (typeof deleteCardById === 'function') {
        for (const cardId of selectedCards) {
            await deleteCardById(cardId);
        }
        
        selectedCards.clear();
        await loadAllData();
        renderCategoryTabs();
    }
}

// ============ 导入导出 ============

// 处理导入
function handleImport() {
    const importType = prompt('请选择导入类型：\n1. 书签HTML文件\n2. JSON数据文件\n\n请输入 1 或 2：');
    
    if (!importType) return;
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = importType === '1' ? '.html,.htm' : '.json';
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                if (importType === '1') {
                    // 导入HTML书签
                    const cards = parseBookmarkHTML(e.target.result);
                    for (const card of cards) {
                        await saveCard(card.name, card.website, card.category);
                    }
                } else {
                    // 导入JSON
                    const data = JSON.parse(e.target.result);
                    if (data.cards && Array.isArray(data.cards)) {
                        for (const card of data.cards) {
                            await saveCard(card.name, card.website, card.category);
                        }
                    }
                }
                
                await loadAllData();
                renderCategoryTabs();
                alert('导入成功！');
            } catch (error) {
                alert('导入失败：' + error.message);
            }
        };
        
        reader.readAsText(file);
    });
    
    fileInput.click();
}

// 解析书签HTML
function parseBookmarkHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = doc.querySelectorAll('a');
    const cards = [];
    
    links.forEach(link => {
        const name = link.textContent.trim();
        const website = link.href;
        
        if (name && website && !website.startsWith('javascript:')) {
            cards.push({
                name,
                website,
                category: 'text'
            });
        }
    });
    
    return cards;
}

// 处理导出
async function handleExport() {
    if (!window.cards || window.cards.length === 0) {
        alert('没有数据可导出');
        return;
    }
    
    const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        totalCards: window.cards.length,
        cards: window.cards
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// ============ 强制刷新 ============
async function forceRefresh() {
    if (typeof loadAllData === 'function') {
        await loadAllData();
        showSyncStatus('刷新完成', true);
    }
}

// ============ 壁纸功能 ============

function setupWallpaperFunctionality() {
    const wallpaperModal = document.getElementById('wallpaper-modal');
    const closeBtn = document.getElementById('close-wallpaper-modal');
    const uploadInput = document.getElementById('wallpaper-upload');
    const colorOptions = document.querySelectorAll('.color-option');
    
    // 关闭按钮
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            wallpaperModal.style.display = 'none';
        });
    }
    
    // 上传图片
    if (uploadInput) {
        uploadInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = async function(e) {
                const imageData = e.target.result;
                
                showSyncStatus('正在上传壁纸...', true);
                
                const success = await saveWallpaperToGitHub({
                    type: 'image',
                    value: imageData,
                    filename: file.name
                });
                
                if (success) {
                    document.body.style.backgroundImage = `url(${imageData})`;
                    document.body.style.backgroundSize = 'cover';
                    document.body.style.backgroundPosition = 'center';
                    document.body.style.backgroundRepeat = 'no-repeat';
                    
                    showSyncStatus('壁纸已同步', true);
                    
                    setTimeout(() => {
                        wallpaperModal.style.display = 'none';
                    }, 1000);
                }
            };
            reader.readAsDataURL(file);
        });
    }
    
    // 颜色选择
    colorOptions.forEach(option => {
        option.addEventListener('click', async function() {
            const color = this.dataset.color;
            
            showSyncStatus('正在保存壁纸...', true);
            const success = await saveWallpaperToGitHub({
                type: 'solid',
                value: color
            });
            
            if (success) {
                document.body.style.backgroundImage = 'none';
                document.body.style.backgroundColor = color;
                
                showSyncStatus('壁纸已同步', true);
                
                setTimeout(() => {
                    wallpaperModal.style.display = 'none';
                }, 1000);
            }
        });
    });
}

// 保存壁纸到GitHub
async function saveWallpaperToGitHub(wallpaperData) {
    try {
        const searchResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?state=all&_t=${Date.now()}`);
        const issues = await searchResponse.json();
        const existing = issues.find(i => i.title === '【壁纸配置】');
        
        const dataToSave = JSON.stringify(wallpaperData);
        
        let response;
        if (existing) {
            response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${existing.number}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    body: dataToSave
                })
            });
        } else {
            response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: '【壁纸配置】',
                    body: dataToSave
                })
            });
        }
        
        if (response.ok) {
            return true;
        } else {
            const err = await response.json();
            console.error('保存壁纸失败:', err);
            showSyncStatus('保存失败: ' + err.message, false);
            return false;
        }
    } catch (error) {
        console.error('保存壁纸出错:', error);
        showSyncStatus('网络错误', false);
        return false;
    }
}

// 加载当前壁纸预览
async function loadCurrentWallpaperPreview() {
    const previewDiv = document.getElementById('current-wallpaper-preview');
    if (!previewDiv) return;
    
    try {
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?state=all&_t=${Date.now()}`);
        const issues = await response.json();
        const wallpaperIssue = issues.find(i => i.title === '【壁纸配置】');
        
        if (wallpaperIssue) {
            const wallpaperData = JSON.parse(wallpaperIssue.body);
            
            if (wallpaperData.type === 'image') {
                previewDiv.style.backgroundImage = `url(${wallpaperData.value})`;
                previewDiv.style.backgroundColor = 'transparent';
            } else {
                previewDiv.style.backgroundImage = 'none';
                previewDiv.style.backgroundColor = wallpaperData.value;
            }
        }
    } catch (error) {
        console.error('加载壁纸预览失败:', error);
    }
}

// ============ 布局功能 ============

function setupLayoutFunctionality() {
    document.querySelectorAll('.layout-btn-quick').forEach(btn => {
        btn.addEventListener('click', function() {
            const layout = this.dataset.layout;
            
            if (layout === 'custom') {
                document.getElementById('custom-layout').style.display = 'block';
            } else {
                document.getElementById('custom-layout').style.display = 'none';
                applyQuickLayout(layout);
            }
        });
    });
    
    const applyLayoutBtn = document.getElementById('apply-layout');
    if (applyLayoutBtn) {
        applyLayoutBtn.addEventListener('click', function() {
            applyCustomLayout();
            document.getElementById('layout-modal').style.display = 'none';
        });
    }
    
    const resetLayoutBtn = document.getElementById('reset-layout');
    if (resetLayoutBtn) {
        resetLayoutBtn.addEventListener('click', resetLayoutSettings);
    }
    
    setupLayoutInputs();
}

function setupLayoutInputs() {
    const rowsInput = document.getElementById('rows-input');
    const columnsInput = document.getElementById('columns-input');
    const iconSizeInput = document.getElementById('icon-size-slider');
    const rowsValue = document.getElementById('rows-value');
    const columnsValue = document.getElementById('columns-value');
    const iconSizeValue = document.getElementById('icon-size-value');
    
    if (rowsInput && rowsValue) {
        rowsInput.addEventListener('input', function() {
            rowsValue.textContent = this.value;
        });
    }
    
    if (columnsInput && columnsValue) {
        columnsInput.addEventListener('input', function() {
            columnsValue.textContent = this.value;
        });
    }
    
    if (iconSizeInput && iconSizeValue) {
        iconSizeInput.addEventListener('input', function() {
            iconSizeValue.textContent = this.value + '%';
        });
    }
}

function applyQuickLayout(layout) {
    const [rows, cols] = layout.split('x').map(Number);
    
    const settings = {
        rows: rows,
        columns: cols,
        iconSize: 100,
        layoutType: layout
    };
    
    localStorage.setItem('layoutSettings', JSON.stringify(settings));
    applyLayoutSettings(settings);
}

function applyCustomLayout() {
    const rowsInput = document.getElementById('rows-input');
    const columnsInput = document.getElementById('columns-input');
    const iconSizeInput = document.getElementById('icon-size-slider');
    
    const settings = {
        rows: parseInt(rowsInput.value) || 3,
        columns: parseInt(columnsInput.value) || 10,
        iconSize: parseInt(iconSizeInput.value) || 100,
        layoutType: 'custom'
    };
    
    localStorage.setItem('layoutSettings', JSON.stringify(settings));
    applyLayoutSettings(settings);
}

function applyLayoutSettings(settings) {
    const container = document.getElementById('ai-cards');
    if (container) {
        container.style.gridTemplateColumns = `repeat(${settings.columns}, 1fr)`;
    }
    
    if (window.cards) {
        renderCards(window.cards);
    }
}

function loadLayoutSettings() {
    const savedSettings = JSON.parse(localStorage.getItem('layoutSettings') || '{}');
    
    if (Object.keys(savedSettings).length > 0) {
        applyLayoutSettings(savedSettings);
        
        const rowsInput = document.getElementById('rows-input');
        const columnsInput = document.getElementById('columns-input');
        const iconSizeInput = document.getElementById('icon-size-slider');
        const rowsValue = document.getElementById('rows-value');
        const columnsValue = document.getElementById('columns-value');
        const iconSizeValue = document.getElementById('icon-size-value');
        
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
}

function resetLayoutSettings() {
    const rowsInput = document.getElementById('rows-input');
    const columnsInput = document.getElementById('columns-input');
    const iconSizeInput = document.getElementById('icon-size-slider');
    const rowsValue = document.getElementById('rows-value');
    const columnsValue = document.getElementById('columns-value');
    const iconSizeValue = document.getElementById('icon-size-value');
    
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
    
    localStorage.removeItem('layoutSettings');
    
    applyLayoutSettings({
        rows: 3,
        columns: 10,
        iconSize: 100
    });
}

// ============ 暴露全局变量 ============

window.renderCards = renderCards;
window.deleteCard = deleteCard;
window.editCard = editCard;
window.switchCategory = switchCategory;
window.handleCardCheck = handleCardCheck;
window.handleCardClick = handleCardClick;
window.forceRefresh = forceRefresh;

// 监听cards更新
document.addEventListener('cardsUpdated', function(e) {
    window.cards = e.detail;
    renderCards(window.cards);
    renderCategoryTabs();
});