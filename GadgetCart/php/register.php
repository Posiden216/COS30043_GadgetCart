<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

// Read and decode incoming JSON
$input = json_decode(file_get_contents("php://input"), true);

// Basic input validation
if (
    empty($input['name']) ||
    empty($input['email']) ||
    empty($input['password']) ||
    empty($input['address']) ||
    empty($input['payment_method'])
) {
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

$name = trim($input['name']);
$email = trim($input['email']);
$password = $input['password']; // Stored as plain text per your choice
$address = trim($input['address']);
$payment_method = trim($input['payment_method']);

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'error' => 'Invalid email format']);
    exit;
}

try {
    // Connect to database
    $pdo = new PDO("mysql:host=localhost;dbname=gadgetcart", "root", "", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    // Check if email is already registered
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);

    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'error' => 'Email already registered']);
        exit;
    }

    // Insert new user into the database
    $stmt = $pdo->prepare("
        INSERT INTO users (name, email, password, address, payment_method, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
    ");
    $stmt->execute([$name, $email, $password, $address, $payment_method]);

    // Success
    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
