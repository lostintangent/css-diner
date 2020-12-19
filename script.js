$(document).ready(() => {
    $(".table").on("mouseover", "*", function (e) {
        e.stopPropagation();
        showTooltip($(this));
    });

    $(".markup").on("mouseover", "div *", function (e) {
        el = $(this);
        const markupElements = $(".markup *");
        const index = markupElements.index(el) - 1;
        showTooltip($(".table *").eq(index));
        e.stopPropagation();
    });

    $(".markup").on("mouseout", "*", (e) => {
        hideTooltip();
        e.stopPropagation();
    });

    $(".table").on("mouseout", "*", (e) => {
        hideTooltip();
        e.stopPropagation();
    });

    $(".table-wrapper,.table-edge").css("opacity", 0);

    setTimeout(function () {
        loadLevel();
        $(".table-wrapper,.table-edge").css("opacity", 1);
    }, 50);
});

function checkResults(ruleSelected, levelSelected, rule) {
    const ruleTable = $(".table").clone();
    ruleTable.find(".strobe").removeClass("strobe");
    ruleTable.find(rule).addClass("strobe");
    return ($(".table").html() == ruleTable.html());
}

function getMarkup(el) {
    const hasChildren = el.children.length > 0 ? true : false;
    const elName = el.tagName.toLowerCase();
    const wrapperEl = $("<div/>");
    let attributeString = "";
    $.each(el.attributes, function() {
        if (this.specified) {
            attributeString = attributeString + ' ' + this.name + '="' + this.value + '"';
        }
    });
    let attributeSpace = "";
    if (attributeString.length > 0) {
        attributeSpace = " ";
    }
    if (hasChildren) {
        wrapperEl.text("<" + elName + attributeSpace + attributeString + ">");
        $(el.children).each((i, el) => {
            wrapperEl.append(getMarkup(el));
        });
        wrapperEl.append("&lt;/" + elName + "&gt;");
    } else {
        wrapperEl.text("<" + elName + attributeSpace + attributeString + " />");
    }
    return wrapperEl;
}

function loadBoard() {
    const markupHolder = $("<div/>")

    $(window.config.boardMarkup).each((i, el) => {
        if (el.nodeType == 1) {
            const result = getMarkup(el);
            markupHolder.append(result);
        }
    });

    $(".table").html(window.config.boardMarkup);
    addNametags();
    $(".table *").addClass("pop");

    $(".markup").html('<div>&ltdiv class="table"&gt' + markupHolder.html() + '&lt/div&gt</div>');
}

function addNametags() {
    $(".nametags *").remove();
    $(".table-wrapper").css("transform", "rotateX(0)");
    $(".table-wrapper").width($(".table-wrapper").width());

    $(".table *").each(function () {
        if ($(this).attr("for")) {
            const pos = $(this).position();
            const width = $(this).width();
            const nameTag = $("<div class='nametag'>" + $(this).attr("for") + "</div>");
            $(".nametags").append(nameTag);
            const tagPos = pos.left + (width / 2) - nameTag.width() / 2 + 12;
            nameTag.css("left", tagPos);
        }
    });

    $(".table-wrapper").css("transform", "rotateX(20deg)");
}

function loadLevel() {
    loadBoard();
    resetTable();

    $(".order").text(window.config.doThis);

    setTimeout(() => {
        $(".table " + window.config.selector).addClass("strobe");
        $(".pop").removeClass("pop");
    }, 200);
}

function resetTable() {
    $(".display-help").removeClass("open-help");
    $(".clean,.strobe").removeClass("clean,strobe");
    $(".clean,.strobe").removeClass("clean,strobe");
    $("input").addClass("input-strobe");
    $(".table *").each(() => {
        $(this).width($(this).width());
    });

    const tableWidth = $(".table").outerWidth();
    $(".table-wrapper, .table-edge").width(tableWidth);
}

function hideTooltip() {
    $(".enhance").removeClass("enhance");
    $("[data-hovered]").removeAttr("data-hovered");
    $(".helper").hide();
}

function showTooltip(el) {
    el.attr("data-hovered", true);
    const tableElements = $(".table *");
    const index = tableElements.index(el);
    const that = el;
    $(".markup > div *").eq(index).addClass("enhance").find("*").addClass("enhance");
    const helper = $(".helper");

    const pos = el.offset();

    helper.css("top", pos.top - 65);
    helper.css("left", pos.left + (el.width() / 2));

    let helpertext;

    console.log("Three");
    const elType = el.get(0).tagName.toLowerCase();
    helpertext = '<' + elType;

    let elClass = el.attr("class");

    if (elClass) {
        if (elClass.indexOf("strobe") > -1) {
            elClass = elClass.replace("strobe", "");
        }
    }

    if (elClass) {
        helpertext = helpertext + ' class="' + elClass + '"';
    }

    const elFor = el.attr("for");

    if (elFor) {
        helpertext = helpertext + ' for="' + elFor + '"';
    }

    const id = el.attr("id");
    if (id) {
        helpertext = helpertext + ' id="' + id + '"';
    }

    helpertext = helpertext + '></' + elType + '>';
    helper.show();
    helper.text(helpertext);
}

function checkInput(rule) {
    if (rule === ".strobe") {
        rule = null;
    }

    $(".shake").removeClass("shake");

    $(".strobe,.clean,.shake").each(() => {
        $(this).width($(this).width());
        $(this).removeAttr("style");
    });

    const baseTable = $('.table');

    try {
        $(".table").find(rule).not(baseTable);
    }
    catch (e) {
        rule = null;
    }

    const ruleSelected = $(".table").find(rule).not(baseTable);            // What the correct rule finds
    const levelSelected = $(".table").find(window.config.selector).not(baseTable); // What the person finds

    let win = false;

    if (ruleSelected.length == 0) {
        $(".editor").addClass("shake");
    }

    if (ruleSelected.length == levelSelected.length && ruleSelected.length > 0) {
        win = checkResults(ruleSelected, levelSelected, rule);
    }

    if (win) {
        ruleSelected.removeClass("strobe");
        ruleSelected.addClass("clean");

    } else {
        ruleSelected.removeClass("strobe");
        ruleSelected.addClass("shake");

        setTimeout(() => {
            $(".shake").removeClass("shake");
            $(".strobe").removeClass("strobe");
            levelSelected.addClass("strobe");
        }, 500);
    }

    return win;
}