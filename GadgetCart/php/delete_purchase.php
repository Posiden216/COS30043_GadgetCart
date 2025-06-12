<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

// Decode input
$data = json_decode(file_get_contents("php://input"), true);
$purchaseId = $data['purchaseId'] ?? null;
$userId = $data['userId'] ?? null;

if (!$purchaseId || !$userId) {
  echo json_encode(['success' => false, 'error' => 'Missing purchase ID or user ID']);
  exit;
}

// Connect to database
$conn = new mysqli("localhost", "root", "", "gadgetcart");

if ($conn->connect_error) {
  echo json_encode(['success' => false, 'error' => 'Database connection failed']);
  exit;
}

// Check that the purchase belongs to the user
$checkStmt = $conn->prepare("SELECT 1 FROM purchases WHERE purchase_id = ? AND user_id = ?");
$checkStmt->bind_param("ii", $purchaseId, $userId);
$checkStmt->execute();
$checkStmt->store_result();

if ($checkStmt->num_rows === 0) {
  echo json_encode(['success' => false, 'error' => 'Unauthorized or purchase not found']);
  $checkStmt->close();
  $conn->close();
  exit;
}
$checkStmt->close();

// Begin transaction
$conn->begin_transaction();

try {
  // Delete purchase (cascades to purchase_items)
  $stmt = $conn->prepare("DELETE FROM purchases WHERE purchase_id = ?");
  $stmt->bind_param("i", $purchaseId);
  $stmt->execute();
  $stmt->close();

  $conn->commit();
  echo json_encode(['success' => true]);
} catch (Exception $e) {
  $conn->rollback();
  echo json_encode(['success' => false, 'error' => 'Delete failed: ' . $e->getMessage()]);
}

$conn->close();
