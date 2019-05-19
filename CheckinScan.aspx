﻿<%@ Page Title="" Language="C#" MasterPageFile="~/secure/CherryPantry.Master" AutoEventWireup="true" CodeBehind="CheckinScan.aspx.cs" Inherits="FoodPantry.CheckinScan" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />

    <%--js plugins--%>
    <script type="text/javascript" src="js/jquery-3.3.1.min.js"></script>
    <script type="text/javascript" src="DataTables/datatables.min.js"></script>
    <script type="text/javascript" src="DataTables/Responsive-2.2.2/js/responsive.bootstrap.min.js"></script>
    <script type="text/javascript" src="DataTables/Responsive-2.2.2/js/dataTables.responsive.min.js"></script>
    <script type="text/javascript" src="js/Validate.js"></script>
    <script type="text/javascript" src="js/Checkin.js"></script>
    <script type="text/javascript" src="plugin/dist/sweetalert2.all.min.js"></script>
    <script type="text/javascript" src="plugin/dist/rmodal.min.js"></script>
    <script type="text/javascript" src="tooltipster/dist/js/tooltipster.bundle.min.js"></script>
    <script type="text/javascript" src="plugin/dist/select2.full.min.js"></script>

    <%--css stylesheets--%>
    <link rel="stylesheet" href="css/scan.css" />
    <link rel="stylesheet" type="text/css" href="css/POS.css" />
    <link rel="stylesheet" type="text/css" href="css/POS-Media.css" />
    <link rel="stylesheet" type="text/css" href="css/CheckIn.css" />
    <link rel="stylesheet" type="text/css" href="tooltipster/dist/css/plugins/tooltipster/sideTip/themes/tooltipster-sideTip-noir.min.css" />
    <link rel="stylesheet" type="text/css" href="DataTables/datatables.min.css" />
    <link rel="stylesheet" type="text/css" href="plugin/dist/animate.css" />
    <link rel="stylesheet" type="text/css" href="plugin/dist/rmodal.css" />
    <link rel="stylesheet" type="text/css" href="tooltipster/dist/css/tooltipster.bundle.min.css" />
    <link rel="stylesheet" type="text/css" href="plugin/dist/select2.min.css" />
    <link rel="stylesheet" type="text/css" href="plugin/dist/animate.css" />


</asp:Content>

<asp:Content ID="Content3" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">

    <div id="modal" class="modal">
        <div class="modal-dialog animated">
            <div class="modal-content">
                <div class="modal-header">
                    <strong>Add New Item</strong>
                </div>
                <div class="modal-body">
                    <div class="modal-error"></div>
                    <div class="form-group">
                        <div class='input-group w-100 p-3'>
                            <div class='input-group-prepend' style='width: 30%;'>
                                <span class='input-group-text w-100'>UPC/Name<span class="required">*</span></span>
                            </div>
                            <input id='txtUPC' type='text' class='form-control' readonly aria-label='UPC' value='' />
                        </div>
                         <div class='input-group w-100 p-3'>
                            <div class='input-group-prepend' style='width: 30%;'>
                                <span class='input-group-text w-100'>Category<span class="required">*</span></span>
                            </div>
                            <select class='form-control select2 select2-category' id='selCategory' style="width: 70%"></select>
                        </div>
                        <div class='input-group w-100 p-3'>
                            <div class='input-group-prepend' style='width: 30%;'>
                                <span class='input-group-text w-100'>Packaging<span class="required">*</span></span>
                            </div>
                            <select class='form-control select2 select2-packaging' id='selPackaging' style="width: 70%"></select>
                        </div>
                         <div class='input-group w-100 p-3'>
                            <div class='input-group-prepend' style='width: 30%;'>
                                <span class='input-group-text w-100'>Quantity<span class="required">*</span></span>
                            </div>
                            <input type="text" id="txtQuantity" class="form-control" />
                        </div>

                        <div class='input-group w-100 p-3'>
                            <div class='input-group-prepend' style='width: 30%;'>
                                <span class='input-group-text w-100'>Weight</span>
                            </div>
                            <input id='weight' type='text' class='form-control' aria-label='Weight' value='' />
                            <div class='input-group-append'>
                                <select class='form-control' id='weightunit'>
                                    <option value="oz">oz</option>
                                    <option value="g">g</option>
                                    <option value="kg">Kg</option>
                                    <option value="lbs">lbs</option>
                                    <option value="floz">fl oz</option>
                                </select>
                            </div>
                        </div>
                        <div class='input-group w-100 p-3'>
                            <div class='input-group-prepend' style='width: 30%;'>
                                <span class='input-group-text w-100'>Point Value<span class="required">*</span></span>
                            </div>
                            <input type="text" id="txtPoint" class="form-control" />
                        </div>
                        
                    </div>
                </div>

                <div class="modal-footer">
                    <button id="btnModalCancel" class="btn btn-cancel" type="button" onclick="modal.close();">Cancel</button>
                    <button id="btnModalSave" class="btn btn-save" type="button">Save</button>
                </div>
            </div>
        </div>
    </div>

    <div class="content" id="mainContent">
        <div class="pos d-flex justify-content-center" id="pos-checkin">
            <div class="box box-primary" style="height: 100%">
                <div class="box-header" style="display:none">
                    <h3>Scan UPC Code</h3>
                </div>
                <div class="box-body pt-4">
                    <input type="text" id="txtSearchUPC" title="Please Continue Using Scanner Device" class="scan-box form-control form-control-danger tooltipper" placeholder="Search Product by UPC" />
                    <div class="buttonWrapper">
                        <asp:Button runat="server" ID="btnSearch" Text="Search" OnClientClick='return false;' CssClass="btn btn-info" Style="display: none" />
                    </div>
                    <div id="alert-wrapper">
                    </div>
                    <div id="cart">
                        <table id="cart-table" class="table" style="width: 100%">

                            <thead>
                                <tr>
                                    <th>UPC</th>
                                    <th>Category</th>
                                    <th>Packaging</th>
                                    <th>Quantity</th>
                                    <%--<th>Weight</th>--%>
                                    <th>Points</th>
                                    <th>Subtotal</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>

                        </table>
                    </div>
                    <div id="pos-footer">
                        <div id="cart-info">
                            <table id="info-table">
                                <tr>
                                    <td>
                                        <span class="label">Items:</span><span class="value" id="totalItems">0</span>
                                    </td>
                                    <%--             <td>
                                        <span class="label">Total Points:</span><span class="value" id="totalPoints">0</span>
                                    </td>--%>
                                </tr>
                            </table>
                        </div>
                        <br />
                        <div class="buttonWrapper" id="checkout-buttons">
                            <button id="btnClear" class="btn btn-cancel" value="Checkout" onclick="return false;"><i class="material-icons">delete_sweep</i> Clear</button>
                            <button id="btnCheckin" class="btn btn-save" value="Checkin" onclick="return false;"><i class="material-icons">check_circle</i> Check-in</button>
                            <%--<button id="btnCancel" class="btn btn-danger" value="Checkout" onclick="return false;"><i class="material-icons">cancel</i> Cancel</button>--%>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    </div>
</asp:Content>
