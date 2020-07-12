# @abaplint/cli

[abaplint](https://abaplint.org) command line interface

```
Usage:
  abaplint [<abaplint.json> -f <format> -c --outformat <format> --outfile <file> --fix]
  abaplint -h | --help      show this help
  abaplint -v | --version   show version
  abaplint -d | --default   show default configuration

Options:
  -f, --format <format>  output format (standard, total, json, summary, junit)
  --outformat <format>   output format, use in combination with outfile
  --outfile <file>       output issues to file in format
  --fix                  apply quick fixes to files
  -p                     output performance information
  -c                     compress files in memory
```

## Requirements
Node.js 10