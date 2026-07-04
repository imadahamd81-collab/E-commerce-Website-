-- ============================================
-- DATABASE: ecommerce
-- ============================================

DROP DATABASE IF EXISTS ecommerce;
CREATE DATABASE ecommerce;
USE ecommerce;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    icon VARCHAR(50)
);

CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2),
    category_id INT,
    image VARCHAR(255),
    stock INT DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0,
    num_reviews INT DEFAULT 0,
    colors VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE carts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(50) DEFAULT 'India',
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT 'COD',
    is_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

INSERT INTO categories (name, slug, icon) VALUES
('Electronics', 'electronics', 'fa-laptop'),
('Clothing', 'clothing', 'fa-tshirt'),
('Books', 'books', 'fa-book'),
('Home & Kitchen', 'home-kitchen', 'fa-home'),
('Sports', 'sports', 'fa-dumbbell'),
('Beauty', 'beauty', 'fa-spa'),
('Accessories', 'accessories', 'fa-gem');

INSERT INTO products (name, slug, description, price, compare_price, category_id, image, stock, featured, rating, num_reviews) VALUES
('Wireless Bluetooth Headphones', 'wireless-headphones', 'Premium noise-cancelling wireless headphones with 30-hour battery life.', 2999.00, 4999.00, 1, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 50, 1, 4.8, 124),
('Smart Fitness Tracker Watch', 'fitness-tracker', 'Track your daily activity, heart rate, sleep patterns, and more.', 1999.00, 2999.00, 1, 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400', 30, 1, 4.6, 89),
('Premium Cotton T-Shirt', 'cotton-tshirt', '100% organic cotton t-shirt with a classic fit.', 799.00, 1299.00, 2, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 100, 1, 4.5, 67),
('The Art of Programming Book', 'programming-book', 'A comprehensive guide to modern programming practices.', 599.00, NULL, 3, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400', 45, 0, 4.9, 203),
('Stainless Steel Water Bottle', 'water-bottle', 'Premium double-walled insulated water bottle.', 899.00, 1499.00, 4, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400', 75, 0, 4.7, 156),
('Yoga Mat Premium', 'yoga-mat', 'Professional grade yoga mat with extra thickness for comfort.', 1499.00, 1999.00, 5, 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=400', 20, 0, 4.4, 78),
('Wireless Charging Pad', 'wireless-charger', 'Fast wireless charging pad compatible with all Qi-enabled devices.', 1299.00, 1999.00, 1, 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=400', 40, 0, 4.3, 45),
('Classic Denim Jeans', 'denim-jeans', 'Classic straight-fit denim jeans made from premium quality cotton.', 1499.00, 2499.00, 2, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400', 60, 0, 4.6, 92),
('Smart Speaker Alexa', 'smart-speaker', 'Voice-controlled smart speaker with premium sound and smart home integration.', 3499.00, 4999.00, 1, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400', 35, 1, 4.7, 98),
('Mechanical Gaming Keyboard', 'mech-keyboard', 'RGB mechanical keyboard with tactile switches for gaming and typing.', 4599.00, 5999.00, 1, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400', 25, 1, 4.8, 156),
('Portable SSD 1TB', 'portable-ssd', 'Ultra-fast USB 3.2 portable SSD for backups and creative workflows.', 6999.00, 8999.00, 1, 'https://images.unsplash.com/photo-1597872200969-2b65d08d6d08?w=400', 40, 0, 4.9, 87),
('HD Webcam Pro', 'hd-webcam', '1080p webcam with auto-focus and noise-reducing dual microphones.', 2499.00, 3499.00, 1, 'https://images.unsplash.com/photo-1587826080696-40c3520a69e5?w=400', 55, 0, 4.5, 63),
('Premium Hoodie', 'premium-hoodie', 'Soft fleece hoodie with kangaroo pocket — perfect for casual wear.', 1899.00, 2799.00, 2, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', 80, 1, 4.6, 112),
('Formal Cotton Shirt', 'formal-shirt', 'Slim-fit formal shirt in breathable premium cotton.', 1299.00, 1999.00, 2, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', 65, 0, 4.4, 74),
('Running Sneakers', 'running-sneakers', 'Lightweight running shoes with cushioned sole and breathable mesh.', 3299.00, 4499.00, 2, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 45, 1, 4.7, 189),
('Floral Summer Dress', 'summer-dress', 'Elegant floral print dress for parties and everyday summer style.', 2199.00, 3299.00, 2, 'https://images.unsplash.com/photo-1595777459343-496375a487bc?w=400', 30, 0, 4.5, 56),
('Mystery Thriller Novel', 'mystery-novel', 'Bestselling page-turner packed with twists and unforgettable characters.', 449.00, 699.00, 3, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', 120, 0, 4.8, 312),
('Science Encyclopedia', 'science-encyclopedia', 'Illustrated encyclopedia covering physics, biology, and space exploration.', 899.00, 1299.00, 3, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 55, 1, 4.9, 145),
('Gourmet Cookbook', 'gourmet-cookbook', '200+ recipes from world cuisines with step-by-step photography.', 749.00, 999.00, 3, 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400', 70, 0, 4.6, 98),
('Self-Help Success Guide', 'self-help-guide', 'Practical strategies for productivity, mindset, and personal growth.', 399.00, NULL, 3, 'https://images.unsplash.com/photo-1456513089070-dd4ae08664df?w=400', 90, 0, 4.7, 267),
('Automatic Coffee Maker', 'coffee-maker', 'Programmable drip coffee maker with thermal carafe and timer.', 3999.00, 5499.00, 4, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400', 28, 1, 4.6, 134),
('Non-Stick Cookware Set', 'cookware-set', '5-piece non-stick pan set with even heat distribution.', 2799.00, 3999.00, 4, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', 42, 0, 4.5, 88),
('LED Desk Lamp', 'led-desk-lamp', 'Adjustable LED lamp with 3 brightness modes and USB charging port.', 1299.00, 1899.00, 4, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400', 60, 0, 4.4, 72),
('Digital Air Fryer', 'air-fryer', '4.5L air fryer for healthy cooking with 8 preset programs.', 4999.00, 6499.00, 4, 'https://images.unsplash.com/photo-1585515655854-7b66c2f2e7d2?w=400', 22, 1, 4.8, 201),
('Adjustable Dumbbells 10kg', 'dumbbells-set', 'Pair of adjustable dumbbells for home strength training.', 2999.00, 3999.00, 5, 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400', 35, 1, 4.7, 93),
('Resistance Bands Kit', 'resistance-bands', 'Complete resistance band set with handles, anchors, and carry bag.', 899.00, 1499.00, 5, 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400', 85, 0, 4.5, 67),
('Speed Jump Rope', 'jump-rope', 'Professional speed rope with ball bearings for cardio workouts.', 499.00, 799.00, 5, 'https://images.unsplash.com/photo-1594381898411-846e7d193763?w=400', 100, 0, 4.3, 41),
('2-Person Camping Tent', 'camping-tent', 'Waterproof lightweight tent ideal for hiking and weekend camping.', 4499.00, 5999.00, 5, 'https://images.unsplash.com/photo-1478131143088-4e6b9102beed?w=400', 18, 0, 4.6, 54),
('Hydrating Face Moisturizer', 'face-moisturizer', 'Daily moisturizer with hyaluronic acid for all skin types.', 899.00, 1299.00, 6, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', 95, 1, 4.7, 178),
('Keratin Hair Serum', 'hair-serum', 'Frizz-control serum that adds shine and protects from heat damage.', 649.00, 999.00, 6, 'https://images.unsplash.com/photo-1522338242992-e783a415da9a?w=400', 70, 0, 4.5, 89),
('Matte Lipstick Set', 'lipstick-set', 'Set of 6 long-lasting matte lipsticks in trending shades.', 1199.00, 1799.00, 6, 'https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=400', 50, 0, 4.6, 124),
('SPF 50 Sunscreen', 'sunscreen-spf50', 'Broad-spectrum sunscreen with lightweight, non-greasy formula.', 549.00, 799.00, 6, 'https://images.unsplash.com/photo-1556229010-aaec3b54f2d4?w=400', 110, 0, 4.8, 203),
('Genuine Leather Wallet', 'leather-wallet', 'Handcrafted bi-fold wallet with RFID blocking and card slots.', 1499.00, 2299.00, 7, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400', 75, 0, 4.6, 96),
('Polarized Sunglasses', 'polarized-sunglasses', 'UV400 polarized sunglasses with metal frame and case.', 1999.00, 2999.00, 7, 'https://images.unsplash.com/photo-1572635196233-14f2503ffd79?w=400', 48, 1, 4.7, 142),
('Travel Backpack 40L', 'travel-backpack', 'Durable water-resistant backpack with laptop sleeve and USB port.', 2499.00, 3499.00, 7, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 38, 1, 4.8, 167),
('Smart Watch Strap', 'watch-strap', 'Premium silicone smart watch band — compatible with most 22mm watches.', 699.00, 999.00, 7, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 120, 0, 4.4, 58);

INSERT INTO users (first_name, last_name, email, phone, password) VALUES
('John', 'Doe', 'john@example.com', '9876543210', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

INSERT INTO carts (user_id) VALUES (1);