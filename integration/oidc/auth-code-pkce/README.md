# OpenID Connect Example with Single Page Application
## Overview
This sample application uses the OpenID Connect (OIDC) protocol to authenticate
with Azure Active Directory (Azure V1) and get an access token to request the WorkflowGen
GraphQL API.

## Prerequisites
1. NPM version 6.x or up.
1. Yarn version 1.16+ or up.
1. React-Native tools installed (`npm install --global react-native-cli`)
1. Xcode 10.2 (for a Swift 5 compiler and the iOS 12 SDK)
    1. Make sure to have installed the commandline tools (`xcode-select --install`).
1. Android Studio 3.4
    1. Android SDK Platform 28 (Android 9.0 Pie)
    1. Android SDK Tools
        1. Android Emulator 29.0.9
        1. Android SDK Platform-Tools 28.0.3
        1. Android SDK Tools 26.1.1
1. The environment variable **ANDROID_HOME** must be set to the physical Android
SDK location.
1. Make sure to have a valid WorkflowGen licence and serial number.
1. Make sure to have access to an Azure subscription.
1. Make sure to have a WorkflowGen server set up with OIDC authentication with
Azure AD.

    See the [WorkflowGen for Azure](https://docs.advantys.com/workflowgen-for-azure/)
    guide for information and instructions.

**Note**: Xcode is needed if you want to run the iOS version of the application.
For this, you need to have a Mac. For the Android version, you need a platform
supported by Android Studio (macOS, Windows or Linux).

**Note**: The scripts below are in Powershell. To run them on non-Windows systems,
you need to install Powershell Core.

## Technologies
This example builds a mobile application for both the Android and iOS platforms
using the react-native framework. No special libraries has been used for the
authentication because none suitable is available at time of writing.

### Main dependencies

| Name | Description |
| --- | --- |
| apollo-boost, apollo-link-context, react-apollo | Apollo suite of tools for client applications requesting a GraphQL API |
| react | View engine designed by Facebook |
| react-native | Framework for multi-platform mobile development designed by Facebook |
| redux, react-redux | State management framework and its bindings for React |
| react-navigation | JavaScript router for view management |
| async-storage | On-device storage library for data persistence |
| react-native-keychain | Library to store data securely such as the refresh token |

# Setup
Before beginning the setup of this example, you should now already have two
app registrations in your Azure AD that represent the WorkflowGen portal and
GraphQL API. If you don't, follow the instructions in the authentication
section of the WorkflowGen for Azure guide.

**Note**: This WorkflowGen should be available over HTTPS using a valid
certificate. iOS and Android will refuse any request to HTTP endpoint other
than localhost.

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
$nativeAppUri = "workflowgenexample://"

# Create the application registration.
$nativeAppClient = & az ad app create `
    --display-name "My React-Native SPA" `
    --identifier-uris $nativeAppUri `
    --reply-urls "$($nativeAppUri)callback" `
    --native-app true `
    | ConvertFrom-Json

# Create a service principal for the registration
& az ad sp create --id $nativeAppClient.appId

# Add required permissions for the GraphQL API access
& az ad app permission add `
    --id $nativeAppClient.appId `
    --api $webApiApp.appId `
    --api-permissions "$($webApiApp.oauth2Permissions.id)=Scope"

# Grant the required permissions for the GraphQL API Access
& az ad app permission grant `
    --api $webApiApp.appId `
    --id $nativeAppClient.appId
```

You'll need the following information to configure the example:

* The client ID. This is the value of `$nativeAppClient.appId`.
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

    * Name: `My React-Native App`
    * Application Type: `Accounts in this organizational directory only`
    * Redirect URI:
        * Type: `Public client (mobile & desktop)`
        * Value: `workflowgenexample://`

1. When you're done, click on the **Register** button.

You now have registered this example application. You now need to finish
configuring it in order to get the auhtentication working properly.

1. Go to the **My React SPA** registered application page in Azure AD.
1. Copy the Application ID in the **Overview** tab, which you'll need later.
This is the application's Client ID.
1. Go to the **Authentication** tab.
1. In the **Redirect URIs** section, add an entry to the list:

    * Type: `Public client (mobile & desktop)`
    * Redirect URI: `workflowgenexample://callback`

1. Click **Save**.
1. Go to the **API permissions** tab.
1. Click the **Add a permission** button.
1. In the screen that appeared, click on the **APIs my organization uses**.
1. Search for **WorkflowGen GraphQL API**.
1. Click on the correct WorkflowGen GraphQL API application.
1. Check the **user_impersonation** option.
1. Click the **Add permissions** button.

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
1. Make sure to have installed an iOS Simulatore and an Android Emulator.

    You can download and run an Android emulator by opening the Android
    Virtual Device (AVD) manager and add a new one using the on screen instructions.
    is included in Android Studio.

    For iOS, you need to open Xcode's settings and go to the **Components** tab.
    Inside, you will find the installed and available simulator versions.

1. Make sure that the user that you're using is a valid WorkflowGen user.

Optionally, you can install Visual Studio Code to run and debug JavaScript code
using the React Native Tools extension.
There are existing VSCode settings in the repository to make it easier to get
started.

### Configuration steps
1. Clone this application somewhere on your computer.

    ```powershell
    git clone https://github.com/advantys/workflowgen-templates.git
    Set-Location .\workflowgen-templates\integration\oidc\auth-code-pkce
    ```

1. Open the project folder `.\WorkflowGenExample` with VSCode.
1. Duplicate the `config.template.js` file and rename as
`.\WorkflowGenExample\config.js`.
1. In the `config` file, replace the placeholders inside the brackets
(`[]`) with the values that you got in the previous section:

    * `[your azure ad tenant id]`: Your Azure AD Directory ID
    * `[your application's client id (Application Id)]`: The Client ID
    * `[workflowgen url]`: The part of the App ID URI which represents WorkflowGen's
    domain and base path (e.g. `localhost:8888/wfgen`) in the example App ID URI
    above.
1. In the `.\WorkflowGenExample` directory, install dependencies with the
following command:

    ```powershell
    yarn install
    ```

**Android**

1. Run the Android emulator or your choice.
1. Using the commandline, execute `react-native run-android` from within the
`.\WorkflowGenExample` folder.
    1. Alternatively and for debugging, you can open the folder `.\WorkflowGenExample\android`
    with Android Studio and click on the run or debug button.

**iOS**

1. Using a commandline, execute `react-native run-ios` from within the
`.\WorkflowGenExample` folder.
    1. The default simulator is **iPhone X**. If you want a different one, you
    can pass the desired simulator name to the `--simulator` parameter like so:

        ```powershell
        react-native run-ios --simulator "iPhone XS Max"
        ```

    1. Alternatively and for debugging, you can open the `.\WorkflowGenExample\ios\WorkflowGenExample.xcodeproj`
    folder (`open ./WorkflowGenExample/ios/WorkflowGenExample.xcodeproj` or
    double click on it) with Xcode and click on the run button.

**Note**: If the simulator is not running, it will be opened for you.

**Note**: You don't need to be part of the Apple Developer Program to run this
example in a simulator.
