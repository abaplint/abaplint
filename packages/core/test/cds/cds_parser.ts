import {expect} from "chai";
import {CDSLexer} from "../../src/cds/cds_lexer";
import {CDSParser} from "../../src/cds/cds_parser";
import {ExpressionNode} from "../../src/abap/nodes";
import {MemoryFile} from "../../src/files/memory_file";

describe("CDS Parser", () => {

  it("basic", () => {
    const cds = `@AbapCatalog.sqlViewName: 'ZSDF'
define view zhvamfoocust as select from zhvam_cust {
  key foo as sdfdsf
}`;
    const file = new MemoryFile("zhvamfoocust.ddls.asddls", cds);
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
    const file = new MemoryFile("zhvamfoocust.ddls.asddls", cds);
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

  it("more annotations, label with double quote", () => {
    const cds = `@AbapCatalog.sqlViewName: 'ZAG_UNIT_TEST_V'
@AbapCatalog.compiler.compareFilter: true
@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'Hel''lo'
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

  it("define root abstract entity with association", () => {
    const cds = `
    define root abstract entity I_PARAM_SHARE_DRAFT
    {
      key DummyKey : abap.char(1);
      Users  : association [1..*] to I_PARAM_SHARE_DRAFT_Content on 1 = 1;
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

  it("minus one", () => {
    const cds = `
@AbapCatalog.sqlViewName: 'ZSDF'
define view zhvamfoocust as select from I_asdfsd {
     case substring('sdf', -1, 2)
       when 'YY' then 'X'
       else  ''
       end as sdf
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("CASE function, parened", () => {
    const cds = `
@AbapCatalog.sqlViewName: 'ZSDF'
define view zhvamfoocust as select from I_asdfsd {
     (case substring('sdf', 1, 2)
       when 'YY' then 'X'
       else  ''
       end ) as sdf
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("CASE function, num values", () => {
    const cds = `
@AbapCatalog.sqlViewName: 'ZSDF'
define view zhvamfoocust as select from I_asdfsd {
     case substring('sdf', 1, 2)
       when 'YY' then 1
       else  2
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
  provider contract transactional_interface
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

  it("extension, ANNOTATE VIEW", () => {
    const cds = `
annotate view ZACB_C_Label_S with
{
  @UI.facet: [ {
    id: 'Transport',
    purpose: #STANDARD,
    type: #IDENTIFICATION_REFERENCE,
    label: 'Transport',
    position: 1 ,
    hidden: #(HideTransport)
  } ]
  SingletonID;

  TransportRequestID;
}`;
    const file = new MemoryFile("zacb_c_label_s.ddlx.asddlxs", cds);
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

  it("annotation without value", () => {
    const cds = `
define root custom entity /foo/bar
{
  key Werks     : /moo/de_werks;
  @Consumption.filter: { selectionType: #SINGLE, defaultValue: '100', hidden }
  Group         : /moo/de_group;
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.not.equal(undefined);
  });

  it("decimals", () => {
    const cds = `
define abstract entity footbar2
{
  key context : abap.dec(13,3);
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("test performance", () => {
    const cds = `
define view zc_myview
  as select from zmytable as ztab

{
  key ztab.f1,
      ztab.f2,

      case
      when ztab.Category = '1'
      then concat('Name',
           concat_with_space(',',concat('Street',concat_with_space(',',
           concat('City',concat_with_space(',',concat('Country',concat_with_space(',',
           'PostalCode',1)),1)),1)),1))

      when ztab.Category = '2'
      then concat('Name',
           concat_with_space(',',concat('Street',concat_with_space(',',
           concat('City',concat_with_space(',',concat('Country',concat_with_space(',',
           'PostalCode',1)),1)),1)),1))
      end  as Address1,

      case
      when ztab.Category = '1'
      then concat('Name',
           concat_with_space(',',concat('Street',concat_with_space(',',
           concat('City',concat_with_space(',',concat('Country',concat_with_space(',',
           'PostalCode',1)),1)),1)),1))

      when ztab.Category = '2'
      then concat('Name',
           concat_with_space(',',concat('Street',concat_with_space(',',
           concat('City',concat_with_space(',',concat('Country',concat_with_space(',',
           'PostalCode',1)),1)),1)),1))
      end  as Address2,

      ztab.f3
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("cast and arithmetics", () => {
    const cds = `
define view foo as select distinct from bar {
  key field1,
  cast( field2 as abap.int4 ) + 1 as blah,
  _Text
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("Function in WHERE", () => {
    const cds = `
define view entity sdf as select from fasdfs
{
  key uuid         as UUID,
      requested_by as RequestedBy
}
where TSTMP_SECONDS_BETWEEN( foo, TSTMP_CURRENT_UTCTIMESTAMP(), 'FAIL' ) <= 31622400
`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("define custom entity", () => {
    const cds = `
define custom entity /foo/sdf
{
  key statu : /foo/sdfff;
      txt   : char40;
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("root view entity provider contract as projection", () => {
    const cds = `
define root view entity I_FOO
  provider contract transactional_interface
  as projection on R_sdf as FooBar
{
  key Field1,
      Field2
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("redirected to", () => {
    const cds = `
define view entity I_foo1 as projection on I_foo2
{
  key     Field1,
          _Foo : redirected to I_sdfsd,
          _Bar : redirected to parent I_sdfsds
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("mod", () => {
    const cds = `
define view zsdfsd as select from Blah as foo {
  mod(foo.Name, 10) as sdfsdf
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("union", () => {
    const cds = `
@Metadata.ignorePropagatedAnnotations: true
define view entity ZCDS_union as select from ztopfoo {
    field1 as something
} union select from ztopfoo {
    field1 as something
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("no squiggle brackets, distinct key", () => {
    const cds = `
define view YFOOBAR as
  select distinct key kunnr
  from knvk
  where yyview <> ''
`;
    const file = new MemoryFile("yfoobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("more without squiggle brackets", () => {
    const cds = `
define view YINVOICES
    as select
    key invoicenumber,
    key invoiceline,
        cast ( invoicedate as abap.char(8) ) as invoiceDate,
        ordername,
        ordernumber,
        pdfoutput
  from ysdfsdfsdf
`;
    const file = new MemoryFile("yinvoices.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("extend view entity", () => {
    const cds = `
extend view entity zfoobar with
{
  employ.zztitle_zem,
  employ.zzcountry_zem
}
`;
    const file = new MemoryFile("zfoobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("extend view", () => {
    const cds = `
@AbapCatalog.sqlViewAppendName: 'ZESLSDCITM'
@EndUserText.label: 'Sales document item addit. fields'
extend view I_SalesDocumentItem with ZE_SalesDocItem
  {
    vbkd.bstdk as PurchaseOrderByCustomerDate,
    vbak.bstnk as PurchaseOrderByCustomer2
  }`;
    const file = new MemoryFile("ze_salesdocitem.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("non seven bit ascii", () => {
    const cds = `@AbapCatalog.sqlViewName: 'ZSDF'
@EndUserText.label: 'Äsdfsdf0123'
define view zhvamfoocust as select from zhvam_cust {
  key foo as sdfdsf
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);

    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("join", () => {
    const cds = `define view zI_CDS
  as select from a
    left outer join b
      on a.f1 = b.f1
        and not b.f2 = 'X'
{
  key a.foo
}`;
    const file = new MemoryFile("zi_cds.ddls.asddls", cds);

    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("parse it, dont crash", () => {
    const cds = `@AbapCatalog.sqlViewName: 'ZADCOSET_ITRSCO'
@AbapCatalog.preserveKey: true
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Rep. obj. of Tr. Request for Code Search'

define view ZADCOSET_I_TransportSrcCodObj
  as select from e071  as TransportObject
    inner join   tadir as Object on  TransportObject.pgmid    = Object.pgmid
                                 and TransportObject.object   = Object.object
                                 and TransportObject.obj_name = Object.obj_name
{
  key TransportObject.trkorr   as Request,
  key TransportObject.pgmid    as ProgramId,
  key TransportObject.object   as ObjectType,
  key TransportObject.obj_name as ObjectName,
      Object.devclass          as DevelopmentPackage,
      Object.author            as Owner,
      Object.created_on        as CreatedDate
}
where
       TransportObject.obj_name not like '______________________________VC'
  and  Object.pgmid             = 'R3TR'
  and  Object.delflag           = ''
  and(
       Object.object            = 'CLAS'
    or Object.object            = 'INTF'
    or Object.object            = 'PROG'
    or Object.object            = 'FUGR'
    or Object.object            = 'TYPE'
    or Object.object            = 'DDLS'
    or Object.object            = 'DCLS'
    or Object.object            = 'DDLX'
    or Object.object            = 'BDEF'
    or Object.object            = 'XSLT'
  )

union

select from  e071                       as TransportObject
  inner join tadir                      as Object on  TransportObject.pgmid    = Object.pgmid
                                                  and TransportObject.object   = Object.object
                                                  and TransportObject.obj_name = Object.obj_name
  inner join ZADCOSET_I_SearchableTable as Tabl   on Object.obj_name = Tabl.ObjectName
{
  key TransportObject.trkorr   as Request,
  key TransportObject.pgmid    as ProgramId,
  key Tabl.ObjectType,
  key TransportObject.obj_name as ObjectName,
      Object.devclass          as DevelopmentPackage,
      Object.author            as Owner,
      Object.created_on        as CreatedDate

}
where
      Object.pgmid   = 'R3TR'
  and Object.delflag = ''
  and Object.object  = 'TABL'

union all

select from e071 as TransportObject
{
  key TransportObject.trkorr   as Request,
  key TransportObject.pgmid    as ProgramId,
  key TransportObject.object   as ObjectType,
  key TransportObject.obj_name as ObjectName,
      ''                       as DevelopmentPackage,
      ''                       as Owner,
      cast( '' as abap.dats )  as CreatedDate
}
where
  (
         TransportObject.pgmid    = 'LIMU'
    and(
         TransportObject.object   = 'FUNC'
      or TransportObject.object   = 'METH'
      or TransportObject.object   = 'REPS'
      or TransportObject.object   = 'CLSD'
      or TransportObject.object   = 'CPUB'
      or TransportObject.object   = 'CPRO'
      or TransportObject.object   = 'CPRI'
      or TransportObject.object   = 'CINC'
    )
  )
  and    TransportObject.obj_name not like '______________________________VC'
`;
    const file = new MemoryFile("zadcoset_i_transportsrccodobj.ddls.asddls", cds);

    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("division and arithmetics", () => {
    const cds = `define view zsdfds as select from zaaaa {
  key mandt,
  key hello,
      division((value * amount), 1000, 2) as total
}
`;
    const file = new MemoryFile("zsdfds.ddls.asddls", cds);

    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("count and group", () => {
    const cds = `define view zsdfds as select from tab {
  tab.field1,
  tab.field2,
  count(*) as counter
} group by tab.field1, mseg.field2
`;
    const file = new MemoryFile("zsdfds.ddls.asddls", cds);

    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("unit_conversion", () => {
    const cds = `define view zsdfds as select from tab {
  tab.field1,
  unit_conversion(
    quantity => tab.brgew,
    source_unit => tab.gewei,
    target_unit => cast('KG' as abap.unit) ) as weight_kg
}
`;
    const file = new MemoryFile("zsdfds.ddls.asddls", cds);

    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("more arithmetics", () => {
    const cds = `define view zsdfds as select from tab {
  tab.field1,
  (1 - division(head_pos.net_sales, head_pos.kzwi1, 4)) * 100
}
`;
    const file = new MemoryFile("zsdfds.ddls.asddls", cds);

    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("more arithmetics 2", () => {
    const cds = `define view zsdfds as select from tab {
  tab.field1,
  division(p_terms.payterm1_value, 100, 4) * head_pos.bill_amount as payterm1_amount
}
  `;
    const file = new MemoryFile("zsdfds.ddls.asddls", cds);

    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("large join", () => {
    const cds = `
define view /FOO/BAR
 as select from zfoo as c1
 inner join zfoo as c2
 on c1.atnam = 'ASDF'
 and c2.atnam =  'ASDF'
 inner join zfoo as c3
 on c3.atnam = 'ES1'
 inner join zfoo as c4
 on c4.atnam = 'ES2'
 inner join zfoo as c5
 on c5.atnam = 'ASDF'
 inner join zfoo as c6
 on c6.atnam = 'ASDF'
 inner join zfoo as c7
 on c7.atnam = 'ASDF'
 inner join zfoo as c8
 on c8.atnam = 'ASDF'
 inner join zfoo as c9
 on c9.atnam = 'ASDF'
 inner join zfoo as c10
 on c10.atnam = 'ASDF'
 inner join zfoo as c11
 on c11.atnam = 'ASDF'
 inner join zfoo as c12
 on c12.atnam = 'ASDF'
 inner join zfoo as c13
 on c13.atnam = 'ASDF'
 inner join zfoo as c14
 on c14.atnam = 'ASDF'
 inner join zfoo as c15
 on c15.atnam = 'ASDF'
 inner join zfoo as c16
 on c16.atnam = 'ASDF'
  inner join zfoo as c17
 on c17.atnam = 'ASDF'
  inner join zfoo as c18
 on c18.atnam = 'ASDF'
  inner join zfoo as c19
 on c19.atnam = 'ASDF'
   inner join zfoo as c20
 on c20.atnam = 'ASDF'
   inner join zfoo as c21
 on c21.atnam = 'ASDF'
   inner join zfoo as c22
 on c22.atnam = 'ASDF'
 inner join zfoo as c23
 on c23.atnam = 'ASDF'
 inner join zfoo as c24
 on c24.atnam = 'ASDF'
{
  c1.a1 as a1,
  c1.a2 as a2,
  c2.a3 as a3
}
`;
    const file = new MemoryFile("zsdfds.ddls.asddls", cds);

    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("define table function", () => {
    const cds = `
@EndUserText.label: 'Foobar'
define table function ymoofunc with parameters p_anp : zanp, p_prevanp : zprevanp
returns {
  mandt : abap.clnt;
  foods : zmmooo;
  moods : abap.char( 50 );
}
implemented by method zcl_bar=>dsffdsfd;
`;
    const file = new MemoryFile("ymoofunc.ddls.asddls", cds);

    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("allstars", () => {
    const cds = `define view zsdfds as select from tab {
*
}
`;
    const file = new MemoryFile("zsdfds.ddls.asddls", cds);

    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("annotation slash", () => {
    const cds = `
define root custom entity /foo/bar
{
  key Werks     : /moo/de_werks;
  @Semantics.businessDate.from/to
  Group         : /moo/de_group;
}`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.not.equal(undefined);
  });

  it("shorthand", () => {
    const cds = `define view moo as select * from bar;`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.not.equal(undefined);
  });

  it("view parameter annotation", () => {
    const cds = `
define view moo with parameters
@Environment.systemField: #SYSTEM_DATE
p_system_date : syst_datum

as select from ztab as a
{
key a.objid as Obj,
    a.mc_stext as Text
};
`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.not.equal(undefined);
  });

  it("define custom entity with composition", () => {
    const cds = `
define root custom entity ZCE_PRODUCT_READ
{
  key ProductId : abap.char(10);
  _ProductReviews        : composition [0..*] of ZCE_PRODUCT_REVIEWS;
}

`;
    const file = new MemoryFile("zce_product_read.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.not.equal(undefined);
  });

  it.skip("define custom entity with association", () => {
    const cds = `
define root custom entity ZCE_PRODUCT_READ
{
  key ProductId : abap.char(10);
  _Product    : association to parent ZCE_PRODUCT_READ on  $projection.ProductId   = _Product.ProductId;
}

`;
    const file = new MemoryFile("zce_product_read.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.not.equal(undefined);
  });

  it("cast with arithmetics", () => {
    const cds = `
define view entity ZI_TaxItem
  as select from I_TaxItem
  {
    key CompanyCode,
    key AccountingDocument,
    key FiscalYear,
    key TaxItem,
        TaxCode,
        @Semantics.amount.currencyCode: 'CompanyCodeCurrency'
        cast( cast( cast( TaxRate as abap.dec( 11, 2 ) ) / 10  as abap.dec(11,2) ) as abap.curr( 23, 2 ) ) as TaxRate,
        GLAccount,
        CountryCurrency
  }
`;
    const file = new MemoryFile("zi_taxitem.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.not.equal(undefined);
  });

  it("projection with namespace and where", () => {
    const cds = `
define root view entity /foo/c_bar
  as projection on /foo/i_moo
{

  key Type,
      Description

}
where
  SomeThing is initial
`;
    const file = new MemoryFile("#foo#c_bar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.not.equal(undefined);
  });

  it("projection with key", () => {
    const cds = `
define root view entity /foo/c_bar
  provider contract transactional_query
  as projection on /foo/i_bar
{
  key ObjectType,
  _Texts.Description : localized
}
`;
    const file = new MemoryFile("#foo#c_bar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.not.equal(undefined);
  });

  it("custom entity with association", () => {
    const cds = `
define custom entity /foo/i_bar
{
  key state       : abap.char(1);
      foobar      : abap.string(1000);
      _ObjectBase : association to parent /foo/i_base on  $projection.id    = _ObjectBase.id
                                                          and $projection.state = _ObjectBase.state;
}
`;
    const file = new MemoryFile("#foo#i_bar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.not.equal(undefined);
  });

  it("cds parameters", () => {
    const cds = `
define view entity /foo/bar
  as select from DDCDS_CUSTOMER_DOMAIN_VALUE
                 ( p_domain_name : '/FOO/MOO' )
  association [1] to DDCDS_CUSTOMER_DOMAIN_VALUE_T as _ValueText on  $projection.DomainName    = _ValueText.domain_name
                                                                 and $projection.ValuePosition = _ValueText.value_position
                                                                 and $projection.Value         = _ValueText.value_low
                                                                 and _ValueText.language       = $session.system_language
{
  key domain_name                                                   as DomainName,
  key value_position                                                as ValuePosition,
      value_low                                                     as Value,
      _ValueText( p_domain_name : '/FOO/MOO' ).text as Text
}

`;
    const file = new MemoryFile("#foo#i_bar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.not.equal(undefined);
  });

  it("another test", () => {
    const cds = `
define view entity /foo/bar as select from /moo/sdf
{
  key keyfield,
      case something when '0000000000' then ''
                       else /moo/sdf._something.more end,
      another
}`;
    const file = new MemoryFile("#foo#bar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.not.equal(undefined);
  });

  it("projection with virtual", () => {
    const cds = `
define root view entity /foo/bar as projection on /foo/moo
{
  key     LogID,
  virtual sometext : abap.string
}
`;
    const file = new MemoryFile("#foo#bar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.not.equal(undefined);
  });

  it("projection as localized", () => {
    const cds = `
define view entity ZACB_C_Label as projection on ZACB_I_Label
{
  key LabelId,
  LabelColor,
  _ConfignDeprecationCodeText.ConfignDeprecationCodeName as ConfigurationDeprecation_Text : localized,
  _LabelText : redirected to composition child ZACB_C_LabelText
}
`;
    const file = new MemoryFile("zacb_c_label.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.not.equal(undefined);
  });

  it("cross join", () => {
    const cds = `
define view entity /foo/moo
  as select from /foo/foo1 as foo1
    cross join   /foo/foo2 as foo2
{
  key foo1.field1,
      foo2.field2
}`;
    const file = new MemoryFile("#foo#moo.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.not.equal(undefined);
  });

  it("abap.char", () => {
    const cds = `
define view entity moo
  as select distinct from bar
{
  key foo1,
      bar as Short
}
where
  Valid = abap.char'X'
`;
    const file = new MemoryFile("moo.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.not.equal(undefined);
  });

  it("from without AS is okay", () => {
    const cds = `
@AbapCatalog.sqlViewName: 'zhvam2'
define view zhvam as select from t100 sdf
{
    sprsl as Sprsl,
    sdf.arbgb as Arbgb,
    msgnr as Msgnr,
    text as Text
}
`;
    const file = new MemoryFile("zhvam.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.not.equal(undefined);
  });

  it("double dash comment, without whitespace", () => {
    const cds = `
@AbapCatalog.sqlViewName: 'zhvam2'
define view zhvam as select from t100
{
    sprsl as Sprsl,
    text as Text--bar
}
`;
    const file = new MemoryFile("zhvam.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.not.equal(undefined);
  });

  it("field annotation with colon and boolean value", () => {
    const cds = `@AbapCatalog.sqlViewName: 'ZSDF'
define view zhvamfoocust as select from zhvam_cust {
  @Semantics.businessDate.from:true
  key valid_from as ValidityStartDate,
  @Semantics.businessDate.to:false
  valid_to as ValidityEndDate
};`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("field annotation with colon and enum value", () => {
    const cds = `@AbapCatalog.sqlViewName: 'ZSDF'
define view zhvamfoocust as select from zhvam_cust {
  @Consumption.filter.mandatory:true
  @Consumption.filter.selectionType:#SINGLE
  key mandt
};`;
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("SAP standard view with field annotations", () => {
    const cds = `@EndUserText.label: 'Business Partner Default Address'
@AbapCatalog.sqlViewName: 'IBPDEFADDR'
define view I_BusinessPartnerDefaultAddr
  as select from but020
    inner join   but021_fs on  but020.partner       = but021_fs.partner
                           and but020.addrnumber    = but021_fs.addrnumber
{
  key but020.partner as BusinessPartner,
      @Semantics.businessDate.from:true
      but020.addr_valid_from as ValidityStartDate,
      @Semantics.businessDate.to:true
      but020.addr_valid_to as ValidityEndDate
}`;
    const file = new MemoryFile("i_businesspartnerdefaultaddr.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("unary minus operator in CASE expression", () => {
    const cds = `define view Test as select from tab {
  cast( case when flag = 'X' then - amount else 0 end as mytype ) as result
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("unary plus operator in CASE expression", () => {
    const cds = `define view Test as select from tab {
  case when flag = 'X' then + amount else 0 end as result
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("complex CASE with unary minus and preserving type", () => {
    const cds = `@AbapCatalog.sqlViewName: 'ZTEST'
define view Test as select from tab1 as T1
  inner join tab2 as T2 on T2.id = T1.id
{
  @Semantics.currencyCode: true
  T1.currency,
  @Semantics: { amount : { currencyCode: 'currency'} }
  cast( case when T2.flag = 'X' and T1.run is not initial and T1.run is not null
    then - T1.amount
    else 0
  end as mytype preserving type ) as CutbackAmount
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("unary minus with field path expression", () => {
    const cds = `define view Test as select from tab {
  case when 1 = 1 then - tab.field1 else tab.field2 end as result
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("multiple unary operators in same view", () => {
    const cds = `define view Test as select from tab {
  case when flag = 'X' then - amount1 else 0 end as result1,
  case when flag = 'Y' then + amount2 else 0 end as result2,
  case when flag = 'Z' then - amount3 else + amount4 end as result3
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("define hierarchy with parent child hierarchy syntax", () => {
    const cds = `define hierarchy I_MyHierarchy
  as parent child hierarchy (
    source I_OrgUnit
    child to parent association _Parent
    start where IsRoot = 'X'
    siblings order by OrgUnitName ascending
    multiple parents allowed
  )
{
  key NodeID,
  ParentNodeID,
  HierarchyLevel
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("two annotations concatenated on same line without space", () => {
    const cds = `@AbapCatalog.preserveKey:true@AbapCatalog.compiler.compareFilter:true
define view ZTestView as select from ztable {
  key field1
}`;
    const file = new MemoryFile("ztestview.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("decimal literal in cast", () => {
    const cds = `define view Test as select from tab {
  cast( 0.00 as abap.dec(15,2) ) as Amount
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("parenthesized arithmetic as operand in CASE then", () => {
    const cds = `define view Test as select from tab {
  case when flag = 'X'
    then division(A,B,3) + (C - ((division(D,E,3)) * F))
    else 0
  end as Result
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("deeply nested parenthesized arithmetic (8 levels)", () => {
    const cds = `define view Test as select from tab {
  (((((((( A + B )))))))) as DeepNested
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("LEFT OUTER TO MANY join", () => {
    const cds = `define view Test as select from T1
    left outer to many join T2 as t2 on t2.id = T1.id
{
  key T1.field1
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("annotation with null value", () => {
    const cds = `define view Test as select from tab {
  key f1,
      @ObjectModel.foreignKey.association: null
  key f2
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("cast with parenthesized case expression", () => {
    const cds = `define view Test as select from tab {
  cast((
    case when A = 0 then B else C end
  ) as my_type) as Result
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("cast with parenthesized function expression", () => {
    const cds = `define view Test as select from tab {
  cast((concat(concat(a, b), c)) as my_type) as Result
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("path filter on association field in cast", () => {
    const cds = `define view Test as select from tab
  association [0..*] to I_Text as _Text on $projection.ID = _Text.ID
{
  cast(_Text[1: Language = $session.system_language].TextDesc as my_type) as TextDesc
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("chained path filters with multi-line condition", () => {
    const cds = `define view Test as select from tab {
  WBSElement._ProfitCenter[1: ValidityEndDate >= $session.system_date
    and ValidityStartDate <= $session.system_date ]._Text[1: Language = $session.system_language].ProfitCenterName as ProfitCenterName
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("CASE with arithmetic expression (-1)*field in THEN", () => {
    const cds = `define view Test as select from tab {
  case when Status = 'X' then (-1)*Amount
       else Amount
  end as SignedAmount
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("fltp_to_dec function with AS type argument", () => {
    const cds = `define view Test as select from tab {
  fltp_to_dec( Quantity as abap.dec(13,3) ) as Quantity
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("annotation with #(string) value", () => {
    const cds = `@AccessControl.personalData.blocking: #('TRANSACTIONAL_DATA')
define view Test as select from tab { key Field }`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("path filter without integer prefix (condition only)", () => {
    const cds = `define view Test as select from tab {
  _SetHeader._SetHeaderText[ Language = $session.system_language ].SetDescription as ActivityTypeGroupName
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("path filter with join type redirect [inner]", () => {
    const cds = `define view Test as select from tab {
  _PTRSmallBusiness[inner].Supplier
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("parameterized association in CASE WHEN condition", () => {
    const cds = `define view Test as select from tab {
  case
    when _Assoc( P_Currency:$parameters.P_Currency ).Amount = 0
    then 0
    else 1
  end as Val
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("aggregate with arithmetic operator as element (sum*(-1))", () => {
    const cds = `define view Test as select from tab {
  sum(Amount)*(-1) as NegAmount,
  cast(sum(TaxAmount)*(-1) as mytype) as NegTaxAmount
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("annotation with negative number value", () => {
    const cds = `@Consumption.defaultValue: -30
define view Test as select from tab { Field }`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("string with em-dash (U+2013) in annotation label", () => {
    const cds = "@EndUserText.label: 'Billing Item \u2013 Cube'\ndefine view Test as select from tab { Field }";
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("CASE THEN with aggregate and arithmetic (sum * -1)", () => {
    const cds = `define view Test as select from tab {
  case Field
    when 'L' then sum(Amount)
    when 'S' then sum(Amount) * -1
    else sum(Amount)
  end as SignedAmount
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("path filter with integer cardinality and join type [1:left outer]", () => {
    const cds = `define view Test as select from tab {
  cast(dd07t[1:left outer].ddtext as mytype) as TextName
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("datasource alias named 'virtual' does not conflict with VIRTUAL keyword", () => {
    const cds = `define view Test as select from P_Source as virtual
{
  key virtual.UUID,
  virtual.Material,
  virtual.Plant
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("enum fixed value with dotted string literal (#enum.'value')", () => {
    const cds = `define view Test as select from src { key src.Field }
where active = #icl_active.'A'`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("CASE THEN value with cast followed by arithmetic operator (cast(x) * -1)", () => {
    const cds = `define view Test as select from src {
  case when src.Dir = 'SELL'
       then cast( case when src.D < src.D2 then 1 else 0 end as mytype ) * -1
       else cast( case when src.D < src.D2 then 1 else 0 end as mytype )
  end as Result
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("cast with arithmetic expression inside (cast(a * b as type))", () => {
    const cds = `define view Test as select from src {
  cast( src.A * src.B as mytype ) as Result
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("cast with function * constant inside (cast(division() * 100 as type))", () => {
    const cds = `define view Test as select from src {
  cast(division(src.A, src.B, 3) * 100 as mytype) as Result
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("condition comparison with parenthesized function call on right side (field >= (function()))", () => {
    const cds = `define view Test as select from src {
  case when src.Qty >= (division(src.A, 100, 3))
       then 1 else 0 end as Result
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("define view with column alias list", () => {
    const cds = `define view I_Test(
    SourceDocument,
    SourceDocumentItem,
    ConditionType
  )
  as select from SomeTable
{
  key cast(PurchasingDocument as awref) as SourceDocument,
  key field2 as SourceDocumentItem,
      field3 as ConditionType
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("hierarchy with parameterized source and orphans ignore clause", () => {
    const cds = `define hierarchy I_Test
  with parameters P_Key: kokrs, P_Group: setnamenew
  as parent child hierarchy(
    source I_Source(P_Key: $parameters.P_Key, P_Group: $parameters.P_Group)
    child to parent association _Child
    start where SetClass = '0101' and SetSubClass = $parameters.P_Key
    siblings order by SetClass, SetSubClass
    multiple parents allowed
    orphans ignore
    cycles breakup
  )
{
  key SetClass,
  key SetSubClass,
      ChildSetClass
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("hierarchy field list with $node pseudo-field path", () => {
    const cds = `define hierarchy I_Test
  as parent child hierarchy(
    source I_Source
    child to parent association _Parent
  )
{
  key ID,
  $node.node_id         as NodeID,
  $node.parent_id       as ParentID,
  $node.hierarchy_level as Level
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("WHERE clause with NOT followed by parenthesized condition group", () => {
    const cds = `define view Test as select from tab { key Field }
where Status = 'C'
     or not(
        (
          Date >= $session.system_date
        )
        or(
          Date = '00000000'
        )
      )`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("association with WITH DEFAULT FILTER clause", () => {
    const cds = `define view Test as select from tab as _T
association [0..1] to I_Text as _Text on $projection.ID = _Text.ID
                                     with default filter _Text.Language = $session.system_language
{ key _T.field, _Text }`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("GROUP BY with parameterized association path", () => {
    const cds = `define view Test
  with parameters P_Key: sydate, P_Type: mytype
  as select from src( P_Key: :P_Key )
{
  key Field1,
  sum(Amount) as Amount
}
group by
  Field1,
  _Assoc( P_Key: :P_Key, P_Type: :P_Type ).ReportingPeriod,
  _Assoc( P_Key: :P_Key, P_Type: :P_Type ).ReportingYear`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("association path filter with join-type and WHERE condition", () => {
    const cds = `define view Test as select from Src {
  key Field1,
  _Descriptions[ 1: left outer where ( Language = $session.system_language ) ].Name as Name
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("function argument as parenthesized expression", () => {
    const cds = `define view Test as select from Src {
  key Field1,
  concat(( concat_with_space(A, B, 2) ), 'suffix') as Combined
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("CASE THEN with unary minus applied to parenthesized expression", () => {
    const cds = `define view Test as select from Src {
  key Field1,
  case
    when DocType = 'G'
    then -(TaxAmount)
  end as NegatedField
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("$extension.* wildcard field in field list", () => {
    const cds = `define view Test as select from Src {
  key Field1,
  Field2,
  $extension.*
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("hierarchy SIBLINGS ORDER BY with qualified source-prefixed field name", () => {
    const cds = `define hierarchy Test
  with parameters P_Usage : mytype, P_Header : mytype
  as parent child hierarchy(
    source Src
    child to parent association _Tree
    start where
          Src.UsageField = :P_Usage
      and Src.HeaderField = :P_Header
    siblings order by
      Src.SortField
    multiple parents allowed
  )
{
  key $node.hierarchy_rank as HierarchyRank
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("identifier directly preceding string literal without space (e.g. else'')", () => {
    const cds = `define view Test as select from Src {
  key Field1,
  case when Field1 is not null then
    case when Field2 > 0 then 'X' else'' end
  else ''
  end as MyField
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("FROM with parenthesized join chain as primary source", () => {
    const cds = `define view Test
  as select from(
    SrcA as a
    cross join SrcB as b
  )
  left outer to one join SrcC as c on c.id = a.id
{
  key a.Field1
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("inner one to many join cardinality", () => {
    const cds = `define view Test as select from SrcA
  inner one to many join SrcB on SrcA.id = SrcB.id
{
  key SrcA.Field1
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("parenthesized join sub-expression as join target", () => {
    const cds = `define view Test
  as select from Src left outer join (SubA as s join SubB b on s.id = b.id and s.type = b.type)
    on Src.id = s.id
{
  key Src.Field1
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("decimal numbers in arithmetic expressions", () => {
    const cds = `define view Test as select from Src {
  key Field1,
  cast(FieldA as abap.fltp) * 100.00 / cast(FieldB as abap.fltp) as Percentage
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("CASE with parenthesized field as case key", () => {
    const cds = `define view Test as select from Src {
  key Field1,
  case (AllocationSetType)
    when '3' then ''
    when '4' then ''
    else SomeField
  end as MyField
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("left outer many to exact one join cardinality", () => {
    const cds = `define view Test as select from Src
    left outer many to exact one join Other on Src.ID = Other.ID
{
  key Src.Field1
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("CASE with arithmetic expression as case key", () => {
    const cds = `define view Test as select from Src {
  key Field1,
  case length(FieldA) * 10 + length(FieldB)
    when 44 then concat(FieldA, FieldB)
    when 43 then concat_with_space(FieldA, FieldB, 1)
  end as ComputedField
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("hierarchy with DIRECTORY clause", () => {
    const cds = `define hierarchy TestHier
  with parameters P_UUID : some_uuid
  as parent child hierarchy(
    source SrcView
    child to parent association _Parent
    directory _Assoc filter by
      UUID = $parameters.P_UUID
    siblings order by
      OrgID
    orphans root
  )
{
  key UUID,
  OrgID,
  $node.node_id as HierarchyNode
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("tab-indented CDS fields", () => {
    // Tabs must be treated as whitespace by the lexer (not included in token strings)
    const cds = "define root view entity I_TabTest\n\tprovider contract transactional_interface\n\tas projection on I_Src as Doc\n{\t\n\tkey UUID,\n\tField1,\n\t_Child: redirected to composition child I_ChildTP\n}";
    const file = new MemoryFile("foobar.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("parameters select with negative integer values", () => {
    const cds = `
define view I_PlndView
  as select from I_PlndSource( P_StartDate: -11, P_EndDate: 6 ) as src
{
  key src.Field
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("hierarchy with nodetype and cache force clauses", () => {
    const cds = `
define hierarchy I_TestHierarchy
  with parameters P_Root : j_objnr
  as parent child hierarchy(
    source I_HierarchySrc
    child to parent association _Parent
    start where
      NodeID = $parameters.P_Root
    siblings order by
      NodeID
    nodetype HierarchyNodeType
    multiple parents allowed
    cache force
  )
{
  key NodeID,
  ParentID,
  NodeType
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("parameterized association path traversal in field list", () => {
    const cds = `
define view I_Test
  with parameters P_Key : sydate
  as select from I_Src as formula
{
  key formula.UUID,
      formula._Assoc( P_KeyDate : $parameters.P_Key ).SpecID as SpecID,
      formula._Stream( P_KeyDate : $parameters.P_Key )[ Scope = $parameters.P_Key ].StreamQty
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("decimal literal in cast", () => {
    const cds = `define view Test as select from tab {
  cast( 0.00 as abap.dec(15,2) ) as Amount
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("parenthesized arithmetic as operand in CASE then", () => {
    const cds = `define view Test as select from tab {
  case when flag = 'X'
    then division(A,B,3) + (C - ((division(D,E,3)) * F))
    else 0
  end as Result
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("deeply nested parenthesized arithmetic (8 levels)", () => {
    const cds = `define view Test as select from tab {
  (((((((( A + B )))))))) as DeepNested
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("long dotted path traversal does not OOM (star → starPrio regression)", () => {
    // CDSPrefixedName used star(segment) which caused exponential parser states for
    // long association paths. This test guards against regression to O(2^N) behaviour.
    const cds = `define view Test as select from tab {
  _A._B._C._D._E._F._G._H._I._J._K._L._M._N._O._P as LongPath
}`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

  it("LIKE ESCAPE in condition", () => {
    const cds = `define view Test as select from tab {
  key Id
} where Name like '%foo%' escape '#'`;
    const file = new MemoryFile("test.ddls.asddls", cds);
    const parsed = new CDSParser().parse(file);
    expect(parsed).to.be.instanceof(ExpressionNode);
  });

});