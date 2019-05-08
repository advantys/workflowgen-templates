## RESTAPICLIENT Workflow Application

### Table of Contents

- [Introduction](#introduction)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Test execution](#test-execution)
- [Troubleshooting](#troubleshooting)

<a id="introduction"></a>
### Introduction

The [WorkflowGen](https://www.workflowgen.com/) RESTAPICLIENT workflow application lets users send outgoing webhooks (HTTP requests) to external systems. This example will show you how the application performs when sending all supported data types, as well as how to use nested-level parameters to send and receive information from external sources.


For more information on RestApiClient, see the [RESTAPICLIENT workflow application](https://docs.advantys.com/workflowgen-administration-module-reference-guide/restapiclient-workflow-application) section in the **WorkflowGen Administration Module Reference Guide**.

<a id="requirements"></a>
### Requirements

These examples require that you have the RESTAPICLIENT application installed in your WorkflowGen environment (available as of version 7.15.0).

<a id="installation"></a>
### Installation

1. Download the template process in the [samples](samples) folder.

<a id="configuration"></a>
### Configuration

1. In the WorkflowGen Administration Module home page, click the **New process** button and import the CREATE_AZURE_SQL_DATABASE.xml file (contained in the selected example folder).

2. Add the following parameters to `<appSettings>` in your `\wfgen\web.config` if they are not already there:

    `<add key="MyAzureAppClientId" value="<azure_client_id>" />`
    `<add key="MyAzureAppClientSecret" value="<azure_client_secret>" />`
    `<add key="MyAzureTenantId" value="<azure_tenant_id>" />`
    `<add key="MyAzureSubscriptionId" value="<azure_subscription_id>" />`
    `<add key="EngineMacroAppSettings" value="MyAzureApp*, MyAzureTenantId, MyAzureSubscriptionId" />`

These configurations will generate the macros `<WF_APP_SETTING_MyAzureAppClientId>`, `<WF_APP_SETTING_MyAzureAppClientSecret>`, `<WF_APP_SETTING_MyAzureTenantId>` and `<WF_APP_SETTING_MyAzureSubscriptionId>`.

Alternately, you can replace the activity parameters values having these macros by a process data or a text value.

<a id="test-execution"></a>
### Test execution

1. Click the process's link on the home page.

2. Click **Test** to start the process test.

3. Fill in the form. **URL** should contain the running or published API base URL address (hostname:port number). You can get the URL from your browser.


 Build the URL using **[API base URL]/api/webhook/Post** if you want to send your payload using the application/json content type, or **[API base URL]/api/webhook/PostWithPayload** if you want to use the application/x-www-form-urlencoded content type.
 
 For example, if you want to test the DataTypes API, your URL field would be as follows: 

  - Content type: application/json: `http://localhost:65062/api/webhook/Post`

  - Content type: application/x-www-form-urlencoded: `http://localhost:65062/api/webhook/PostWithPayload`

 **Token:** Both sample APIs require tokens for authentication. You can get the token value from the web.config file contained in each solution.

 ```
 <configuration>
 	<appSettings>
 		<add key="token" value="VmmUi6GD8C/Ss2o5VEdQ/XCilZGyKowGHWQSMOMJgroK" />
 	</appSettings>
 </configuration>
 ```

 **Content type:** If you don't choose a value from the drop-down list, JSON will be the default value.

 **Objects example:** For the Objects example, fill in the `Person.Name`, `Person.Age`, `Person.Address.Street`, and `Person.Address.ZIPCode` text boxes with the corresponding name, age, street, and zip code values.

 **DataType example:** For the DataType example, the fields should contain the correct data type format (numeric for `Number`, datetime for `Date`, and text for `Name`).

4. Click the **Submit** button. You will get a results page like the following:

 ![Results page](assets/result_page.png)

 In the case of the Objects example, you can also receive a nested JSON containing object properties (e.g. `Person.Name`, `Person.Address.City`). The DataTypes example can receive OUT parameters from all supported data types (Text, Numeric, and DateTime).

<a name="troubleshooting"></a>
### Troubleshooting

If the test results page shows 401 as a Response status value, this means that the token provided is wrong, or you didn't provide a token value in the form. Check your token value (contained in the API web.config file) and enter it in the Token text box in the form.

If the action is cancelled, verify that the URL value and the content type value correspond to the same content type, for example:

- **JSON:** `http://localhost:65062/api/webhook/Post` with JSON or an empty value in the content type drop-down list

- **URLENCODED:** `http://localhost:65062/api/webhook/PostWithPayload` with URLENCODED as the value in the content type drop-down list 




