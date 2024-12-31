import { parseArgs } from "jsr:@std/cli@^1.0.9";
import { toText } from "jsr:@std/streams@^1.0.8";
import { bold, red } from "jsr:@std/fmt@^1.0.3/colors";
import pkg from "./deno.json" with { type: "json" };

const help = `
Evaluate some JavaScript and print its completion value

Usage:
  jf [OPTIONS] [JAVASCRIPT]

Options:
  -i, --input      Read STDIN as text and store it in the $ variable
  -p, --parse      Parse STDIN as JSON and store it in the $ variable
  -s, --stringify  JSON.stringify the completion value before printing it
  -v, --version    Print version and exit
  -h, --help       Print this help message

Defaults:
  All options default to false. The script defaults to $.

Environmnet:
  Environment variables are exposed as global variables prefixed with $.
`.trim();

async function main() {
  const flags = ["input", "parse", "stringify", "version", "help"];
  const alias = {};
  for (const flag of flags) {
    alias[flag] = flag[0];
  }
  const args = parseArgs(Deno.args, {
    boolean: flags,
    alias,
    unknown(arg) {
      if (arg.startsWith("-")) {
        throw new Error(`unknown option: ${arg}`);
      }
    },
  });

  if (args.help || Deno.args.length == 0) {
    console.log(help);
    return;
  }

  if (args.version) {
    console.log(`jf ${pkg.version}`);
    return;
  }

  if (args._.length > 1) {
    throw new Error("too many arguments");
  }

  // Set $ to the value of STDIN
  globalThis.$ = undefined;
  if (args.input || args.parse) {
    globalThis.$ = await toText(Deno.stdin.readable);
  }
  if (args.parse) {
    globalThis.$ = JSON.parse(globalThis.$);
  }

  // Set a global variable prefixed with $ for each environment variable
  for (const [k, v] of Object.entries(Deno.env.toObject())) {
    globalThis[`$${k}`] = v;
  }

  // Follow the advice at
  // https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/eval to use
  // "indirect eval" and to set strict mode.
  let res = await eval?.(`"use strict";${args._[0] ?? "$"}`);
  if (args.stringify) {
    res = JSON.stringify(res, null, 2);
  }

  // Avoid introducing an extra newline if the result is already a string ending in a newline
  if (typeof res === "string" && res[res.length - 1] === "\n") {
    res = res.substring(0, res.length - 1);
  }

  console.log(res);
}

try {
  await main();
} catch (err) {
  if (err instanceof Error) {
    console.error(`${bold(red("error"))}: ${err.message}`);
    Deno.exit(1);
  }
  throw err;
}
