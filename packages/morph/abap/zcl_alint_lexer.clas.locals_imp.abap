* auto generated, do not touch
CLASS position DEFINITION.
  PUBLIC SECTION.
    METHODS constructor IMPORTING row TYPE i col TYPE i.
    METHODS getcol RETURNING VALUE(return) TYPE i.
    METHODS getrow RETURNING VALUE(return) TYPE i.
    METHODS isafter IMPORTING p TYPE REF TO position RETURNING VALUE(return) TYPE abap_bool.
    METHODS equals IMPORTING p TYPE REF TO position RETURNING VALUE(return) TYPE abap_bool.
    METHODS isbefore IMPORTING p TYPE REF TO position RETURNING VALUE(return) TYPE abap_bool.
    METHODS isbetween IMPORTING p1 TYPE REF TO position p2 TYPE REF TO position RETURNING VALUE(return) TYPE abap_bool.
  PRIVATE SECTION.
    DATA row TYPE i.
    DATA col TYPE i.
ENDCLASS.

CLASS position IMPLEMENTATION.
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
    return = xsdbool( me->row EQ p->getrow( ) AND me->col EQ p->getcol( ) ).

  ENDMETHOD.

  METHOD isbefore.
    return = xsdbool( me->row < p->row OR
      ( me->row EQ p->row AND me->col < p->col ) ).

  ENDMETHOD.

  METHOD isbetween.
    return = xsdbool( me->isafter( p1 ) AND me->isbefore( p2 ) ).

  ENDMETHOD.

ENDCLASS.
CLASS virtualposition DEFINITION INHERITING FROM position.
  PUBLIC SECTION.
    DATA vrow TYPE i.
    DATA vcol TYPE i.
    METHODS constructor IMPORTING virtual TYPE REF TO position row TYPE i col TYPE i.
    METHODS equals REDEFINITION.
ENDCLASS.

CLASS virtualposition IMPLEMENTATION.
  METHOD constructor.
    super->constructor( row = virtual->getrow( ) col = virtual->getcol( ) ).
    me->vrow = row.
    me->vcol = col.
  ENDMETHOD.

  METHOD equals.
    IF NOT ( p IS INSTANCE OF virtualposition ).
      return = abap_false.
      RETURN.
    ENDIF.
    DATA(casted) = CAST virtualposition( p ).
    return = xsdbool( super->equals( me ) AND me->vrow EQ casted->vrow AND me->vcol EQ casted->vcol ).

  ENDMETHOD.

ENDCLASS.
CLASS token DEFINITION ABSTRACT.
  PUBLIC SECTION.
    METHODS constructor IMPORTING start TYPE REF TO position str TYPE string.
    METHODS getstr RETURNING VALUE(return) TYPE string.
    METHODS getrow RETURNING VALUE(return) TYPE i.
    METHODS getcol RETURNING VALUE(return) TYPE i.
    METHODS getstart RETURNING VALUE(return) TYPE REF TO position.
    METHODS getend RETURNING VALUE(return) TYPE REF TO position.
  PRIVATE SECTION.
    DATA start TYPE REF TO position.
    DATA str TYPE string.
ENDCLASS.

CLASS token IMPLEMENTATION.
  METHOD constructor.
    me->start = start.
    me->str = str.
  ENDMETHOD.

  METHOD getstr.
    return = me->str.

  ENDMETHOD.

  METHOD getrow.
    return = me->start->getrow( ).

  ENDMETHOD.

  METHOD getcol.
    return = me->start->getcol( ).

  ENDMETHOD.

  METHOD getstart.
    return = me->start.

  ENDMETHOD.

  METHOD getend.
    return = NEW position( row = me->start->getrow( ) col = me->start->getcol( ) + strlen( me->str ) ).

  ENDMETHOD.

ENDCLASS.
CLASS at DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS at IMPLEMENTATION.
  METHOD railroad.
    return = |@|.

  ENDMETHOD.

ENDCLASS.
CLASS wat DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS wat IMPLEMENTATION.
  METHOD railroad.
    return = | @|.

  ENDMETHOD.

ENDCLASS.
CLASS atw DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS atw IMPLEMENTATION.
  METHOD railroad.
    return = |@ |.

  ENDMETHOD.

ENDCLASS.
CLASS watw DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS watw IMPLEMENTATION.
  METHOD railroad.
    return = | @ |.

  ENDMETHOD.

ENDCLASS.
CLASS bracketleft DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS bracketleft IMPLEMENTATION.
  METHOD railroad.
    return = |[|.

  ENDMETHOD.

ENDCLASS.
CLASS wbracketleft DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS wbracketleft IMPLEMENTATION.
  METHOD railroad.
    return = | [|.

  ENDMETHOD.

ENDCLASS.
CLASS bracketleftw DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS bracketleftw IMPLEMENTATION.
  METHOD railroad.
    return = |[ |.

  ENDMETHOD.

ENDCLASS.
CLASS wbracketleftw DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS wbracketleftw IMPLEMENTATION.
  METHOD railroad.
    return = | [ |.

  ENDMETHOD.

ENDCLASS.
CLASS bracketright DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS bracketright IMPLEMENTATION.
  METHOD railroad.
    return = |]|.

  ENDMETHOD.

ENDCLASS.
CLASS wbracketright DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS wbracketright IMPLEMENTATION.
  METHOD railroad.
    return = | ]|.

  ENDMETHOD.

ENDCLASS.
CLASS bracketrightw DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS bracketrightw IMPLEMENTATION.
  METHOD railroad.
    return = |] |.

  ENDMETHOD.

ENDCLASS.
CLASS wbracketrightw DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS wbracketrightw IMPLEMENTATION.
  METHOD railroad.
    return = | ] |.

  ENDMETHOD.

ENDCLASS.
CLASS colon DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
ENDCLASS.

CLASS colon IMPLEMENTATION.
ENDCLASS.
CLASS comment DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
ENDCLASS.

CLASS comment IMPLEMENTATION.
ENDCLASS.
CLASS dash DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS dash IMPLEMENTATION.
  METHOD railroad.
    return = |-|.

  ENDMETHOD.

ENDCLASS.
CLASS wdash DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS wdash IMPLEMENTATION.
  METHOD railroad.
    return = | -|.

  ENDMETHOD.

ENDCLASS.
CLASS dashw DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS dashw IMPLEMENTATION.
  METHOD railroad.
    return = |- |.

  ENDMETHOD.

ENDCLASS.
CLASS wdashw DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS wdashw IMPLEMENTATION.
  METHOD railroad.
    return = | - |.

  ENDMETHOD.

ENDCLASS.
CLASS identifier DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
ENDCLASS.

CLASS identifier IMPLEMENTATION.
ENDCLASS.
CLASS instancearrow DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS instancearrow IMPLEMENTATION.
  METHOD railroad.
    return = |->|.

  ENDMETHOD.

ENDCLASS.
CLASS winstancearrow DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS winstancearrow IMPLEMENTATION.
  METHOD railroad.
    return = | ->|.

  ENDMETHOD.

ENDCLASS.
CLASS instancearroww DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS instancearroww IMPLEMENTATION.
  METHOD railroad.
    return = |-> |.

  ENDMETHOD.

ENDCLASS.
CLASS winstancearroww DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS winstancearroww IMPLEMENTATION.
  METHOD railroad.
    return = | -> |.

  ENDMETHOD.

ENDCLASS.
CLASS parenleft DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS parenleft IMPLEMENTATION.
  METHOD railroad.
    return = |(|.

  ENDMETHOD.

ENDCLASS.
CLASS wparenleft DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS wparenleft IMPLEMENTATION.
  METHOD railroad.
    return = | (|.

  ENDMETHOD.

ENDCLASS.
CLASS parenleftw DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS parenleftw IMPLEMENTATION.
  METHOD railroad.
    return = |( |.

  ENDMETHOD.

ENDCLASS.
CLASS wparenleftw DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS wparenleftw IMPLEMENTATION.
  METHOD railroad.
    return = | ( |.

  ENDMETHOD.

ENDCLASS.
CLASS parenright DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS parenright IMPLEMENTATION.
  METHOD railroad.
    return = |)|.

  ENDMETHOD.

ENDCLASS.
CLASS wparenright DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS wparenright IMPLEMENTATION.
  METHOD railroad.
    return = | )|.

  ENDMETHOD.

ENDCLASS.
CLASS parenrightw DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS parenrightw IMPLEMENTATION.
  METHOD railroad.
    return = |) |.

  ENDMETHOD.

ENDCLASS.
CLASS wparenrightw DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS wparenrightw IMPLEMENTATION.
  METHOD railroad.
    return = | ) |.

  ENDMETHOD.

ENDCLASS.
CLASS plus DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS plus IMPLEMENTATION.
  METHOD railroad.
    return = |+|.

  ENDMETHOD.

ENDCLASS.
CLASS wplus DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS wplus IMPLEMENTATION.
  METHOD railroad.
    return = | +|.

  ENDMETHOD.

ENDCLASS.
CLASS plusw DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS plusw IMPLEMENTATION.
  METHOD railroad.
    return = |+ |.

  ENDMETHOD.

ENDCLASS.
CLASS wplusw DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS wplusw IMPLEMENTATION.
  METHOD railroad.
    return = | + |.

  ENDMETHOD.

ENDCLASS.
CLASS pragma DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
ENDCLASS.

CLASS pragma IMPLEMENTATION.
ENDCLASS.
CLASS punctuation DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
ENDCLASS.

CLASS punctuation IMPLEMENTATION.
ENDCLASS.
CLASS staticarrow DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS staticarrow IMPLEMENTATION.
  METHOD railroad.
    return = |=>|.

  ENDMETHOD.

ENDCLASS.
CLASS wstaticarrow DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS wstaticarrow IMPLEMENTATION.
  METHOD railroad.
    return = | =>|.

  ENDMETHOD.

ENDCLASS.
CLASS staticarroww DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS staticarroww IMPLEMENTATION.
  METHOD railroad.
    return = |=> |.

  ENDMETHOD.

ENDCLASS.
CLASS wstaticarroww DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS wstaticarroww IMPLEMENTATION.
  METHOD railroad.
    return = | => |.

  ENDMETHOD.

ENDCLASS.
CLASS stringtoken DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
ENDCLASS.

CLASS stringtoken IMPLEMENTATION.
ENDCLASS.
CLASS stringtemplate DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
ENDCLASS.

CLASS stringtemplate IMPLEMENTATION.
ENDCLASS.
CLASS stringtemplatebegin DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
ENDCLASS.

CLASS stringtemplatebegin IMPLEMENTATION.
ENDCLASS.
CLASS stringtemplateend DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
ENDCLASS.

CLASS stringtemplateend IMPLEMENTATION.
ENDCLASS.
CLASS stringtemplatemiddle DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
ENDCLASS.

CLASS stringtemplatemiddle IMPLEMENTATION.
ENDCLASS.
INTERFACE ifile.
  METHODS getfilename RETURNING VALUE(return) TYPE string.
  METHODS getobjecttype RETURNING VALUE(return) TYPE string.
  METHODS getobjectname RETURNING VALUE(return) TYPE string.
  METHODS getraw RETURNING VALUE(return) TYPE string.
  METHODS getrawrows RETURNING VALUE(return) TYPE string_table.
ENDINTERFACE.

CLASS abstractfile DEFINITION ABSTRACT.
  PUBLIC SECTION.
    INTERFACES ifile.
    METHODS constructor IMPORTING filename TYPE string.
    ALIASES getfilename FOR ifile~getfilename.
    ALIASES getobjecttype FOR ifile~getobjecttype.
    ALIASES getobjectname FOR ifile~getobjectname.
    ALIASES getraw FOR ifile~getraw.
    ALIASES getrawrows FOR ifile~getrawrows.
  PRIVATE SECTION.
    DATA filename TYPE string.
    METHODS basename RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS abstractfile IMPLEMENTATION.
  METHOD constructor.
    me->filename = filename.
  ENDMETHOD.

  METHOD ifile~getfilename.
    return = me->filename.

  ENDMETHOD.

  METHOD basename.
    DATA(first) = REDUCE string_table( LET split_input = me->getfilename( )
      split_by    = |\\|
      offset      = 0
      IN
      INIT string_result = VALUE string_table( )
       add = ||
      FOR index1 = 0 WHILE index1 <= strlen( split_input )
      NEXT
      string_result = COND #(
      WHEN index1 = strlen( split_input ) OR split_input+index1(1) = split_by
      THEN VALUE #( BASE string_result ( add ) )
      ELSE string_result )
      add    = COND #(
      WHEN index1 = strlen( split_input ) OR split_input+index1(1) = split_by
      THEN ||
      ELSE |{ add }{ split_input+index1(1) }| ) ).
    DATA(base1) = first[ lines( first ) - 1 + 1 ].
    DATA(base2) = REDUCE string_table( LET split_input = base1
      split_by    = |/|
      offset      = 0
      IN
      INIT string_result = VALUE string_table( )
       add = ||
      FOR index2 = 0 WHILE index2 <= strlen( split_input )
      NEXT
      string_result = COND #(
      WHEN index2 = strlen( split_input ) OR split_input+index2(1) = split_by
      THEN VALUE #( BASE string_result ( add ) )
      ELSE string_result )
      add    = COND #(
      WHEN index2 = strlen( split_input ) OR split_input+index2(1) = split_by
      THEN ||
      ELSE |{ add }{ split_input+index2(1) }| ) ).
    return = base2[ lines( base2 ) - 1 + 1 ].

  ENDMETHOD.

  METHOD ifile~getobjecttype.
    DATA(split) = REDUCE string_table( LET split_input = me->basename( )
      split_by    = |.|
      offset      = 0
      IN
      INIT string_result = VALUE string_table( )
       add = ||
      FOR index3 = 0 WHILE index3 <= strlen( split_input )
      NEXT
      string_result = COND #(
      WHEN index3 = strlen( split_input ) OR split_input+index3(1) = split_by
      THEN VALUE #( BASE string_result ( add ) )
      ELSE string_result )
      add    = COND #(
      WHEN index3 = strlen( split_input ) OR split_input+index3(1) = split_by
      THEN ||
      ELSE |{ add }{ split_input+index3(1) }| ) ).
    return = to_upper( val = split[ 1 + 1 ] ).

  ENDMETHOD.

  METHOD ifile~getobjectname.
    DATA(split) = REDUCE string_table( LET split_input = me->basename( )
      split_by    = |.|
      offset      = 0
      IN
      INIT string_result = VALUE string_table( )
       add = ||
      FOR index4 = 0 WHILE index4 <= strlen( split_input )
      NEXT
      string_result = COND #(
      WHEN index4 = strlen( split_input ) OR split_input+index4(1) = split_by
      THEN VALUE #( BASE string_result ( add ) )
      ELSE string_result )
      add    = COND #(
      WHEN index4 = strlen( split_input ) OR split_input+index4(1) = split_by
      THEN ||
      ELSE |{ add }{ split_input+index4(1) }| ) ).
    split[ 0 + 1 ] = replace( val = split[ 0 + 1 ] regex = |%23| with = |#| ).
    split[ 0 + 1 ] = replace( val = split[ 0 + 1 ] regex = |%3e| with = |>| ).
    split[ 0 + 1 ] = replace( val = split[ 0 + 1 ] regex = |%3c| with = |<| ).
    split[ 0 + 1 ] = replace( val = to_upper( val = split[ 0 + 1 ] ) regex = |#| with = |/| ).
    split[ 0 + 1 ] = replace( val = split[ 0 + 1 ] regex = |(| with = |/| ).
    split[ 0 + 1 ] = replace( val = split[ 0 + 1 ] regex = |)| with = |/| ).
    return = split[ 0 + 1 ].

  ENDMETHOD.

  METHOD ifile~getraw.
  ENDMETHOD.

  METHOD ifile~getrawrows.
  ENDMETHOD.

ENDCLASS.