import { Validation } from '../Validation'

export class WhenRulesForVisibilityAndDisabilityDoNotWorkInNestedDynamicLayout extends Validation {
    constructor() {
        super("When rules for visibility and disability should not be inside a nested DynamicLayout");
    }

    analyseWhensNestedInSectionStoreItem(type, handle, path, key, value, canHaveWhens) {
        let name = value.pyName
        let newPath = path.concat([{ key: key, name: name }])

        if (name == 'DynamicLayout') {
            let hasDynamicLayoutInPath = path.filter(item => item.name == 'DynamicLayout')
            hasDynamicLayoutInPath = hasDynamicLayoutInPath.length > 0
            if (hasDynamicLayoutInPath) {
                canHaveWhens = false
            }
        }

        if (!canHaveWhens && value.pxWhenIdentifiers) {
            if (value.pxWhenIdentifiers.pyVisibilityWhenName &&
                value.pxWhenIdentifiers.pyVisibilityWhenClass) {
                let hierarchy = newPath.map(item => `- id: ${item.key}, pyName: ${item.name}`).join('\n')

                this.addWarning(`When rules for visibility and disability should not be inside a nested DynamicLayout`,
                    `${type} ${handle} references ${value.pxWhenIdentifiers.pyVisibilityWhenClass} ${value.pxWhenIdentifiers.pyVisibilityWhenName} When rule which will not work inside nested DynamicLayout.
Hierarchy:
${hierarchy}`)
            }
        }

        if (!value.pyTemplates) {
            return
        }

        for (const [nkey, nvalue] of Object.entries(value.pyTemplates)) {
            this.analyseWhensNestedInSectionStoreItem(type, handle, newPath, nkey, nvalue, canHaveWhens)
        }

    }

    analyseWhensNestedInSectionStore(type, handle, store) {
        let path = []
        for (const [key, value] of Object.entries(store)) {
            this.analyseWhensNestedInSectionStoreItem(type, handle, path, key, value, true)
        }
    }

    async analyseWhensNested() {
        let storage = await this.runQuery("SELECT type, handle, content from offline_storage WHERE type='harness' OR type == 'section'", [], null)
        storage.map(row => {
            let type = row["offline_storage.type"]
            let handle = row["offline_storage.handle"]
            let sectionStores = this.extractSectionStores(row["offline_storage.content"]);
            sectionStores.forEach(store => {
                this.analyseWhensNestedInSectionStore(type, handle, store)
            })
        })
    }

    async run() {
        await this.analyseWhensNested()
    }
}
