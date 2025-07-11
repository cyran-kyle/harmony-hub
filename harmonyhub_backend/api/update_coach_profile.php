<?php
// update_coach_profile.php
include '../config.php'; // Adjust path if necessary
include '../db_connect.php'; // Adjust path if necessary

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->id)) {
            http_response_code(400);
            echo json_encode(["message" => "Coach ID is required."]);
            exit();
        }

        $coachId = $data->id;
        $updates = [];
        $params = [];
        $i = 1;

        // Dynamically build the UPDATE query based on provided fields
        if (isset($data->name)) { $updates[] = "name = $" . $i++; $params[] = $data->name; }
        if (isset($data->instrument)) { $updates[] = "instrument = $" . $i++; $params[] = $data->instrument; }
        if (isset($data->genre)) { $updates[] = "genre = $" . $i++; $params[] = $data->genre; }
        if (isset($data->location)) { $updates[] = "location = $" . $i++; $params[] = $data->location; }
        if (isset($data->bio)) { $updates[] = "bio = $" . $i++; $params[] = $data->bio; }
        if (isset($data->photoUrl)) { $updates[] = "photo_url = $" . $i++; $params[] = $data->photoUrl; }
        if (isset($data->phone)) { $updates[] = "phone = $" . $i++; $params[] = $data->phone; }

        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(["message" => "No fields provided for update."]);
            exit();
        }

        $sql = "UPDATE coaches SET " . implode(", ", $updates) . " WHERE id = $" . $i;
        $params[] = $coachId;

        $result = pg_query_params($conn, $sql, $params);

        if ($result) {
            if (pg_affected_rows($result) > 0) {
                http_response_code(200);
                echo json_encode(["message" => "Coach profile updated successfully!"]);
            } else {
                http_response_code(404); // Not Found or No Change
                echo json_encode(["message" => "Coach not found or no changes made."]);
            }
        } else {
            http_response_code(500); // Internal Server Error
            echo json_encode(["message" => "Error updating coach profile: " . pg_last_error($conn)]);
        }

        break;

    default:
        http_response_code(405); // Method Not Allowed
        echo json_encode(["message" => "Method Not Allowed"]);
        break;
}

pg_close($conn);
?>