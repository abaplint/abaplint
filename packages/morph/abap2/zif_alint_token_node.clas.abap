* auto generated, do not touch
CLASS zif_alint_token_node DEFINITION PUBLIC.
  PUBLIC SECTION.
    INTERFACES zif_alint_inode.
    METHODS constructor IMPORTING token TYPE REF TO zcl_alint_abstract_token.
    ALIASES addchild FOR zif_alint_inode~addchild.
    ALIASES setchildren FOR zif_alint_inode~setchildren.
    ALIASES getchildren FOR zif_alint_inode~getchildren.
    METHODS concattokens RETURNING VALUE(return) TYPE string.
    ALIASES get FOR zif_alint_inode~get.
    METHODS counttokens RETURNING VALUE(return) TYPE i.
    ALIASES getfirsttoken FOR zif_alint_inode~getfirsttoken.
    ALIASES getlasttoken FOR zif_alint_inode~getlasttoken.
  PRIVATE SECTION.
    DATA token TYPE REF TO zcl_alint_abstract_token.
ENDCLASS.

CLASS zif_alint_token_node IMPLEMENTATION.
  METHOD constructor.
    me->token = token.
  ENDMETHOD.

  METHOD zif_alint_inode~addchild.
    ASSERT 1 = 'ThrowStatement'.
  ENDMETHOD.

  METHOD zif_alint_inode~setchildren.
    ASSERT 1 = 'ThrowStatement'.
  ENDMETHOD.

  METHOD zif_alint_inode~getchildren.
    return = VALUE #( ).

  ENDMETHOD.

  METHOD concattokens.
    return = token->getstr( ).

  ENDMETHOD.

  METHOD zif_alint_inode~get.
    return = me->token.

  ENDMETHOD.

  METHOD counttokens.
    return = 1.

  ENDMETHOD.

  METHOD zif_alint_inode~getfirsttoken.
    return = me->token.

  ENDMETHOD.

  METHOD zif_alint_inode~getlasttoken.
    return = me->token.

  ENDMETHOD.

ENDCLASS.
