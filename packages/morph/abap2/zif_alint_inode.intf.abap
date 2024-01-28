* auto generated, do not touch
INTERFACE zif_alint_inode PUBLIC.
  METHODS addchild IMPORTING n TYPE REF TO zif_alint_inode.
  TYPES ty1 TYPE STANDARD TABLE OF REF TO zif_alint_inode WITH EMPTY KEY.
  METHODS setchildren IMPORTING children TYPE ty1.
  TYPES ty2 TYPE STANDARD TABLE OF REF TO zif_alint_inode WITH EMPTY KEY.
  METHODS getchildren RETURNING VALUE(return) TYPE ty2.
  METHODS get RETURNING VALUE(return) TYPE REF TO object.
  METHODS getfirsttoken RETURNING VALUE(return) TYPE REF TO zcl_alint_abstract_token.
  METHODS getlasttoken RETURNING VALUE(return) TYPE REF TO zcl_alint_abstract_token.
ENDINTERFACE.
