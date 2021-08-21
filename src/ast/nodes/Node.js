"use strict";

import util from "util";

class Node {
	constructor(type) {
		this.type = type;
	}

	[util.inspect.custom]() {
		return {...this, type : Node.Type.Lookup(this.type)};
	}
}
Node.Type = Object.freeze({
	EXPRESSION        : 10,
	UNARY_EXPRESSION  : 20,
	BINARY_EXPRESSION : 30,
	STATEMENT         : 40,
	ASSIGNMENT        : 50,
	PAREN_EXPRESSION  : 60,
	Lookup            : value => Object.keys(Node.Type).find(key => Node.Type[key] === value)
});

export default Node;