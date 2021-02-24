/**
 * Rundiz Scroll pagination.
 * 
 * @author Vee W.
 * @license MIT.
 * @version 0.0.3
 */


/**
 * Rundiz Scroll pagination (infinite scroll).
 */
class RundizScrollPagination {


    /**
     * Class constructor.
     * 
     * @param {object} option 
     */
    constructor(option = {}) {
        if (!option.containerSelector) {
            option.containerSelector = '#container';
        }
        this.containerSelector = option.containerSelector;

        if (!option.childrenItemSelector) {
            option.childrenItemSelector = '.each-item';
        }
        this.childrenItemSelector = option.childrenItemSelector;

        if (isNaN(option.bottomOffset) || isNaN(parseFloat(option.bottomOffset))) {
            // the bottom offset where scroll almost to very bottom of page.
            option.bottomOffset = 30;
        }
        this.bottomOffset = option.bottomOffset;

        if (isNaN(option.offsetHideShow) || isNaN(parseFloat(option.offsetHideShow))) {
            // the offset that children item will be hide or show when outside visible area.
            // for the top it is (0 - nn), for the bottom it is (window height - nn) where nn is this value.
            option.offsetHideShow = 40;
        }
        this.offsetHideShow = option.offsetHideShow;

        if (isNaN(option.startOffset) || isNaN(parseFloat(option.startOffset))) {
            // start offset can be use in case that you already have pre-loaded child items 
            // and you just want to start scroll to next page.
            option.startOffset = 0;
        }
        this.startOffset = option.startOffset;

        // change url options ----------------------------
        if (option.changeURL !== true && option.changeURL !== false) {
            option.changeURL = true;
        }
        this.changeURL = option.changeURL;

        if (option.changeURLAppendElement !== true && option.changeURLAppendElement !== false) {
            // append scroll pagination element or not.
            // if not, you have to add `class="rd-scroll-pagination" data-startoffset="nn"` 
            // (where nn is the start offset of that round) on every first item that have got from AJAX.
            option.changeURLAppendElement = true;
        }
        this.changeURLAppendElement = option.changeURLAppendElement;

        if (isNaN(option.changeURLScrollTopOffset) || isNaN(parseFloat(option.changeURLScrollTopOffset))) {
            // the offset from top of display area where the pagination data was scrolled before change the URL to its start offset.
            option.changeURLScrollTopOffset = 40;
        }
        this.changeURLScrollTopOffset = option.changeURLScrollTopOffset;

        if (!option.changeURLParamStartOffset) {
            // querystring for start offset to push to the URL.
            // example ?rdspStartOffset=10 when scroll to next page from first while displaying 10 items per page.
            option.changeURLParamStartOffset = 'rdspStartOffset';
        }
        this.changeURLParamStartOffset = option.changeURLParamStartOffset;
        // end change url options -------------------------

        // ajax options -----------------------------------
        if (!option.ajaxUrl) {
            // set ajax url with `%startoffset%` to use as start offset.
            // example: http://domain.tld/page?offset=%startoffset%
            throw new Error('The `ajaxUrl` property is missing.');
        }
        this.ajaxUrl = option.ajaxUrl;

        if (!option.ajaxMethod) {
            option.ajaxMethod = 'GET';
        }
        this.ajaxMethod = option.ajaxMethod;

        if (!option.ajaxData) {
            // the ajax data to send with some methods such as POST, PATCH, PULL, DELETE, etc.
            // the data will be like name=value&name2=value2 or get the data from the `FormData()` object.
            // the string that contain `%startoffset%` will be replace with start offset.
            option.ajaxData = '';
        }
        this.ajaxData = option.ajaxData;

        if (!option.ajaxAccept) {
            option.ajaxAccept = 'application/json';
        }
        this.ajaxAccept = option.ajaxAccept;

        // response type for accept. possible values:
        // text/html -> response
        // application/xml -> responseXML
        // application/json -> responseText
        // text/plain -> responseText
        // application/javascript, application/xxxscript -> responseText
        if (!option.ajaxResponseAcceptType) {
            option.ajaxResponseAcceptType = 'responseText';
        }
        this.ajaxResponseAcceptType = option.ajaxResponseAcceptType;

        if (!option.ajaxContentType) {
            option.ajaxContentType = 'application/x-www-form-urlencoded;charset=UTF-8';
        }
        this.ajaxContentType = option.ajaxContentType;

        if (!option.ajaxDataSrc) {
            // set data source for count how many items retrieved for set new start offset.
            option.ajaxDataSrc = 'items';
        }
        this.ajaxDataSrc = option.ajaxDataSrc;
        // end ajax options -------------------------------

        this.currentStartOffset = this.detectAndSetCurrentStartOffset();
        this.previousStartOffset;// for checking.
        this.callingXHR = false;
        this.isScrolling = '';// up or down.
        this.XHR = new Promise((resolve, reject) => {});
    }// constructor


    /**
     * AJAX pagination.
     * 
     * @private This method was called from `checkScrollAndMakeXHR()`.
     */
    ajaxPagination() {
        let thisClass = this;

        let promiseObj = new Promise((resolve, reject) => {
            if (thisClass.callingXHR === true) {
                return reject('previous XHR is calling.');
            }

            thisClass.callingXHR = true;

            let XHR = new XMLHttpRequest();

            XHR.addEventListener('error', (event) => {
                thisClass.callingXHR = false;
                reject({'response': '', 'status': (event.currentTarget ? event.currentTarget.status : ''), 'event': event});
            });
            XHR.addEventListener('loadstart', (event) => {
                let response = (event.currentTarget ? event.currentTarget : event);
                response.rdScrollPaginationCurrentPageOffset = thisClass.currentStartOffset;
                document.dispatchEvent(
                    new CustomEvent(
                        'rdScrollPagination.start', {'detail': response}
                    )
                );
            });
            XHR.addEventListener('loadend', (event) => {
                let response = (event.currentTarget ? event.currentTarget[thisClass.ajaxResponseAcceptType] : '');
                if (thisClass.ajaxAccept.toLowerCase().includes('/json')) {
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
                let responseSource = thisClass.ajaxDataSrc.split('.').reduce(
                    (p,c)=>p&&p[c]||null, response
                );
                if (responseSource && responseSource.length > 0) {
                    // if there are items after XHR.
                    // append pagination data element.
                    thisClass.appendPaginationDataElement();
                    // set next start offset.
                    thisClass.previousStartOffset = parseInt(thisClass.currentStartOffset);
                    thisClass.currentStartOffset = parseInt(thisClass.currentStartOffset) + parseInt(responseSource.length);
                    // mark calling to false to allow next pagination call.
                    thisClass.callingXHR = false;// move in here to prevent ajax call again when there are no more data.
                }

                if (event.currentTarget && event.currentTarget.status >= 100 && event.currentTarget.status < 400) {
                    resolve({'response': response, 'status': event.currentTarget.status, 'event': event, 'headers': headerMap});
                } else {
                    reject({'response': response, 'status': event.currentTarget.status, 'event': event, 'headers': headerMap});
                }
            });

            XHR.open(thisClass.ajaxMethod, thisClass.ajaxUrl.replace('%startoffset%', thisClass.currentStartOffset));
            XHR.setRequestHeader('Accept', thisClass.ajaxAccept);
            if (thisClass.ajaxContentType) {
                XHR.setRequestHeader('Content-Type', thisClass.ajaxContentType);
            }
            XHR.send(thisClass.ajaxData.replace('%startoffset%', thisClass.currentStartOffset));
        });
        thisClass.XHR = promiseObj;

        return promiseObj;
    }// ajaxPagination


    /**
     * Append pagination data element.
     * 
     * @private This method was called from `ajaxPagination()`.
     */
    appendPaginationDataElement() {
        if (this.changeURLAppendElement === false) {
            return ;
        }

        let containerElement = document.querySelector(this.containerSelector);
        if (containerElement) {
            containerElement.insertAdjacentHTML(
                'beforeend', 
                '<div class="rd-scroll-pagination"'
                    + ' data-startoffset="' + this.currentStartOffset + '"'
                    + ' style="visibility: hidden;"'// don't use `display: none;` because it can cause malfunction.
                    + '></div>'
            );
        }
    }// appendPaginationDataElement


    /**
     * Check scrolling up or down and change current URL.
     * 
     * @private This method was called from `listenOnScroll()`.
     * @param object event 
     */
    checkScrollAndChangeURL(event) {
        if (this.changeURL !== true) {
            return ;
        }

        let thisClass = this;
        let paginationDataElements = document.querySelectorAll('.rd-scroll-pagination');

        if (paginationDataElements) {
            paginationDataElements.forEach((item, index) => {
                let rect = item.getBoundingClientRect();
                if (rect.top >= 0 && rect.top < thisClass.changeURLScrollTopOffset) {
                    // if scrolled and top of this pagination data element is on top within range (40 - for example).
                    // retrieve this start offset from `data-startoffset="n"`.
                    let thisStartOffset = item.dataset.startoffset;

                    // get all querystrings except start offset and re-assign the start offset.
                    const params = new URLSearchParams(window.location.search);
                    let paramObj = {};
                    for(let paramName of params.keys()) {
                        if (paramName !== thisClass.changeURLParamStartOffset) {
                            paramObj[paramName] = params.get(paramName);
                        }
                    }
                    paramObj[thisClass.changeURLParamStartOffset] = thisStartOffset;

                    // build querystring
                    let currentUrlNoQuerystring = window.location.href.split(/[?#]/)[0];
                    let queryString = Object.keys(paramObj).map((key) => {
                        return encodeURIComponent(key) + '=' + encodeURIComponent(paramObj[key])
                    }).join('&');
                    
                    // replace current URL.
                    window.history.replaceState(null, '', currentUrlNoQuerystring + '?' + queryString);
                    return;
                }
            });
        }
    }// checkScrollAndChangeURL


    /**
     * Check that bottom element is near the display area and make XHR (AJAX).
     * 
     * @private This method was called from `listenOnScroll()`.
     * @param object event 
     */
    checkScrollAndMakeXHR(event) {
        let thisClass = this;
        let windowHeight = window.innerHeight;
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        let documentScrollHeight = document.documentElement.scrollHeight;
        let totalScroll = (parseInt(windowHeight) + parseInt(scrollTop)) + parseInt(this.bottomOffset);

        if (totalScroll >= documentScrollHeight) {
            /*console.log(
                'total scroll >= document scroll height.',
                {
                    'totalScroll': totalScroll,
                    'documentScrollHeight': documentScrollHeight
                }
            );*/

            // begins ajax pagination.
            this.ajaxPagination()
            .then((responseObject) => {
                responseObject.rdScrollPaginationCurrentPageOffset = thisClass.previousStartOffset;
                document.dispatchEvent(
                    new CustomEvent(
                        'rdScrollPagination.done', {'detail': responseObject}
                    )
                );

                return Promise.resolve(responseObject);
            })
            .catch((responseObject) => {
                // .catch() must be after .then(). see https://stackoverflow.com/a/42028776/128761
                if (typeof(responseObject) === 'object') {
                    // if responseObject is not an object.
                    // due to ajax error can throw a string message, check before assign.
                    responseObject.rdScrollPaginationCurrentPageOffset = thisClass.previousStartOffset;
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
        }
    }// checkScrollAndMakeXHR


    /**
     * Check the sub items inside container and hide those are outside of display area on both top and bottom.
     * 
     * This is for performance improvement.
     * 
     * @link https://stackoverflow.com/a/12613687/128761 The ideas.
     * @private This method was called from `listenOnScroll()`.
     * @param object event 
     */
    checkScrollOutOfDisplayAreaAndHide(event) {
        let containerElement = document.querySelector(this.containerSelector);
        if (!containerElement) {
            return ;
        }
        let thisClass = this;
        const windowHeight = window.innerHeight;

        // check that all visible elements is outside the display area.
        let allVisibleElements = containerElement.querySelectorAll(this.childrenItemSelector + ':not(.rd-scroll-pagination-hidden-child)');
        if (allVisibleElements) {
            allVisibleElements.forEach((item, index) => {
                let rect = item.getBoundingClientRect();
                if (
                    rect.top < -parseInt(thisClass.offsetHideShow) || 
                    rect.bottom > (parseInt(windowHeight) + parseInt(thisClass.offsetHideShow))
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
                }
            });
        }
        allVisibleElements = undefined;// clear;

        // check that all invisible elements is inside the display area.
        let allInvisibleElements = containerElement.querySelectorAll(this.childrenItemSelector + '.rd-scroll-pagination-hidden-child');
        if (allInvisibleElements) {
            allInvisibleElements.forEach((item, index) => {
                let rect = item.getBoundingClientRect();
                if (
                    rect.top > -parseInt(thisClass.offsetHideShow) && 
                    rect.bottom < (parseInt(windowHeight) + parseInt(thisClass.offsetHideShow))
                ) {
                    // if top of this element is inside or nearly inside the top of visible area
                    // AND bottom of this element is inside or nearly inside the bottom of visible area
                    // unhide children of this item.
                    item.children[0].hidden = false;
                    // remove class.
                    item.classList.remove('rd-scroll-pagination-hidden-child');
                    // remove height of this item.
                    item.style.height = null;
                }
            });
        }
        allInvisibleElements = undefined;// clear;
    }// checkScrollOutOfDisplayAreaAndHide


    /**
     * Detect and set current start offset from querystring.
     * 
     * @private This method was called from `constructor()`.
     * @return int Return detected number of start offset.
     */
    detectAndSetCurrentStartOffset() {
        const params = new URLSearchParams(window.location.search);
        let currentStartOffsetQuerystring = params.get(this.changeURLParamStartOffset);

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
            if (this.startOffset !== 0) {
                if (parseInt(currentStartOffsetQuerystring) <= parseInt(this.startOffset)) {
                    currentStartOffsetQuerystring = this.startOffset;
                }
            }
        } else {
            if (this.startOffset != 0) {
                currentStartOffsetQuerystring = this.startOffset;
            } else {
                currentStartOffsetQuerystring = 0;
            }
        }

        return parseInt(currentStartOffsetQuerystring);
    }// detectAndSetCurrentStartOffset


    /**
     * Get XHR property object.
     * 
     * @return XMLHttpRequest
     */
    async getXHR() {
        return this.XHR;
    }// getXHR


    /**
     * Invoke, run the class.
     */
    invoke() {
        this.listenOnScroll();
    }// invoke


    /**
     * Listen on scroll window/element.
     * 
     * @private This method was called from `invoke()`.
     */
    listenOnScroll() {
        let thisClass = this;
        let lastScroll = 0;
        
        window.addEventListener('scroll', (event) => {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (scrollTop >= lastScroll) {
                // if scrolling down (content move up but mouse wheel scroll down).
                thisClass.isScrolling = 'down';
                thisClass.checkScrollAndMakeXHR(event);
                thisClass.checkScrollAndChangeURL(event);
                thisClass.checkScrollOutOfDisplayAreaAndHide(event);
            } else {
                // if scrolling up (content move down but mouse wheel scroll up).
                thisClass.isScrolling = 'up';
                thisClass.checkScrollAndChangeURL(event);
                thisClass.checkScrollOutOfDisplayAreaAndHide(event);
            }

            lastScroll = (scrollTop <= 0 ? 0 : parseInt(scrollTop));
        }, false);

        // trigger on scroll to make ajax pagination work immediately on start if there are space left on the bottom of visible area.
        this.triggerOnScroll();
    }// listenOnScroll


    /**
     * Set next start offset.
     * 
     * Manually set next start offset after AJAX complete. This for working with AJAX with HTML content type.
     * 
     * @since 0.0.4
     * @param int number 
     */
    setNextStartOffset(number) {
        this.previousStartOffset = parseInt(this.currentStartOffset);
        this.currentStartOffset = parseInt(number);
        // mark calling to false to allow next pagination call.
        this.callingXHR = false;
    }// setNextStartOffset


    /**
     * Trigger scroll event, 
     * best on initialize the class to trigger event 
     * and make ajax call while next pagination element is near the display area.
     * 
     * This method was called from `listenOnScroll()` and outside class.
     */
    triggerOnScroll() {
        window.dispatchEvent(new Event('scroll'));
    }// triggerOnScroll


}// ScrollPagination