INTERFACE zif_alint_ddic PUBLIC.
  TYPES BEGIN OF iabaplexerresult.
  TYPES file TYPE REF TO zif_alint_ifile.
  TYPES tokens TYPE STANDARD TABLE OF REF TO zcl_alint_abstract_token WITH EMPTY KEY.
  TYPES END OF iabaplexerresult.
ENDINTERFACE.
