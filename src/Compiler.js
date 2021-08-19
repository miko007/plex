"use strict";

import Std    from "./util/Std.js";
import Parser from "./Parser.js";

class Compiler {
	constructor(sourceCode) {
		this.parser = new Parser(sourceCode);

		const ast = this.parser.parse();
	}
}

export default Compiler;