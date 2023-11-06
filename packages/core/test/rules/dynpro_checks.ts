/* eslint-disable max-len */
import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {DynproChecks} from "../../src/rules";
import {Issue} from "../../src/issue";

async function findIssues(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zfoobar.prog.xml", abap));
  await reg.parseAsync();
  const rule = new DynproChecks();
  return rule.initialize(reg).run(reg.getFirstObject()!);
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

});
