* auto generated, do not touch
CLASS zcl_alint_virtual_position DEFINITION INHERITING FROM zcl_alint_position PUBLIC.
  PUBLIC SECTION.
    DATA vrow TYPE i.
    DATA vcol TYPE i.
    METHODS constructor IMPORTING virtual TYPE REF TO zcl_alint_position row TYPE i col TYPE i.
    METHODS equals IMPORTING p TYPE REF TO zcl_alint_position RETURNING VALUE(return) TYPE abap_bool.
ENDCLASS.

CLASS zcl_alint_virtual_position IMPLEMENTATION.
  METHOD constructor.
    super->constructor( row = virtual->getrow( ) col = virtual->getcol( ) ).
    me->vrow = row.
    me->vcol = col.
  ENDMETHOD.

  METHOD equals.
    IF NOT ( p IS INSTANCE OF zcl_alint_virtual_position ).
      return = abap_false.
      RETURN.
    ENDIF.
    DATA(casted) = CAST zcl_alint_virtual_position( p ).
    return = xsdbool( super->equals( me ) AND vrow EQ casted->vrow AND vcol EQ casted->vcol ).

  ENDMETHOD.

ENDCLASS.
