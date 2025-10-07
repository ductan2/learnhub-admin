import { ApolloClient, ApolloLink, InMemoryCache, HttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { ErrorLink } from '@apollo/client/link/error'
// @ts-ignore - apollo-upload-client types issue
import UploadHttpLink from 'apollo-upload-client/UploadHttpLink.mjs'

// Create upload link for file uploads
const uploadLink = new UploadHttpLink({
    uri:
        process.env.NEXT_PUBLIC_GRAPHQL_URL ||
        'http://localhost:8010/api/v1/content/graphql',
})

// Create HTTP link for regular queries
const httpLink = new HttpLink({
    uri:
        process.env.NEXT_PUBLIC_GRAPHQL_URL ||
        'http://localhost:8010/api/v1/content/graphql',
})

// Auth link to add authorization header
const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('accessToken')
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : '',
        },
    }
})

// Error link to handle auth errors
const errorLink = new ErrorLink(({ graphQLErrors, networkError }: any) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }: any) => {
            console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
        })
    }

    if (networkError) {
        console.log(`[Network error]: ${networkError}`)

        // Handle 401 errors by redirecting to login
        if ('statusCode' in networkError && networkError.statusCode === 401) {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('tokenExpiresAt')
            localStorage.removeItem('user')

            if (typeof window !== 'undefined') {
                window.location.href = '/login?session=expired'
            }
        }
    }
})

// Create Apollo Client with upload support
export const apolloClient = new ApolloClient({
    link: ApolloLink.from([errorLink, authLink, uploadLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
        watchQuery: {
            errorPolicy: 'all',
        },
        query: {
            errorPolicy: 'all',
        },
    },
})

export default apolloClient
