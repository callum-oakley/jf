# jf

jf is a tool for processing data in a shell script or on the command line with JavaScript.

## Example

Suppose we have some JSON which contains [a bunch of superheros][] and we want to find the hero with
the power of "Immortality":

```
> curl https://mdn.github.io/learning-area/javascript/oojs/json/superheroes.json |
    jf -p '$.members.find(m => m.powers.includes("Immortality"))'
{
  name: "Eternal Flame",
  age: 1000000,
  secretIdentity: "Unknown",
  powers: [
    "Immortality",
    "Heat Immunity",
    "Inferno",
    "Teleportation",
    "Interdimensional travel"
  ]
}
```

## IO

The provided script is evaluated in a [Deno][] environment, and the [completion value][] is written
to STDOUT.

- If the `--input` or `-i` flag is set then STDIN is read as text and stored in the `$` variable.
- If the `--parse` or `-p` flag is set then STDIN is parsed as JSON and stored in the `$` variable.
- If the `--stringify` or `-s` flag is set then the completion value is passed through
  `JSON.stringify` before being written to STDOUT.

## Environment

Environment variables are exposed as global variables prefixed with `$`. e.g.

```
> jf '`Hello ${$USER}!`'
Hello callum
```

## Why?

JavaScript is a convenient language to use to process JSON (which stands for "JavaScript Object
Notation" after all), but the boilerplate of reading from STDIN, parsing, and writing to STDOUT
makes many could-be "one-liners" significantly more involved than they need to be. jf provides a
thin wrapper around a Deno environment which handles this boilerplate and makes it more
ergonomic to sprinkle a little JavaScript in to a shell script.

jf can be used for many of the same tasks as [jq][]. A given jq command is often a little shorter
than the equivalent jf command, but if (like the author) you find yourself often forgetting the
syntax of jq, and you already know JavaScript, you might find jf easier to use. To see how jf
compares to jq, check out the [translated jq tutorial][].

## Install

First [install Deno][], then [deno install][] jf.

```
deno install --allow-all -gf jsr:@callum-oakley/jf@1.0.0
```

> [!NOTE]
> You may have to add `$HOME/.deno/bin` to your path.

[a bunch of superheros]: https://mdn.github.io/learning-area/javascript/oojs/json/superheroes.json
[completion value]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#eval_returns_the_completion_value_of_statements
[deno install]: https://docs.deno.com/runtime/reference/cli/install/
[Deno]: https://deno.com/
[install Deno]: https://docs.deno.com/runtime/getting_started/installation/
[jq]: https://jqlang.github.io/jq/
[translated jq tutorial]: /tutorial.md
