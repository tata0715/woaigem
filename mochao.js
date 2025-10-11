// ========= START OF FILE mochao.js =========

// ========= START OF INJECT HTML FUNCTION =========


// ▼▼▼ 【修复1.A | 最终版】同时处理单击和长按的核心函数 ▼▼▼
function addClickAndLongPress(element, clickCallback, longPressCallback) {
    let pressTimer = null;
    let startX, startY;
    let isLongPress = false; // 标记是否已触发长按

    const start = (e) => {
        // 只有在触摸开始时才阻止默认滚动，以兼容滑动页面
        if (e.type === 'touchstart') {
            e.preventDefault();
        }

        isLongPress = false;
        startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        startY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;

        pressTimer = window.setTimeout(() => {
            isLongPress = true; // 标记长按已触发
            longPressCallback(e);
        }, 500); // 500毫秒触发长按
    };

    const cancel = (e) => {
        clearTimeout(pressTimer);
    };

    const end = (e) => {
        clearTimeout(pressTimer);
        
        // 只有当长按【没有】被触发时，才可能是单击
        if (!isLongPress) {
            const endX = e.type.includes('mouse') ? e.pageX : e.changedTouches[0].pageX;
            const endY = e.type.includes('mouse') ? e.pageY : e.changedTouches[0].pageY;
            
            // 并且手指/鼠标的移动距离很小
            if (Math.abs(endX - startX) < 10 && Math.abs(endY - startY) < 10) {
               clickCallback(e); // 执行单击回调
            }
        }
    };

    element.addEventListener('mousedown', start);
    element.addEventListener('mouseup', end);
    element.addEventListener('mouseleave', cancel);
    element.addEventListener('touchstart', start, { passive: false }); // 必须是 non-passive 才能 preventDefault
    element.addEventListener('touchend', end);
    element.addEventListener('touchmove', cancel); // 如果移动了，就取消计时器
}
// ▲▲▲ 修复结束 ▲▲▲

// ▼▼▼ 【修复1.A | 最终版】引入所有核心弹窗函数 ▼▼▼

function showCustomConfirm(title, message, options = {}) {
    return new Promise(resolve => {
        const modalOverlay = document.getElementById('custom-modal-overlay');
        const modalTitle = document.getElementById('custom-modal-title');
        const modalBody = document.getElementById('custom-modal-body');
        const confirmBtn = document.getElementById('custom-modal-confirm');
        const cancelBtn = document.getElementById('custom-modal-cancel');

        modalTitle.textContent = title;
        modalBody.innerHTML = `<p>${message}</p>`;
        cancelBtn.style.display = 'block';
        confirmBtn.textContent = options.confirmText || '确定';
        cancelBtn.textContent = options.cancelText || '取消';

        confirmBtn.classList.toggle('btn-danger', !!options.confirmButtonClass);

        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        const newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

        newConfirmBtn.onclick = () => { modalOverlay.classList.remove('visible'); resolve(true); };
        newCancelBtn.onclick = () => { modalOverlay.classList.remove('visible'); resolve(false); };
        
        modalOverlay.classList.add('visible');
    });
}

function showCustomPrompt(title, placeholder, initialValue = '', type = 'text') {
    return new Promise(resolve => {
        const modalOverlay = document.getElementById('custom-modal-overlay');
        const modalTitle = document.getElementById('custom-modal-title');
        const modalBody = document.getElementById('custom-modal-body');
        const confirmBtn = document.getElementById('custom-modal-confirm');
        const cancelBtn = document.getElementById('custom-modal-cancel');
        
        const inputId = 'custom-prompt-input';
        modalTitle.textContent = title;
        modalBody.innerHTML = `<input type="${type}" id="${inputId}" placeholder="${placeholder}" value="${initialValue}">`;
        
        const input = document.getElementById(inputId);

        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        const newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

        newConfirmBtn.onclick = () => { modalOverlay.classList.remove('visible'); resolve(input.value); };
        newCancelBtn.onclick = () => { modalOverlay.classList.remove('visible'); resolve(null); };

        modalOverlay.classList.add('visible');
        setTimeout(() => input.focus(), 100);
    });
}

function showChoiceModal(title, options) {
    return new Promise(resolve => {
        const modal = document.getElementById('preset-actions-modal'); // 复用现有的动作菜单模态框
        const footer = modal.querySelector('.custom-modal-footer');
        footer.innerHTML = ''; // 清空旧按钮

        options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option.text;
            if (option.value === 'delete') button.classList.add('btn-danger');
            button.onclick = () => {
                modal.classList.remove('visible');
                resolve(option.value);
            };
            footer.appendChild(button);
        });

        const cancelButton = document.createElement('button');
        cancelButton.textContent = '取消';
        cancelButton.style.marginTop = '8px';
        cancelButton.style.borderRadius = '8px';
        cancelButton.style.backgroundColor = '#f0f0f0';
        cancelButton.onclick = () => {
            modal.classList.remove('visible');
            resolve(null);
        };
        footer.appendChild(cancelButton);
        
        modal.classList.add('visible');
    });
}
// ▲▲▲ 修复结束 ▲▲▲
/**
 * 动态将“墨巢”App的所有HTML结构和专属模态框注入到主DOM中。
 * 这个函数会在JS文件加载后立即执行。
 */
function injectMochaoHTML() {
    // 1. 定义所有HTML结构
    const mochaoAppHTML = `
        <!-- ▼▼▼ 【全新】这是“墨巢”App的【全部HTML屏幕】 ▼▼▼ -->

        <!-- 1. 书架主屏幕 -->
        <div id="mochao-bookshelf-screen" class="screen">
            <div class="header">
                <span class="back-btn" onclick="showScreen('home-screen')">‹</span>
                <span>墨巢</span>
                <div class="header-actions">
                    <span class="action-btn" id="mochao-import-txt-btn" title="导入TXT">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    </span>
                </div>
            </div>
            <div id="mochao-bookshelf-list" class="list-container">
                <!-- 书本卡片将由JS动态生成 -->
            </div>
            <button id="mochao-create-book-btn" class="form-button" style="position: absolute; bottom: calc(20px + env(safe-area-inset-bottom)); right: 20px; width: 56px; height: 56px; border-radius: 50%; font-size: 32px; padding: 0; line-height: 56px;">+</button>
        </div>

        <!-- 2. 章节列表页 (V1.1版，已添加管理功能) -->
		<div id="mochao-chapter-list-screen" class="screen">
			<div class="header">
				<span class="back-btn" id="mochao-back-to-bookshelf-btn">‹</span>
				<span id="mochao-chapter-list-title">书本名称</span>
				<!-- ▼▼▼ 【任务3.A】新增“管理”按钮 ▼▼▼ -->
				<div class="header-actions">
					<span class="action-btn" id="mochao-manage-chapters-btn">管理</span>
				</div>
				<!-- ▲▲▲ 新增结束 ▲▲▲ -->
			</div>
			<div id="mochao-chapter-list" class="list-container">
				<!-- 章节列表将由JS动态生成 -->
			</div>
			<button id="mochao-create-chapter-btn" class="form-button" style="position: absolute; bottom: calc(20px + env(safe-area-inset-bottom)); right: 20px; width: auto; padding: 0 20px; height: 44px; border-radius: 22px;">+ 新建章节</button>
		</div>

        <!-- 3. 章节编辑页 -->
        <!-- 3. 章节编辑页 (V1.1版) -->
		<div id="mochao-chapter-editor-screen" class="screen">
			<div class="header">
				<span class="back-btn" id="editor-close-btn">关闭</span>
				<span id="editor-header-title">编辑章节</span>
				<span style="width: 30px;"></span>
			</div>
			<div class="form-container">
				<div class="form-group">
					<label for="editor-title-input">章节标题</label>
					<input type="text" id="editor-title-input">
				</div>
				<!-- ▼▼▼ 【增强1.B】新增章节专属文风设置 ▼▼▼ -->
				<div class="form-group">
					<label for="editor-style-prompt-select">章节文风 (可选)</label>
					<select id="editor-style-prompt-select">
						<option value="">-- 沿用书本默认文风 --</option>
						<!-- 更多文风将由JS动态填充 -->
					</select>
				</div>
				<!-- ▲▲▲ 新增结束 ▲▲▲ -->
				<div class="form-group" style="flex-grow: 1;">
					<label for="editor-content-input">章节正文</label>
					<textarea id="editor-content-input"></textarea>
				</div>
				<div class="form-group">
					<label for="editor-author-note-input">作者的话</label>
					<textarea id="editor-author-note-input" rows="2"></textarea>
				</div>
				<div class="form-group">
					<label for="editor-summary-input">本章摘要</label>
					<!-- ▼▼▼ 【修复1.C】移除 readonly 属性，使其可编辑 ▼▼▼ -->
					<textarea id="editor-summary-input" rows="3" style="background-color: #f0f2f5;"></textarea>
					<!-- ▲▲▲ 修复结束 ▲▲▲ -->
				</div>
			</div>
			<div class="editor-bottom-bar">
				<button class="form-button form-button-secondary" style="margin:0; width: 50%;">📝 生成本章摘要</button>
				<button class="form-button form-button-secondary" style="margin:0; width: 50%;">✨ AI润色/续写</button>
				<button class="form-button" id="editor-save-btn" style="margin:0; width: 100%;">✅ 确定</button>
			</div>
		</div>

        <!-- 4. 章节阅读页 -->
        <div id="mochao-chapter-reader-screen" class="screen">
            <div class="header">
                <span class="back-btn" id="reader-back-btn">‹ 目录</span>
                <div class="header-actions">
                    <span class="action-btn" id="reader-appearance-btn">外观</span>
                    <span class="action-btn" id="reader-edit-btn">编辑</span>
                    <span class="action-btn">共读</span>
                    <span class="action-btn">转载</span>
                </div>
            </div>
            <div class="list-container">
                <h2 id="reader-chapter-title"></h2>
                <div id="reader-content-body"></div>
                <div id="reader-author-note"></div>
                <div id="reader-summary"></div>
                <!-- 评论区 placeholder -->
                <div id="reader-comments-section" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid var(--border-color);">
                    <h3>评论区</h3>
                    <button class="form-button form-button-secondary">🤖 召唤AI读者团</button>
                </div>
            </div>
			<!-- ▼▼▼ 【任务2.A】为导航元素添加ID ▼▼▼ -->
			<div id="reader-navigation-bar" style="position: absolute; bottom: 0; left: 0; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 15px; pointer-events: none;">
				<button id="reader-prev-btn" class="chat-action-icon-btn" style="pointer-events: auto;">‹</button>
				<span id="reader-chapter-indicator" style="background: rgba(0,0,0,0.1); color: var(--text-secondary); padding: 5px 10px; border-radius: 12px; font-size: 14px; pointer-events: auto; cursor: pointer;">第 1 / 1 章</span>
				<button id="reader-next-btn" class="chat-action-icon-btn" style="pointer-events: auto;">›</button>
			</div>
			<!-- ▲▲▲ 新增结束 ▲▲▲ -->
        </div>

        <!-- ▼▼▼ “墨巢”App专属的模态框 ▼▼▼ -->
        <!-- ▼▼▼ 【修复2.A】全新V3版书本编辑器（补完所有字段） ▼▼▼ -->
<div id="mochao-book-editor-modal" class="modal">
    <div class="modal-content" style="height: 90%;">
        <div class="modal-header">
            <span id="book-editor-title">创建新书</span>
            <button id="mochao-book-editor-modal-close" style="background:none; border:none; font-size: 24px; cursor: pointer;">×</button>
        </div>
        <div class="modal-body" style="display: flex; flex-direction: column;">
            <div class="form-group">
                <label for="book-name-input">书名</label>
                <input type="text" id="book-name-input" placeholder="请输入书名...">
            </div>
            <div class="form-group">
                <label for="book-author-input">作者名</label>
                <input type="text" id="book-author-input" placeholder="请输入作者笔名...">
            </div>
            <div class="form-group">
                <label for="book-author-persona-input">作者设定</label>
                <textarea id="book-author-persona-input" rows="2" placeholder="例如：一个喜欢挖坑的悬疑作家..."></textarea>
            </div>
            <div class="form-group">
                <label for="book-tags-input">类型/标签 (用逗号分隔)</label>
                <input type="text" id="book-tags-input" placeholder="例如: 科幻, 爱情, ABO">
            </div>
            <div class="form-group">
                <label for="book-style-prompt-input">文风</label>
                <textarea id="book-style-prompt-input" rows="3" placeholder="例如：语言风格简洁、有力，多用短句..."></textarea>
            </div>
            <div class="form-group">
                <label for="book-synopsis-input">简介</label>
                <textarea id="book-synopsis-input" rows="3" placeholder="简单介绍一下你的故事..."></textarea>
            </div>

            <!-- 主要人物 -->
            <div class="form-group">
                <label style="display:flex; justify-content: space-between; align-items: center;">
                    <span>主要人物</span>
                    <button class="form-button-secondary" id="ai-generate-characters-btn" style="margin:0; padding: 4px 8px; font-size: 12px;">👤 AI生成</button>
                </label>
                <div id="book-characters-list" style="max-height: 120px; overflow-y: auto; background: #f9f9f9; padding: 10px; border-radius: 8px;"></div>
                <button id="add-character-btn" class="form-button form-button-secondary" style="margin-top: 10px;">+ 手动添加人物</button>
            </div>

            <!-- 故事大纲 -->
            <div class="form-group" style="flex-grow: 1; display: flex; flex-direction: column;">
                <label style="display:flex; justify-content: space-between; align-items: center;">
                    <span>故事大纲</span>
                    <button class="form-button-secondary" id="ai-generate-outline-btn" style="margin:0; padding: 4px 8px; font-size: 12px;">🔄 AI生成/更新</button>
                </label>
                <textarea id="book-outline-input" style="flex-grow: 1;" placeholder="大纲将由AI根据章节摘要生成，您也可以在此手动编辑..."></textarea>
            </div>
        </div>
        <div class="modal-footer" style="flex-direction: column; gap: 10px;">
            <button class="form-button form-button-secondary" id="book-ai-magic-btn">✨ AI魔法棒 (一键完善所有空白信息)</button>
            <button class="save" id="book-editor-save-btn">保存书本</button>
        </div>
    </div>
</div>
<!-- ▲▲▲ 修复结束 ▲▲▲ -->

        <!-- ▼▼▼ 【修复3】外观设置弹窗（带独立预览区）▼▼▼ -->
<div id="mochao-appearance-modal" class="modal">
    <div class="modal-content" style="height: auto;">
        <div class="modal-header">
            <span>阅读外观设置</span>
            <button id="appearance-modal-close-btn" style="background:none; border:none; font-size: 24px; cursor: pointer;">×</button>
        </div>
        <div class="modal-body">
            <!-- 独立的预览区域 -->
            <div id="mochao-appearance-preview" style="padding: 15px; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 20px; transition: all 0.3s ease;">
                <p style="margin:0;">这是字体大小和背景预览。</p>
            </div>
            <div class="form-group">
                <label for="appearance-font-size-slider">字体大小 <span id="appearance-font-size-value">16px</span></label>
                <input type="range" id="appearance-font-size-slider" min="12" max="24" step="1" value="16">
            </div>
            <div class="form-group">
                <label>背景颜色</label>
                <div class="appearance-bg-selector">
                    <div class="bg-color-option" data-color="#FDFBF5" style="background-color: #FDFBF5;"></div>
                    <div class="bg-color-option" data-color="#E3EDD8" style="background-color: #E3EDD8;"></div>
                    <div class="bg-color-option" data-color="#F5F5F5" style="background-color: #F5F5F5;"></div>
                    <div class="bg-color-option" data-color="#2E2E2E" style="background-color: #2E2E2E;"></div>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="save" id="appearance-save-btn">保存设置</button>
        </div>
    </div>
</div>
<!-- ▲▲▲ 修复结束 ▲▲▲ -->

        <!-- ▲▲▲ “墨巢”App HTML结束 ▲▲▲ -->
    `;

    // 2. 将HTML字符串注入到主屏幕容器的末尾
    const phoneScreen = document.getElementById('phone-screen');
    if (phoneScreen) {
        phoneScreen.insertAdjacentHTML('beforeend', mochaoAppHTML);
    }
}

// 3. 立即执行这个注入函数
injectMochaoHTML();

// ========= END OF INJECT HTML FUNCTION =========


// 使用DOMContentLoaded确保在操作DOM前，所有元素都已加载完毕
document.addEventListener('DOMContentLoaded', () => {
    // ===================================================================
    // 1. 全局变量与状态管理
    // ===================================================================
    let activeBookId = null;
    let activeChapterId = null;
    let editingChapterId = null; // 区分是新建还是编辑章节
    let mochaoSettings = {}; // 存储墨巢App的专属设置

    // ===================================================================
    // 2. 核心功能函数
    // ===================================================================

    /**
     * 渲染书架主屏幕
     */
    // ▼▼▼ 【任务1.B】更新 renderBookshelf 函数以支持长按 ▼▼▼
	async function renderBookshelf() {
		const bookshelfEl = document.getElementById('mochao-bookshelf-list');
		bookshelfEl.innerHTML = '';
		const books = await db.books.orderBy('lastModified').reverse().toArray();

		if (books.length === 0) {
			bookshelfEl.innerHTML = '<p style="text-align:center; color: var(--text-secondary); padding: 50px 0;">书架空空如也，点击右下角“+”<br>开始创作你的第一本书吧！</p>';
			return;
		}

		for (const book of books) {
			const wordCount = await db.chapters.where('bookId').equals(book.id).toArray().then(chapters =>
				chapters.reduce((sum, chap) => sum + (chap.content || '').length, 0)
			);

			const item = document.createElement('div');
			item.className = 'mochao-book-card';
			item.dataset.bookId = book.id;
			item.innerHTML = `
				<div class="book-card-cover" style="background-image: url(${book.coverImage || 'https://i.postimg.cc/pT2xKzPz/album-cover-placeholder.png'})"></div>
				<div class="book-card-info">
					<h3 class="book-card-title">${book.name}</h3>
					<p class="book-card-synopsis">${(book.synopsis || '暂无简介').substring(0, 40)}...</p>
					<p class="book-card-meta">字数: ${wordCount}</p>
				</div>
			`;
			
			// ▼▼▼ 【修复1.B】使用全新的事件处理器 ▼▼▼
			// 定义单击时要执行的操作
			const clickAction = () => {
				const bookId = parseInt(item.dataset.bookId);
				renderChapterList(bookId);
				showScreen('mochao-chapter-list-screen');
			};

			// 定义长按时要执行的操作
			const longPressAction = () => {
				showBookActions(book.id, book.name);
			};

			// 使用新函数，将两种操作同时绑定到元素上
			addClickAndLongPress(item, clickAction, longPressAction);
			// ▲▲▲ 修复结束 ▲▲▲

			bookshelfEl.appendChild(item);
		}
	}
	// ▲▲▲ 更新结束 ▲▲▲

    /**
     * 渲染指定书本的章节列表
     * @param {number} bookId
     */
   // ▼▼▼ 【任务3.C | V3版最终简化】更新 renderChapterList 函数 ▼▼▼
	async function renderChapterList(bookId) {
		activeBookId = bookId;
		const listEl = document.getElementById('mochao-chapter-list');
		const book = await db.books.get(bookId);
		if (!book) {
			showScreen('mochao-bookshelf-screen');
			return;
		}

		document.getElementById('mochao-chapter-list-title').textContent = book.name;
		const chapters = await db.chapters.where('bookId').equals(bookId).sortBy('order');
		listEl.innerHTML = '';

		if (chapters.length === 0) {
			listEl.innerHTML = '<p style="text-align:center; color: var(--text-secondary); padding: 50px 0;">这本书还没有章节，<br>点击下方“+”添加第一章吧！</p>';
		} else {
			const fragment = document.createDocumentFragment();
			chapters.forEach(chapter => {
				const item = document.createElement('div');
				// ▼▼▼ 【修复1.A | 终极版】使用专属Class名，避免样式冲突 ▼▼▼
				item.className = 'mochao-chapter-item';
				// ▲▲▲ 修复结束 ▲▲▲
				item.dataset.chapterId = chapter.id;
				item.innerHTML = `
					<div class="chapter-drag-handle">☰</div>
					<div class="list-item-content">
						<div class="item-title">${chapter.order}. ${chapter.title}</div>
						<div class="item-content">${(chapter.summary || '暂无摘要').substring(0, 50)}...</div>
					</div>
					<button class="chapter-delete-btn" data-chapter-id="${chapter.id}">-</button>
				`;
				fragment.appendChild(item);
			});
			listEl.appendChild(fragment);
		}
	}
	// ▲▲▲ 更新结束 ▲▲▲

    /**
     * 渲染章节阅读器页面
     * @param {number} chapterId
     */
    // ▼▼▼ 【任务2.B】更新 renderChapterReader 函数以支持导航 ▼▼▼
async function renderChapterReader(chapterId) {
    activeChapterId = chapterId;
    const chapter = await db.chapters.get(chapterId);
    if (!chapter) {
        alert('错误：找不到该章节。');
        showScreen('mochao-chapter-list-screen');
        return;
    }
    
    activeBookId = chapter.bookId; // 确保 activeBookId 正确

    document.getElementById('reader-chapter-title').textContent = `${chapter.order}. ${chapter.title}`;
    document.getElementById('reader-content-body').innerHTML = `<p>${(chapter.content || '暂无内容').replace(/\n/g, '</p><p>')}</p>`;
    document.getElementById('reader-author-note').textContent = chapter.authorNote || '作者没有留下什么话。';
    document.getElementById('reader-summary').textContent = chapter.summary || '本章还没有摘要。';
    
    // 更新底部章节指示器
    const allChapters = await db.chapters.where('bookId').equals(activeBookId).sortBy('order');
    const currentIndex = allChapters.findIndex(c => c.id === chapterId);
    document.getElementById('reader-chapter-indicator').textContent = `第 ${currentIndex + 1} / ${allChapters.length} 章`;
    
    // 根据是否是第一章/最后一章，禁用或启用按钮
    document.getElementById('reader-prev-btn').disabled = (currentIndex === 0);
    document.getElementById('reader-next-btn').disabled = (currentIndex === allChapters.length - 1);

    applyReaderAppearance();
    
    // 切换章节后，将页面滚动到顶部
    document.querySelector('#mochao-chapter-reader-screen .list-container').scrollTop = 0;
}
// ▲▲▲ 更新结束 ▲▲▲

    /**
     * 打开书本编辑器（用于新建或编辑）
     * @param {number|null} bookId - 如果是编辑则传入ID，新建则为null
     */
    // ▼▼▼ 【修复2.B】重构书本编辑器相关的所有JS函数 ▼▼▼

// ▼▼▼ 【修复2 & 3 & 4】重构书本编辑器相关的所有JS函数 ▼▼▼

/**
 * 打开书本编辑器（V3版，已补全所有字段）
 */
async function openBookEditor(bookId = null) {
    const modal = document.getElementById('mochao-book-editor-modal');
    const aiBtn = document.getElementById('book-ai-magic-btn');
    
    document.getElementById('book-characters-list').innerHTML = '';

    if (bookId) {
        const book = await db.books.get(bookId);
        if (!book) return;
        modal.dataset.editingId = bookId;
        document.getElementById('book-editor-title').textContent = '编辑书本信息';
        aiBtn.style.display = 'none';

        document.getElementById('book-name-input').value = book.name || '';
        document.getElementById('book-author-input').value = book.authorName || '';
        document.getElementById('book-author-persona-input').value = book.authorPersona || '';
        document.getElementById('book-tags-input').value = (book.tags || []).join(', ');
        document.getElementById('book-style-prompt-input').value = book.stylePrompt || '';
        document.getElementById('book-synopsis-input').value = book.synopsis || '';
        
        // 大纲字段现在是一个数组，需要用JSON.stringify来显示
        document.getElementById('book-outline-input').value = book.outline ? JSON.stringify(book.outline, null, 2) : '[]';
        
        renderCharacterSheets(book.characterSheets || []);

    } else {
        modal.dataset.editingId = '';
        document.getElementById('book-editor-title').textContent = '创建新书';
        aiBtn.style.display = 'block';
        
        document.getElementById('book-name-input').value = '';
        document.getElementById('book-author-input').value = '';
        document.getElementById('book-author-persona-input').value = '';
        document.getElementById('book-tags-input').value = '';
        document.getElementById('book-style-prompt-input').value = '';
        document.getElementById('book-synopsis-input').value = '';
        document.getElementById('book-outline-input').value = '[]';
        renderCharacterSheets([]);
    }
    modal.classList.add('visible');
}

/**
 * 渲染人物卡片列表（无修改）
 */
function renderCharacterSheets(characters) {
    const listEl = document.getElementById('book-characters-list');
    listEl.innerHTML = '';
    if (characters.length === 0) {
        listEl.innerHTML = '<p style="text-align:center; font-size:12px; color:#8a8a8a;">还没有人物...</p>';
    } else {
        characters.forEach((char, index) => {
            const item = document.createElement('div');
            item.className = 'existing-group-item';
            item.innerHTML = `
                <span class="group-name" title="${char.description}">${char.name}</span>
                <span class="delete-group-btn" data-index="${index}">×</span>
            `;
            listEl.appendChild(item);
        });
    }
}

/**
 * 【全新】手动添加一个新的人物卡
 */
async function addCharacterManually() {
    const name = await showCustomPrompt("添加人物", "请输入人物姓名：");
    if (!name || !name.trim()) return;

    const description = await showCustomPrompt(`人物“${name}”的设定`, "请输入该人物的简介/设定：", "", "textarea");
    if (description === null) return;

    // 这是一个临时方案，直接在DOM上操作，点击保存时再统一处理
    const listEl = document.getElementById('book-characters-list');
    if(listEl.querySelector('p')) listEl.innerHTML = ''; // 如果有提示语，先清空

    const item = document.createElement('div');
    item.className = 'existing-group-item';
    item.dataset.isNew = 'true'; // 标记为新添加的
    item.dataset.name = name.trim();
    item.dataset.description = description;
    item.innerHTML = `
        <span class="group-name" title="${description}">${name.trim()}</span>
        <span class="delete-group-btn">×</span>
    `;
    listEl.appendChild(item);
}

/**
 * 保存书本信息（V2版，支持读写所有字段）
 */
async function saveBookInfo() {
    const modal = document.getElementById('mochao-book-editor-modal');
    const bookId = modal.dataset.editingId ? parseInt(modal.dataset.editingId) : null;
    const name = document.getElementById('book-name-input').value.trim();
    if (!name) {
        alert('书名不能为空！');
        return;
    }

    let outline;
    try {
        const outlineText = document.getElementById('book-outline-input').value.trim();
        outline = outlineText ? JSON.parse(outlineText) : [];
    } catch (e) {
        alert('故事大纲的格式不正确，必须是有效的JSON数组！');
        return;
    }

    // 收集所有人物卡信息
    const characterSheets = [];
    document.querySelectorAll('#book-characters-list .existing-group-item').forEach(item => {
        characterSheets.push({
            name: item.querySelector('.group-name').textContent,
            description: item.title 
        });
    });

    const bookData = {
        name: name,
        authorName: document.getElementById('book-author-input').value.trim(),
        authorPersona: document.getElementById('book-author-persona-input').value.trim(),
        tags: document.getElementById('book-tags-input').value.trim().split(/[,，\s]+/).filter(Boolean),
        stylePrompt: document.getElementById('book-style-prompt-input').value.trim(),
        synopsis: document.getElementById('book-synopsis-input').value.trim(),
        outline: outline,
        characterSheets: characterSheets, // 保存人物卡
        lastModified: Date.now()
    };

    if (bookId) {
        await db.books.update(bookId, bookData);
    } else {
        bookData.coverImage = ''; // 新书默认无封面
        await db.books.add(bookData);
    }
    
    modal.classList.remove('visible');
    await renderBookshelf();
}
// ▲▲▲ 重构结束 ▲▲▲


// ▼▼▼ 【任务1.C】添加书本操作菜单的核心函数 ▼▼▼

/**
 * 显示书本的长按操作菜单
 * @param {number} bookId
 * @param {string} bookName
 */
async function showBookActions(bookId, bookName) {
    // 复用我们强大的 showChoiceModal 弹窗
    const choice = await showChoiceModal(`操作《${bookName}》`, [
        { text: '✏️ 编辑书本信息', value: 'edit' },
        { text: '📤 导出为 .txt', value: 'export' },
        { text: '💬 分享给 Char', value: 'share' },
        { text: '🗑️ 删除书本', value: 'delete' }
    ]);

    switch(choice) {
        case 'edit':
            openBookEditor(bookId);
            break;
        case 'export':
            alert('导出功能将在后续里程碑中实现！');
            // await exportBookAsTxt(bookId); // 预留函数调用
            break;
        case 'share':
            alert('分享功能将在后续里程碑中实现！');
            break;
        case 'delete':
            deleteBook(bookId, bookName);
            break;
    }
}

/**
 * 删除一本书及其所有相关数据
 * @param {number} bookId
 * @param {string} bookName
 */
async function deleteBook(bookId, bookName) {
    const confirmed = await showCustomConfirm(
        '确认删除', 
        `确定要永久删除《${bookName}》及其所有章节和评论吗？此操作不可恢复！`,
        { confirmButtonClass: 'btn-danger' }
    );

    if (confirmed) {
        try {
            // 使用数据库事务来确保所有相关数据被一并删除
            await db.transaction('rw', db.books, db.chapters, db.chapterComments, async () => {
                // 1. 找到这本书下的所有章节ID
                const chapterIds = await db.chapters.where('bookId').equals(bookId).primaryKeys();
                
                // 2. 如果有章节，就删除这些章节下的所有评论
                if (chapterIds.length > 0) {
                    await db.chapterComments.where('chapterId').anyOf(chapterIds).delete();
                }
                
                // 3. 删除所有章节
                await db.chapters.where('bookId').equals(bookId).delete();
                
                // 4. 最后删除书本本身
                await db.books.delete(bookId);
            });

            await renderBookshelf(); // 刷新书架
            await showCustomAlert('删除成功', `《${bookName}》已从您的书架移除。`);

        } catch (error) {
            console.error("删除书本时出错:", error);
            await showCustomAlert('删除失败', `操作失败: ${error.message}`);
        }
    }
}
// ▲▲▲ 新增函数结束 ▲▲▲

    /**
     * 打开章节编辑器（用于新建或编辑）
     * @param {number|null} chapterId
     */
    // ▼▼▼ 【增强1.D】更新 openChapterEditor 函数 ▼▼▼
async function openChapterEditor(chapterId = null) {
    editingChapterId = chapterId;
    const titleEl = document.getElementById('editor-header-title');
    const titleInput = document.getElementById('editor-title-input');
    const contentInput = document.getElementById('editor-content-input');
    const authorNoteInput = document.getElementById('editor-author-note-input');
    const summaryInput = document.getElementById('editor-summary-input');
    const styleSelect = document.getElementById('editor-style-prompt-select');

    // 动态填充文风下拉框 (假设我们把文风存在mochaoSettings里)
    styleSelect.innerHTML = '<option value="">-- 沿用书本默认文风 --</option>';
    (mochaoSettings.stylePresets || []).forEach(preset => {
        styleSelect.innerHTML += `<option value="${preset}">${preset}</option>`;
    });

    if (chapterId) {
        const chapter = await db.chapters.get(chapterId);
        if (!chapter) return;
        titleEl.textContent = '编辑章节';
        titleInput.value = chapter.title || '';
        contentInput.value = chapter.content || '';
        authorNoteInput.value = chapter.authorNote || '';
        summaryInput.value = chapter.summary || '';
        styleSelect.value = chapter.stylePrompt || ''; // 读取章节专属文风
    } else {
        titleEl.textContent = '新建章节';
        titleInput.value = '';
        contentInput.value = '';
        authorNoteInput.value = '';
        summaryInput.value = '';
        styleSelect.value = ''; // 新建时默认为空
    }
    showScreen('mochao-chapter-editor-screen');
}
// ▲▲▲ 更新结束 ▲▲▲

    /**
     * 保存章节内容
     */
    // ▼▼▼ 【增强1.E】更新 saveChapter 函数 ▼▼▼
async function saveChapter() {
    const title = document.getElementById('editor-title-input').value.trim();
    if (!title) {
        alert('章节标题不能为空！');
        return;
    }

    const chapterData = {
        title: title,
        content: document.getElementById('editor-content-input').value,
        authorNote: document.getElementById('editor-author-note-input').value,
        summary: document.getElementById('editor-summary-input').value,
        stylePrompt: document.getElementById('editor-style-prompt-select').value // 保存章节专属文风
    };

    let savedChapterId;

    if (editingChapterId) {
        await db.chapters.update(editingChapterId, chapterData);
        savedChapterId = editingChapterId;
    } else {
        const chaptersInBook = await db.chapters.where('bookId').equals(activeBookId).toArray();
        chapterData.bookId = activeBookId;
        chapterData.order = (chaptersInBook.length > 0) ? Math.max(...chaptersInBook.map(c => c.order)) + 1 : 1;
        savedChapterId = await db.chapters.add(chapterData);
    }

    await db.books.update(activeBookId, { lastModified: Date.now() }); // 更新书本的修改时间
    await renderChapterList(activeBookId);
    await renderChapterReader(savedChapterId);
    showScreen('mochao-chapter-reader-screen');
}
// ▲▲▲ 更新结束 ▲▲▲
    
    /**
     * 应用阅读外观设置
     */
    // ▼▼▼ 【修复3.B】更新 applyReaderAppearance 函数以控制新预览区 ▼▼▼
function applyReaderAppearance() {
    // 应用到实际的阅读器屏幕
    const readerScreen = document.getElementById('mochao-chapter-reader-screen');
    readerScreen.style.backgroundColor = mochaoSettings.bgColor || '#FDFBF5';
    readerScreen.style.fontSize = `${mochaoSettings.fontSize || 16}px`;

    // 同时应用到设置弹窗内的【独立预览区域】
    const modal = document.getElementById('mochao-appearance-modal');
    if (modal.classList.contains('visible')) {
        const previewBox = document.getElementById('mochao-appearance-preview');
        previewBox.style.backgroundColor = mochaoSettings.bgColor || '#FDFBF5';
        previewBox.style.fontSize = `${mochaoSettings.fontSize || 16}px`;
        // 根据背景色深浅调整预览文字颜色
        const isDarkBg = ['#2E2E2E'].includes(mochaoSettings.bgColor);
        previewBox.style.color = isDarkBg ? '#FFFFFF' : '#1f1f1f';

        modal.querySelectorAll('.bg-color-option').forEach(option => {
            option.style.border = (option.dataset.color === mochaoSettings.bgColor) 
                ? '3px solid var(--accent-color)' 
                : '2px solid var(--border-color)';
        });
    }
}
// ▲▲▲ 修复结束 ▲▲▲

    // ===================================================================
    // 3. 初始化与事件监听器
    // ===================================================================

// ▼▼▼ 【修复1.A】创建“墨巢”App的总入口函数 ▼▼▼
/**
 * 【总入口】当用户点击“墨巢”App图标时，由此函数启动
 */
async function openMochaoApp() {
    // 渲染书架主屏幕
    await renderBookshelf();
    // 切换到书架屏幕
    showScreen('mochao-bookshelf-screen');
}
// ▲▲▲ 新增函数结束 ▲▲▲
    /**
     * “墨巢”App的专属初始化函数事件监听器
     */
    async function initializeMochaoApp() {
        // 加载设置
        mochaoSettings = (await db.mochaoSettings.get('main')) || { fontSize: 16, bgColor: '#FDFBF5' };
        
        // --- 书架页事件 ---
        document.getElementById('mochao-create-book-btn').addEventListener('click', () => openBookEditor());
        document.getElementById('mochao-bookshelf-list').addEventListener('click', e => {
            const card = e.target.closest('.mochao-book-card');
            if (card) {
                const bookId = parseInt(card.dataset.bookId);
                renderChapterList(bookId);
                showScreen('mochao-chapter-list-screen');
            }
        });
        
        // --- 书本编辑器弹窗事件 ---
        document.getElementById('mochao-book-editor-modal-close').addEventListener('click', () => {
            document.getElementById('mochao-book-editor-modal').classList.remove('visible');
        });
        document.getElementById('book-editor-save-btn').addEventListener('click', saveBookInfo);

		// ▼▼▼ 【修复2.C】为书本编辑器的新按钮绑定事件 ▼▼▼
		document.getElementById('add-character-btn').addEventListener('click', addCharacterManually);
		document.getElementById('book-characters-list').addEventListener('click', e => {
			// 使用事件委托处理人物删除
			if (e.target.classList.contains('delete-group-btn')) {
				e.target.closest('.existing-group-item').remove();
				const listEl = document.getElementById('book-characters-list');
				if (listEl.children.length === 0) {
					listEl.innerHTML = '<p style="text-align:center; font-size:12px; color:#8a8a8a;">还没有人物...</p>';
				}
			}
		});

		// 为AI按钮添加占位提示
		document.getElementById('book-ai-magic-btn').addEventListener('click', () => alert('AI魔法棒功能将在里程碑2中实现！'));
		document.getElementById('ai-generate-characters-btn').addEventListener('click', () => alert('AI生成人物功能将在里程碑2中实现！'));
		document.getElementById('ai-generate-outline-btn').addEventListener('click', () => alert('AI生成大纲功能将在里程碑2中实现！'));
		// ▲▲▲ 事件绑定结束 ▲▲▲


        // --- 章节列表页事件 ---
        // ▼▼▼ 【任务3.D】重构章节列表页的全部事件监听器 ▼▼▼

		// --- 章节列表页事件 ---
		let sortableInstance = null; // 用于存储SortableJS的实例

		document.getElementById('mochao-back-to-bookshelf-btn').addEventListener('click', () => {
			activeBookId = null;
			showScreen('mochao-bookshelf-screen');
		});

		document.getElementById('mochao-create-chapter-btn').addEventListener('click', () => openChapterEditor());

		// “管理”按钮的点击事件
		document.getElementById('mochao-manage-chapters-btn').addEventListener('click', (e) => {
			const btn = e.target;
			const listEl = document.getElementById('mochao-chapter-list');
			const isManaging = listEl.classList.toggle('managing');

			if (isManaging) {
				btn.textContent = '完成';
				btn.style.fontWeight = 'bold';
				// 初始化拖拽功能
				sortableInstance = new Sortable(listEl, {
					animation: 150,
					handle: '.chapter-drag-handle', // 指定拖拽手柄
					ghostClass: 'sortable-ghost',
					onEnd: async (evt) => {
						// 拖拽结束后，更新数据库中的顺序
						const chapterElements = Array.from(listEl.querySelectorAll('.mochao-chapter-item'));
						const updates = chapterElements.map((el, index) => {
							return {
								key: parseInt(el.dataset.chapterId),
								changes: { order: index + 1 }
							};
						});
						await db.chapters.bulkUpdate(updates);
						// 重新渲染以更新章节序号
						await renderChapterList(activeBookId);
					},
				});
			} else {
				btn.textContent = '管理';
				btn.style.fontWeight = 'normal';
				// 销毁拖拽实例
				if (sortableInstance) {
					sortableInstance.destroy();
					sortableInstance = null;
				}
			}
			// 重新渲染列表以切换UI
			renderChapterList(activeBookId);
		});

		// 使用事件委托处理章节的点击和删除
		document.getElementById('mochao-chapter-list').addEventListener('click', async (e) => {
			const listEl = document.getElementById('mochao-chapter-list');
			
			// 如果是删除按钮
			if (e.target.classList.contains('chapter-delete-btn')) {
				const chapterId = parseInt(e.target.dataset.chapterId);
				const chapter = await db.chapters.get(chapterId);
				const confirmed = await showCustomConfirm('确认删除', `确定要删除章节《${chapter.title}》吗？`, { confirmButtonClass: 'btn-danger' });
				
				if (confirmed) {
					await db.transaction('rw', db.chapters, db.chapterComments, async () => {
						await db.chapterComments.where('chapterId').equals(chapterId).delete();
						await db.chapters.delete(chapterId);
					});
					// 重新渲染列表
					await renderChapterList(activeBookId);
				}
			} 
			// 如果不是管理模式，且点击的是列表项内容
			else if (!listEl.classList.contains('managing')) {
				const item = e.target.closest('.mochao-chapter-item');
				if (item) {
					const chapterId = parseInt(item.dataset.chapterId);
					await renderChapterReader(chapterId);
					showScreen('mochao-chapter-reader-screen');
				}
			}
		});
		// ▲▲▲ 重构结束 ▲▲▲



        // ▼▼▼ 【修复1】章节编辑器关闭按钮 ▼▼▼
		document.getElementById('editor-close-btn').addEventListener('click', async () => {
			// 弹出异步确认框
			const confirmed = await showCustomConfirm('确认关闭', '有未保存的更改，确定要放弃本次编辑吗？');
			if (confirmed) {
				// 如果用户确认放弃
				if (editingChapterId) {
					// 如果是编辑状态，则返回到该章节的阅读页
					await renderChapterReader(editingChapterId);
					showScreen('mochao-chapter-reader-screen');
				} else {
					// 如果是新建状态，则返回到章节列表页
					await renderChapterList(activeBookId);
					showScreen('mochao-chapter-list-screen');
				}
				// 重置编辑状态
				editingChapterId = null;
			}
		});
		// ▲▲▲ 修复结束 ▲▲▲
        document.getElementById('editor-save-btn').addEventListener('click', saveChapter);

        // --- 章节阅读页事件 ---
        document.getElementById('reader-back-btn').addEventListener('click', () => {
            activeChapterId = null;
            showScreen('mochao-chapter-list-screen');
        });
        document.getElementById('reader-edit-btn').addEventListener('click', () => openChapterEditor(activeChapterId));
        
		// ▼▼▼ 【任务2.C】为章节阅读页的导航按钮绑定事件 ▼▼▼

		// 左右切换按钮
		document.getElementById('reader-prev-btn').addEventListener('click', navigateChapter.bind(null, -1));
		document.getElementById('reader-next-btn').addEventListener('click', navigateChapter.bind(null, 1));

		// 点击中间的章节指示器，弹出跳转输入框
		document.getElementById('reader-chapter-indicator').addEventListener('click', async () => {
			const allChapters = await db.chapters.where('bookId').equals(activeBookId).toArray();
			const targetOrderStr = await showCustomPrompt('快速跳转', `请输入要跳转的章节序号 (1-${allChapters.length})`);
			const targetOrder = parseInt(targetOrderStr);

			if (!isNaN(targetOrder) && targetOrder > 0 && targetOrder <= allChapters.length) {
				const targetChapter = await db.chapters.where({ bookId: activeBookId, order: targetOrder }).first();
				if (targetChapter) {
					await renderChapterReader(targetChapter.id);
				}
			} else if (targetOrderStr !== null) {
				alert('请输入有效的章节序号！');
			}
		});

		/**
		 * 导航到上一章或下一章
		 * @param {number} direction - -1 表示上一章, 1 表示下一章
		 */
		async function navigateChapter(direction) {
			if (!activeBookId || !activeChapterId) return;
    
			const allChapters = await db.chapters.where('bookId').equals(activeBookId).sortBy('order');
			const currentIndex = allChapters.findIndex(c => c.id === activeChapterId);
    
			const nextIndex = currentIndex + direction;
    
			if (nextIndex >= 0 && nextIndex < allChapters.length) {
				await renderChapterReader(allChapters[nextIndex].id);
			}
		}
		// ▲▲▲ 新增事件绑定结束 ▲▲▲




        // --- 阅读外观设置弹窗事件 ---
        document.getElementById('reader-appearance-btn').addEventListener('click', () => {
            document.getElementById('appearance-font-size-slider').value = mochaoSettings.fontSize || 16;
            document.getElementById('appearance-font-size-value').textContent = `${mochaoSettings.fontSize || 16}px`;
            document.getElementById('mochao-appearance-modal').classList.add('visible');
        });
        document.getElementById('appearance-modal-close-btn').addEventListener('click', () => {
            document.getElementById('mochao-appearance-modal').classList.remove('visible');
        });
        // ▼▼▼ 【修复3】让字体大小滑块实时预览生效 ▼▼▼
		document.getElementById('appearance-font-size-slider').addEventListener('input', e => {
			const newSize = e.target.value;
			mochaoSettings.fontSize = newSize; // 更新内存中的设置
			document.getElementById('appearance-font-size-value').textContent = `${newSize}px`;
    
			// 核心修复：在这里调用 applyReaderAppearance 来实时刷新预览
			applyReaderAppearance();
		});
		// ▲▲▲ 修复结束 ▲▲▲
        document.querySelector('.appearance-bg-selector').addEventListener('click', e => {
            if(e.target.dataset.color) {
                mochaoSettings.bgColor = e.target.dataset.color;
                applyReaderAppearance(); // 实时预览
            }
        });
        document.getElementById('appearance-save-btn').addEventListener('click', async () => {
            await db.mochaoSettings.put({id: 'main', ...mochaoSettings});
            document.getElementById('mochao-appearance-modal').classList.remove('visible');
            alert('阅读外观已保存！');
        });

		// ▼▼▼ 【修复1.B】将总入口函数暴露到全局 ▼▼▼
		window.openMochaoApp = openMochaoApp;
		// ▲▲▲ 新增结束 ▲▲▲
    }

    // 将初始化函数暴露到全局，以便主HTML文件可以调用
    window.initializeMochaoApp = initializeMochaoApp;
});
// ========= END OF FILE mochao.js =========