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

Those examples require that you have the RESTAPICLIENT application installed in your WorkflowGen environment (available as of version 7.15.0).

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

