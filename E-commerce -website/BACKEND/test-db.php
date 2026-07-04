<?php
// ============================================
// TEST DATABASE CONNECTION
// ============================================

$host = 'localhost';
$dbname = 'ecommerce';
$username = 'root';
$password = '';

echo "<h1>Database Connection Test</h1>";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<p style='color:green;'>✅ Database connected successfully!</p>";
    
    // Test query
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    echo "<p>📊 Total users: " . $result['count'] . "</p>";
    
    // Show all tables
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "<h3>📋 Tables in database:</h3>";
    echo "<ul>";
    foreach ($tables as $table) {
        echo "<li>" . $table . "</li>";
    }
    echo "</ul>";
    
} catch(PDOException $e) {
    echo "<p style='color:red;'>❌ Database connection failed: " . $e->getMessage() . "</p>";
    echo "<p>💡 Make sure:</p>";
    echo "<ul>";
    echo "<li>XAMPP is running (Apache + MySQL)</li>";
    echo "<li>Database 'ecommerce' exists</li>";
    echo "<li>Username: root, Password: (empty)</li>";
    echo "</ul>";
}
?>