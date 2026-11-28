/* eslint-disable max-len */
import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {DynproChecks} from "../../src/rules";
import {Issue} from "../../src/issue";

async function findIssues(abap: string): Promise<readonly Issue[]> {
  return findIssuesMulti([{filename: "zfoobar.prog.xml", contents: abap}], "ZFOOBAR");
}

async function findIssuesMulti(files: {filename: string, contents: string}[], objectName: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFiles(files.map(f => new MemoryFile(f.filename, f.contents)));
  await reg.parseAsync();
  const rule = new DynproChecks();
  return rule.initialize(reg).run(reg.getObject("PROG", objectName)!);
}

const SCREEN_FLOW = `PROCESS BEFORE OUTPUT.
PROCESS AFTER INPUT.`;

function buildXML(dynpros: {screen: string, flowLogic: boolean}[]): string {
  const items = dynpros.map(d => `
    <item>
     <HEADER>
      <PROGRAM>ZFOOBAR</PROGRAM>
      <SCREEN>${d.screen}</SCREEN>
      <LANGUAGE>E</LANGUAGE>
      <DESCRIPT>screen</DESCRIPT>
      <TYPE>N</TYPE>
      <NEXTSCREEN>${d.screen}</NEXTSCREEN>
      <LINES>027</LINES>
      <COLUMNS>121</COLUMNS>
     </HEADER>
     <CONTAINERS>
      <RPY_DYCATT>
       <TYPE>SCREEN</TYPE>
       <NAME>SCREEN</NAME>
      </RPY_DYCATT>
     </CONTAINERS>
     <FIELDS>
      <RPY_DYFATC>
       <CONT_TYPE>SCREEN</CONT_TYPE>
       <CONT_NAME>SCREEN</CONT_NAME>
       <TYPE>OKCODE</TYPE>
       <TEXT>____________________</TEXT>
       <LENGTH>020</LENGTH>
       <VISLENGTH>020</VISLENGTH>
       <HEIGHT>001</HEIGHT>
       <FORMAT>CHAR</FORMAT>
       <INPUT_FLD>X</INPUT_FLD>
      </RPY_DYFATC>
     </FIELDS>${d.flowLogic ? `
     <FLOW_LOGIC>
      <RPY_DYFLOW>
       <LINE>PROCESS BEFORE OUTPUT.</LINE>
      </RPY_DYFLOW>
      <RPY_DYFLOW>
       <LINE>PROCESS AFTER INPUT.</LINE>
      </RPY_DYFLOW>
     </FLOW_LOGIC>` : ""}
    </item>`).join("");

  return `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_PROG" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <PROGDIR>
    <NAME>ZFOOBAR</NAME>
    <SUBC>1</SUBC>
    <RLOAD>E</RLOAD>
    <FIXPT>X</FIXPT>
    <UCCHECK>X</UCCHECK>
   </PROGDIR>
   <DYNPROS>${items}
   </DYNPROS>
  </asx:values>
 </asx:abap>
</abapGit>`;
}

describe("Rule: dynpro_checks", () => {

  it("Element SDFSDF length longer than 132", async () => {
    const issues = await findIssues(`<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_PROG" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <PROGDIR>
    <NAME>ZHVAM</NAME>
    <SUBC>1</SUBC>
    <RLOAD>E</RLOAD>
    <FIXPT>X</FIXPT>
   </PROGDIR>
   <DYNPROS>
    <item>
     <HEADER>
      <PROGRAM>ZHVAM</PROGRAM>
      <SCREEN>2000</SCREEN>
      <LANGUAGE>E</LANGUAGE>
      <DESCRIPT>jhjhg</DESCRIPT>
      <TYPE>N</TYPE>
      <NEXTSCREEN>2000</NEXTSCREEN>
      <LINES>031</LINES>
      <COLUMNS>182</COLUMNS>
     </HEADER>
     <CONTAINERS>
      <RPY_DYCATT>
       <TYPE>SCREEN</TYPE>
       <NAME>SCREEN</NAME>
      </RPY_DYCATT>
     </CONTAINERS>
     <FIELDS>
      <RPY_DYFATC>
       <CONT_TYPE>SCREEN</CONT_TYPE>
       <CONT_NAME>SCREEN</CONT_NAME>
       <TYPE>PUSH</TYPE>
       <NAME>SDFSDF</NAME>
       <TEXT>sdfsdf______________________________________________________________________________________________________________________________</TEXT>
       <LINE>001</LINE>
       <COLUMN>001</COLUMN>
       <LENGTH>169</LENGTH>
       <VISLENGTH>169</VISLENGTH>
       <HEIGHT>001</HEIGHT>
       <PUSH_FCODE>SDF</PUSH_FCODE>
       <FORMAT>CHAR</FORMAT>
       <REQU_ENTRY>N</REQU_ENTRY>
      </RPY_DYFATC>
      <RPY_DYFATC>
       <CONT_TYPE>SCREEN</CONT_TYPE>
       <CONT_NAME>SCREEN</CONT_NAME>
       <TYPE>OKCODE</TYPE>
       <TEXT>____________________</TEXT>
       <LENGTH>020</LENGTH>
       <VISLENGTH>020</VISLENGTH>
       <HEIGHT>001</HEIGHT>
       <FORMAT>CHAR</FORMAT>
       <INPUT_FLD>X</INPUT_FLD>
      </RPY_DYFATC>
     </FIELDS>
     <FLOW_LOGIC>
      <RPY_DYFLOW>
       <LINE>PROCESS BEFORE OUTPUT.</LINE>
      </RPY_DYFLOW>
      <RPY_DYFLOW>
       <LINE>* MODULE STATUS_2000.</LINE>
      </RPY_DYFLOW>
      <RPY_DYFLOW>
       <LINE>*</LINE>
      </RPY_DYFLOW>
      <RPY_DYFLOW>
       <LINE>PROCESS AFTER INPUT.</LINE>
      </RPY_DYFLOW>
      <RPY_DYFLOW>
       <LINE>* MODULE USER_COMMAND_2000.</LINE>
      </RPY_DYFLOW>
     </FLOW_LOGIC>
    </item>
   </DYNPROS>
   <TPOOL>
    <item>
     <ID>R</ID>
     <ENTRY>test</ENTRY>
     <LENGTH>4</LENGTH>
    </item>
   </TPOOL>
  </asx:values>
 </asx:abap>
</abapGit>`);
    expect(issues.length).to.equal(1);
  });

  it("does not report non-overlapping text fields", async () => {
    const issues = await findIssuesMulti([{filename: "zfoobar.prog.screen_5000.abap", contents: SCREEN_FLOW}, {filename: "zfoobar.prog.xml", contents: `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_PROG" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <PROGDIR>
    <NAME>ZHVAM</NAME>
    <SUBC>1</SUBC>
    <RLOAD>E</RLOAD>
    <FIXPT>X</FIXPT>
    <UCCHECK>X</UCCHECK>
   </PROGDIR>
   <DYNPROS>
    <item>
     <HEADER>
      <PROGRAM>ZHVAM</PROGRAM>
      <SCREEN>5000</SCREEN>
      <LANGUAGE>E</LANGUAGE>
      <DESCRIPT>sdfsdf</DESCRIPT>
      <TYPE>N</TYPE>
      <NEXTSCREEN>5000</NEXTSCREEN>
      <LINES>027</LINES>
      <COLUMNS>121</COLUMNS>
     </HEADER>
     <CONTAINERS>
      <RPY_DYCATT>
       <TYPE>SCREEN</TYPE>
       <NAME>SCREEN</NAME>
      </RPY_DYCATT>
     </CONTAINERS>
     <FIELDS>
      <RPY_DYFATC>
       <CONT_TYPE>SCREEN</CONT_TYPE>
       <CONT_NAME>SCREEN</CONT_NAME>
       <TYPE>TEXT</TYPE>
       <NAME>SDF</NAME>
       <TEXT>sdfsd</TEXT>
       <LINE>001</LINE>
       <COLUMN>001</COLUMN>
       <LENGTH>005</LENGTH>
       <VISLENGTH>005</VISLENGTH>
       <HEIGHT>001</HEIGHT>
       <FORMAT>CHAR</FORMAT>
       <REQU_ENTRY>N</REQU_ENTRY>
      </RPY_DYFATC>
      <RPY_DYFATC>
       <CONT_TYPE>SCREEN</CONT_TYPE>
       <CONT_NAME>SCREEN</CONT_NAME>
       <TYPE>TEXT</TYPE>
       <NAME>BAR</NAME>
       <TEXT>barrr</TEXT>
       <LINE>003</LINE>
       <COLUMN>001</COLUMN>
       <LENGTH>005</LENGTH>
       <VISLENGTH>005</VISLENGTH>
       <HEIGHT>001</HEIGHT>
       <FORMAT>CHAR</FORMAT>
       <REQU_ENTRY>N</REQU_ENTRY>
      </RPY_DYFATC>
      <RPY_DYFATC>
       <CONT_TYPE>SCREEN</CONT_TYPE>
       <CONT_NAME>SCREEN</CONT_NAME>
       <TYPE>OKCODE</TYPE>
       <NAME>OK_CODE</NAME>
       <TEXT>____________________</TEXT>
       <LENGTH>020</LENGTH>
       <VISLENGTH>020</VISLENGTH>
       <HEIGHT>001</HEIGHT>
       <FORMAT>CHAR</FORMAT>
       <INPUT_FLD>X</INPUT_FLD>
      </RPY_DYFATC>
     </FIELDS>
    </item>
   </DYNPROS>
   <TPOOL>
    <item>
     <ID>R</ID>
     <ENTRY>test</ENTRY>
     <LENGTH>4</LENGTH>
    </item>
   </TPOOL>
  </asx:values>
 </asx:abap>
</abapGit>`}], "ZFOOBAR");
    expect(issues).to.have.length(0);
  });

  it("overlapping dynpro fields", async () => {
    const issues = await findIssuesMulti([
      {filename: "zdynprooverlap.prog.abap", contents: `REPORT zdynprooverlap.

TABLES zoverlap.`},
      {filename: "zdynprooverlap.prog.xml", contents: `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_PROG" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <PROGDIR>
    <NAME>ZDYNPROOVERLAP</NAME>
    <SUBC>1</SUBC>
    <RLOAD>E</RLOAD>
    <FIXPT>X</FIXPT>
    <UCCHECK>X</UCCHECK>
   </PROGDIR>
   <DYNPROS>
    <item>
     <HEADER>
      <PROGRAM>ZDYNPROOVERLAP</PROGRAM>
      <SCREEN>2000</SCREEN>
      <LANGUAGE>E</LANGUAGE>
      <DESCRIPT>sdfds</DESCRIPT>
      <TYPE>N</TYPE>
      <NEXTSCREEN>2000</NEXTSCREEN>
      <LINES>027</LINES>
      <COLUMNS>121</COLUMNS>
     </HEADER>
     <CONTAINERS>
      <RPY_DYCATT>
       <TYPE>SCREEN</TYPE>
       <NAME>SCREEN</NAME>
      </RPY_DYCATT>
     </CONTAINERS>
     <FIELDS>
      <RPY_DYFATC>
       <CONT_TYPE>SCREEN</CONT_TYPE>
       <CONT_NAME>SCREEN</CONT_NAME>
       <TYPE>TEMPLATE</TYPE>
       <NAME>ZOVERLAP-FIELD1</NAME>
       <ROLLING>X</ROLLING>
       <LINE>003</LINE>
       <COLUMN>001</COLUMN>
       <LENGTH>012</LENGTH>
       <VISLENGTH>012</VISLENGTH>
       <HEIGHT>001</HEIGHT>
       <FORMAT>CHAR</FORMAT>
       <FROM_DICT>X</FROM_DICT>
       <INPUT_FLD>X</INPUT_FLD>
       <OUTPUT_FLD>X</OUTPUT_FLD>
      </RPY_DYFATC>
      <RPY_DYFATC>
       <CONT_TYPE>SCREEN</CONT_TYPE>
       <CONT_NAME>SCREEN</CONT_NAME>
       <TYPE>TEMPLATE</TYPE>
       <NAME>ZOVERLAP-FIELD2</NAME>
       <ROLLING>X</ROLLING>
       <LINE>003</LINE>
       <COLUMN>012</COLUMN>
       <LENGTH>012</LENGTH>
       <VISLENGTH>012</VISLENGTH>
       <HEIGHT>001</HEIGHT>
       <FORMAT>CHAR</FORMAT>
       <FROM_DICT>X</FROM_DICT>
       <INPUT_FLD>X</INPUT_FLD>
       <OUTPUT_FLD>X</OUTPUT_FLD>
      </RPY_DYFATC>
      <RPY_DYFATC>
       <CONT_TYPE>SCREEN</CONT_TYPE>
       <CONT_NAME>SCREEN</CONT_NAME>
       <TYPE>OKCODE</TYPE>
       <TEXT>____________________</TEXT>
       <LENGTH>020</LENGTH>
       <VISLENGTH>020</VISLENGTH>
       <HEIGHT>001</HEIGHT>
       <FORMAT>CHAR</FORMAT>
       <INPUT_FLD>X</INPUT_FLD>
      </RPY_DYFATC>
     </FIELDS>
    </item>
   </DYNPROS>
   <TPOOL>
    <item>
     <ID>R</ID>
     <ENTRY>test</ENTRY>
     <LENGTH>4</LENGTH>
    </item>
   </TPOOL>
  </asx:values>
 </asx:abap>
</abapGit>`},
      {filename: "zdynprooverlap.prog.screen_2000.abap", contents: `PROCESS BEFORE OUTPUT.
* MODULE STATUS_2000.
*
PROCESS AFTER INPUT.
* MODULE USER_COMMAND_2000.`},
      {filename: "zoverlap.tabl.xml", contents: `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DD02V>
    <TABNAME>ZOVERLAP</TABNAME>
    <DDLANGUAGE>E</DDLANGUAGE>
    <TABCLASS>INTTAB</TABCLASS>
    <DDTEXT>sdfsd</DDTEXT>
    <EXCLASS>1</EXCLASS>
   </DD02V>
   <DD03P_TABLE>
    <DD03P>
     <FIELDNAME>FIELD1</FIELDNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000024</INTLEN>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000012</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
    <DD03P>
     <FIELDNAME>FIELD2</FIELDNAME>
     <ADMINFIELD>0</ADMINFIELD>
     <INTTYPE>C</INTTYPE>
     <INTLEN>000024</INTLEN>
     <DATATYPE>CHAR</DATATYPE>
     <LENG>000012</LENG>
     <MASK>  CHAR</MASK>
    </DD03P>
   </DD03P_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`},
    ], "ZDYNPROOVERLAP");
    expect(issues[0]?.getMessage()).to.include("overlapping");
  });

  it("flow logic missing, no inline FLOW_LOGIC and no screen file", async () => {
    const issues = await findIssues(buildXML([{screen: "0100", flowLogic: false}]));
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal("Screen 0100, flow logic missing, expected file zfoobar.prog.screen_0100.abap");
    expect(issues[0].getFilename()).to.equal("zfoobar.prog.xml");
  });

  it("flow logic in screen file, ok", async () => {
    const issues = await findIssuesMulti([
      {filename: "zfoobar.prog.xml", contents: buildXML([{screen: "0100", flowLogic: false}])},
      {filename: "zfoobar.prog.screen_0100.abap", contents: SCREEN_FLOW},
    ], "ZFOOBAR");
    expect(issues.length).to.equal(0);
  });

  it("flow logic inline in XML, no screen file, ok", async () => {
    const issues = await findIssues(buildXML([{screen: "0100", flowLogic: true}]));
    expect(issues.length).to.equal(0);
  });

  it("empty FLOW_LOGIC counts as missing", async () => {
    const issues = await findIssues(buildXML([{screen: "0100", flowLogic: false}]).replace("</FIELDS>", "</FIELDS>\n     <FLOW_LOGIC/>"));
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("flow logic missing");
  });

  it("orphan screen file, plus flow logic missing", async () => {
    const issues = await findIssuesMulti([
      {filename: "zfoobar.prog.xml", contents: buildXML([{screen: "0100", flowLogic: false}])},
      {filename: "zfoobar.prog.screen_0200.abap", contents: SCREEN_FLOW},
    ], "ZFOOBAR");
    expect(issues.length).to.equal(2);
    const messages = issues.map(i => i.getMessage());
    expect(messages).to.include("Screen 0100, flow logic missing, expected file zfoobar.prog.screen_0100.abap");
    expect(messages).to.include("Screen file zfoobar.prog.screen_0200.abap has no dynpro 0200 in the XML");
    const orphan = issues.find(i => i.getMessage().startsWith("Screen file"));
    expect(orphan?.getFilename()).to.equal("zfoobar.prog.screen_0200.abap");
  });

  it("screen number without leading zeros in the XML", async () => {
    const issues = await findIssuesMulti([
      {filename: "zfoobar.prog.xml", contents: buildXML([{screen: "100", flowLogic: false}])},
      {filename: "zfoobar.prog.screen_0100.abap", contents: SCREEN_FLOW},
    ], "ZFOOBAR");
    expect(issues.length).to.equal(0);
  });

  it("screen file name matched case-insensitively", async () => {
    const issues = await findIssuesMulti([
      {filename: "zfoobar.prog.xml", contents: buildXML([{screen: "0100", flowLogic: false}])},
      {filename: "ZFOOBAR.PROG.SCREEN_0100.ABAP", contents: SCREEN_FLOW},
    ], "ZFOOBAR");
    expect(issues.length).to.equal(0);
  });

  it("function group, flow logic missing and orphan screen file", async () => {
    const xml = buildXML([{screen: "0100", flowLogic: false}])
      .replace("LCL_OBJECT_PROG", "LCL_OBJECT_FUGR")
      .replace(/<PROGDIR>[\s\S]*<\/PROGDIR>/, "<AREAT>test</AREAT>");
    const reg = new Registry().addFiles([
      new MemoryFile("zfoobar.fugr.xml", xml),
      new MemoryFile("zfoobar.fugr.screen_0200.abap", SCREEN_FLOW),
    ]);
    await reg.parseAsync();
    const issues = new DynproChecks().initialize(reg).run(reg.getObject("FUGR", "ZFOOBAR")!);
    const messages = issues.map(i => i.getMessage());
    expect(messages).to.have.members([
      "Screen 0100, flow logic missing, expected file zfoobar.fugr.screen_0100.abap",
      "Screen file zfoobar.fugr.screen_0200.abap has no dynpro 0200 in the XML",
    ]);
  });

  it("namespaced program, expected file name uses #", async () => {
    const xml = buildXML([{screen: "0100", flowLogic: false}]).replace(/ZFOOBAR/g, "/FOO/BAR");
    const issues = await findIssuesMulti([{filename: "#foo#bar.prog.xml", contents: xml}], "/FOO/BAR");
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal("Screen 0100, flow logic missing, expected file #foo#bar.prog.screen_0100.abap");
  });

});
