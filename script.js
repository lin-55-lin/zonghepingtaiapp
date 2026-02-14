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
const appTitle = document.getElementById('app-title');
const editTitleBtn = document.getElementById('edit-title-btn');
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
            loadSavedWallpapers();
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
            card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            card.website.toLowerCase().includes(searchTerm.toLowerCase())
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
        const icon = card.icon || '🔗';
        const category = card.category || '其他';
        
        // 管理模式下的复选框
        const checkboxHtml = isManageMode ? 
            `<input type="checkbox" class="card-checkbox" data-id="${card.id}" onchange="handleCardCheck(this)">` : '';
        
        // 管理模式下的删除按钮
        const deleteBtnHtml = isManageMode ?
            `<button class="delete-btn" onclick="deleteCard('${card.id}')">×</button>` : '';
        
        html += `
            <div class="ai-card" data-id="${card.id}" data-category="${category}" onclick="handleCardClick('${card.id}', '${card.website}')">
                <div class="card-header">
                    ${checkboxHtml}
                    ${deleteBtnHtml}
                    <span class="card-icon">${icon}</span>
                    <h3>${card.name}</h3>
                </div>
                <div class="card-body">
                    <a href="${card.website}" target="_blank" onclick="event.stopPropagation()">${card.website}</a>
                </div>
                <div class="card-footer">
                    <span class="category-tag">${category}</span>
                </div>
            </div>
        `;
    });
    
    aiCardsContainer.innerHTML = html;
    
    // 应用图标大小
    const iconSize = layoutSettings.iconSize || 100;
    document.querySelectorAll('.card-icon').forEach(icon => {
        icon.style.fontSize = iconSize + '%';
    });
}

// 卡片点击处理
function handleCardClick(cardId, website) {
    if (!isManageMode) {
        window.open(website, '_blank');
    }
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
    const icon = document.getElementById('card-icon').value.trim() || '🔗';
    
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
        const success = await saveCard(name, website, finalCategory, icon);
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
    
    if (isManageMode) {
        manageModeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
        manageModeBtn.style.background = 'rgba(255, 123, 0, 0.1)';
        manageModeBtn.style.color = '#ff7b00';
        managePanel.style.display = 'block';
        if (editTitleBtn) editTitleBtn.style.display = 'inline-block';
    } else {
        manageModeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
        manageModeBtn.style.background = 'rgba(255, 255, 255, 0.8)';
        manageModeBtn.style.color = '#666';
        managePanel.style.display = 'none';
        if (editTitleBtn) editTitleBtn.style.display = 'none';
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
                        await saveCard(card.name, card.website, card.category, card.icon);
                    }
                } else {
                    // 导入JSON
                    const data = JSON.parse(e.target.result);
                    if (data.cards && Array.isArray(data.cards)) {
                        for (const card of data.cards) {
                            await saveCard(card.name, card.website, card.category, card.icon);
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
                category: 'text',
                icon: '🔗'
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

// ============ 壁纸功能 ============

function setupWallpaperFunctionality() {
    const colorOptions = document.querySelectorAll('.color-option');
    
    colorOptions.forEach(color => {
        color.addEventListener('click', async function() {
            const colorValue = this.dataset.color;
            
            // 移除其他颜色的激活状态
            colorOptions.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            // 保存到GitHub
            if (typeof saveWallpaper === 'function') {
                await saveWallpaper(colorValue);
            }
            
            // 应用背景色
            document.body.style.backgroundColor = colorValue;
            
            // 关闭弹窗
            document.getElementById('wallpaper-modal').style.display = 'none';
        });
    });
    
    // 加载壁纸设置
    if (typeof loadAllData === 'function') {
        loadAllData();
    }
}

// 加载已保存的壁纸
function loadSavedWallpapers() {
    // 从GitHub加载，已经在loadAllData中处理
}

// ============ 布局功能 ============

function setupLayoutFunctionality() {
    // 快捷布局按钮
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
    
    // 应用设置按钮
    const applyLayoutBtn = document.getElementById('apply-layout');
    if (applyLayoutBtn) {
        applyLayoutBtn.addEventListener('click', function() {
            applyCustomLayout();
            document.getElementById('layout-modal').style.display = 'none';
        });
    }
    
    // 重置按钮
    const resetLayoutBtn = document.getElementById('reset-layout');
    if (resetLayoutBtn) {
        resetLayoutBtn.addEventListener('click', resetLayoutSettings);
    }
    
    // 滑块显示
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
    
    document.querySelectorAll('.card-icon').forEach(icon => {
        icon.style.fontSize = settings.iconSize + '%';
    });
    
    if (window.cards) {
        renderCards(window.cards);
    }
}

function loadLayoutSettings() {
    const savedSettings = JSON.parse(localStorage.getItem('layoutSettings') || '{}');
    
    if (Object.keys(savedSettings).length > 0) {
        applyLayoutSettings(savedSettings);
        
        // 更新输入框值
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

// ============ 暴露全局变量供index.html使用 ============

// 让index.html中的函数可以访问cards数据
window.renderCards = renderCards;
window.deleteCard = deleteCard;
window.switchCategory = switchCategory;
window.handleCardCheck = handleCardCheck;
window.handleCardClick = handleCardClick;

// 监听cards更新
document.addEventListener('cardsUpdated', function(e) {
    window.cards = e.detail;
    renderCards(window.cards);
    renderCategoryTabs();
});