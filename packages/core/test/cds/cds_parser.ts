import {MemoryFile} from "../../src";
import {expect} from "chai";
import {CDSLexer} from "../../src/cds/cds_lexer";
import {CDSParser} from "../../src/cds/cds_parser";
import {ExpressionNode} from "../../src/abap/nodes";

describe("CDS Parser", () => {

  it("basic", () => {
    const cds = `@AbapCatalog.sqlViewName: 'ZSDF'
define view zhvamfoocust as select from zhvam_cust {
  key foo as sdfdsf
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const result = CDSLexer.run(file);
    expect(result.length).to.equal(18);

    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("ending with colon", () => {
    const cds = `@AbapCatalog.sqlViewName: 'ZSDF'
define view zhvamfoocust as select from zhvam_cust {
  key foo as sdfdsf
};`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("two fields", () => {
    const cds = `@AbapCatalog.sqlViewName: 'ZSDF'
    define view zhvamfoocust as select from zhvam_cust {
        key foo as sdfdsf,
        client
    };`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("more annotations", () => {
    const cds = `@AbapCatalog.sqlViewName: 'ZAG_UNIT_TEST_V'
@AbapCatalog.compiler.compareFilter: true
@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'Hello'
define view ZAG_UNIT_TEST
  as select from tadir
{
  pgmid,
  object,
  obj_name
} `;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("element annotation", () => {
    const cds = `@AbapCatalog.sqlViewName: 'ZSDF'
    define view zhvamfoocust as select from zhvam_cust {
        key foo as sdfdsf,
        @Semantics.language
        client
    };`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("numbers", () => {
    const cds = `@AbapCatalog.sqlViewName: 'ZSDF'
    define view zhvamf3oocust as select from zhv3am_cust {
        key fo3o as sdf3dsf,
        cli3ent
    };`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("single quoted text containing spaces", () => {
    const cds = `@AbapCatalog.sqlViewName: 'ZSDF'
@EndUserText.label: 'foo bar hello world'
define view zhvamfoocust as select from zhvam_cust {
  key foo as sdfdsf,
  sdfds
};`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("underscore in annotation value", () => {
    const cds = `@AbapCatalog.sqlViewName: 'ZSDF'
@AccessControl.authorizationCheck: #NOT_ALLOWED
define view zhvamfoocust as select from zhvam_cust {
  key foo as sdfdsf,
  sdfds
};`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("single line comment", () => {
    const cds = `@AbapCatalog.sqlViewName: 'ZSDF'
define view zhvamfoocust as select from zhvam_cust {
  // sdfdsfjsl jfsdlkfds lkjfds fdslkfds lkjfds lkfs
  key foo as sdfdsf
};`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("association", () => {
    const cds = `@AbapCatalog.sqlViewName: 'ZSDF'
define view zhvamfoocust as select from zhvam_cust
association [1..1] to I_CalendarQuarter as _CalendarQuarter on $projection.CalendarQuarter = _CalendarQuarter.CalendarQuarter
{
  // sdfdsfjsl jfsdlkfds lkjfds fdslkfds lkjfds lkfs
  key foo as sdfdsf
};`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("numeric annotation value", () => {
    const cds = `@AbapCatalog.buffering.numberOfKeyFields: 2
define view zhvamfoocust as select from zhvam_cust
{
  key foo as sdfdsf
};`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("decimal annotation value", () => {
    const cds = `define view zhvamfoocust as select from zhvam_cust
{
  @Search.fuzzinessThreshold: 0.8
  key foo as sdfdsf
};`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("nested annotation value", () => {
    const cds = `@Analytics: {dataExtraction.enabled: true}
define view zhvamfoocust as select from zhvam_cust
{
  key foo as sdfdsf
};`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("cast", () => {
    const cds = `define view zhvamfoocust as select from zhvam_cust
{
  key cast(foo as bar) as sdfdsf
};`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("where", () => {
    const cds = `define view zhvamfoocust as select from zhvam_cust
{
  key foo as sdfdsf
} WHERE foo.bar = 'A'`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("qualified name", () => {
    const cds = `define view zhvamfoocust as select from zhvam_cust
{
  key zhvam_cust.foo as sdfdsf
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("another annotation case", () => {
    const cds = `@Analytics : {dataCategory: #DIMENSION, dataExtraction.enabled : true}
define view zhvamfoocust as select from zhvam_cust
{
  key zhvam_cust.foo as sdfdsf
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("double nested annotation case", () => {
    const cds = `@Analytics:{ dataExtraction: { enabled: true } }
define view zhvamfoocust as select from zhvam_cust
{
  key zhvam_cust.foo as sdfdsf
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("more cast", () => {
    const cds = `
define view zhvamfoocust as select from zhvam_cust
{
  key zhvam_cust.foo as sdfdsf,
  cast ( substring( cast( foo.from_timestamp as abap.char( 17 ) ), 1, 8 ) as abap.dats ) as ValidityStartDate
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("dash in text", () => {
    const cds = `@EndUserText.label: 'Status - Text'
define view zhvamfoocust as select from zhvam_cust
{
  key zhvam_cust.foo as sdfdsf
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("abstract entity", () => {
    const cds = `
    define abstract entity sdfdsfds
    {
      key TransportRequestID : trkorr;
    }`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("multi line comment", () => {
    const cds = `
    /*+[hideWarning] { "IDS" : [ "CARDINALITY_CHECK" ]  }       UserID is not key of sdfds*/
    define abstract entity sdfdsfds
    {
      key TransportRequestID : trkorr;
    }`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("CASE function", () => {
    const cds = `
@AbapCatalog.sqlViewName: 'ZSDF'
define view zhvamfoocust as select from I_asdfsd {
     case substring('sdf', 1, 2)
       when 'YY' then 'X'
       else  ''
       end as sdf
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("compare operators, without preceding or trailing spaces", () => {
    const cds = `
@AbapCatalog.sqlViewName: 'ZSDF'
define view zhvamfoocust as select from I_asdfsd {
  case
    when I_asdfsd.Name='' then 2
    when I_asdfsd.Name<'' then 2
    when I_asdfsd.Name>'' then 2
    else 1
  end as sdf
}
`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("compare operator ne", () => {
    const cds = `
@AbapCatalog.sqlViewName: 'ZSDF'
define view zhvamfoocust as select from I_asdfsd {
  case
    when I_asdfsd.Name <> '' then 2
    else 1
  end as sdf
}
`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("compare operator ge", () => {
    const cds = `
@AbapCatalog.sqlViewName: 'ZSDF'
define view zhvamfoocust as select from I_asdfsd {
  case
    when I_asdfsd.Name >= '' then 2
    else 1
  end as sdf
}
`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("compare operator le", () => {
    const cds = `
@AbapCatalog.sqlViewName: 'ZSDF'
define view zhvamfoocust as select from I_asdfsd {
  case
    when I_asdfsd.Name <= '' then 2
    else 1
  end as sdf
}
`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("provider contract projection", () => {
    const cds = `
define root view entity name1
  provider contract name2
  as projection on name3
{
  key field1,
      field2
}
`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("abstract without key", () => {
    const cds = `
define abstract entity name1
{
  name2 : type2;
  name3 : type3;
}
`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("abstract with abap type", () => {
    const cds = `
define abstract entity footbar2
{
  key context : abap.string;
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("select AS", () => {
    const cds = `
define view zsdfsd as select from Blah as foo {
  foo.Name
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("select max", () => {
    const cds = `
define view zsdfsd as select from Blah as foo {
  max(foo.Name) as sdfsdf
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("extension, ANNOTATE ENTITY", () => {
    const cds = `
@Metadata.layer: #CORE
annotate entity ZFOO with {
  @EndUserText.label: 'Hello'
  FooBar;
}`;
    const file = new MemoryFile("foobar.ddls.asddlsx", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("extension, parsing error", () => {
    const cds = `
@Metadata.layer: #CORE
sdfsdfsdfsdf entity ZFOO with {
  @EndUserText.label: 'Hello'
  FooBar;
}`;
    const file = new MemoryFile("foobar.ddls.asddlsx", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.equal(undefined);
  });

  it("projection", () => {
    const cds = `
@EndUserText.label: 'View blah'
@AccessControl.authorizationCheck: #CHECK
define root view entity /foo/b_ar001 as projection on /foo/b_ar001 {
    key blah,
    field1,
    field2
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.not.equal(undefined);
  });

  it("namespace 1", () => {
    const cds = `
define root view entity /foo/basr as select from zsdfsdf {
  key variant as var,
      comment as comment
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.not.equal(undefined);
  });

  it("namespace 2", () => {
    const cds = `
define root view entity /foo/basr as select from /foo/sdf {
  key variant as var,
      comment as comment
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.not.equal(undefined);
  });

  it("root custom", () => {
    const cds = `
define root custom entity /foo/bar
{
  key ReportGuid : abap.char( 22 );
  S_Tab    : tabname;
  @Consumption.filter:{ hidden:true }
  A_Del      : abap.char( 1 );
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.not.equal(undefined);
  });

  it("namespaced composition", () => {
    const cds = `
define root view /bar/fsdfsd as select from /foo/sdf as header composition [0..*] of /foo/bar as _item
{
  key guid,
  key cprog,
      message,

      /*Association*/
      _item
}
`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.not.equal(undefined);
  });

  it("from, parametered", () => {
    const cds = `
define view entity namename
  as select from entityname
                 ( parm1:1, parm2:2, parm3:'foo' )
                                           as source1
    inner join   blah                     as _source2
      on foo.sdfsdf = _source2.sdfsdf3
  {
    key source1.foo1,
    key source1.foo2,
        source1.foo3,
        _source2.foo4
  }
`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.not.equal(undefined);
  });

});