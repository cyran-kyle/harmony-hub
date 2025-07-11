<?php
// reviews.php
include '../config.php'; // Adjust path if necessary
include '../db_connect.php'; // Adjust path if necessary

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->coachId) || !isset($data->rating) || !isset($data->comment) || !isset($data->reviewerId)) {
            http_response_code(400);
            echo json_encode(["message" => "Missing required fields."]);
            exit();
        }

        $coachId = $data->coachId;
        $rating = (int)$data->rating;
        $comment = $data->comment;
        $reviewerId = $data->reviewerId;

        $query = "INSERT INTO reviews (coach_id, rating, comment, reviewer_id, timestamp) VALUES ($1, $2, $3, $4, NOW()) RETURNING id";
        $result = pg_query_params($conn, $query, array($coachId, $rating, $comment, $reviewerId));

        if ($result) {
            $new_id = pg_fetch_result($result, 0, 'id');
            http_response_code(201); // Created
            echo json_encode(["message" => "Review added successfully!", "id" => $new_id]);
        } else {
            http_response_code(500); // Internal Server Error
            echo json_encode(["message" => "Error adding review: " . pg_last_error($conn)]);
        }

        break;

    case 'GET':
        // Optional: Fetch reviews for a specific coach or all reviews
        $coachId = $_GET['coachId'] ?? null;
        $sql = "SELECT * FROM reviews";
        $params = [];
        if ($coachId) {
            $sql .= " WHERE coach_id = $1";
            $params[] = $coachId;
        }
        $sql .= " ORDER BY timestamp DESC"; // Order by most recent

        $result = pg_query_params($conn, $sql, $params);
        $reviews = [];
        if (pg_num_rows($result) > 0) {
            while($row = pg_fetch_assoc($result)) {
                $reviews[] = $row;
            }
        }
        echo json_encode($reviews);
        break;

    default:
        http_response_code(405); // Method Not Allowed
        echo json_encode(["message" => "Method Not Allowed"]);
        break;
}

pg_close($conn);
?>