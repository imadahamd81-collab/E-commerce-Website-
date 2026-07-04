<?php
// ============================================
// LOGOUT API
// ============================================

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
?>