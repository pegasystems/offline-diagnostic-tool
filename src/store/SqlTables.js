import { mapJsonToObject } from '../utils/MappingUtils'

const findTables = async () => {
    return await launchbox.PRPC.ClientStore.runQuery(`SELECT name from sqlite_master where type='table'`, [], null)
}

const findTable = async (tableName) => {
    return await launchbox.PRPC.ClientStore.runQuery(`SELECT * from ${tableName}`, [], null)
}

export class SqlTableItem {

    constructor(name) {
        this.name = name
    }

    static async createAPI() {
        const tableNames = (await findTables()).map(row => row['sqlite_master.name']);
        tableNames.push('sqlite_master')
        const tablesAPI = {};
        for (const [, tableName] of Object.entries(tableNames)) {
            const tableItem = new SqlTableItem(tableName)
            tablesAPI[tableName] = tableItem.createAPI()
        }

        tablesAPI.showTableNames = () => {
            console.table(tableNames)
        }
        
        return tablesAPI
    }

    createAPI() {
        return {
            showAsTable: async () => {
                const results = await findTable(this.name)
                console.table(results)
            },
            showAsExpandableObjects: async () => {
                const results = (await findTable(this.name))
                    .map(mapJsonToObject)
                console.info("showAsExpandableObjects %s -> \n%o:", this.name, results)
            },
            showAsPrettyJson: async (spacesCount = 2) => {
                const results = (await findTable(this.name))
                    .map(mapJsonToObject)
                    .map(row =>
                        JSON.stringify(row, null, spacesCount)
                    )
                console.info("showAsPrettyJson %s ->", this.name)
                for (const index in results) {
                    console.info("%s:", results[index])
                }

            },
            exportAsJson: async (spacesCount = 0) => {
                const results = await findTable(this.name)
                console.info(JSON.stringify(results, null, spacesCount))
            }
        }
    }
}