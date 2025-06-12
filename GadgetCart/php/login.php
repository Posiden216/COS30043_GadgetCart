<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

// Read and decode incoming JSON
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

// Validate input
if (!isset($data['email'], $data['password'])) {
    echo json_encode(['success' => false, 'error' => 'Missing email or password']);
    exit;
}

$email = $data['email'];
$password = $data['password']; // Note: Stored as plain text, which is insecure for production

// Connect to MySQL
$conn = new mysqli('localhost', 'root', '', 'gadgetcart');

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit;
}

// Query user by email
$stmt = $conn->prepare("SELECT id, name, email, password, address, payment_method FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

// Check if user exists
if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'error' => 'Email not found']);
    $stmt->close();
    $conn->close();
    exit;
}

$user = $result->fetch_assoc();

// Check password
if ($user['password'] !== $password) {
    echo json_encode(['success' => false, 'error' => 'Incorrect password']);
    $stmt->close();
    $conn->close();
    exit;
}

// Login successful - return full user info
echo json_encode([
    'success' => true,
    'user' => [
        'id' => $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'address' => $user['address'],
        'payment_method' => $user['payment_method']
    ]
]);

$stmt->close();
$conn->close();
?>
