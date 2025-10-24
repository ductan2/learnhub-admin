/**
 * Utility functions for formatting and converting values
 */

/**
 * Converts a value to a string, returning undefined if invalid
 */
export const asString = (value: unknown): string | undefined => {
    if (typeof value !== "string") return undefined
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
}

/**
 * Converts a value to a number, returning undefined if invalid
 */
export const asNumber = (value: unknown): number | undefined => {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value
    }
    if (typeof value === "string") {
        const parsed = Number(value)
        return Number.isFinite(parsed) ? parsed : undefined
    }
    return undefined
}

/**
 * Converts a value to a boolean, returning undefined if invalid
 */
export const asBoolean = (value: unknown): boolean | undefined => {
    if (typeof value === "boolean") return value
    if (typeof value === "string") {
        if (value.toLowerCase() === "true") return true
        if (value.toLowerCase() === "false") return false
    }
    return undefined
}

/**
 * Formats a duration value (in seconds) to MM:SS format
 */
export const formatDuration = (value: unknown): string | undefined => {
    const duration = asNumber(value)
    if (duration === undefined) return undefined
    const totalSeconds = Math.max(0, Math.round(duration))
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = String(totalSeconds % 60).padStart(2, "0")
    return `${minutes}:${seconds}`
}
