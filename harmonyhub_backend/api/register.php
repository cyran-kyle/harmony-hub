<?php
// register.php
include '../config.php'; // Adjust path if necessary
include '../db_connect.php'; // Adjust path if necessary

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->email) || !isset($data->password) || !isset($data->role)) {
    http_response_code(400);
    echo json_encode(["message" => "Missing required fields."]);
    exit();
}

$email = $data->email;
$password = $data->password; // Plain password from frontend
$role = $data->role;

// Hash the password
$password_hash = password_hash($password, PASSWORD_DEFAULT);

// Generate a unique user ID
$id = uniqid('user_'); // Example: user_65f3a7b8c9d0e

// Check if email already exists
$query = "SELECT id FROM users WHERE email = $1";
$result = pg_query_params($conn, $query, array($email));

if (pg_num_rows($result) > 0) {
    http_response_code(409); // Conflict
    echo json_encode(["message" => "User with this email already exists."]);
    pg_close($conn);
    exit();
}

// Start a transaction for atomicity
pg_query($conn, "BEGIN");

try {
    // Insert into users table
    $query = "INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, $3, $4)";
    pg_query_params($conn, $query, array($id, $email, $password_hash, $role));

    if ($role === 'coach') {
        // Insert into coaches table if role is coach
        $name = $data->name ?? 'New Coach';
        $instrument = $data->instrument ?? 'N/A';
        $genre = $data->genre ?? 'N/A';
        $location = $data->location ?? 'N/A';
        $bio = $data->bio ?? 'No bio yet.';
        $photoUrl = $data->photoUrl ?? "https://placehold.co/150x150/E0E0E0/333333?text=" . urlencode(substr($name, 0, 2));
        $phone = $data->phone ?? 'N/A';

        $query = "INSERT INTO coaches (id, name, instrument, genre, location, bio, photo_url, phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";
        pg_query_params($conn, $query, array($id, $name, $instrument, $genre, $location, $bio, $photoUrl, $phone));
    }

    pg_query($conn, "COMMIT");
    http_response_code(201); // Created
    echo json_encode(["message" => "Registration successful!", "userId" => $id, "role" => $role]);

} catch (Exception $exception) {
    pg_query($conn, "ROLLBACK");
    http_response_code(500); // Internal Server Error
    echo json_encode(["message" => "Registration failed: " . $exception->getMessage()]);
}

pg_close($conn);
?>