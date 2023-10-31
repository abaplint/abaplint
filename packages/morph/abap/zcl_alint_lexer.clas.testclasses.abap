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

    LOOP AT result-tokens INTO DATA(token).
      CASE sy-tabix.
        WHEN 1.
          cl_abap_unit_assert=>assert_equals(
            act = token->getstr( )
            exp = 'hello' ).
          cl_abap_unit_assert=>assert_equals(
            act = token->getrow( )
            exp = 1 ).
          cl_abap_unit_assert=>assert_equals(
            act = token->getcol( )
            exp = 1 ).
        WHEN 2.
          cl_abap_unit_assert=>assert_equals(
            act = token->getstr( )
            exp = 'world' ).
          cl_abap_unit_assert=>assert_equals(
            act = token->getrow( )
            exp = 1 ).
          cl_abap_unit_assert=>assert_equals(
            act = token->getcol( )
            exp = 8 ).
      ENDCASE.
    ENDLOOP.

  ENDMETHOD.

ENDCLASS.