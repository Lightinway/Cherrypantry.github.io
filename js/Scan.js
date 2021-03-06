﻿var dataset = [
    //{ Upc: "123123123", Category: "Cat", Quantity: "2", Point: "3" }
];

$(document).ready(function () {

    formatWindow();

    $(window).on('resize', function (e) {
        formatWindow();
    });


    $("#sidebar-wrapper").on('mouseenter', function (e) {

        $(".category").width($("#mainContent").width() - $(".pos").width() - $("#sidebar-wrapper").width() - 50);
    });

    $("#sidebar-wrapper").on('mouseleave', function (e) {
        $(".category").width($("#mainContent").width() - $(".pos").width());
    });



    $("#txtSearchUPC").val("");
    $("#txtSearchUPC").focus();
    $('.tooltipper').tooltipster({
        theme: ['tooltipster-noir', 'tooltipster-noir-customized']
    });
    $("#txtSearchUPC")
        .focusout(function () {
            $(this).tooltipster('open');
            // focus++;
            // $("#focus-count").text("focusout fired: " + focus + "x");
        });
    var table = $("#cart-table").DataTable({
        "columns": [
            {
                "title": "UPC",
                "data": "Upc",
                "visible": false

            },
            {
                "title": "Category",
                "data": "Category",
                "render": function (data, type, row) {
                    return '<span class="badge badge-pill badge-secondary">' + data + '</span>';
                }
            },
            {
                "title": "Packaging",
                "data": "Packaging"

            },
            {
                "title": "Quantity",
                "data": "Quantity",
                "render": function (data, type, row) {
                    return '<input type="text" class="quantity-text" value="' + data + '">';
                }
            },
            { "title": "Points", "data": "Point" },
            {
                "title": "Subtotal",
                "data": null,
                "render": function (data, type, row) {
                    return data['Quantity'] * data['Point'];
                },
                "visible": true
            },
            {
                "title": "",
                "data": null,
                "render": function (data, type, row) {
                    return '<i class="far fa-trash-alt" id="imgRemove"></i>';
                },
                "visible": true
            }
        ],
        searching: false,
        paging: false,
        info: false,
        ordering: false,
        data: dataset,
        scrollX: false,
        responsive: false,
        autoWidth: false,

        initComplete: function () {
            this.api().columns.adjust().draw();
        },
        language: {
            "emptyTable": "There are no items in your cart. "
        },

        "drawCallback": function (settings) {
            var table = $("#cart-table").DataTable();
            var quantity = 0;
            var total = 0;
            var maxPoint = parseInt($("#ContentPlaceHolder1_hfMaxPoint").val());

            table.rows().every(function (rowIdx, tableLoop, rowLoop) {
                var data = this.data();
                quantity += parseInt(data.Quantity);
                total += (data.Quantity * data.Point);


            });
            if (total > maxPoint) { //CHANGE TO MAX POINT
                if ($("#alert-wrapper")[0].innerHTML === "") {
                    $("#alert-wrapper").append(
                        '<div class="alert alert-danger" role="alert">'
                        + 'Cart is over the Point Limit!'
                        + '</div >'
                    );
                }
            }
            else {
                $("#alert-wrapper")[0].innerHTML = "";
            }
            $("#totalItems")[0].innerHTML = quantity;
            $("#totalPoints")[0].innerHTML = total;
        }
    });

    loadCards();


    var timeout = null;
    $("#txtSearchUPC").keydown(function (e) {
        if (e.keyCode === 13) {
            e.preventDefault();
        }
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            var sendData = '{"search": "' + $("#txtSearchUPC").val() + '"}';



            if (e.keyCode === 13) { //Search By UPC

                if ($("#txtSearchUPC").val() === "") {
                    return;
                }
                var upc = $("#txtSearchUPC").val();
                if (upc !== "") {

                    var sendDataUPC = '{"UPC": "' + upc + '"}';

                    jQuery.ajax({
                        type: "POST",
                        url: "Checkout.aspx/getCategoryID",
                        contentType: "application/json; charset=utf-8",
                        data: sendDataUPC,
                        dataType: "json",
                        success: function (result) {
                            let searchItem = { CategoryID: result.d, UPC: upc };
                            searchProduct(searchItem);
                        },
                        error: function (e) {
                            console.log(e);
                        }
                    });

                }
                return false; // prevent the button click from happening
            }
            else { //Search by Keyword
                jQuery.ajax({
                    type: "POST",
                    url: "Checkout.aspx/getCategoriesSearch",
                    contentType: "application/json; charset=utf-8",
                    data: sendData,
                    dataType: "json",
                    success: function (result) {
                        var x = (result.d).replace("\\", "");
                        var cats = JSON.parse(x);
                        drawCards(cats);

                        if (result.d === "[]") {
                            var div = "<div id='inventoryEmpty-wrapper'><h3 id='invenotryEmpty-text'>No Items Matching '" + $('#txtSearchUPC').val() + "' .</h3></div>";
                            $("#category-text").show();
                            $("#category-text").html(div);
                            $("#inventoryEmpty-wrapper").height($(".pos").height());

                        }
                        else {
                            $("#category-text").hide();

                        }



                    },
                    error: function (e) {
                        console.log(e);
                    }
                });
            }
        }, 200);
    });

    $("body").on('mouseenter', '.card', function (e) {
        $("body").css("cursor", "pointer");
    });
    $("body").on('mouseleave', '.card', function (e) {
        $("body").css("cursor", "default");
    });

    $("body").on('click', '.card', function (e) {
        var id = $(this).data("id");
        let searchItem = { CategoryID: id, UPC: null };
        searchProduct(searchItem);

    });

    var touchmoved;
    $('body').on('touchend', '.card', function (e) {
        if (touchmoved != true) {
            var id = $(this).data("id");
            let searchItem = { CategoryID: id, UPC: null };
            searchProduct(searchItem);
        }
    }).on('touchmove', function (e) {
        touchmoved = true;
    }).on('touchstart', function () {
        touchmoved = false;
    });

    $("#btnClear").click(function () {
        clearCart("alert");
    });

    $("#btnCheckout").click(function () {
        checkout();
    });

    //Update Quantity
    $('body').on('focusout', '.quantity-text', function (e) {
        var table = $("#cart-table").DataTable();
        var data = table.row($(this).closest('tr')).data();
        var input = this.value;


        if (input === "" || isNaN(input)) {
            return;
        }
        else if (input === "0") {
            this.value = data.Quantity;
            return;
        }
        else {
            var maxPoint = parseInt($("#ContentPlaceHolder1_hfMaxPoint").val());
            var currentPoint = parseInt($("#totalPoints")[0].innerHTML);

            if (input < data.Quantity) {
                input = input * -1;
            }

            if (currentPoint + (data.Point * input) > maxPoint) {
                Swal.fire({
                    title: "Points Over Limit ",
                    text: "You have too many items in your cart. Please keep the total point value under the limit.",
                    type: "warning",
                    confirmButtonText: "Do Not Add Item",
                    confirmButtonColor: "#dc3545",
                    showCancelButton: true,
                    cancelButtonText: 'Override',
                    cancelButtonColor: "#17a2b8",
                    focusCancel: true,
                    allowOutsideClick: false
                })
                    .then((result) => {
                        if (result.value) {
                            // removeItem(item.Upc);
                            return;
                        }
                        else {
                            input = Math.abs(input);
                            data.Quantity = input;
                            table.row(data).cells().invalidate().draw();
                            updateItem(data, input);
                        }
                    });
            }
            else {
                data.Quantity = input;
                table.row(data).cells().invalidate().draw();
                updateItem(data, input);
            }

        }
    });

    $('#cart-table tbody').on('click', '#imgRemove', function () {
        var data = table.row($(this).parents('tr')).data();

        table.row($(this).parents('tr')).remove().draw();

        //removeItem(data["Upc"]);
    });


    $(document).keypress(
        function (event) {
            if (event.which === '13') {
                event.preventDefault();
            }
        }
    );

    $("#btnModalCancel").on("click", function (e) {
        var e = jQuery.Event("keydown");
        e.which = 8;
        $("#txtSearchUPC").trigger(e);
    });

    $("#btnModalSave").on("click", function (event) {
        if (validateemptyCheckout() === false) {
            return;
        }

        var category = $("#selCategory").select2('data')[0].text;
        var packaging = $("#selPackaging").select2('data')[0].text;

        var categoryObj = {
            type: category,
            packaging: packaging
        };

        var categoryID = getcategoryid(categoryObj);

        $("#txtUPC").val();

        var item = {
            Upc: $("#txtUPC").val(),
            Category: category,
            Packaging: packaging,
            Weight: $("#weight").val() + " " + $("#weightunit").val(),
            Quantity: -1,
            Point: $("#txtPoint").val()
        };
        console.log(item);
        jQuery.ajax({
            type: "POST",
            url: "Checkout.aspx/AddToInventory",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(item),
            dataType: "json",
            success: function (result) {
                console.table(item);
                modal.close();
                item.Category = category;
                addItem(item);
            },
            error: function (e) {
                console.log(e);
            }
        });
    });

    $('.select2-category').select2({
        data: generateCategoryList()
    });

    $('.select2-packaging').select2({
        data: generatePackageList(),
        tags: true
    });

    $('.select2-packaging').on('select2:select', function (e) {
        var category = $("#selCategory").select2('data')[0].text;
        var packaging = $("#selPackaging").select2('data')[0].text;

        if ($(".select2-category").val() != "-1") {
            var quant = getPointValue(category, packaging);
            if (quant != "false" && quant != "") {
                $("#txtPoint").val(quant);
                $("#txtPoint").attr('readonly', true);

            }
            else {
                $("#txtPoint").val("");
                $("#txtPoint").attr('readonly', false);
            }
        }
    });

    $('.select2-category').on('select2:select', function (e) {
        var category = $("#selCategory").select2('data')[0].text;
        var packaging = $("#selPackaging").select2('data')[0].text;

        if ($(".select2-packaging").val() != "-1") {
            var quant = getPointValue(category, packaging);
            if (quant != "false" && quant != "") {
                $("#txtPoint").val(quant);
                $("#txtPoint").attr('readonly', true);

            }
            else {
                $("#txtPoint").val("");
                $("#txtPoint").attr('readonly', false);
            }
        }
    });

    var modal = new RModal(document.getElementById('modal'), {
        //content: 'Abracadabra'
        beforeOpen: function (next) {
            console.log('beforeOpen');
            $("#txtCategory").val("").removeClass("error");
            $("#txtPackaging").val("").removeClass("error");
            $("#txtWeight").val("").removeClass("error");
            //$("#txtQuantity").val("").removeClass("error");
            $("#txtPoint").val("").removeClass("error");
            $("#txtPoint").val("");
            $("#txtPoint").attr('readonly', false);
            $(".modal-error")[0].innerHTML = "";
            $("*").removeClass("form-error");
            $('.select2').select2().val("-1").trigger("change");

            next();
        }
        , afterOpen: function () {
            console.log('opened');
        }

        , beforeClose: function (next) {
            console.log('beforeClose');
            next();
        }
        , afterClose: function () {
            //$("input").val("");

        }

        , escapeClose: true
    });

    window.modal = modal;
});

function generateCategoryList() {
    var list;

    jQuery.ajax({
        type: "POST",
        url: "CheckinScan.aspx/getCategoryList",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false,
        success: function (result) {
            var x = result.d.replace("\\", "");
            var items = JSON.parse(x);
            list = items;
        },
        error: function (e) {
            console.log(e);
        }
    });

    return formatSelect2List(list);
}

function generatePackageList() {
    var list;

    jQuery.ajax({
        type: "POST",
        url: "CheckinScan.aspx/getPackagesList",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false,
        success: function (result) {
            var x = result.d.replace("\\", "");
            var items = JSON.parse(x);
            list = items;
        },
        error: function (e) {
            console.log(e);
        }
    });

    return formatSelect2List(list);
}

function formatSelect2List(list) {
    var dataSet = [];

    $.each(list, function (index, item) {    //format into select2 format

        var data = {
            id: item, //change based on what data is required
            text: item
        };

        dataSet.push(data);

    });

    dataSet.unshift({  //add spot for placeholder
        id: -1,
        text: ''
    });

    return dataSet;
}
function getcategoryid(categoryitem) {
    var result;

    $.ajax({
        method: "POST",
        async: false,
        url: "CheckinScan.aspx/getCategoryId",
        data: JSON.stringify(categoryitem),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (categorydata) {
            var x = (categorydata.d).replace("\\", "");
            data = JSON.parse(x);
            result = data;
            console.log(data);
        },
        error: function (e) {
            console.log(e);
        }
    });

    console.log(result);
    return result;
}



//Inputs a UPC code and sends to db to check if item is in inventory
//Ouput: Sends item object to recordItem()
function searchProduct(searchItem) {
    var sendData = '{"Id": "' + searchItem.CategoryID + '"}';

    $("#txtSearchUPC").val("");

    jQuery.ajax({
        type: "POST",
        url: "Checkout.aspx/CheckInventory",
        contentType: "application/json; charset=utf-8",
        data: sendData,
        dataType: "json",
        success: function (result) {
            var x = (result.d).replace("\\", "");
            var item = JSON.parse(x);
            item.searchedUPC = searchItem.UPC;
            console.log(item);
            proccessItem(item);
            //var pointCount = $("#totalPoints")[0].innerHTML;
            //var itemCount = $("#totalItems")[0].innerHTML;

            //$("#totalPoints")[0].innerHTML = parseInt(pointCount) + item.Point;
            //$("#totalItems")[0].innerHTML = parseInt(itemCount) + 1;
        },
        error: function (e) {
            console.log(e);
        }
    });
}


function proccessItem(item) {
    var table = $("#cart-table").DataTable();
    var maxPoint = parseInt($("#ContentPlaceHolder1_hfMaxPoint").val());
    var currentPoint = parseInt($("#totalPoints")[0].innerHTML);


    if (item.Category === "Item Not Found") {
        console.log("Item Not Found -- UPC: " + item.searchedUPC + ", Category: " + item.Category);
        modal.open();
        if (isNaN(item.searchedUPC)) {
            $("#txtUPC").val("");
        }
        else {
            $("#txtUPC").val(item.searchedUPC);
        }
        $("#txtUPC").val(item.searchedUPC);

        return;
    }

    if (currentPoint + item.Point > maxPoint) {
        Swal.fire({
            title: "Points Over Limit ",
            text: "You have too many items in your cart. Please keep the total point value under the limit.",
            type: "warning",
            confirmButtonText: "Do Not Add Item",
            confirmButtonColor: "#dc3545",
            showCancelButton: true,
            cancelButtonText: 'Override',
            cancelButtonColor: "#17a2b8",
            focusCancel: true,
            allowOutsideClick: false
        })
            .then((result) => {
                if (result.value) {
                    //removeItem(item.Upc);
                    return;
                }
                else {
                    addItem(item);
                }
            });
    }
    else {
        addItem(item);
    }
}

function addItem(item) {
    var found = false;
    var table = $("#cart-table").DataTable();

    //Checks if item is already in table and if so incriments the quantity
    table.rows().every(function (rowIdx, tableLoop, rowLoop) {
        var d = this.data();

        if (d['Upc'] === item.Upc) {
            var quantity = parseInt(d['Quantity']);
            d['Quantity'] = quantity + 1;
            this.cells().invalidate().draw();
            found = true;
        }
        return;
    });
    if (found === false) {
        var data = { Upc: item.Upc, Category: item.Category, Packaging: item.Packaging, Quantity: 1, Point: item.Point, CategoryID: item.CategoryID };
        table.row.add(data).draw();

    }
    var e = jQuery.Event("keydown");
    e.which = 8;
    $("#txtSearchUPC").trigger(e);
    // $("#txtSearchUPC").focus();

}

//Send new Item to DB
function saveItem(item) {
    //recordItem(item);

    jQuery.ajax({
        type: "POST",
        url: "Checkout.aspx/AddToInventory",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(item),
        dataType: "json",
        success: function (result) {
            var item = JSON.parse(result.d);
            processItem(item);
        },
        error: function (e) {
            console.log(e);
        }
    });
}

function checkout() {
    var table = $("#cart-table").DataTable();

    var itemList = [];

    table.rows().every(function (rowIdx, tableLoop, rowLoop) {
        var data = this.data();
        var itemData = {
            CategoryID: data.CategoryID, Quantity: data.Quantity
        };
        itemList.push(itemData);
    });

    var data = {
        "ItemCount": $("#totalItems")[0].innerHTML,
        "PointCount": $("#totalPoints")[0].innerHTML,
        "itemList": itemList
    };


    Swal.fire({
        title: 'Ready for Checkout?',
        //text: "This will checkout all your items.",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, checkout!'
    }).then((result) => {
        if (result.dismiss === "cancel") {
            return;
        }
        jQuery.ajax({
            type: "POST",
            url: "Checkout.aspx/CheckoutCart",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            dataType: "json",
            success: function (result) {
                switch (result.d) {
                    case "No Items":
                        Swal.fire({
                            title: "Checkout",
                            text: "There are no items in your cart. Please first checkout an item.",
                            type: "warning"
                        });
                        break;
                    case "error":
                        Swal.fire({
                            title: "Checkout",
                            text: "There was an error checking out your cart. Please try again.",
                            type: "error"
                        });
                        break;
                    default:
                        Swal.fire({
                            title: "Checkout",
                            text: "Your cart has been checked out!",
                            type: "success"
                        });
                        console.log("Cart checked out - Cart ID: " + result.d);
                        clearCart("no alert");
                }


            },
            error: function (e) {
                console.log(e);
            }
        });
    });
}

function clearCart(flag) {
    var table = $("#cart-table").DataTable();

    if (flag === "no alert") {
        table.clear().draw();
        return;
    }
    Swal.fire({
        title: 'Are you sure?',
        text: "This will empty your entire cart.",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, clear!'
    }).then((result) => {
        if (result.dismiss === "cancel") {
            return;
        }
        table.clear().draw();
    });
}

function updateItem(data, input) {
    var table = $("#cart-table").DataTable();
    var sendData = '[{"UPC": "' + data.Upc + '"},{"quantity": "' + input + '"}';

    var item = {
        UPC: data.Upc,
        quantity: input
    };

    jQuery.ajax({
        type: "POST",
        url: "Checkout.aspx/UpdateCartItem",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(item),
        dataType: "json",
        success: function (result) {
            console.log(result);
        },
        error: function (e) {
            console.log(e);
        }
    });
}

function getPointValue(category, packaging) {
    //var sendData = '[{"category": "' + category + '"},{"packaging": "' + packaging + '"}';
    var point = "false";

    jQuery.ajax({
        type: "POST",
        url: "Checkout.aspx/getPointValue",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({ category: category, packaging: packaging }),
        dataType: "json",
        async: false,
        success: function (result) {
            if (result.d != "Not Found") {
                point = result.d;
            }
            else {
                point = "false";
            }
        },
        error: function (e) {
            console.log(e);
        }
    });

    return point;
}


function loadCards() {
    $("#txtSearchUPC").val("");
    jQuery.ajax({
        type: "POST",
        url: "Checkout.aspx/getCategories",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (result) {
            var x = (result.d).replace("\\", "");
            var cats = JSON.parse(x);
            drawCards(cats);
        },
        error: function (e) {
            console.log(e);
        }
    });
}

function drawCards(cats) {
    $("#catagory-wrapper")[0].innerHTML = "";
    $.each(cats, function (key, value) {
        if (value.Packaging === "") {
            value.Packaging = " - ";
        }
        $("#catagory-wrapper").append(
            '<div class="card" data-ID="' + value.Id + '" style="">'
            + '<div class= "card-body" >'
            + '<h5 class="card-title">' + value.Category + '</h5>'
            + '<h6 class="card-subtitle mb-2 text-muted">' + value.Packaging + '</h6>'
            + '</div >'
            + '</div >'
        );

    });
}

function formatWindow() {
    //$("#menu-toggle").click();
    $("#wrapper").height($(window).height());
    $("#wrapper").height($(window).height());
    $(".category").width($("#mainContent").width() - $(".pos").width());
    $("#cart").css('max-height', $("#pos-box").height() / 1.8);
}


