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

function transparentTable(name: string, fields: string[], keyFields: string[] = []): MemoryFile {
  const columns = fields.map((field, index) => `    <DD03P>
     <TABNAME>${name.toUpperCase()}</TABNAME>
     <FIELDNAME>${field.toUpperCase()}</FIELDNAME>
     <POSITION>000${index + 1}</POSITION>${keyFields.includes(field) ? "\n     <KEYFLAG>X</KEYFLAG>" : ""}
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

  it("reports @Semantics.currencyCode in a view entity", async () => {
    const table = transparentTable("zdb_amount", ["doc_id", "amount", "currency"]);
    const issues = await findIssues(`define view entity ZI_AMOUNT
  as select from zdb_amount
{
  key doc_id   as DocumentId,
      @Semantics.amount.currencyCode: 'Currency'
      amount   as Amount,
      @Semantics.currencyCode: true
      currency as Currency
}`, false, [table]);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage())
      .to.equal("Annotation Semantics.currencyCode is not allowed in view entities");
    expect(issues[0].getStart().getRow()).to.equal(7);
  });

  it("reports @Semantics.currencyCode in a view entity, nested annotation syntax", async () => {
    const table = transparentTable("zdb_amount", ["doc_id", "amount", "currency"]);
    const issues = await findIssues(`define view entity ZI_AMOUNT
  as select from zdb_amount
{
  key doc_id   as DocumentId,
      @Semantics: { amount: { currencyCode: 'Currency' } }
      amount   as Amount,
      @Semantics: { currencyCode: true }
      currency as Currency
}`, false, [table]);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage())
      .to.equal("Annotation Semantics.currencyCode is not allowed in view entities");
    expect(issues[0].getStart().getRow()).to.equal(7);
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

  for (const definition of ["define view", "define view entity"]) {
    for (const name of ["Zone", "HANDLER", "section"]) {
      it(`reports reserved alias ${name} in ${definition}`, async () => {
        const table = transparentTable("ztab", ["id"]);
        const issues = await findIssues(`${definition} ZI_TEST as select from ztab {
  key id as ${name}
}`, false, [table]);
        expect(issues.length).to.equal(1);
        expect(issues[0].getMessage()).to.equal(`CDS element name "${name}" is reserved`);
        expect(issues[0].getStart().getRow()).to.equal(2);
      });
    }

    it(`allows ordinary aliases in ${definition}`, async () => {
      const table = transparentTable("ztab", ["id"]);
      const issues = await findIssues(`${definition} ZI_TEST as select from ztab {
  key id as ZoneId,
      id as HandlerId,
      id as SectionId,
      id as Text,
      id as Length
}`, false, [table]);
      expect(issues.length).to.equal(0);
    });
  }

  it("reports reserved CDS element names without aliases", async () => {
    const table = transparentTable("ztab", ["zone", "handler", "section"]);
    const issues = await findIssues(`define view entity ZI_TEST as select from ztab {
  key ztab.zone,
      handler,
      section
}`, false, [table]);
    expect(issues.map(i => i.getMessage())).to.deep.equal([
      'CDS element name "zone" is reserved',
      'CDS element name "handler" is reserved',
      'CDS element name "section" is reserved',
    ]);
  });

  it("reports searchable without any default search element", async () => {
    const table = transparentTable("ztab_domval", ["domain_field", "value_text"]);
    const issues = await findIssues(`@EndUserText.label: 'Domain Values'
@Search.searchable: true
define view entity ZI_DOMVAL
  as select from ztab_domval
{
  key domain_field as DomainField,
      value_text   as ValueText
}`, false, [table]);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal(
      "@Search.defaultSearchElement: true required on at least one element when @Search.searchable: true");
    expect(issues[0].getStart().getRow()).to.equal(2);
  });

  it("accepts searchable with a default search element", async () => {
    const table = transparentTable("ztab_domval", ["domain_field", "value_text"]);
    const issues = await findIssues(`@Search.searchable: true
define view entity ZI_DOMVAL
  as select from ztab_domval
{
  key domain_field as DomainField,
      @Search.defaultSearchElement: true
      @Search.fuzzinessThreshold: 0.8
      value_text   as ValueText
}`, false, [table]);
    expect(issues.length).to.equal(0);
  });

  it("accepts searchable with a default search element, nested annotation syntax", async () => {
    const table = transparentTable("ztab_domval", ["domain_field", "value_text"]);
    const issues = await findIssues(`@Search: { searchable: true }
define view entity ZI_DOMVAL
  as select from ztab_domval
{
  key domain_field as DomainField,
      @Search: { ranking: #HIGH, defaultSearchElement: true }
      value_text   as ValueText
}`, false, [table]);
    expect(issues.length).to.equal(0);
  });

  it("accepts a default search element without searchable", async () => {
    const table = transparentTable("ztab_domval", ["domain_field", "value_text"]);
    const issues = await findIssues(`define view entity ZI_DOMVAL
  as select from ztab_domval
{
  key domain_field as DomainField,
      @Search.defaultSearchElement: true
      value_text   as ValueText
}`, false, [table]);
    expect(issues.length).to.equal(0);
  });

  it("accepts searchable set to false", async () => {
    const table = transparentTable("ztab_domval", ["domain_field", "value_text"]);
    const issues = await findIssues(`@Search.searchable: false
define view entity ZI_DOMVAL
  as select from ztab_domval
{
  key domain_field as DomainField,
      value_text   as ValueText
}`, false, [table]);
    expect(issues.length).to.equal(0);
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
  describe("transactional projection on an entity which is not part of a business object", () => {
    const role = `define view entity ZI_Role as select from zrole_tab
  association [0..*] to ZI_RoleSpace as _SpaceAssignment on $projection.RoleName = _SpaceAssignment.RoleName
{
  key role_name as RoleName,
      descr     as RoleDescription,
      _SpaceAssignment
}`;
    const projection = (contract = "") => `define view entity ZC_Role${contract} as projection on ZI_Role
{
  key RoleName,
      RoleDescription,
      _SpaceAssignment : redirected to ZC_RoleSpace
}`;

    async function run(cds: string, dependencies: MemoryFile[]): Promise<readonly Issue[]> {
      const files = [new MemoryFile("zc_role.ddls.asddls", cds), ...dependencies];
      const reg = new Registry().addFiles(files);
      await reg.parseAsync();
      const target = reg.getObject("DDLS", "ZC_ROLE") as DataDefinition;
      return new CDSCheckSyntax().initialize(reg).run(target).filter(i => i.getMessage().startsWith("Transactional projection"));
    }

    it("reports a projection without provider contract", async () => {
      const issues = await run(projection(), [new MemoryFile("zi_role.ddls.asddls", role)]);
      expect(issues.length).to.equal(1);
      expect(issues[0].getMessage()).to.equal(
        "Transactional projection on ZI_Role not possible, ZI_Role is not a root entity or part of a composition");
      expect(issues[0].getStart().getRow()).to.equal(1);
    });

    it("reports a projection with provider contract transactional_query", async () => {
      const issues = await run(projection(" provider contract transactional_query"), [new MemoryFile("zi_role.ddls.asddls", role)]);
      expect(issues.length).to.equal(1);
    });

    for (const contract of ["analytical_query", "transactional_interface"]) {
      it(`accepts a projection with provider contract ${contract}`, async () => {
        const issues = await run(projection(" provider contract " + contract), [new MemoryFile("zi_role.ddls.asddls", role)]);
        expect(issues.length).to.equal(0);
      });
    }

    it("accepts a projection on an entity which is not in the registry", async () => {
      const issues = await run(projection(), []);
      expect(issues.length).to.equal(0);
    });

    it("accepts a projection on a root entity", async () => {
      const issues = await run(projection(), [new MemoryFile("zi_role.ddls.asddls", role.replace("define view", "define root view"))]);
      expect(issues.length).to.equal(0);
    });

    it("accepts a projection on a composition child", async () => {
      const root = new MemoryFile("zi_roleroot.ddls.asddls", `define root view entity ZI_RoleRoot as select from zroot_tab
  composition [0..*] of ZI_Role as _Roles
{
  key root_id as RootId,
      _Roles
}`);
      const child = new MemoryFile("zi_role.ddls.asddls", `define view entity ZI_Role as select from zrole_tab
  association to parent ZI_RoleRoot as _Root on $projection.RootId = _Root.RootId
{
  key root_id   as RootId,
  key role_name as RoleName,
      _Root
}`);
      const issues = await run(projection(), [root, child]);
      expect(issues.length).to.equal(0);
    });

    it("accepts a projection on a composition child, child without to-parent association", async () => {
      const root = new MemoryFile("zi_roleroot.ddls.asddls", `define root view entity ZI_RoleRoot as select from zroot_tab
  composition of many ZI_Role as _Roles
{
  key root_id as RootId,
      _Roles
}`);
      const issues = await run(projection(), [root, new MemoryFile("zi_role.ddls.asddls", role)]);
      expect(issues.length).to.equal(0);
    });

    it("accepts a projection on an entity which is the parent of a to-parent association", async () => {
      const grandChild = new MemoryFile("zi_rolechild.ddls.asddls", `define view entity ZI_RoleChild as select from zchild_tab
  association to parent ZI_Role as _Role on $projection.RoleName = _Role.RoleName
{
  key role_name as RoleName,
      _Role
}`);
      const issues = await run(projection(), [grandChild, new MemoryFile("zi_role.ddls.asddls", role)]);
      expect(issues.length).to.equal(0);
    });
  });

  describe("path expression via association with calculated element in ON condition", () => {
    const roleSpace = (elements: string) => `define view entity ZI_RoleSpace as select from zrole_space_tab as RS
  association [1..1] to ZI_Role  as _Role  on $projection.RoleName = _Role.RoleName
  association [0..1] to ZI_Space as _Space on $projection.SpaceId  = _Space.SpaceId
{
  key RS.role_name                         as RoleName,
  key cast( RS.url as zspace_id )          as SpaceId,
${elements}
}`;

    async function findPathIssues(cds: string): Promise<readonly Issue[]> {
      return (await findIssues(cds)).filter(i => i.getMessage().startsWith("Path expression"));
    }

    it("reports a path expression via the association", async () => {
      const issues = await findPathIssues(roleSpace(`      _Role.RoleDescription                as RoleDescription,
      _Space.SpaceTitle                    as SpaceTitle,
      _Role,
      _Space`));
      expect(issues.length).to.equal(1);
      expect(issues[0].getMessage()).to.equal(
        "Path expression via _Space not possible, its ON condition uses calculated element SpaceId");
      expect(issues[0].getStart().getRow()).to.equal(8);
    });

    it("reports a path expression in WHERE", async () => {
      const issues = await findPathIssues(roleSpace(`      _Space`) + `
where _Space.SpaceTitle = 'A'`);
      expect(issues.length).to.equal(1);
      expect(issues[0].getStart().getRow()).to.equal(9);
    });

    it("accepts exposing the association", async () => {
      const issues = await findPathIssues(roleSpace(`      _Role,
      _Space`));
      expect(issues.length).to.equal(0);
    });

    it("accepts a path expression via an association using a plain field", async () => {
      const issues = await findPathIssues(roleSpace(`      _Role.RoleDescription                as RoleDescription,
      _Role`));
      expect(issues.length).to.equal(0);
    });

    it("accepts a path expression when the ON condition element is a plain field", async () => {
      const issues = await findPathIssues(`define view entity ZI_RoleSpace as select from zrole_space_tab as RS
  association [0..1] to ZI_Space as _Space on $projection.SpaceId  = _Space.SpaceId
{
  key RS.space_id                          as SpaceId,
      _Space.SpaceTitle                    as SpaceTitle,
      _Space
}`);
      expect(issues.length).to.equal(0);
    });

    it("reports path expressions via an association with a case element", async () => {
      const issues = await findPathIssues(`define view entity ZI_RoleSpace as select from zrole_space_tab as RS
  association [0..1] to ZI_Space as _Space on $projection.SpaceId  = _Space.SpaceId
{
  key case RS.kind when 'A' then RS.a else RS.b end as SpaceId,
      _Space.SpaceTitle as SpaceTitle,
      _Space
}`);
      expect(issues.length).to.equal(1);
    });
  });

  describe("composition fields", () => {
    const rootTable = transparentTable("zroot_tab", ["root_id"], ["root_id"]);
    const child = new MemoryFile("zi_child.ddls.asddls", `define view entity ZI_Child as select from zchild_tab
  association to parent ZTARGET as _Root on $projection.RootId = _Root.RootId
{
  key root_id   as RootId,
  key child_id  as ChildId,
      some_field as SomeField,
      _Root
}`);
    const childTable = transparentTable("zchild_tab", ["root_id", "child_id", "some_field"], ["root_id", "child_id"]);

    const root = (composition: string, elements: string) => `define root view entity ZTARGET as select from zroot_tab
  ${composition}
{
  key root_id as RootId,
${elements}
}`;

    for (const composition of ["composition [0..*] of ZI_Child as _Children", "composition of many ZI_Child as _Children"]) {
      it(`accepts exposing a composition, ${composition}`, async () => {
        const issues = await findIssues(root(composition, "      _Children"), false, [rootTable, child, childTable]);
        expect(issues.map(i => i.getMessage())).to.deep.equal([]);
      });

      it(`accepts a path expression via a composition, ${composition}`, async () => {
        const issues = await findIssues(root(composition, `      _Children.SomeField as SomeField`), false, [rootTable, child, childTable]);
        expect(issues.map(i => i.getMessage())).to.deep.equal([]);
      });
    }

    it("accepts exposing a composition with a namespaced target", async () => {
      const issues = await findIssues(root("composition [0..*] of /ABC/I_CHILD as _Children", `      _Children`), false, [rootTable]);
      expect(issues.map(i => i.getMessage())).to.deep.equal([]);
    });

    it("accepts exposing a composition without alias", async () => {
      const issues = await findIssues(root("composition [0..*] of ZI_Child", `      ZI_Child.SomeField as SomeField,
      ZI_Child`), false, [rootTable, child, childTable]);
      expect(issues.map(i => i.getMessage())).to.deep.equal([]);
    });

    it("still reports an unknown field next to an exposed composition", async () => {
      const issues = await findIssues(root("composition [0..*] of ZI_Child as _Children", `      nonexisting_field,
      _Children.SomeField as SomeField,
      _Children`), false, [rootTable, child, childTable]);
      expect(issues.map(i => i.getMessage())).to.deep.equal(['CDS field "nonexisting_field" not found in "zroot_tab"']);
      expect(issues[0].getStart().getRow()).to.equal(5);
    });
  });

  describe("SOURCE_TYPE in XML", () => {
    function ddlsXml(sourceType: string): string {
      return `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DDLS" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DDLS>
    <DDLNAME>ZI_ROLESPACE</DDLNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <DDTEXT>Role space</DDTEXT>
    <SOURCE_TYPE>${sourceType}</SOURCE_TYPE>
   </DDLS>
  </asx:values>
 </asx:abap>
</abapGit>`;
    }

    const ddicView = `@AbapCatalog.sqlViewName: 'ZIROLSPC'
define view ZI_RoleSpace as select from zrole_space_tab {
  key role_name as RoleName
}`;
    const viewEntity = `define view entity ZI_RoleSpace as select from zrole_space_tab {
  key role_name as RoleName
}`;
    const rootViewEntity = `define root view entity ZI_RoleSpace as select from zrole_space_tab {
  key role_name as RoleName
}`;
    const projection = `define view entity ZI_RoleSpace as projection on ZI_Other {
  key RoleName
}`;
    const abstractEntity = `define abstract entity ZI_RoleSpace {
  RoleName : abap.char(10);
}`;

    async function runDdls(cds: string, xml: string): Promise<readonly Issue[]> {
      const reg = new Registry().addFiles([
        new MemoryFile("zi_rolespace.ddls.asddls", cds),
        new MemoryFile("zi_rolespace.ddls.xml", xml),
      ]);
      await reg.parseAsync();
      const target = reg.getObject("DDLS", "ZI_ROLESPACE") as DataDefinition;
      return new CDSCheckSyntax().initialize(reg).run(target).filter(i => i.getMessage().startsWith("SOURCE_TYPE"));
    }

    const ok: [string, string, string][] = [
      ["DDIC-based view", ddicView, "V"],
      ["view entity", viewEntity, "W"],
      ["root view entity", rootViewEntity, "W"],
      ["projection view", projection, "P"],
      ["abstract entity, unconfirmed SOURCE_TYPE", abstractEntity, "A"],
      ["abstract entity, W not checked", abstractEntity, "W"],
      ["unknown SOURCE_TYPE", viewEntity, "X"],
      ["parser error", "define view entity ZI_RoleSpace as hello world", "V"],
    ];
    for (const [title, cds, sourceType] of ok) {
      it(`accepts ${title}, ${sourceType}`, async () => {
        const issues = await runDdls(cds, ddlsXml(sourceType));
        expect(issues.length).to.equal(0);
      });
    }

    const mismatch: [string, string, string, string][] = [
      ["DDIC-based view", ddicView, "W", "V"],
      ["view entity", viewEntity, "V", "W"],
      ["root view entity", rootViewEntity, "P", "W"],
      ["projection view", projection, "W", "P"],
    ];
    for (const [title, cds, sourceType, expected] of mismatch) {
      it(`reports ${title}, ${sourceType}`, async () => {
        const issues = await runDdls(cds, ddlsXml(sourceType));
        expect(issues.length).to.equal(1);
        expect(issues[0].getMessage()).to.equal(`SOURCE_TYPE "${sourceType}" does not match DDL source, expected "${expected}"`);
        expect(issues[0].getFilename()).to.equal("zi_rolespace.ddls.xml");
        expect(issues[0].getStart().getRow()).to.equal(9);
      });
    }

    it("accepts XML without SOURCE_TYPE", async () => {
      const issues = await runDdls(ddicView, ddlsXml("W").replace("    <SOURCE_TYPE>W</SOURCE_TYPE>\n", ""));
      expect(issues.length).to.equal(0);
    });
  });
});
