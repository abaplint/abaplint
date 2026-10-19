import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Issue} from "../../src/issue";
import {SelectSingleFullKey} from "../../src/rules";
import {IFile} from "../../src";
import {applyEditSingle} from "../../src/edit_helper";
import {ABAPObject} from "../../src/objects/_abap_object";
import {Unknown} from "../../src/abap/2_statements/statements/_statement";
import * as Statements from "../../src/abap/2_statements/statements";

const ztab = `
<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZTAB</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>TRANSP</TABCLASS>
    <DDTEXT>transparent table</DDTEXT>
    <CONTFLAG>A</CONTFLAG>
   </DD02V>
   <DD09L>
    <TABNAME>ZTAB</TABNAME>
    <AS4LOCAL>A</AS4LOCAL>
    <TABKAT>0</TABKAT>
    <TABART>APPL0</TABART>
    <BUFALLOW>N</BUFALLOW>
   </DD09L>
   <DD03P_TABLE>
    <DD03P>
     <TABNAME>ZTAB</TABNAME>
     <FIELDNAME>FIELD1</FIELDNAME>
     <DDLANGUAGE>E</DDLANGUAGE>
     <POSITION>0001</POSITION>
     <KEYFLAG>X</KEYFLAG>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000040</INTLEN>
     <NOTNULL>X</NOTNULL>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000020</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
    <DD03P>
     <TABNAME>ZTAB</TABNAME>
     <FIELDNAME>VALUE1</FIELDNAME>
     <DDLANGUAGE>E</DDLANGUAGE>
     <POSITION>0002</POSITION>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>X</INTTYPE>
     <INTLEN>000004</INTLEN>
     <DATATYPE>INT4</DATATYPE>
     <LENG>000010</LENG>
     <MASK>  INT4</MASK>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

const zmandttab = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZMANDTTAB</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>TRANSP</TABCLASS>
    <CLIDEP>X</CLIDEP>
    <DDTEXT>test</DDTEXT>
    <CONTFLAG>A</CONTFLAG>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD09L>
    <TABNAME>ZMANDTTAB</TABNAME>
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
     <FIELDNAME>FIELD1</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000008</INTLEN>
     <NOTNULL>X</NOTNULL>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000004</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
  </asx:abap>
</abapGit>`;

const tadir = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>TADIR</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>TRANSP</TABCLASS>
    <CLIDEP>X</CLIDEP>
    <DDTEXT>Directory of Repository Objects</DDTEXT>
    <CONTFLAG>A</CONTFLAG>
   </DD02V>
   <DD09L>
    <TABNAME>TADIR</TABNAME>
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
     <FIELDNAME>PGMID</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000008</INTLEN>
     <NOTNULL>X</NOTNULL>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000004</LENG>
    </DD03P>
    <DD03P>
     <FIELDNAME>OBJECT</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000008</INTLEN>
     <NOTNULL>X</NOTNULL>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000004</LENG>
    </DD03P>
    <DD03P>
     <FIELDNAME>OBJ_NAME</FIELDNAME>
     <KEYFLAG>X</KEYFLAG>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000080</INTLEN>
     <NOTNULL>X</NOTNULL>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000040</LENG>
    </DD03P>
    <DD03P>
     <FIELDNAME>DEVCLASS</FIELDNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000060</INTLEN>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000030</LENG>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

async function findIssues(files: IFile[]): Promise<readonly Issue[]> {
  const reg = new Registry().addFiles(files);
  await reg.parseAsync();
  return new SelectSingleFullKey().initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: select_single_full_key", () => {

  const select = "SELECT SINGLE * FROM ztab INTO @DATA(result)";
  const quickfixes = [
    {
      name: "after the period",
      input: `${select}.`,
      output: `${select}. "#EC CI_NOORDER`,
    },
    {
      name: "after a pragma",
      input: `${select} ##SUBRC_OK.`,
      output: `${select} ##SUBRC_OK. "#EC CI_NOORDER`,
    },
    {
      name: "after a pragma on the following line",
      input: `${select}\n  ##SUBRC_OK.`,
      output: `${select}\n  ##SUBRC_OK. "#EC CI_NOORDER`,
    },
    {
      name: "preserving a trailing comment",
      input: `${select}. "existing explanation`,
      output: `${select}. "#EC CI_NOORDER "existing explanation`,
    },
    {
      name: "preserving the next statement on the same line",
      input: `${select}. WRITE result.`,
      output: `${select}. "#EC CI_NOORDER\n  WRITE result.`,
    },
    {
      name: "preserving the next line",
      input: `${select}.\nWRITE result.`,
      output: `${select}. "#EC CI_NOORDER\nWRITE result.`,
    },
  ];

  for (const test of quickfixes) {
    it(`quickfix ${test.name}`, async () => {
      const reg = new Registry().addFiles([
        new MemoryFile("zfoo.prog.abap", test.input),
        new MemoryFile("ztab.tabl.xml", ztab),
      ]);
      await reg.parseAsync();
      const rule = new SelectSingleFullKey().initialize(reg);
      const issues = rule.run(reg.getFirstObject()!);
      expect(issues.length).to.equal(1);
      expect(issues[0].getDefaultFix()).to.equal(undefined);
      const fixes = issues[0].getAlternativeFixes();
      expect(fixes?.length).to.equal(1);
      applyEditSingle(reg, fixes![0].edit);
      expect(reg.getFileByName("zfoo.prog.abap")!.getRaw()).to.equal(test.output);

      await reg.parseAsync();
      const file = (reg.getFirstObject()! as ABAPObject).getABAPFiles()[0];
      const statements = file.getStatements();
      expect(statements.filter(s => s.get() instanceof Unknown).length).to.equal(0);
      expect(statements.filter(s => s.get() instanceof Statements.Select).length).to.equal(1);
      expect(statements.filter(s => s.get() instanceof Statements.Write).length).to.equal(test.input.includes("WRITE") ? 1 : 0);
      expect(rule.run(reg.getFirstObject()!).length).to.equal(0);
    });
  }

  it("quickfix preserves the rest of a chained SELECT", async () => {
    const input = "SELECT SINGLE: * FROM ztab INTO @DATA(first),* FROM ztab INTO @DATA(second).";
    const reg = new Registry().addFiles([
      new MemoryFile("zfoo.prog.abap", input),
      new MemoryFile("ztab.tabl.xml", ztab),
    ]);
    await reg.parseAsync();
    const rule = new SelectSingleFullKey().initialize(reg);
    const issues = rule.run(reg.getFirstObject()!);
    expect(issues.length).to.equal(2);
    expect(issues[0].getDefaultFix()).to.equal(undefined);
    applyEditSingle(reg, issues[0].getAlternativeFixes()![0].edit);
    expect(reg.getFileByName("zfoo.prog.abap")!.getRaw()).to.equal(
      "SELECT SINGLE: * FROM ztab INTO @DATA(first), \"#EC CI_NOORDER\n * FROM ztab INTO @DATA(second).");

    await reg.parseAsync();
    const file = (reg.getFirstObject()! as ABAPObject).getABAPFiles()[0];
    expect(file.getStatements().filter(s => s.get() instanceof Unknown).length).to.equal(0);
    expect(file.getStatements().filter(s => s.get() instanceof Statements.Select).length).to.equal(2);
    expect(rule.run(reg.getFirstObject()!).length).to.equal(1);
  });

  it("test 1", async () => {
    const abap = "parser error";
    const issues = await findIssues([new MemoryFile("sfkey.prog.abap", abap)]);
    expect(issues.length).to.equal(0);
  });

  it("test 2", async () => {
    const abap = `DATA foo TYPE i.`;
    const issues = await findIssues([new MemoryFile("sfkey.prog.abap", abap)]);
    expect(issues.length).to.equal(0);
  });

  it("err", async () => {
    const abap = `SELECT SINGLE * FROM ztab INTO @DATA(sdfs).`;
    const file = new MemoryFile("zfoo.prog.abap", abap);
    const tabl = new MemoryFile("ztab.tabl.xml", ztab);

    const issues = await findIssues([file, tabl]);
    expect(issues.length).to.equal(1);
  });

  it("fixed", async () => {
    const abap = `SELECT SINGLE * FROM ztab INTO @DATA(sdfs) WHERE field1 = 'A'.`;
    const tabl = new MemoryFile("ztab.tabl.xml", ztab);
    const file = new MemoryFile("zfoo.prog.abap", abap);

    const issues = await findIssues([file, tabl]);
    expect(issues.length).to.equal(0);
  });

  it("suppresed by pseudo", async () => {
    const abap = `SELECT SINGLE * FROM ztab INTO @DATA(sdfs). "#EC CI_NOORDER`;
    const file = new MemoryFile("zfoo.prog.abap", abap);
    const tabl = new MemoryFile("ztab.tabl.xml", ztab);

    const issues = await findIssues([file, tabl]);
    expect(issues.length).to.equal(0);
  });

  it("fixed, ignore MANDT field", async () => {
    const abap = `SELECT SINGLE * FROM zmandttab INTO @DATA(sdfs) WHERE field1 = 'A'.`;
    const tabl = new MemoryFile("zmandttab.tabl.xml", zmandttab);
    const file = new MemoryFile("zfoo.prog.abap", abap);

    const issues = await findIssues([file, tabl]);
    expect(issues.length).to.equal(0);
  });

  it("fixed, escaped host expressions with dashes", async () => {
    const abap = `
TYPES: BEGIN OF ty_object,
         example TYPE tadir-obj_name,
         object_type TYPE tadir-object,
       END OF ty_object.
DATA object TYPE ty_object.

SELECT SINGLE devclass FROM tadir
  WHERE pgmid = 'R3TR'
  AND obj_name = @object-example
  AND object = @object-object_type
  INTO @DATA(example_obj_devclass).`;
    const tabl = new MemoryFile("tadir.tabl.xml", tadir);
    const file = new MemoryFile("zfoo.prog.abap", abap);

    const issues = await findIssues([file, tabl]);
    expect(issues.length).to.equal(0);
  });

});
