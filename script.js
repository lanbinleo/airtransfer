/*
 * AirTransfer - Simple File Sharing Web App
 * Created by Lanbin Leo with ❤️
 * Link: https://github.com/lanbinleo/airtransfer
 * AI attempted. All rights reserved.
*/

// Translations
const translations = {
    en: {
        appName: "AirTransfer",
        upload: "Upload",
        retrieve: "Retrieve",
        dropFilesHere: "Drop files here or click to upload",
        supportedFiles: "Supports all file types",
        startUpload: "Start Upload",
        enterCode: "Enter 6-digit code",
        retrieveFile: "Retrieve File",
        uploading: "Uploading...",
        uploadComplete: "Upload Complete",
        shareCodeText: "Share this code with recipient",
        invalidCode: "Please enter a valid 6-digit code",
        fileNotFound: "File not found or expired",
        selectFile: "Please select a file",
        fileName: "File",
        fileSize: "Size",
        downloadRemaining: "Remaining downloads",
        expiresOn: "Expires on",
        download: "Download",
        uploadFailed: "Upload failed. Please try again.",
        preparing: "Preparing upload...",
        processing: "Processing...",
        almostDone: "Almost done...",
        copyCode: "Copy Code",
        codeCopied: "Code copied to clipboard!",
        footerText: "© 2025 AirTransfer. Simple, Fast, Secure. By <a href='https://github.com/lanbinleo/airtransfer' target='_blank'>Lanbin Leo</a> with ❤️"
    },
    zh: {
        appName: "AirTransfer",
        upload: "上传",
        retrieve: "获取",
        dropFilesHere: "拖拽文件到此处或点击上传",
        supportedFiles: "支持所有文件类型",
        startUpload: "开始上传",
        enterCode: "输入6位提取码",
        retrieveFile: "获取文件",
        uploading: "正在上传...",
        uploadComplete: "上传完成",
        shareCodeText: "分享此提取码给接收人",
        invalidCode: "请输入有效的6位提取码",
        fileNotFound: "文件不存在或已过期",
        selectFile: "请选择文件",
        fileName: "文件名",
        fileSize: "大小",
        downloadRemaining: "剩余下载次数",
        expiresOn: "过期时间",
        download: "下载",
        uploadFailed: "上传失败，请重试",
        preparing: "准备上传中...",
        processing: "处理中...",
        almostDone: "即将完成...",
        copyCode: "复制提取码",
        codeCopied: "提取码已复制到剪贴板！",
        footerText: "© 2025 AirTransfer。简单、快速、安全。By <a href='https://github.com/lanbinleo/airtransfer' target='_blank'>Lanbin Leo</a> with ❤️"
    }
};

const failed_code = {
    // code: ["zh", "en"]
    "400": {"zh":"用户未登录，无法上传", "en": "User not logged in, cannot upload"},
    "401": {"zh":"上传文件过大，最大支持5GB", "en": "Uploaded file is too large, maximum support 5GB"},
    "402": {"zh":"用户剩余点数不足，无法上传", "en": "User has insufficient remaining points to upload"},
    "410": {"zh":"缺少file_id或chunk_id参数", "en": "Missing file_id or chunk_id parameters"},
    "411": {"zh":"无效的chunk_id", "en": "Invalid chunk_id"},
    "412": {"zh":"缺少utoken参数", "en": "Missing utoken parameter"},
    "413": {"zh":"无效的用户令牌", "en": "Invalid user token"},
    "414": {"zh":"积分不足", "en": "Insufficient points"},
    "415": {"zh":"扣除积分失败", "en": "Failed to deduct points"},
    "500": {"zh":"服务器错误，请稍后重试", "en": "Server error, please try again later"},
    "503": {"zh":"服务器维护中，请稍后重试", "en": "Server maintenance, please try again later"},
}

// Configuration
const chunkSize = 5 * 1024 * 1024; // 5MB chunk size
let currentLanguage = 'en';
let currentTheme = localStorage.getItem('theme') || 'light';

function getUserTokenFromLocalStorage() {
    console.log(localStorage.getItem('token'));
    return localStorage.getItem('token');
}

function setUserTokenToLocalStorage(token) {
    localStorage.setItem('token', token);
}


// Document Ready Function
$(document).ready(function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    // Apply saved theme
    applyTheme(currentTheme);
    
    // Apply saved language or detect from browser
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
        currentLanguage = savedLang;
    } else {
        // Detect browser language
        const browserLang = navigator.language.split('-')[0];
        currentLanguage = browserLang === 'zh' ? 'zh' : 'en';
    }
    applyLanguage(currentLanguage);

    // 如果localStorage中没有token，弹出tokenModal
    if (getUserTokenFromLocalStorage() == null) {
        $('#tokenModal').show();
        // set opacity to 1
        $('#tokenModal').css('opacity', '1');
    }
    
    // Initialize event listeners
    initEventListeners();
    
    // Show tab content with animation
    setTimeout(() => {
        $('#sendTab').addClass('active');
    }, 100);
    
    // Initialize page with fade in animation
    $('body').css('opacity', '1');
}

// Token modal event handling
$('#closeTokenModal').on('click', function() {
    $('#tokenModal').hide();
});

$('#tokenSubmit').on('click', function() {
    const token = $('#tokenInput').val().trim();
    if (token) {
        setUserTokenToLocalStorage(token);
        $('#tokenModal').hide();
    } else {
        $('#tokenError').text(translations[currentLanguage].tokenRequired || 'Token is required');
    }
});

// Handle token input changes
$('#tokenInput').on('input', function() {
    // Clear error when user starts typing
    $('#tokenError').text('');
});

// Close token modal if user clicks outside of it
$(window).on('click', function(event) {
    if ($(event.target).is('#tokenModal')) {
        $('#tokenModal').hide();
    }
});

// Copy code to clipboard
$('#copyCode').on('click', function() {
    const code = $('#codeDisplay').text();
    navigator.clipboard.writeText(code).then(function() {
        const originalText = $('#copyCode').text();
        $('#copyCode').text(translations[currentLanguage].codeCopied);
        setTimeout(() => {
            $('#copyCode').text(originalText);
        }, 2000);
    });
});

// Apply theme to the page
function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    const icon = theme === 'dark' ? 'fa-sun' : 'fa-moon';
    $('#themeToggle i').removeClass('fa-sun fa-moon').addClass(icon);
    localStorage.setItem('theme', theme);
}

// Apply language to the page
function applyLanguage(lang) {
    document.body.setAttribute('data-lang', lang);
    const texts = translations[lang];
    
    $('[data-i18n]').each(function() {
        const key = $(this).data('i18n');
        if (texts[key]) {
            $(this).html(texts[key]);
        }
    });
    
    localStorage.setItem('language', lang);
}

// Initialize all event listeners
function initEventListeners() {
    // 添加点击dropZone触发文件选择的事件
    $('#dropZone').on('click', function(e) {
        // 防止事件冒泡导致重复触发
        if (e.target === this || !$(e.target).closest('input[type="file"]').length) {
            $('#fileInput').click();
        }
    });

    // Theme toggle
    $('#themeToggle').on('click', function() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(currentTheme);
    });
    
    // Language toggle
    $('#langToggle').on('click', function() {
        currentLanguage = currentLanguage === 'en' ? 'zh' : 'en';
        applyLanguage(currentLanguage);
    });
    
    // Tab switching
    $('.tab-btn').on('click', function() {
        const tabId = $(this).data('tab');
        const oldTab = $('.tab-content.active');
        const newTab = $('#' + tabId);
        
        // 如果点击的就是当前活动的标签页，不做任何处理
        if (newTab.hasClass('active')) return;
        
        // 先改变按钮状态
        $('.tab-btn').removeClass('active');
        $(this).addClass('active');
        
        // 准备旧标签淡出
        oldTab.css({
            'opacity': '0',
        });

        oldTab.removeClass('active');
        
        // 准备新标签淡入
        newTab.addClass('active').css({
            'opacity': '0',
            'position': 'relative', 
            'z-index': '2'
        });
        
        // 执行动画
        setTimeout(() => {
            // 淡入新标签同时淡出旧标签
            newTab.css('opacity', '1');
            // 动画完成后清理
            setTimeout(() => {
                newTab.css({
                    'position': '',
                    'z-index': ''
                });
            }, 400); // 与动画时间相匹配
        }, 10);
    });
    
    // File input change
    $('#fileInput').on('change', function() {
        handleFileSelect(this.files);
    });
    
    // File drop zone
    const dropZone = document.getElementById('dropZone');
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    dropZone.addEventListener('drop', handleDrop, false);
    
    // Upload button
    $('#uploadBtn').on('click', function() {
        startUpload();
    });
    
    // Close modal
    $('#closeModal').on('click', function() {
        $('#uploadModal').removeClass('show');
        setTimeout(() => {
            $('#uploadModal').hide();
            resetUploadModal();
        }, 300);
    });
    
    // Retrieve file button
    $('#checkBtn').on('click', function() {
        retrieveFile();
    });
    
    // Code input - auto format and restrict to numbers
    $('#codeInput').on('input', function() {
        let value = $(this).val().replace(/[^0-9]/g, '');
        $(this).val(value);
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    document.getElementById('dropZone').classList.add('dragover');
}

function unhighlight() {
    document.getElementById('dropZone').classList.remove('dragover');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFileSelect(files);
}

function handleFileSelect(files) {
    if (files.length > 0) {
        const file = files[0];
        
        // 显示文件详情
        $('#fileName').text(file.name);
        $('#fileSize').text(` (${formatFileSize(file.size)})`);
        $('#fileDetails').fadeIn();
        
        // 存储文件以备上传
        document.getElementById('fileInput').files = files;
        
        // 清除任何错误状态
        $('#status').text('').removeClass('status-error');
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function startUpload() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        showStatus(translations[currentLanguage].selectFile, 'error');
        return;
    }
    
    // Show upload modal
    $('#uploadModal').show();
    setTimeout(() => {
        $('#uploadModal').addClass('show');
    }, 10);
    
    // Reset the progress display
    updateProgress(0);
    $('#uploadProgress').show();
    $('#uploadSuccess').hide();
    
    // Begin upload process
    initializeUpload(file);
}

function showStatus(message, type = 'info') {
    const statusElement = $('#status');
    statusElement.text(message)
        .removeClass('status-info status-success status-error')
        .addClass(`status-${type}`);
}

function updateProgress(percent, message) {
    // Update progress circle
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (percent / 100) * circumference;
    $('#progressRing').css('stroke-dashoffset', offset);
    
    // Update progress text
    $('#progressText').text(percent + '%');
    
    // Update status message if provided
    if (message) {
        $('#modalStatus').text(message);
    }
    
    // Change message based on progress
    if (percent < 20) {
        $('#modalStatus').text(translations[currentLanguage].preparing);
    } else if (percent < 80) {
        $('#modalStatus').text(translations[currentLanguage].processing);
    } else if (percent < 100) {
        $('#modalStatus').text(translations[currentLanguage].almostDone);
    }
}
// 更新为实际的上传初始化函数
function initializeUpload(file) {
    // 重置进度
    updateProgress(0);
    $('#uploadSuccess').hide();
    $('#uploadProgress').show();

    let utoken = getUserTokenFromLocalStorage();

    // 发起上传请求
    $.post('/upload/start?filename=' + encodeURIComponent(file.name) + '&file_size=' + file.size + '&utoken=' + utoken, function(data) {
        uploadChunk(file, data.file_id, 0, data.token);
    }).fail(function(err) {
        console.log(err);
        console.log(err.responseJSON.code);
        showUploadError(err.responseJSON.code);
    });
}

// 更新为实际的上传块函数
function uploadChunk(file, fileId, chunkId, token) {
    const start = chunkId * chunkSize;
    
    if (start >= file.size) {
        finishUpload(fileId, token);
        return;
    }
    
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    const totalChunks = Math.ceil(file.size / chunkSize);
    
    // 读取文件块
    const reader = new FileReader();
    reader.onload = function(e) {
        $.ajax({
            url: '/upload/chunk?file_id=' + fileId + '&chunk_id=' + chunkId + '&token=' + token + '&utoken=' + getUserTokenFromLocalStorage(),
            type: 'POST',
            data: e.target.result,
            processData: false,
            contentType: false,
            dataType: 'json',
            success: function() {
                // 更新进度
                const progress = Math.round(((chunkId + 1) / totalChunks) * 100);
                updateProgress(progress);
                
                // 上传下一个块
                uploadChunk(file, fileId, chunkId + 1, token);
            },
            error: function(data) {
                showUploadError(data.code);
            }
        });
    };
    reader.readAsArrayBuffer(chunk);
}

// 更新为实际的完成上传函数
function finishUpload(fileId, token) {
    $.post('/upload/finish?file_id=' + fileId + '&token=' + token, function(data) {
        showUploadSuccess(data.code);
        // 删除文件输入
        document.getElementById('fileInput').value = '';
        // 删除文件详情
        $('#fileDetails').hide();
    }).fail(function(data) {
        showUploadError(data.code);
    });
}

function showUploadSuccess(code) {
    // 更新UI显示上传成功
    updateProgress(100, translations[currentLanguage].uploadComplete);
    
    // 显示上传成功界面
    setTimeout(() => {
        $('#uploadProgress').fadeOut(300, function() {
            $('#codeDisplay').text(code);
            $('#uploadModalTitle').text(translations[currentLanguage].uploadComplete);
            $('#uploadSuccess').fadeIn(300);
            $('#successMessage').text(translations[currentLanguage].shareCodeText);
        });
    }, 700);
}

function showUploadError(code) {
    $('#modalStatus').text(failed_code[code][currentLanguage])
        .removeClass('status-info')
        .addClass('status-error');
}

function resetUploadModal() {
    $('#uploadProgress').show();
    $('#uploadSuccess').hide();
    $('#uploadModalTitle').text(translations[currentLanguage].uploading);
    updateProgress(0);
}

// 更新文件检索功能
function retrieveFile() {
    const code = $('#codeInput').val();
    
    if (code.length !== 6 || !/^\d+$/.test(code)) {
        $('#fileInfo').html(`
            <div class="status status-error">${translations[currentLanguage].invalidCode}</div>
        `);
        return;
    }
    
    // 显示加载状态
    $('#fileInfo').html(`
        <div class="status status-info">
            <i class="fas fa-circle-notch fa-spin"></i> Loading...
        </div>
    `);
    
    // 发起API请求获取文件信息
    $.get('/info/' + code, function(data) {
        // 检查是否有错误
        if (data.error) {
            $('#fileInfo').html(`
                <div class="status status-error">${data.error}</div>
            `);
            return;
        }
        
        // 显示文件信息
        showFileInfo({
            name: data.filename,
            size: data.size,
            remainingDownloads: data.remain_download,
            expiryTime: data.expired_time * 1000,
            code: code
        });
    }).fail(function() {
        $('#fileInfo').html(`
            <div class="status status-error">${translations[currentLanguage].fileNotFound}</div>
        `);
    });
}

function showFileInfo(fileData) {
    const expiryDate = new Date(fileData.expiryTime).toLocaleString();
    const fileSize = formatFileSize(fileData.size);
    
    // 根据剩余下载次数决定下载按钮状态
    let downloadButton = `
        <a href="/download/${fileData.code}" class="download-btn">
            <i class="fas fa-download mr-2"></i>
            ${translations[currentLanguage].download}
        </a>
    `;
    
    if (fileData.remainingDownloads <= 0) {
        downloadButton = `
            <span class="download-btn disabled">
                <i class="fas fa-download mr-2"></i>
                ${translations[currentLanguage].download}
            </span>
        `;
    }
    
    $('#fileInfo').html(`
        <div class="file-info-card">
            <div class="file-info-row">
                <span class="file-info-label">${translations[currentLanguage].fileName}:</span>
                <span class="file-info-value">${fileData.name}</span>
            </div>
            <div class="file-info-row">
                <span class="file-info-label">${translations[currentLanguage].fileSize}:</span>
                <span class="file-info-value">${fileSize}</span>
            </div>
            <div class="file-info-row">
                <span class="file-info-label">${translations[currentLanguage].downloadRemaining}:</span>
                <span class="file-info-value">${fileData.remainingDownloads}</span>
            </div>
            <div class="file-info-row">
                <span class="file-info-label">${translations[currentLanguage].expiresOn}:</span>
                <span class="file-info-value">${expiryDate}</span>
            </div>
            ${downloadButton}
        </div>
    `);
    
    // 添加动画效果
    $('.file-info-card').hide().fadeIn(300);
}