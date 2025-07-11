<?php
// login.php
include '../config.php'; // Adjust path if necessary
include '../db_connect.php'; // Adjust path if necessary

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->email) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode(["message" => "Missing email or password."]);
    exit();
}

$email = $data->email;
$password = $data->password;

$query = "SELECT id, email, password_hash, role FROM users WHERE email = $1";
$result = pg_query_params($conn, $query, array($email));

if ($result && pg_num_rows($result) === 1) {
    $user = pg_fetch_assoc($result);
    if (password_verify($password, $user['password_hash'])) {
        // Password is correct!
        http_response_code(200);
        echo json_encode([
            "message" => "Login successful!",
            "user" => [
                "id" => $user['id'],
                "email" => $user['email'],
                "role" => $user['role']
                // In a real app, you'd generate and return a JWT token here
            ]
        ]);
    } else {
        http_response_code(401); // Unauthorized
        echo json_encode(["message" => "Invalid credentials."]);
    }
} else {
    http_response_code(401); // Unauthorized
    echo json_encode(["message" => "Invalid credentials."]);
}

pg_close($conn);
?>