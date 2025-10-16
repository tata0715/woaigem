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


// ▼▼▼ 【终极修复 V3 | showCustomAlert 完整版】 ▼▼▼
function showCustomAlert(title, message) {
    return new Promise(resolve => {
        // 【【【这就是缺失的关键代码！！！】】】
        const modalOverlay = document.getElementById('custom-modal-overlay');
        const modalTitle = document.getElementById('custom-modal-title');
        const modalBody = document.getElementById('custom-modal-body');
        const confirmBtn = document.getElementById('custom-modal-confirm');
        const cancelBtn = document.getElementById('custom-modal-cancel');
        // 【【【修复结束】】】

        modalTitle.textContent = title;
        modalBody.innerHTML = `<p style="text-align: left; white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</p>`;
        cancelBtn.style.display = 'none';
        confirmBtn.textContent = '好的';

        // 使用克隆节点技巧，确保每次绑定的都是新事件
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        newConfirmBtn.onclick = () => {
            modalOverlay.classList.remove('visible');
            cancelBtn.style.display = 'block'; // 恢复取消按钮，为其他弹窗做准备
            resolve(true); 
        };
        modalOverlay.classList.add('visible');
    });
}
// ▲▲▲ 终极修复结束 ▲▲▲

// ▼▼▼ 【终极修复】彻底重写 showCustomPrompt 函数以支持 textarea ▼▼▼
function showCustomPrompt(title, placeholder, initialValue = '', type = 'text') {
    return new Promise(resolve => {
        const modalOverlay = document.getElementById('custom-modal-overlay');
        const modalTitle = document.getElementById('custom-modal-title');
        const modalBody = document.getElementById('custom-modal-body');
        const confirmBtn = document.getElementById('custom-modal-confirm');
        const cancelBtn = document.getElementById('custom-modal-cancel');
        
        const inputId = 'custom-prompt-input';
        modalTitle.textContent = title;

        // 【【【核心修复逻辑！！！】】】
        let inputHtml = '';
        if (type === 'textarea') {
            // 如果类型是 'textarea'，就生成一个 <textarea> 标签
            inputHtml = `<textarea id="${inputId}" placeholder="${placeholder}" rows="6" style="width: 100%; min-height: 150px; resize: vertical; border: 1px solid #ccc; border-radius: 6px; padding: 8px; font-size: 16px; box-sizing: border-box;">${initialValue}</textarea>`;
        } else {
            // 否则，才生成 <input> 标签
            inputHtml = `<input type="${type}" id="${inputId}" placeholder="${placeholder}" value="${initialValue}">`;
        }
        
        modalBody.innerHTML = inputHtml;
        // 【【【修复结束】】】
        
        const input = document.getElementById(inputId);

        // 重新绑定事件，防止旧监听器残留
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
// ▲▲▲ 终极修复结束 ▲▲▲

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


// ▼▼▼ 【优化1.A】创建CSS注入函数 ▼▼▼
/**
 * 动态将“墨巢”App的所有专属CSS样式注入到主DOM的<head>中。
 */
function injectMochaoCSS() {
    // 1. 定义所有CSS规则
    const mochaoAppCSS = `
        /* ▼▼▼ 【全新】这是“墨巢”App的【全部CSS样式】 ▼▼▼ */

			/* --- 书架页面 --- */
			#mochao-bookshelf-screen .list-container {
				padding: 15px;
				display: grid;
				grid-template-columns: 1fr; /* 每行一个，手机端更清晰 */
				gap: 15px;
			}
			.mochao-book-card {
				background-color: var(--secondary-bg);
				border-radius: 12px;
				box-shadow: 0 4px 12px rgba(0,0,0,0.08);
				display: flex;
				padding: 15px;
				gap: 15px;
				cursor: pointer;
				transition: transform 0.2s, box-shadow 0.2s;
			}
			.mochao-book-card:hover {
				transform: translateY(-5px);
				box-shadow: 0 8px 20px rgba(0,0,0,0.12);
			}
			.book-card-cover {
				width: 80px;
				height: 110px;
				border-radius: 8px;
				background-size: cover;
				background-position: center;
				flex-shrink: 0;
				background-color: #e9ecef;
			}
			.book-card-info {
				display: flex;
				flex-direction: column;
				overflow: hidden;
			}
			.book-card-title {
				font-size: 16px;
				font-weight: 600;
				margin: 0 0 8px 0;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
			.book-card-synopsis {
				font-size: 13px;
				color: var(--text-secondary);
				margin: 0 0 8px 0;
				line-height: 1.5;
				flex-grow: 1;
			}
			.book-card-meta {
				font-size: 12px;
				color: #b0b0b0;
				margin: 0;
			}

			/* --- 章节编辑/阅读页 --- */
			#mochao-chapter-editor-screen .form-container {
				display: flex;
				flex-direction: column;
				padding: 15px;
				gap: 15px;
			}
			#mochao-chapter-editor-screen .form-group {
				margin: 0;
				display: flex;
				flex-direction: column;
			}
			#mochao-chapter-editor-screen textarea {
				min-height: 120px;
				font-size: 16px;
				line-height: 1.6;
			}
			#editor-content-input {
				flex-grow: 1; /* 让正文区域占据最多空间 */
			}
			#mochao-chapter-editor-screen .editor-bottom-bar {
				flex-shrink: 0;
				padding: 10px 15px;
				padding-bottom: calc(10px + env(safe-area-inset-bottom));
				border-top: 1px solid var(--border-color);
				background-color: rgba(247, 247, 247, 0.9);
				backdrop-filter: blur(10px);
				display: flex;
				gap: 10px;
			}

			#mochao-chapter-reader-screen .list-container {
				padding: 20px;
				font-size: 16px;
				line-height: 1.8;
			}
			#reader-chapter-title {
				font-size: 22px;
				font-weight: bold;
				margin-bottom: 20px;
				padding-bottom: 15px;
				border-bottom: 1px solid var(--border-color);
			}
			#reader-author-note, #reader-summary {
				background-color: rgba(0,0,0,0.05);
				padding: 15px;
				border-radius: 8px;
				margin-top: 25px;
				font-size: 0.9em;
				color: var(--text-secondary);
			}
			#reader-author-note::before, #reader-summary::before {
				display: block;
				font-weight: 600;
				margin-bottom: 8px;
				color: var(--text-primary);
			}
			#reader-author-note::before { content: '作者的话'; }
			#reader-summary::before { content: '本章摘要'; }

			/* --- 阅读外观设置弹窗 --- */
			.appearance-bg-selector {
				display: flex;
				gap: 10px;
				margin-top: 10px;
			}
			.bg-color-option {
				width: 40px;
				height: 40px;
				border-radius: 50%;
				cursor: pointer;
				border: 2px solid var(--border-color);
			}
			/* ▲▲▲ “墨巢”App CSS样式结束 ▲▲▲ */

			/* ▼▼▼ 【任务3.B | V4版终极视觉修复】章节管理模式CSS ▼▼▼ */

			/* 1. 【核心】为我们全新的 .mochao-chapter-item 设置正确的Flex布局 */
			.mochao-chapter-item {
				display: flex;
				align-items: center; /* 垂直居中对齐：手柄、内容、删除按钮 */
				gap: 15px; /* 在元素之间创建间距 */
				padding: 12px 20px;
				border-bottom: 1px solid var(--border-color);
				cursor: pointer; /* 普通模式下可点击 */
			}
			.mochao-chapter-item:last-child {
				border-bottom: none;
			}

			/* 2. 中间的内容区：自动撑满，内部垂直堆叠标题和摘要 */
			.mochao-chapter-item .list-item-content {
				flex-grow: 1; /* 占据所有可用空间，将删除按钮推到最右侧 */
				display: flex;
				flex-direction: column; /* 让标题和摘要上下排列 */
				justify-content: center;
				min-width: 0;
			}

			.mochao-chapter-item .item-content {
				font-size: 13px; /* 摘要字号稍小 */
				color: var(--text-secondary); /* 【核心】使用次要文字颜色，让它变浅！ */
			}

			/* 3. 拖拽手柄：默认隐藏 */
			.mochao-chapter-item .chapter-drag-handle {
				display: none;
				cursor: grab;
				color: var(--text-secondary);
				font-size: 20px;
			}

			/* 4. 删除按钮：默认隐藏 */
			.mochao-chapter-item .chapter-delete-btn {
				display: none;
				background-color: #ff3b30;
				color: white;
				width: 24px;
				height: 24px;
				border-radius: 50%;
				border: none;
				font-weight: bold;
				font-size: 16px;
				line-height: 24px;
				text-align: center;
				cursor: pointer;
				flex-shrink: 0;
			}

			/* 5. 【核心逻辑】当进入管理模式时... */
			#mochao-chapter-list.managing .mochao-chapter-item {
				cursor: default; /* ...移除点击手势 */
			}
			#mochao-chapter-list.managing .mochao-chapter-item .chapter-drag-handle {
				display: block; /* ...显示拖拽手柄 */
			}
			#mochao-chapter-list.managing .mochao-chapter-item .chapter-delete-btn {
				display: block; /* ...显示删除按钮 */
			}
			#mochao-chapter-list.managing .mochao-chapter-item .list-item-content {
				pointer-events: none; /* ...禁止点击内容区 */
			}

			/* 6. 拖拽过程中的占位符样式 (保持不变) */
			.sortable-ghost {
				opacity: 0.4;
				background-color: #e7f3ff;
			}
			/* ▲▲▲ 视觉修复结束 ▲▲▲ */

			/* ▼▼▼ 【优化2 & 3】为“墨巢”App添加夜间模式和字体支持 ▼▼▼ */

			/* 核心：当主屏幕有 .dark-mode 时，墨巢的屏幕也应用暗色主题 */
			#phone-screen.dark-mode .mochao-app-screen {
				--secondary-bg: #1c1c1e; /* 卡片、输入框背景 */
				--border-color: #38383a;  /* 边框颜色 */
				--text-primary: #ffffff;   /* 主要文字颜色 */
				--text-secondary: #8d8d92; /* 次要文字颜色 */
				background-color: #000000; /* 屏幕主背景 */
			}

			/* 字体应用：让墨巢的所有屏幕都继承body的字体设置 */
			.mochao-app-screen {
				font-family: inherit;
			}

			/* 夜间模式下的各种UI元素颜色适配 */
			#phone-screen.dark-mode .mochao-book-card,
			#phone-screen.dark-mode .preset-item,
			#phone-screen.dark-mode .tag-item,
			#phone-screen.dark-mode #mochao-filter-tags-list label {
				background-color: var(--secondary-bg);
				border-color: var(--border-color);
			}
			#phone-screen.dark-mode #mochao-chapter-reader-screen {
				background-color: var(--secondary-bg); /* 阅读页背景也同步 */
			}
			#phone-screen.dark-mode .mochao-book-card-title {
				color: var(--text-primary);
			}
			/* ▲▲▲ 新增CSS结束 ▲▲▲ */

			/* ▼▼▼ 【任务3.5 & 4.B】为“墨巢”设置页和筛选功能添加CSS ▼▼▼ */

			/* --- 设置页 --- */
			.settings-header {
				margin-top: 25px;
				margin-bottom: 15px;
				padding-bottom: 8px;
				border-bottom: 1px solid var(--border-color);
				font-size: 16px;
				color: var(--text-primary);
			}
			.settings-header:first-of-type {
				margin-top: 0;
			}
			#mochao-style-presets-list, #mochao-tags-list {
				display: flex;
				flex-direction: column;
				gap: 8px;
			}
			.preset-item, .tag-item {
				display: flex;
				align-items: center;
				justify-content: space-between;
				background-color: #f0f2f5;
				padding: 8px 12px;
				border-radius: 6px;
				font-size: 14px;
			}
			.preset-item .delete-btn, .tag-item .delete-btn {
				cursor: pointer;
				color: #ff3b30;
				font-weight: bold;
			}

			/* --- 筛选弹窗 --- */
			#mochao-filter-tags-list label {
				display: inline-flex;
				align-items: center;
				background-color: #f0f2f5;
				padding: 6px 12px;
				border-radius: 15px;
				cursor: pointer;
				font-size: 14px;
				transition: all 0.2s ease;
			}
			#mochao-filter-tags-list input[type="checkbox"] {
				display: none;
			}
			#mochao-filter-tags-list input[type="checkbox"]:checked + span {
				background-color: var(--accent-color);
				color: white;
				font-weight: 500;
			}
			#mochao-filter-tags-list label span {
				padding: 6px 12px;
				margin: -6px -12px;
				border-radius: 15px;
				transition: all 0.2s ease;
			}
			/* ▲▲▲ 新增CSS结束 ▲▲▲ */
			/* ▼▼▼ 【优化4.B】书架卡片新增样式 ▼▼▼ */
			.book-card-author {
				font-size: 13px;
				font-weight: 500;
				color: var(--text-secondary);
				margin: 0 0 8px 0;
			}
			.book-card-tags {
				margin-bottom: 8px;
				display: flex;
				flex-wrap: wrap;
				gap: 6px;
			}
			.book-card-tags span {
				font-size: 11px;
				background-color: #e7f3ff;
				color: var(--accent-color);
				padding: 2px 6px;
				border-radius: 8px;
			}
			#phone-screen.dark-mode .book-card-tags span {
				background-color: rgba(0, 123, 255, 0.2);
			}

			/* ▼▼▼ 【修复3.A】完善“墨巢”设置页的夜间模式 ▼▼▼ */
			#phone-screen.dark-mode #mochao-settings-screen .form-container {
				background-color: #000000;
			}
			#phone-screen.dark-mode .settings-header {
				color: var(--text-primary);
				border-bottom-color: var(--border-color);
			}
			#phone-screen.dark-mode .preset-item,
			#phone-screen.dark-mode .tag-item {
				background-color: #2c2c2e;
			}
			/* ▲▲▲ 修复结束 ▲▲▲ */
			/* ▲▲▲ 新增CSS结束 ▲▲▲ */
    `;

    // 2. 创建一个新的<style>标签
    const styleElement = document.createElement('style');
    styleElement.id = 'mochao-app-styles'; // 给它一个ID，方便管理
    styleElement.textContent = mochaoAppCSS;

    // 3. 将<style>标签注入到<head>中
    document.head.appendChild(styleElement);
}
// ▲▲▲ 新增函数结束 ▲▲▲


// ▼▼▼ 【优化1.B】立即执行CSS注入 ▼▼▼
injectMochaoCSS();
// ▲▲▲ 新增结束 ▲▲▲


/**
 * 动态将“墨巢”App的所有HTML结构和专属模态框注入到主DOM中。
 * 这个函数会在JS文件加载后立即执行。
 */
function injectMochaoHTML() {
    // 1. 定义所有HTML结构
    const mochaoAppHTML = `
        <!-- ▼▼▼ 【全新】这是“墨巢”App的【全部HTML屏幕】 ▼▼▼ -->

		<!-- ▼▼▼ 【修复1.A | 终极版】修正书架页HTML结构 ▼▼▼ -->
		<!-- 1. 书架主屏幕 -->
		<div id="mochao-bookshelf-screen" class="screen mochao-app-screen">
			<div class="header">
				<span class="back-btn" onclick="showScreen('home-screen')">‹</span>
				<span>墨巢</span>
				<div class="header-actions">
					<!-- 【核心】将所有按钮都预置在这里 -->
					<span class="action-btn" id="mochao-filter-btn" title="筛选">🔍</span>
					<span class="action-btn" id="mochao-import-txt-btn" title="导入TXT">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
					</span>
					<span class="action-btn" id="mochao-settings-btn" title="墨巢设置">⚙️</span>
				</div>
			</div>
			<div id="mochao-bookshelf-list" class="list-container">
				<!-- 书本卡片将由JS动态生成 -->
			</div>
			<button id="mochao-create-book-btn" class="form-button" style="position: absolute; bottom: calc(20px + env(safe-area-inset-bottom)); right: 20px; width: 56px; height: 56px; border-radius: 50%; font-size: 32px; padding: 0; line-height: 56px;">+</button>
		</div>
		<!-- ▲▲▲ 修复结束 ▲▲▲ -->
        <!-- 2. 章节列表页 (V1.1版，已添加管理功能) -->
		<div id="mochao-chapter-list-screen" class="screen mochao-app-screen">
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
		<div id="mochao-chapter-editor-screen" class="screen mochao-app-screen">
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
        <div id="mochao-chapter-reader-screen" class="screen mochao-app-screen">
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
					<!-- 标签选择 -->
					<div class="form-group">
						<label>类型/标签</label>
						<div class="custom-multiselect" id="book-tags-selector">
							<div class="select-box">
								<span class="selected-options-text">-- 点击选择或输入新标签 --</span>
								<span class="arrow-down">▼</span>
							</div>
							<div class="checkboxes-container"></div>
						</div>
					</div>
					<!-- 文风选择 -->
					<div class="form-group">
						<label for="book-style-prompt-select">文风</label>
						<select id="book-style-prompt-select">
							<option value="">-- 选择一个预设 --</option>
							<option value="custom">自定义...</option>
						</select>
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

		<!-- ▼▼▼ 【任务3.5 & 4.A】新增“设置页”和“筛选弹窗”的HTML ▼▼▼ -->

		<!-- 5. 墨巢专属设置页 -->
		<div id="mochao-settings-screen" class="screen mochao-app-screen">
			<div class="header">
				<span class="back-btn" id="mochao-settings-back-btn">‹</span>
				<span>墨巢设置</span>
				<span class="save-btn" id="mochao-settings-save-btn">保存</span>
			</div>
			<div class="form-container" style="padding: 15px;">
				<h3 class="settings-header">外观设置</h3>
				<div class="form-group">
					<label for="mochao-theme-select">主题模式</label>
					<select id="mochao-theme-select">
						<option value="light">日间模式</option>
						<option value="dark">夜间模式</option>
						<option value="system">跟随系统</option>
					</select>
				</div>
				<div class="form-group">
					<label for="mochao-font-url-input">全局阅读字体 URL (.ttf, .woff)</label>
					<input type="text" id="mochao-font-url-input" placeholder="留空则使用App默认字体">
				</div>

				<h3 class="settings-header">创作设置</h3>
				<div class="form-group">
					<label>文风预设管理</label>
					<div id="mochao-style-presets-list"></div>
					<div style="display: flex; gap: 10px; margin-top: 10px;">
						<input type="text" id="new-style-preset-name-input" placeholder="预设名称 (如: 古龙风)" style="flex-grow: 1;">
						<button id="add-style-preset-btn" class="form-button-secondary" style="margin:0; padding: 0 15px;">添加</button>
					</div>
				</div>
				<div class="form-group">
					<label>标签池管理</label>
					<div id="mochao-tags-list"></div>
					<div style="display: flex; gap: 10px; margin-top: 10px;">
						<input type="text" id="new-tag-input" placeholder="输入新标签..." style="flex-grow: 1;">
						<button id="add-tag-btn" class="form-button-secondary" style="margin:0; padding: 0 15px;">添加</button>
					</div>
				</div>

				<h3 class="settings-header">数据管理</h3>
				<div class="form-group" style="display: flex; gap: 10px;">
					<button id="mochao-export-btn" class="form-button form-button-secondary" style="margin:0; flex: 1;">导出全部墨巢数据</button>
					<button id="mochao-import-btn" class="form-button form-button-secondary" style="margin:0; flex: 1;">导入墨巢数据</button>
					<input type="file" id="mochao-import-input" accept=".json" hidden>
				</div>
			</div>
		</div>

		<!-- 6. 标签筛选模态框 -->
		<div id="mochao-filter-modal" class="modal">
			<div class="modal-content" style="height: auto; max-height: 60%;">
				<div class="modal-header">
					<span>按标签筛选</span>
				</div>
				<div class="modal-body">
					<div id="mochao-filter-tags-list" style="display: flex; flex-wrap: wrap; gap: 10px; padding: 10px;">
						<!-- 标签将由JS动态生成 -->
					</div>
				</div>
				<div class="modal-footer" style="justify-content: space-between;">
					<button class="cancel" id="mochao-filter-reset-btn" style="width: 30%;">重置</button>
					<button class="cancel" id="mochao-filter-cancel-btn" style="width: 30%;">取消</button>
					<button class="save" id="mochao-filter-apply-btn" style="width: 30%;">应用</button>
				</div>
			</div>
		</div>


		<!-- ▼▼▼ 【任务5.C | V3版终极简化】TXT导入与分章模态框 ▼▼▼ -->
		<div id="mochao-import-txt-modal" class="modal">
			<div class="modal-content" style="height: 90%; width: 95%;">
				<div class="modal-header">
					<span>TXT导入与分章</span>
				</div>
				<div class="modal-body" style="display: flex; flex-direction: column;">
					<!-- 编码选择 -->
					<div class="form-group" style="flex-shrink: 0;">
						<label for="txt-encoding-select">第一步：选择编码格式</label>
						<select id="txt-encoding-select">
							<option value="utf-8">UTF-8 (通用)</option>
							<option value="gbk">GBK (旧版TXT)</option>
						</select>
					</div>
					<!-- 【核心修改】正则表达式输入框 -->
					<div class="form-group" style="flex-shrink: 0;">
						<label for="custom-split-rule-input">第二步：编辑分章规则 (正则表达式)</label>
						<input type="text" id="custom-split-rule-input" placeholder="在此输入或修改用于识别章节标题的正则表达式...">
						<p style="font-size: 12px; color: #888; margin-top: 5px;">实时预览结果: 已找到 <strong id="split-preview-count">0</strong> 个章节</p>
						<!-- 【【【核心新增！！！】】】 -->
						<button id="apply-split-rule-btn" class="form-button-secondary" style="margin:0; padding: 0 15px;">应用规则</button>
					</div>
					<!-- 预览区 -->
					<div class="form-group" style="flex-grow: 1; display: flex; flex-direction: column;">
						<label>第三步：预览原文 (不可编辑)</label>
						<textarea id="txt-preview-area" style="flex-grow: 1; width: 100%; font-size: 12px; background-color: #f0f2f5;" readonly></textarea>
					</div>
				</div>
				<div class="modal-footer">
					<button class="cancel" id="cancel-txt-import-btn">取消</button>
					<button class="save" id="confirm-txt-import-btn">确认导入</button>
				</div>
			</div>
		</div>
		<input type="file" id="mochao-txt-file-input" accept=".txt" hidden>
		<!-- ▲▲▲ 新增HTML结束 ▲▲▲ -->

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
	let activeMochaoFilters = [];

    // ===================================================================
    // 2. 核心功能函数
    // ===================================================================

    /**
     * 渲染书架主屏幕
     */
	// ▼▼▼ 【任务3.5 & 4.D】重构及新增所有相关JS函数 ▼▼▼

	/**
	 * 【V2版 | 支持筛选】渲染书架主屏幕
	 */
	async function renderBookshelf() {
		const bookshelfEl = document.getElementById('mochao-bookshelf-list');
		bookshelfEl.innerHTML = '';
		const allBooks = await db.books.orderBy('lastModified').reverse().toArray();

		// 根据激活的筛选器过滤书本
		const booksToRender = (activeMochaoFilters.length === 0)
			? allBooks
			: allBooks.filter(book => book.tags && book.tags.some(tag => activeMochaoFilters.includes(tag)));

		if (booksToRender.length === 0) {
			const message = activeMochaoFilters.length > 0
				? '没有找到符合筛选条件的书本'
				: '书架空空如也，点击右下角“+”<br>开始创作你的第一本书吧！';
			bookshelfEl.innerHTML = `<p style="text-align:center; color: var(--text-secondary); padding: 50px 0;">${message}</p>`;
		} else {
			// ▼▼▼ 【任务1 & BUG修复 | 终极版】在渲染时直接为每个元素绑定事件 ▼▼▼
			for (const book of booksToRender) {
				const wordCount = await db.chapters.where('bookId').equals(book.id).toArray().then(chapters =>
					chapters.reduce((sum, chap) => sum + (chap.content || '').length, 0)
				);

				const item = document.createElement('div');
				item.className = 'mochao-book-card';
				item.dataset.bookId = book.id;
				// ▼▼▼ 【优化4】增强书架卡片信息显示 ▼▼▼
				const tagsHtml = (book.tags && book.tags.length > 0)
					? `<div class="book-card-tags">${book.tags.map(tag => `<span>#${tag}</span>`).join(' ')}</div>`
					: '';

				item.innerHTML = `
					<div class="book-card-cover" style="background-image: url(${book.coverImage || 'https://i.postimg.cc/pT2xKzPz/album-cover-placeholder.png'})"></div>
					<div class="book-card-info">
						<h3 class="book-card-title">${book.name}</h3>
						<p class="book-card-author">${book.authorName || '匿名作者'}</p>
						<p class="book-card-synopsis">${(book.synopsis || '暂无简介').substring(0, 30)}...</p>
						${tagsHtml}
						<p class="book-card-meta">字数: ${wordCount}</p>
					</div>
				`;
				// ▲▲▲ 优化结束 ▲▲▲

				// 【【【核心修复！！！】】】
				// 我们在这里为【每一个】新创建的卡片，独立绑定它自己的单击和长按事件。

				// 1. 定义好这个卡片专属的单击操作
				const clickAction = () => {
					const bookId = parseInt(item.dataset.bookId);
					renderChapterList(bookId);
					showScreen('mochao-chapter-list-screen');
				};
				
				// 2. 定义好这个卡片专属的长按操作
				const longPressAction = () => {
					const bookId = parseInt(item.dataset.bookId);
					const bookName = item.querySelector('.book-card-title').textContent;
					showBookActions(bookId, bookName);
				};

				// 3. 使用我们健壮的事件处理器，将两个操作绑定到这个卡片上
				addClickAndLongPress(item, clickAction, longPressAction);

				bookshelfEl.appendChild(item);
			}
			// ▲▲▲ 修复结束 ▲▲▲
		}
		// ▼▼▼ 【修复1.C】将更新筛选按钮状态的逻辑移动到正确的位置 ▼▼▼
		const filterBtn = document.getElementById('mochao-filter-btn');
		if (filterBtn) { // 添加一个安全检查
			filterBtn.style.color = activeMochaoFilters.length > 0 ? 'var(--accent-color)' : 'inherit';
		}
		// ▲▲▲ 修复结束 ▲▲▲
	}

	/**
	 * 【全新】打开墨巢专属设置页面
	 */
	async function openMochaoSettings() {
		// 加载当前设置到UI
		document.getElementById('mochao-font-url-input').value = mochaoSettings.fontUrl || '';
		
		// 渲染文风和标签列表
		await renderStylePresetsList();
		await renderTagsList();

		showScreen('mochao-settings-screen');
	}

	/**
	 * 【全新】渲染文风预设列表
	 */
	async function renderStylePresetsList() {
		const listEl = document.getElementById('mochao-style-presets-list');
		listEl.innerHTML = '';
		mochaoSettings.stylePresets = mochaoSettings.stylePresets || [];
		mochaoSettings.stylePresets.forEach((preset, index) => {
			const item = document.createElement('div');
			item.className = 'preset-item';
			item.innerHTML = `
				<span>${preset.name}</span>
				<span class="delete-btn" data-index="${index}">×</span>
			`;
			// 点击预设名称可以查看/编辑内容
			// ▼▼▼ 【优化1】文风预设改为多行输入 ▼▼▼
			item.querySelector('span').addEventListener('click', async () => {
				// 【核心修改】将 showCustomPrompt 的最后一个参数改为 'textarea'
				const newContent = await showCustomPrompt(`编辑文风预设“${preset.name}”`, '请输入该文风的具体描述/Prompt:', preset.content, 'textarea');
				if (newContent !== null) {
					preset.content = newContent;
					alert('已更新，请稍后点击右上角“保存”以生效。');
				}
			});
			// ▲▲▲ 优化结束 ▲▲▲
			listEl.appendChild(item);
		});
	}

	/**
	 * 【全新】渲染标签池列表
	 */
	async function renderTagsList() {
		const listEl = document.getElementById('mochao-tags-list');
		listEl.innerHTML = '';
		mochaoSettings.userTags = mochaoSettings.userTags || [];
		mochaoSettings.userTags.forEach((tag, index) => {
			const item = document.createElement('div');
			item.className = 'tag-item';
			item.innerHTML = `
				<span>#${tag}</span>
				<span class="delete-btn" data-index="${index}">×</span>
			`;
			listEl.appendChild(item);
		});
	}

	/**
	 * 【全新】打开标签筛选模态框
	 */
	async function openMochaoFilterModal() {
		const listEl = document.getElementById('mochao-filter-tags-list');
		listEl.innerHTML = '';

		const allBooks = await db.books.toArray();
		const allTags = new Set();
		allBooks.forEach(book => {
			if (book.tags) book.tags.forEach(tag => allTags.add(tag));
		});

		if (allTags.size === 0) {
			listEl.innerHTML = '<p style="color: var(--text-secondary);">还没有任何书本标签可供筛选。</p>';
		} else {
			Array.from(allTags).sort().forEach((tag, index) => {
				const isChecked = activeMochaoFilters.includes(tag);
				const label = document.createElement('label');
				const inputId = `mochao-filter-tag-${index}`;
				label.setAttribute('for', inputId);
				label.innerHTML = `
					<input type="checkbox" id="${inputId}" value="${tag}" ${isChecked ? 'checked' : ''}>
					<span>${tag}</span>
				`;
				listEl.appendChild(label);
			});
		}
		document.getElementById('mochao-filter-modal').classList.add('visible');
	}


	// ▲▲▲ 重构结束 ▲▲▲
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

// ▼▼▼ 【修复2 & 5 | 终极版】重构书本编辑器相关的所有JS函数与事件 ▼▼▼

/**
 * 打开书本编辑器（V5版，AI按钮已恢复）
 */
async function openBookEditor(bookId = null) {
    const modal = document.getElementById('mochao-book-editor-modal');
    const aiBtn = document.getElementById('book-ai-magic-btn');
    const isNewBook = !bookId;
    
    // 清空旧的人物列表
    document.getElementById('book-characters-list').innerHTML = '';
    
    // 动态填充文风选择器
    const styleSelect = document.getElementById('book-style-prompt-select');
    styleSelect.innerHTML = '<option value="">-- 选择一个预设 --</option>';
    (mochaoSettings.stylePresets || []).forEach(preset => {
        styleSelect.innerHTML += `<option value="${preset.content}">${preset.name}</option>`;
    });
    styleSelect.innerHTML += '<option value="custom">自定义...</option>';

    if (!isNewBook) {
        const book = await db.books.get(bookId);
        if (!book) return;
        modal.dataset.editingId = bookId;
        document.getElementById('book-editor-title').textContent = '编辑书本信息';
        aiBtn.style.display = 'none'; // 编辑模式隐藏一键润色

        document.getElementById('book-name-input').value = book.name || '';
        document.getElementById('book-author-input').value = book.authorName || '';
        document.getElementById('book-author-persona-input').value = book.authorPersona || '';
        document.getElementById('book-synopsis-input').value = book.synopsis || '';
        styleSelect.value = book.stylePrompt || '';
        document.getElementById('book-outline-input').value = book.outline ? JSON.stringify(book.outline, null, 2) : '[]';
        
        await setupTagsSelector(book.tags || []);
        renderCharacterSheets(book.characterSheets || []);

    } else {
        modal.dataset.editingId = '';
        document.getElementById('book-editor-title').textContent = '创建新书';
        aiBtn.style.display = 'block';
        
        ['book-name-input', 'book-author-input', 'book-author-persona-input', 'book-synopsis-input'].forEach(id => document.getElementById(id).value = '');
        styleSelect.value = '';
        document.getElementById('book-outline-input').value = '[]';
        
        await setupTagsSelector([]);
        renderCharacterSheets([]);
    }
    updateBookTagsSelectionDisplay();
    modal.classList.add('visible');
}

/**
 * 【全新】设置标签选择器
 */
async function setupTagsSelector(currentTags = []) {
    const tagsContainer = document.getElementById('book-tags-selector').querySelector('.checkboxes-container');
    tagsContainer.innerHTML = '';
    const allTags = new Set(mochaoSettings.userTags || []);
    currentTags.forEach(tag => allTags.add(tag));

    Array.from(allTags).sort().forEach(tag => {
        const isChecked = currentTags.includes(tag);
        tagsContainer.innerHTML += `<label><input type="checkbox" value="${tag}" ${isChecked ? 'checked' : ''}> ${tag}</label>`;
    });
    tagsContainer.innerHTML += '<input type="text" id="new-tag-input-in-editor" placeholder="输入并回车添加新标签..." style="width: 90%; margin: 5px 5%; padding: 5px; border: 1px solid #ccc;">';
}



/**
 * 保存书本信息（V4版，最终版）
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
    
    // 从DOM中重新收集人物卡信息
    const characterSheets = Array.from(document.querySelectorAll('#book-characters-list .existing-group-item')).map(item => ({
        name: item.dataset.name,
        description: item.dataset.description
    }));
    
    const selectedTags = Array.from(document.querySelectorAll('#book-tags-selector input[type="checkbox"]:checked')).map(cb => cb.value);
    const stylePrompt = document.getElementById('book-style-prompt-select').value;
    
    const bookData = {
        name: name,
        authorName: document.getElementById('book-author-input').value.trim(),
        authorPersona: document.getElementById('book-author-persona-input').value.trim(),
        tags: selectedTags,
        stylePrompt: stylePrompt,
        synopsis: document.getElementById('book-synopsis-input').value.trim(),
        outline: outline,
        characterSheets: characterSheets,
        lastModified: Date.now()
    };

    if (bookId) {
        await db.books.update(bookId, bookData);
    } else {
        bookData.coverImage = '';
        await db.books.add(bookData);
    }
    
    modal.classList.remove('visible');
    await renderBookshelf();
}

// 标签选择器的显示逻辑（保持不变）
function updateBookTagsSelectionDisplay() {
    const container = document.getElementById('book-tags-selector');
    const checkedBoxes = container.querySelectorAll('input:checked');
    const displayText = container.querySelector('.selected-options-text');
    if (checkedBoxes.length === 0) {
        displayText.textContent = '-- 点击选择或输入新标签 --';
    } else if (checkedBoxes.length > 2) {
        displayText.textContent = `已选择 ${checkedBoxes.length} 个标签`;
    } else {
        displayText.textContent = Array.from(checkedBoxes).map(cb => cb.value).join(', ');
    }
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

// ▼▼▼ 【优化4】为添加人物功能增加“从已有角色选择”的选项 ▼▼▼
async function addCharacterManually() {
    // 1. 获取所有可选的单聊角色
    const existingChars = Object.values(state.chats).filter(c => !c.isGroup);
    
    // 2. 构建选项数组
    const options = [
        { text: '✍️ 手动创建新人物', value: 'manual' },
        ...existingChars.map(char => ({
            text: `👤 选择已有角色: ${char.name}`,
            value: char.id // 使用角色的唯一ID作为返回值
        }))
    ];

    // 3. 弹出选择菜单
    const choice = await showChoiceModal('添加主要人物', options);

    let name, description;

    if (choice === 'manual') {
        // 如果选择手动创建，执行原有逻辑
        name = await showCustomPrompt("添加人物", "请输入人物姓名：");
        if (!name || !name.trim()) return;
        description = await showCustomPrompt(`人物“${name}”的设定`, "请输入该人物的简介/设定：", "", "textarea");
        if (description === null) return;

    } else if (choice) {
        // 如果选择了一个已有的角色ID
        const selectedChar = state.chats[choice];
        if (selectedChar) {
            name = selectedChar.name;
            description = selectedChar.settings.aiPersona;
        }
    } else {
        // 用户点击了取消
        return;
    }
    
    // 后续的DOM操作逻辑保持不变
    if (name) {
        const listEl = document.getElementById('book-characters-list');
        if(listEl.querySelector('p')) listEl.innerHTML = '';
        const item = document.createElement('div');
        item.className = 'existing-group-item';
        item.dataset.name = name.trim();
        item.dataset.description = description || '';
        item.innerHTML = `
            <span class="group-name" title="${description || ''}">${name.trim()}</span>
            <span class="delete-group-btn">×</span>
        `;
        listEl.appendChild(item);
    }
}
// ▲▲▲ 优化结束 ▲▲▲



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
        case 'share':
            alert('分享功能将在后续里程碑中实现！');
            break;
        case 'delete':
            deleteBook(bookId, bookName);
            break;
		case 'export':
			await exportBookAsTxt(bookId);
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


// ▼▼▼ 【任务5.A】TXT导出核心函数 ▼▼▼

/**
 * 将指定的书本导出为 .txt 文件
 * @param {number} bookId
 */
async function exportBookAsTxt(bookId) {
    const book = await db.books.get(bookId);
    if (!book) {
        alert('错误：找不到要导出的书本。');
        return;
    }

    await showCustomAlert("请稍候...", `正在为您打包《${book.name}》...`);

    const chapters = await db.chapters.where('bookId').equals(bookId).sortBy('order');
    let fileContent = '';

    // 1. 添加书本元信息
    fileContent += `【书名】：${book.name}\n`;
    fileContent += `【作者】：${book.authorName || '未设置'}\n`;
    fileContent += `【简介】：\n${book.synopsis || '暂无'}\n\n`;
    fileContent += `------------------------------\n\n`;

    // 2. 逐一添加章节内容
    for (const chapter of chapters) {
        fileContent += `【第${chapter.order}章：${chapter.title}】\n\n`;
        
        if (chapter.content) {
            fileContent += `${chapter.content}\n\n`;
        }
        if (chapter.authorNote) {
            fileContent += `【作者的话】：\n${chapter.authorNote}\n\n`;
        }
        if (chapter.summary) {
            fileContent += `【本章摘要】：\n${chapter.summary}\n\n`;
        }
        fileContent += `------------------------------\n\n`;
    }

    // 3. 创建Blob并触发下载
    try {
        const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${book.name}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("导出TXT失败:", error);
        await showCustomAlert("导出失败", `发生了一个错误: ${error.message}`);
    }
}
// ▲▲▲ 新增函数结束 ▲▲▲

// ▼▼▼ 【任务5.D | V5版终极重构】TXT导入核心功能JS ▼▼▼

let currentImportFile = null;
let rawDecodedText = ''; // 缓存解码后的纯文本，用于反复应用规则

// ▼▼▼ 【终极BUG修复 | 采纳用户方案】修正正则表达式 ▼▼▼
const DEFAULT_SPLIT_REGEX = '第[一二三四五六七八九十百千万\\d\\s]+章.*|楔子|序章|尾声|番外.*|Chapter\\s*\\d+.*';
// ▲▲▲ 修复结束 ▲▲▲

function handleTxtImportClick() {
    document.getElementById('mochao-txt-file-input').click();
}

async function processSelectedTxtFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    currentImportFile = file;

    document.getElementById('txt-encoding-select').value = 'utf-8';
    document.getElementById('custom-split-rule-input').value = DEFAULT_SPLIT_REGEX;
    
    await decodeAndPreview('utf-8');
    document.getElementById('mochao-import-txt-modal').classList.add('visible');
    event.target.value = null;
}

async function decodeAndPreview(encoding) {
    if (!currentImportFile) return;
    const previewArea = document.getElementById('txt-preview-area');
    previewArea.value = '解码中...';

    try {
        const arrayBuffer = await currentImportFile.arrayBuffer();
        const decoder = new TextDecoder(encoding, { FATAL: true });
        rawDecodedText = decoder.decode(arrayBuffer);
        previewArea.value = rawDecodedText; // 初始状态，显示纯原文
        updateChapterSplitPreview(); // 更新章节计数
    } catch (error) {
        rawDecodedText = '';
        previewArea.value = `解码失败！请尝试切换编码格式。\n\n错误: ${error.message}`;
        document.getElementById('split-preview-count').textContent = '0';
    }
}

function updateChapterSplitPreview() {
    if (!rawDecodedText) return;
    const pattern = document.getElementById('custom-split-rule-input').value.trim();
    if (!pattern) {
        document.getElementById('split-preview-count').textContent = '0';
        return;
    }
    try {
        const regex = new RegExp(pattern, 'gm');
        const matches = rawDecodedText.match(regex);
        document.getElementById('split-preview-count').textContent = matches ? String(matches.length) : '0';
    } catch (e) {
        document.getElementById('split-preview-count').textContent = '正则错误!';
    }
}

/**
 * 【已修复】将规则应用到预览文本框中
 */
function applySplitRuleToPreview() {
    if (!rawDecodedText) {
        alert("请先成功解码文件！");
        return;
    }
    const pattern = document.getElementById('custom-split-rule-input').value.trim();
    if (!pattern) {
        alert("分章规则不能为空！");
        return;
    }

    try {
        // 【核心修复】添加了 'm' (多行) 和 'i' (忽略大小写) 标志
        const regex = new RegExp(`(${pattern})`, 'gmi');
        
        // 使用 replace 在每个匹配项前插入分割符
        const splitText = rawDecodedText.replace(regex, `\n\n---[SPLIT]---\n\n$1`);
        
        // 清理可能出现在开头的多余分割符
        const finalText = splitText.trim().replace(/^---[SPLIT]---\s*/, '');
        
        document.getElementById('txt-preview-area').value = finalText;
        alert("分章标记已应用！您现在可以在文本框中进行手动微调。");
    } catch (e) {
        alert(`正则表达式格式错误: ${e.message}`);
    }
}


// ▼▼▼ 【终极BUG修复 | V2版】修正TXT导入的分割逻辑 ▼▼▼
/**
 * 【已彻底修复】最终入库逻辑
 */
async function confirmTxtImport() {
    // 【核心修正1】我们现在只从预览框获取最终文本
    const textFromPreview = document.getElementById('txt-preview-area').value;
    
    // 【核心修正2】我们只使用最简单、最可靠的字符串分割
    const chaptersContent = textFromPreview.split('---[SPLIT]---').map(s => s.trim()).filter(Boolean);

    if (chaptersContent.length === 0) {
        alert('没有可导入的章节内容！请先“应用规则”并在预览框中确认分章标记。');
        return;
    }
    
    // 【核心修正3】智能提取简介的逻辑现在也基于分割后的结果，更可靠
    let potentialSynopsis = '';
    const pattern = document.getElementById('custom-split-rule-input').value.trim();
    if (pattern) {
        try {
            // 检查分割后的第一块内容是否像一个章节标题
            const firstPartHasTitle = new RegExp(pattern, 'i').test(chaptersContent[0].split('\n')[0]);
            if (!firstPartHasTitle) {
                // 如果不像，就把它当作简介，并从章节列表中移除
                potentialSynopsis = chaptersContent.shift(); 
            }
        } catch(e) {
             console.warn("用于检测简介的正则表达式无效，已跳过智能提取。");
        }
    }

    const bookName = await showCustomPrompt('为新书命名', '请输入导入书本的名称', currentImportFile.name.replace(/\.txt$/i, ''));
    if (!bookName || !bookName.trim()) return;
    
    const finalSynopsis = await showCustomPrompt('确认书本简介', '我们为您提取了以下内容作为简介，请确认或修改：', potentialSynopsis, 'textarea');
    if(finalSynopsis === null) return;

    try {
        const newBookId = await db.books.add({
            name: bookName.trim(),
            authorName: '导入',
            synopsis: finalSynopsis,
            tags: ['导入'],
            lastModified: Date.now(),
            characterSheets: [], outline: []
        });

        const chaptersToAdd = chaptersContent.map((content, index) => {
            const lines = content.split('\n');
            const title = lines.shift().trim() || `第 ${index + 1} 章`;
            const body = lines.join('\n').trim();
            return { bookId: newBookId, order: index + 1, title, content: body, authorNote: '', summary: '' };
        });
        await db.chapters.bulkAdd(chaptersToAdd);

        document.getElementById('mochao-import-txt-modal').classList.remove('visible');
        await renderBookshelf();
        await showCustomAlert('导入成功！', `已成功导入《${bookName}》并创建了 ${chaptersToAdd.length} 个章节。`);
        
    } catch (error) {
        console.error("导入TXT入库失败:", error);
        await showCustomAlert('导入失败', `发生错误: ${error.message}`);
    } finally {
        currentImportFile = null;
        rawDecodedText = '';
    }
}
// ▲▲▲ 终极修复结束 ▲▲▲

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

window.openMochaoApp = openMochaoApp;


	// ▼▼▼ 【修复3.B】添加字体应用的核心函数 ▼▼▼
	let mochaoFontStyleTag = null; // 全局变量，用于引用我们创建的style标签

	/**
	 * 应用“墨巢”专属的全局阅读字体
	 * @param {string} fontUrl - 字体文件的URL
	 */
	function applyMochaoFont(fontUrl) {
		if (!mochaoFontStyleTag) {
			mochaoFontStyleTag = document.createElement('style');
			mochaoFontStyleTag.id = 'mochao-dynamic-font-style';
			document.head.appendChild(mochaoFontStyleTag);
		}

		if (!fontUrl) {
			mochaoFontStyleTag.innerHTML = ''; // 如果URL为空，则清空样式
			return;
		}

		const fontName = 'mochao-custom-font';
		mochaoFontStyleTag.innerHTML = `
			@font-face {
			  font-family: '${fontName}';
			  src: url('${fontUrl}');
			  font-display: swap;
			}
			#mochao-chapter-reader-screen .list-container {
			  font-family: '${fontName}', sans-serif !important;
			}
		`;
	}
	// ▲▲▲ 新增函数结束 ▲▲▲


    /**
     * “墨巢”App的专属初始化函数事件监听器
     */
    async function initializeMochaoApp() {
        // 加载设置
        mochaoSettings = (await db.mochaoSettings.get('main')) || { fontSize: 16, bgColor: '#FDFBF5' };
        
// ▼▼▼ 【修复1.B | 终极版】修正书架页事件监听器 ▼▼▼
document.getElementById('mochao-create-book-btn').addEventListener('click', () => openBookEditor());
// 为现在已存在的按钮直接绑定事件
document.getElementById('mochao-settings-btn').addEventListener('click', openMochaoSettings);
document.getElementById('mochao-filter-btn').addEventListener('click', openMochaoFilterModal);
// 导入按钮的事件将在任务5中实现，此处暂时为空

// ▼▼▼ 【任务5.E | V4版终极简化】为TXT导入功能绑定所有事件 ▼▼▼

document.getElementById('mochao-import-txt-btn').addEventListener('click', handleTxtImportClick);
document.getElementById('mochao-txt-file-input').addEventListener('change', processSelectedTxtFile);

// 编码选择器和正则表达式输入框，任何变动都触发【计数】预览
document.getElementById('txt-encoding-select').addEventListener('change', e => decodeAndPreview(e.target.value));
document.getElementById('custom-split-rule-input').addEventListener('input', updateChapterSplitPreview);

// 【【【核心新增！！！】】】为“应用规则”按钮绑定事件
document.getElementById('apply-split-rule-btn').addEventListener('click', applySplitRuleToPreview);

// 模态框按钮
document.getElementById('cancel-txt-import-btn').addEventListener('click', () => {
    document.getElementById('mochao-import-txt-modal').classList.remove('visible');
    currentImportFile = null;
    rawDecodedText = '';
});
document.getElementById('confirm-txt-import-btn').addEventListener('click', confirmTxtImport);

// ▲▲▲ 事件绑定结束 ▲▲▲


// --- “墨巢”设置页事件 ---
document.getElementById('mochao-settings-back-btn').addEventListener('click', () => showScreen('mochao-bookshelf-screen'));
// ▼▼▼ 【修复3.C】更新设置保存逻辑 ▼▼▼
document.getElementById('mochao-settings-save-btn').addEventListener('click', async () => {
    // 保存字体URL
    mochaoSettings.fontUrl = document.getElementById('mochao-font-url-input').value.trim();
    
    // 保存其他设置... (这部分逻辑不变)
    
    await db.mochaoSettings.put({id: 'main', ...mochaoSettings});
    
    // 【核心新增】在保存后，立即应用新字体
    applyMochaoFont(mochaoSettings.fontUrl);
    
    alert('墨巢设置已保存！');
});
// ▲▲▲ 修复结束 ▲▲▲

// 文风预设管理
document.getElementById('add-style-preset-btn').addEventListener('click', async () => {
    const nameInput = document.getElementById('new-style-preset-name-input');
    const name = nameInput.value.trim();
    if (!name) return;
    const content = await showCustomPrompt(`文风预设“${name}”`, '请输入该文风的具体描述/Prompt:', '', 'textarea');
    if (content) {
        mochaoSettings.stylePresets.push({ name, content });
        nameInput.value = '';
        renderStylePresetsList();
    }
});
document.getElementById('mochao-style-presets-list').addEventListener('click', e => {
    if (e.target.classList.contains('delete-btn')) {
        const index = parseInt(e.target.dataset.index);
        mochaoSettings.stylePresets.splice(index, 1);
        renderStylePresetsList();
    }
});

// 标签池管理
document.getElementById('add-tag-btn').addEventListener('click', () => {
    const input = document.getElementById('new-tag-input');
    const tag = input.value.trim();
    if (tag && !mochaoSettings.userTags.includes(tag)) {
        mochaoSettings.userTags.push(tag);
        input.value = '';
        renderTagsList();
    }
});
document.getElementById('mochao-tags-list').addEventListener('click', e => {
    if (e.target.classList.contains('delete-btn')) {
        const index = parseInt(e.target.dataset.index);
        mochaoSettings.userTags.splice(index, 1);
        renderTagsList();
    }
});

// --- 筛选弹窗事件 ---
document.getElementById('mochao-filter-cancel-btn').addEventListener('click', () => {
    document.getElementById('mochao-filter-modal').classList.remove('visible');
});
document.getElementById('mochao-filter-reset-btn').addEventListener('click', () => {
    activeMochaoFilters = [];
    renderBookshelf();
    document.getElementById('mochao-filter-modal').classList.remove('visible');
});
document.getElementById('mochao-filter-apply-btn').addEventListener('click', () => {
    const selected = document.querySelectorAll('#mochao-filter-tags-list input:checked');
    activeMochaoFilters = Array.from(selected).map(cb => cb.value);
    renderBookshelf();
    document.getElementById('mochao-filter-modal').classList.remove('visible');
});
// ▲▲▲ 重构结束 ▲▲▲

        
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



    // 只有在DOM加载后才能安全地绑定这些事件
    const bookEditorModal = document.getElementById('mochao-book-editor-modal');

    if(bookEditorModal) {
        // AI按钮占位符
        document.getElementById('book-ai-magic-btn').addEventListener('click', () => alert('AI魔法棒功能将在里程碑2中实现！'));
        document.getElementById('ai-generate-characters-btn').addEventListener('click', () => alert('AI生成人物功能将在里程碑2中实现！'));
        document.getElementById('ai-generate-outline-btn').addEventListener('click', () => alert('AI生成大纲功能将在里程碑2中实现！'));
        
        // 人物卡的手动添加和删除
        document.getElementById('add-character-btn').addEventListener('click', addCharacterManually);
        document.getElementById('book-characters-list').addEventListener('click', e => {
            if (e.target.classList.contains('delete-group-btn')) {
                e.target.closest('.existing-group-item').remove();
                if (document.getElementById('book-characters-list').children.length === 0) {
                    renderCharacterSheets([]);
                }
            }
        });

        // 标签选择器
        const bookTagsSelector = document.getElementById('book-tags-selector');
        bookTagsSelector.querySelector('.select-box').addEventListener('click', (e) => {
            e.stopPropagation();
            bookTagsSelector.querySelector('.checkboxes-container').classList.toggle('visible');
            bookTagsSelector.querySelector('.select-box').classList.toggle('expanded');
        });
        bookTagsSelector.querySelector('.checkboxes-container').addEventListener('change', updateBookTagsSelectionDisplay);
        bookTagsSelector.querySelector('.checkboxes-container').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.id === 'new-tag-input-in-editor') {
                e.preventDefault();
                const input = e.target;
                const newTag = input.value.trim();
                if (newTag && !Array.from(bookTagsSelector.querySelectorAll('input[type="checkbox"]')).some(cb => cb.value === newTag)) {
                    const newLabel = document.createElement('label');
                    newLabel.innerHTML = `<input type="checkbox" value="${newTag}" checked> ${newTag}`;
                    input.before(newLabel);
                    updateBookTagsSelectionDisplay();
                }
                input.value = '';
            }
        });

        // 文风选择器
        document.getElementById('book-style-prompt-select').addEventListener('change', async function(e) {
            if (e.target.value === 'custom') {
                const customStyle = await showCustomPrompt('自定义文风', '请输入详细的文风描述/Prompt:', '', 'textarea');
                if (customStyle) {
                    const newOption = new Option('自定义: ' + customStyle.substring(0,10)+'...', customStyle, true, true);
                    e.target.add(newOption);
                } else {
                    e.target.value = '';
                }
            }
        });
    }



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

		// ▼▼▼ 【修复2】重构章节列表的事件委托（已加入删除后重排逻辑） ▼▼▼
		document.getElementById('mochao-chapter-list').addEventListener('click', async (e) => {
			const listEl = document.getElementById('mochao-chapter-list');
			
			// 如果点击的是删除按钮
			if (e.target.classList.contains('chapter-delete-btn')) {
				const chapterId = parseInt(e.target.dataset.chapterId);
				const chapter = await db.chapters.get(chapterId);
				const confirmed = await showCustomConfirm('确认删除', `确定要删除章节《${chapter.title}》吗？`, { confirmButtonClass: 'btn-danger' });
				
				if (confirmed) {
					await db.transaction('rw', db.chapters, db.chapterComments, async () => {
						// 1. 删除评论和章节本身
						await db.chapterComments.where('chapterId').equals(chapterId).delete();
						await db.chapters.delete(chapterId);

						// 2. 【核心修复】获取剩余的所有章节，并按现有顺序排序
						const remainingChapters = await db.chapters.where('bookId').equals(activeBookId).sortBy('order');
						
						// 3. 创建一个更新任务数组
						const updates = remainingChapters.map((chap, index) => {
							return {
								key: chap.id,
								changes: { order: index + 1 } // 重新分配从1开始的连续序号
							};
						});

						// 4. 批量更新数据库
						if (updates.length > 0) {
							await db.chapters.bulkUpdate(updates);
						}
					});
					// 5. 重新渲染列表，此时序号就是正确的了
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
		// ▲▲▲ 修复结束 ▲▲▲



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


    }

    // 将初始化函数暴露到全局，以便主HTML文件可以调用
    window.initializeMochaoApp = initializeMochaoApp;
});
// ========= END OF FILE mochao.js =========