* auto generated, do not touch
CLASS zcl_alint_abstract_token DEFINITION ABSTRACT PUBLIC.
  PUBLIC SECTION.
    METHODS constructor IMPORTING start TYPE REF TO zcl_alint_position str TYPE string.
    METHODS getstr RETURNING VALUE(return) TYPE string.
    METHODS getrow RETURNING VALUE(return) TYPE i.
    METHODS getcol RETURNING VALUE(return) TYPE i.
    METHODS getstart RETURNING VALUE(return) TYPE REF TO zcl_alint_position.
    METHODS getend RETURNING VALUE(return) TYPE REF TO zcl_alint_position.
  PRIVATE SECTION.
    DATA start TYPE REF TO zcl_alint_position.
    DATA str TYPE string.
ENDCLASS.

CLASS zcl_alint_abstract_token IMPLEMENTATION.
  METHOD constructor.
    me->start = start.
    me->str = str.
  ENDMETHOD.

  METHOD getstr.
    return = me->str.

  ENDMETHOD.

  METHOD getrow.
    return = start->getrow( ).

  ENDMETHOD.

  METHOD getcol.
    return = start->getcol( ).

  ENDMETHOD.

  METHOD getstart.
    return = me->start.

  ENDMETHOD.

  METHOD getend.
    return = NEW zcl_alint_position( row = start->getrow( ) col = start->getcol( ) + strlen( str ) ).

  ENDMETHOD.

ENDCLASS.
