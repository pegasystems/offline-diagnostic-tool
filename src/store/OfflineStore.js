import { StoreItemType } from './StoreItemType'
import { SqlTableItem } from './SqlTables'

export const offlineStore = (() => {

    var storageObject = {};

    const itemTypes = [
        new StoreItemType("all", "*"),
        new StoreItemType("app_resources", "APP-RESOURCE"),
        new StoreItemType("app_resource_entry_points", "APP-RESOURCE-ENTRY-POINT"),
        new StoreItemType("assignments", "ASSIGN-"),
        new StoreItemType("function", "function"),
        new StoreItemType("function_alias", "functionalias"),
        new StoreItemType("portal", "PORTALDATA"),
        new StoreItemType("case_types", "RULE-OBJ-CASETYPE"),
        new StoreItemType("flows", "RULE-OBJ-FLOW"),
        new StoreItemType("data_transforms", "RULE-OBJ-MODEL"),
        new StoreItemType("when_rules", "RULE-OBJ-WHEN"),
        new StoreItemType("system_settings", "SYSTEM-SETTING"),
        new StoreItemType("system_pages", "SYSTEMPAGE"),
        new StoreItemType("workitems", "WORKITEM"),
        new StoreItemType("workitem_templates", "WORKITEM-TEMPLATE"),
        new StoreItemType("datapages", "datapage"),
        new StoreItemType("flow_actions", "flowaction"),
        new StoreItemType("flow_action_rules", "flowactionrule"),
        new StoreItemType("harnesses", "harness"),
        new StoreItemType("locales", "locale"),
        new StoreItemType("report_definitions", "reportdefinition"),
        new StoreItemType("sections", "section"),
        new StoreItemType("validate_rules", "validate"),

    ]
    itemTypes.forEach(itemType => {
        storageObject[itemType.name] = itemType.createAPI();
    });
    storageObject.sqlTables = SqlTableItem.createAPI().then((sqlTablesAPI) => {
        storageObject.sqlTables = sqlTablesAPI
    })

    return storageObject
})();
