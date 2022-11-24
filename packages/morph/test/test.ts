import {expect} from "chai";
import {Project} from "ts-morph";
import {handleStatement} from "../src/statements";

function test(ts: string) {
  const project = new Project();
  const file = project.createSourceFile("input.ts", ts);

  const diagnostics = project.getPreEmitDiagnostics();
  if (diagnostics.length > 0) {
    console.log(project.formatDiagnosticsWithColorAndContext(diagnostics));
    return undefined;
  } else {
    let result = "";
    for (const s of file.getStatements()) {
      result += handleStatement(s);
    }
    return result.trim();
  }
}

describe("Morph", () => {

  it("test", async () => {
    const ts = `let foo: number = 5;`;
    const abap = `DATA(foo) = 5.`;
    expect(test(ts)).to.equal(abap.trim());
  });

  it("return type", async () => {
    const ts = `
type foo = {bar: number};
class lcl {
  public run(): foo {
    return {bar: 2};
  }
}`;
    const abap = `
TYPES BEGIN OF foo.
  TYPES bar TYPE i.
TYPES END OF foo.
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    METHODS run RETURNING VALUE(return) TYPE foo.
ENDCLASS.

CLASS lcl IMPLEMENTATION.
  METHOD run.
return = VALUE #( bar = 2 ).
RETURN.
  ENDMETHOD.

ENDCLASS.`;
    expect(test(ts)).to.equal(abap.trim());
  });

  it("trim", async () => {
    const ts = `
let foo: string = "foo";
let bar: string = "foo";
foo = bar.trim();`;
    const abap = `
DATA(foo) = |foo|.
DATA(bar) = |foo|.
foo = condense( bar ).`;
    expect(test(ts)).to.equal(abap.trim());
  });

  it("data def, undefined init", async () => {
    const ts = `
class Token { }
let foo: Token | undefined = undefined;`;
    const abap = `
CLASS Token DEFINITION.
  PUBLIC SECTION.
ENDCLASS.

CLASS Token IMPLEMENTATION.
ENDCLASS.
DATA foo TYPE REF TO Token.
CLEAR foo.`;
    expect(test(ts)).to.equal(abap.trim());
  });

  it("replace with regex", async () => {
    const ts = `
let foo = "sdfs";
foo = foo.replace(/s/g, "");`;
    const abap = `
DATA(foo) = |sdfs|.
foo = replace( val = foo regex = |s| with = || ).`;
    expect(test(ts)).to.equal(abap.trim());
  });

  it("charAt", async () => {
    const ts = `
let foo = "sdfs";
foo = foo.charAt( 0 );`;
    const abap = `
DATA(foo) = |sdfs|.
foo = substring( val = foo len = 1 off = 0 ).`;
    expect(test(ts)).to.equal(abap.trim());
  });

  it("constructor in super", async () => {
    const ts = `
export abstract class Token {
  private readonly start: string;
  private readonly str: string;

  public constructor(start: string, str: string) {
    this.start = start;
    this.str = str;
  }
}
class Comment extends Token {
}
new Comment("foo", "bar");`;
    const abap = `
CLASS Token DEFINITION.
  PUBLIC SECTION.
    METHODS constructor IMPORTING start TYPE string str TYPE string.
  PRIVATE SECTION.
    DATA start TYPE string.
    DATA str TYPE string.
ENDCLASS.

CLASS Token IMPLEMENTATION.
  METHOD constructor.
me->start = start.
me->str = str.
  ENDMETHOD.

ENDCLASS.
CLASS Comment DEFINITION INHERITING FROM Token.
  PUBLIC SECTION.
ENDCLASS.

CLASS Comment IMPLEMENTATION.
ENDCLASS.
NEW Comment( start = |foo| str = |bar| ).`;
    expect(test(ts)).to.equal(abap.trim());
  });

  it("array push", async () => {
    const ts = `
const foo: string[] = [];
foo.push( "hello" );`;
    const abap = `
DATA foo TYPE string_table.
CLEAR foo.
foo = VALUE #( BASE foo ( |hello| ) ).`;
    expect(test(ts)).to.equal(abap.trim());
  });

  it("enum", async () => {
    const ts = `
enum Mode {
  Normal,
  Ping,
}
let foo: Mode;
foo = Mode.Normal;`;
    const abap = `
CONSTANTS BEGIN OF Mode.
  CONSTANTS Normal TYPE i VALUE 1.
  CONSTANTS Ping TYPE i VALUE 2.
CONSTANTS END OF Mode.
DATA foo TYPE i.
CLEAR foo.
foo = Mode-Normal.`;
    expect(test(ts)).to.equal(abap.trim());
  });

  it("if not undefined", async () => {
    const ts = `
class Position { }
let virtual: Position | undefined;
if (virtual) { }`;
    const abap = `
CLASS Position DEFINITION.
  PUBLIC SECTION.
ENDCLASS.

CLASS Position IMPLEMENTATION.
ENDCLASS.
DATA virtual TYPE REF TO Position.
CLEAR virtual.
IF virtual IS NOT INITIAL.
ENDIF.`;
    expect(test(ts)).to.equal(abap.trim());
  });

  it("if not undefined, chain", async () => {
    const ts = `
class Position {
  private virtual: Position | undefined;

  public foo() {
    if (this.virtual) { }
  }
}`;
    const abap = `
CLASS Position DEFINITION.
  PUBLIC SECTION.
    METHODS foo.
  PRIVATE SECTION.
    DATA virtual TYPE REF TO Position.
ENDCLASS.

CLASS Position IMPLEMENTATION.
  METHOD foo.
IF me->virtual IS NOT INITIAL.
ENDIF.
  ENDMETHOD.

ENDCLASS.`;
    expect(test(ts)).to.equal(abap.trim());
  });

  it("constructor parameter names", async () => {
    const ts = `
class Position {
  private priv: number;
  public constructor(inp1: number, inp2: number) {
    this.priv = inp1 + inp2;
  }
}
let foo = new Position( 1, 2 );`;
    const abap = `
CLASS Position DEFINITION.
  PUBLIC SECTION.
    METHODS constructor IMPORTING inp1 TYPE i inp2 TYPE i.
  PRIVATE SECTION.
    DATA priv TYPE i.
ENDCLASS.

CLASS Position IMPLEMENTATION.
  METHOD constructor.
me->priv = inp1 + inp2.
  ENDMETHOD.

ENDCLASS.
DATA(foo) = NEW Position( inp1 = 1 inp2 = 2 ).`;
    expect(test(ts)).to.equal(abap.trim());
  });

  it("if equals undefined", async () => {
    const ts = `
class Position {}
let p: Position | undefined = undefined;
if (p === undefined) {
}`;
    const abap = `
CLASS Position DEFINITION.
  PUBLIC SECTION.
ENDCLASS.

CLASS Position IMPLEMENTATION.
ENDCLASS.
DATA p TYPE REF TO Position.
CLEAR p.
IF p IS INITIAL.
ENDIF.`;
    expect(test(ts)).to.equal(abap.trim());
  });

  it("private static class attribute", async () => {
    const ts = `
class Position {
  private static foo: number;
}`;
    const abap = `
CLASS Position DEFINITION.
  PUBLIC SECTION.
  PRIVATE SECTION.
    CLASS-DATA foo TYPE i.
ENDCLASS.

CLASS Position IMPLEMENTATION.
ENDCLASS.`;
    expect(test(ts)).to.equal(abap.trim());
  });

  it("split", async () => {
    const ts = `
let foo = "hello";
let result = foo.split("l");`;
    const abap = `
DATA(foo) = |hello|.
DATA(result) = REDUCE string_table( LET split_input = foo
  split_by    = |l|
  offset      = 0
  IN
  INIT string_result = VALUE string_table( )
       add = ||
  FOR index = 0 WHILE index <= strlen( split_input )
  NEXT
  string_result = COND #(
      WHEN index = strlen( split_input ) OR split_input+index(1) = split_by
      THEN VALUE #( BASE string_result ( add ) )
      ELSE string_result )
    add    = COND #(
      WHEN index = strlen( split_input ) OR split_input+index(1) = split_by
      THEN ||
      ELSE |{ add }{ split_input+index(1) }| ) ).`;
    expect(test(ts)).to.equal(abap.trim());
  });

  it("array element access", async () => {
    const ts = `
let foo: string[] = [];
let bar = foo[0];`;
    const abap = `
DATA foo TYPE string_table.
CLEAR foo.
DATA(bar) = foo[ 0 + 1 ].`;
    expect(test(ts)).to.equal(abap.trim());
  });

  it("optional method parameter", async () => {
    const ts = `
class Position {
  public foo(val: string, opt?: string) { }
}`;
    const abap = `
CLASS Position DEFINITION.
  PUBLIC SECTION.
    METHODS foo IMPORTING val TYPE string opt TYPE string OPTIONAL.
ENDCLASS.

CLASS Position IMPLEMENTATION.
  METHOD foo.
  ENDMETHOD.

ENDCLASS.`;
    expect(test(ts)).to.equal(abap.trim());
  });

  it("implements interface", async () => {
    const ts = `
interface IFace {
  foo(): string;
}
class Position implements IFace {
  public foo(): string {
    return "hello";
  }
}`;
    const abap = `
INTERFACE IFace.
  METHODS foo RETURNING VALUE(return) TYPE string.
ENDINTERFACE.

CLASS Position DEFINITION.
  PUBLIC SECTION.
    INTERFACES IFace.
    ALIASES foo FOR IFace~foo.
ENDCLASS.

CLASS Position IMPLEMENTATION.
  METHOD foo.
return = |hello|.
RETURN.
  ENDMETHOD.

ENDCLASS.`;
    expect(test(ts)).to.equal(abap.trim());
  });

});