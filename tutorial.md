# Tutorial

jf can be used for a lot of the same tasks as [jq](https://jqlang.github.io/jq/). Below is a copy of
the [jq tutorial](https://jqlang.github.io/jq/tutorial/) with all the jq translated to jf.

---

GitHub has a JSON API, so let's play with that. This URL gets us the last 5 commits from the jf
repo.

```
curl 'https://api.github.com/repos/callum-oakley/jf/commits?per_page=5'
```

GitHub returns nicely formatted JSON. For servers that don't, it can be helpful to pipe the response
through jf to pretty-print it. The `-p` flag parses STDIN as JSON, and the `-s` flag calls `JSON.stringify` on the result.

```
curl 'https://api.github.com/repos/callum-oakley/jf/commits?per_page=5' | jf -ps
```

We can use jf to extract just the first commit. `$` is the result of parsing STDIN as JSON, so
`$[0]` is the first commit.

```
curl 'https://api.github.com/repos/callum-oakley/jf/commits?per_page=5' | jf -ps '$[0]'
```

For the rest of the examples, I'll leave out the `curl` command - it's not going to change.

There's a lot of info we don't care about there, so we'll restrict it down to the most interesting
fields.

```
jf -ps 'const x = $[0]; ({ message: x.commit.message, name: x.commit.committer.name })'
```

We assign `$[0]` to a variable and then use that variable to construct a new object with only the
fields we care about. (Note that we have to wrap the object literal in parentheses to avoid it being
parsed as a block statement.)

Now let's get the rest of the commits by applying the same transformation to every commit with
`map`.

```
jf -ps '$.map(x => ({ message: x.commit.message, name: x.commit.committer.name }))'
```

Next, let's try getting the URLs of the parent commits out of the API results as well. In each
commit, the GitHub API includes information about "parent" commits. There can be one or many.

```
"parents": [
  {
    "sha": "4acd103768b307907f1d334eeed97674c732f067",
    "url": "https://api.github.com/repos/callum-oakley/jf/commits/4acd103768b307907f1d334eeed97674c732f067",
    "html_url": "https://github.com/callum-oakley/jf/commit/4acd103768b307907f1d334eeed97674c732f067"
  }
]
```

We want to pull out all of the "html_url" fields inside that array of parent commits and make a
simple list of strings to go along with the "message" and "author" fields we already have.

```
jf -ps '$.map(x => ({
  message: x.commit.message,
  name: x.commit.committer.name,
  parents: x.parents.map(y => y.html_url),
}))'
```

Here we're making a new object for each commit as before, but this time we use another nested `map`
to pull the commit URLs out  of each parent object.

---

Here endeth the tutorial! There's lots more to play with. [Install jf](/README.md) if you haven't
already, and check out `jf --help` to see all the available options.
