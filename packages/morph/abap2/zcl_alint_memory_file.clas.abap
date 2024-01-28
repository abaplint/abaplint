* auto generated, do not touch
CLASS zcl_alint_memory_file DEFINITION INHERITING FROM zcl_alint_abstract_file PUBLIC.
  PUBLIC SECTION.
    METHODS constructor IMPORTING filename TYPE string raw TYPE string.
    METHODS getraw REDEFINITION.
    METHODS getrawrows REDEFINITION.
  PRIVATE SECTION.
    DATA raw TYPE string.
ENDCLASS.

CLASS zcl_alint_memory_file IMPLEMENTATION.
  METHOD constructor.
    super->constructor( filename ).
    me->raw = raw.
  ENDMETHOD.

  METHOD getraw.
    return = me->raw.

  ENDMETHOD.

  METHOD getrawrows.
    return = REDUCE string_table( LET split_input = raw
      split_by    = |\n|
      offset      = 0
      IN
      INIT string_result = VALUE string_table( )
       add = ||
      FOR index3 = 0 WHILE index3 <= strlen( split_input )
      NEXT
      string_result = COND #(
      WHEN index3 = strlen( split_input ) OR split_input+index3(1) = split_by
      THEN VALUE #( BASE string_result ( add ) )
      ELSE string_result )
      add    = COND #(
      WHEN index3 = strlen( split_input ) OR split_input+index3(1) = split_by
      THEN ||
      ELSE |{ add }{ split_input+index3(1) }| ) ).

  ENDMETHOD.

ENDCLASS.
