<?php
header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'), true);

$purchaseId = $data['purchaseId'];
$items = $data['items'];

$mysqli = new mysqli("localhost", "root", "", "gadgetcart");

if ($mysqli->connect_error) {
  echo json_encode(['success' => false, 'error' => 'Database connection failed']);
  exit;
}

foreach ($items as $item) {
  $itemId = intval($item['id']);
  $quantity = intval($item['quantity']);

  $stmt = $mysqli->prepare("UPDATE purchase_items SET quantity = ? WHERE id = ? AND purchase_id = ?");
  $stmt->bind_param("iii", $quantity, $itemId, $purchaseId);
  $stmt->execute();
}

echo json_encode(['success' => true]);
$mysqli->close();
?>
