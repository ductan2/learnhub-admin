import { useCallback, useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

type QueryUpdate = {
  search?: string
  page?: number
}

const sanitizePage = (page: number) => {
  const parsed = Math.floor(page)
  if (Number.isNaN(parsed) || parsed < 1) {
    return 1
  }

  return parsed
}

export function useSearchPagination() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const searchParamsString = searchParams.toString()

  const [searchQuery, setSearchQueryState] = useState(() => searchParams.get("search") ?? "")
  const [currentPage, setCurrentPageState] = useState(() => {
    const pageParam = Number.parseInt(searchParams.get("page") ?? "1", 10)
    return sanitizePage(pageParam)
  })

  useEffect(() => {
    const params = new URLSearchParams(searchParamsString)
    const nextSearch = params.get("search") ?? ""
    const nextPageParam = Number.parseInt(params.get("page") ?? "1", 10)
    const nextPage = sanitizePage(nextPageParam)

    setSearchQueryState((previous) => (previous === nextSearch ? previous : nextSearch))
    setCurrentPageState((previous) => (previous === nextPage ? previous : nextPage))
  }, [searchParamsString])

  const updateQueryParams = useCallback(
    ({ search, page }: QueryUpdate) => {
      const params = new URLSearchParams(searchParamsString)

      if (search !== undefined) {
        const trimmed = search.trim()
        if (trimmed.length > 0) {
          params.set("search", trimmed)
        } else {
          params.delete("search")
        }
      }

      if (page !== undefined) {
        const safePage = sanitizePage(page)
        params.set("page", safePage.toString())
      }

      const query = params.toString()
      const url = query ? `${pathname}?${query}` : pathname

      router.replace(url, { scroll: false })
    },
    [pathname, router, searchParamsString],
  )

  const updateSearchQuery = useCallback(
    (value: string) => {
      setSearchQueryState(value)
      setCurrentPageState(1)
      updateQueryParams({ search: value, page: 1 })
    },
    [updateQueryParams],
  )

  const updatePage = useCallback(
    (page: number) => {
      const safePage = sanitizePage(page)
      setCurrentPageState(safePage)
      updateQueryParams({ page: safePage })
    },
    [updateQueryParams],
  )

  return {
    searchQuery,
    currentPage,
    updateSearchQuery,
    updatePage,
  }
}
