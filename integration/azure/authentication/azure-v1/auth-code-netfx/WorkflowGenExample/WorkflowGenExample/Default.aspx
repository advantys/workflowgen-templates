<%@ Page
    Title="Home Page"
    Language="C#"
    MasterPageFile="~/Site.Master"
    AutoEventWireup="true"
    CodeBehind="Default.aspx.cs"
    Inherits="WorkflowGenExample._Default" %>
<%@ Import Namespace="System.Security.Claims" %>

<asp:Content ID="Styles" ContentPlaceHolderID="Styles" runat="server">
    <style>
        .page-td {
            max-width: 250px;
            word-wrap: break-word;
            text-align: left;
        }
    </style>
</asp:Content>

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
        <LoggedInTemplate>
            <h1 class="display-4">Hello <%: User.Identity.Name %>!</h1>
            <h2 class="display-6">Your user identity claims:</h2>
            <table class="table table-striped table-sm">
                <thead class="thead-dark">
                    <tr>
                        <th scope="col">Claim</th>
                        <th scope="col">Value</th>
                    </tr>
                </thead>
                <tbody>
                    <% foreach (var claim in (User.Identity as ClaimsIdentity).Claims) %>
                    <% { %>
                            <tr>
                                <td class="page-td"><%: claim.Type %></td>
                                <td class="text-left page-td"><%: claim.Value %></td>
                            </tr>
                    <% } %>
                </tbody>
            </table>
        </LoggedInTemplate>
    </asp:LoginView>
</asp:Content>
