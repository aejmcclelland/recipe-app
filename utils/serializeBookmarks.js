export function serializeBookmarks(bookmarks) {
	return bookmarks.map((bookmark) => ({
		...bookmark,
		_id: bookmark._id.toString(),
		category: bookmark.category
			? { ...bookmark.category, _id: bookmark.category._id.toString() }
			: null,
	}));
}
