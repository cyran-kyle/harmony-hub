<?php
// coaches.php
include '../config.php'; // Adjust path if necessary
include '../db_connect.php'; // Adjust path if necessary

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $sql = "SELECT * FROM coaches";
        $result = pg_query($conn, $sql);
        $coaches = [];
        if (pg_num_rows($result) > 0) {
            while($row = pg_fetch_assoc($result)) {
                $coaches[] = $row;
            }
        }
        echo json_encode($coaches);
        break;
    // No POST, PUT, DELETE here, as registration handles coach creation,
    // and profile updates are handled by update_coach_profile.php
    default:
        http_response_code(405); // Method Not Allowed
        echo json_encode(["message" => "Method Not Allowed"]);
        break;
}

pg_close($conn);
?>