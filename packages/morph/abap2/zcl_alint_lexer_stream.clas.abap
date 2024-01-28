* auto generated, do not touch
CLASS zcl_alint_lexer_stream DEFINITION PUBLIC.
  PUBLIC SECTION.
    METHODS constructor.
    METHODS add IMPORTING s TYPE string RETURNING VALUE(return) TYPE string.
    METHODS get RETURNING VALUE(return) TYPE string.
    METHODS clear.
    METHODS countiseven IMPORTING char TYPE string RETURNING VALUE(return) TYPE abap_bool.
  PRIVATE SECTION.
    DATA buf TYPE string.
ENDCLASS.

CLASS zcl_alint_lexer_stream IMPLEMENTATION.
  METHOD constructor.
    me->buf = ||.
  ENDMETHOD.

  METHOD add.
    me->buf = me->buf && s.
    return = me->buf.

  ENDMETHOD.

  METHOD get.
    return = me->buf.

  ENDMETHOD.

  METHOD clear.
    me->buf = ||.
  ENDMETHOD.

  METHOD countiseven.
    DATA(count) = 0.
    DATA(i) = 0.
    WHILE i < strlen( buf ).
      IF substring( val = buf len = 1 off = i ) EQ char.
        count += 1.
      ENDIF.
      i += 1.
    ENDWHILE.
    return = xsdbool( count MOD 2 EQ 0 ).

  ENDMETHOD.

ENDCLASS.
