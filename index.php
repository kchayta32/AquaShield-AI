<?php
/**
 * AquaShield AI - Main Router
 * ระบบพยากรณ์และเตือนภัยน้ำท่วมฉับพลัน
 * 
 * @version 2.0.0
 * @license MIT
 */

// Start session (if needed)
session_start();

// Load Configuration
require_once 'config/config.php';

// Get requested page
$page = isset($_GET['page']) ? $_GET['page'] : 'home';

// Allowed pages (whitelist for security)
$allowed_pages = ['home', 'dashboard', 'team', 'about'];



// Validate page
if (!in_array($page, $allowed_pages)) {
    $page = 'home'; // Default to home if invalid
}

// Include Layout and Page
include 'includes/header.php';
include 'pages/' . $page . '.php';
include 'includes/footer.php';
?>