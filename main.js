import { parseArgs } from "https://deno.land/std@0.224.0/cli/parse_args.ts";
import { toText } from "https://deno.land/std@0.224.0/streams/to_text.ts";

const args = parseArgs(Deno.args, {
    boolean: ["input", "parse", "stringify", "help"],
    alias: {
        input: "i",
        parse: "p",
        stringify: "s",
        help: "h",
    },
});

if (args.help || Deno.args.length == 0) {
    console.log(`Evaluate the given JavaScript and print its completion value

Usage: jf [OPTIONS] [JAVASCRIPT]

Options:
  -i, --input      Read STDIN as text and store it in the $ variable
  -p, --parse      Parse STDIN as JSON and store it in the $ variable
  -s, --stringify  JSON.stringify the completion value before printing it
  -h, --help       Print this help message

Defaults:
  All options default to false. The script defaults to $.`);

    Deno.exit();
}

globalThis.$ = undefined;
if (args.input || args.parse) {
    globalThis.$ = await toText(Deno.stdin.readable);
}
if (args.parse) {
    globalThis.$ = JSON.parse(globalThis.$);
}

let res = await eval?.(`"use strict";${args._[0] ?? "$"}`);
if (args.stringify) {
    res = JSON.stringify(res, null, 2);
}
console.log(res);
