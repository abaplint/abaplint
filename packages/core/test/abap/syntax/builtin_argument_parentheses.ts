import {expect} from "chai";
import {runProgram} from "./syntax";

const program = (body: string): string => `
REPORT zparen.
DATA i TYPE i.
DATA j TYPE i.
DATA f TYPE f.
DATA c TYPE c LENGTH 5.
DATA s TYPE string.
DATA x TYPE x LENGTH 4.
DATA b TYPE c LENGTH 1.
DATA tab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
DATA stab TYPE STANDARD TABLE OF string WITH DEFAULT KEY.
START-OF-SELECTION.
${body}`;

const issuesOf = (body: string) => runProgram(program(body)).map(i => i.getMessage());

describe("syntax.ts, parentheses in the argument of a built-in function", () => {

  const nonNumeric = [
    "i = strlen( ( s ) ).",
    "i = strlen( ( c ) ).",
    "i = strlen( ( ( s ) ) ).",
    "i = strlen( ( 'abc' ) ).",
    "i = strlen( ( s && s ) ).",
    "i = strlen( ( condense( s ) ) ).",
    "i = strlen( ( s ) && s ).",
    "i = strlen( s && ( s ) ).",
    "i = strlen( ( s ) ) + 1.",
    "i = xstrlen( ( x ) ).",
    "i = numofchar( ( s ) ).",
    "i = charlen( ( s ) ).",
    "i = dbmaxlen( ( s ) ).",
    "i = lines( ( tab ) ).",
    "s = condense( ( s ) ).",
    "s = condense( val = ( s ) ).",
    "s = to_upper( ( s ) ).",
    "s = reverse( ( s ) ).",
    "s = concat_lines_of( table = ( stab ) ).",
    "s = concat_lines_of( table = stab sep = ( s ) ).",
    "s = repeat( val = ( s ) occ = 2 ).",
    "i = find( val = ( s ) sub = 'a' ).",
    "i = find( val = s sub = ( c ) ).",
    "i = count( val = s sub = 'a' case = ( 'X' ) ).",
    "s = segment( val = s index = 1 sep = ( s ) ).",
    "IF contains( val = ( s ) sub = 'a' ).\nENDIF.",
  ];
  for (const statement of nonNumeric) {
    it("error, " + statement, () => {
      expect(issuesOf(statement).filter(m => m.startsWith("Parentheses not allowed in parameter"))).to.have.length(1);
    });
  }

  const valid = [
    "i = strlen( s ).",
    "i = strlen( s && s ).",
    "i = strlen( |{ s }| ).",
    "i = abs( ( i ) ).",
    "i = abs( ( i + 1 ) ).",
    "i = abs( ( ( i ) ) ).",
    "i = sign( ( i ) ).",
    "f = sqrt( ( f ) ).",
    "i = ipow( base = ( i ) exp = ( j ) ).",
    "i = nmax( val1 = ( i ) val2 = j ).",
    "f = round( val = ( f ) dec = ( j ) ).",
    "i = count( val = s sub = 'a' off = ( i ) ).",
    "s = substring( val = s off = ( i ) len = 1 ).",
    "s = repeat( val = s occ = ( i ) ).",
    "b = boolc( ( i = 1 ) ).",
    "b = xsdbool( ( i = 1 ) OR j = 1 ).",
  ];
  for (const statement of valid) {
    it("ok, " + statement, () => {
      expect(issuesOf(statement)).to.deep.equal([]);
    });
  }

});
