"use client"

import React from "react"
import InfiniteSelect, { InfiniteSelectOption } from "./infinite-select"

export interface TagSelectProps {
    value?: string | string[]
    onChange: (value: string | string[] | null) => void
    placeholder?: string
    isMulti?: boolean
    className?: string
    disabled?: boolean
}

export function TagSelect({
    value,
    onChange,
    placeholder = "Select tags...",
    isMulti = false,
    className = "",
    disabled = false,
}: TagSelectProps) {
    const loadTags = async (search: string, page: number) => {
        try {
            // Use the existing API to load tags
            const { api } = await import("@/lib/api/exports")
            const tags = await api.tags.getAll(search)

            // Simulate pagination by slicing the results
            const startIndex = (page - 1) * 20
            const endIndex = startIndex + 20
            const paginatedTags = tags.slice(startIndex, endIndex)

            return {
                items: paginatedTags,
                totalCount: tags.length,
                page,
                pageSize: 20
            }
        } catch (error) {
            console.error("Failed to load tags:", error)
            return { items: [], totalCount: 0, page: 1, pageSize: 20 }
        }
    }

    const handleChange = (selectedOption: any) => {
        if (isMulti) {
            const values = Array.isArray(selectedOption)
                ? selectedOption.map((option: any) => option.value)
                : []
            onChange(values.length > 0 ? values : null)
        } else {
            const singleValue = selectedOption as InfiniteSelectOption | null
            onChange(singleValue?.value || null)
        }
    }

    const selectedValue = React.useMemo(() => {
        if (isMulti && Array.isArray(value)) {
            // For multi-select, we need to reconstruct the selected options
            // This is a simplified approach - in a real app you might want to cache the full objects
            return value.map(v => ({ value: v, label: v, id: v }))
        } else if (!isMulti && value) {
            return { value: value as string, label: value as string, id: value as string }
        }
        return null
    }, [value, isMulti])

    return (
        <InfiniteSelect
            value={selectedValue}
            onChange={handleChange}
            loadOptions={loadTags}
            searchKey="name"
            placeholder={placeholder}
            isMulti={isMulti}
            className={className}
            isDisabled={disabled}
        />
    )
}

export default TagSelect
