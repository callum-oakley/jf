import { parseArgs } from "jsr:@std/cli@^0.224.5";
import { toText } from "jsr:@std/streams@^0.224.5";
import pkg from "./deno.json" with { type: "json" };

const help = `
Evaluate the given JavaScript and print its completion value

Usage: jf [OPTIONS] [JAVASCRIPT]

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
                throw Error(`unknown option: ${arg}`);
            }
        },
    });

    if (args.help || Deno.args.length == 0) {
        console.log(help);
        Deno.exit();
    }

    if (args.version) {
        console.log(`jf ${pkg.version}`);
        Deno.exit();
    }

    if (args._.length > 1) {
        throw new Error("too many arguments");
    }

    globalThis.$ = undefined;
    if (args.input || args.parse) {
        globalThis.$ = await toText(Deno.stdin.readable);
    }
    if (args.parse) {
        globalThis.$ = JSON.parse(globalThis.$);
    }

    for (const [k, v] of Object.entries(Deno.env.toObject())) {
        globalThis[`$${k}`] = v;
    }

    let res = await eval?.(`"use strict";${args._[0] ?? "$"}`);
    if (args.stringify) {
        res = JSON.stringify(res, null, 2);
    }
    console.log(res);
}

try {
    await main();
} catch (err) {
    console.error(err.message);
    Deno.exit(1);
}
