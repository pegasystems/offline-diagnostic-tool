import { Validation } from '../Validation'
import { mapJsonToObject } from '../../utils/MappingUtils'
import { offlineStore } from '../../store/OfflineStore'

export class OneWorklistAllowed extends Validation {
    constructor() {
        super("Offline application should have 1 Worklist");
    }

    async run() {

        let datapages = null
        try {
            datapages = await offlineStore.datapages.find()
        } catch (errorMsg) {
            this.addError("Failed to run SQL query from local database", `${errorMsg}`)
        }

        if (datapages.length == 0) {
            this.addWarning("No datapages (and no Worklist) found", "If the application contains offline-enabled cases, then it should contain offline worklist");
        }

        const assignClassTest = /ASSIGN-/i
        const pageListTest = /Code-Pega-List/i

        const isWorklist = (dataPageContent) => {
            return assignClassTest.test(dataPageContent.pyObjClass) &&
                pageListTest.test(dataPageContent.pxObjClass) &&
                dataPageContent.pyParameters === undefined
        }

        var worklists = datapages
            .map(row => mapJsonToObject(row))
            .filter(row => {
                if (row.content.pyObjClass !== undefined) {
                    return isWorklist(row.content)
                } else {
                    // the content of pyUserWorkList is often wrapped with object, and the actual content is the value of "D_pyUserWorkList" property
                    for (const propertyName in row.content) {
                        if (isWorklist(row.content[propertyName])) {
                            return true
                        }
                    }
                    return false
                }
            })

        if (worklists.length === 0) {
            this.addWarning("No offline worklist found", "Offline applications should have one worklist available for offline.");
        }

        if (worklists.length === 1) {
            this.setShortSuccessMessage(`found "${worklists[0].handle}"`)
        }

        if (worklists.length > 1) {
            let list = worklists.map(row => row['siip'].pyKey).join(", ")
            this.addError("Application contains too many worklists",
                `Offline applications can only have 1 worklist. There are ${list.length} worklists in this application: ${list}.\n\n`
                + `Having more than 1 worklist causes packaging issues and makes it impossible to open some assignments. Please see https://community.pega.com/support/support-articles/no-offline-support-multiple-worklists`);
        }
    }
}
