* auto generated, do not touch
CLASS zcl_alint_lexer_buffer DEFINITION PUBLIC.
  PUBLIC SECTION.
    METHODS constructor IMPORTING raw TYPE string.
    METHODS advance RETURNING VALUE(return) TYPE abap_bool.
    METHODS getcol RETURNING VALUE(return) TYPE i.
    METHODS getrow RETURNING VALUE(return) TYPE i.
    METHODS prevchar RETURNING VALUE(return) TYPE string.
    METHODS prevprevchar RETURNING VALUE(return) TYPE string.
    METHODS currentchar RETURNING VALUE(return) TYPE string.
    METHODS nextchar RETURNING VALUE(return) TYPE string.
    METHODS nextnextchar RETURNING VALUE(return) TYPE string.
    METHODS getraw RETURNING VALUE(return) TYPE string.
    METHODS getoffset RETURNING VALUE(return) TYPE i.
  PRIVATE SECTION.
    DATA raw TYPE string.
    DATA offset TYPE i VALUE -1.
    DATA row TYPE i.
    DATA col TYPE i.
ENDCLASS.

CLASS zcl_alint_lexer_buffer IMPLEMENTATION.
  METHOD constructor.
    me->raw = raw.
    me->row = 0.
    me->col = 0.
  ENDMETHOD.

  METHOD advance.
    IF currentchar( ) EQ |\n|.
      me->col = 1.
      me->row = me->row + 1.
    ENDIF.
    IF offset EQ strlen( raw ).
      return = abap_false.
      RETURN.
    ENDIF.
    me->col = me->col + 1.
    me->offset = me->offset + 1.
    return = abap_true.

  ENDMETHOD.

  METHOD getcol.
    return = me->col.

  ENDMETHOD.

  METHOD getrow.
    return = me->row.

  ENDMETHOD.

  METHOD prevchar.
    IF me->offset - 1 < 0.
      return = ||.
      RETURN.
    ENDIF.
    return = substring( val = raw off = offset - 1 len = 1 ).

  ENDMETHOD.

  METHOD prevprevchar.
    IF me->offset - 2 < 0.
      return = ||.
      RETURN.
    ENDIF.
    return = substring( val = raw off = offset - 2 len = 2 ).

  ENDMETHOD.

  METHOD currentchar.
    IF me->offset < 0.
      return = |\n|.
      RETURN.
    ELSEIF offset >= strlen( raw ).
      return = ||.
      RETURN.

    ENDIF.
    return = substring( val = raw off = offset len = 1 ).

  ENDMETHOD.

  METHOD nextchar.
    IF offset + 2 > strlen( raw ).
      return = ||.
      RETURN.
    ENDIF.
    return = substring( val = raw off = offset + 1 len = 1 ).

  ENDMETHOD.

  METHOD nextnextchar.
    IF offset + 3 > strlen( raw ).
      return = nextchar( ).
      RETURN.
    ENDIF.
    return = substring( val = raw off = offset + 1 len = 2 ).

  ENDMETHOD.

  METHOD getraw.
    return = me->raw.

  ENDMETHOD.

  METHOD getoffset.
    return = me->offset.

  ENDMETHOD.

ENDCLASS.
