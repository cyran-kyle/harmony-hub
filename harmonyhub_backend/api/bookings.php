<?php
// bookings.php
include '../config.php'; // Adjust path if necessary
include '../db_connect.php'; // Adjust path if necessary

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->coachId) || !isset($data->learnerId) || !isset($data->date) || !isset($data->time)) {
            http_response_code(400);
            echo json_encode(["message" => "Missing required fields."]);
            exit();
        }

        $coachId = $data->coachId;
        $learnerId = $data->learnerId;
        $date = $data->date;
        $time = $data->time;
        $status = "pending"; // Default status

        $query = "INSERT INTO bookings (coach_id, learner_id, booking_date, booking_time, status, timestamp) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id";
        $result = pg_query_params($conn, $query, array($coachId, $learnerId, $date, $time, $status));

        if ($result) {
            $new_id = pg_fetch_result($result, 0, 'id');
            http_response_code(201); // Created
            echo json_encode(["message" => "Session booked successfully!", "id" => $new_id]);
        } else {
            http_response_code(500); // Internal Server Error
            echo json_encode(["message" => "Error booking session: " . pg_last_error($conn)]);
        }

        break;

    // Optional: Add GET method to fetch bookings for a learner or coach
    default:
        http_response_code(405); // Method Not Allowed
        echo json_encode(["message" => "Method Not Allowed"]);
        break;
}

pg_close($conn);
?>