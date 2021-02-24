<?php

$start = filter_input(INPUT_GET, 'start', FILTER_SANITIZE_NUMBER_INT);
if (!is_numeric($start) || $start < 0) {
    $start = 0;
}


$output = '';
if ($start < 200) {
    for ($i = 1; $i <= 10; $i++) {
        if ($i === 1) {
            $output .= '<div class="rd-scroll-pagination"'
            . ' data-startoffset="' . $start . '"'
            . ' style="visibility: hidden;"'// don't use `display: none;` because it can cause malfunction.
            . '></div>';
        }
        $output .= '<div class="each-post-item"><p>Item ' . ($start + $i) . ' - start: ' . $start . '; loop: ' . $i . '.</p></div>';
    }
    usleep(300000);// 1000000 microseconds = 1 second
} else {
    http_response_code(200);
}


echo $output;
exit();