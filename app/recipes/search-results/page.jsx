// app/recipes/search-results/page.jsx
import SearchResultsClient from '@/components/SearchResultsClient';

export default async function SearchResultsPage({ searchParams }) {
    const searchQuery = searchParams.searchQuery || '';
    const ingredients = searchParams.ingredients || '';
    const category = searchParams.category || '';


    return (
        <SearchResultsClient
            searchQuery={searchQuery}
            ingredients={ingredients}
            category={category}
        />
    );

}