import { ref, computed } from 'vue'

export interface ModalConfig {
    thumbnail: string
    title: string
    description: string
    buttonText?: string
    buttonAction?: () => void | Promise<void>
    cookieName?: string
    isAutoShow?: boolean
}

/**
 * Composable for managing modal state and cookie operations
 * @param config - Modal configuration object
 * @returns Modal state and control methods
 */
export const useModal = (config: ModalConfig) => {
    const isOpen = ref(false)

    /**
     * Check if modal has been viewed (cookie exists)
     */
    const hasBeenViewed = computed(() => {
        if (process.server) return false
        const cookieName = config.cookieName || 'modal_viewed'
        return document.cookie.split('; ').some((cookie) =>
            cookie.startsWith(`${cookieName}=`)
        )
    })

    /**
     * Open modal
     */
    const openModal = () => {
        isOpen.value = true
    }

    /**
     * Close modal
     */
    const closeModal = () => {
        isOpen.value = false
    }

    /**
     * Toggle modal visibility
     */
    const toggleModal = () => {
        isOpen.value = !isOpen.value
    }

    /**
     * Clear the viewed cookie
     */
    const clearViewedCookie = () => {
        const cookieName = config.cookieName || 'modal_viewed'
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
    }

    /**
     * Get all cookies as an object
     */
    const getCookies = () => {
        if (process.server) return {}
        return document.cookie.split('; ').reduce(
            (acc, cookie) => {
                const [key, value] = cookie.split('=')
                acc[key] = value
                return acc
            },
            {} as Record<string, string>
        )
    }

    if (!hasBeenViewed.value && config.isAutoShow) {
        openModal()
    }

    return {
        isOpen,
        hasBeenViewed,
        openModal,
        closeModal,
        toggleModal,
        clearViewedCookie,
        getCookies,
        config
    }
}
