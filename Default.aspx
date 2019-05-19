<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="FoodPantry.secure.Default" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
</head>
<body>
    <form id="form1" runat="server">
        <div>
            <asp:Label ID="test" runat="server"></asp:Label>
            <asp:CheckBox ID="demo_toggle" runat="server" OnCheckedChanged="demo_toggle_CheckedChanged" Text="Demo Mode On/Off" AutoPostBack="true" />
        </div>
    </form>
</body>
</html>
