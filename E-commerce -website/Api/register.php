<?php
// ============================================
// REGISTER API
// ============================================

require_once '../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);

$firstName = trim($data['firstName'] ?? '');
$lastName = trim($data['lastName'] ?? '');
$email = trim($data['email'] ?? '');
$phone = trim($data['phone'] ?? '');
$password = $data['password'] ?? '';

// Validation
$errors = [];
if (empty($firstName)) $errors[] = 'First name is required';
if (empty($email)) $errors[] = 'Email is required';
if (empty($password)) $errors[] = 'Password is required';
if (strlen($password) < 6) $errors[] = 'Password must be at least 6 characters';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Invalid email format';

if (!empty($errors)) {
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

try {
    // Check if email exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'errors' => ['Email already registered']]);
        exit;
    }
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert user
    $stmt = $pdo->prepare("INSERT INTO users (first_name, last_name, email, phone, password) VALUES (?, ?, ?, ?, ?)");
    $result = $stmt->execute([$firstName, $lastName, $email, $phone, $hashedPassword]);
    
    if ($result) {
        $userId = $pdo->lastInsertId();
        
        // Create cart for user
        $stmt = $pdo->prepare("INSERT INTO carts (user_id) VALUES (?)");
        $stmt->execute([$userId]);
        $cartId = $pdo->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'message' => 'Registration successful',
            'user' => [
                'id' => (int) $userId,
                'firstName' => $firstName,
                'lastName' => $lastName,
                'email' => $email,
                'phone' => $phone
            ],
            'cart' => ['id' => (int) $cartId]
        ]);
    } else {
        echo json_encode(['success' => false, 'errors' => ['Registration failed']]);
    }
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'errors' => ['Database error: ' . $e->getMessage()]]);
}
?>