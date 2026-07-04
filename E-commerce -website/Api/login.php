<?php
// ============================================
// LOGIN API
// ============================================

require_once '../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);

$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Email and password are required']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
        exit;
    }
    
    if (!password_verify($password, $user['password'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
        exit;
    }
    
    // Get active cart
    $stmt = $pdo->prepare("SELECT id FROM carts WHERE user_id = ? AND is_active = 1");
    $stmt->execute([$user['id']]);
    $cart = $stmt->fetch();
    
    if (!$cart) {
        $stmt = $pdo->prepare("INSERT INTO carts (user_id) VALUES (?)");
        $stmt->execute([$user['id']]);
        $cartId = $pdo->lastInsertId();
    } else {
        $cartId = $cart['id'];
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'user' => [
            'id' => (int) $user['id'],
            'firstName' => $user['first_name'],
            'lastName' => $user['last_name'],
            'email' => $user['email'],
            'phone' => $user['phone']
        ],
        'cart' => ['id' => $cartId]
    ]);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>