<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>
        <?php echo get_page_title($page); ?>
    </title>
    <meta name="description" content="<?php echo APP_DESC; ?>">
    <meta name="theme-color" content="#3B82F6">

    <!-- Preconnect for Performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <!-- Google Fonts - Kanit -->
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

    <!-- Leaflet Map CSS (Fallback) -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">

    <!-- MapLibre GL JS CSS (3D Map) -->
    <link href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" rel="stylesheet" />


    <!-- Main Stylesheet -->
    <link rel="stylesheet" href="<?php echo asset_url('css/style.css'); ?>">
</head>

<body class="light-theme">
    <!-- Navbar -->
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-content">
                <!-- Logo -->
                <a href="?page=home" class="nav-logo">
                    <div class="logo-icon">
                        <i class="fa-solid fa-shield-halved"></i>
                    </div>
                    <span class="logo-text">AquaShield AI</span>
                </a>

                <!-- Desktop Navigation -->
                <div class="nav-links">
                    <a href="?page=home" class="nav-link <?php echo $page === 'home' ? 'active' : ''; ?>">
                        <i class="fa-solid fa-home"></i> หน้าแรก
                    </a>
                    <a href="?page=dashboard" class="nav-link <?php echo $page === 'dashboard' ? 'active' : ''; ?>">
                        <i class="fa-solid fa-gauge-high"></i> แดชบอร์ด
                    </a>
                    <a href="?page=team" class="nav-link <?php echo $page === 'team' ? 'active' : ''; ?>">
                        <i class="fa-solid fa-users"></i> ทีมพัฒนา
                    </a>
                    <a href="#features" class="nav-link">
                        <i class="fa-solid fa-star"></i> คุณสมบัติ
                    </a>
                </div>

                <!-- Mobile Menu Button -->
                <button class="mobile-menu-btn" id="menuBtn" onclick="toggleMenu()">
                    <i class="fa-solid fa-bars" id="menuIcon"></i>
                </button>
            </div>
        </div>

        <!-- Mobile Menu -->
        <div class="mobile-menu hidden" id="mobileMenu">
            <div class="mobile-menu-content">
                <a href="?page=home" class="mobile-link <?php echo $page === 'home' ? 'active' : ''; ?>">
                    <i class="fa-solid fa-home"></i> หน้าแรก
                </a>
                <a href="?page=dashboard" class="mobile-link <?php echo $page === 'dashboard' ? 'active' : ''; ?>">
                    <i class="fa-solid fa-gauge-high"></i> แดชบอร์ด
                </a>
                <a href="?page=team" class="mobile-link <?php echo $page === 'team' ? 'active' : ''; ?>">
                    <i class="fa-solid fa-users"></i> ทีมพัฒนา
                </a>
                <a href="#features" onclick="toggleMenu()" class="mobile-link">
                    <i class="fa-solid fa-star"></i> คุณสมบัติ
                </a>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">