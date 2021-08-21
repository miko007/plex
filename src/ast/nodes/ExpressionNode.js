"use strict";

import Node from "./Node.js";

class ExpressionNode extends Node {
	constructor(lvalue, operator, rvalue) {
		super(Node.Type.BINARY_EXPRESSION);
		this.lvalue   = lvalue;
		this.operator = operator;
		this.rvalue   = rvalue;
	}
}

export default ExpressionNode;