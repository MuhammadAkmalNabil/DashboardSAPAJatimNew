<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php
        // Dynamic page title
        $page_title = "Dashboard SAPA-Jatim"; // Default
        if (isset($_GET['page'])) {
            $current_page = htmlspecialchars($_GET['page']);
            if ($current_page == 'tentang') $page_title = "Tentang - SAPA Jatim";
            else if ($current_page == 'kontak') $page_title = "Kontak - SAPA Jatim";
            else if ($current_page == 'peta') $page_title = "Peta Tematik - SAPA Jatim";
            else if ($current_page == 'tren') $page_title = "Data Terkait (Tren) - SAPA Jatim";
            // Add more titles for other pages if needed
        }
    ?>
    <title><?php echo $page_title; ?></title>
    <link rel="icon" type="image/png" sizes="48x48" href="image/logo3.jpg">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/style-dashboard.css" />
    <?php
        // Conditionally load other stylesheets if needed for specific pages
        if (isset($_GET['page'])) {
            $current_page_for_css = htmlspecialchars($_GET['page']);
            if ($current_page_for_css == 'kontak' && file_exists('css/style-kontak.css')) {
                echo '<link rel="stylesheet" href="css/style-kontak.css" />';
            } else if ($current_page_for_css == 'peta' && file_exists('css/style-peta.css')) {
                echo '<link rel="stylesheet" href="css/style-peta.css" />';
            } else if ($current_page_for_css == 'tren' && file_exists('css/style-tren.css')) {
                 echo '<link rel="stylesheet" href="css/style-tren.css" />';
            }
            // Add more for other specific page stylesheets
        }
    ?>
</head>
<body>
    <!-- LAPISAN TETAP (PENUTUP PUTIH DI ATAS) -->
    <div class="fixed-gap-cover"></div>
    <!-- HEADER YANG AKAN STICKY -->
    <header>
        <div class="header-container">
            <div class="logo-title">
                <img src="image/Reg I Primary without Text.png" alt="Logo" class="logo">
                <h1>Direktorat Regional I | <span class="non-bold">Kementerian PPN/Bappenas</span></h1>
            </div>
            <nav>
                <ul class="nav-menu">
                    <li><a href="index.php?page=home">Beranda</a></li>
                    <li><a href="index.php?page=tentang">Tentang</a></li>
                    <li><a href="index.php?page=kontak">Kontak</a></li>
                    <!-- Add other main navigation links if needed -->
                </ul>
                <div class="menu-icon">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </nav>
        </div>
    </header>
    <!-- The <br> after header is often better handled with CSS margins/padding in style.css -->
</body>
</html>