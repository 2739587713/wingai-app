# Centralized selector registry with multi-level fallbacks per platform.
# IMPORTANT: Use double quotes inside selectors (single quotes break JS embedding).

SELECTORS = {
    # ─── Xiaohongshu ───
    "xhs_upload_input": [
        "input.upload-input",
        'input[type="file"]',
    ],
    "xhs_upload_tab_image": [
        "div.creator-tab",
    ],
    "xhs_title_input": [
        'input[placeholder*="填写标题"]',
        'input[placeholder*="标题会有更多赞"]',
        "input.d-text",
        'input[placeholder*="标题"]',
    ],
    "xhs_content_editor": [
        "div.tiptap.ProseMirror",
        'div.ProseMirror[contenteditable="true"]',
        ".ProseMirror",
    ],
    "xhs_publish_btn": [],  # Found by text content "发布", handled in xiaohongshu.py
    "xhs_login_check": [
        ".user-avatar",
        ".avatar",
        'img[class*="avatar"]',
        ".header-user",
    ],

    # ─── Douyin ───
    "dy_upload_input": [
        'input[type="file"]',
    ],
    "dy_title_input": [
        'input[placeholder*="填写作品标题"]',
        'input[placeholder*="作品标题"]',
        'input[placeholder*="添加作品标题"]',
        'input[placeholder*="标题"]',
    ],
    "dy_content_editor": [
        '.notranslate[contenteditable="true"]',
        '[contenteditable="true"]',
        'div[data-placeholder*="作品简介"]',
        'div[data-placeholder*="描述"]',
    ],
    "dy_publish_btn": [],  # Found by text "发布", handled in douyin.py
    "dy_login_check": [
        'img[class*="avatar"]',
        ".avatar-wrapper",
        ".user-info",
    ],

    # ─── Kuaishou ───
    "ks_upload_input": [
        'input[type="file"]',
        '.upload-area input[type="file"]',
    ],
    "ks_title_input": [
        'input[placeholder*="作品标题"]',
        'input[placeholder*="标题"]',
        ".work-title input",
    ],
    "ks_content_editor": [
        '[contenteditable="true"]',
        ".ql-editor",
        'textarea[placeholder*="描述"]',
    ],
    "ks_publish_btn": [
        "button.ant-btn-primary",
        'button[class*="publish"]',
        ".publish-btn button",
    ],
    "ks_login_check": [
        ".avatar",
        ".user-avatar",
        'img[class*="avatar"]',
    ],
}
