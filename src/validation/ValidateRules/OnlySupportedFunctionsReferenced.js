import { Validation } from '../Validation'
import { offlineStore } from '../../store/OfflineStore'
import { mapJsonToObject } from '../../utils/MappingUtils'

export class OnlySupportedFunctionsReferenced extends Validation {
    constructor() {
        super("Validate rules should reference only supported functions");
    }

    async run() {
        const validates = await this.getValidateRules()
        const functionAliases = await this.getFunctionsAliassesFromValidates(validates)
        const functions = await this.getFunctions(functionAliases)
        this.validateFunctions(functions)
    }

    async getValidateRules() {
        try {
            return await offlineStore.validate_rules.find()
        } catch (errorMsg) {
            this.addError("Failed to run SQL query from local database", `${errorMsg}`)
        }
    }

    async getFunctionsAliassesFromValidates(validates) {
        let functionAliassesMetadata = []

        validates.forEach(validate => {
            mapJsonToObject(validate).content.pyValidationValues.forEach(validationValue => {
                validationValue.pyValidations.forEach(validation => {
                    validation.pyValidWhen.pyCondition.forEach(condition => {
                        let baseClass = condition.pyFunctionData.pyBaseClass
                        let name = condition.pyFunctionData.pyName

                        if (!baseClass && !name) {
                            return
                        }

                        functionAliassesMetadata.push({
                            validateHandle: validate.handle,
                            baseClass: baseClass,
                            name: name
                        })
                    })
                })
            })
        })

        return await Promise.all(functionAliassesMetadata.map(async (aliasMetadata) => await this.getFunctionAlias(aliasMetadata)))
    }

    async getFunctionAlias(aliasMetadata) {
        let functionAliasHandle = (aliasMetadata.baseClass + "!" + aliasMetadata.name).toUpperCase()

        let functionAliasResults
        try {
            functionAliasResults = await launchbox.PRPC.ClientStore.runQuery(`SELECT handle, content FROM offline_storage WHERE handle = '${functionAliasHandle}' AND type = 'functionalias'`, [], null);
        } catch (error) {
            this.addError(`Failed to get function alias "${functionAliasHandle}" from local database`, error)
        }

        if (!functionAliasResults.length) {
            this.addError(
                `Failed to get function alias from local database`,
                `Validate rule ${aliasMetadata.validateHandle} is missing a function alias ${functionAliasHandle}. Please see https://community.pega.com/knowledgebase/articles/mobile/84/function-rules-offline-mode to check which functions are supported in offline.`
            )
            return
        }

        let content = JSON.parse(functionAliasResults[0]['offline_storage.content'])
        return {
            validateHandle: aliasMetadata.validateHandle,
            libraryName: content.pyLibraryName,
            functionName: content.pyFunctionName
        }
    }

    async getFunctions(functionsAliases) {
        return await Promise.all(functionsAliases.filter(alias => alias !== undefined).map(async (alias) => await this.getFunction(alias)))
    }

    async getFunction(alias) {
        let functionHandle = (alias.libraryName + "!" + alias.functionName).toUpperCase()

        let functionResults
        try {
            functionResults = await launchbox.PRPC.ClientStore.runQuery(`SELECT handle, content FROM offline_storage WHERE handle = '${functionHandle}' AND type = 'function'`, [], null)
        } catch (error) {
            this.addError(`Failed to get function "${functionHandle}" from local database`, error)
        }


        if (!functionResults.length) {
            this.addError(
                "Failed to get function from local database",
                `Validate rule ${alias.validateHandle} is missing a function ${functionHandle}. Please see https://community.pega.com/knowledgebase/articles/mobile/84/function-rules-offline-mode to check which functions are supported in offline.`
            )
            return
        }

        let content = JSON.parse(functionResults[0]['offline_storage.content'])
        return {
            validateHandle: alias.validateHandle,
            libraryName: content.pyLibraryName + "Library",
            functionName: content.pyFunctionName
        }
    }

    validateFunctions(functions) {
        functions.filter(func => func !== undefined).forEach(func => {
            if (window.pega.functions[func.libraryName] === undefined
                || window.pega.functions[func.libraryName][func.functionName] === undefined) {
                this.addError(
                    "Validate rule has a reference to an unsupported function",
                    `Validate rule ${func.validateHandle} has a reference to function ${func.functionName} from ${func.libraryName}, which is not supported. Please see https://community.pega.com/knowledgebase/articles/mobile/84/function-rules-offline-mode to check which functions are supported in offline.`
                )
            }
        })
    }
}