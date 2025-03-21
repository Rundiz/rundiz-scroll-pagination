/**
 * Rundiz Scroll pagination.
 * 
 * @author Vee W.
 * @license MIT.
 * @version 0.0.5
 */


/**
 * Rundiz Scroll pagination (infinite scroll).
 */
class RundizScrollPagination {


    /**
     * @type {string} Ajax HTTP Accept header. See https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept for reference.
     */
    #ajaxAccept


    /**
     * @type {string} 
     */
    #ajaxContentType


    /**
     * @type {Document|XMLHttpRequestBodyInit|Blob|ArrayBuffer|TypedArray|DataView|FormData|URLSearchParams|string} The Ajax data to send with some methods such as POST, PATCH, PULL, DELETE, etc. 
     *              The data will be like name=value&name2=value2 or get the data from the `FormData()` object. 
     *              The string that contain `%startoffset%` will be replace with start offset.
     *              See https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/send for reference.
     */
    #ajaxData


    /**
     * @type {string} Ajax response data source for count how many items retrieved for set new start offset.
     */
    #ajaxDataSrc


    /**
     * @type {string} Ajax method such as `GET`, `POST`.
     */
    #ajaxMethod


    /**
     * @type {string} Ajax response type for accept header. possible values: `response`, `responseXML`, `responseText`. 
     *              See more details in the constructor.
     */
    #ajaxResponseAcceptType


    /**
     * @type {string} Ajax url with `%startoffset%` to use as start offset. Example: http://domain.tld/page?offset=%startoffset%
     */
    #ajaxUrl


    /**
     * @type {number} The bottom offset where scroll almost to very bottom of page.
     */
    #bottomOffset;


    /**
     * @type {boolean} For checking that is it currently calling AJAX (XHR).
     */
    #callingXHR = false;


    /**
     * @type {boolean} Mark to `true` (default) to change the URL on scrolled to loaded paginated contents, `false` to not change it.
     */
    #changeURL


    /**
     * @type {boolean} Append scroll pagination element or not. 
     *              If not, you have to add `class="rd-scroll-pagination" data-startoffset="nn"` 
     *              (where nn is the start offset of that round) on every first item that have got from AJAX.
     */
    #changeURLAppendElement


    /**
     * @type {string} Querystring for start offset to push to the URL. 
     *              Example ?rdspStartOffset=10 when scroll to next page from first while displaying 10 items per page.
     */
    #changeURLParamStartOffset


    /**
     * @type {number} The offset from top of display area where the pagination data was scrolled before change the URL to its start offset.
     */
    #changeURLScrollTopOffset


    /**
     * @type {string} The children items JS selector where these children is inside or children of the container.
     */
    #childrenItemSelector


    /**
     * @type {string} The container JS selector that will be append pagination element into it.
     */
    #containerSelector


    /**
     * @type {int} Current start offset.
     */
    #currentStartOffset = 0;


    /**
     * @type {string} Is it scrolling or not, if yes which direction. Initial value is empty string, after worked the value will be `up` or `down`.
     */
    #isScrolling = '';


    /**
     * @type {int} Items per page. This option is REQUIRED if you set `paginationMode` to `paged`.
     */
    #itemsPerPage;


    /**
     * @type {number} The offset that children item will be hide or show when outside visible area. 
     *              For the top it is (0 - nn), for the bottom it is (window height - nn) where `nn` is this value.
     */
    #offsetHideShow


    /**
     * @type {string} Pagination mode. Accepted `offset`, `paged`. Default is `offset`.
     */
    #paginationMode


    /**
     * @type {int} For checking previous started offset.
     */
    #previousStartOffset;


    /**
     * @type {number} Start offset can be use in case that you already have pre-loaded child items and you just want to start scroll to next page.
     */
    #startOffset


    /**
     * @type {Promise} The XHR response based on `Promise` object.
     */
    #XHR = new Promise((resolve, reject) => {});


    /**
     * Class constructor.
     * 
     * @param {Object} options 
     * @param {string} options.containerSelector The container JS selector that will be append pagination element into it.
     * @param {string} options.childrenItemSelector The children items JS selector where these children is inside or children of the container.
     * @param {number} options.bottomOffset The bottom offset where scroll almost to very bottom of page.
     * @param {number} options.offsetHideShow The offset that children item will be hide or show when outside visible area. 
     *              For the top it is (0 - nn), for the bottom it is (window height - nn) where `nn` is this value.
     * @param {string} options.paginationMode Pagination mode. Accepted `offset`, `paged`. Default is `offset`.
     * @param {int} options.itemsPerPage Items per page. This option is REQUIRED if you set `paginationMode` to `paged`.
     * @param {number} options.startOffset Start offset can be use in case that you already have pre-loaded child items and you just want to start scroll to next page.
     * @param {boolean} options.changeURL Mark to `true` (default) to change the URL on scrolled to loaded paginated contents, `false` to not change it.
     * @param {boolean} options.changeURLAppendElement Append scroll pagination element or not. 
     *              If not, you have to add `class="rd-scroll-pagination" data-startoffset="nn"` 
     *              (where nn is the start offset of that round) on every first item that have got from AJAX.
     * @param {number} options.changeURLScrollTopOffset The offset from top of display area where the pagination data was scrolled before change the URL to its start offset.
     * @param {string} options.changeURLParamStartOffset Querystring for start offset to push to the URL. 
     *              Example ?rdspStartOffset=10 when scroll to next page from first while displaying 10 items per page.
     * @param {string} options.ajaxUrl Ajax url with `%startoffset%` to use as start offset. Example: http://domain.tld/page?offset=%startoffset% . This option is REQUIRED.
     * @param {string} options.ajaxMethod Ajax method such as `GET`, `POST`.
     * @param {Document|XMLHttpRequestBodyInit|Blob|ArrayBuffer|TypedArray|DataView|FormData|URLSearchParams|string} options.ajaxData The Ajax data to send with some methods such as POST, PATCH, PULL, DELETE, etc. 
     *              The data will be like name=value&name2=value2 or get the data from the `FormData()` object. 
     *              The string that contain `%startoffset%` will be replace with start offset.
     *              See https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/send for reference.
     * @param {string} options.ajaxAccept Ajax HTTP Accept header. See https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept for reference.
     * @param {string} options.ajaxResponseAcceptType Ajax response type for accept header. possible values: `response`, `responseXML`, `responseText`. 
     *              See more details in the code.
     * @param {string} options.ajaxContentType The request content-type of Ajax.
     * @param {string} options.ajaxDataSrc Ajax response data source for count how many items retrieved for set new start offset.
     */
    constructor(options = {}) {
        if (!options.containerSelector) {
            options.containerSelector = '#container';
        }
        this.#containerSelector = options.containerSelector;

        if (!options.childrenItemSelector) {
            options.childrenItemSelector = '.each-item';
        }
        this.#childrenItemSelector = options.childrenItemSelector;

        if (isNaN(options.bottomOffset) || isNaN(parseFloat(options.bottomOffset))) {
            options.bottomOffset = 30;
        }
        this.#bottomOffset = options.bottomOffset;

        if (isNaN(options.offsetHideShow) || isNaN(parseFloat(options.offsetHideShow))) {
            options.offsetHideShow = 40;
        }
        this.#offsetHideShow = options.offsetHideShow;

        if (!options.paginationMode || typeof(options.paginationMode) !== 'string') {
            options.paginationMode = 'offset';
        }
        if (options.paginationMode !== 'offset' && options.paginationMode !== 'paged') {
            options.paginationMode = 'offset'
        }
        this.#paginationMode = options.paginationMode;

        if (
            options.paginationMode === 'paged' &&
            (
                isNaN(options.itemsPerPage) || 
                isNaN(parseFloat(options.itemsPerPage)) || 
                parseFloat(options.itemsPerPage) <= 0
            )
        ) {
            throw new Error('The `itemsPerPage` option is missing.');
        }
        this.#itemsPerPage = parseInt(options.itemsPerPage);

        if (isNaN(options.startOffset) || isNaN(parseFloat(options.startOffset))) {
            options.startOffset = 0;
        }
        this.#startOffset = options.startOffset;

        // change url options ----------------------------
        if (options.changeURL !== true && options.changeURL !== false) {
            options.changeURL = true;
        }
        this.#changeURL = options.changeURL;

        if (options.changeURLAppendElement !== true && options.changeURLAppendElement !== false) {
            options.changeURLAppendElement = true;
        }
        this.#changeURLAppendElement = options.changeURLAppendElement;

        if (isNaN(options.changeURLScrollTopOffset) || isNaN(parseFloat(options.changeURLScrollTopOffset))) {
            options.changeURLScrollTopOffset = 40;
        }
        this.#changeURLScrollTopOffset = options.changeURLScrollTopOffset;

        if (!options.changeURLParamStartOffset || typeof(options.changeURLParamStartOffset) !== 'string') {
            options.changeURLParamStartOffset = 'rdspStartOffset';
        }
        this.#changeURLParamStartOffset = options.changeURLParamStartOffset;
        // end change url options -------------------------

        // ajax options -----------------------------------
        if (!options.ajaxUrl || typeof(options.ajaxUrl) !== 'string') {
            throw new Error('The `ajaxUrl` option is missing.');
        }
        this.#ajaxUrl = options.ajaxUrl;

        if (!options.ajaxMethod || typeof(options.ajaxMethod) !== 'string') {
            options.ajaxMethod = 'GET';
        }
        this.#ajaxMethod = options.ajaxMethod;

        if (!options.ajaxData) {
            options.ajaxData = '';
        }
        this.#ajaxData = options.ajaxData;

        if (!options.ajaxAccept || typeof(options.ajaxAccept) !== 'string') {
            options.ajaxAccept = 'application/json';
        }
        this.#ajaxAccept = options.ajaxAccept;

        // Ajax response type for accept header. possible values:
        // text/html -> response
        // application/xml -> responseXML
        // application/json -> responseText
        // text/plain -> responseText
        // application/javascript, application/xxxscript -> responseText
        if (!options.ajaxResponseAcceptType || typeof(options.ajaxResponseAcceptType) !== 'string') {
            options.ajaxResponseAcceptType = 'responseText';
        }
        this.#ajaxResponseAcceptType = options.ajaxResponseAcceptType;

        if (!options.ajaxContentType || typeof(options.ajaxContentType) !== 'string') {
            options.ajaxContentType = 'application/x-www-form-urlencoded;charset=UTF-8';
        }
        this.#ajaxContentType = options.ajaxContentType;

        if (!options.ajaxDataSrc) {
            options.ajaxDataSrc = 'items';
        }
        this.#ajaxDataSrc = options.ajaxDataSrc;
        // end ajax options -------------------------------

        this.#currentStartOffset = this.#detectAndSetCurrentStartOffset();
    }// constructor


    /**
     * AJAX pagination.
     * 
     * @private This method was called from `#checkScrollAndMakeXHR()`.
     */
    #ajaxPagination() {
        let thisClass = this;

        let promiseObj = new Promise((resolve, reject) => {
            if (thisClass.#callingXHR === true) {
                return reject('previous XHR is calling.');
            }

            thisClass.#callingXHR = true;

            let XHR = new XMLHttpRequest();

            XHR.addEventListener('error', (event) => {
                thisClass.#callingXHR = false;
                reject({'response': '', 'status': (event.currentTarget ? event.currentTarget.status : ''), 'event': event});
            });
            XHR.addEventListener('loadstart', (event) => {
                let response = (event.currentTarget ? event.currentTarget : event);
                response.rdScrollPaginationCurrentPageOffset = thisClass.#currentStartOffset;
                document.dispatchEvent(
                    new CustomEvent(
                        'rdScrollPagination.start', {'detail': response}
                    )
                );
            });
            XHR.addEventListener('loadend', (event) => {
                let response = (event.currentTarget ? event.currentTarget[thisClass.#ajaxResponseAcceptType] : '');
                if (thisClass.#ajaxAccept.toLowerCase().includes('/json')) {
                    try {
                        if (response) {
                            response = JSON.parse(response);
                        }
                    } catch (exception) {
                        console.error(exception.message, response);
                    }
                }

                let headers = XHR.getAllResponseHeaders();
                let headerMap = {};
                if (headers) {
                    let headersArray = headers.trim().split(/[\r\n]+/);
                    headersArray.forEach((line) => {
                        let parts = line.split(': ');
                        let header = parts.shift();
                        let value = parts.join(': ');
                        headerMap[header] = value;
                    });
                    headersArray = undefined;
                }
                headers = undefined;

                // @link https://stackoverflow.com/a/43849204/128761 Original source code for access sub properties by string.
                let responseSource = thisClass.#ajaxDataSrc.split('.').reduce(
                    (p,c)=>p&&p[c]||null, response
                );
                if (responseSource && responseSource.length > 0) {
                    // if there are items after XHR.
                    // append pagination data element.
                    thisClass.#appendPaginationDataElement();
                    // set next start offset.
                    thisClass.#previousStartOffset = parseInt(thisClass.#currentStartOffset);
                    thisClass.#currentStartOffset = parseInt(thisClass.#currentStartOffset) + parseInt(responseSource.length);
                    // mark calling to false to allow next pagination call.
                    thisClass.#callingXHR = false;// move in here to prevent ajax call again when there are no more data.
                }

                if (event.currentTarget && event.currentTarget.status >= 100 && event.currentTarget.status < 400) {
                    resolve({'response': response, 'status': event.currentTarget.status, 'event': event, 'headers': headerMap});
                } else {
                    reject({'response': response, 'status': event.currentTarget.status, 'event': event, 'headers': headerMap});
                }
            });

            let replaceStartNumber = 0;
            if (this.#paginationMode === 'paged') {
                replaceStartNumber = thisClass.#convertOffsetToPaged(thisClass.#currentStartOffset);
            } else {
                replaceStartNumber = thisClass.#currentStartOffset;
            }
            XHR.open(thisClass.#ajaxMethod, thisClass.#ajaxUrl.replace('%startoffset%', replaceStartNumber));
            XHR.setRequestHeader('Accept', thisClass.#ajaxAccept);
            if (thisClass.#ajaxContentType) {
                XHR.setRequestHeader('Content-Type', thisClass.#ajaxContentType);
            }
            if (typeof(thisClass.#ajaxData) === 'string') {
                thisClass.#ajaxData = thisClass.#ajaxData.replace('%startoffset%', replaceStartNumber);
            }
            XHR.send(thisClass.#ajaxData);
        });
        thisClass.#XHR = promiseObj;

        return promiseObj;
    }// #ajaxPagination


    /**
     * Append pagination data element to the container.
     * 
     * @private This method was called from `#ajaxPagination()`.
     */
    #appendPaginationDataElement() {
        if (this.#changeURLAppendElement === false) {
            return ;
        }

        let containerElement = document.querySelector(this.#containerSelector);
        if (containerElement) {
            containerElement.insertAdjacentHTML(
                'beforeend', 
                '<div class="rd-scroll-pagination"'
                    + ' data-startoffset="' + this.#currentStartOffset + '"'
                    + ' style="visibility: hidden;"'// don't use `display: none;` because it can cause malfunction.
                    + '></div>'
            );
        }
    }// #appendPaginationDataElement


    /**
     * Check scrolling up or down and change current URL.
     * 
     * @private This method was called from `#listenOnScroll()`.
     * @param object event 
     */
    #checkScrollAndChangeURL(event) {
        if (this.#changeURL !== true) {
            return ;
        }

        let thisClass = this;
        let paginationDataElements = document.querySelectorAll('.rd-scroll-pagination');

        if (paginationDataElements) {
            paginationDataElements.forEach((item, index) => {
                let rect = item.getBoundingClientRect();
                if (rect.top >= 0 && rect.top < thisClass.#changeURLScrollTopOffset) {
                    // if scrolled and top of this pagination data element is on top within range (40 - for example).
                    // retrieve this start offset from `data-startoffset="n"`.
                    let thisStartOffset = item.dataset.startoffset;

                    // get all querystrings except start offset and re-assign the start offset.
                    const params = new URLSearchParams(window.location.search);
                    let paramObj = {};
                    for(let paramName of params.keys()) {
                        if (paramName !== thisClass.#changeURLParamStartOffset) {
                            paramObj[paramName] = params.get(paramName);
                        }
                    }// endfor;

                    if (this.#paginationMode === 'paged') {
                        thisStartOffset = thisClass.#convertOffsetToPaged(thisStartOffset);
                    }
                    paramObj[thisClass.#changeURLParamStartOffset] = thisStartOffset;

                    // build querystring
                    const currentURL = window.location.href;
                    let currentUrlNoQuerystring = currentURL.split(/[?#]/)[0];
                    let queryString = Object.keys(paramObj).map((key) => {
                        return encodeURIComponent(key) + '=' + encodeURIComponent(paramObj[key])
                    }).join('&');

                    // replace current URL.
                    window.history.replaceState(null, '', currentUrlNoQuerystring + '?' + queryString);
                    /**
                     * Replaced URL event.
                     * 
                     * @since 0.0.6
                     */
                    let eventDetail = {
                        'newURL': currentUrlNoQuerystring + '?' + queryString,
                        'previousURL': currentURL,
                    };
                    document.dispatchEvent(
                        new CustomEvent(
                            'rdScrollPagination.replacedURL', {'detail': eventDetail}
                        )
                    );
                    return;
                }
            });
        }
    }// #checkScrollAndChangeURL


    /**
     * Check that bottom element is near the display area and make XHR (AJAX).
     * 
     * @private This method was called from `#listenOnScroll()`.
     * @param object event 
     */
    #checkScrollAndMakeXHR(event) {
        let thisClass = this;
        let windowHeight = window.innerHeight;
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        let documentScrollHeight = document.documentElement.scrollHeight;
        let totalScroll = (parseInt(windowHeight) + parseInt(scrollTop)) + parseInt(this.#bottomOffset);

        if (totalScroll >= documentScrollHeight) {
            /*console.log(
                'total scroll >= document scroll height.',
                {
                    'totalScroll': totalScroll,
                    'documentScrollHeight': documentScrollHeight
                }
            );*/

            if (thisClass.#callingXHR === false) {
                // begins ajax pagination.
                this.#ajaxPagination()
                .then((responseObject) => {
                    responseObject.rdScrollPaginationCurrentPageOffset = thisClass.#previousStartOffset;
                    document.dispatchEvent(
                        new CustomEvent(
                            'rdScrollPagination.done', {'detail': responseObject}
                        )
                    );
                    // trigger on scroll for in case that there are space left in the bottom of visible area.
                    // trigger will try to load next ajax page if there are more space left.
                    thisClass.triggerOnScroll();

                    return Promise.resolve(responseObject);
                })
                .catch((responseObject) => {
                    // .catch() must be after .then(). see https://stackoverflow.com/a/42028776/128761
                    if (typeof(responseObject) === 'object') {
                        // if responseObject is not an object.
                        // due to ajax error can throw a string message, check before assign.
                        responseObject.rdScrollPaginationCurrentPageOffset = thisClass.#previousStartOffset;
                    }

                    document.dispatchEvent(
                        new CustomEvent(
                            'rdScrollPagination.fail', {'detail': responseObject}
                        )
                    );

                    return Promise.reject(responseObject)
                    .then(() => {
                        // not called.
                    }, (responseObject) => {
                        // prevent uncaught error.
                    });
                });
            }// endif thisClass.#callingXHR check
        }// endif; total scroll > document scroll height.
    }// #checkScrollAndMakeXHR


    /**
     * Check the sub items inside container and hide those are outside of display area on both top and bottom.
     * 
     * This is for performance improvement.
     * 
     * @link https://stackoverflow.com/a/12613687/128761 The ideas.
     * @private This method was called from `#listenOnScroll()`.
     * @param object event 
     */
    #checkScrollOutOfDisplayAreaAndHide(event) {
        let containerElement = document.querySelector(this.#containerSelector);
        if (!containerElement) {
            return ;
        }
        let thisClass = this;
        const windowHeight = window.innerHeight;
        const itemsChangedVisibility = [];

        // check that all visible elements is outside the display area.
        let allVisibleElements = containerElement.querySelectorAll(this.#childrenItemSelector + ':not(.rd-scroll-pagination-hidden-child)');
        if (allVisibleElements) {
            allVisibleElements.forEach((item, index) => {
                let rect = item.getBoundingClientRect();
                if (
                    rect.top < -parseInt(thisClass.#offsetHideShow) || 
                    rect.bottom > (parseInt(windowHeight) + parseInt(thisClass.#offsetHideShow))
                ) {
                    // if top of this element is outside or far more outside the top of visible area
                    // OR bottom of this element is outside or far more outside the bottom of visible area
                    // set height of this item.
                    item.style.height = rect.height + 'px';
                    // set class.
                    item.classList.add('rd-scroll-pagination-hidden-child');
                    // hide children of this item.
                    if (typeof(item.children[0]) === 'undefined' || !item.children[0]) {
                        throw new Error('Each item inside the container must contain one child to be able to hide properly.');
                    }
                    item.children[0].hidden = true;
                    // push an item to array of items that had changed visibility.
                    itemsChangedVisibility.push(item);
                }
            });
        }
        allVisibleElements = undefined;// clear;

        // check that all invisible elements is inside the display area.
        let allInvisibleElements = containerElement.querySelectorAll(this.#childrenItemSelector + '.rd-scroll-pagination-hidden-child');
        if (allInvisibleElements) {
            allInvisibleElements.forEach((item, index) => {
                let rect = item.getBoundingClientRect();
                if (
                    rect.top > -parseInt(thisClass.#offsetHideShow) && 
                    rect.bottom < (parseInt(windowHeight) + parseInt(thisClass.#offsetHideShow))
                ) {
                    // if top of this element is inside or nearly inside the top of visible area
                    // AND bottom of this element is inside or nearly inside the bottom of visible area
                    // unhide children of this item.
                    item.children[0].hidden = false;
                    // remove class.
                    item.classList.remove('rd-scroll-pagination-hidden-child');
                    // remove height of this item.
                    item.style.height = null;
                    // push an item to array of items that had changed visibility.
                    itemsChangedVisibility.push(item);
                }
            });
        }
        allInvisibleElements = undefined;// clear;

        if (itemsChangedVisibility.length > 0) {
            // if there is at least one item that had changed visiblity.
            /**
             * Display or hide children event.  
             * The children will be display when scroll into display area or hide when scroll out of display area.
             * 
             * @since 0.0.6
             */
            const eventDetail = {
                'itemsChangedVisibility': itemsChangedVisibility,
            };
            document.dispatchEvent(
                new CustomEvent(
                    'rdScrollPagination.displayOrHideChildren', {'detail': eventDetail}
                )
            );
        }
    }// #checkScrollOutOfDisplayAreaAndHide


    /**
     * Convert offset number to page number.
     * 
     * @private This method was called from `#ajaxPagination()`, `#checkScrollAndChangeURL()`.
     * @since 0.0.6
     * @param {int} offset The offset number.
     * @returns Return paged number.
     */
    #convertOffsetToPaged(offset) {
        return (offset / this.#itemsPerPage) + 1;
    }// #convertOffsetToPaged


    /**
     * Convert page number to offset number.
     * 
     * @private This method was called from 
     * @since 0.0.6
     * @param {int} paged 
     * @returns Return offset number.
     */
    #convertPagedToOffset(paged) {
        return ((paged - 1) * this.#itemsPerPage);
    }// #convertPagedToOffset


    /**
     * Detect and set current start offset from querystring.
     * 
     * @private This method was called from `constructor()`.
     * @return int Return detected number of start offset.
     */
    #detectAndSetCurrentStartOffset() {
        const params = new URLSearchParams(window.location.search);
        let currentStartOffsetQuerystring = params.get(this.#changeURLParamStartOffset);
        if (this.#paginationMode === 'paged') {
            currentStartOffsetQuerystring = this.#convertPagedToOffset(currentStartOffsetQuerystring);
        }

        // querystring of start offset == nothing
        //      start offset property != 0 -> set to start offset property.
        //      start offset property == 0 -> 0
        // querystring of start offset == 0
        //      start offset property != 0 -> set to start offset property.
        //      start offset property == 0 -> 0
        // querystring of start offset > 0
        //      start offset property != 0
        //          querystring of start offset <= start offset -> set to start offset property.
        //      anything else    
        //      start offset property == 0 -> use current querystring of start offset.

        if (currentStartOffsetQuerystring > 0) {
            if (this.#startOffset !== 0) {
                if (parseInt(currentStartOffsetQuerystring) <= parseInt(this.#startOffset)) {
                    currentStartOffsetQuerystring = this.#startOffset;
                }
            }
        } else {
            if (this.#startOffset != 0) {
                currentStartOffsetQuerystring = this.#startOffset;
            } else {
                currentStartOffsetQuerystring = 0;
            }
        }

        return parseInt(currentStartOffsetQuerystring);
    }// #detectAndSetCurrentStartOffset


    /**
     * Listen on scroll window/element.
     * 
     * @private This method was called from `invoke()`.
     */
    #listenOnScroll() {
        let thisClass = this;
        let lastScroll = 0;
        
        window.addEventListener('scroll', (event) => {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (scrollTop >= lastScroll) {
                // if scrolling down (content move up but mouse wheel scroll down).
                thisClass.#isScrolling = 'down';
            } else {
                // if scrolling up (content move down but mouse wheel scroll up).
                thisClass.#isScrolling = 'up';
            }

            /**
             * Scrolling event (up or down) and before functional.  
             * This event dispatched on scroll but before any functions will work such as show or hide elements, changed URL, etc.
             * 
             * @since 0.0.6
             */
            let eventDetail = {
                'isScrolling': thisClass.#isScrolling,
            };
            document.dispatchEvent(
                new CustomEvent(
                    'rdScrollPagination.scrolling', {'detail': eventDetail}
                )
            );

            if ('down' === thisClass.#isScrolling) {
                // if scrolling down
                thisClass.#checkScrollAndMakeXHR(event);
                thisClass.#checkScrollAndChangeURL(event);
                thisClass.#checkScrollOutOfDisplayAreaAndHide(event);
            } else {
                // if scrolling up
                thisClass.#checkScrollAndChangeURL(event);
                thisClass.#checkScrollOutOfDisplayAreaAndHide(event);
            }

            /**
             * Scrolling event (up or down) and after functional.  
             * This event dispatched on scroll and functions are already worked.
             * 
             * @since 0.0.6
             */
            eventDetail = {
                'isScrolling': thisClass.#isScrolling,
            };
            document.dispatchEvent(
                new CustomEvent(
                    'rdScrollPagination.scrolled', {'detail': eventDetail}
                )
            );

            lastScroll = (scrollTop <= 0 ? 0 : parseInt(scrollTop));
        }, false);

        // trigger on scroll to make ajax pagination work immediately on start if there are space left on the bottom of visible area.
        this.triggerOnScroll();
    }// #listenOnScroll


    /**
     * {@inheritdoc}
     * 
     * @since 0.0.6
     */
    get currentStartOffset() {
        return this.#currentStartOffset;
    }// get currentStartOffset


    /**
     * Get `isScrolling` property status (empty string, 'up', 'down')
     * 
     * @since 0.0.6
     * @return {string} Return empty string, 'up', 'down'
     */
    get isScrolling() {
        return this.#isScrolling;
    }// get isScrolling


    /**
     * Get XHR property object.
     * 
     * @since 0.0.6
     * @return XMLHttpRequest
     */
    get XHR() {
        return this.#XHR;
    }// get XHR


    /**
     * Get XHR property object.
     * 
     * @deprecated Use `class.XHR` instead.
     * @return XMLHttpRequest
     */
    async getXHR() {
        return this.#XHR;
    }// getXHR


    /**
     * Invoke, run the class.
     */
    invoke() {
        this.#listenOnScroll();
    }// invoke


    /**
     * Set next start offset.
     * 
     * Manually set next start offset after AJAX complete. This for working with AJAX with HTML content type.
     * 
     * @since 0.0.4
     * @param int number 
     */
    setNextStartOffset(number) {
        this.#previousStartOffset = parseInt(this.#currentStartOffset);
        this.#currentStartOffset = parseInt(number);
        // mark calling to false to allow next pagination call.
        this.#callingXHR = false;
    }// setNextStartOffset


    /**
     * Trigger scroll event, 
     * best on initialize the class to trigger event 
     * and make ajax call while next pagination element is near the display area.
     * 
     * This method was called from `#listenOnScroll()` and outside class.
     */
    triggerOnScroll() {
        window.dispatchEvent(new Event('scroll'));
    }// triggerOnScroll


}// ScrollPagination