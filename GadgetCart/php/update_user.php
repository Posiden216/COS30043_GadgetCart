<?php
// Enable error reporting (development only)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

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

// Parse input JSON
$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    echo json_encode(['success' => false, 'error' => 'Invalid JSON input']);
    exit;
}

// Validate input
if (!isset($data['id']) || !is_numeric($data['id'])) {
    echo json_encode(['success' => false, 'error' => 'Missing or invalid user ID']);
    exit;
}

$userId = intval($data['id']);
$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$address = trim($data['address'] ?? '');
$payment_method = trim($data['payment_method'] ?? '');
$currentPassword = $data['current_password'] ?? '';
$newPassword = $data['new_password'] ?? '';

// Fetch existing user
$stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'error' => 'User not found']);
    exit;
}

$user = $result->fetch_assoc();

// Handle password change
if (!empty($newPassword)) {
    if (empty($currentPassword)) {
        echo json_encode(['success' => false, 'error' => 'Current password required']);
        exit;
    }

    // Password check (plain text — insecure in production!)
    if ($user['password'] !== $currentPassword) {
        echo json_encode(['success' => false, 'error' => 'Current password is incorrect']);
        exit;
    }

    // Save new password (no hashing since you store in plain text)
    $stmt = $conn->prepare("UPDATE users SET name = ?, email = ?, address = ?, payment_method = ?, password = ? WHERE id = ?");
    $stmt->bind_param("sssssi", $name, $email, $address, $payment_method, $newPassword, $userId);
} else {
    // No password change
    $stmt = $conn->prepare("UPDATE users SET name = ?, email = ?, address = ?, payment_method = ? WHERE id = ?");
    $stmt->bind_param("ssssi", $name, $email, $address, $payment_method, $userId);
}

// Execute update
if ($stmt->execute()) {
    // Return updated user (excluding password)
    $stmt = $conn->prepare("SELECT id, name, email, address, payment_method, created_at FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $updated = $stmt->get_result()->fetch_assoc();

    echo json_encode(['success' => true, 'user' => $updated]);
} else {
    if ($conn->errno === 1062) {
        echo json_encode(['success' => false, 'error' => 'Email already in use']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to update user']);
    }
}

$conn->close();
?>
