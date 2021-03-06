function validateCombinations(data, schema) {
	var error;
	return validateAllOf(data, schema)
		|| validateAnyOf(data, schema)
		|| validateOneOf(data, schema)
		|| validateNot(data, schema)
		|| null;
}

function validateAllOf(data, schema) {
	if (schema.allOf == undefined) {
		return null;
	}
	var error;
	for (var i = 0; i < schema.allOf.length; i++) {
		var subSchema = schema.allOf[i];
		if (error = validateAll(data, subSchema)) {
			return error.prefixWith(null, "" + i).prefixWith(null, "allOf");
		}
	}
}

function validateAnyOf(data, schema) {
	if (schema.anyOf == undefined) {
		return null;
	}
	var errors = [];
	for (var i = 0; i < schema.anyOf.length; i++) {
		var subSchema = schema.anyOf[i];
		var error = validateAll(data, subSchema);
		if (error == null) {
			return null;
		}
		errors.push(error.prefixWith(null, "" + i).prefixWith(null, "anyOf"));
	}
	return new ValidationError("Data does not match any schemas from \"anyOf\"", "", "/anyOf", errors);
}

function validateOneOf(data, schema) {
	if (schema.oneOf == undefined) {
		return null;
	}
	var validIndex = null;
	var errors = [];
	for (var i = 0; i < schema.oneOf.length; i++) {
		var subSchema = schema.oneOf[i];
		var error = validateAll(data, subSchema);
		if (error == null) {
			if (validIndex == null) {
				validIndex = i;
			} else {
				return new ValidationError("Data is valid against more than one schema from \"oneOf\": indices " + validIndex + " and " + i, "", "/oneOf");
			}
		} else {
			errors.push(error.prefixWith(null, "" + i).prefixWith(null, "oneOf"));
		}
	}
	if (validIndex == null) {
		return new ValidationError("Data does not match any schemas from \"oneOf\"", "", "/oneOf", errors);
	}
	return null;
}

function validateNot(data, schema) {
	if (schema.not == undefined) {
		return null;
	}
	var error = validateAll(data, schema.not);
	if (error == null) {
		return new ValidationError("Data matches schema from \"not\"", "", "/not")
	}
	return null;
}
