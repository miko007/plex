"use strict";

import Std            from "./util/Std.js";
import Lexer, {Token} from "./Lexer.js";

class Parser {
	constructor(sourceCode) {
		this.sourceCode  = sourceCode;
		this.lines       = sourceCode.split('\n');
		this.tokenStream = Lexer.TokenStream(sourceCode);
		this.pointer     = 0;
		this.current     = null;
	}

	peek(offset = 0) {
		const index = this.pointer + offset;

		return index >= this.tokenStream.length ? this.tokenStream[this.tokenStream.length - 1] : this.tokenStream[index];
	}

	get next() {
		const token = this.peek();
		this.pointer++;

		return token;
	}

	get lookahead() {
		return this.peek(1);
	}

	match(tokenType) {
		let token = this.current;

		do {
			token = this.next;
		} while (token.type === Token.Type.WHITESPACE || token.type === Token.Type.EOL);

		if (token.type !== tokenType)
			this.error(`unexpected ${Token.Type.Lookup(token.type)} '${token.value}'`, token);

		return token;
	}

	parseExpression() {

	}

	parseIdentifier() {
		return this.match(Token.Type.IDENTIFIER);
	}

	parseStatement() {
		const lvalue = "";
	}

	parseFunction() {
		const functionName = this.parseIdentifier();
		const body         = "";
	}

	parseProgram() {
		//return this.parseFunction();
		return this.parseStatement();
	}

	parse() {
		return this.parseProgram();
	}

	error(message, token) {
		const postionLabel = `[${token.position.line}, ${token.position.start}]`;
		Std.LogDirect(`\t${postionLabel}  ${this.lines[token.position.line - 1]}`);
		Std.LogDirect(`\t${" ".repeat(token.position.start - 1 + postionLabel.length + 2)}${"^".repeat(token.position.length)}\n`, Std.LogLevel.WARN);
		Std.LogDirect(`${message} in line ${token.position.line} [${token.position.start}, ${token.position.start + token.position.length}]`, Std.LogLevel.PANIC);
	}
}

export default Parser;