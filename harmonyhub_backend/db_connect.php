<?php
// db_connect.php

$db_url = "postgresql://cedric:ixQH2b5RUv9r6I1ylncoRA@sadder-captain-14247.8nj.gcp-europe-west1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full";

// Create connection
$conn = pg_connect($db_url);

// Check connection
if (!$conn) {
    error_log("Connection failed: " . pg_last_error());
    http_response_code(500); // Internal Server Error
    echo json_encode(["message" => "Database connection failed."]);
    exit(); // Stop script execution
} else {
    // Log all tables
    $tables_result = pg_query($conn, "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'");
    $tables = [];
    while ($row = pg_fetch_assoc($tables_result)) {
        $tables[] = $row['tablename'];
    }
    error_log("Tables in database: " . implode(", ", $tables));

    // Log columns for each table
    foreach ($tables as $table) {
        $columns_result = pg_query($conn, "SELECT column_name FROM information_schema.columns WHERE table_name = '" . $table . "'");
        $columns = [];
        while ($row = pg_fetch_assoc($columns_result)) {
            $columns[] = $row['column_name'];
        }
        error_log("Columns in table '" . $table . "': " . implode(", ", $columns));
    }
}
?>