<?php
// ============================================
// PRODUCTS API
// ============================================

require_once '../config/database.php';

try {
    $stmt = $pdo->query("
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.stock > 0
        ORDER BY p.featured DESC, p.created_at DESC
    ");
    $products = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'products' => $products
    ]);
    
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>