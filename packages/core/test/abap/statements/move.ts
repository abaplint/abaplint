import {statementType, statementVersion, statementVersionFail, statementVersionOk} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Version} from "../../../src/version";

const tests = [
  "move 2 to lv_foo.",
  "move exact c_val to l_int.",
  "MOVE foo ?TO bar.",
  "MOVE '2' TO %bar.",
  "lv_foo = 2.",
  "rs_data-raw = gv_out.",
  "rv_bool = boolc( sy-subrc = 0 ).",
  "rs_data-compressed_len = xstrlen( foo ).",
  "lo_repo ?= lcl_app=>repo_srv( )->get( <ls_list>-key ).",
  "foo ?= lo_obj->/iwbep/if_mgw_dp_int_facade~get_model( ).",
  "wa_asdf-cur = sy-tabix * ( -1 ).",
  "lv_test = ( lv_seconds / 3600 ) DIV 24.",
  "move asdf to foobar(3).",
  "lv_sdf = lv_dfd BIT-XOR lv_hex.",
  "foo = 'sdf' & 'sdf'.",
  "lv_foo = 'something'(002).",
  "lv_foo = 'foobar'(bl1).",
  "rs_data-len = xstrlen( foo ) - 2.",
  "rs_data-len = xstrlen( foo ) - field.",
  "lv_maxint = 2 ** 31 - 1.",
  "lv_moo = |foo \\| bar|.",
  "rs_data-len = xstrlen( foo ) - foo( ).",
  "iv_f = - lv_maxint.",
  "rs_data-len = xstrlen( foo ) - go_stream->rema( ).",
  "foo = method( 2 ).",
  "foo = method(\n 2 ).",
  "rv_res = BIT-NOT iv_x.",
  "rv_res = ( iv_x BIT-AND iv_y ) BIT-OR ( ( BIT-NOT iv_x ) BIT-AND iv_z ).",
  "rv_res = ( iv_x BIT-AND iv_y ) BIT-OR ( iv_x BIT-AND iv_z ).",
  "foo = method(\n2 ).",
  "index1 = index2 = index1 - 1.",
  "lv_chunk = iv_line+<match>-offset.",
  "lv_chunk = iv_line(<match>-length).",
  "lv_chunk = iv_line+<match>-offset(<match>-length).",
  "ls_/foo/bar-visible = 'X'.",
  "lv_type = mr_property->*-data-type.",
  "lr_ref->*-length = ls_type-length.",
  "x = column - '0.5'.",
  "e_flag-4 = 'X'.",
  "int = +1.",
  "int = -1.",
  "int = 1 - +1.",
  "int = 1 - -1.",
  "MOVE +1 TO int.",
  "target = conv string( field1 ) && conv string( field2 ).",

  "lv_foo = `foo` & `foo` & `foo` & `foo` & `foo` & `foo` & \n" +
    "`foo` & `foo` & `foo` & `foo` & `foo` & `foo` & `foo` & \n" +
    "`foo` & `foo` & `foo` & `foo` & `foo` & `foo` & `foo` & \n" +
    "`foo` & `foo` & `foo` & `foo` & `foo` & `foo` & `foo` & \n" +
    "`foo` & `foo` & `foo` & `foo` & `foo`.",

  "lv_foo = 'bar' && 'foo' && 'foo' && 'foo' && 'foo' && 'foo' &&\n" +
  "  'foo' && 'foo' && 'foo' && 'foo' && 'foo' && 'foo' && 'foo' &&\n" +
  "  'foo' && 'foo' && 'foo' && 'foo' && 'foo' && 'foo' && 'foo' &&\n" +
  "  'foo' && 'foo' && 'foo' && 'foo' && 'foo' && 'foo' && 'foo' &&\n" +
  "  'foo' && 'foo' && 'foo' && 'foo' && 'foo' && 'foo' && 'foo' &&\n" +
  "  'foo' && 'foo' && 'foo' && 'foo' && 'foo' && 'foo' && 'foo' &&\n" +
  "  'foo' && 'foo' && 'foo' && 'foo' && 'foo' && 'foo' && 'foo' &&\n" +
  "  'foo' && 'foo' && 'foo' && 'foo' && 'foo' && 'foo' && 'foo' &&\n" +
  "  'foo' && 'foo' && 'foo' && 'foo' && 'foo' && 'foo' && 'foo' &&\n" +
  "  'foo' && 'foo' && 'foo' && 'foo' && 'foo' && 'foo' && 'foo' &&\n" +
  "  'foo' && 'foo' && 'foo' && 'foo' && 'foo' && 'foo' && 'foo' &&\n" +
  "  'foo' && 'foo' && 'foo' && 'foo' && 'foo' && 'foo' && 'foo' &&\n" +
  "  'foo' && 'foo' && 'foo' && 'foo' && 'foo' && 'foo' && 'foo' &&\n" +
  "  'foo' && 'foo' && 'foo' && 'foo' && 'foo' && 'foo' && 'foo' &&\n" +
  "  'foo' && 'foo' && 'foo' && 'foo' && 'foo' && 'foo' && 'foo'.",

  "ls_extension = CORRESPONDING #( ls_line_item MAPPING /abc/comp_a = comp_a\n" +
  "  /abc/comp_b = comp_b\n" +
  "  /abc/comp_c = comp_c ).",

  "result = COND #(\n" +
  "  WHEN constant_value IS NOT INITIAL\n" +
  "  THEN `blabla`\n" +
  "  ELSE THROW cx_with_parameter( id ) ).",

  "MOVE foo(+100) TO bar.",
  "gs_structure-field$01 = 'val'.",
  "foo = bar ##called.",
  "##called foo = bar.",
  "DATA(ints) = NEW tyt_integer( ( 1 ) ( 2 ) ( 3 ) ).",
  "DATA(lt_list) = VALUE mo_out->ty_list_tt( ( 1 ) ).",
  "CAST cl_class( x )->property = blah.",
  "CAST cl_class( x )->property-component = blah.",
  "CAST cl_class( x->y->z )->property-component = blah.",
  "CAST cl_class( x->y->z )->property-component = cl_other_class=>constant.",
  "NEW zcl_foo( )->prop = bar.",
  "boo = VALUE #( BASE moo ( LINES OF <foo>-bar ) ).",

  "DATA(other_cases) = VALUE test_cases(\n" +
  "  ( test_case )\n" +
  "  ( expression = `blah` expected_result = abap_true ) ).",

  "moo = REDUCE string( INIT x TYPE string\n" +
  "  FOR wa IN material_data\n" +
  "  WHERE ( plnal = opr->plnal AND plnnr = opr->plnnr )\n" +
  "  NEXT x = |{ x } { wa-matnr alpha = out }, | ).",

  // string templates
  "lv_str = | { zif_bar=>and ALIGN = RIGHT WIDTH = 5 } |.",
  "lv_str = | { zif_bar=>and ALIGN = RIGHT WIDTH = 5  PAD = '_' } |.",
  "lv_str = |{ k WIDTH = 78 ALIGN = LEFT PAD = space }*|. ",
  "<timezone>-datetime = |{ tstamp TIMEZONE = <timezone>-tzone TIMESTAMP = USER }|. ",
  "<timezone>-datetime = |{ tstamp TIMESTAMP = USER TIMEZONE = <timezone>-tzone }|. ",
  "<timezone>-datetime = |{ tstamp TIMEZONE = <timezone>-tzone }|. ",
  "<timezone>-datetime = |{ tstamp TIMESTAMP = USER }|. ",

  "lv_number = |{ lv_number DECIMALS = 2 NUMBER = RAW SIGN = LEFT }|.",
  "lv_number = |{ lv_number DECIMALS = lv_dec NUMBER = RAW SIGN = LEFT }|.",
  "lv_number = |{ lv_number NUMBER = RAW SIGN = LEFT }|.",
  "lv_number = |{ lv_number SIGN = LEFT }|.",

  `DATA(foo) = REDUCE i( INIT s TYPE i FOR i = 1 UNTIL i > 10 NEXT s = s + i ).`,

  `gp_amount_sp = REDUCE #(
    INIT x TYPE vbrk-netwr
    FOR <i> IN invoices
    WHERE ( vtweg = '20' )
    NEXT x = x + <i>-kwert ).`,

  `DATA(lr_sdf) = REF #( foobar OPTIONAL ).`,
  `rv_amount = - abs( foo-bar ).`,
  `ls_struct-amount = - ( iv_amount1 / ls_struct2-amount2 ) * ls_struct2-amount3.`,
  `DATA(lt_tab) = VALUE lty_bar( FOR d IN tab INDEX INTO i ( id = lv_id number = i ) ).`,
  `et_errors = CORRESPONDING #( lt_errors MAPPING company_code = doc-bukrs fiscal_year = doc-gjahr ).`,
  `ri_entity_object = CAST #( LET collectors = get_collectors( ) IN collectors[ type = iv_type ]-collector ).`,
/*
  `DATA(request_count) = REDUCE int2( INIT x = 0
    FOR GROUPS request OF s_blame_author IN t_blame_author
    GROUP BY s_blame_author-request
    NEXT x = x + 1 ).`,
    */

  `
mock_cds_db = cl_cds_test_environment=>create_for_multiple_cds( i_for_entities = VALUE #(
  ( VALUE #( i_for_entity = parameter_cds-fmt i_dependency_list = VALUE #( ( parameter-fmt ) ) ) )
  ( VALUE #( i_for_entity = parameter_cds-fmttype i_dependency_list = VALUE #( ( parameter-fmttype ) ) ) )
  ( VALUE #( i_for_entity = parameter_cds-fmttypet i_dependency_list = VALUE #( ( parameter-fmttypet ) ) ) )
  ( VALUE #( i_for_entity = parameter_cds-fmtvers i_dependency_list = VALUE #( ( parameter-fmtvers ) ) ) )
  ( VALUE #( i_for_entity = parameter_cds-fmtconst i_dependency_list = VALUE #( ( parameter-fmtconst ) ) ) )
  ( VALUE #( i_for_entity = parameter_cds-fmtenum i_dependency_list = VALUE #( ( parameter-fmtenum ) ) ) )
  ( VALUE #( i_for_entity = parameter_cds-fmtenumv i_dependency_list = VALUE #( ( parameter-fmtenumv ) ) ) )
  ( VALUE #( i_for_entity = parameter_cds-fmtattrf i_dependency_list = VALUE #( ( parameter-fmtattrf ) ) ) )
  ( VALUE #( i_for_entity = parameter_cds-node i_dependency_list = VALUE #( ( parameter-node ) ) ) )
  ( VALUE #( i_for_entity = parameter_cds-nodefld i_dependency_list = VALUE #( ( parameter-nodefld ) ) ) )
  ( VALUE #( i_for_entity = parameter_cds-nodefldg i_dependency_list = VALUE #( ( parameter-nodefldg ) ) ) )
  ( VALUE #( i_for_entity = parameter_cds-noderec i_dependency_list = VALUE #( ( parameter-noderec ) ) ) )
  ( VALUE #( i_for_entity = parameter_cds-noderecg i_dependency_list = VALUE #( ( parameter-noderecg ) ) ) )
  ( VALUE #( i_for_entity = parameter_cds-nodeact i_dependency_list = VALUE #( ( parameter-nodeact ) ) ) )
  ( VALUE #( i_for_entity = parameter_cds-nodeactparam i_dependency_list = VALUE #( ( parameter-nodeactparam ) ) ) )
) ).`,

  `lt_vals = VALUE #(
    ( classnum = 'FOO_DAT' name_char = 'WER'  value = data-sdf )
    ( classnum = 'FOO_DAS' name_char = 'EWR'  value = data-rew )
    ( classnum = 'FOO_AMS' name_char = 'WER'  value = sdfsd )
    ( classnum = 'FOO_AMS' name_char = 'WER'  value = data-hg )
    ( classnum = 'FOO_AMS' name_char = 'EWR'  value = ls_gfh-value )
    ( classnum = 'FOO_AMS' name_char = 'REW'  value = |{ data-hgf }| )
    ( classnum = 'FOO_ROW' name_char = 'WER'  value = lv_dfgdf )
    ( classnum = 'FOO_ROW' name_char = 'SDF'  value = data-yrt )
    ( classnum = 'FOO_ROW' name_char = 'SDF'  value = yrt-value )
    ( classnum = 'FOO_ROW' name_char = 'SDF'  value = |{ data-gfg }| ) ).`,

  `lt_vals = VALUE #(
      ( classnum = 'FOO_DAT' name_char = 'WER'  value = data-sdf )
      ( classnum = 'FOO_DAS' name_char = 'EWR'  value = data-rew )
      ( classnum = 'FOO_AMS' name_char = 'WER'  value = sdfsd )
      ( classnum = 'FOO_AMS' name_char = 'WER'  value = abc )
      ( classnum = 'FOO_AMS' name_char = 'ERW'  value = sdfsd )
      ( classnum = 'FOO_AMS' name_char = 'REW'  value = sdfsd )
      ( classnum = 'FOO_AMS' name_char = 'WER'  value = data-hg )
      ( classnum = 'FOO_AMS' name_char = 'WER'  value = sdfds )
      ( classnum = 'FOO_AMS' name_char = 'EWR'  value = sdfs )
      ( classnum = 'FOO_AMS' name_char = 'EWR'  value = ls_gfh-value )
      ( classnum = 'FOO_AMS' name_char = 'REW'  value = sdfds )
      ( classnum = 'FOO_ROW' name_char = 'WER'  value = lv_dfgdf )
      ( classnum = 'FOO_ROW' name_char = 'WRE'  value = sdfs )
      ( classnum = 'FOO_ROW' name_char = 'WER'  value = sdfds )
      ( classnum = 'FOO_ROW' name_char = 'SDF'  value = sdfds )
      ( classnum = 'FOO_ROW' name_char = 'SDF'  value = data-yrt )
      ( classnum = 'FOO_ROW' name_char = 'SDFS' value = sdfsd )
      ( classnum = 'FOO_ROW' name_char = 'SDF'  value = sdfds )
      ( classnum = 'FOO_ROW' name_char = 'SDF'  value = yrt-value )
      ( classnum = 'FOO_ROW' name_char = 'SDF'  value = sdfsd ) ).`,

  `lt_vals = VALUE #(
      ( classnum = 'FOO_DAT' name_char = 'WER'  value = data-sdf )
      ( classnum = 'FOO_DAS' name_char = 'EWR'  value = data-rew )
      ( classnum = 'FOO_AMS' name_char = 'WER'  value = sdfsd )
      ( classnum = 'FOO_AMS' name_char = 'WER'  value = |{ data-fgh NUMBER = ENVIRONMENT }| )
      ( classnum = 'FOO_AMS' name_char = 'ERW'  value = |{ data-hgf NUMBER = ENVIRONMENT }| )
      ( classnum = 'FOO_AMS' name_char = 'REW'  value = |{ data-hgf NUMBER = ENVIRONMENT }| )
      ( classnum = 'FOO_AMS' name_char = 'WER'  value = data-hg )
      ( classnum = 'FOO_AMS' name_char = 'WER'  value = |{ data-gfh NUMBER = ENVIRONMENT }| )
      ( classnum = 'FOO_AMS' name_char = 'EWR'  value = |{ data-hfs NUMBER = ENVIRONMENT }| )
      ( classnum = 'FOO_AMS' name_char = 'EWR'  value = ls_gfh-value )
      ( classnum = 'FOO_AMS' name_char = 'REW'  value = |{ data-hgf }| )
      ( classnum = 'FOO_ROW' name_char = 'WER'  value = lv_dfgdf )
      ( classnum = 'FOO_ROW' name_char = 'WRE'  value = |{ data-fgd NUMBER = ENVIRONMENT }| )
      ( classnum = 'FOO_ROW' name_char = 'WER'  value = |{ data-fgd NUMBER = ENVIRONMENT }| )
      ( classnum = 'FOO_ROW' name_char = 'SDF'  value = |{ data-yrs NUMBER = ENVIRONMENT }| )
      ( classnum = 'FOO_ROW' name_char = 'SDF'  value = data-yrt )
      ( classnum = 'FOO_ROW' name_char = 'SDFS' value = |{ data-ytr NUMBER = ENVIRONMENT }| )
      ( classnum = 'FOO_ROW' name_char = 'SDF'  value = |{ data-ytr NUMBER = ENVIRONMENT }| )
      ( classnum = 'FOO_ROW' name_char = 'SDF'  value = yrt-value )
      ( classnum = 'FOO_ROW' name_char = 'SDF'  value = |{ data-gfg }| ) ).`,

  "DATA(bar) = + '11'.",
  "DATA(bar) = +'sdf'.",
  "DATA(test) = VALUE string_table( ( `( 1 =`) ).",
  "DATA(test) = VALUE string_table( (`( 1 =` ) ).",
  "result = NEW cl_oo_class( myname )->class-descript.",
  "rv_inbound_fm = 'CONVERSION_EXIT_' && get_field_ref( iv_table = iv_table iv_field = iv_field )->edit_mask+2 && '_INPUT'.",
  "result = xsdbool( FILTER #( messages USING KEY type IN message_error_types WHERE type = table_line ) IS NOT INITIAL ).",
  "reported = CORRESPONDING #( DEEP update_reported ).",
  "DATA(sdfs) = EXACT i( 5 ) + 3.",
  "DATA(sdfs) = SWITCH i( val WHEN 2 THEN 2 ) + 2.",
  "DATA(sdfs) = VALUE syst( mandt = '22' ) + 2.", // note that this is not a syntax error on 751, but a runtime error
  "DATA(sdfs) = CORRESPONDING syst( val ) + 2.",  // note that this is not a syntax error on 751, but a runtime error
  `lv_var = get_field('FOO').`,
  `DATA(sdfs) = NEW ty_sdfsd( ( option = 'EQ' sign = 'E' low = '90' ) ).`,
  `DATA(dat1) = COND string( WHEN 1 = 2 THEN 'asdf' WHEN 'sdf' = '' THEN '').`,
  `DATA(dat2) = CONV string( 'sdf').`,
  `DATA(sdfs) = SWITCH string( val WHEN 2 THEN 'sdf').`,
  `<ls_list>-sdfds = |{ lv_order_date DATE = (cl_abap_format=>d_user) }|.`,
  `result = REDUCE string( INIT s = 0
      FOR  i = 0 WHILE i < strlen( input )
      NEXT s += COND i( LET current_val = to_upper( input+i(1) ) IN
      WHEN contains( val = 'QZ' sub = current_val ) THEN 10
      ELSE 0
      ) ).`,
  `result = REDUCE string( INIT s = 0
      FOR  i = 0 WHILE i < strlen( input )
      NEXT s += 2 ).`,
  `result = VALUE ztimem_line_t(
        FOR part IN parts
        FOR line IN part-lines
        ( line ) ).`,
  `datetime = REDUCE #(
          INIT dt = '00000000000000'
          FOR step IN system-steps
          FOR action IN step-actions
          NEXT dt = COND #(
          WHEN action-date > dt(8) AND action-time > dt+8
          THEN |{ action-date DATE = RAW }{ action-time TIME = RAW }| ELSE dt ) ).`,
  `tab2 = VALUE #( ( LINES OF tab1 TO index ) ).`,
  `tab2 = VALUE #( ( LINES OF tab1 FROM index ) ).`,
  `tab2 = VALUE #( ( LINES OF tab1 FROM index TO index ) ).`,

  `DATA(sdf) = VALUE initial_numbers(
    FOR GROUPS grouping_group OF initial_line IN initial_numbers
    GROUP BY ( group = initial_line-group )
    ( group = grouping_group-group
    ) ).`,

  `aggregated_data = VALUE aggregated_data( BASE aggregated_data
      FOR GROUPS ls_group OF ls_numgrp IN initial_numbers
        GROUP BY ( group = ls_numgrp-group  count = GROUP SIZE )
        ASCENDING
      ( REDUCE aggregated_data_type(
        INIT ls_agr_data = VALUE aggregated_data_type( )
         FOR ls_grp_data IN GROUP ls_group
        NEXT ls_agr_data = VALUE #(
                                group = ls_group-group
                                count = ls_group-count
                                sum = 2
                                max = 2
                                min = 2
                                average = ls_agr_data-sum / ls_agr_data-count
                               )

     ) ) ).`,

  `aggregated_data = REDUCE aggregated_data(
  INIT aggregated = VALUE aggregated_data( )
       data = VALUE aggregated_data_type( )
  FOR GROUPS <group_key> OF <wa> IN initial_numbers
    GROUP BY <wa>-group ASCENDING
  NEXT data = VALUE #( group = <group_key> )
       aggregated = VALUE #( BASE aggregated ( data ) ) ).`,

  `    aggregated_data = VALUE #(
  FOR GROUPS grp OF rec IN initial_numbers
  GROUP BY ( group = rec-group cnt = GROUP SIZE )
  LET res = REDUCE aggregated_data_type( INIT tmp = VALUE aggregated_data_type( min = initial_numbers[ group = grp-group ]-number )
            FOR rec2 IN GROUP grp
            NEXT tmp-sum = tmp-sum + rec2-number
               tmp-min = COND #( WHEN tmp-min > rec2-number THEN rec2-number ELSE tmp-min )
               tmp-max = COND #( WHEN tmp-max < rec2-number THEN rec2-number ELSE tmp-max )
            ) IN
            ( group = grp-group
              count = grp-cnt
              sum = res-sum
              min = res-min
              max = res-max
              average = res-sum / grp-cnt ) ).`,

  `DATA(sdf1) = + VALUE i( ).`,
  `DATA(sdf2) = - VALUE i( ).`,
  `DATA(sdf3) = + CONV i( 1 ).`,
  `DATA(sdf4) = - CONV i( 1 ).`,
  `DATA(sdf1) = + + VALUE i( ).`,
  `DATA(sdf2) = + + - + VALUE i( ).`,

  `DATA(x) = COND i( WHEN mo_server->ms_db-id_prev_app IS INITIAL THEN THROW _('CX_STACK_EMPTY - NO CALLING APP FOUND') ).`,
  `FINAL(dat) = 2.`,
  `?moo = 5.`,
  `lv_temp = lv_temp+(w_init).`,

  `DATA(lv) = SWITCH #( me->var->get( )
      WHEN zif_bar=>moo-sl
        OR zif_bar=>moo-su THEN dsf-bar
      ELSE THROW zcx_bar( MESSAGE e022 ) ).`,

  `MOVE foo TO bar PERCENTAGE len.`,
  `MOVE foo-moo TO bar PERCENTAGE 100 RIGHT.`,
  `lt_root_create = CORRESPONDING #( roots CHANGING CONTROL EXCEPT DeleteHidden UpdateHidden ValidTo ).`,
  `lv_min = |{ cl_foobar=>gc_min_value SIGN = LEFT ALIGN = (cl_abap_format=>a_left) NUMBER = USER }|.`,
  `MOVE <fs>-field+40() TO adr-name2.`,
  `stru-/val/ue = <fs>-/foo/bar/moo/boo.`,
];

statementType(tests, "MOVE", Statements.Move);

const versions = [
  {abap: "lo_foo = NEW zcl_class( ).", ver: Version.v740sp02},
  {abap: "lo_obj = CAST cl_abap_objectdescr( cl_abap_objectdescr=>describe_by_object_ref( ii_handler ) ).", ver: Version.v740sp02},
  {abap: "DATA(lo_obj) = CAST cl_abap_objectdescr(\n cl_abap_objectdescr=>describe_by_object_ref( ii_handler ) ).", ver: Version.v740sp02},
  {abap: "foo = CORRESPONDING #( get( ) ).", ver: Version.v740sp05},
  {abap: "lv_commit = CONV #( iv_branch ).", ver: Version.v740sp02},
  {abap: "lv_value = REF #( attribute_value ).", ver: Version.v740sp02},
  {abap: "ev_filename = mt_files[ 1 ]-key-obj_name.", ver: Version.v740sp02},
  {abap: "DATA(new_level) = VALUE #( mt_levels[ random_int ] OPTIONAL ).", ver: Version.v740sp08},
  {abap: "land_text = countries[ land1 = lv_foo ]-landx50.", ver: Version.v740sp02},
  {abap: "DATA(lt_tkey) = VALUE cvt_selops( ( option = 'EQ' sign   = 'I' low    = 'sdf' ) ).", ver: Version.v740sp02},
  {abap: "lv_xstr = CAST cl_sxml_string_writer( li_writer )->get_output( ).", ver: Version.v740sp02},
  {abap: "lv_value = COND #( WHEN type_kind = 'r' THEN 's' WHEN type_kind = 'h' THEN 'b' ELSE 'sd' ).", ver: Version.v740sp02},
  {abap: "moo = COND string( WHEN 1 = 2 THEN '12' ELSE '34' ) && 'bar'.", ver: Version.v740sp02},
  {abap: "lv_commit = lo_repo->get_branch( CONV #( iv_branch ) )->get_data( )-sha1.", ver: Version.v740sp02},
  {abap: "foo = gt_det[ <lv_row> ].", ver: Version.v740sp02},
  {abap: "foo = li_foo->create( VALUE #( ) ).", ver: Version.v740sp02},
  {abap: "foo = mi_foo->update( CORRESPONDING #( get( ) EXCEPT field ) ).", ver: Version.v740sp05},
  {abap: "foo = VALUE /bobf/t_frw_name( ).", ver: Version.v740sp02},
  {abap: "foo = switch #( i_popup when abap_true then c_popup when abap_false then c_full ).", ver: Version.v740sp02},
  {abap: "_locale = SWITCH #( i_locale WHEN `` THEN get_locale( ) ELSE i_locale ).", ver: Version.v740sp02},
  {abap: "r_source = VALUE #( BASE r_source ( source_line ) ).", ver: Version.v740sp02},
  {abap: "foo = VALUE #( ( col1 = 13 col2 = 232 col3 = 332 ) ).", ver: Version.v740sp02},
  {abap: "excluded = value #( ( b_01 ) ).", ver: Version.v740sp02},
  {abap: "excluded = value #( ( foo = b_01 ) ( bar = b_02 ) ).", ver: Version.v740sp02},
  {abap: "excluded = value #( ( b_01 ) ( b_02 ) ).", ver: Version.v740sp02},
  {abap: "DATA(lt_tadir) = VALUE tt_tadir( FOR ls_object IN it_objects (\n" +
    "pgmid = ls_object-pgmid\n" +
    "object = ls_object-object\n" +
    "obj_name = ls_object-obj_name ) ).", ver: Version.v740sp05},
  {abap: "foo = VALUE #(\n" +
    "( col1 = 11 col2 = 211 col3 = 311 )\n" +
    "( col1 = 11 col2 = 212 col3 = 312 )\n" +
    "( col1 = 12 col2 = 221 col3 = 321 )\n" +
    "( col1 = 12 col2 = 222 col3 = 322 )\n" +
    "( col1 = 13 col2 = 231 col3 = 331 )\n" +
    "( col1 = 13 col2 = 232 col3 = 332 ) ).", ver: Version.v740sp02},
  {abap: "moo = VALUE #(\n" +
    "FOR j = 1 THEN i + 1 WHILE j <= i_cols (\n" +
    "row = i\n" +
    "col = j ) ).", ver: Version.v740sp05},
  {abap: "r_grid->grid_cells = VALUE #(\n" +
    "FOR i = 1 THEN i + 1 WHILE i <= i_rows\n" +
    "FOR j = 1 THEN j + 1 WHILE j <= i_cols (\n" +
    "row = i\n" +
    "col = j ) ).", ver: Version.v740sp05},
  {abap: "r_cells_alive = lines( FILTER #( cells USING KEY key_alive WHERE alive = abap_true ) ).", ver: Version.v740sp08},
  {abap: "foo = CORRESPONDING #( <ls_data> MAPPING country = coun currency = curr ).", ver: Version.v740sp05},
  {abap: "foo = CORRESPONDING #( <ls_data> MAPPING country = coun currency = curr EXCEPT bar ).", ver: Version.v740sp05},
  {abap: "foo = CORRESPONDING #( <ls_data> MAPPING country = coun currency = curr EXCEPT * ).", ver: Version.v740sp05},
  {abap: "ct_usage[ id = c_excel ]-enabled = abap_false.", ver: Version.v740sp02},
  {abap: "ct_usage[ KEY name id = c_excel ]-enabled = abap_false.", ver: Version.v740sp02},
  {abap: "e_object->mt_toolbar[ function = <tb>-function ]-disabled = abap_true.", ver: Version.v740sp02},
  {abap: "ro_elem = VALUE #( char_table[ char = lv_char ]-elem DEFAULT NEW lcl_lisp_char( lv_char ) ).", ver: Version.v740sp08},
  {abap: "color = VALUE #( ( color-col = color_on ) ).", ver: Version.v740sp02},
  {abap: "foo = VALUE #( ( ) ).", ver: Version.v740sp02},
  {abap: "DATA(message) = COND #( LET len = strlen( i_message ) IN WHEN len > 0 THEN 'sdf' ).", ver: Version.v740sp02},
  {abap: "r_list = VALUE #( FOR <attribute> IN sdf->attributes ( <attribute>-name ) ).", ver: Version.v740sp05},
  {abap: "thesum = thesum + me->matrix[ x ] * i_matrix->matrix[ j ].", ver: Version.v740sp02},
  {abap: "thesum = thesum + me->matrix[ x ][ j ] * i_matrix->matrix[ j ][ y ].", ver: Version.v740sp02},
  {abap: "foo = CONV decfloat16( _num_samples ).", ver: Version.v740sp02},
  {abap: "t->matrix[ 1 ][ 4 ] = i_rotate_about_line->x.", ver: Version.v740sp02},
  {abap: "DATA(asdf) = VALUE zfoo(\n" +
    "FOR ls_sdf IN  lt_sdf WHERE ( classtype = '001' AND classnum = 'SOMETHING' )\n" +
    "( ls_sdf ) ).", ver: Version.v740sp05},
  {abap: "DATA(asdf) = VALUE zfoo(\n" +
    "FOR ls_sdf IN  lt_sdf FROM bar WHERE ( classnum = 'SOMETHING' )\n" +
    "( ls_sdf ) ).", ver: Version.v740sp05},
  {abap: "DATA(asdf) = VALUE zfoo(\n" +
    "FOR ls_sdf IN  lt_sdf TO bar WHERE ( classnum = 'SOMETHING' )\n" +
    "( ls_sdf ) ).", ver: Version.v740sp05},
  {abap: "DATA(asdf) = VALUE zfoo(\n" +
    "FOR ls_sdf IN  lt_sdf FROM moo TO bar WHERE ( classnum = 'SOMETHING' )\n" +
    "( ls_sdf ) ).", ver: Version.v740sp05},
  {abap: "et_blah = VALUE #( field = 2 ( id = c_bac ) ( id = c_gen ) ).", ver: Version.v740sp02},
  {abap: "foo = EXACT #( blah ).", ver: Version.v740sp02},
  {abap: "DATA(lv_end_date) = CONV zcreated( ms_periods-end_d ) + 235959.", ver: Version.v740sp02},
  {abap: "target[] = FILTER #( lt_tab[] IN lt_tab2[] WHERE field = var ).", ver: Version.v740sp08},
  {abap: "lt_result = CORRESPONDING table_type( lt_input DISCARDING DUPLICATES ).", ver: Version.v751},
  {abap: "DATA(result) = REDUCE string(\n" +
    "  INIT text = ``\n" +
    "  FOR i = 0 UNTIL i >= xstrlen( source )\n" +
    "  LET char = CONV string( source+i(1) ) IN\n" +
    "  NEXT text = text && |{ char } | ).", ver: Version.v740sp08},

  {abap: "ro_type = SWITCH #( LET rnd = lo_rnd->get( ) IN rnd\n" +
    "  WHEN 3 THEN zcl_log=>go_error\n" +
    "  WHEN 4 THEN zcl_log=>go_debug ).", ver: Version.v740sp02},

  {abap: "DATA(new_cells) = VALUE tty_cell(\n" +
    "FOR cell IN cells\n" +
    "LET alive_neighbours = get_alive( )\n" +
    "IN ( col   = cell-col\n" +
    "     row   = cell-row\n" +
    "     alive = rule( ) ) ).", ver: Version.v740sp05},

  {abap: "ls_line = CORRESPONDING #( is_data\n" +
    "  MAPPING\n" +
    "    field1 = lv_field1\n" +
    "    field2 = lv_field2\n" +
    "  EXCEPT\n" +
    "    field3 ).", ver: Version.v740sp05},

  {abap: "lt_range = VALUE #( sign = 'I' option = 'EQ' ( low = 'VAL1' )\n" +
    "( low = 'VAL2' )\n" +
    "option = 'NE' ( low = 'VAL3' )\n" +
    "( low = 'VAL4' ) ).", ver: Version.v740sp02},

  {abap: "lv_foo += 2.", ver: Version.v754},
  {abap: "lv_foo -= 2.", ver: Version.v754},
  {abap: "lv_foo /= 2.", ver: Version.v754},
  {abap: "lv_foo *= 2.", ver: Version.v754},
  {abap: "lv_foo &&= `abc`.", ver: Version.v754},

  {abap: "DATA(mode) = SWITCH edit_mode( id_edit_mode\n" +
    "  WHEN 'U' THEN asdf\n" +
    "  ELSE THROW zcx_exception( ) ).", ver: Version.v740sp02},

  {abap: `output = VALUE #(
    FOR GROUPS _tabname OF _dd03l IN dd03l
    GROUP BY _dd03l-tabname
    ( _tabname ) ).`, ver: Version.v740sp08},
];

statementVersion(versions, "MOVE", Statements.Move);

const ok = [
  {abap: `lv_ref_bgqc_name->* = me->ms_item-obj_name.`, ver: Version.v756},
];

statementVersionOk(ok, "MOVE", Statements.Move);

const versionsFail = [
  {abap: "lv_foo *= 2.", ver: Version.OpenABAP},
  {abap: "lv_foo *= 2.", ver: Version.v702},
];

statementVersionFail(versionsFail, "MOVE");