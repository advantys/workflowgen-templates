# OpenID Connect Example with Server Side Web App
## Overview
This example application uses the OpenID Connect (OIDC) protocol to authenticate
with Azure Active Directory and get an access token to request WorkflowGen's
GraphQL API.

## Prerequisites
1. Make sure to have a valid WorkflowGen licence and serial number.
1. Make sure to have access to an Azure aubscription.
1. Make sure to have a WorkflowGen server setup with OIDC authentication with
Azure AD.

    Read the [WorkflowGen for Azure](https://docs.advantys.com/workflowgen-for-azure/) guide to know how!

## Technologies
This example uses aspnet core 2.2 with the OpenIDConnect authentication
middleware. For GraphQL requests, it uses the GraphQL.Client library. Pages are
generated using the Razor engine. Bootstrap and jQuery are available client-side.

# Setup
Before beginning the setup of this example, you should now already have two (2)
app subscriptions in your Azure AD that represents WorkflowGen's portals and
WorkflowGen's GraphQL API. If you don't, you must finish the authentication
section of the WorkflowGen for Azure guide.

## Create a New App Registration in Azure AD
To represent this example application that wants to access WorkflowGen's
GraphQL API, we need to register it to Azure AD and give it access to the API.
This way, when requesting the GraphQL API resource in the OIDC protocol, you
will get an access token that is a valid JWT and that can be transmitted to
the API for authorization.

Keep in mind that the user that will authenticate with this application must
exists in WorkflowGen.

1. In Azure AD, go to the `App Registrations` section.
1. Click on the `New application registration` button.
1. Enter the following information:

    Name: `OIDC Example`
    Application Type: `Web app / API`
    Sign-on URL: `http://localhost:8080`

1. When you are ready, click on the `Create` button.

You now have registered this example application. You now need to finish
configuring it in order to get the auhtentication working properly.

1. Go to the `OIDC Example` application registration page in Azure AD.
1. Copy the Application ID and save it for later use. This is the `Client Id`
of the application.
1. Click on the `Settings` button.
1. Go to the `Reply URLs` section.
1. Add `http://localhost:8080/signin-oidc` to the list and click on the `Save`
button.
1. Return to the sections list and go to the `Keys` section.
1. In the `Passwords` sub-section, add a line with the following information:

    Description: `secret`
    Expires: `Never expires`
    Value: A random Guid (see the following note)

    **About Generating a Guid**

    Open a PowerShell terminal and enter the following command:
    ```powershell
    [guid]::NewGuid().ToString()
    ```
    Copy the result and enter in the value section of the form.

1. Click on the `Save` button.
1. Copy the value that has been generated after the save. It is the `Client Secret`
of this application.
1. Return to the sections list and go to the `Required permissions` section.
1. Click on the `Add` button.
1. Click on the `Select an API` button.
1. Search for the WorkflowGen's GraphQL API application that you've configured
prior to this guide, click on it and click on the `Select` button.
1. In the `Select permissions` section, check all checkboxes and click on the
`Select` button.
1. Click on the `Done` button.

You should now see WorkflowGen's GraphQL API in the list of required permissions
for this example application.

You should now have four (4) pieces of information in your possession at this
point:

1. This application's Application ID or `Client Id`
1. This application's Password Key or `Client Secret`
1. The App ID URI of WorkflowGen's GraphQL API. It should look like this:

    `http://localhost:8888/wfgen/graphql`

1. Your Azure AD Directory ID which can be found in the properties section of your
Azure AD page.

## Configure the Example Application
The configuration of the example is straightforward and takes a lot less steps
than configuring it in Azure AD.

### Prerequisites
1. Make sure to have installed the dotnet core sdk version 2.2. The `dotnet`
commandline tool should be available in a terminal.

Optionally, you can install Visual Studio Code to run and debug this example.
There is existing vscode settings in the repository to make it easier to get
started.

### Get Started
1. Clone this application somewhere on your computer.
1. Open the project this folder with vscode.
1. Duplicate the file `appsettings.Development.template.json` and rename it to
`appsettings.Development.json`.
1. Duplicate the file `appsettings.template.json` and rename it to
`appsettings.json`.
1. In the `appsettings.json` file, replace the placeholders surrounded by `[]`
inclusively with the values that you have gattered in the last section.

    * `[your azure ad tenant id]`: Your Azure AD Directory ID
    * `[your application's client id (Application Id)]`: The Client Id
    * `[your application's client secret added to your azure ad app]`: The Client Secret
    * `[workflowgen's url]`: The part of the App ID URI which represents WorkflowGen's
    domain and base path e.g. `localhost:8888/wfgen` in the example App ID URI
    above.

1. Start debugging in vscode or run:

    1. `dotnet restore`
    1. `dotnet run`

That's it! If you go to the page `http://locahost:8080`, you will be prompted
to authenticate in Azure AD. You can now explore the code on how this app is
configured and how it requests WorkflowGen's GraphQL API.
