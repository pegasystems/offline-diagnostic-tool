import { ValidationMessage } from './ValidationMessage';

let SCRIPT_MERGESECTIONSTORE_PREFIX = "pega.ui.jittemplate.mergeSectionStore("

export class Validation {

    /**
     * 
     * @param {String} shortDescription - short information about expeceted configuration, e.g. "Parameterized DataPage should have a JavaScript populator function"
     */
    constructor(shortDescription) {
        this.shortDescription = shortDescription
        this.reset()
    }

    reset(){
        this.shortSuccessMessage = null
        this.errors = []
        this.warnings = []
        this.info = []
    }

    setShortSuccessMessage(shortText){
        this.shortSuccessMessage = shortText
    }

    addError(shortSummary, issueDescription) {
        this.errors.push(new ValidationMessage(shortSummary, issueDescription))
    }

    addWarning(shortSummary, issueDescription) {
        this.warnings.push(new ValidationMessage(shortSummary, issueDescription))
    }

    extractScripts(content) {
        let ret = []
        let regex = /<SCRIPT(?:\s|.)*?>((?:\s|.)*?)<\/SCRIPT>/igm
        let script

        while ((script = regex.exec(content)) !== null) {
            ret.push(script[1])
        }
        return ret
    }

    extractSectionStores(content) {
        return this.extractScripts(content)
            .filter(script => script.indexOf(SCRIPT_MERGESECTIONSTORE_PREFIX) == 0)
            .map(script => {
                // Whole script is
                // pega.ui.jittemplate.mergeSectionStore(very big json);
                //                                       /\/\/\/\/\/\/
                // This json contains whole section store, we want to analyse it.
                script = script.substring(SCRIPT_MERGESECTIONSTORE_PREFIX.length, script.length - 2)
                try {
                    return JSON.parse(script)
                } catch (e) {
                    return {}
                }
            })
    }

    runQuery(query, args, table) {
        return new Promise((resolve, reject) => {
            launchbox.PRPC.ClientStore.runQuery(query, args, table,
                ret => resolve(ret),
                err => reject(err))
        })
    }

    async execute() {
        try {
            this.reset()
            return await this.run()
        } catch (error) {
            this.addError("Execution Failure", error)
        }
    }
}
