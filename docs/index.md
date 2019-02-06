---
title: Home
category: home
order: 10
---

## Rules

### 7bit_ascii
Similar to https://github.com/larshp/abapOpenChecks/wiki/ZCL_AOC_CHECK_05

### contains_tab
Similar to https://github.com/larshp/abapOpenChecks/wiki/ZCL_AOC_CHECK_09

### functional_writing
Similar to https://github.com/larshp/abapOpenChecks/wiki/ZCL_AOC_CHECK_07

### line_length
Similar to https://github.com/larshp/abapOpenChecks/wiki/ZCL_AOC_CHECK_04

### Configuration
length: 120

### max_one_statement
Similar to https://github.com/larshp/abapOpenChecks/wiki/ZCL_AOC_CHECK_11

### parser_error
Error while parsing ABAP statement. Bad ABAP or error in abaplint.

### space_before_colon
Space before colon

### colon_missing_space
Missing space after colon

### exit_or_check
Similar to https://github.com/larshp/abapOpenChecks/wiki/ZCL_AOC_CHECK_02

### line_only_punc
Similar to https://github.com/larshp/abapOpenChecks/wiki/ZCL_AOC_CHECK_16

#### obsolete_statement
Similar to https://github.com/larshp/abapOpenChecks/wiki/ZCL_AOC_CHECK_08

### start_at_tab
Start statement at tab position(tab = 2 spaces)

### whitespace_end
Whitespace at end of line

### exporting
Similar to https://github.com/larshp/abapOpenChecks/wiki/ZCL_AOC_CHECK_30

### empty_statement
Empty statement, i.e. no keywords or operators.

### sequential_blank
Similar to https://github.com/larshp/abapOpenChecks/wiki/ZCL_AOC_CHECK_13

### Configuration
lines: 4

### definitions_top
Similar to https://github.com/larshp/abapOpenChecks/wiki/ZCL_AOC_CHECK_17

### indentation
Controls proper indentation. Tab stop is 2 spaces (fixed for now). Additional options:
- **ignoreExceptions** - completely ignores exception classes (due to default global exception generation, which does not format code)
- **alignTryCatch** - aligns `catch` to the same level as `try`

```abap
try.
  some_statement( ).
catch cx_root.
  message 'error'.
endtry.
```

- **globalClassSkipFirst** - skips first tab stop after the class definition/implementation (due to standard formatting in se80, which aligns `method` and `* section` to the left edge)
```abap
class lcl_app implementation.
method run.
  " and here goes normal indentation
endmethod.
endclass.
```


## Configuration

run 'abaplint -h'

it will show "  -d, --default    show default configuration" which will output the default configuration file

then place the file as 'abaplint.json' in the root folder of the repo
