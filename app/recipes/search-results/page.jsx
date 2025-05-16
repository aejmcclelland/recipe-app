// app/recipes/search-results/page.jsx
import SearchResultsClient from '@/components/SearchResultsClient';

export default async function SearchResultsPage({ searchParams }) {
    const params = await searchParams;
    const searchQuery = params.searchQuery || '';
    const ingredients = params.ingredients || '';
    const category = params.category || '';


    return (
        <SearchResultsClient
            searchQuery={searchQuery}
            ingredients={ingredients}
            category={category}
        />
    );

}