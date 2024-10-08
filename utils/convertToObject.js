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
		for (const key of Object.keys(data)) {
			if (data[key] && typeof data[key] === 'object') {
				if (data[key].toJSON && data[key].toString) {
					data[key] = data[key].toString(); // Convert ObjectId to string
				} else {
					data[key] = convertToSerializeableObject(data[key]); // Recurse for nested objects
				}
			}
		}
		return data;
	}
	return data; // Return primitive types as-is
}
