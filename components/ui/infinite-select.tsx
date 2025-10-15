"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import Select, { components, Props as SelectProps, StylesConfig } from "react-select"
import { Loader2 } from "lucide-react"

export interface InfiniteSelectOption {
    value: string
    label: string
    id: string
}

export interface InfiniteSelectProps extends Omit<SelectProps<InfiniteSelectOption>, 'options' | 'onInputChange'> {
    loadOptions: (search: string, page: number) => Promise<{
        items: Array<{ id: string; name: string;[key: string]: any }>
        totalCount: number
        page: number
        pageSize: number
    }>
    searchKey?: string
    onInputChange?: (inputValue: string) => void
    placeholder?: string
    className?: string
    isMulti?: boolean
}

const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-2">
        <Loader2 className="h-4 w-4 animate-spin" />
    </div>
)

const customStyles: StylesConfig<InfiniteSelectOption> = {
    control: (provided, state) => ({
        ...provided,
        minHeight: '40px',
        borderColor: state.isFocused ? 'hsl(var(--ring))' : 'hsl(var(--border))',
        boxShadow: state.isFocused ? '0 0 0 1px hsl(var(--ring))' : 'none',
        '&:hover': {
            borderColor: 'hsl(var(--ring))',
        },
    }),
    menu: (provided) => ({
        ...provided,
        zIndex: 9999,
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
            ? 'hsl(var(--primary))'
            : state.isFocused
                ? 'hsl(var(--accent))'
                : 'transparent',
        color: state.isSelected
            ? 'hsl(var(--primary-foreground))'
            : 'hsl(var(--foreground))',
        '&:hover': {
            backgroundColor: state.isSelected
                ? 'hsl(var(--primary))'
                : 'hsl(var(--accent))',
        },
    }),
    multiValue: (provided) => ({
        ...provided,
        backgroundColor: 'hsl(var(--secondary))',
    }),
    multiValueLabel: (provided) => ({
        ...provided,
        color: 'hsl(var(--secondary-foreground))',
    }),
    multiValueRemove: (provided) => ({
        ...provided,
        color: 'hsl(var(--secondary-foreground))',
        '&:hover': {
            backgroundColor: 'hsl(var(--destructive))',
            color: 'hsl(var(--destructive-foreground))',
        },
    }),
}

export function InfiniteSelect({
    loadOptions,
    searchKey = "name",
    onInputChange,
    placeholder = "Select...",
    className = "",
    ...props
}: InfiniteSelectProps) {
    const [options, setOptions] = useState<InfiniteSelectOption[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [hasNextPage, setHasNextPage] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    const [totalCount, setTotalCount] = useState(0)

    const loadMoreOptions = useCallback(
        async (search: string = "", page: number = 1, append: boolean = false) => {
            if (isLoading) return

            setIsLoading(true)
            try {
                const response = await loadOptions(search, page)
                const newOptions: InfiniteSelectOption[] = response.items.map((item) => ({
                    value: item.id,
                    label: item[searchKey] || item.name || item.id,
                    id: item.id,
                }))

                if (append) {
                    setOptions((prev) => [...prev, ...newOptions])
                } else {
                    setOptions(newOptions)
                }

                setTotalCount(response.totalCount)
                setHasNextPage(options.length + newOptions.length < response.totalCount)
                setCurrentPage(page)
            } catch (error) {
                console.error("Failed to load options:", error)
            } finally {
                setIsLoading(false)
            }
        },
        [loadOptions, searchKey, isLoading, options.length]
    )

    const handleInputChange = useCallback(
        (inputValue: string) => {
            setSearchTerm(inputValue)
            setCurrentPage(1)
            setHasNextPage(true)
            loadMoreOptions(inputValue, 1, false)
            onInputChange?.(inputValue)
        },
        [loadMoreOptions, onInputChange]
    )

    const handleMenuScrollToBottom = useCallback(() => {
        if (!isLoading && hasNextPage) {
            loadMoreOptions(searchTerm, currentPage + 1, true)
        }
    }, [isLoading, hasNextPage, loadMoreOptions, searchTerm, currentPage])

    const MenuList = useCallback(
        (props: any) => (
            <components.MenuList {...props}>
                {props.children}
                {isLoading && <LoadingSpinner />}
                {!hasNextPage && options.length > 0 && (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                        {options.length} of {totalCount} items
                    </div>
                )}
            </components.MenuList>
        ),
        [isLoading, hasNextPage, options.length, totalCount]
    )

    useEffect(() => {
        loadMoreOptions("", 1, false)
    }, [])

    return (
        <Select<InfiniteSelectOption, false>
            {...props}
            options={options}
            onInputChange={handleInputChange}
            placeholder={placeholder}
            isLoading={isLoading}
            styles={customStyles}
            className={className}
            components={{
                MenuList,
            }}
            onMenuScrollToBottom={handleMenuScrollToBottom}
            filterOption={null} // Disable client-side filtering since we handle it server-side
            isSearchable
            isClearable
            isMulti={false}
        />
    )
}

export default InfiniteSelect
