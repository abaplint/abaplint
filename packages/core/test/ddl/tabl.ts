import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {DDLLexer} from "../../src/ddl/ddl_lexer";
import {DDLParser, DDLKind} from "../../src/ddl/ddl_parser";

function parse(src: string): ReturnType<DDLParser["parse"]> {
  return new DDLParser().parse(new MemoryFile("test.tabl.astablds", src));
}

describe("DDL Lexer", () => {

  it("basic tokenization of define structure", () => {
    const ddl = `define structure sdfsd {
      field1 : type1;
    }`;
    const result = DDLLexer.run(new MemoryFile("test.tabl.astablds", ddl));
    expect(result.length).to.equal(9);
  });

});

describe("DDL Parser — define structure", () => {

  it("simple structure with one field", () => {
    const r = parse(`define structure s {
      field1 : type1;
    }`);
    expect(r?.name).to.equal("s");
    expect(r?.kind).to.equal(DDLKind.Structure);
    expect(r?.fields.length).to.equal(1);
    expect(r?.fields[0]).to.deep.include({name: "field1", type: "type1", key: false, notNull: false});
  });

  it("structure with leading annotations", () => {
    const r = parse(`@EndUserText.label : 'sdfsd'
@AbapCatalog.enhancement.category : #NOT_EXTENSIBLE
define structure zsdfsd {
  sdfsd : abap.string(0);
}`);
    expect(r?.name).to.equal("zsdfsd");
    expect(r?.kind).to.equal(DDLKind.Structure);
    expect(r?.fields.length).to.equal(1);
    expect(r?.fields[0].type).to.equal("abap.string(0)");
  });

  it("structure with include", () => {
    const r = parse(`define structure name {
      field1 : type1;
      include foobar;
    }`);
    expect(r?.fields.length).to.equal(2);
    expect(r?.fields[1]).to.deep.include({name: ".INCLUDE", type: "foobar", key: false});
  });

  it("structure with named include", () => {
    const r = parse(`define structure /dmo/s {
      travel_id : abap.char(16);
      _intx     : include /dmo/other;
    }`);
    expect(r?.fields.length).to.equal(2);
    expect(r?.fields[1]).to.deep.include({name: "_intx", type: "/dmo/other", key: false});
  });

  it("structure field with NOT NULL", () => {
    const r = parse(`define structure s {
      parent : abap.raw(16) not null;
      opt    : abap.char(10);
    }`);
    expect(r?.fields[0].notNull).to.equal(true);
    expect(r?.fields[1].notNull).to.equal(false);
  });

});

describe("DDL Parser — define table", () => {

  it("simple table with client key", () => {
    const r = parse(`define table ztabl_demo {
      key client : abap.clnt not null;
      foo        : abap.int2;
    }`);
    expect(r?.name).to.equal("ztabl_demo");
    expect(r?.kind).to.equal(DDLKind.Table);
    expect(r?.fields.length).to.equal(2);
    expect(r?.fields[0]).to.deep.include({name: "client", type: "abap.clnt", key: true, notNull: true});
    expect(r?.fields[1]).to.deep.include({name: "foo", type: "abap.int2", key: false, notNull: false});
  });

  it("abap.dec(len,dec) type", () => {
    const r = parse(`define table t {
      key id : abap.int1 not null;
      amt    : abap.dec(21,7);
    }`);
    expect(r?.fields[1].type).to.equal("abap.dec(21,7)");
  });

  it("data-element type", () => {
    const r = parse(`define table t {
      key mandt : mandt not null;
      user      : abap.char(12);
    }`);
    expect(r?.fields[0].type).to.equal("mandt");
    expect(r?.fields[1].type).to.equal("abap.char(12)");
  });

  it("slash-prefixed table and type names", () => {
    const r = parse(`define table /dmo/carr {
      key mandt : mandt not null;
      cid       : /dmo/carrier_id;
    }`);
    expect(r?.name).to.equal("/dmo/carr");
    expect(r?.fields[1].type).to.equal("/dmo/carrier_id");
  });

  it("KEY and NOT NULL extraction", () => {
    const r = parse(`define table t {
      key mandt  : abap.clnt not null;
      key id     : abap.char(10) not null;
      body_only  : abap.char(20);
      key_only   : abap.char(20) not null;
    }`);
    expect(r?.fields.length).to.equal(4);
    expect(r?.fields[0]).to.deep.include({key: true, notNull: true});
    expect(r?.fields[1]).to.deep.include({key: true, notNull: true});
    expect(r?.fields[2]).to.deep.include({key: false, notNull: false});
    expect(r?.fields[3]).to.deep.include({key: false, notNull: true});
  });

  it("inline annotation before a field does not lose KEY", () => {
    const r = parse(`define table t {
      key mandt : mandt not null;
      @AbapCatalog.anonymizedWhenDelivered : true
      key username : abap.char(12) not null;
    }`);
    expect(r?.fields.length).to.equal(2);
    expect(r?.fields[1]).to.deep.include({name: "username", key: true, notNull: true});
  });

  it("multiple inline annotations before a field", () => {
    const r = parse(`define table t {
      @Semantics.user.createdBy : true
      @AbapCatalog.anonymizedWhenDelivered : true
      createdby : abap.char(12);
    }`);
    expect(r?.fields.length).to.equal(1);
    expect(r?.fields[0].name).to.equal("createdby");
  });

  it("plain include", () => {
    const r = parse(`define table t {
      key mandt : mandt not null;
      include zdemo_inc;
    }`);
    expect(r?.fields[1]).to.deep.include({name: ".INCLUDE", type: "zdemo_inc", key: false});
  });

  it("key include", () => {
    const r = parse(`define table t {
      key mandt : mandt not null;
      key include zdemo_inc;
    }`);
    expect(r?.fields[1]).to.deep.include({name: ".INCLUDE", key: true});
  });

  it("named include with quoted alias", () => {
    const r = parse(`define table t {
      key mandt : mandt not null;
      "%admin"  : include zdemo_inc;
    }`);
    expect(r?.fields.length).to.equal(2);
    expect(r?.fields[1]).to.deep.include({name: `"%admin"`, type: "zdemo_inc"});
  });

  it("named include with WITH SUFFIX", () => {
    const r = parse(`define table t {
      key mandt : mandt not null;
      "_ext"    : include zdemo_ext with suffix ext;
    }`);
    expect(r?.fields.length).to.equal(2);
    expect(r?.fields[1].name).to.equal(`"_ext"`);
  });

  it("field with WITH FOREIGN KEY clause", () => {
    const r = parse(`define table ztabl_order {
      key mandt  : abap.clnt not null;
      key carrid : abap.char(3) not null
        with foreign key ztabl_carrier where ztabl_carrier.mandt = ztabl_order.mandt
                                         and ztabl_carrier.carrid = ztabl_order.carrid;
    }`);
    expect(r?.fields.length).to.equal(2);
    expect(r?.fields[1]).to.deep.include({name: "carrid", key: true, notNull: true});
  });

  it("field with foreign key and cardinality", () => {
    const r = parse(`define table ztabl_order {
      key mandt  : abap.clnt not null;
      key carrid : abap.char(3) not null
        with foreign key [1..*,1] ztabl_carrier where ztabl_carrier.mandt = ztabl_order.mandt;
    }`);
    expect(r?.fields.length).to.equal(2);
    expect(r?.fields[1].notNull).to.equal(true);
  });

  it("field with WITH VALUE HELP clause", () => {
    const r = parse(`define table t {
      key mandt : mandt not null;
      status    : abap.char(1) with value help zdemo_vh;
    }`);
    expect(r?.fields[1]).to.deep.include({name: "status", type: "abap.char(1)"});
  });

  it("value help with WHERE and string literal", () => {
    const r = parse(`define table t {
      key mandt : mandt not null;
      status    : abap.char(1) with value help zdemo_vh where status = 'A';
    }`);
    expect(r?.fields.length).to.equal(2);
  });

  it("EXTEND clause inside define table", () => {
    const r = parse(`define table t {
      key mandt : mandt not null;
      extend country : with foreign key ztabl_country;
    }`);
    // extend clauses aren't reported as fields (they mutate an existing field)
    expect(r?.name).to.equal("t");
    expect(r?.fields.length).to.be.greaterThan(0);
  });

});

describe("DDL Parser — define aspect", () => {

  it("simple aspect", () => {
    const r = parse(`define aspect zdemo_aspect {
      key task_name : abap.char(40);
      key task_user : abap.char(12);
    }`);
    expect(r?.name).to.equal("zdemo_aspect");
    expect(r?.kind).to.equal(DDLKind.Aspect);
    expect(r?.fields.length).to.equal(2);
    expect(r?.fields[0]).to.deep.include({name: "task_name", type: "abap.char(40)", key: true});
  });

  it("aspect with annotations and typed fields", () => {
    const r = parse(`@EndUserText.label: 'Aspect'
define aspect a {
  key id  : abap.int4 not null;
  label   : abap.char(30);
}`);
    expect(r?.kind).to.equal(DDLKind.Aspect);
    expect(r?.fields[0]).to.deep.include({key: true, notNull: true});
  });

  it("aspect with include", () => {
    const r = parse(`define aspect a {
      key id : abap.int4 not null;
      include some_other_aspect;
    }`);
    expect(r?.fields.length).to.equal(2);
    expect(r?.fields[1].name).to.equal(".INCLUDE");
  });

  it("aspect with named include", () => {
    const r = parse(`define aspect a {
      key id : abap.int4 not null;
      "_x"   : include another_aspect;
    }`);
    expect(r?.fields.length).to.equal(2);
    expect(r?.fields[1]).to.deep.include({name: `"_x"`, type: "another_aspect"});
  });

});

describe("DDL Parser — extend type", () => {

  it("basic extend type", () => {
    const r = parse(`@EndUserText.label : 'append'
@AbapCatalog.enhancement.category : #EXTENSIBLE_ANY
extend type /dmo/base with /dmo/base_append {
  append_field : abap.char(10);
}`);
    expect(r?.kind).to.equal(DDLKind.ExtendType);
    expect(r?.fields.length).to.equal(1);
    expect(r?.fields[0].name).to.equal("append_field");
  });

  it("extend type with typed and typed-not-null fields", () => {
    const r = parse(`extend type /dmo/base with /dmo/base_x {
      destination_risk : /dmo/destination_risk;
      required_flag    : abap.char(1) not null;
    }`);
    expect(r?.fields.length).to.equal(2);
    expect(r?.fields[1].notNull).to.equal(true);
  });

});

describe("DDL Parser — negative cases", () => {

  it("garbage returns undefined", () => {
    expect(parse("this is not DDL")).to.equal(undefined);
  });

  it("truncated define returns undefined", () => {
    expect(parse("define table t { key id : abap.int4 not null")).to.equal(undefined);
  });

  it("unknown top-level keyword returns undefined", () => {
    expect(parse("declare thing x { }")).to.equal(undefined);
  });

});
