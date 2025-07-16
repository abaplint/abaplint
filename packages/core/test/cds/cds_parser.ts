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

});