"use strict";

import Node from "./Node.js";

class ParenExpressionNode extends Node {
	constructor(begin, expression, end) {
		super(Node.Type.PAREN_EXPRESSION);

		this.begin      = begin;
		this.expression = expression;
		this.end        = end;
	}
}

export default ParenExpressionNode;