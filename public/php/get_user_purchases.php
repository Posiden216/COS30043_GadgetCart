<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Send JSON response
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

// Get user ID from GET (adjust this if your frontend sends it via POST)
$userId = isset($_GET['userId']) ? intval($_GET['userId']) : 0;

if ($userId <= 0) {
    echo json_encode(['success' => false, 'error' => 'Missing or invalid user ID']);
    exit;
}

// Fetch purchases
$stmt = $conn->prepare("SELECT purchase_id, total_spent, purchase_date FROM purchases WHERE user_id = ? ORDER BY purchase_date DESC");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$purchases = [];
while ($row = $result->fetch_assoc()) {
    $purchaseId = $row['purchase_id'];

    // Get items for each purchase
    $itemStmt = $conn->prepare("SELECT * FROM purchase_items WHERE purchase_id = ?");
    $itemStmt->bind_param("i", $purchaseId);
    $itemStmt->execute();
    $itemsResult = $itemStmt->get_result();

    $items = [];
    while ($item = $itemsResult->fetch_assoc()) {
        $items[] = $item;
    }
    $itemStmt->close();

    $purchases[] = [
        'id' => $purchaseId,
        'total_spent' => $row['total_spent'],
        'purchase_date' => $row['purchase_date'],
        'items' => $items,
        'items_bought' => count($items)
    ];
}

$stmt->close();
$conn->close();

echo json_encode(['success' => true, 'purchases' => $purchases]);
