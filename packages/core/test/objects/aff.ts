import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Class, Interface} from "../../src/objects";
import {getABAPObjects} from "../get_abap";

// Smoke tests for ABAP File Format (AFF) support added in PR #3888.
//
// Schemas: SAP/abap-file-formats clas-v1.json / intf-v1.json
// (required top-level: formatVersion, header; required header: description, originalLanguage)
//
// parseAFF() in class.ts / interface.ts only reads json.header.description and
// json.category — fixtures below carry the schema-required keys plus whatever
// each test asserts on, nothing more.
//
// Note: AFF category is a string enum ("generalObjectType", "testclassAbapUnit",
// "exceptionClass", ...). abapGit XML CATEGORY is a numeric code ("05" = test).
// The PR stores the JSON value verbatim, so getCategory() returns whichever shape
// the source format uses.

const CLAS_XML =
  "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
  "<abapGit version=\"v1.0.0\" serializer=\"LCL_OBJECT_CLAS\" serializer_version=\"v1.0.0\">\n" +
  " <asx:abap xmlns:asx=\"http://www.sap.com/abapxml\" version=\"1.0\">\n" +
  "  <asx:values>\n" +
  "   <VSEOCLASS>\n" +
  "    <DESCRIPT>legacy desc</DESCRIPT>\n" +
  "    <CATEGORY>00</CATEGORY>\n" +
  "   </VSEOCLASS>\n" +
  "  </asx:values>\n" +
  " </asx:abap>\n" +
  "</abapGit>";

const INTF_XML =
  "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
  "<abapGit version=\"v1.0.0\" serializer=\"LCL_OBJECT_INTF\" serializer_version=\"v1.0.0\">\n" +
  " <asx:abap xmlns:asx=\"http://www.sap.com/abapxml\" version=\"1.0\">\n" +
  "  <asx:values>\n" +
  "   <VSEOINTERF>\n" +
  "    <DESCRIPT>legacy intf desc</DESCRIPT>\n" +
  "   </VSEOINTERF>\n" +
  "  </asx:values>\n" +
  " </asx:abap>\n" +
  "</abapGit>";

const CLAS_JSON = JSON.stringify({
  formatVersion: "1",
  header: {description: "aff desc", originalLanguage: "en"},
});

const INTF_JSON = JSON.stringify({
  formatVersion: "1",
  header: {description: "aff intf desc", originalLanguage: "en"},
});

// Pin the legacy↔AFF filename mapping the PR establishes. For each pair, the
// AFF filename must produce the same observable behavior as its legacy
// counterpart so consumers don't have to care which serializer wrote the repo.
describe("AFF: legacy abapGit ↔ AFF filename equivalence", () => {

  it("class metadata: .clas.xml ↔ .clas.json (different shapes, same getDescription contract)", () => {
    const legacy = new Registry()
      .addFile(new MemoryFile("zcl_pair_meta.clas.xml", CLAS_XML))
      .parse();
    const aff = new Registry()
      .addFile(new MemoryFile("zcl_pair_meta.clas.json", CLAS_JSON))
      .parse();

    expect((getABAPObjects(legacy)[0] as Class).getDescription()).to.equal("legacy desc");
    expect((getABAPObjects(aff)[0] as Class).getDescription()).to.equal("aff desc");
  });

  it("interface metadata: .intf.xml ↔ .intf.json", () => {
    const legacy = new Registry()
      .addFile(new MemoryFile("zif_pair_meta.intf.xml", INTF_XML))
      .parse();
    const aff = new Registry()
      .addFile(new MemoryFile("zif_pair_meta.intf.json", INTF_JSON))
      .parse();

    expect((getABAPObjects(legacy)[0] as Interface).getDescription()).to.equal("legacy intf desc");
    expect((getABAPObjects(aff)[0] as Interface).getDescription()).to.equal("aff intf desc");
  });

  it("local implementations: .clas.locals_imp.abap ↔ .clas.implementations.abap", () => {
    const legacy = new Registry()
      .addFile(new MemoryFile("zcl_pair_imp.clas.abap", ""))
      .addFile(new MemoryFile("zcl_pair_imp.clas.locals_imp.abap", "* impl"))
      .parse();
    const aff = new Registry()
      .addFile(new MemoryFile("zcl_pair_imp.clas.abap", ""))
      .addFile(new MemoryFile("zcl_pair_imp.clas.implementations.abap", "* impl"))
      .parse();

    expect((getABAPObjects(legacy)[0] as Class).getLocalsImpFile()?.getFilename())
      .to.match(/\.clas\.locals_imp\.abap$/);
    expect((getABAPObjects(aff)[0] as Class).getLocalsImpFile()?.getFilename())
      .to.match(/\.clas\.implementations\.abap$/);
  });

  it("local definitions: .clas.locals_def.abap ↔ .clas.definitions.abap (sequenced before main)", () => {
    // No public getter for locals-def; pin via getSequencedFiles() ordering.
    const legacy = new Registry()
      .addFile(new MemoryFile("zcl_pair_def.clas.abap", ""))
      .addFile(new MemoryFile("zcl_pair_def.clas.locals_def.abap", "* def"))
      .parse();
    const aff = new Registry()
      .addFile(new MemoryFile("zcl_pair_def.clas.abap", ""))
      .addFile(new MemoryFile("zcl_pair_def.clas.definitions.abap", "* def"))
      .parse();

    const legacyOrder = (getABAPObjects(legacy)[0] as Class).getSequencedFiles().map(f => f.getFilename());
    const affOrder = (getABAPObjects(aff)[0] as Class).getSequencedFiles().map(f => f.getFilename());

    expect(legacyOrder.findIndex(n => n.endsWith(".clas.locals_def.abap")))
      .to.be.lessThan(legacyOrder.findIndex(n => n.endsWith(".clas.abap")
        && !n.endsWith(".locals_def.abap")));
    expect(affOrder.findIndex(n => n.endsWith(".clas.definitions.abap")))
      .to.be.lessThan(affOrder.findIndex(n => n.endsWith(".clas.abap")
        && !n.endsWith(".definitions.abap")));
  });

  it("AFF takes precedence when both .clas.json and .clas.xml exist for the same class", () => {
    const reg = new Registry()
      .addFile(new MemoryFile("zcl_pair_both.clas.xml", CLAS_XML))
      .addFile(new MemoryFile("zcl_pair_both.clas.json", CLAS_JSON))
      .parse();

    expect((getABAPObjects(reg)[0] as Class).getDescription()).to.equal("aff desc");
  });

});

describe("AFF: class metadata edge cases", () => {

  it("reads category enum string from JSON", () => {
    const json = JSON.stringify({
      formatVersion: "1",
      header: {description: "d", originalLanguage: "en"},
      category: "testclassAbapUnit",
    });
    const reg = new Registry()
      .addFile(new MemoryFile("zcl_aff_cat.clas.json", json))
      .parse();

    expect((getABAPObjects(reg)[0] as Class).getCategory()).to.equal("testclassAbapUnit");
  });

  it("returns undefined category when omitted", () => {
    const json = JSON.stringify({
      formatVersion: "1",
      header: {description: "no cat", originalLanguage: "en"},
    });
    const reg = new Registry()
      .addFile(new MemoryFile("zcl_aff_nocat.clas.json", json))
      .parse();

    expect((getABAPObjects(reg)[0] as Class).getCategory()).to.equal(undefined);
  });

  it("falls back to empty description when JSON is malformed", () => {
    const reg = new Registry()
      .addFile(new MemoryFile("zcl_aff_bad.clas.json", "{not valid"))
      .parse();

    expect((getABAPObjects(reg)[0] as Class).getDescription()).to.equal("");
  });

});

describe("AFF: full class file sequencing", () => {

  it("orders .definitions, .implementations, .clas.abap, .testclasses", () => {
    const reg = new Registry()
      // deliberately scrambled
      .addFile(new MemoryFile("zcl_aff_seq.clas.testclasses.abap", "* tests"))
      .addFile(new MemoryFile("zcl_aff_seq.clas.abap", ""))
      .addFile(new MemoryFile("zcl_aff_seq.clas.implementations.abap", "* impls"))
      .addFile(new MemoryFile("zcl_aff_seq.clas.definitions.abap", "* defs"))
      .parse();

    const clas = getABAPObjects(reg)[0] as Class;
    const filenames = clas.getSequencedFiles().map(f => f.getFilename());
    const idxDef = filenames.findIndex(n => n.endsWith(".clas.definitions.abap"));
    const idxImp = filenames.findIndex(n => n.endsWith(".clas.implementations.abap"));
    const idxMain = filenames.findIndex(n => n.endsWith(".clas.abap")
      && !n.endsWith(".definitions.abap")
      && !n.endsWith(".implementations.abap")
      && !n.endsWith(".testclasses.abap"));
    const idxTest = filenames.findIndex(n => n.endsWith(".clas.testclasses.abap"));

    expect(idxDef).to.be.lessThan(idxImp);
    expect(idxImp).to.be.lessThan(idxMain);
    expect(idxMain).to.be.lessThan(idxTest);
  });

});
