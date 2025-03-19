<?php
// No cache.
header('Expires: Mon, 1 Jan 1900 00:00:00 GMT');
header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');
session_cache_limiter('private');
session_cache_expire(0);

$id = filter_input(INPUT_GET, 'id', FILTER_SANITIZE_NUMBER_INT);
if (!is_numeric($id)) {
    $id = 0;
} else {
    $id = intval($id);
}

?>
<!DOCTYPE html>
<html>
    <head>
        <title>Sample view detail page.</title>
    </head>
    <body>
        <h1>Sample view detail page.</h1>
        <p>Request ID: <?=$id?></p>
        <p>This page use no cache headers to see that how is it when you click back to previous page.</p>
    </body>
</html>
