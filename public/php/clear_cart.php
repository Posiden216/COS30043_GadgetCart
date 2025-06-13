<?php
header('Content-Type: application/json');
require_once '../db/connection.php';

$data = json_decode(file_get_contents('php://input'), true);
$userId = $data['user_id'] ?? null;

if (!$userId) {
  echo json_encode(['success' => false, 'error' => 'User ID required.']);
  exit;
}

try {
  $stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ?");
  $stmt->execute([$userId]);
  echo json_encode(['success' => true]);
} catch (Exception $e) {
  echo json_encode(['success' => false, 'error' => 'Failed to clear cart.']);
}
