<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

// Decode input
$data = json_decode(file_get_contents("php://input"), true);

session_start();
$userId = $_SESSION['user_id'] ?? null;
$cart = $data['cart'] ?? [];

if (!$userId || !is_array($cart)) {
  echo json_encode(['success' => false, 'error' => 'Invalid or missing data']);
  exit;
}

// Connect to database
$conn = new mysqli("localhost", "root", "", "gadgetcart");

if ($conn->connect_error) {
  echo json_encode(['success' => false, 'error' => 'Database connection failed']);
  exit;
}

// Clear user's existing cart
$deleteStmt = $conn->prepare("DELETE FROM cart WHERE user_id = ?");
$deleteStmt->bind_param("i", $userId);
$deleteStmt->execute();
$deleteStmt->close();

// Insert updated cart items
$insertStmt = $conn->prepare("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)");

foreach ($cart as $item) {
  $productId = intval($item['id']);
  $quantity = intval($item['quantity']);
  $insertStmt->bind_param("iii", $userId, $productId, $quantity);
  $insertStmt->execute();
}

$insertStmt->close();
$conn->close();

echo json_encode(['success' => true]);