# OpenID Connect Example with Single Page Application
## Overview
This sample application uses the OpenID Connect (OIDC) protocol to authenticate
with Azure Active Directory (Azure V1) and get an access token to request the WorkflowGen
GraphQL API.

## Prerequisites
1. .NET core SDK 2.2
1. NPM version 6.x or up.
1. Make sure to have a valid WorkflowGen licence and serial number.
1. Make sure to have access to an Azure subscription.
1. Make sure to have a WorkflowGen server set up with OIDC authentication with
Azure AD.

    See the [WorkflowGen for Azure](https://docs.advantys.com/workflowgen-for-azure/)
    guide for information and instructions.

## Technologies
This example uses ASP.NET Core 2.2 only to provide an entrypoint for the
browser to get the application and for configuration management.

### Main dependencies

| Name | Description |
| --- | --- |
| apollo-boost, apollo-link-context, react-apollo | Apollo suite of tools for client applications requesting a GraphQL API |
| react | View engine designed by Facebook |
| redux, react-redux | State management framework and its bindings for React |
| react-router-dom | Client-side router for displaying different components based on its url location |
| bootstrap, reactstrap | Bootstrap components for React |
| graphql-request | Small library for making GraphQL requests. It is passed as a React Context after authentication. |

# Setup
Before beginning the setup of this example, you should now already have two
app registrations in your Azure AD that represent the WorkflowGen portal and
GraphQL API. If you don't, follow the instructions in the authentication
section of the WorkflowGen for Azure guide.

## Create a new app registration in Azure AD (Azure cli)
The following commands create the required application registration in
Azure AD using the Azure CLI command line tools.

**Note**: You need to be logged into the Azure cli. To do this, run `az login`.

### Create the application registration
```powershell
# Replace `WorkflowGen GraphQL API` with the name of the registered WorkflowGen
# GraphQL API application including the backticks if you named it something else.
$webApiApp = & az ad app list `
    --query '[?displayName == `WorkflowGen GraphQL API`] | [0]' `
    | ConvertFrom-Json `
    | Select-Object -First 1
$webAppUrl = "http://localhost:5001"

# Create the application registration.
$webAppClient = & az ad app create `
    --display-name "My React SPA" `
    --homepage $webAppUrl `
    --identifier-uris $webAppUrl `
    --oauth2-allow-implicit-flow true `
    --reply-urls "$webAppUrl/callback" `
    | ConvertFrom-Json

# Create a service principal for the registration
& az ad sp create --id $webAppClient.appId

# Add required permissions for the GraphQL API access
& az ad app permission add `
    --id $webAppClient.appId `
    --api $webApiApp.appId `
    --api-permissions "$($webApiApp.oauth2Permissions.id)=Scope"

# Grant the required permissions for the GraphQL API Access
& az ad app permission grant `
    --api $webApiApp.appId `
    --id $webAppClient.appId

# Give consent on behalf of organization. The consent form is not presented
# for implicit grant flow.
& az ad app permission admin-consent `
    --id $webAppClient.appId
```

You'll need the following information to configure the example:

* The client ID. This is the value of `$webAppclient.appId`.
* The GraphQL API App ID URI. This is the value of `$webApiApp.identifierUris[0]`.
* The Azure AD Directory ID. To get it, run the following command:

    ```powershell
    az account show --query "tenantId"
    ```

## Create a new app registration in Azure AD (Azure Web Portal)
To represent this example application that wants to access WorkflowGen
GraphQL API, you need to register it in Azure AD and give it access to the API.
This way, when requesting the GraphQL API resource in the OIDC protocol, you
will get an access token that is a valid JWT and that can be transmitted to
the API for authorization.

Keep in mind that the user that will authenticate with this application must
exist in WorkflowGen.

1. In Azure AD, go to the **App Registrations** section and click the
**New application registration** button.
1. Enter the following information:

    * Name: `My aspnet core Web App`
    * Application Type: `Accounts in this organizational directory only`
    * Redirect URI:
        * Type: `Web`
        * Value: `http://localhost:5001/callback`

1. When you're done, click on the **Register** button.

You now have registered this example application. You now need to finish
configuring it in order to get the auhtentication working properly.

1. Go to the **My React SPA** registered application page in Azure AD.
1. Copy the Application ID in the **Overview** tab, which you'll need later.
This is the application's Client ID.
1. Click on the **Settings** button.
1. Go to the **Authentication** tab.
1. Look for the **Implicit Grant** section and check the **Access tokens**
and **Id tokens** options.
1. Click **Save**.
1. Go to the **API permissions** tab.
1. Click the **Add a permission** button.
1. In the screen that appeared, click on the **APIs my organization uses**.
1. Search for **WorkflowGen GraphQL API**.
1. Click on the correct WorkflowGen GraphQL API application.
1. Check the **user_impersonation** option.
1. Click the **Add permissions** button.

You also need to grant consent on behalf of the users of the organization
bacause the consent screen will not be shown for the implicit grant flow:

1. Go to the **API permissions** tab.
1. Click on the **Grant admin consent for \<name of your orgainzation\>**

You should now have four pieces of information:

1. This application registration's Application ID or Client ID
1. The WorkflowGen GraphQL API's App ID URI, which should look like this:

    `http://localhost:8888/wfgen/graphql`

1. Your Azure AD Directory ID, which can be found in the **Properties** section
of your Azure AD page.

## Configure the example application
The configuration of the example is straightforward and takes a lot less steps
than configuring it in Azure AD.

### Prerequisites
1. Make sure to have installed the .NET core SDK version 2.2. The `dotnet`
command line tool should be available in a terminal.
1. Make sure to have installed at least Node v10.x and NPM v6.x or up.
1. Make sure that the user that you're using is a valid WorkflowGen user.

Optionally, you can install Visual Studio Code to run and debug this example.
There are existing VSCode settings in the repository to make it easier to get
started.

### Configuration steps
1. Clone this application somewhere on your computer.

    ```powershell
    git clone https://github.com/advantys/workflowgen-templates.git
    Set-Location .\workflowgen-templates\integration\oidc\implicit-grant
    ```

1. Open the project folder with VSCode.
1. Duplicate the `appsettings.template.json` file and rename as
`appsettings.json`.
1. In the `appsettings.json` file, replace the placeholders inside the brackets
(`[]`) with the values that you got in the previous section:

    * `[your azure ad tenant id]`: Your Azure AD Directory ID
    * `[your application's client id (Application Id)]`: The Client ID
    * `[workflowgen url]`: The part of the App ID URI which represents WorkflowGen's
    domain and base path (e.g. `localhost:8888/wfgen`) in the example App ID URI
    above.

1. Start debugging in VSCode, or run the following command:

    1. `dotnet restore`
    1. `dotnet build`
    1. `dotnet run`

That's it! If you go to the page `http://localhost:5001`, you will be prompted
to authenticate in Azure AD. You can now explore the code on how this app is
configured and how it requests WorkflowGen's GraphQL API.
