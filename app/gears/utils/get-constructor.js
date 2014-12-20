/**
 * Get a constructor by name from an available list
 * represented as an object.
 *
 * This method is used to retrieve a specific panel constructor
 * from the available list setup in the global configuration.
 */

function getConstructor(name, list) {
	var names;

	// custom constructor
	if (typeof name === 'function') {
		return name;
	}

	// available constructor identified by name
	names = Object.keys(list);
	if (names.indexOf(name) !== -1) {
		return list[name];
	}

	return list.default;
}

module.exports = getConstructor;
