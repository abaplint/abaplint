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

  it.only("overlapping dynpro fields", async () => {
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

});
