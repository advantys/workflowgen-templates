# OpenID Connect Example with Server-Side Web App
## Overview
This sample application uses the OpenID Connect (OIDC) protocol to authenticate
with Azure Active Directory and get an access token to request WorkflowGen's
GraphQL API.

## Prerequisites
1. .NET core SDK 3.1
1. Make sure to have a valid WorkflowGen licence and serial number.
1. Make sure to have access to an Azure subscription.
1. Make sure to have a WorkflowGen server set up with OIDC authentication with
Azure AD.

    See the [WorkflowGen for Azure](https://docs.advantys.com/workflowgen-for-azure/)
    guide for information and instructions.

## Technologies
This example uses ASP.NET Core 3.1 with the following libraries:

| Library | Description |
| --- | --- |
| GraphQL.Client | Make GraphQL queries and mutations. |
| Microsoft.Extensions.Configuration | Manage configuration for the app. |
| Microsoft.Extensions.Configuration.Binder | Allow binding the configuration to C# objects. |
| Microsoft.Extensions.Configuration.Json | Allow defining and managing configuration from JSON files. |
| Newtonsoft.Json | Manipulate JSON easily. |

It is based on the .NET Core `console` template.

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
$webApiApp = az ad app list `
    --query '[?displayName == `WorkflowGen GraphQL API`] | [0]' `
    | ConvertFrom-Json `
    | Select-Object -First 1
$password = [guid]::NewGuid().ToString()
$webAppUrl = "http://localhost:8080"

# Create the application registration.
$webAppClient = az ad app create `
    --display-name "My console app" `
    --homepage $webAppUrl `
    --identifier-uris $webAppUrl `
    --password $password `
    --end-date '2299-12-31T11:59:59+00:00' `
    --reply-urls "$webAppUrl/signin" `
    | ConvertFrom-Json

# Create a service principal for the registration
az ad sp create --id $webAppClient.appId

# Add required permissions for the GraphQL API access
az ad app permission add `
    --id $webAppClient.appId `
    --api $webApiApp.appId `
    --api-permissions "$($webApiApp.oauth2Permissions.id)=Scope"

# Grant the required permissions for the GraphQL API Access
az ad app permission grant `
    --api $webApiApp.appId `
    --id $webAppClient.appId
```

You'll need the following information to configure the example:

* The client ID. This is the value of `$webAppclient.appId`.
* The client secret. This is the value of `$password`.
* The GraphQL API App ID URI. This is the value of `$webApiApp.identifierUris[0]`.
* The Azure AD Directory ID. To get it, run the following command:

    ```powershell
    az account show | ConvertFrom-Json | ForEach-Object tenantId
    ```

## Create a new app registration in Azure AD (Azure Web Portal)
To represent this example application that wants to access WorkflowGen
GraphQL API, you need to register it in Azure AD and give it access to the API.
This way, when requesting the GraphQL API resource in the OIDC protocol, you
will get an access token that is a valid JWT and that can be transmitted to
the API for authorization.

1. In Azure AD, go to the **App Registrations** section and click the
**New registration** button.
1. Enter the following information:

    Name: `My console app`

1. When you're done, click on the **Register** button.

You now have registered this example application. You now need to finish
configuring it in order to get the auhtentication working properly.

1. On the Overview section, copy the Application ID, which you'll need later. This is the application's
Client ID.
1. Go to the **Certificates & secrets** section.
1. In the `Client secrets` sub-section, add a line with the following information:

    Description: `secret`
    Value: A random GUID (see the following note)

    **How to generate a GUID**

    Open a PowerShell terminal and enter the following command:
    ```powershell
    [guid]::NewGuid().ToString()
    ```
    Copy the result and enter in the value section of the form.

1. Click **Save**.
1. Copy the value that's generated after the save. It is the the application's
Client Secret.
1. Go to the **API permissions** section.
1. Click **Add a permission** and then the **My APIs** tab.
1. Search for the WorkflowGen GraphQL API application that you configured,
select it.
1. Click **Delegated permissions** and check the **default** permission.
1. Click the **Add permissions** button.

You should now see the WorkflowGen GraphQL API in the list of required
permissions for this example application.

You should now have four pieces of information:

1. This application registration's Application ID or Client ID
1. This application registration's Password Key or Client Secret
1. The WorkflowGen GraphQL API's App ID URI, which should look like this:

    `http://localhost:8888/wfgen/graphql`

1. Your Azure AD Directory ID, which can be found in the **Properties** section
of your Azure AD page.

## Configure the application in WorkflowGen
Since this application doesn't authenticate any human user, it needs to
authenticate itself. This means that WorkflowGen needs to know about this
application.

1. Go to WorkflowGen's Admin portal.

    **Note**: You need to be authenticated with a user that has administrative
    privileges in WorkflowGen.

1. Go to the **Applications** tab.
1. Click the **New application** button and enter the following information:

    * Name: `My console app`
    * Description: `Example daemon application using OIDC authentication`
    * Type: `Non Interactive Client`
    * Impersonate username: This can be any username. The console application will
    then have the same permissions has its associated user.
    * Client ID: The client id that you have collected earlier.

1. Click the **Save** button.

Your new application should now appear in the list of applications.

## Configure the example application
The configuration of the example is straightforward and takes a lot less steps
than configuring it in Azure AD.

### Prerequisites
1. Make sure to have installed the .NET core SDK version 3.1. The `dotnet`
command line tool should be available in a terminal.

Optionally, you can install Visual Studio Code to run and debug this example.
There are existing VSCode settings in the repository to make it easier to get
started.

### Configuration steps
1. Clone this application somewhere on your computer.

    ```powershell
    git clone https://github.com/advantys/workflowgen-templates.git
    Set-Location .\workflowgen-templates\integration\azure\authentication\azure-v1\client-credentials
    ```

1. Open the project folder with VSCode.
1. Duplicate the `appsettings.template.json` file and rename as
`appsettings.json`.
1. In the `appsettings.json` file, replace the placeholders inside the brackets
(`[]`) with the values that you got in the previous section:

    * `[your azure ad tenant id]`: Your Azure AD Directory ID
    * `[your application's client id (Application Id)]`: The Client ID
    * `[your application's client secret added to your azure ad app]`: The Client Secret
    * `[workflowgen url]`: The part of the App ID URI which represents WorkflowGen's
    domain and base path (e.g. `localhost:8888/wfgen`) in the example App ID URI
    above.

1. Start debugging in VSCode, or run the following command:

    1. `dotnet restore`
    1. `dotnet build`
    1. `dotnet run`

That's it! You should now see some outputs in the console.
You can now explore the code on how this app is configured and how it requests
WorkflowGen's GraphQL API.

