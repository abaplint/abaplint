CLASS zcl_alint_lexer DEFINITION PUBLIC.
  PUBLIC SECTION.
    METHODS run
      IMPORTING
        iv_code TYPE string.
ENDCLASS.

CLASS zcl_alint_lexer IMPLEMENTATION.
  METHOD run.
    DATA(file) = NEW memoryfile(
      filename = 'ztest.prog.abap'
      raw      = iv_code ).
    DATA(result) = NEW lexer( )->run( file ).
    BREAK-POINT.
  ENDMETHOD.
ENDCLASS.