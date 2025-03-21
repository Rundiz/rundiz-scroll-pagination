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


$output = '';
if ($start < 1000) {
    for ($i = 1; $i <= PER_PAGE; $i++) {
        if ($i === 1) {
            $output .= '<div class="rd-scroll-pagination"'// required html class attribute and name.
            . ' data-startoffset="' . $start . '"'// required html data-startoffset attribute.
            . ' style="visibility: hidden;"'// just for hiding, don't use `display: none;` because it can cause malfunction.
            . '></div>';
        }
        $output .= '<div class="each-post-item"><p><a href="view-detail.php?id=' . ($start + $i) . '">Item ' . ($start + $i) . '</a> - start: ' . $start . '; loop: ' . $i . '.</p></div>';
    }
    usleep(300000);// 1000000 microseconds = 1 second
} else {
    http_response_code(200);
}


echo $output;
exit();