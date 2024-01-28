import { gql } from "__generated__";

export const SEARCH_RECIPES = gql(`
    query getSearchLibrary(
        $query: String! = ""
        $scope: LibrarySearchScope! = MINE
        $first: NonNegativeInt! = 9
        $after: Cursor = null
    ) {
        library {
            recipes(first: $first, query: $query, scope: $scope, after: $after) {
                edges {
                    cursor
                    node {
                        id
                        owner {
                            id
                            imageUrl
                            name
                            email
                            provider
                        }
                        photo {
                            url
                            focus
                        }
                        name
                        favorite
                        labels
                        externalUrl
                        calories
                        yield
                        totalTime
                    }
                }
                pageInfo {
                    hasNextPage
                    endCursor
                }
            }
        }
    }
`);
