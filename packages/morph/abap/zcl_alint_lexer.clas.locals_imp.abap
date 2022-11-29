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

CLASS Position IMPLEMENTATION.
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
  PRIVATE SECTION.
    DATA virtual TYPE REF TO position.
ENDCLASS.

CLASS VirtualPosition IMPLEMENTATION.
  METHOD constructor.
    super->constructor( row = virtual->getrow( ) col = virtual->getcol( ) ).
    me->virtual = virtual.
    me->vrow = row.
    me->vcol = col.
  ENDMETHOD.

  METHOD equals.
    IF NOT ( p IS INSTANCE OF virtualposition ).
      return = abap_false.
      RETURN.
    ENDIF.
    DATA(bar) = CAST virtualposition( p ).
    return = xsdbool( super->equals( me->virtual ) AND me->vrow EQ bar->vrow AND me->vcol EQ bar->vcol ).
    
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

CLASS Token IMPLEMENTATION.
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

CLASS At IMPLEMENTATION.
  METHOD railroad.
    return = |@|.
    
  ENDMETHOD.

ENDCLASS.
CLASS wat DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS WAt IMPLEMENTATION.
  METHOD railroad.
    return = | @|.
    
  ENDMETHOD.

ENDCLASS.
CLASS atw DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS AtW IMPLEMENTATION.
  METHOD railroad.
    return = |@ |.
    
  ENDMETHOD.

ENDCLASS.
CLASS watw DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS WAtW IMPLEMENTATION.
  METHOD railroad.
    return = | @ |.
    
  ENDMETHOD.

ENDCLASS.
CLASS bracketleft DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS BracketLeft IMPLEMENTATION.
  METHOD railroad.
    return = |[|.
    
  ENDMETHOD.

ENDCLASS.
CLASS wbracketleft DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS WBracketLeft IMPLEMENTATION.
  METHOD railroad.
    return = | [|.
    
  ENDMETHOD.

ENDCLASS.
CLASS bracketleftw DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS BracketLeftW IMPLEMENTATION.
  METHOD railroad.
    return = |[ |.
    
  ENDMETHOD.

ENDCLASS.
CLASS wbracketleftw DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS WBracketLeftW IMPLEMENTATION.
  METHOD railroad.
    return = | [ |.
    
  ENDMETHOD.

ENDCLASS.
CLASS bracketright DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS BracketRight IMPLEMENTATION.
  METHOD railroad.
    return = |]|.
    
  ENDMETHOD.

ENDCLASS.
CLASS wbracketright DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS WBracketRight IMPLEMENTATION.
  METHOD railroad.
    return = | ]|.
    
  ENDMETHOD.

ENDCLASS.
CLASS bracketrightw DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS BracketRightW IMPLEMENTATION.
  METHOD railroad.
    return = |] |.
    
  ENDMETHOD.

ENDCLASS.
CLASS wbracketrightw DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS WBracketRightW IMPLEMENTATION.
  METHOD railroad.
    return = | ] |.
    
  ENDMETHOD.

ENDCLASS.
CLASS colon DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
ENDCLASS.

CLASS Colon IMPLEMENTATION.
ENDCLASS.
CLASS comment DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
ENDCLASS.

CLASS Comment IMPLEMENTATION.
ENDCLASS.
CLASS dash DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS Dash IMPLEMENTATION.
  METHOD railroad.
    return = |-|.
    
  ENDMETHOD.

ENDCLASS.
CLASS wdash DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS WDash IMPLEMENTATION.
  METHOD railroad.
    return = | -|.
    
  ENDMETHOD.

ENDCLASS.
CLASS dashw DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS DashW IMPLEMENTATION.
  METHOD railroad.
    return = |- |.
    
  ENDMETHOD.

ENDCLASS.
CLASS wdashw DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS WDashW IMPLEMENTATION.
  METHOD railroad.
    return = | - |.
    
  ENDMETHOD.

ENDCLASS.
CLASS identifier DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
ENDCLASS.

CLASS Identifier IMPLEMENTATION.
ENDCLASS.
CLASS instancearrow DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS InstanceArrow IMPLEMENTATION.
  METHOD railroad.
    return = |->|.
    
  ENDMETHOD.

ENDCLASS.
CLASS winstancearrow DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS WInstanceArrow IMPLEMENTATION.
  METHOD railroad.
    return = | ->|.
    
  ENDMETHOD.

ENDCLASS.
CLASS instancearroww DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS InstanceArrowW IMPLEMENTATION.
  METHOD railroad.
    return = |-> |.
    
  ENDMETHOD.

ENDCLASS.
CLASS winstancearroww DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS WInstanceArrowW IMPLEMENTATION.
  METHOD railroad.
    return = | -> |.
    
  ENDMETHOD.

ENDCLASS.
CLASS parenleft DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS ParenLeft IMPLEMENTATION.
  METHOD railroad.
    return = |(|.
    
  ENDMETHOD.

ENDCLASS.
CLASS wparenleft DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS WParenLeft IMPLEMENTATION.
  METHOD railroad.
    return = | (|.
    
  ENDMETHOD.

ENDCLASS.
CLASS parenleftw DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS ParenLeftW IMPLEMENTATION.
  METHOD railroad.
    return = |( |.
    
  ENDMETHOD.

ENDCLASS.
CLASS wparenleftw DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS WParenLeftW IMPLEMENTATION.
  METHOD railroad.
    return = | ( |.
    
  ENDMETHOD.

ENDCLASS.
CLASS parenright DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS ParenRight IMPLEMENTATION.
  METHOD railroad.
    return = |)|.
    
  ENDMETHOD.

ENDCLASS.
CLASS wparenright DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS WParenRight IMPLEMENTATION.
  METHOD railroad.
    return = | )|.
    
  ENDMETHOD.

ENDCLASS.
CLASS parenrightw DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS ParenRightW IMPLEMENTATION.
  METHOD railroad.
    return = |) |.
    
  ENDMETHOD.

ENDCLASS.
CLASS wparenrightw DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS WParenRightW IMPLEMENTATION.
  METHOD railroad.
    return = | ) |.
    
  ENDMETHOD.

ENDCLASS.
CLASS plus DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS Plus IMPLEMENTATION.
  METHOD railroad.
    return = |+|.
    
  ENDMETHOD.

ENDCLASS.
CLASS wplus DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS WPlus IMPLEMENTATION.
  METHOD railroad.
    return = | +|.
    
  ENDMETHOD.

ENDCLASS.
CLASS plusw DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS PlusW IMPLEMENTATION.
  METHOD railroad.
    return = |+ |.
    
  ENDMETHOD.

ENDCLASS.
CLASS wplusw DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS WPlusW IMPLEMENTATION.
  METHOD railroad.
    return = | + |.
    
  ENDMETHOD.

ENDCLASS.
CLASS pragma DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
ENDCLASS.

CLASS Pragma IMPLEMENTATION.
ENDCLASS.
CLASS punctuation DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
ENDCLASS.

CLASS Punctuation IMPLEMENTATION.
ENDCLASS.
CLASS staticarrow DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS StaticArrow IMPLEMENTATION.
  METHOD railroad.
    return = |=>|.
    
  ENDMETHOD.

ENDCLASS.
CLASS wstaticarrow DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS WStaticArrow IMPLEMENTATION.
  METHOD railroad.
    return = | =>|.
    
  ENDMETHOD.

ENDCLASS.
CLASS staticarroww DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS StaticArrowW IMPLEMENTATION.
  METHOD railroad.
    return = |=> |.
    
  ENDMETHOD.

ENDCLASS.
CLASS wstaticarroww DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
    CLASS-METHODS railroad RETURNING VALUE(return) TYPE string.
ENDCLASS.

CLASS WStaticArrowW IMPLEMENTATION.
  METHOD railroad.
    return = | => |.
    
  ENDMETHOD.

ENDCLASS.
CLASS stringtoken DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
ENDCLASS.

CLASS StringToken IMPLEMENTATION.
ENDCLASS.
CLASS stringtemplate DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
ENDCLASS.

CLASS StringTemplate IMPLEMENTATION.
ENDCLASS.
CLASS stringtemplatebegin DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
ENDCLASS.

CLASS StringTemplateBegin IMPLEMENTATION.
ENDCLASS.
CLASS stringtemplateend DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
ENDCLASS.

CLASS StringTemplateEnd IMPLEMENTATION.
ENDCLASS.
CLASS stringtemplatemiddle DEFINITION INHERITING FROM token.
  PUBLIC SECTION.
ENDCLASS.

CLASS StringTemplateMiddle IMPLEMENTATION.
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

CLASS AbstractFile IMPLEMENTATION.
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
    return = replace( val = to_upper( val = split[ 0 + 1 ] ) regex = |#| with = |/| ).
    
  ENDMETHOD.

  METHOD ifile~getraw.
  ENDMETHOD.

  METHOD ifile~getrawrows.
  ENDMETHOD.

ENDCLASS.
CLASS memoryfile DEFINITION INHERITING FROM abstractfile.
  PUBLIC SECTION.
    METHODS constructor IMPORTING filename TYPE string raw TYPE string.
    METHODS getraw REDEFINITION.
    METHODS getrawrows REDEFINITION.
  PRIVATE SECTION.
    DATA raw TYPE string.
ENDCLASS.

CLASS MemoryFile IMPLEMENTATION.
  METHOD constructor.
    super->constructor( filename ).
    me->raw = raw.
  ENDMETHOD.

  METHOD getraw.
    return = me->raw.
    
  ENDMETHOD.

  METHOD getrawrows.
    return = REDUCE string_table( LET split_input = me->raw
      split_by    = |\n|
      offset      = 0
      IN
      INIT string_result = VALUE string_table( )
       add = ||
      FOR index5 = 0 WHILE index5 <= strlen( split_input )
      NEXT
      string_result = COND #(
      WHEN index5 = strlen( split_input ) OR split_input+index5(1) = split_by
      THEN VALUE #( BASE string_result ( add ) )
      ELSE string_result )
      add    = COND #(
      WHEN index5 = strlen( split_input ) OR split_input+index5(1) = split_by
      THEN ||
      ELSE |{ add }{ split_input+index5(1) }| ) ).
    
  ENDMETHOD.

ENDCLASS.
TYPES BEGIN OF iabaplexerresult.
TYPES file TYPE REF TO ifile.
TYPES tokens TYPE STANDARD TABLE OF REF TO token WITH EMPTY KEY.
TYPES END OF iabaplexerresult.
CLASS buffer DEFINITION.
  PUBLIC SECTION.
    METHODS constructor.
    METHODS add IMPORTING s TYPE string.
    METHODS get RETURNING VALUE(return) TYPE string.
    METHODS clear.
    METHODS countiseven IMPORTING char TYPE string RETURNING VALUE(return) TYPE abap_bool.
  PRIVATE SECTION.
    DATA buf TYPE string.
ENDCLASS.

CLASS Buffer IMPLEMENTATION.
  METHOD constructor.
    me->buf = ||.
  ENDMETHOD.

  METHOD add.
    me->buf = me->buf && s.
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
    WHILE i < strlen( me->buf ).
      IF substring( val = me->buf len = 1 off = i ) EQ char.
        count += 1.
      ENDIF.
      i += 1.
    ENDWHILE.
    return = xsdbool( count MOD 2 EQ 0 ).
    
  ENDMETHOD.

ENDCLASS.
CLASS stream DEFINITION.
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

CLASS Stream IMPLEMENTATION.
  METHOD constructor.
    me->raw = raw.
    me->row = 0.
    me->col = 0.
  ENDMETHOD.

  METHOD advance.
    IF me->currentchar( ) EQ |\n|.
      me->col = 1.
      me->row = me->row + 1.
    ENDIF.
    IF me->offset EQ strlen( me->raw ).
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
    return = substring( val = me->raw off = me->offset - 1 len = 1 ).
    
  ENDMETHOD.

  METHOD prevprevchar.
    IF me->offset - 2 < 0.
      return = ||.
      RETURN.
    ENDIF.
    return = substring( val = me->raw off = me->offset - 2 len = 2 ).
    
  ENDMETHOD.

  METHOD currentchar.
    IF me->offset < 0.
      return = |\n|.
      RETURN.
    ELSE.
      IF me->offset >= strlen( me->raw ).
        return = ||.
        RETURN.
      ENDIF.
    ENDIF.
    return = substring( val = me->raw off = me->offset len = 1 ).
    
  ENDMETHOD.

  METHOD nextchar.
    IF me->offset + 2 > strlen( me->raw ).
      return = ||.
      RETURN.
    ENDIF.
    return = substring( val = me->raw off = me->offset + 1 len = 1 ).
    
  ENDMETHOD.

  METHOD nextnextchar.
    IF me->offset + 3 > strlen( me->raw ).
      return = me->nextchar( ).
      RETURN.
    ENDIF.
    return = substring( val = me->raw off = me->offset + 1 len = 2 ).
    
  ENDMETHOD.

  METHOD getraw.
    return = me->raw.
    
  ENDMETHOD.

  METHOD getoffset.
    return = me->offset.
    
  ENDMETHOD.

ENDCLASS.
CLASS lexer DEFINITION.
  PUBLIC SECTION.
    METHODS run IMPORTING file TYPE REF TO ifile virtual TYPE REF TO position OPTIONAL RETURNING VALUE(return) TYPE iabaplexerresult.
  PRIVATE SECTION.
    DATA modenormal TYPE i VALUE 1.
    DATA modeping TYPE i VALUE 2.
    DATA modestr TYPE i VALUE 3.
    DATA modetemplate TYPE i VALUE 4.
    DATA modecomment TYPE i VALUE 5.
    DATA modepragma TYPE i VALUE 6.
    DATA virtual TYPE REF TO position.
    DATA tokens TYPE STANDARD TABLE OF REF TO token WITH EMPTY KEY.
    DATA m TYPE i.
    DATA stream TYPE REF TO stream.
    DATA buffer TYPE REF TO buffer.
    METHODS add.
    METHODS process IMPORTING raw TYPE string.
ENDCLASS.

CLASS Lexer IMPLEMENTATION.
  METHOD run.
    me->virtual = virtual.
    me->tokens = VALUE #( ).
    me->m = me->modenormal.
    me->process( file->getraw( ) ).
    return = VALUE #( file = file tokens = me->tokens ).
    
  ENDMETHOD.

  METHOD add.
    DATA(s) = condense( me->buffer->get( ) ).
    IF strlen( s ) > 0.
      DATA(col) = me->stream->getcol( ).
      DATA(row) = me->stream->getrow( ).
      DATA(whitebefore) = abap_false.
      IF me->stream->getoffset( ) - strlen( s ) >= 0.
        DATA(prev) = substring( val = me->stream->getraw( ) off = me->stream->getoffset( ) - strlen( s ) len = 1 ).
        IF prev EQ | | OR
            prev EQ |\n| OR
            prev EQ |\t| OR
            prev EQ |:|.
          whitebefore = abap_true.
        ENDIF.
      ENDIF.
      DATA(whiteafter) = abap_false.
      DATA(next) = me->stream->nextchar( ).
      IF next EQ | | OR
          next EQ |\n| OR
          next EQ |\t| OR
          next EQ |:| OR
          next EQ |,| OR
          next EQ |.| OR
          next EQ || OR
          next EQ |"|.
        whiteafter = abap_true.
      ENDIF.
      DATA(pos) = NEW position( row = row col = col - strlen( s ) ).
      IF me->virtual IS NOT INITIAL.
        pos = NEW virtualposition( virtual = me->virtual row = pos->getrow( ) col = pos->getcol( ) ).
      ENDIF.
      DATA tok TYPE REF TO token.
      CLEAR tok.
      IF me->m EQ me->modecomment.
        tok = NEW comment( start = pos str = s ).
      ELSE.
        IF me->m EQ me->modeping OR
            me->m EQ me->modestr.
          tok = NEW stringtoken( start = pos str = s ).
        ELSE.
          IF me->m EQ me->modetemplate.
            DATA(first) = substring( val = s len = 1 off = 0 ).
            DATA(last) = substring( val = s len = 1 off = strlen( s ) - 1 ).
            IF first EQ |\|| AND last EQ |\||.
              tok = NEW stringtemplate( start = pos str = s ).
            ELSE.
              IF first EQ |\|| AND last EQ |\{| AND whiteafter EQ abap_true.
                tok = NEW stringtemplatebegin( start = pos str = s ).
              ELSE.
                IF first EQ |\}| AND last EQ |\|| AND whitebefore EQ abap_true.
                  tok = NEW stringtemplateend( start = pos str = s ).
                ELSE.
                  IF first EQ |\}| AND last EQ |\{| AND whiteafter EQ abap_true AND whitebefore EQ abap_true.
                    tok = NEW stringtemplatemiddle( start = pos str = s ).
                  ELSE.
                    tok = NEW identifier( start = pos str = s ).
                  ENDIF.
                ENDIF.
              ENDIF.
            ENDIF.
          ELSE.
            IF strlen( s ) > 2 AND substring( val = s off = 0 len = 2 ) EQ |##|.
              tok = NEW pragma( start = pos str = s ).
            ELSE.
              IF strlen( s ) EQ 1.
                IF s EQ |.| OR
                    s EQ |,|.
                  tok = NEW punctuation( start = pos str = s ).
                ELSE.
                  IF s EQ |[|.
                    IF whitebefore EQ abap_true AND whiteafter EQ abap_true.
                      tok = NEW wbracketleftw( start = pos str = s ).
                    ELSE.
                      IF whitebefore EQ abap_true.
                        tok = NEW wbracketleft( start = pos str = s ).
                      ELSE.
                        IF whiteafter EQ abap_true.
                          tok = NEW bracketleftw( start = pos str = s ).
                        ELSE.
                          tok = NEW bracketleft( start = pos str = s ).
                        ENDIF.
                      ENDIF.
                    ENDIF.
                  ELSE.
                    IF s EQ |(|.
                      IF whitebefore EQ abap_true AND whiteafter EQ abap_true.
                        tok = NEW wparenleftw( start = pos str = s ).
                      ELSE.
                        IF whitebefore EQ abap_true.
                          tok = NEW wparenleft( start = pos str = s ).
                        ELSE.
                          IF whiteafter EQ abap_true.
                            tok = NEW parenleftw( start = pos str = s ).
                          ELSE.
                            tok = NEW parenleft( start = pos str = s ).
                          ENDIF.
                        ENDIF.
                      ENDIF.
                    ELSE.
                      IF s EQ |]|.
                        IF whitebefore EQ abap_true AND whiteafter EQ abap_true.
                          tok = NEW wbracketrightw( start = pos str = s ).
                        ELSE.
                          IF whitebefore EQ abap_true.
                            tok = NEW wbracketright( start = pos str = s ).
                          ELSE.
                            IF whiteafter EQ abap_true.
                              tok = NEW bracketrightw( start = pos str = s ).
                            ELSE.
                              tok = NEW bracketright( start = pos str = s ).
                            ENDIF.
                          ENDIF.
                        ENDIF.
                      ELSE.
                        IF s EQ |)|.
                          IF whitebefore EQ abap_true AND whiteafter EQ abap_true.
                            tok = NEW wparenrightw( start = pos str = s ).
                          ELSE.
                            IF whitebefore EQ abap_true.
                              tok = NEW wparenright( start = pos str = s ).
                            ELSE.
                              IF whiteafter EQ abap_true.
                                tok = NEW parenrightw( start = pos str = s ).
                              ELSE.
                                tok = NEW parenright( start = pos str = s ).
                              ENDIF.
                            ENDIF.
                          ENDIF.
                        ELSE.
                          IF s EQ |-|.
                            IF whitebefore EQ abap_true AND whiteafter EQ abap_true.
                              tok = NEW wdashw( start = pos str = s ).
                            ELSE.
                              IF whitebefore EQ abap_true.
                                tok = NEW wdash( start = pos str = s ).
                              ELSE.
                                IF whiteafter EQ abap_true.
                                  tok = NEW dashw( start = pos str = s ).
                                ELSE.
                                  tok = NEW dash( start = pos str = s ).
                                ENDIF.
                              ENDIF.
                            ENDIF.
                          ELSE.
                            IF s EQ |+|.
                              IF whitebefore EQ abap_true AND whiteafter EQ abap_true.
                                tok = NEW wplusw( start = pos str = s ).
                              ELSE.
                                IF whitebefore EQ abap_true.
                                  tok = NEW wplus( start = pos str = s ).
                                ELSE.
                                  IF whiteafter EQ abap_true.
                                    tok = NEW plusw( start = pos str = s ).
                                  ELSE.
                                    tok = NEW plus( start = pos str = s ).
                                  ENDIF.
                                ENDIF.
                              ENDIF.
                            ELSE.
                              IF s EQ |@|.
                                IF whitebefore EQ abap_true AND whiteafter EQ abap_true.
                                  tok = NEW watw( start = pos str = s ).
                                ELSE.
                                  IF whitebefore EQ abap_true.
                                    tok = NEW wat( start = pos str = s ).
                                  ELSE.
                                    IF whiteafter EQ abap_true.
                                      tok = NEW atw( start = pos str = s ).
                                    ELSE.
                                      tok = NEW at( start = pos str = s ).
                                    ENDIF.
                                  ENDIF.
                                ENDIF.
                              ENDIF.
                            ENDIF.
                          ENDIF.
                        ENDIF.
                      ENDIF.
                    ENDIF.
                  ENDIF.
                ENDIF.
              ELSE.
                IF strlen( s ) EQ 2.
                  IF s EQ |->|.
                    IF whitebefore EQ abap_true AND whiteafter EQ abap_true.
                      tok = NEW winstancearroww( start = pos str = s ).
                    ELSE.
                      IF whitebefore EQ abap_true.
                        tok = NEW winstancearrow( start = pos str = s ).
                      ELSE.
                        IF whiteafter EQ abap_true.
                          tok = NEW instancearroww( start = pos str = s ).
                        ELSE.
                          tok = NEW instancearrow( start = pos str = s ).
                        ENDIF.
                      ENDIF.
                    ENDIF.
                  ELSE.
                    IF s EQ |=>|.
                      IF whitebefore EQ abap_true AND whiteafter EQ abap_true.
                        tok = NEW wstaticarroww( start = pos str = s ).
                      ELSE.
                        IF whitebefore EQ abap_true.
                          tok = NEW wstaticarrow( start = pos str = s ).
                        ELSE.
                          IF whiteafter EQ abap_true.
                            tok = NEW staticarroww( start = pos str = s ).
                          ELSE.
                            tok = NEW staticarrow( start = pos str = s ).
                          ENDIF.
                        ENDIF.
                      ENDIF.
                    ENDIF.
                  ENDIF.
                ENDIF.
              ENDIF.
            ENDIF.
          ENDIF.
        ENDIF.
      ENDIF.
      IF tok IS INITIAL.
        tok = NEW identifier( start = pos str = s ).
      ENDIF.
      me->tokens = VALUE #( BASE me->tokens ( tok ) ).
    ENDIF.
    me->buffer->clear( ).
  ENDMETHOD.

  METHOD process.
    me->stream = NEW stream( raw = replace( val = raw regex = |\r| with = || ) ).
    me->buffer = NEW buffer( ).
    DO.
      DATA(current) = me->stream->currentchar( ).
      me->buffer->add( current ).
      DATA(buf) = me->buffer->get( ).
      DATA(ahead) = me->stream->nextchar( ).
      DATA(aahead) = me->stream->nextnextchar( ).
      DATA(prev) = me->stream->prevchar( ).
      IF ahead EQ |'| AND me->m EQ me->modenormal.
        me->add( ).
        me->m = me->modestr.
      ELSE.
        IF ( ahead EQ |\|| OR
            ahead EQ |\}| ) AND me->m EQ me->modenormal.
          me->add( ).
          me->m = me->modetemplate.
        ELSE.
          IF ahead EQ |`| AND me->m EQ me->modenormal.
            me->add( ).
            me->m = me->modeping.
          ELSE.
            IF aahead EQ |##| AND me->m EQ me->modenormal.
              me->add( ).
              me->m = me->modepragma.
            ELSE.
              IF ( ahead EQ |"| OR
                  ( ahead EQ |*| AND current EQ |\n| ) ) AND me->m EQ me->modenormal.
                me->add( ).
                me->m = me->modecomment.
              ELSE.
                IF me->m EQ me->modepragma AND ( ahead EQ |,| OR
                    ahead EQ |:| OR
                    ahead EQ |.| OR
                    ahead EQ | | OR
                    ahead EQ |\n| ).
                  me->add( ).
                  me->m = me->modenormal.
                ELSE.
                  IF me->m EQ me->modeping AND strlen( buf ) > 1 AND current EQ |`| AND aahead NE |``| AND ahead NE |`| AND me->buffer->countiseven( |`| ).
                    me->add( ).
                    IF ahead EQ |"|.
                      me->m = me->modecomment.
                    ELSE.
                      me->m = me->modenormal.
                    ENDIF.
                  ELSE.
                    IF me->m EQ me->modetemplate AND strlen( buf ) > 1 AND ( current EQ |\|| OR
                        current EQ |\{| ) AND ( prev NE |\\| OR
                        me->stream->prevprevchar( ) EQ |\\\\| ).
                      me->add( ).
                      me->m = me->modenormal.
                    ELSE.
                      IF me->m EQ me->modestr AND current EQ |'| AND strlen( buf ) > 1 AND aahead NE |''| AND ahead NE |'| AND me->buffer->countiseven( |'| ).
                        me->add( ).
                        IF ahead EQ |"|.
                          me->m = me->modecomment.
                        ELSE.
                          me->m = me->modenormal.
                        ENDIF.
                      ELSE.
                        IF me->m EQ me->modenormal AND ( ahead EQ | | OR
                            ahead EQ |:| OR
                            ahead EQ |.| OR
                            ahead EQ |,| OR
                            ahead EQ |-| OR
                            ahead EQ |+| OR
                            ahead EQ |(| OR
                            ahead EQ |)| OR
                            ahead EQ |[| OR
                            ahead EQ |]| OR
                            ( ahead EQ |@| AND strlen( condense( buf ) ) EQ 0 ) OR
                            aahead EQ |->| OR
                            aahead EQ |=>| OR
                            ahead EQ |\t| OR
                            ahead EQ |\n| ).
                          me->add( ).
                        ELSE.
                          IF ahead EQ |\n| AND me->m NE me->modetemplate.
                            me->add( ).
                            me->m = me->modenormal.
                          ELSE.
                            IF me->m EQ me->modetemplate AND current EQ |\n|.
                              me->add( ).
                            ELSE.
                              IF current EQ |>| AND ( prev EQ |-| OR
                                  prev EQ |=| ) AND ahead NE | | AND me->m EQ me->modenormal.
                                me->add( ).
                              ELSE.
                                IF me->m EQ me->modenormal AND ( buf EQ |.| OR
                                    buf EQ |,| OR
                                    buf EQ |:| OR
                                    buf EQ |(| OR
                                    buf EQ |)| OR
                                    buf EQ |[| OR
                                    buf EQ |]| OR
                                    buf EQ |+| OR
                                    buf EQ |@| OR
                                    ( buf EQ |-| AND ahead NE |>| ) ).
                                  me->add( ).
                                ENDIF.
                              ENDIF.
                            ENDIF.
                          ENDIF.
                        ENDIF.
                      ENDIF.
                    ENDIF.
                  ENDIF.
                ENDIF.
              ENDIF.
            ENDIF.
          ENDIF.
        ENDIF.
      ENDIF.
      IF NOT me->stream->advance( ).
        EXIT.
      ENDIF.
    ENDDO.
    me->add( ).
  ENDMETHOD.

ENDCLASS.
