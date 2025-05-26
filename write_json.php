<?php

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if ($data) {
    $file = 'data.json'; 


    $current = file_exists($file) ? json_decode(file_get_contents($file), true) : [];

    $current[] = $data;

    file_put_contents($file, json_encode($current, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    echo json_encode(["status" => "ok"]);
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Некорректный JSON"]);
}
