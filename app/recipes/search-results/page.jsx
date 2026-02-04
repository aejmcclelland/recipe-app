// app/recipes/search-results/page.jsx
import SearchResultsClient from '@/components/SearchResultsClient';

export default async function SearchResultsPage({ searchParams }) {
  const sp = (await searchParams) || {};

  const searchQuery = sp.searchQuery || '';
  const ingredients = sp.ingredients || '';
  const category = sp.category || '';

  return (
    <SearchResultsClient
      searchQuery={searchQuery}
      ingredients={ingredients}
      category={category}
    />
  );
}