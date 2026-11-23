import {expect} from "chai";
import {testRule} from "./_utils";
import {ParserMissingSpace} from "../../src/rules/parser_missing_space";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {IRegistry} from "../../src/_iregistry";

const tests = [
  {abap: "ro_html->add('foo' && 'bar' ).", cnt: 1},
  {abap: "moo('sdf').", cnt: 1},
  {abap: "moo( bar).", cnt: 1},
  {abap: "moo( 'sdf' ).", cnt: 0},
  {abap: "moo( bar ).", cnt: 0},
  {abap: "moo( 'sdf').", cnt: 1},
  {abap: "moo('sdf' ).", cnt: 1},
  {abap: "PERFORM ('DYNAMIC').", cnt: 0},
  {abap: "IF ( foo = 'bar').", cnt: 1},
  {abap: "IF ( foo = 'bar' ).", cnt: 0},
  {abap: "IF (foo = 'bar' ).", cnt: 1},
  {abap: "IF (method( ) = 2 ).", cnt: 1},
  {abap: "IF token-str EQ'RETURNING'. ENDIF.", cnt: 1},
  {abap: "IF bar ='RETURNING'. ENDIF.", cnt: 1},
  {abap: "IF token-str EQ 'RETURNING'. ENDIF.", cnt: 0},
  {abap: "IF bar = 'RETURNING'. ENDIF.", cnt: 0},
  {abap: "DATA(test) = VALUE string_table( ( `( 1 =`) ).", cnt: 1},
  {abap: "DATA(test) = VALUE string_table( (`( 1 =` ) ).", cnt: 1},
  {abap: "DATA(test) = VALUE string_table( ( `( 1 =` ) ).", cnt: 0},
  {abap: `SELECT * FROM t100 WHERE ( msgnr BETWEEN '001' AND '010' OR msgnr = '050').`, cnt: 1},
  {abap: `SELECT * FROM t100 WHERE ( msgnr BETWEEN '001' AND '010' OR msgnr = '050' ).`, cnt: 0},
  {abap: "LOOP AT tab WHERE ( field EQ 'B' ).", cnt: 0},
  {abap: "LOOP AT tab WHERE ( field EQ 'B').", cnt: 1},
  {abap: "RAISE EXCEPTION NEW zcx_excel( i_message = 'Worksheet not found.' ).", cnt: 0},
  {abap: "RAISE EXCEPTION NEW zcx_excel( i_message = 'Worksheet not found.').", cnt: 1},
  {abap: "RAISE EXCEPTION NEW zcx_excel( i_message).", cnt: 1},
  {abap: "rv_empty = boolc( strlen( mv_str) = 0 ).", cnt: 1},
  {abap: "rv_empty = boolc( strlen( mv_str ) = 0 ).", cnt: 0},
  {abap: "cl_abap_unit_assert=>assert_initial( cut->parse( `Portable Network Graphics`) ).", cnt: 1},
  {abap: "cl_abap_unit_assert=>assert_initial( cut->parse( `Portable Network Graphics` ) ).", cnt: 0},
  {abap: "DATA(ls_foo) = VALUE foo( tknum = '0000000001').", cnt: 1},
  {abap: "DATA(ls_foo) = VALUE foo( tknum = '0000000001' ).", cnt: 0},
  {abap: "foo = CONV #('DEFAULT' ).", cnt: 1},
  {abap: "DATA(subrc) = CONV sy-subrc( syst-subrc ). ", cnt: 0},
  {abap: "DATA(foo) = xsdbool( line_exists( positions[ ('MATERIAL') = <position>-material ] ) ).", cnt: 0},
  {abap: "IF is_abc( )= abap_true. ENDIF.", cnt: 1},
  {abap: "DATA(lv)= ( 1 + 2 ).", cnt: 1},
  {abap: "DATA(lv)= 1 + 2.", cnt: 1},
];

testRule(tests, ParserMissingSpace);

describe("parser_missing_space, long statements", function () {
  // note that timeout() only works inside function()
  this.timeout(250);

  // 500 operands stays below the depth where the parser exhausts the call stack in a fresh process
  const concatenation = "result = " + Array.from({length: 500}, () => "`a`").join(" && ") + ".";

  let reg: IRegistry;

  before(function () {
    // parsing is not what is measured, it gets its own time limit
    this.timeout(5000);
    const abap = Array.from({length: 10}, () => concatenation).join("\n");
    reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap)).parse();
  });

  it("ten 500 operand string concatenations, checked within the time limit", () => {
    const issues = new ParserMissingSpace().initialize(reg).run(reg.getFirstObject()!);
    expect(issues.length).to.equals(0);
  });
});

describe("parser_missing_space, issue positions", () => {
  const positions = [
    {abap: "DATA(ls_foo) = VALUE foo( tknum = '0000000001').", col: 48},
    {abap: "foo = CONV #('DEFAULT' ).", col: 14},
  ];

  for (const test of positions) {
    it("\"" + test.abap + "\" reported at column " + test.col, () => {
      const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", test.abap)).parse();
      const issues = new ParserMissingSpace().initialize(reg).run(reg.getFirstObject()!);
      expect(issues.length).to.equals(1);
      expect(issues[0].getStart().getRow()).to.equal(1);
      expect(issues[0].getStart().getCol()).to.equal(test.col);
    });
  }
});