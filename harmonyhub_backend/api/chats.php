<?php
// chats.php
include '../config.php'; // Adjust path if necessary
include '../db_connect.php'; // Adjust path if necessary

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->participant1_id) || !isset($data->participant2_id) || !isset($data->messageText) || !isset($data->senderId)) {
            http_response_code(400);
            echo json_encode(["message" => "Missing required fields (participant1_id, participant2_id, messageText, senderId)."]);
            exit();
        }

        $participant1_id = $data->participant1_id;
        $participant2_id = $data->participant2_id;
        $messageText = $data->messageText;
        $senderId = $data->senderId;

        // Ensure consistent chatDocId regardless of who initiates the chat
        $chatParticipants = [$participant1_id, $participant2_id];
        sort($chatParticipants); // Sort to create a consistent ID
        $chatDocId = $chatParticipants[0] . '_' . $chatParticipants[1];

        // Fetch existing chat document
        $query_select = "SELECT messages, participant1_id FROM chats WHERE id = $1";
        $result_select = pg_query_params($conn, $query_select, array($chatDocId));
        
        $existingMessages = [];
        $isNewChat = true;
        $db_participant1_id = null;

        if ($result_select && pg_num_rows($result_select) > 0) {
            $row = pg_fetch_assoc($result_select);
            $existingMessages = json_decode($row['messages'], true) ?: [];
            $isNewChat = false;
            $db_participant1_id = $row['participant1_id'];
        }

        // Add new message
        $newMessage = [
            "senderId" => $senderId,
            "text" => $messageText,
            "timestamp" => date('Y-m-d H:i:s')
        ];
        $existingMessages[] = $newMessage;
        $updatedMessagesJson = json_encode($existingMessages);

        // Determine which participant's unread count to increment
        $unread_field_to_increment = '';
        if ($senderId === $chatParticipants[0]) { // Sender is participant1
            $unread_field_to_increment = 'unread_count_p2'; // Increment p2's unread count
        } else { // Sender is participant2
            $unread_field_to_increment = 'unread_count_p1'; // Increment p1's unread count
        }

        if (!$isNewChat) {
            // Update existing chat document
            $sql_update = "UPDATE chats SET messages = $1, last_message_text = $2, last_message_sender = $3, last_message_at = NOW(), {$unread_field_to_increment} = {$unread_field_to_increment} + 1 WHERE id = $4";
            $result_update = pg_query_params($conn, $sql_update, array($updatedMessagesJson, $messageText, $senderId, $chatDocId));
            if ($result_update) {
                http_response_code(200);
                echo json_encode(["message" => "Message sent successfully!"]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Error updating chat: " . pg_last_error($conn)]);
            }
        } else {
            // Create new chat document
            $sql_insert = "INSERT INTO chats (id, participant1_id, participant2_id, messages, last_message_text, last_message_sender, last_message_at, unread_count_p1, unread_count_p2, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, NOW())";
            
            // Initial unread counts: 0 for sender, 1 for recipient
            $initial_unread_p1 = ($senderId === $chatParticipants[0]) ? 0 : 1;
            $initial_unread_p2 = ($senderId === $chatParticipants[1]) ? 0 : 1;

            $result_insert = pg_query_params($conn, $sql_insert, array($chatDocId, $chatParticipants[0], $chatParticipants[1], $updatedMessagesJson, $messageText, $senderId, $initial_unread_p1, $initial_unread_p2));
            if ($result_insert) {
                http_response_code(201); // Created
                echo json_encode(["message" => "Chat created and message sent successfully!"]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Error creating chat: " . pg_last_error($conn)]);
            }
        }
        break;

    case 'GET':
        if (isset($_GET['participantId'])) {
            // Fetch all chats for a given participant
            $participantId = $_GET['participantId'];
            $sql = "SELECT id, participant1_id, participant2_id, last_message_text, last_message_sender, last_message_at, unread_count_p1, unread_count_p2 FROM chats WHERE participant1_id = $1 OR participant2_id = $2 ORDER BY last_message_at DESC";
            $result = pg_query_params($conn, $sql, array($participantId, $participantId));
            $chats = [];
            while($row = pg_fetch_assoc($result)) {
                $chats[] = $row;
            }
            echo json_encode($chats);
        } elseif (isset($_GET['chatDocId'])) {
            // Fetch message history for a specific chat document
            $chatDocId = $_GET['chatDocId'];
            $sql = "SELECT messages FROM chats WHERE id = $1";
            $result = pg_query_params($conn, $sql, array($chatDocId));

            if (pg_num_rows($result) > 0) {
                $row = pg_fetch_assoc($result);
                $messages = json_decode($row['messages'], true) ?: [];
                echo json_encode(["messages" => $messages]);
            } else {
                echo json_encode(["messages" => []]); // No chat history found
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Missing chatDocId or participantId parameter. Debug Info: " . json_encode($_GET)]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->chatDocId) || !isset($data->readerId)) {
            http_response_code(400);
            echo json_encode(["message" => "Missing chatDocId or readerId."]);
            exit();
        }

        $chatDocId = $data->chatDocId;
        $readerId = $data->readerId;

        // Determine which unread count to reset based on readerId
        $query_select = "SELECT participant1_id, participant2_id FROM chats WHERE id = $1";
        $result_select = pg_query_params($conn, $query_select, array($chatDocId));
        
        if (pg_num_rows($result_select) > 0) {
            $row = pg_fetch_assoc($result_select);
            $p1 = $row['participant1_id'];
            $p2 = $row['participant2_id'];

            $unread_field_to_reset = '';
            if ($readerId === $p1) {
                $unread_field_to_reset = 'unread_count_p1';
            } elseif ($readerId === $p2) {
                $unread_field_to_reset = 'unread_count_p2';
            } else {
                http_response_code(403); // Forbidden
                echo json_encode(["message" => "Reader is not a participant in this chat."]);
                exit();
            }

            $sql_update = "UPDATE chats SET {$unread_field_to_reset} = 0 WHERE id = $1";
            $result_update = pg_query_params($conn, $sql_update, array($chatDocId));
            
            if ($result_update) {
                http_response_code(200);
                echo json_encode(["message" => "Chat marked as read."]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Error marking chat as read: " . pg_last_error($conn)]);
            }

        } else {
            http_response_code(404); // Not Found
            echo json_encode(["message" => "Chat not found."]);
        }
        break;

    default:
        http_response_code(405); // Method Not Allowed
        echo json_encode(["message" => "Method Not Allowed"]);
        break;
}

pg_close($conn);
?>