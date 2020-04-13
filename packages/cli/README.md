# @abaplint/cli

[abaplint](https://abaplint.org) command line interface

```
Usage:
  abaplint [<abaplint.json> -f <format> -c --outformat <format> --outfile <file>]
  abaplint -h | --help             show this help
  abaplint -v | --version          show version
  abaplint -d | --default          show default configuration
  abaplint -t [<abaplint.json> -c] show stats
  abaplint -e [<abaplint.json> -c] show semantic search information

Options:
  -f, --format <format>  output format (standard, total, json, summary, junit)
  --outformat <format>   output format, use in combination with outfile
  --outfile <file>       output issues to file in format
  -c                     compress files in memory
```

## Requirements
Node.js 10