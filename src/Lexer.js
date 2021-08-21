"use strict";

import util from "util";

class Token {
	constructor(type, value, line = new TokenPosition(), subType = null) {
		this.type       = type;
		this.value      = value;
		this.position   = line;
		this.precedence = Token.Precedence(type);
		if (subType)
			this.subType = subType;
	}

	[util.inspect.custom]() {
		return {...this, type : Token.Type.Lookup(this.type)};
	}

	static Precedence(type) {
		switch(type) {
			case Token.Type.PLUS:
			case Token.Type.MINUS:
				return 5;
			case Token.Type.ASTERISK:
			case Token.Type.SLASH:
				return 10;
			default:
				return -Infinity;
		}
	}
}
Token.Type = Object.freeze({
	EOF        : 10,
	EOL        : 20,
	BAD        : 30,
	PLUS       : 40,
	MINUS      : 50,
	SLASH      : 60,
	ASTERISK   : 70,
	LPAREN     : 80,
	RPAREN     : 90,
	EQUALS     : 100,
	NUMBER     : 110,
	STRING     : 120,
	WHITESPACE : 130,
	KEYWORD    : 140,
	IDENTIFIER : 150,
	Lookup     : value => Object.keys(Token.Type).find(key => Token.Type[key] === value)
});

class TokenPosition {
	constructor(line = -1, start = -1, length = -1) {
		this.line   = line;
		this.start  = start;
		this.length = length
	}

	[util.inspect.custom](depth, opts) {
		return `[${this.line}, ${this.start}]`;
	}
}

class Lexer {
	constructor(sourceCode) {
		this.sourceCode = sourceCode;
		this.pointer    = 0;
		this.line       = 1;
		this.lineStart  = 0;
	}

	peek(offset = 0) {
		const index = this.pointer + offset;

		if (index >= this.sourceCode.length)
			return '\0';

		return this.sourceCode[index];
	}

	get lookahead() {
		return this.peek(1);
	}

	get current() {
		return this.peek();
	}

	next() {
		if (this.current === '\n') {
			this.line++;
			this.pointer++;
			this.lineStart = this.pointer;

			return new Token(Token.Type.EOL, '\n', this.line - 1);
		}

		this.start = this.pointer;
		let type = Token.Type.BAD;


		if (/\s/.test(this.current)) {
			this.pointer++;
			return this.lexWhitespace();
		}

		switch (this.current) {
			case '\0':
				return new Token(Token.Type.EOF, '\0', this.line);
				break;
			case '+':
				type = Token.Type.PLUS;
				this.pointer++;
				break;
			case '-':
				type = Token.Type.MINUS;
				this.pointer++;
				break;
			case '/':
				type = Token.Type.SLASH;
				this.pointer++;
				break;
			case '*':
				type = Token.Type.ASTERISK;
				this.pointer++;
				break;
			case '=':
				type = Token.Type.EQUALS;
				this.pointer++;
				break;
			case '(':
				type = Token.Type.LPAREN;
				this.pointer++;
				break;
			case ')':
				type = Token.Type.RPAREN;
				this.pointer++;
				break;
			case '0': case '1': case '2': case '3': case '4':
			case '5': case '6':	case '7': case '8': case '9':
				return this.lexNumber();
			case '"':
				this.start = ++this.pointer;
				return this.lexString();
			default:
				const token = this.lexKeywordOrIdentifier();
				
				return token ?? new Token(Token.Type.BAD, this.tokenPosition);
		}

		return new Token(type, this.peek(-1), this.tokenPosition);
	}

	lexWhitespace() {
		while (/\s/.test(this.current))
			this.pointer++;

		return new Token(Token.Type.WHITESPACE, this.sourceCode.slice(this.start, this.pointer), this.line);
	}

	lexNumber() {
		while (Number.isInteger(parseInt(this.current)))
			this.pointer++;

		return new Token(Token.Type.NUMBER, parseInt(this.sourceCode.slice(this.start, this.pointer)), this.tokenPosition);
	}

	lexString() {
		while (this.current !== '"')
			this.pointer++;

		const token = new Token(Token.Type.STRING, this.sourceCode.slice(this.start, this.pointer), this.line);
		this.pointer++;

		return token;
	}

	lexKeywordOrIdentifier() {
		while (!/\s/.test(this.current) && this.current !== '\0')
			this.pointer++;

		const token = this.sourceCode.slice(this.start, this.pointer);

		if (!/^[a-zA-Z_]+[a-zA-Z0-9_]*$/g.test(token))
			return new Token(Token.Type.BAD, token, this.tokenPosition, Token.Type.IDENTIFIER);

		if (Lexer.Keywords.includes(token.toUpperCase()))
			return new Token(Token.Type.KEYWORD, token.toUpperCase(), this.tokenPosition);
		else
			return new Token(Token.Type.IDENTIFIER, token, this.tokenPosition);
	}

	get tokenPosition() {
		return new TokenPosition(this.line, this.pointer - this.lineStart - (this.pointer - this.start) + 1, this.pointer - this.start);
	}

	tokenize() {
		const tokenStream = [];

		let token;

		do {
			token = this.next();
			tokenStream.push(token);
		} while (token.type !== Token.Type.EOF);

		return tokenStream;
	}

	static TokenStream(sourceCode) {
		const lexer = new Lexer(sourceCode);

		return lexer.tokenize();
	}
}
Lexer.Keywords = Object.freeze([
	"DIM",
	"FUNC",
	"IF",
	"THEN",
	"ELSE",
	"ENDIF",
	"CONST"
]);

export {Token, TokenPosition};
export default Lexer;