<?php

$start = filter_input(INPUT_GET, 'start', FILTER_SANITIZE_NUMBER_INT);
if (!is_numeric($start) || $start < 0) {
    $start = 0;
}


$output = [];
if ($start < 200) {
    for ($i = 1; $i <= 10; $i++) {
        $output['items'][] = 'Item ' . ($start + $i) . ' - start: ' . $start . '; loop: ' . $i . '.';
    }
    usleep(300000);// 1000000 microseconds = 1 second
} else {
    http_response_code(200);
}


header('Content-type: application/json');
echo json_encode($output);
exit();