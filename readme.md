# Rundiz Scroll Pagination

Scroll down the page and automatically call to get next page contents.

[![npm](https://img.shields.io/npm/v/rundiz-scroll-pagination)](https://www.npmjs.com/package/rundiz-scroll-pagination) 
[![NPM](https://img.shields.io/npm/l/rundiz-scroll-pagination)](https://www.npmjs.com/package/rundiz-scroll-pagination) 
[![npm](https://img.shields.io/npm/dt/rundiz-scroll-pagination)](https://www.npmjs.com/package/rundiz-scroll-pagination)

## Features
* Scroll down and auto make AJAX call to get next page contents.
* Can replace current URL in case you hit back or reload and it will be continue from current start offset. (Can be disable via option.)
* There are events to use for custom render HTML elements.
* Hide all children elements that are outside of visible area to improve performance.

### Example:
```html
<div id="posts-container" class="posts-container"></div>

<script src="../../RundizScrollPagination.js" type="application/javascript"></script>
<script type="application/javascript">
    // on window dom loaded.
    window.addEventListener('DOMContentLoaded', (event) => {
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

            let listHtml = '';
            if (response.items) {
                response.items.forEach((item, index) => {
                    listHtml += '<div class="each-post-item"><p>' + item + '</p></div>';
                });
            }

            document.querySelector('#posts-container')
                .insertAdjacentHTML('beforeend', listHtml);
        });

        // initialize new scroll pagination class.
        let scrollPaginationClass = new RundizScrollPagination({
            'containerSelector': '#posts-container',
            'childrenItemSelector': '.each-post-item',
            'changeURL': true,
            'ajaxUrl': 'pagination-dummydata.php?start=%startoffset%'
        });
        // invoke/run the class.
        scrollPaginationClass.invoke();
    });
</script>
```

See more options inside class `constructor()`.