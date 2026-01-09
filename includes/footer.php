</main>

<!-- Footer -->
<footer class="footer">
    <div class="footer-container">
        <div class="footer-content">
            <!-- Logo & Description -->
            <div class="footer-brand">
                <div class="footer-logo">
                    <div class="logo-icon">
                        <i class="fa-solid fa-shield-halved"></i>
                    </div>
                    <span class="logo-text">
                        <?php echo APP_NAME; ?>
                    </span>
                </div>
                <p class="footer-desc">
                    <?php echo APP_DESC; ?>
                </p>
            </div>

            <!-- Quick Links -->
            <div class="footer-links">
                <h4>เมนูหลัก</h4>
                <ul>
                    <li><a href="?page=home">หน้าแรก</a></li>
                    <li><a href="?page=dashboard">แดชบอร์ด</a></li>
                    <li><a href="#features">คุณสมบัติ</a></li>
                    <li><a href="#partners">พันธมิตร</a></li>
                </ul>
            </div>

            <!-- Contact -->
            <div class="footer-contact">
                <h4>ติดต่อเรา</h4>
                <ul>
                    <li><i class="fa-solid fa-envelope"></i> sgtkchayta@gmail.com</li>
                    <li><i class="fa-solid fa-phone"></i> 064-3124573</li>
                    <li><i class="fa-solid fa-map-marker-alt"></i> กรุงเทพฯ, ประเทศไทย</li>
                </ul>
            </div>

            <!-- Social Links -->
            <div class="footer-social">
                <h4>ติดตามเรา</h4>
                <div class="social-icons">
                    <a href="#" class="social-icon"><i class="fa-brands fa-facebook-f"></i></a>
                    <a href="#" class="social-icon"><i class="fa-brands fa-twitter"></i></a>
                    <a href="#" class="social-icon"><i class="fa-brands fa-line"></i></a>
                    <a href="#" class="social-icon"><i class="fa-brands fa-github"></i></a>
                </div>
            </div>
        </div>

        <!-- Copyright -->
        <div class="footer-bottom">
            <p>&copy; 2026
                <?php echo APP_NAME; ?>. All rights reserved.
            </p>
            <p class="version">Version
                <?php echo APP_VERSION; ?>
            </p>
        </div>
    </div>
</footer>

<!-- Scripts -->
<!-- Leaflet JS -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<!-- Windy Map (Optional) -->
<script src="https://api.windy.com/assets/map-forecast/libBoot.js"></script>

<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<!-- Supabase -->
<script src="https://unpkg.com/@supabase/supabase-js@2"></script>

<!-- App Scripts -->
<script src="<?php echo asset_url('js/config.js'); ?>"></script>
<script src="<?php echo asset_url('js/ai-model.js'); ?>"></script>
<script src="<?php echo asset_url('js/api.js'); ?>"></script>
<script src="<?php echo asset_url('js/ui.js'); ?>"></script>
<script src="<?php echo asset_url('js/app.js'); ?>"></script>
</body>

</html>