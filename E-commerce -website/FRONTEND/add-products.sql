-- Run this in phpMyAdmin if database already exists (adds categories + products)

INSERT INTO categories (name, slug, icon) VALUES
('Beauty', 'beauty', 'fa-spa'),
('Accessories', 'accessories', 'fa-gem')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO products (name, slug, description, price, compare_price, category_id, image, stock, featured, rating, num_reviews) VALUES
-- Electronics
('Smart Speaker Alexa', 'smart-speaker', 'Voice-controlled smart speaker with premium sound and smart home integration.', 3499.00, 4999.00, 1, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400', 35, 1, 4.7, 98),
('Mechanical Gaming Keyboard', 'mech-keyboard', 'RGB mechanical keyboard with tactile switches for gaming and typing.', 4599.00, 5999.00, 1, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400', 25, 1, 4.8, 156),
('Portable SSD 1TB', 'portable-ssd', 'Ultra-fast USB 3.2 portable SSD for backups and creative workflows.', 6999.00, 8999.00, 1, 'https://images.unsplash.com/photo-1597872200969-2b65d08d6d08?w=400', 40, 0, 4.9, 87),
('HD Webcam Pro', 'hd-webcam', '1080p webcam with auto-focus and noise-reducing dual microphones.', 2499.00, 3499.00, 1, 'https://images.unsplash.com/photo-1587826080696-40c3520a69e5?w=400', 55, 0, 4.5, 63),
-- Clothing
('Premium Hoodie', 'premium-hoodie', 'Soft fleece hoodie with kangaroo pocket — perfect for casual wear.', 1899.00, 2799.00, 2, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', 80, 1, 4.6, 112),
('Formal Cotton Shirt', 'formal-shirt', 'Slim-fit formal shirt in breathable premium cotton.', 1299.00, 1999.00, 2, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', 65, 0, 4.4, 74),
('Running Sneakers', 'running-sneakers', 'Lightweight running shoes with cushioned sole and breathable mesh.', 3299.00, 4499.00, 2, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 45, 1, 4.7, 189),
('Floral Summer Dress', 'summer-dress', 'Elegant floral print dress for parties and everyday summer style.', 2199.00, 3299.00, 2, 'https://images.unsplash.com/photo-1595777459343-496375a487bc?w=400', 30, 0, 4.5, 56),
-- Books
('Mystery Thriller Novel', 'mystery-novel', 'Bestselling page-turner packed with twists and unforgettable characters.', 449.00, 699.00, 3, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', 120, 0, 4.8, 312),
('Science Encyclopedia', 'science-encyclopedia', 'Illustrated encyclopedia covering physics, biology, and space exploration.', 899.00, 1299.00, 3, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 55, 1, 4.9, 145),
('Gourmet Cookbook', 'gourmet-cookbook', '200+ recipes from world cuisines with step-by-step photography.', 749.00, 999.00, 3, 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400', 70, 0, 4.6, 98),
('Self-Help Success Guide', 'self-help-guide', 'Practical strategies for productivity, mindset, and personal growth.', 399.00, NULL, 3, 'https://images.unsplash.com/photo-1456513089070-dd4ae08664df?w=400', 90, 0, 4.7, 267),
-- Home & Kitchen
('Automatic Coffee Maker', 'coffee-maker', 'Programmable drip coffee maker with thermal carafe and timer.', 3999.00, 5499.00, 4, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400', 28, 1, 4.6, 134),
('Non-Stick Cookware Set', 'cookware-set', '5-piece non-stick pan set with even heat distribution.', 2799.00, 3999.00, 4, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', 42, 0, 4.5, 88),
('LED Desk Lamp', 'led-desk-lamp', 'Adjustable LED lamp with 3 brightness modes and USB charging port.', 1299.00, 1899.00, 4, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400', 60, 0, 4.4, 72),
('Digital Air Fryer', 'air-fryer', '4.5L air fryer for healthy cooking with 8 preset programs.', 4999.00, 6499.00, 4, 'https://images.unsplash.com/photo-1585515655854-7b66c2f2e7d2?w=400', 22, 1, 4.8, 201),
-- Sports
('Adjustable Dumbbells 10kg', 'dumbbells-set', 'Pair of adjustable dumbbells for home strength training.', 2999.00, 3999.00, 5, 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400', 35, 1, 4.7, 93),
('Resistance Bands Kit', 'resistance-bands', 'Complete resistance band set with handles, anchors, and carry bag.', 899.00, 1499.00, 5, 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400', 85, 0, 4.5, 67),
('Speed Jump Rope', 'jump-rope', 'Professional speed rope with ball bearings for cardio workouts.', 499.00, 799.00, 5, 'https://images.unsplash.com/photo-1594381898411-846e7d193763?w=400', 100, 0, 4.3, 41),
('2-Person Camping Tent', 'camping-tent', 'Waterproof lightweight tent ideal for hiking and weekend camping.', 4499.00, 5999.00, 5, 'https://images.unsplash.com/photo-1478131143088-4e6b9102beed?w=400', 18, 0, 4.6, 54),
-- Beauty
('Hydrating Face Moisturizer', 'face-moisturizer', 'Daily moisturizer with hyaluronic acid for all skin types.', 899.00, 1299.00, 6, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', 95, 1, 4.7, 178),
('Keratin Hair Serum', 'hair-serum', 'Frizz-control serum that adds shine and protects from heat damage.', 649.00, 999.00, 6, 'https://images.unsplash.com/photo-1522338242992-e783a415da9a?w=400', 70, 0, 4.5, 89),
('Matte Lipstick Set', 'lipstick-set', 'Set of 6 long-lasting matte lipsticks in trending shades.', 1199.00, 1799.00, 6, 'https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=400', 50, 0, 4.6, 124),
('SPF 50 Sunscreen', 'sunscreen-spf50', 'Broad-spectrum sunscreen with lightweight, non-greasy formula.', 549.00, 799.00, 6, 'https://images.unsplash.com/photo-1556229010-aaec3b54f2d4?w=400', 110, 0, 4.8, 203),
-- Accessories
('Genuine Leather Wallet', 'leather-wallet', 'Handcrafted bi-fold wallet with RFID blocking and card slots.', 1499.00, 2299.00, 7, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400', 75, 0, 4.6, 96),
('Polarized Sunglasses', 'polarized-sunglasses', 'UV400 polarized sunglasses with metal frame and case.', 1999.00, 2999.00, 7, 'https://images.unsplash.com/photo-1572635196233-14f2503ffd79?w=400', 48, 1, 4.7, 142),
('Travel Backpack 40L', 'travel-backpack', 'Durable water-resistant backpack with laptop sleeve and USB port.', 2499.00, 3499.00, 7, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 38, 1, 4.8, 167),
('Smart Watch Strap', 'watch-strap', 'Premium silicone smart watch band — compatible with most 22mm watches.', 699.00, 999.00, 7, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 120, 0, 4.4, 58);
