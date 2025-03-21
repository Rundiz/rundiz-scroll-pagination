<?php

define('PER_PAGE', 10);
$start = filter_input(INPUT_GET, 'start', FILTER_SANITIZE_NUMBER_INT);
$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_NUMBER_INT);
if (!is_numeric($start) || $start < 0) {
    $start = 0;
}
if (is_numeric($page) && $page > 0) {
    $start = (($page - 1) * PER_PAGE);
}

$output = [];
if ($start < 1000) {
    for ($i = 1; $i <= PER_PAGE; $i++) {
        $output['items'][] = 'Item ' . ($start + $i) . ' - start: ' . $start . '; loop: ' . $i . '.';
    }
    usleep(300000);// 1000000 microseconds = 1 second
} else {
    http_response_code(200);
}


header('Content-type: application/json');
echo json_encode($output);
exit();