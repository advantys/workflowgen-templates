<%@ Page
    Title="WorkflowGenProfile"
    Async="true"
    Language="C#"
    MasterPageFile="~/Site.Master"
    AutoEventWireup="true"
    CodeBehind="WorkflowGenProfile.aspx.cs"
    Inherits="WorkflowGenExample.WorkflowGenProfile" %>

<asp:Content ID="Content2" ContentPlaceHolderID="MainContent" runat="server">
    <h1 class="display-4">Your WorkflowGen Profile</h1>
    <asp:Table runat="server" ID="profileTable" CssClass="table table-sm table-bordered"></asp:Table>
</asp:Content>
