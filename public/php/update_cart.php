<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$userId = $data['userId'] ?? null;
$cart = $data['cart'] ?? [];

if (!$userId || !is_array($cart)) {
  echo json_encode(['success' => false, 'error' => 'Invalid input']);
  exit;
}

// DB connection
$host = 'localhost';
$db = 'gadgetcart';
$user = 'root';
$pass = '';
$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
  echo json_encode(['success' => false, 'error' => 'DB connection failed']);
  exit;
}

$conn->begin_transaction();

try {
  // Clear existing cart for this user
  $deleteStmt = $conn->prepare("DELETE FROM cart WHERE user_id = ?");
  $deleteStmt->bind_param("i", $userId);
  $deleteStmt->execute();
  $deleteStmt->close();

  // Insert new cart items
  $insertStmt = $conn->prepare("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)");
  foreach ($cart as $item) {
    $productId = $item['id'];
    $quantity = $item['quantity'];
    $insertStmt->bind_param("iii", $userId, $productId, $quantity);
    $insertStmt->execute();
  }
  $insertStmt->close();

  $conn->commit();
  echo json_encode(['success' => true]);
} catch (Exception $e) {
  $conn->rollback();
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn->close();