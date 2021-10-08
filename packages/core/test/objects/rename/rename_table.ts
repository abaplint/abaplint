import {MemoryFile} from "../../../src/files/memory_file";
import {expect} from "chai";
import {Renamer} from "../../../src/objects/rename/renamer";
import {Registry} from "../../../src/registry";

describe("Rename TABL", () => {

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZABAPGIT_UNIT_T2</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>TRANSP</TABCLASS>
    <CLIDEP>X</CLIDEP>
    <DDTEXT>testing</DDTEXT>
    <CONTFLAG>A</CONTFLAG>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD09L>
    <TABNAME>ZABAPGIT_UNIT_T2</TABNAME>
    <AS4LOCAL>A</AS4LOCAL>
    <TABKAT>0</TABKAT>
    <TABART>APPL0</TABART>
    <BUFALLOW>N</BUFALLOW>
   </DD09L>
   <DD03P_TABLE>
    <DD03P>
     <FIELDNAME>MANDT</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ROLLNAME>MANDT</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <NOTNULL>X</NOTNULL>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>XUBNAME</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ROLLNAME>XUBNAME</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <NOTNULL>X</NOTNULL>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
    <DD03P>
     <FIELDNAME>NAME</FIELDNAME>
     <ROLLNAME>XUBNAME</ROLLNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <COMPTYPE>E</COMPTYPE>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

  it("TABL, no references, just the object", () => {
    const reg = new Registry().addFiles([
      new MemoryFile("zabapgit_unit_t2.tabl.xml", xml),
    ]).parse();
    new Renamer(reg).rename("TABL", "zabapgit_unit_t2", "foo");
    expect(reg.getObjectCount()).to.equal(1);
    for (const f of reg.getFiles()) {
      expect(f.getFilename()).to.equal("foo.tabl.xml");
      expect(f.getRaw().includes("<TABNAME>FOO</TABNAME>")).to.equal(true);
    }
  });

  it("TABL, referenced via dash", () => {
    const prog = `REPORT zprog_rename_tabl.
DATA bar2 TYPE zabapgit_unit_t2-name.`;
    const reg = new Registry().addFiles([
      new MemoryFile("zabapgit_unit_t2.tabl.xml", xml),
      new MemoryFile("zprog_rename_tabl.prog.abap", prog),
    ]).parse();
    reg.findIssues(); // hmm, this builds the ddic references
    new Renamer(reg).rename("TABL", "zabapgit_unit_t2", "foo");
    expect(reg.getObjectCount()).to.equal(2);
    for (const f of reg.getFiles()) {
      if (f.getFilename() === "foo.tabl.xml") {
        expect(f.getFilename()).to.equal("foo.tabl.xml");
        expect(f.getRaw().includes("<TABNAME>FOO</TABNAME>")).to.equal(true);
      } else if (f.getFilename() === "zprog_rename_tabl.prog.abap") {
        expect(f.getRaw()).to.equal(`REPORT zprog_rename_tabl.
DATA bar2 TYPE foo-name.`);
      } else {
        expect(1).to.equal(f.getFilename(), "unexpected file");
      }
    }
  });

});