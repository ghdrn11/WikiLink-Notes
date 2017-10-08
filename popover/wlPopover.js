﻿/*
#### DOM manipulation, data input and output ####
@------------------------------------------------@
| It creates a div element at the displayed page |
| DOM, as well as two cals, for padding sakes.   |
| Gets the ranges of these elements and listen to|
| the onMouseUp event, that gets to selected     |
| text, parses it and request data to the API.   |
| The response will be displayed into a popover. |
|                                                |
|It depends on: css/popover.css                  |
|                                                |
| Known issues:                                  |
| - The popover closes wherever you click,       |
| trigged by the onMouseDown event; Gonna fix it.|
|                                                |
@------------------------------------------------@
*/

(function () {
    "use strict";

    var previous = null;    //The previous selected text will keep stored for 2 seconds;
    var rel1, rel2;         //Range of Cals;
    var div;                //The popover inserted;
    var sel = window.getSelection();

    //Immediately insert the cals, the popover div and get their ranges;
    insertCals();
    getRanges();
    insertDiv();

    document.onmouseup = async function (event) {
        if (event.which === 1)
            if (!sel.isCollapsed)
                searchSelectedAsync();
    };

    document.onmousedown = function () {
        hideDiv();
    }

    async function searchSelectedAsync() {
        const enabled = await isEnabledAsync();
        const selText = checkSelection(sel.toString());
        if (selText != previous && enabled === true) {
            repoRequest(selText);
            previous = selText;
            AutoResetPrevious();
        }
    }

    async function isEnabledAsync() {
        return new Promise(resolve => {
            chrome.storage.sync.get('popoverIsEnabled',
                obj => resolve(obj.popoverIsEnabled)
            );
        });
    }

    function AutoResetPrevious() {
        setTimeout(function () {
            previous = null;
        }, 2000);
    }

    function checkSelection(text) {
        if (text)
            if (/\S/.test(text))
                return text;
        return previous;
    }

    function repoRequest(term) {
        let msg = {
            module: 'repository',
            method: 'searchTerm',
            key: term
        };
        chrome.runtime.sendMessage(msg, showData);
    }

    function showData(data) {
        if (data.body.length > 0) {
            div.textContent = data.body;
            showDiv();
        }
        else {
            div.textContent = 'Ops: nenhum resultado encontrado...';
            showDiv();
        }
    }

    function insertDiv() {
        div = document.createElement('div');
        div.setAttribute('class', 'wikilink-popover');
        div.setAttribute('id', 'wikilink-popover');
        document.body.appendChild(div);
    }

    function insertCals() {
        let cal1, cal2;
        cal1 = createCal('cal1');
        cal2 = createCal('cal2');
        document.body.appendChild(cal1);
        document.body.appendChild(cal2);
    }

    function createCal(name) {
        const cal = document.createElement('div');
        cal.setAttribute('id', name);
        cal.textContent = '\xa0';
        return cal;
    }

    function getRanges() {
        rel1 = document.createRange();
        rel1.selectNode(document.getElementById('cal1'));
        rel2 = document.createRange();
        rel2.selectNode(document.getElementById('cal2'));
    }

    function showDiv() {
        const r = sel.getRangeAt(0).getBoundingClientRect();
        const rb1 = rel1.getBoundingClientRect();
        const rb2 = rel2.getBoundingClientRect();
        div.style.top = (r.bottom - rb2.top) * 100 / (rb1.top - rb2.top) + 'px';
        div.style.left = (r.left - rb2.left) * 100 / (rb1.left - rb2.left) + 'px';
        div.style.display = 'block';
    }

    function hideDiv() {
        div.style.display = "none";
    }

})();