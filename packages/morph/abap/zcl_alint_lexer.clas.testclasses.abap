CLASS ltcl_test DEFINITION FOR TESTING DURATION SHORT RISK LEVEL HARMLESS FINAL.
  PRIVATE SECTION.
    METHODS run FOR TESTING RAISING cx_static_check.
ENDCLASS.


CLASS ltcl_test IMPLEMENTATION.

  METHOD run.

    DATA(file) = NEW memoryfile(
      filename = 'ztest.prog.abap'
      raw      = |hello world| ).
    DATA(result) = NEW lexer( )->run( file ).

    cl_abap_unit_assert=>assert_equals(
      act = 2
      exp = lines( result-tokens ) ).

  ENDMETHOD.

ENDCLASS.