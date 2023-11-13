* auto generated, do not touch
CLASS zcl_alint_lexer DEFINITION PUBLIC.
  PUBLIC SECTION.
    METHODS run IMPORTING file TYPE REF TO zif_alint_ifile virtual TYPE REF TO zcl_alint_position OPTIONAL RETURNING VALUE(return) TYPE zif_alint_ddic=>iabaplexerresult.
  PRIVATE SECTION.
    DATA modenormal TYPE i VALUE 1.
    DATA modeping TYPE i VALUE 2.
    DATA modestr TYPE i VALUE 3.
    DATA modetemplate TYPE i VALUE 4.
    DATA modecomment TYPE i VALUE 5.
    DATA modepragma TYPE i VALUE 6.
    DATA virtual TYPE REF TO zcl_alint_position.
    DATA tokens TYPE STANDARD TABLE OF REF TO zcl_alint_abstract_token WITH EMPTY KEY.
    DATA m TYPE i.
    DATA stream TYPE REF TO zcl_alint_lexer_buffer.
    DATA buffer TYPE REF TO zcl_alint_lexer_stream.
    METHODS add.
    METHODS process IMPORTING raw TYPE string.
ENDCLASS.

CLASS zcl_alint_lexer IMPLEMENTATION.
  METHOD run.
    me->virtual = virtual.
    me->tokens = VALUE #( ).
    me->m = me->modenormal.
    process( file->getraw( ) ).
    return = VALUE #( file = file tokens = me->tokens ).

  ENDMETHOD.

  METHOD add.
    DATA(s) = condense( val = buffer->get( ) del = |\n | ).
    DATA tok TYPE REF TO zcl_alint_abstract_token.
    IF strlen( s ) > 0.
      DATA(col) = stream->getcol( ).
      DATA(row) = stream->getrow( ).
      DATA(whitebefore) = abap_false.
      IF stream->getoffset( ) - strlen( s ) >= 0.
        DATA(prev) = substring( val = stream->getraw( ) off = stream->getoffset( ) - strlen( s ) len = 1 ).
        IF prev EQ | | OR
            prev EQ |\n| OR
            prev EQ |\t| OR
            prev EQ |:|.
          whitebefore = abap_true.
        ENDIF.
      ENDIF.
      DATA(whiteafter) = abap_false.
      DATA(next) = stream->nextchar( ).
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
      DATA(pos) = NEW zcl_alint_position( row = row col = col - strlen( s ) ).
      IF me->virtual IS NOT INITIAL.
        pos = NEW zcl_alint_virtual_position( virtual = virtual row = pos->getrow( ) col = pos->getcol( ) ).
      ENDIF.

      CLEAR tok.
      IF me->m EQ me->modecomment.
        tok = NEW zcl_alint_comment( start = pos str = s ).
      ELSEIF me->m EQ me->modeping OR
          me->m EQ me->modestr.
        tok = NEW zcl_alint_string_token( start = pos str = s ).
      ELSEIF me->m EQ me->modetemplate.
        DATA(first) = substring( val = s len = 1 off = 0 ).
        DATA(last) = substring( val = s len = 1 off = strlen( s ) - 1 ).
        IF first EQ |\|| AND last EQ |\||.
          tok = NEW zcl_alint_string_template( start = pos str = s ).
        ELSEIF first EQ |\|| AND last EQ |\{| AND whiteafter EQ abap_true.
          tok = NEW zcl_alint_string_template_begi( start = pos str = s ).
        ELSEIF first EQ |\}| AND last EQ |\|| AND whitebefore EQ abap_true.
          tok = NEW zcl_alint_string_template_end( start = pos str = s ).
        ELSEIF first EQ |\}| AND last EQ |\{| AND whiteafter EQ abap_true AND whitebefore EQ abap_true.
          tok = NEW zcl_alint_string_template_midd( start = pos str = s ).
        ELSE.
          tok = NEW zcl_alint_identifier( start = pos str = s ).


        ENDIF.
      ELSEIF strlen( s ) > 2 AND substring( val = s off = 0 len = 2 ) EQ |##|.
        tok = NEW zcl_alint_pragma( start = pos str = s ).
      ELSEIF strlen( s ) EQ 1.
        IF s EQ |.| OR
            s EQ |,|.
          tok = NEW zcl_alint_punctuation( start = pos str = s ).
        ELSEIF s EQ |[|.
          IF whitebefore EQ abap_true AND whiteafter EQ abap_true.
            tok = NEW zcl_alint_wbracket_leftw( start = pos str = s ).
          ELSEIF whitebefore EQ abap_true.
            tok = NEW zcl_alint_wbracket_left( start = pos str = s ).
          ELSEIF whiteafter EQ abap_true.
            tok = NEW zcl_alint_bracket_leftw( start = pos str = s ).
          ELSE.
            tok = NEW zcl_alint_bracket_left( start = pos str = s ).


          ENDIF.
        ELSEIF s EQ |(|.
          IF whitebefore EQ abap_true AND whiteafter EQ abap_true.
            tok = NEW zcl_alint_wparen_leftw( start = pos str = s ).
          ELSEIF whitebefore EQ abap_true.
            tok = NEW zcl_alint_wparen_left( start = pos str = s ).
          ELSEIF whiteafter EQ abap_true.
            tok = NEW zcl_alint_paren_leftw( start = pos str = s ).
          ELSE.
            tok = NEW zcl_alint_paren_left( start = pos str = s ).


          ENDIF.
        ELSEIF s EQ |]|.
          IF whitebefore EQ abap_true AND whiteafter EQ abap_true.
            tok = NEW zcl_alint_wbracket_rightw( start = pos str = s ).
          ELSEIF whitebefore EQ abap_true.
            tok = NEW zcl_alint_wbracket_right( start = pos str = s ).
          ELSEIF whiteafter EQ abap_true.
            tok = NEW zcl_alint_bracket_rightw( start = pos str = s ).
          ELSE.
            tok = NEW zcl_alint_bracket_right( start = pos str = s ).


          ENDIF.
        ELSEIF s EQ |)|.
          IF whitebefore EQ abap_true AND whiteafter EQ abap_true.
            tok = NEW zcl_alint_wparen_rightw( start = pos str = s ).
          ELSEIF whitebefore EQ abap_true.
            tok = NEW zcl_alint_wparen_right( start = pos str = s ).
          ELSEIF whiteafter EQ abap_true.
            tok = NEW zcl_alint_paren_rightw( start = pos str = s ).
          ELSE.
            tok = NEW zcl_alint_paren_right( start = pos str = s ).


          ENDIF.
        ELSEIF s EQ |-|.
          IF whitebefore EQ abap_true AND whiteafter EQ abap_true.
            tok = NEW zcl_alint_wdashw( start = pos str = s ).
          ELSEIF whitebefore EQ abap_true.
            tok = NEW zcl_alint_wdash( start = pos str = s ).
          ELSEIF whiteafter EQ abap_true.
            tok = NEW zcl_alint_dashw( start = pos str = s ).
          ELSE.
            tok = NEW zcl_alint_dash( start = pos str = s ).


          ENDIF.
        ELSEIF s EQ |+|.
          IF whitebefore EQ abap_true AND whiteafter EQ abap_true.
            tok = NEW zcl_alint_wplusw( start = pos str = s ).
          ELSEIF whitebefore EQ abap_true.
            tok = NEW zcl_alint_wplus( start = pos str = s ).
          ELSEIF whiteafter EQ abap_true.
            tok = NEW zcl_alint_plusw( start = pos str = s ).
          ELSE.
            tok = NEW zcl_alint_plus( start = pos str = s ).


          ENDIF.
        ELSEIF s EQ |@|.
          IF whitebefore EQ abap_true AND whiteafter EQ abap_true.
            tok = NEW zcl_alint_watw( start = pos str = s ).
          ELSEIF whitebefore EQ abap_true.
            tok = NEW zcl_alint_wat( start = pos str = s ).
          ELSEIF whiteafter EQ abap_true.
            tok = NEW zcl_alint_atw( start = pos str = s ).
          ELSE.
            tok = NEW zcl_alint_at( start = pos str = s ).


          ENDIF.


        ENDIF.
      ELSEIF strlen( s ) EQ 2.
        IF s EQ |->|.
          IF whitebefore EQ abap_true AND whiteafter EQ abap_true.
            tok = NEW zcl_alint_winstance_arroww( start = pos str = s ).
          ELSEIF whitebefore EQ abap_true.
            tok = NEW zcl_alint_winstance_arrow( start = pos str = s ).
          ELSEIF whiteafter EQ abap_true.
            tok = NEW zcl_alint_instance_arroww( start = pos str = s ).
          ELSE.
            tok = NEW zcl_alint_instance_arrow( start = pos str = s ).


          ENDIF.
        ELSEIF s EQ |=>|.
          IF whitebefore EQ abap_true AND whiteafter EQ abap_true.
            tok = NEW zcl_alint_wstatic_arroww( start = pos str = s ).
          ELSEIF whitebefore EQ abap_true.
            tok = NEW zcl_alint_wstatic_arrow( start = pos str = s ).
          ELSEIF whiteafter EQ abap_true.
            tok = NEW zcl_alint_static_arroww( start = pos str = s ).
          ELSE.
            tok = NEW zcl_alint_static_arrow( start = pos str = s ).


          ENDIF.

        ENDIF.


      ENDIF.
      IF tok IS INITIAL.
        tok = NEW zcl_alint_identifier( start = pos str = s ).
      ENDIF.
      me->tokens = VALUE #( BASE me->tokens ( tok ) ).
    ENDIF.
    buffer->clear( ).
  ENDMETHOD.

  METHOD process.
    DATA splits TYPE STANDARD TABLE OF string WITH EMPTY KEY.
    DATA bufs TYPE STANDARD TABLE OF string WITH EMPTY KEY.
    stream = NEW zcl_alint_lexer_buffer( raw = replace( val = raw regex = |\r| with = || ) ).
    me->buffer = NEW zcl_alint_lexer_stream( ).

    CLEAR splits.
    APPEND | | TO splits.
    APPEND |:| TO splits.
    APPEND |.| TO splits.
    APPEND |,| TO splits.
    APPEND |-| TO splits.
    APPEND |+| TO splits.
    APPEND |(| TO splits.
    APPEND |)| TO splits.
    APPEND |[| TO splits.
    APPEND |]| TO splits.
    APPEND |\t| TO splits.
    APPEND |\n| TO splits.

    CLEAR bufs.
    APPEND |.| TO bufs.
    APPEND |,| TO bufs.
    APPEND |:| TO bufs.
    APPEND |(| TO bufs.
    APPEND |)| TO bufs.
    APPEND |[| TO bufs.
    APPEND |]| TO bufs.
    APPEND |+| TO bufs.
    APPEND |@| TO bufs.
    DO.
      DATA(current) = stream->currentchar( ).
      DATA(buf) = buffer->add( current ).
      DATA(ahead) = stream->nextchar( ).
      DATA(aahead) = stream->nextnextchar( ).
      IF me->m EQ me->modenormal.
        IF line_exists( splits[ table_line = ahead ] ).
          add( ).
        ELSEIF ahead EQ |'|.
          add( ).
          me->m = me->modestr.
        ELSEIF ahead EQ |\|| OR
            ahead EQ |\}|.
          add( ).
          me->m = me->modetemplate.
        ELSEIF ahead EQ |`|.
          add( ).
          me->m = me->modeping.
        ELSEIF aahead EQ |##|.
          add( ).
          me->m = me->modepragma.
        ELSEIF ahead EQ |"| OR
            ( ahead EQ |*| AND current EQ |\n| ).
          add( ).
          me->m = me->modecomment.
        ELSEIF ahead EQ |@| AND strlen( condense( val = buf del = |\n | ) ) EQ 0.
          add( ).
        ELSEIF aahead EQ |->| OR
            aahead EQ |=>|.
          add( ).
        ELSEIF current EQ |>| AND ahead NE | | AND ( stream->prevchar( ) EQ |-| OR
            stream->prevchar( ) EQ |=| ).
          add( ).
        ELSEIF strlen( buf ) EQ 1 AND ( line_exists( bufs[ table_line = buf ] ) OR
            ( buf EQ |-| AND ahead NE |>| ) ).
          add( ).


        ENDIF.
      ELSEIF me->m EQ me->modepragma AND ( ahead EQ |,| OR
          ahead EQ |:| OR
          ahead EQ |.| OR
          ahead EQ | | OR
          ahead EQ |\n| ).
        add( ).
        me->m = me->modenormal.
      ELSEIF m EQ modeping AND strlen( buf ) > 1 AND current EQ |`| AND aahead NE |``| AND ahead NE |`| AND buffer->countiseven( |`| ).
        add( ).
        IF ahead EQ |"|.
          me->m = me->modecomment.
        ELSE.
          me->m = me->modenormal.
        ENDIF.
      ELSEIF m EQ modetemplate AND strlen( buf ) > 1 AND ( current EQ |\|| OR
          current EQ |\{| ) AND ( stream->prevchar( ) NE |\\| OR
          stream->prevprevchar( ) EQ |\\\\| ).
        add( ).
        me->m = me->modenormal.
      ELSEIF me->m EQ me->modetemplate AND ahead EQ |\}| AND current NE |\\|.
        add( ).
      ELSEIF m EQ modestr AND current EQ |'| AND strlen( buf ) > 1 AND aahead NE |''| AND ahead NE |'| AND buffer->countiseven( |'| ).
        add( ).
        IF ahead EQ |"|.
          me->m = me->modecomment.
        ELSE.
          me->m = me->modenormal.
        ENDIF.
      ELSEIF ahead EQ |\n| AND me->m NE me->modetemplate.
        add( ).
        me->m = me->modenormal.
      ELSEIF me->m EQ me->modetemplate AND current EQ |\n|.
        add( ).


      ENDIF.
      IF NOT stream->advance( ).
        EXIT.
      ENDIF.
    ENDDO.
    add( ).
  ENDMETHOD.

ENDCLASS.
