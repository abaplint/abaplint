* auto generated, do not touch
CLASS zcl_alint_at DEFINITION INHERITING FROM zcl_alint_abstract_token PUBLIC.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS zcl_alint_at IMPLEMENTATION.
  METHOD railroad.
    return = |@|.

  ENDMETHOD.

ENDCLASS.
