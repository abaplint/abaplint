CLASS ltcl_test DEFINITION FOR TESTING DURATION SHORT RISK LEVEL HARMLESS FINAL.
  PRIVATE SECTION.
    METHODS run FOR TESTING RAISING cx_static_check.
ENDCLASS.


CLASS ltcl_test IMPLEMENTATION.

  METHOD run.

    DATA lv_code TYPE string.
    lv_code = |WRITE 'hello world'.|.
    NEW zcl_alint_lexer( )->run( lv_code ).

  ENDMETHOD.

ENDCLASS.