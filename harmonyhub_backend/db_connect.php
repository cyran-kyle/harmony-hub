<?php
// db_connect.php

$db_url = "postgresql://cedric:ixQH2b5RUv9r6I1ylncoRA@sadder-captain-14247.8nj.gcp-europe-west1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full";

// Create connection
$conn = pg_connect($db_url);

// Check connection
if ($conn->connect_error) {
    // Log the error for debugging, but don't expose sensitive info to the user
    error_log("Connection failed: " . $conn->connect_error);
    http_response_code(500); // Internal Server Error
    echo json_encode(["message" => "Database connection failed."]);
    exit(); // Stop script execution
}
?>