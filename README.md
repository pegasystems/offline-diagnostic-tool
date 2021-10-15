# Usage

`pega-offline-diagnostic-tool.js` needs to be pasted into JavaScipt console as is then available as `PegaOfflineDiagnosticTool` 
 
Preparation:
1. Open [Chrome inspector](chrome://inspect/#devices). If you don't see WebViews related to you app, :
    * make sure that `adb` daemon/service is running (type `adb devices` in system console)
    * make sure your offline app has `Enable debugging` option checked in Mobile Channel
1. Click `inspect` under `pzPMCHiddenPortalTemplate` to open DevTools window.
1. Copy the content of `offline-diagnostic-tool/dist/pega-offline-diagnostic-tool.js` script
1. Paste the script cotent info JavaScript console in DevTools window.
1. **Clear JS console** (otherwise console.log messages may not appear or appear in unexpected place)

The diagnostic tool is now ready to use.

## Validating application.

You can run several validations that will scan your offline application for common known issues. 

Run the follwing command in JS console:

`PegaOfflineDiagnosticTool.validateApp()`

## Checking offline rules in offline application storage

The generic command to display rules in offline app is:  

`PegaOfflineDiagnosticTool.storage.[rule type].[show function]()`

There are following rule types available:


| `[rule type]` | Comment | 
| :--: | --- | 
| `all` | All rule types  | 
| `app_resources` | scripts, css files, images, fonts|
| `app_resource_entry_points` | |
| `assignments` | |
| `case_types` | |
| `data_transforms` | |
| `datapages` | |
| `flows` | |
| `flow_actions` | |
| `flow_action_rules` | |
| `function` | |
| `function_alias` | |
| `harnesses` | |
| `locales` | |
| `portal` | |
| `report_definitions` | |
| `sections` | |
| `system_settings` | |
| `system_pages` | |
| `validate_rules` | |
| `when_rules` | |
| `workitems` | |
| `workitem_templates` | |

There are following show functions available:

| `[show function]` | Comment | 
| :--: | --- | 
| `find` | Returns a Promise where response contains rules with no modification |
| `show` | Shows the rules. Integer `softflag` is followed by enum name. | 
| `showAsTable` | Shows the rules rendered as a table in JS console. Integer `softflag` is followed by enum name. Long strings may be truncated | 
| `showAsExpandableObjects` | Shows a list of rules rendered as JS objects. It is possible to expand properies to see nested properties. Integer `softflag` is followed by enum name. Long strings containing JSON are parsed so that they can be be expanded too if necessary. | 
| `showAsPrettyJson` | Shows a list of rules rendered as human readable JSON string. Each property is displayed in a separate line and is prefixed with specific number of spaces to make nesting clearly visible. Integer `softflag` is followed by enum name. Long strings containing JSON are parsed and appended to parent object before formatting is applied. Number of spaces, used to make a single indent, can be passed as parameter. |
| `exportEachAsJson` | Shows each rule as single JSON string, so that it can be used in mocks/tests. Number of spaces, used to make a single indent, can be passed as parameter.  |
| `exportAsJson` | Shows the array of rules as single JSON string, so that it can be used in mocks/tests. Number of spaces, used to make a single indent, can be passed as parameter.  |

## Checking SQL tables in offline application local database

The names of SQL tables in offline application can be displayed with the following command:

`PegaOfflineDiagnosticTool.storage.sqlTables.showTableNames()`


The generic command to display content of any SQL table in offline app is:  

`PegaOfflineDiagnosticTool.storage.sqlTables.[table name].[show function]()`

There are following show functions available:

| `[show function]` | Comment | 
| :--: | --- | 
| `showAsTable` | Shows SQL table content rendered as a table in JS console. |
| `showAsExpandableObjects` | Shows SQL table content rendered as a list of JS objects. It is possible to expand rows to see nested properties. Long strings containing JSON are parsed so that they can be be expanded too if necessary. | 
| `showAsPrettyJson` | Shows rows of SQL table content rendered as human readable JSON string. Each property is displayed in a separate line and is prefixed with specific number of spaces to make nesting clearly visible. Integer `softflag` is followed by enum name. Long strings containing JSON are parsed and appended to parent object before formatting is applied. Number of spaces, used to make a single indent, can be passed as parameter. |
| `exportAsJson` | Shows rows of SQL table content as single JSON string, so that it can be used in mocks/tests. Number of spaces, used to make a single indent, can be passed as parameter.  |


## Issues

| Issue | Comment | 
| :-- | --- | 
| Nothing is displayed when I run a command like `PegaOfflineDiagnosticTool.storage.[rule type].[show function]()` | Try clearing JavaScript console logs (with a button in Chrome inspector) and run the command again. Sometimes, when there are too many logs, the JS console displays the logs somewhere in the middle of previous logs or and no more new logs | 

# Development

## Get NodeJS

Download NodeJS from https://nodejs.org/en/download/ (e.g. node-v14.16.1).
Run the installer and install NodeJS.
Run ```node -v``` in console to verify if NodeJS was correctly installed and if you are using the version that you downloaded.

## Install dependencies

```npm install```

Webpack is used to package several .js files into a single large file.
Webpack-cli is required to call webpack from command line.

## Rebuild script

```npx webpack```

## Linting

```eslint```

# Useful links

* Hack for missing 'dns' package when using Promises

https://stackoverflow.com/questions/51541561/module-not-found-cant-resolve-dns-in-pg-lib/51781959

* JS Bundlers (webpack alternatives):

https://dev.to/talentlessguy/2020-javascript-bundlers-review-3ce

* Webpack devtool settings for dev and production

https://webpack.js.org/configuration/devtool/

# Potential issues in analysing Data Pages

The set of DataPage properties varies a lot, so we need to be careful.
Some properties available in one DataPage may be not available in another DataPage, e.g.:

Content (DataPage A):
```
pxObjClass: "Rule-Declare-Pages"
pyClassName: "Link-Attachment"
pyDataSourceList: [{…}]
pyParameters: [{…}]
pyScope: "thread"
pyStructure: "list"
pyType: "normal"
```

Content (DataPage B):
```
pxObjClass: "Code-Pega-List"
pxResultCount: "19"
pxResults: (19) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
pyObjClass: "Assign-Worklist"
pzPageNameBase: "D_pyUserWorkList"
pzPageToDisplay: "D_pyUserWorkList"
```

SSIP (DataPage A):
```
pxObjClass: "Embed-SIIP"
pxUpdateDateTime: "20180713T134707.778 GMT"
pyActualClass: "D_PZOFFLINECASEATTACHMENTS"
pyCategory: "datapage"
pyIsParamDP: "true"
pyKey: "D_pzOfflineCaseAttachments"
pzHash: "1352259856908057690"
pzInsKey: "RULE-DECLARE-PAGES D_PZOFFLINECASEATTACHMENTS #20180713T134707.778 GMT"
```

SSIP (DataPage B):
```
pxObjClass: "Embed-SIIP"
pxUpdateDateTime: "20180713T134707.606 GMT"
pyActualClass: "D_PYUSERWORKLIST"
pyCategory: "datapage"
pyKey: "D_pyUserWorkList"
pzHash: "6635871054021419605"
pzInsKey: "RULE-DECLARE-PAGES D_PYUSERWORKLIST #20180713T134707.606 GMT"
```
