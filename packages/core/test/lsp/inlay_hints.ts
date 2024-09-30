import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {InlayHints} from "../../src/lsp/inlay_hints";

const filename: string = "inlayhints.prog.abap";

describe("LSP, Inlay Hints", () => {

  it("parser error", () => {
    const file = new MemoryFile(filename, "sdfsdfds");
    const reg = new Registry().addFile(file).parse();
    const found = new InlayHints(reg).list({uri: filename});
    expect(found.length).to.equal(0);
  });

  it("NEW", () => {
    const file = new MemoryFile(filename, `
CLASS lcl DEFINITION.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
ENDCLASS.
START-OF-SELECTION.
  DATA ref TYPE REF TO lcl.
  ref = NEW #( ).`);
    const reg = new Registry().addFiles([file]).parse();
    const found = new InlayHints(reg).list({uri: filename});
    expect(found.length).to.equal(2);
  });

  it("CONV", () => {
    const file = new MemoryFile(filename, `
  DATA val TYPE i.
  val = CONV #( '1' ).`);
    const reg = new Registry().addFiles([file]).parse();
    const found = new InlayHints(reg).list({uri: filename});
    expect(found.length).to.equal(2);
  });

  it("INSERT VALUE", () => {
    const file = new MemoryFile(filename, `
TYPES: BEGIN OF ty,
         foo TYPE i,
       END OF ty.
DATA tab TYPE STANDARD TABLE OF ty WITH EMPTY KEY.
INSERT VALUE #( ) INTO TABLE tab.`);
    const reg = new Registry().addFiles([file]).parse();
    const found = new InlayHints(reg).list({uri: filename});
    expect(found.length).to.equal(2);
  });

  it("VALUE and CONV", () => {
    const file = new MemoryFile(filename, `
TYPES ty_integers TYPE STANDARD TABLE OF i WITH EMPTY KEY.
DATA lt_strings TYPE STANDARD TABLE OF string WITH EMPTY KEY.
DATA lt_integers TYPE ty_integers.
lt_integers = VALUE #( FOR row IN lt_strings ( CONV #( row ) ) ).`);
    const reg = new Registry().addFiles([file]).parse();
    const found = new InlayHints(reg).list({uri: filename});
    expect(found.length).to.equal(4);
  });

  it("CORRESPONDING", () => {
    const file = new MemoryFile(filename, `
TYPES: BEGIN OF ty,
         blah TYPE i,
       END OF ty.
DATA val1 TYPE ty.
DATA val2 TYPE ty.
val1 = CORRESPONDING #( val2 ).`);
    const reg = new Registry().addFiles([file]).parse();
    const found = new InlayHints(reg).list({uri: filename});
    expect(found.length).to.equal(2);
  });

  it("Subfield inferred", () => {
    const file = new MemoryFile(filename, `
TYPES: BEGIN OF ty_sub,
             foo TYPE i,
           END OF ty_sub.

TYPES: BEGIN OF ty_top,
         BEGIN OF field,
           subfield TYPE STANDARD TABLE OF ty_sub WITH DEFAULT KEY,
         END OF field,
       END OF ty_top.

DATA(val) = VALUE ty_top-field( subfield = VALUE #( ( foo = 2 ) ) ).`);
    const reg = new Registry().addFiles([file]).parse();
    const found = new InlayHints(reg).list({uri: filename});
    expect(found.length).to.equal(2);
    expect(found[0].label).to.include("TYPE STANDARD TABLE OF ty_sub");
    expect(found[1].label).to.include("TYPE ty_top-field");
  });

  it("Subfield inferred, in class", () => {
    const file = new MemoryFile(filename, `
CLASS lcl DEFINITION.
  PUBLIC SECTION.
    TYPES: BEGIN OF ty_sub,
             foo TYPE i,
           END OF ty_sub.

    TYPES: BEGIN OF ty_top,
             BEGIN OF field,
               subfield TYPE STANDARD TABLE OF ty_sub WITH DEFAULT KEY,
             END OF field,
           END OF ty_top.
ENDCLASS.
CLASS lcl IMPLEMENTATION.
ENDCLASS.

DATA(val) = VALUE lcl=>ty_top-field( subfield = VALUE #( ( foo = 2 ) ) ).`);
    const reg = new Registry().addFiles([file]).parse();
    const found = new InlayHints(reg).list({uri: filename});
    expect(found.length).to.equal(2);
    expect(found[0].label).to.include("TYPE STANDARD TABLE OF lcl=>ty_sub");
    expect(found[1].label).to.include("TYPE lcl=>ty_top-field");
  });

  it("Inline Data", () => {
    const file = new MemoryFile(
      filename,
      `DATA(val) = 4.`
    );
    const reg = new Registry().addFiles([file]).parse();
    const found = new InlayHints(reg).list({uri: filename});
    expect(found.length).to.equal(1);
    expect(found[0].label).to.equal("TYPE i");
  });
});