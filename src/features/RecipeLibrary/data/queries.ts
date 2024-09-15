import { gql } from "@/__generated__";

export const SEARCH_RECIPES = gql(`
    query getSearchLibrary(
        $query: String! = ""
        $scope: LibrarySearchScope! = MINE
        $first: NonNegativeInt! = 9
        $after: Cursor = null
    ) {
        library {
            recipes(first: $first, query: $query, scope: $scope, after: $after) {
                ...librarySearchResult
            }
        }
    }
`);

export const SUGGEST_RECIPES = gql(`
query recipeSuggestions(
    $first: NonNegativeInt! = 9
    $after: Cursor = null) {
  library {
    recipes: suggestRecipesToCook(first: $first, after: $after) {
      ...librarySearchResult
    }
  }
}`);
