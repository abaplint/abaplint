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

## Configuration

run 'abaplint -h'
it will show "  -d, --default    show default configuration" which will output the default configuration file
then place the file as 'abaplint.json' in the root folder of the repo