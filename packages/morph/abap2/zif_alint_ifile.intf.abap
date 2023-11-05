* auto generated, do not touch
INTERFACE zif_alint_ifile PUBLIC.
  METHODS getfilename RETURNING VALUE(return) TYPE string.
  METHODS getobjecttype RETURNING VALUE(return) TYPE string.
  METHODS getobjectname RETURNING VALUE(return) TYPE string.
  METHODS getraw RETURNING VALUE(return) TYPE string.
  METHODS getrawrows RETURNING VALUE(return) TYPE string_table.
ENDINTERFACE.

