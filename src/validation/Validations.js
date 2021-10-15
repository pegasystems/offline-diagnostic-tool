import { OneWorklistAllowed } from './Worklist/OneWorklistAllowed'
import { NoDataPageParameters } from './DataTransforms/NoDataPageParameters'
import { OnlySupportedFunctionsReferenced } from './ValidateRules/OnlySupportedFunctionsReferenced'
import { WhenRulesForVisibilityAndDisabilityDoNotWorkInNestedDynamicLayout } from './WhenRules/WhenRules'

const validations = [
    new OneWorklistAllowed(),
    new NoDataPageParameters(),
    new OnlySupportedFunctionsReferenced(),
    new WhenRulesForVisibilityAndDisabilityDoNotWorkInNestedDynamicLayout(),
]

function logAndGroupIfNecessary(logFunction, messageCategory, shortValidationDescription, validationMessages){
    const minGroupThreshold = 2
    const minCollapsedGroupThreshold = 10
    
    if(validationMessages.length >= minGroupThreshold){
        const groupFunction = validationMessages.length >= minCollapsedGroupThreshold ? console.groupCollapsed : console.group
        groupFunction(`${shortValidationDescription} - ${validationMessages.length} ${messageCategory.toLowerCase()}s`)
    }

    validationMessages.forEach(msg =>
        logFunction(`${shortValidationDescription} - ${messageCategory}: ${msg.shortSummary} \n\n ${msg.violationDescription}`)
    )
    
    if(validationMessages.length >= minGroupThreshold){
        console.groupEnd()
    }

}

function printValidationStatus(validation) {
    if (validation.errors.length == 0 && validation.warnings.length == 0 && validation.info.length == 0) {
        const additionalSuccessMessage = validation.shortSuccessMessage ? ` - ${validation.shortSuccessMessage}` : ""
        console.log(`${validation.shortDescription}${additionalSuccessMessage} - OK`)
        return
    }

    logAndGroupIfNecessary(console.error, "ERROR", validation.shortDescription, validation.errors)

    logAndGroupIfNecessary(console.warn, "WARNING", validation.shortDescription, validation.warnings)
    
    logAndGroupIfNecessary(console.info, "INFO", validation.shortDescription, validation.info)
}

export async function runAllValidations() {
    const style = "background-color:yellow;font-weight:bold;font-family:monospace;"
    const timerId = "DiagnosticTool"
    console.time(timerId)
    console.log("%c Offline diagnostic tool - Running validations ...", style)

    const asyncTasks = validations.map(validation => validation.execute())

    await Promise.all(asyncTasks)
    console.log("All async validations finished")
    validations.forEach(validation => printValidationStatus(validation))
    console.log("%c Offline diagnostic tool - Validations finished", style)
    console.timeEnd(timerId);
}
