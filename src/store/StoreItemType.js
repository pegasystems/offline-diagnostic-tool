import { mapSoftFlag, mapJsonToObject } from '../utils/MappingUtils'

const findByType = async (type) => {
    return await launchbox.PRPC.ClientStore.runQuery(`SELECT * from offline_storage where type='${type}'`, [], null)
}

const findByTypeAndMapForDisplaying = async (type) => {
    const results = await findByType(type)
    return results.map(mapSoftFlag);
}


export class StoreItemType {

    constructor(name, selector) {
        this.name = name
        this.selector = selector
    }

    createAPI() {
        return {
            find: async () => await findByType(this.selector),
            show: async () => {
                const results = await findByTypeAndMapForDisplaying(this.selector)
                for (const index in results) {
                    console.info("show %s -> \n%o:", results[index].handle, results[index])
                }
            },
            showAsTable: async () => {
                const results = await findByTypeAndMapForDisplaying(this.selector)
                console.table(results)
            },
            showAsExpandableObjects: async () => {
                const results = (await findByTypeAndMapForDisplaying(this.selector))
                    .map(mapJsonToObject)
                for (const index in results) {
                    console.info("showAsExpandableObjects %s -> \n%o:", results[index].handle, results[index])
                }
            },
            showAsPrettyJson: async (spacesCount = 2) => {
                const results = (await findByTypeAndMapForDisplaying(this.selector))
                    .map(mapJsonToObject)
                    .map(row => {
                        return {
                            handle: row.handle,
                            jsonString: JSON.stringify(row, null, spacesCount)
                        }
                    })
                for (const index in results) {
                    console.info("showAsPrettyJson %s -> \n%s:", results[index].handle, results[index].jsonString)
                }
            },
            exportEachAsJson: async (spacesCount = 0) => {
                const results = (await findByType(this.selector))
                    .map(row => {
                        return {
                            handle: row.handle,
                            jsonString: JSON.stringify(row, null, spacesCount)
                        }
                    })
                for (const index in results) {
                    console.info("exportEachAsJson %s -> \n%s:", results[index].handle, results[index].jsonString)
                }
            },
            exportAsJson: async (spacesCount = 0) => {
                const results = await findByType(this.selector)
                console.info(JSON.stringify(results, null, spacesCount))
            }
        }
    }
}