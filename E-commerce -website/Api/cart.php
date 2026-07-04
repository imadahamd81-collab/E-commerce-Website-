<?php
// ============================================
// CART API
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
    // Get or create cart
    $stmt = $pdo->prepare("SELECT id FROM carts WHERE user_id = ? AND is_active = 1");
    $stmt->execute([$userId]);
    $cart = $stmt->fetch();
    
    if (!$cart) {
        $stmt = $pdo->prepare("INSERT INTO carts (user_id) VALUES (?)");
        $stmt->execute([$userId]);
        $cartId = $pdo->lastInsertId();
    } else {
        $cartId = $cart['id'];
    }
    
    // GET - View cart
    if ($method == 'GET') {
        $stmt = $pdo->prepare("
            SELECT ci.*, p.name, p.price, p.image 
            FROM cart_items ci 
            JOIN products p ON ci.product_id = p.id 
            WHERE ci.cart_id = ?
        ");
        $stmt->execute([$cartId]);
        $items = $stmt->fetchAll();
        
        $total = 0;
        foreach ($items as $item) {
            $total += $item['price'] * $item['quantity'];
        }
        
        echo json_encode([
            'success' => true,
            'cart' => [
                'id' => $cartId,
                'items' => $items,
                'total' => $total,
                'count' => count($items)
            ]
        ]);
        exit;
    }
    
    // POST - Add to cart
    if ($method == 'POST') {
        $productId = isset($data['product_id']) ? (int) $data['product_id'] : null;
        $quantity = isset($data['quantity']) ? (int) $data['quantity'] : 1;
        
        if (!$productId) {
            echo json_encode(['success' => false, 'message' => 'Product ID required']);
            exit;
        }
        
        $stmt = $pdo->prepare("SELECT stock FROM products WHERE id = ?");
        $stmt->execute([$productId]);
        $product = $stmt->fetch();
        
        if (!$product || $product['stock'] < $quantity) {
            echo json_encode(['success' => false, 'message' => 'Not enough stock']);
            exit;
        }
        
        $stmt = $pdo->prepare("SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?");
        $stmt->execute([$cartId, $productId]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            $newQuantity = $existing['quantity'] + $quantity;
            if ($product['stock'] < $newQuantity) {
                echo json_encode(['success' => false, 'message' => 'Not enough stock']);
                exit;
            }
            $stmt = $pdo->prepare("UPDATE cart_items SET quantity = ? WHERE id = ?");
            $stmt->execute([$newQuantity, $existing['id']]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)");
            $stmt->execute([$cartId, $productId, $quantity]);
        }
        
        echo json_encode(['success' => true, 'message' => 'Added to cart']);
        exit;
    }
    
    // PUT - Update quantity
    if ($method == 'PUT') {
        $itemId = $data['item_id'] ?? null;
        $quantity = $data['quantity'] ?? 1;
        
        if (!$itemId) {
            echo json_encode(['success' => false, 'message' => 'Item ID required']);
            exit;
        }
        
        if ($quantity <= 0) {
            $stmt = $pdo->prepare("DELETE FROM cart_items WHERE id = ? AND cart_id = ?");
            $stmt->execute([$itemId, $cartId]);
            echo json_encode(['success' => true, 'message' => 'Item removed']);
            exit;
        }
        
        $stmt = $pdo->prepare("UPDATE cart_items SET quantity = ? WHERE id = ? AND cart_id = ?");
        $stmt->execute([$quantity, $itemId, $cartId]);
        
        echo json_encode(['success' => true, 'message' => 'Cart updated']);
        exit;
    }
    
    // DELETE - Remove item
    if ($method == 'DELETE') {
        $itemId = $data['item_id'] ?? null;
        
        if (!$itemId) {
            echo json_encode(['success' => false, 'message' => 'Item ID required']);
            exit;
        }
        
        $stmt = $pdo->prepare("DELETE FROM cart_items WHERE id = ? AND cart_id = ?");
        $stmt->execute([$itemId, $cartId]);
        
        echo json_encode(['success' => true, 'message' => 'Item removed']);
        exit;
    }
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}