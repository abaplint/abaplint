import {Release, LanguageVersion} from "../../../src/version";
import {statementType, statementVersion, statementVersionOk, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";


const tests = [
  "ASSIGN COMPONENT ls_field-name OF STRUCTURE ig_file TO <lv_field>.",
  "ASSIGN ('(SAPLSIFP)TTAB') TO <lg_any>.",
  "ASSIGN cs_tstcp-param(sy-fdpos) TO <lg_f>.",
  "ASSIGN cs_tstcp-param(sdf) TO <lg_f>.",
  "ASSIGN cs_tstcp-param TO <lg_f>.",
  "ASSIGN lo_obj->('HAS_ATTRIBUTES') TO <lv_has_attributes>.",
  "ASSIGN *foobar TO <INITIAL>.",
  "ASSIGN (classname)=>type TO <local_type>.",
  "assign lt_alv->* to <f_alv_tab>.",
  "ASSIGN <ls_aq_msg>-data TO <lv_data> CASTING TYPE (lv_tabname).",
  "ASSIGN COMPONENT <ls_component>-name OF STRUCTURE <lg_data> TO <lv_data> CASTING TYPE HANDLE lo_datadescr.",
  "ASSIGN lv_x TO <lv_y> CASTING.",
  "ASSIGN foo-bar INCREMENT lv_count TO <fs> CASTING RANGE ls_obj.",
  "ASSIGN lt_word INCREMENT 1 TO <word> RANGE struc.",
  "assign text+i(1) to <x> type 'X'.",
  "assign textline+tmp(*) to <fs>.",
  "assign falv->fcat[ fieldname = fieldname ] to field-symbol(<fcat>).",
  "ASSIGN TABLE FIELD (bar) TO <foo>.",
  "assign (class)=>(attr) to <f>.",
  "ASSIGN COMPONENT col OF STRUCTURE <ls_data> TO <lv_field> CASTING DECIMALS lv_dec.",
  "ASSIGN COMPONENT col OF STRUCTURE <ls_data> TO <lv_field> CASTING DECIMALS <ls_curr>-currdec.",
  "assign data to <data> casting like bar.",
  "ASSIGN <ls_data> TO <ls_/foo/bar>.",
  "ASSIGN COMPONENT lv_name OF STRUCTURE iv_input TO <target> CASTING TYPE HANDLE <foo>-type.",
  "ASSIGN <field_x> TO <field> TYPE <fs>-inttype DECIMALS <fs>-decimals.",
  "ASSIGN <lt_list>-field TO <ls_id> RANGE <ls_range>.",
//  "ASSIGN (FOO) TO <Z-BAR>.",
  "ASSIGN field TO <F> RANGE range-bar.",
  "assign lt_tab[ key name index 1 ] to field-symbol(<bar>).",
  "ASSIGN var TO <fs> TYPE 'N'.",
  "ASSIGN TABLE FIELD foobar TO <fs>.",
  "ASSIGN <tab>[ ('VBELN') = <item>-vbeln ] TO FIELD-SYMBOL(<inv>).",
  "ASSIGN ('sdfsdf') TO <fs> ELSE UNASSIGN.",
  "ASSIGN data->* TO <gt>[].",
  `ASSIGN pack TO <p> DECIMALS foo-bar.`,
];

statementType(tests, "ASSIGN", Statements.Assign);

const versions = [
  {abap: "ASSIGN entity->* TO FIELD-SYMBOL(<entity>).", rel: Release.v740sp02},
  {abap: "ASSIGN it_cols_width[ KEY primary_key col = lv_col ] TO FIELD-SYMBOL(<ls_cols_width>).", rel: Release.v740sp02},
  {abap: "ASSIGN lt_table[ table_line->guid = lv_guid ] TO <target>.", rel: Release.v740sp02},
  {abap: "ASSIGN COMPONENT li_field->get_name( ) OF STRUCTURE ls_item TO <lv_field>.", rel: Release.v740sp02},
];

statementVersion(versions, "ASSIGN", Statements.Assign);

const v757 = [
  {abap: "ASSIGN struc-(comp) TO <fs>.", rel: Release.v757},
  {abap: "ASSIGN struc-(comp)-field TO <fs>.", rel: Release.v757},
  {abap: "ASSIGN struc-(comp+off(len)) TO <fs>.", rel: Release.v757},
  {abap: "ASSIGN ref->(attr) TO <fs>.", rel: Release.v757},
  {abap: "ASSIGN ref->(attr)->* TO <fs>.", rel: Release.v757},
  {abap: "ASSIGN struc-(comp)->(attr)->* TO <fs>.", rel: Release.v757},
  {abap: "ASSIGN ref->('comp') TO <fs>.", rel: Release.v757},
  {abap: "ASSIGN ref->(`comp`) TO <fs>.", rel: Release.v757},
  {abap: "ASSIGN struc-('comp') TO <fs>.", rel: Release.v757},
  {abap: "ASSIGN ref->(comp_name->*) TO <fs>.", rel: Release.v757},
  {abap: "ASSIGN itab[ 1 ]->(dyn_cmp) TO <fs>.", rel: Release.v757},
  {abap: "ASSIGN itab[ 1 ]->(dyn_cmp)->* TO <fs>.", rel: Release.v757},
  {abap: "ASSIGN ref->(comp_name)-(comp2) TO <fs>.", rel: Release.v757},
];

statementVersionOk(v757, "ASSIGN dynamic component/ref access v757", Statements.Assign);

const v757fail = [
  {abap: "ASSIGN ref->( comp ) TO <fs>.", rel: Release.v757},
  {abap: "ASSIGN ref->( comp) TO <fs>.", rel: Release.v757},
  {abap: "ASSIGN ref->(comp ) TO <fs>.", rel: Release.v757},
  {abap: "ASSIGN struc-( comp ) TO <fs>.", rel: Release.v757},
  {abap: "ASSIGN struc-( comp) TO <fs>.", rel: Release.v757},
  {abap: "ASSIGN struc-(comp ) TO <fs>.", rel: Release.v757},
];

statementVersionFail(v757fail, "ASSIGN dynamic access with internal whitespace");

const keyUserFail = [
  // INCREMENT addition blocked
  {abap: `ASSIGN lv INCREMENT 1 TO <fs>.`, rel: Release.Newest, langVer: LanguageVersion.KeyUser},
  // dynamic symbol name (dyn_sym) blocked
  {abap: `ASSIGN (lv_sym) TO <fs>.`, rel: Release.Newest, langVer: LanguageVersion.KeyUser},
  // class=>(dyn_attr) via static arrow blocked
  {abap: `ASSIGN class=>(lv_attr) TO <fs>.`, rel: Release.Newest, langVer: LanguageVersion.KeyUser},
  // CASTING TYPE (dyn_type) blocked
  {abap: `ASSIGN lv TO <fs> CASTING TYPE (lv_type).`, rel: Release.Newest, langVer: LanguageVersion.KeyUser},
];

statementVersionFail(keyUserFail, "ASSIGN KeyUser restrictions");

const keyUserOk = [
  // ref->(comp) via instance arrow allowed
  {abap: `ASSIGN lv->(lv_comp) TO <fs>.`, rel: Release.Newest, langVer: LanguageVersion.KeyUser},
];

statementVersionOk(keyUserOk, "ASSIGN KeyUser allowed variants", Statements.Assign);