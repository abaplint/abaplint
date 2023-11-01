* auto generated, do not touch
CLASS zcl_alint_position DEFINITION PUBLIC.
  PUBLIC SECTION.
    METHODS constructor IMPORTING row TYPE i col TYPE i.
    METHODS getcol RETURNING VALUE(return) TYPE i.
    METHODS getrow RETURNING VALUE(return) TYPE i.
    METHODS isafter IMPORTING p TYPE REF TO zcl_alint_position RETURNING VALUE(return) TYPE abap_bool.
    METHODS equals IMPORTING p TYPE REF TO zcl_alint_position RETURNING VALUE(return) TYPE abap_bool.
    METHODS isbefore IMPORTING p TYPE REF TO zcl_alint_position RETURNING VALUE(return) TYPE abap_bool.
    METHODS isbetween IMPORTING p1 TYPE REF TO zcl_alint_position p2 TYPE REF TO zcl_alint_position RETURNING VALUE(return) TYPE abap_bool.
  PRIVATE SECTION.
    DATA row TYPE i.
    DATA col TYPE i.
ENDCLASS.

CLASS zcl_alint_position IMPLEMENTATION.
  METHOD constructor.
    me->row = row.
    me->col = col.
  ENDMETHOD.

  METHOD getcol.
    return = me->col.

  ENDMETHOD.

  METHOD getrow.
    return = me->row.

  ENDMETHOD.

  METHOD isafter.
    return = xsdbool( me->row > p->row OR
      ( me->row EQ p->row AND me->col >= p->col ) ).

  ENDMETHOD.

  METHOD equals.
    return = xsdbool( row EQ p->getrow( ) AND col EQ p->getcol( ) ).

  ENDMETHOD.

  METHOD isbefore.
    return = xsdbool( me->row < p->row OR
      ( me->row EQ p->row AND me->col < p->col ) ).

  ENDMETHOD.

  METHOD isbetween.
    return = xsdbool( isafter( p1 ) AND isbefore( p2 ) ).

  ENDMETHOD.

ENDCLASS.
