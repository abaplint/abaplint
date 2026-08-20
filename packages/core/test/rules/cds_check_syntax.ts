import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Issue} from "../../src/issue";
import {DataDefinition} from "../../src/objects";
import {Registry} from "../../src/registry";
import {CDSCheckSyntax} from "../../src/rules";

const source = `define view entity ZSOURCE as select from mara
{
  ExistingField
}`;

function dataElement(name: string, dataType: "QUAN" | "CURR"): MemoryFile {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.abap.org/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>${name.toUpperCase()}</ROLLNAME>
    <DATATYPE>${dataType}</DATATYPE>
    <LENG>000013</LENG>
    <DECIMALS>000003</DECIMALS>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;
  return new MemoryFile(`${name.toLowerCase()}.dtel.xml`, xml);
}

function transparentTable(name: string, fields: string[]): MemoryFile {
  const columns = fields.map((field, index) => `    <DD03P>
     <TABNAME>${name.toUpperCase()}</TABNAME>
     <FIELDNAME>${field.toUpperCase()}</FIELDNAME>
     <POSITION>000${index + 1}</POSITION>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000020</INTLEN>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000010</LENG>
    </DD03P>`).join("\n");

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>${name.toUpperCase()}</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>TRANSP</TABCLASS>
    <CONTFLAG>A</CONTFLAG>
   </DD02V>
   <DD03P_TABLE>
${columns}
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;
  return new MemoryFile(`${name.toLowerCase()}.tabl.xml`, xml);
}

function domainDataElement(name: string, domainName: string, dataType: "QUAN" | "CURR"): MemoryFile[] {
  const dataElementXML = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DTEL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.abap.org/abapxml" version="1.0">
  <asx:values>
   <DD04V>
    <ROLLNAME>${name.toUpperCase()}</ROLLNAME>
    <DOMNAME>${domainName.toUpperCase()}</DOMNAME>
    <REFKIND>D</REFKIND>
   </DD04V>
  </asx:values>
 </asx:abap>
</abapGit>`;
  const domainXML = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DOMA" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.abap.org/abapxml" version="1.0">
  <asx:values>
   <DD01V>
    <DOMNAME>${domainName.toUpperCase()}</DOMNAME>
    <DATATYPE>${dataType}</DATATYPE>
    <LENG>000013</LENG>
    <DECIMALS>000003</DECIMALS>
   </DD01V>
  </asx:values>
 </asx:abap>
</abapGit>`;
  return [
    new MemoryFile(`${name.toLowerCase()}.dtel.xml`, dataElementXML),
    new MemoryFile(`${domainName.toLowerCase()}.doma.xml`, domainXML),
  ];
}

async function findIssues(cds: string, withSource = false, dependencies: MemoryFile[] = []): Promise<readonly Issue[]> {
  const files = [new MemoryFile("ztarget.ddls.asddls", cds), ...dependencies];
  if (withSource) {
    files.push(new MemoryFile("zsource.ddls.asddls", source));
  }

  const reg = new Registry().addFiles(files);
  await reg.parseAsync();
  const target = Array.from(reg.getObjectsByType("DDLS"))
    .find(o => o.getFiles().some(f => f.getFilename() === "ztarget.ddls.asddls")) as DataDefinition;
  return new CDSCheckSyntax().initialize(reg).run(target);
}

describe("Rule: cds_check_syntax", () => {
  it("accepts a qualified field which exists", async () => {
    const issues = await findIssues(`define view entity ZTARGET as select from ZSOURCE
{
  ZSOURCE.ExistingField
}`, true);
    expect(issues.length).to.equal(0);
  });

  it("reports a qualified field which does not exist", async () => {
    const issues = await findIssues(`define view entity ZTARGET as select from ZSOURCE
{
  ZSOURCE.MissingField
}`, true);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal('CDS field "MissingField" not found in "ZSOURCE"');
    expect(issues[0].getStart().getRow()).to.equal(3);
  });

  it("reports an unqualified field which does not exist", async () => {
    const issues = await findIssues(`define view entity ZTARGET as select from ZSOURCE
{
  MissingField
}`, true);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal('CDS field "MissingField" not found in "ZSOURCE"');
  });

  it("reports a missing local source", async () => {
    const issues = await findIssues(`define view entity ZTARGET as select from ZMISSING
{
  AnyField
}`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal('CDS source "ZMISSING" not found');
  });

  it("reports a missing local association target", async () => {
    const issues = await findIssues(`define view entity ZTARGET as select from mara
  association [0..1] to ZMISSING as _Missing on 1 = 1
{
  matnr
}`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal('CDS source "ZMISSING" not found');
  });

  it("reports a missing local type", async () => {
    const issues = await findIssues(`define abstract entity ZTARGET
{
  Field : ZMISSING;
}`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal('CDS type "ZMISSING" not found');
  });

  it("accepts ABAP built-in and unresolved standard types", async () => {
    const issues = await findIssues(`define abstract entity ZTARGET
{
  CharacterField : abap.char(10);
  StandardField  : stlkn;
}`);
    expect(issues.length).to.equal(0);
  });

  it("accepts an unresolved source outside the error namespace", async () => {
    const issues = await findIssues(`define view entity ZTARGET as select from I_STANDARD_SOURCE
{
  AnyField
}`);
    expect(issues.length).to.equal(0);
  });

  it("reports a QUAN field without a unit annotation", async () => {
    const issues = await findIssues(`@EndUserText.label: 'Change Quantity Parameters'
define abstract entity ZA_BOM_CHG_QTY
{
  ItemNodeNumber : stlkn;
  NewQuantity    : menge_d;
}`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage())
      .to.equal('CDS quantity field "NewQuantity" requires @Semantics.quantity.unitOfMeasure');
    expect(issues[0].getStart().getRow()).to.equal(5);
  });

  it("reports an abap.quan field without a unit annotation", async () => {
    const issues = await findIssues(`@EndUserText.label: 'Change Request Parameter'
define abstract entity ZA_CHG_REQ_PARAM
{
  NewOrderQuantity  : abap.quan(13,3);
  OrderQuantityUnit : abap.unit(3);
  NewDeliveryDate   : abap.dats;
}`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage())
      .to.equal('CDS quantity field "NewOrderQuantity" requires @Semantics.quantity.unitOfMeasure');
    expect(issues[0].getStart().getRow()).to.equal(4);
  });

  it("accepts a QUAN field with a unit annotation", async () => {
    const issues = await findIssues(`define abstract entity ZA_BOM_CHG_QTY
{
  ItemNodeNumber : stlkn;
  @Semantics.quantity.unitOfMeasure: 'QuantityUnit'
  NewQuantity    : menge_d;
  @Semantics.unitOfMeasure: true
  QuantityUnit   : meins;
}`);
    expect(issues.length).to.equal(0);
  });

  it("reports a missing referenced unit field", async () => {
    const issues = await findIssues(`define abstract entity ZTARGET
{
  @Semantics.quantity.unitOfMeasure: 'QuantityUnit'
  Quantity : zquantity;
}`, false, domainDataElement("zquantity", "zquantity_domain", "QUAN"));
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage())
      .to.equal('CDS field "Quantity" references missing unit field "QuantityUnit"');
  });

  it("reports a CURR field without a currency annotation", async () => {
    const issues = await findIssues(`define abstract entity ZTARGET
{
  Amount : zamount;
}`, false, [dataElement("zamount", "CURR")]);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage())
      .to.equal('CDS amount field "Amount" requires @Semantics.amount.currencyCode');
  });

  it("recognizes known CURR data elements without DDIC metadata", async () => {
    for (const dataElementName of ["BWERT", "DZWERT"]) {
      const issues = await findIssues(`define abstract entity ZTARGET
{
  Amount : ${dataElementName};
}`);
      expect(issues.length).to.equal(1);
      expect(issues[0].getMessage())
        .to.equal('CDS amount field "Amount" requires @Semantics.amount.currencyCode');
    }
  });

  it("accepts a CURR field with a currency annotation", async () => {
    const issues = await findIssues(`define abstract entity ZTARGET
{
  @Semantics.amount.currencyCode: 'Currency'
  Amount   : zamount;
  @Semantics.currencyCode: true
  Currency : waers;
}`, false, [dataElement("zamount", "CURR")]);
    expect(issues.length).to.equal(0);
  });

  it("reports a currency field without its semantic annotation", async () => {
    const issues = await findIssues(`define abstract entity ZTARGET
{
  @Semantics.amount.currencyCode: 'Currency'
  Amount   : zamount;
  Currency : waers;
}`, false, [dataElement("zamount", "CURR")]);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage())
      .to.equal('CDS field "Currency" requires @Semantics.currencyCode: true');
  });

  it("reports a label which is too long", async () => {
    const table = transparentTable("ztab_domval", ["domain_field", "value_code", "value_position", "value_text"]);
    const issues = await findIssues(`@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Domain Values - Basic Interface Definition'
define view entity ZI_DOMVAL
  as select from ztab_domval
{
  key domain_field   as DomainField,
  key value_code     as ValueCode,
      value_position as ValuePosition,
      value_text     as ValueText
}`, false, [table]);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal("CDS label is 42 characters, maximum is 40");
    expect(issues[0].getStart().getRow()).to.equal(2);
  });

  it("accepts a label of maximum length", async () => {
    const table = transparentTable("ztab_domval", ["domain_field"]);
    const issues = await findIssues(`@EndUserText.label: 'Domain Values - Basic Interface Def View'
define view entity ZI_DOMVAL
  as select from ztab_domval
{
  key domain_field as DomainField
}`, false, [table]);
    expect(issues.length).to.equal(0);
  });

  it("reports @Semantics.unitOfMeasure in a view entity", async () => {
    const table = transparentTable("zdb_pochg_req", [
      "purchasing_document", "purchasing_doc_item", "new_order_quantity", "order_quantity_unit",
      "new_delivery_date", "post_status", "posted_by", "posted_at", "approved_by", "approved_at",
      "created_by", "created_at", "last_changed_by", "last_changed_at"]);
    const issues = await findIssues(`@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'PO Change Request (Basic)'
@VDM.viewType: #BASIC
@Metadata.ignorePropagatedAnnotations: true
@ObjectModel.representativeKey: 'PurchasingDocumentItem'
define view entity ZI_POCHG_REQ
  as select from zdb_pochg_req
{
  key purchasing_document              as PurchasingDocument,
  key purchasing_doc_item              as PurchasingDocumentItem,

      @Semantics.quantity.unitOfMeasure: 'OrderQuantityUnit'
      new_order_quantity               as NewOrderQuantity,
      @Semantics.unitOfMeasure: true
      order_quantity_unit              as OrderQuantityUnit,
      new_delivery_date                as NewDeliveryDate,
      post_status                      as PostStatus,

      @Semantics.user.createdBy: true
      posted_by                        as PostedBy,
      @Semantics.systemDateTime.createdAt: true
      posted_at                        as PostedAt,
      @Semantics.user.lastChangedBy: true
      approved_by                      as ApprovedBy,
      @Semantics.systemDateTime.lastChangedAt: true
      approved_at                      as ApprovedAt,

      @Semantics.user.createdBy: true
      created_by                       as CreatedBy,
      @Semantics.systemDateTime.createdAt: true
      created_at                       as CreatedAt,
      @Semantics.user.lastChangedBy: true
      last_changed_by                  as LastChangedBy,
      @Semantics.systemDateTime.lastChangedAt: true
      last_changed_at                  as LastChangedAt
}`, false, [table]);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage())
      .to.equal("Annotation Semantics.unitOfMeasure is not allowed in view entities");
    expect(issues[0].getStart().getRow()).to.equal(14);
  });

  it("reports a reserved element name", async () => {
    const domainValues = new MemoryFile("zi_domval.ddls.asddls", `define view entity ZI_DOMVAL
  as select from dd07l
{
  key domname    as DomainField,
  key domvalue_l as ValueCode,
      ddtext     as ValueText,
      valpos     as ValuePosition
}`);
    const issues = await findIssues(`@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Value Help - Priority'
@ObjectModel.resultSet.sizeCategory: #XS
define view entity ZI_PRIO_VH
  as select from ZI_DOMVAL
{
  @UI.textArrangement: #TEXT_LAST
  @ObjectModel.text.element: ['Description']
  key cast(ValueCode as abap.char(1)) as Priority,
      ValueText                       as Description,
      ValuePosition                   as Position
}
where DomainField = 'PRIORITY'`, false, [domainValues]);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal('CDS element name "Position" is reserved');
    expect(issues[0].getStart().getRow()).to.equal(11);
  });

  it("reports a root projection on a non-root entity", async () => {
    const projectedEntity = new MemoryFile("zi_bom_chg_bo.ddls.asddls", `define view entity ZI_BOM_CHG_BO
  as select from mara
{
  key matnr
}`);
    const issues = await findIssues(`@AccessControl.authorizationCheck: #NOT_REQUIRED
@Metadata.allowExtensions: true
@EndUserText.label: 'BOM Change Request'
define root view entity ZR_BOM_CHG_TP
  as projection on ZI_BOM_CHG_BO
{
  key BillOfMaterialCategory,
  key BillOfMaterial,
  key BillOfMaterialVariant,
  key Material,
  key Plant,
      BillOfMaterialVariantUsage,
      BOMHeaderQuantityInBaseUnit,
      BOMHeaderBaseUnit,
      EngineeringChangeNo,
      ChangeCreatedBy,
      ChangeCreatedAt,
      ApprovedBy,
      ApprovedAt,
      LastChangedAt,

      /* Associations */
      _BOMItems,
      _ChangeHistory
}`, false, [projectedEntity]);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage())
      .to.equal("ROOT keyword not valid since ZI_BOM_CHG_BO is not a root property");
    expect(issues[0].getStart().getRow()).to.equal(4);
  });

  it("accepts a root projection on a root entity", async () => {
    const projectedEntity = new MemoryFile("zi_bom_chg_bo.ddls.asddls", `define root view entity ZI_BOM_CHG_BO
  as select from mara
{
  key matnr
}`);
    const issues = await findIssues(`define root view entity ZR_BOM_CHG_TP
  as projection on ZI_BOM_CHG_BO
{
  key BillOfMaterialCategory
}`, false, [projectedEntity]);
    expect(issues.length).to.equal(0);
  });
});
