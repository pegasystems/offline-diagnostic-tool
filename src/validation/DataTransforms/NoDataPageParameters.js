import { Validation } from '../Validation'
import { offlineStore } from '../../store/OfflineStore'

export class NoDataPageParameters extends Validation {
    constructor() {
        super("Offline data transforms cannot pass parameters to data pages");
    }

    async run() {

        let dataTransforms = null
        try {
            dataTransforms = await offlineStore.data_transforms.find()
        } catch (errorMsg) {
            this.addError("Failed to run SQL query from local database", `${errorMsg}`)
        }

        const identifierWithSquareBracketsTest = /\w+\[.+\]/

        const findDataPageParameterInPyProperties = (handle, pyProperties) => {
            if (!pyProperties) {
                return
            }

            for (const index in pyProperties) {
                const step = pyProperties[index]
                if (identifierWithSquareBracketsTest.test(step.pyPropertiesName)) {
                    return {
                        expression: step.pyPropertiesName,
                        stepId: step.pyPropertyStepId
                    }
                }
                if (identifierWithSquareBracketsTest.test(step.pyPropertiesValue)) {
                    return {
                        expression: step.pyPropertiesValue,
                        stepId: step.pyPropertyStepId
                    }
                }
                return findDataPageParameterInPyProperties(handle, step.pyProperties)
            }
            return null
        }

        for (const index in dataTransforms) {
            const handle = dataTransforms[index].handle
            const referenceWithParameter = findDataPageParameterInPyProperties(handle, dataTransforms[index].content.pyProperties)
            if (referenceWithParameter) {
                this.addWarning("DataTransform do not support passing parameters to data pages in offline (e.g. using D_myDp[param] notation)",
                    `DataTransform "${handle}" tries to use square parameters to pass parameter to data paga in ${referenceWithParameter.stepId}
(expression: "${referenceWithParameter.expression}"). Passing parameters using square brackets notation is not supported in offline,
please see https://community.pega.com/knowledgebase/articles/using-data-pages-parameters-offline-enabled-application`
                )
            }
        }

    }
}
