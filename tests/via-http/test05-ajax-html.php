<?php
// No cache.
header('Expires: Mon, 1 Jan 1900 00:00:00 GMT');
header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');
session_cache_limiter('private');
session_cache_expire(0);
?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>JS scroll pagination</title>

        <link rel="stylesheet" href="assets/css/styles.css">
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="0">
    </head>
    <body>
        <h1>AJAX HTML</h1>
        <p>This page use AJAX content type as <code>HTML</code>. This page is the same as <a href="test04-ajax-html.html">test04-ajax-html.html</a> but with no cache in response headers.</p>
        <div id="posts-container" class="posts-container"></div>

        <script src="../../src/RundizScrollPagination.js"></script>
        <script>
            // on window dom loaded.
            window.addEventListener('DOMContentLoaded', (event) => {
                let scrollPaginationClass;

                // listen on ajax failed, done to render items.
                document.addEventListener('rdScrollPagination.start', (ajaxEvent) => {
                    const loadingHtml = '<p class="item-loading">Loading &hellip;</p>';
                    document.querySelector('#posts-container').insertAdjacentHTML('beforeend', loadingHtml);
                });
                document.addEventListener('rdScrollPagination.fail', (ajaxEvent) => {
                    let loadingElement = document.querySelector('.item-loading');
                    if (loadingElement) {
                        loadingElement.remove();
                    }
                });
                document.addEventListener('rdScrollPagination.done', (ajaxEvent) => {
                    let loadingElement = document.querySelector('.item-loading');
                    if (loadingElement) {
                        loadingElement.remove();
                    }

                    let response = (ajaxEvent.detail ? ajaxEvent.detail.response : {});
                    if (response) {
                        let parser = new DOMParser();
                        let doc = parser.parseFromString(response, 'text/html');
                        let paginationElement = doc.querySelector('.rd-scroll-pagination');
                        if (paginationElement) {
                            scrollPaginationClass.setNextStartOffset(parseInt(paginationElement.dataset.startoffset) + 10);
                        }
                    }

                    document.querySelector('#posts-container').insertAdjacentHTML('beforeend', response);
                });

                // initialize new scroll pagination class.
                scrollPaginationClass = new RundizScrollPagination({
                    'containerSelector': '#posts-container',
                    'childrenItemSelector': '.each-post-item',
                    'ajaxUrl': 'pagination-dummydata-html.php?start=%startoffset%',
                    'ajaxAccept': 'text/html',
                    'ajaxResponseAcceptType': 'response',
                });
                // invoke/run the class.
                scrollPaginationClass.invoke();
            });
        </script>
    </body>
</html>