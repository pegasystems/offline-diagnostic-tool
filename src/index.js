import { runAllValidations } from './validation/Validations'
import { offlineStore } from './store/OfflineStore'

export const storage = offlineStore

export function validateApp() {
    runAllValidations()
}