// /**
//  * Converts a Mongoose lean document into a serializable plain JavaScript object.
//  *
//  * @param {Object} leanDocument - The Mongoose lean document to be converted.
//  * @returns {Object} A plain JavaScript object that is a serializable representation of the input document.
//  */

// export function convertToSerializeableObject(leanDocument) {
// 	for (const key of Object.keys(leanDocument)) {
// 		if (leanDocument[key].toJSON && leanDocument[key].toString)
// 			leanDocument[key] = leanDocument[key].toString();
// 	}
// 	return leanDocument;
// }

/**
 * Converts a Mongoose lean document or array of documents into serializable plain JavaScript objects.
 *
 * @param {Object|Array} data - The Mongoose lean document(s) to be converted.
 * @returns {Object|Array} A plain JavaScript object or array that is a serializable representation of the input.
 */
export function convertToSerializeableObject(data) {
	if (Array.isArray(data)) {
		// Recursively convert each element if it's an array
		return data.map((item) => convertToSerializeableObject(item));
	} else if (typeof data === 'object' && data !== null) {
		// Recursively convert the object
		const plainObject = {};
		for (const key of Object.keys(data)) {
			if (data[key] && typeof data[key] === 'object') {
				// Handle Mongoose documents or ObjectId
				if (typeof data[key].toJSON === 'function') {
					plainObject[key] = data[key].toJSON(); // Convert Mongoose objects to plain JS
				} else {
					plainObject[key] = convertToSerializeableObject(data[key]); // Recurse for nested objects
				}
			} else {
				plainObject[key] = data[key]; // Directly assign primitive values
			}
		}
		return plainObject;
	}
	return data; // Return primitive types as-is
}
