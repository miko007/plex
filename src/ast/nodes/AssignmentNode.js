"use strict";

import Node from "./Node.js";

class AssignmentNode extends Node {
	constructor(identifier, operator, expression) {
		super(Node.Type.ASSIGNMENT);

		this.identifier = identifier;
		this.operator   = operator;
		this.expression = expression;
	}
}

export default AssignmentNode;