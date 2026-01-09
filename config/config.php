<?php
/**
 * AquaShield AI - Configuration
 * ไฟล์ตั้งค่าหลักของแอพพลิเคชัน
 */

// Application Settings
define('APP_NAME', 'AquaShield AI');
define('APP_DESC', 'ระบบพยากรณ์และเตือนภัยน้ำท่วมฉับพลัน');
define('APP_VERSION', '2.0.0');
define('BASE_URL', '/');

// Theme Settings
define('THEME_MODE', 'light'); // 'light' or 'dark'

// API Keys (These are used by JavaScript)
$config = [
    'app_name' => APP_NAME,
    'app_desc' => APP_DESC,
    'version' => APP_VERSION,
    'theme' => THEME_MODE
];

// Page Titles
$page_titles = [
    'home' => 'หน้าแรก - ' . APP_NAME,
    'dashboard' => 'แดชบอร์ดเตือนภัย - ' . APP_NAME,
    'team' => 'ทีมพัฒนา AiCE_SSRU - ' . APP_NAME,
    'about' => 'เกี่ยวกับโครงการ - ' . APP_NAME
];



/**
 * Get current page title
 */
function get_page_title($page)
{
    global $page_titles;
    return $page_titles[$page] ?? APP_NAME;
}

/**
 * Get asset URL with cache busting
 */
function asset_url($path)
{
    return 'assets/' . $path . '?v=' . APP_VERSION;
}
?>