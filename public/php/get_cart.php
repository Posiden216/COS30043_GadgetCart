<?php
session_start(); // 🔥 Add this
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

// Get user from session
$userId = $_SESSION['user_id'] ?? null;

if (!$userId) {
  echo json_encode(['success' => false, 'error' => 'User not logged in']);
  exit;
}


try {
  // Load all products from JSON
  $products = json_decode(file_get_contents('../data/products.json'), true);
  $productMap = [];
  foreach ($products as $p) {
    $productMap[$p['id']] = $p;
  }

  // Connect to database
  $conn = new mysqli("localhost", "root", "", "gadgetcart");

  if ($conn->connect_error) {
    throw new Exception("Database connection failed");
  }

  // Get cart items for user
  $stmt = $conn->prepare("SELECT product_id, quantity FROM cart WHERE user_id = ?");
  $stmt->bind_param("i", $userId);
  $stmt->execute();
  $result = $stmt->get_result();

  $cart = [];
  while ($row = $result->fetch_assoc()) {
    $productId = $row['product_id'];
    $quantity = $row['quantity'];

    if (isset($productMap[$productId])) {
      $cart[] = [
        'product_id' => $productId,
        'quantity' => $quantity
      ];
    }
  }

  $stmt->close();
  $conn->close();

  echo json_encode(['success' => true, 'cart' => $cart]);
} catch (Exception $e) {
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}