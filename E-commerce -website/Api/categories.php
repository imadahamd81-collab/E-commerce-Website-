<?php
// ============================================
// CATEGORIES API
// ============================================

require_once '../config/database.php';

try {
    $stmt = $pdo->query("
        SELECT c.id, c.name, c.slug, c.icon, COUNT(p.id) AS product_count
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id AND p.stock > 0
        GROUP BY c.id, c.name, c.slug, c.icon
        ORDER BY c.name ASC
    ");
    $categories = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'categories' => $categories
    ]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
