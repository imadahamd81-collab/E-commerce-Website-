<?php
// ============================================
// ORDERS API
// ============================================

require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$rawInput = file_get_contents('php://input');
$data = $rawInput ? (json_decode($rawInput, true) ?? []) : [];

$userId = $data['user_id'] ?? $_GET['user_id'] ?? null;
$userId = $userId ? (int) $userId : null;

if (!$userId) {
    echo json_encode(['success' => false, 'message' => 'User ID required']);
    exit;
}

try {
    // GET - View orders
    if ($method == 'GET') {
        $stmt = $pdo->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$userId]);
        $orders = $stmt->fetchAll();
        
        foreach ($orders as &$order) {
            $stmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id = ?");
            $stmt->execute([$order['id']]);
            $order['items'] = $stmt->fetchAll();
        }
        
        echo json_encode(['success' => true, 'orders' => $orders]);
        exit;
    }
    
    // POST - Create order
    if ($method == 'POST') {
        $required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                echo json_encode(['success' => false, 'message' => 'Saari shipping details bharein']);
                exit;
            }
        }

        // Get cart items
        $stmt = $pdo->prepare("
            SELECT ci.*, p.price, p.name 
            FROM cart_items ci 
            JOIN products p ON ci.product_id = p.id 
            WHERE ci.cart_id = (SELECT id FROM carts WHERE user_id = ? AND is_active = 1)
        ");
        $stmt->execute([$userId]);
        $cartItems = $stmt->fetchAll();
        
        if (empty($cartItems)) {
            echo json_encode(['success' => false, 'message' => 'Cart is empty']);
            exit;
        }
        
        $total = 0;
        foreach ($cartItems as $item) {
            $total += $item['price'] * $item['quantity'];
        }
        
        $orderNumber = 'ORD-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
        
        // Create order
        $stmt = $pdo->prepare("
            INSERT INTO orders (
                order_number, user_id, first_name, last_name, email, phone, 
                address, city, state, zip_code, country, total_amount, 
                payment_method, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $orderNumber,
            $userId,
            $data['firstName'],
            $data['lastName'],
            $data['email'],
            $data['phone'],
            $data['address'],
            $data['city'],
            $data['state'],
            $data['zipCode'],
            $data['country'] ?? 'India',
            $total,
            $data['paymentMethod'] ?? 'COD',
            'pending'
        ]);
        
        $orderId = $pdo->lastInsertId();
        
        // Create order items and update stock
        foreach ($cartItems as $item) {
            $stmt = $pdo->prepare("INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $orderId,
                $item['product_id'],
                $item['name'],
                $item['quantity'],
                $item['price']
            ]);
            
            $stmt = $pdo->prepare("UPDATE products SET stock = stock - ? WHERE id = ?");
            $stmt->execute([$item['quantity'], $item['product_id']]);
        }
        
        // Deactivate old cart
        $stmt = $pdo->prepare("UPDATE carts SET is_active = 0 WHERE user_id = ? AND is_active = 1");
        $stmt->execute([$userId]);
        
        // Create new cart
        $stmt = $pdo->prepare("INSERT INTO carts (user_id) VALUES (?)");
        $stmt->execute([$userId]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Order placed successfully',
            'order_id' => $orderId,
            'order_number' => $orderNumber
        ]);
        exit;
    }
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>