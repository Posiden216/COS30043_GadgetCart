<?php
// Enable errors
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

// DB connection
$host = 'localhost';
$db = 'gadgetcart';
$user = 'root';
$pass = '';
$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit;
}

// Read input
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['userId']) || !isset($data['cart']) || !is_array($data['cart'])) {
    echo json_encode(['success' => false, 'error' => 'Missing user ID or cart']);
    exit;
}

$userId = intval($data['userId']);
$cart = $data['cart'];

// Get user name
$stmt = $conn->prepare("SELECT name FROM users WHERE id = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'error' => 'User not found']);
    exit;
}
$userName = $result->fetch_assoc()['name'];
$stmt->close();

// Calculate total
$totalSpent = 0;
foreach ($cart as $item) {
    $totalSpent += $item['price'] * $item['quantity'];
}

// Insert purchase
$stmt = $conn->prepare("INSERT INTO purchases (user_id, total_spent, user_name) VALUES (?, ?, ?)");
$stmt->bind_param("ids", $userId, $totalSpent, $userName);
if (!$stmt->execute()) {
    echo json_encode(['success' => false, 'error' => 'Failed to save purchase']);
    exit;
}
$purchaseId = $stmt->insert_id;
$stmt->close();

// Insert items
$stmt = $conn->prepare("INSERT INTO purchase_items (purchase_id, product_id, name, category, price, quantity, image) VALUES (?, ?, ?, ?, ?, ?, ?)");
foreach ($cart as $item) {
    $stmt->bind_param(
        "iissdis",
        $purchaseId,
        $item['id'],
        $item['name'],
        $item['category'],
        $item['price'],
        $item['quantity'],
        $item['image']
    );
    $stmt->execute();
}
$stmt->close();

$conn->close();

echo json_encode(['success' => true]);
