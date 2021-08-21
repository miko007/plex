"use strict";

import chalk from "chalk";

import Std            from "./util/Std.js";
import Lexer, {Token} from "./Lexer.js";

import ExpressionNode from "./ast/nodes/ExpressionNode.js";
import AssignmentNode from "./ast/nodes/AssignmentNode.js";
import ParenExpressionNode from "./ast/nodes/ParenExpressionNode.js";

class Parser {
	constructor(sourceCode) {
		this.sourceCode          = sourceCode;
		this.lines               = sourceCode.split('\n');
		this.tokenStream         = Lexer.TokenStream(sourceCode);
		this.abstractTokenStream = this.tokenStream.filter(token => token.type !== Token.Type.WHITESPACE && token.type !== Token.Type.EOL);
		this.pointer             = 0;
	}

	peek(offset = 0) {
		const index = this.pointer + offset;

		return index >= this.abstractTokenStream.length ? this.abstractTokenStream[this.abstractTokenStream.length - 1] : this.abstractTokenStream[index];
	}

	get next() {
		const token = this.peek();
		this.pointer++;

		return token;
	}

	get current() {
		return this.peek();
	}

	get lookahead() {
		return this.peek(1);
	}

	match(tokenType) {
		let token = this.current;
		if (token.type !== tokenType)
			this.error(`unexpected ${Token.Type.Lookup(token.type)} '${token.value}'`, token);
		
		this.pointer++;

		return token;
	}

	parseNumber() {
		return this.match(Token.Type.NUMBER);
	}

	parseString() {
		return this.match(Token.Type.STRING);
	}

	parseIdentifier() {
		return this.match(Token.Type.IDENTIFIER);
	}

	parseLiteral() {
		switch(this.current.type) {
			case Token.Type.NUMBER:
				return this.parseNumber();
			case Token.Type.STRING:
				return this.parseString();
			default:
				this.error(`unexpected ${Token.Type.Lookup(this.current.type)} '${this.current.value}', expected one of INTEGER, FLOAT, STRING,`);
				break;
		}
	}

	parseOperator() {
		switch(this.current.type) {
			case Token.Type.PLUS:
				return this.match(Token.Type.PLUS);
			case Token.Type.MINUS:
				return this.match(Token.Type.MINUS);
			default:
				this.error(`unexpected ${Token.Type.Lookup(this.current.type)} '${this.current.value}', expected OPERATOR`);
				break;
		}
	}

	parseIdentifier() {
		return this.match(Token.Type.IDENTIFIER);
	}

	parsePrimaryExpression() {
		switch (this.current.type) {
			case Token.Type.LPAREN:
				return this.parseParenExpression();
			default:
				return this.parseLiteral();
		}
	}

	parseParenExpression() {
		const begin      = this.match(Token.Type.LPAREN);
		const expression = this.parseExpression();
		const end        = this.match(Token.Type.RPAREN);

		return new ParenExpressionNode(begin, expression, end);
	}

	parseBinaryExpression(parentPrecedence = 0) {
		const lvalue   = this.parsePrimaryExpression();
		const operator = this.parseOperator();
		const rvalue   = this.parsePrimaryExpression();

		return new ExpressionNode(lvalue, operator, rvalue);
	}

	parseExpression() {
		//if (this.current.type === Token.Type.LPAREN)
		//	return this.parseParenExpression();
		if (Parser.Operators.includes(this.lookahead.type))
			return this.parseBinaryExpression();
		if (this.lookahead.type === Token.Type.EQUALS)
			return this.parseAssignment();
		
		return this.parseLiteral();
	}

	parseAssignment() {
		const identifier = this.parseIdentifier();
		const operator   = this.match(Token.Type.EQUALS);
		const expression = this.parseExpression();

		return new AssignmentNode(identifier, operator, expression);
	}

	parseFunction() {
		const functionName = this.parseIdentifier();
		const body         = "";
	}

	parseProgram() {
		const expressions = [];
		let expression;
		do {
			expression = this.parseExpression();
			expressions.push(expression);
		} while (this.current.type !== Token.Type.EOF)

		return {
			type : "PROGRAM",
			expressions
		};
	}

	parse() {
		return this.parseProgram();
	}

	error(message, token = this.current) {
		const postionLabel = `${" ".repeat(this.lines.length.toString().length - token.position.line?.toString().length)}${token.position.line} |`;
		Std.LogDirect(`\t${chalk.gray(postionLabel)}  ${this.lines[token.position.line - 1]}`);
		Std.LogDirect(`\t${" ".repeat(token.position.start - 1 + postionLabel.length + 2)}${"^".repeat(token.position.length)}\n`, Std.LogLevel.WARN);
		Std.LogDirect(`${message} in line ${token.position.line} [${token.position.start}, ${token.position.start + token.position.length}]`, Std.LogLevel.PANIC);
	}
}
Parser.Literals = Object.freeze([
	Token.Type.NUMBER,
	Token.Type.STRING
]);
Parser.Operators = Object.freeze([
	Token.Type.PLUS,
	Token.Type.MINUS,
	Token.Type.SLASH,
	Token.Type.ASTERIS
]);

export default Parser;