<%@ Page
    Title="Home Page"
    Language="C#"
    MasterPageFile="~/Site.Master"
    AutoEventWireup="true"
    CodeBehind="Default.aspx.cs"
    Inherits="WorkflowGenExample._Default" %>

<asp:Content ID="BodyContent" ContentPlaceHolderID="MainContent" runat="server">
    <asp:LoginView runat="server" ViewStateMode="Disabled"> 
        <AnonymousTemplate>
            <h1>Welcome to the example</h1>
            <div class="alert alert-warning">
                You don't seem to be authenticated.
            </div>
            <div class="container">
                <button runat="server" class="btn btn-primary btn-lg" onserverclick="btnLogin_Click" type="button">Login</button>
            </div>
        </AnonymousTemplate>
    </asp:LoginView>
</asp:Content>
