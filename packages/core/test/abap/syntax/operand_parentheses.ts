import {expect} from "chai";
import {runProgram} from "./syntax";

const program = (body: string): string => `
REPORT zparen.
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS get IMPORTING p TYPE i OPTIONAL RETURNING VALUE(r) TYPE i.
    CLASS-METHODS str RETURNING VALUE(r) TYPE string.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
  METHOD get.
  ENDMETHOD.
  METHOD str.
  ENDMETHOD.
ENDCLASS.
TYPES: BEGIN OF ty,
         f TYPE i,
       END OF ty.
DATA i TYPE i.
DATA s TYPE string.
DATA x TYPE x LENGTH 1.
DATA st TYPE ty.
DATA tab TYPE STANDARD TABLE OF ty WITH DEFAULT KEY.
DATA itab TYPE STANDARD TABLE OF i WITH DEFAULT KEY.
DATA stab TYPE string_table.
DATA ref TYPE REF TO i.
START-OF-SELECTION.
${body}`;

const issuesOf = (body: string) => runProgram(program(body)).map(i => i.getMessage());

describe("syntax.ts, parentheses around an operand", () => {

  const concatenation = [
    "s = ( s ) && s.",
    "s = s && ( s ).",
    "s = s && ( s ) && s.",
    "s = s && ( s && s ).",
    "s = ( 'a' ) && s.",
    "s = ( lcl=>str( ) ) && s.",
    "s = ( i + 1 ) && s.",
    "s = ( to_upper( s ) ) && s.",
    "s = |{ ( s ) && s }|.",
    "CASE ( s ) && s.\n  WHEN 'a'.\nENDCASE.",
    "APPEND s && ( s ) TO stab.",
    "i = strlen( ( s ) && s ).",
    "i = strlen( s && ( s ) ).",
  ];
  for (const statement of concatenation) {
    it("error, " + statement, () => {
      expect(issuesOf(statement).filter(m => m.startsWith("Parentheses not allowed around an operand of &&")))
        .to.have.length(1);
    });
  }

  const notCalculated = [
    "s = |{ ( s ) }|.",
    "s = |{ ( i ) }|.",
    "s = |{ ( 'a' ) }|.",
    "s = |{ ( ref->* ) }|.",
    "s = |{ ( ( i ) ) }|.",
    "s = |{ ( lcl=>get( ) ) }|.",
    "s = |{ ( abs( i ) ) }|.",
    "s = |{ ( strlen( s ) ) }|.",
    "s = |{ ( itab[ 1 ] ) }|.",
    "s = |{ ( CONV i( i ) ) }|.",
    "s = |{ ( i ) WIDTH = 3 }|.",
    "s = |{ ( 'a' & 'b' ) }|.",
    "s = CONV string( ( s ) ).",
    "s = s && CONV string( ( s ) ).",
    "i = CONV i( ( i ) ).",
    "i = CONV i( ( 1 ) ).",
    "i = CONV i( ( ( i ) ) ).",
    "i = CONV i( ( lcl=>get( i + 1 ) ) ).",
    "i = CONV i( ( abs( ( i ) ) ) ).",
    "i = CONV i( ( abs( ref->* ) ) ).",
    "i = CONV i( ( abs( st-f ) ) ).",
    "i = CONV i( ( ipow( base = i exp = 2 ) ) ).",
    "i = CONV i( ( ipow( base = ( i ) exp = 2 ) ) ).",
    "i = CONV i( ( nmax( val1 = i val2 = i ) ) ).",
    "i = CONV i( ( lines( itab ) ) ).",
    "i = CONV i( ( strlen( s && s ) ) ).",
    "i = CONV i( ( strlen( to_upper( s ) ) ) ).",
    "i = CONV i( ( strlen( to_upper( lcl=>str( ) ) ) ) ).",
    "i = CONV i( ( strlen( substring( val = s off = i + 1 ) ) ) ).",
    "i = CONV i( ( strlen( |{ s }| ) ) ).",
    "i = CONV i( ( strlen( s && to_upper( s ) ) ) ).",
    "i = CONV i( ( find( val = s sub = `a` ) ) ).",
    "i = CONV i( ( cmax( val1 = s val2 = s ) ) ).",
    "i = EXACT #( ( i ) ).",
    "ref = REF #( ( i ) ).",
    "st = VALUE #( f = ( i ) ).",
    "itab = VALUE #( ( ( i ) ) ).",
    "itab = VALUE #( ( ( lcl=>get( ) ) ) ).",
    "stab = VALUE #( ( ( s ) ) ).",
    "tab = VALUE #( ( f = ( i ) ) ).",
    "tab = VALUE #( f = ( i ) ( ) ).",
    "itab = VALUE #( LET a = ( i ) IN ( a ) ).",
    "st = VALUE #( BASE ( st ) f = 1 ).",
    "itab = VALUE #( ( LINES OF ( itab ) ) ).",
    "i = VALUE #( itab[ 1 ] DEFAULT ( i ) ).",
    "itab = VALUE #( FOR k IN ( itab ) ( k ) ).",
    "itab = VALUE #( FOR k IN itab ( ( k ) ) ).",
    "i = COND #( WHEN i = 1 THEN ( i ) ).",
    "i = COND #( WHEN i = 1 THEN 1 ELSE ( i ) ).",
    "i = COND #( LET z = 1 IN WHEN i = 1 THEN ( z ) ).",
    "i = SWITCH #( ( i ) WHEN 1 THEN 1 ).",
    "i = SWITCH #( i WHEN ( 1 ) THEN 1 ).",
    "i = SWITCH #( i WHEN 1 OR ( 2 ) THEN 1 ).",
    "i = SWITCH #( i WHEN 1 THEN ( i ) ).",
    "i = SWITCH #( i WHEN 1 THEN 1 ELSE ( i ) ).",
    "i = REDUCE i( INIT n = ( i ) FOR k IN itab NEXT n = n ).",
    "i = REDUCE i( INIT n = 0 FOR k IN itab NEXT n = ( n ) ).",
    "i = REDUCE i( INIT n = 0 FOR k = ( i ) WHILE k < 3 NEXT n = n + k ).",
    "i = REDUCE i( INIT n = 0 FOR k = 0 THEN ( k ) UNTIL k > 3 NEXT n = n + k ).",
    "st = CORRESPONDING #( ( st ) ).",
    "APPEND ( s ) TO stab.",
    "APPEND ( i ) TO itab.",
    "APPEND ( 1 ) TO itab.",
    "APPEND ( lcl=>get( ) ) TO itab.",
    "APPEND ( abs( i ) ) TO itab.",
    "APPEND ( ( i ) ) TO itab.",
    "APPEND ( st ) TO tab.",
    "APPEND LINES OF ( itab ) TO itab.",
    "APPEND ( i ) TO itab ASSIGNING FIELD-SYMBOL(<a>).",
    "INSERT ( i ) INTO TABLE itab.",
    "INSERT ( i ) INTO itab INDEX 1.",
    "INSERT ( lcl=>get( ) ) INTO TABLE itab.",
    "INSERT ( st ) INTO TABLE tab.",
    "INSERT LINES OF ( itab ) INTO TABLE itab.",
    "INSERT ( strlen( to_upper( s ) ) ) INTO TABLE itab.",
  ];
  for (const statement of notCalculated) {
    it("error, " + statement, () => {
      expect(issuesOf(statement).filter(m => m.startsWith("Parentheses are only allowed around a calculation")))
        .to.have.length(1);
    });
  }

  const valid = [
    "s = ( s ).",
    "i = ( i ).",
    "i = ( lcl=>get( ) ).",
    "i = ( abs( i ) ).",
    "i = ( ( i ) ) + 1.",
    "i = ( i ) + ( i ).",
    "s = s && s.",
    "s = s && CONV string( s ).",
    "s = |{ ( i + 1 ) }|.",
    "s = |{ ( i ) + 1 }|.",
    "s = |{ ( - i ) }|.",
    "s = |{ ( ( i + 1 ) ) }|.",
    "s = |{ ( x BIT-AND x ) }|.",
    "s = |{ ( BIT-NOT x ) }|.",
    "s = |{ ( abs( i + 1 ) ) }|.",
    "s = |{ ( strlen( lcl=>str( ) ) ) }|.",
    "s = |{ i WIDTH = ( i ) }|.",
    "i = CONV i( ( i + 1 ) ).",
    "i = CONV i( ( i ) + 1 ).",
    "i = CONV i( ( ( i + 1 ) ) ).",
    "i = CONV i( ( - i ) ).",
    "i = CONV i( ( i MOD 2 ) ).",
    "i = CONV i( ( i ** 2 ) ).",
    "x = CONV #( ( x BIT-AND x ) ).",
    "i = CONV i( ( abs( i + 1 ) ) ).",
    "i = CONV i( ( abs( - i ) ) ).",
    "i = CONV i( ( abs( ( i + 1 ) ) ) ).",
    "i = CONV i( ( abs( lcl=>get( ) ) ) ).",
    "i = CONV i( ( abs( abs( i ) ) ) ).",
    "i = CONV i( ( abs( strlen( s ) ) ) ).",
    "i = CONV i( ( abs( itab[ 1 ] ) ) ).",
    "i = CONV i( ( abs( CONV i( i ) ) ) ).",
    "i = CONV i( ( abs( NEW lcl( )->get( ) ) ) ).",
    "i = CONV i( ( ipow( base = i + 1 exp = 2 ) ) ).",
    "i = CONV i( ( ipow( base = i exp = i + 1 ) ) ).",
    "i = CONV i( ( nmax( val1 = i val2 = abs( i ) ) ) ).",
    "i = CONV i( ( round( val = i dec = i + 1 ) ) ).",
    "i = CONV i( ( find( val = s sub = `a` off = i + 1 ) ) ).",
    "i = CONV i( ( strlen( lcl=>str( ) ) ) ).",
    "i = CONV i( ( strlen( stab[ 1 ] ) ) ).",
    "i = CONV i( ( strlen( s && lcl=>str( ) ) ) ).",
    "i = CONV i( ( strlen( s && stab[ 1 ] ) ) ).",
    "i = CONV i( ( strlen( |{ lcl=>get( ) }| ) ) ).",
    "i = CONV i( ( lines( VALUE string_table( ) ) ) ).",
    "i = lcl=>get( ( i ) ).",
    "i = lcl=>get( p = ( i ) ).",
    "i = abs( ( i ) ).",
    "st = VALUE #( f = ( i + 1 ) ).",
    "itab = VALUE #( ( ( i + 1 ) ) ).",
    "itab = VALUE #( LET a = ( i + 1 ) IN ( a ) ).",
    "i = VALUE #( itab[ 1 ] DEFAULT ( i + 1 ) ).",
    "i = VALUE #( itab[ ( i ) ] OPTIONAL ).",
    "itab = VALUE #( FOR k = 1 THEN k + 1 WHILE k < ( i ) ( k ) ).",
    "itab = VALUE #( FOR w IN itab FROM ( i ) TO ( i ) ( w ) ).",
    "itab = VALUE #( ( LINES OF itab FROM ( i ) TO ( i ) ) ).",
    "i = COND #( WHEN ( i ) = 1 THEN 1 ).",
    "i = COND #( WHEN i = 1 THEN ( i + 1 ) ).",
    "i = COND #( WHEN i = 1 THEN ( abs( i + 1 ) ) ).",
    "i = REDUCE i( INIT q = 0 FOR r = i + 1 THEN ( r + 1 ) WHILE r < 3 NEXT q = ( q + r ) ).",
    "APPEND ( i + 1 ) TO itab.",
    "APPEND ( - i ) TO itab.",
    "APPEND ( abs( i + 1 ) ) TO itab.",
    "APPEND ( abs( lcl=>get( ) ) ) TO itab.",
    "APPEND LINES OF itab FROM ( i ) TO ( i ) TO itab.",
    "INSERT ( i + 1 ) INTO TABLE itab.",
    "INSERT i INTO itab INDEX ( i ).",
  ];
  for (const statement of valid) {
    it("ok, " + statement, () => {
      expect(issuesOf(statement)).to.deep.equal([]);
    });
  }

});
