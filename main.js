import fs from "fs";

import Compiler from "./src/Compiler.js";

const cliArguments = process.argv.slice(2);

if (cliArguments.length < 1)
	process.exit(1);

const sourceCode = fs.readFileSync(cliArguments[0], "utf-8");

const APP = new Compiler(sourceCode);