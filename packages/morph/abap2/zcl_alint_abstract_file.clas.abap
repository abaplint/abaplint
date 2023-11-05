* auto generated, do not touch
CLASS zcl_alint_abstract_file DEFINITION ABSTRACT PUBLIC.
  PUBLIC SECTION.
    INTERFACES zif_alint_ifile.
    METHODS constructor IMPORTING filename TYPE string.
    ALIASES getfilename FOR zif_alint_ifile~getfilename.
    ALIASES getobjecttype FOR zif_alint_ifile~getobjecttype.
    ALIASES getobjectname FOR zif_alint_ifile~getobjectname.
    ALIASES getraw FOR zif_alint_ifile~getraw.
    ALIASES getrawrows FOR zif_alint_ifile~getrawrows.
  PRIVATE SECTION.
    DATA filename TYPE string.
    METHODS basename RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS zcl_alint_abstract_file IMPLEMENTATION.
  METHOD constructor.
    me->filename = filename.
  ENDMETHOD.

  METHOD zif_alint_ifile~getfilename.
    return = me->filename.

  ENDMETHOD.

  METHOD basename.
    DATA(name) = getfilename( ).
    DATA(index) = find( val = name sub = |\\| occ = -1 ).
    IF index IS NOT INITIAL.
      index = index + 1.
    ENDIF.
    name = substring( val = name off = index ).
    index = find( val = name sub = |/| occ = -1 ).
    IF index IS NOT INITIAL.
      index = index + 1.
    ENDIF.
    return = substring( val = name off = index ).

  ENDMETHOD.

  METHOD zif_alint_ifile~getobjecttype.
    DATA(split) = REDUCE string_table( LET split_input = basename( )
      split_by    = |.|
      offset      = 0
      IN
      INIT string_result = VALUE string_table( )
       add = ||
      FOR index4 = 0 WHILE index4 <= strlen( split_input )
      NEXT
      string_result = COND #(
      WHEN index4 = strlen( split_input ) OR split_input+index4(1) = split_by
      THEN VALUE #( BASE string_result ( add ) )
      ELSE string_result )
      add    = COND #(
      WHEN index4 = strlen( split_input ) OR split_input+index4(1) = split_by
      THEN ||
      ELSE |{ add }{ split_input+index4(1) }| ) ).
    return = to_upper( split[ 1 + 1 ] ).

  ENDMETHOD.

  METHOD zif_alint_ifile~getobjectname.
    DATA(split) = REDUCE string_table( LET split_input = basename( )
      split_by    = |.|
      offset      = 0
      IN
      INIT string_result = VALUE string_table( )
       add = ||
      FOR index5 = 0 WHILE index5 <= strlen( split_input )
      NEXT
      string_result = COND #(
      WHEN index5 = strlen( split_input ) OR split_input+index5(1) = split_by
      THEN VALUE #( BASE string_result ( add ) )
      ELSE string_result )
      add    = COND #(
      WHEN index5 = strlen( split_input ) OR split_input+index5(1) = split_by
      THEN ||
      ELSE |{ add }{ split_input+index5(1) }| ) ).
    split[ 0 + 1 ] = replace( val = split[ 0 + 1 ] regex = |%23| with = |#| ).
    split[ 0 + 1 ] = replace( val = split[ 0 + 1 ] regex = |%3e| with = |>| ).
    split[ 0 + 1 ] = replace( val = split[ 0 + 1 ] regex = |%3c| with = |<| ).
    split[ 0 + 1 ] = replace( val = to_upper( val = split[ 0 + 1 ] ) regex = |#| with = |/| ).
    split[ 0 + 1 ] = replace( val = split[ 0 + 1 ] regex = |(| with = |/| ).
    split[ 0 + 1 ] = replace( val = split[ 0 + 1 ] regex = |)| with = |/| ).
    return = split[ 0 + 1 ].

  ENDMETHOD.

  METHOD zif_alint_ifile~getraw.
  ENDMETHOD.

  METHOD zif_alint_ifile~getrawrows.
  ENDMETHOD.

ENDCLASS.
