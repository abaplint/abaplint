import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {ICFService} from "../../src/objects";

describe("ICF service, parse XML", () => {
  it("test", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_SICF" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <URL>/sap/zabapgitserver/</URL>
   <ICFSERVICE>
    <ICF_NAME>ZABAPGITSERVER</ICF_NAME>
    <FALLTHRU>X</FALLTHRU>
    <ORIG_NAME>zabapgitserver</ORIG_NAME>
   </ICFSERVICE>
   <ICFDOCU>
    <ICF_NAME>ZABAPGITSERVER</ICF_NAME>
    <ICF_LANGU>E</ICF_LANGU>
    <ICF_DOCU>abapGitServer</ICF_DOCU>
   </ICFDOCU>
   <ICFHANDLER_TABLE>
    <ICFHANDLER>
     <ICF_NAME>ZABAPGITSERVER</ICF_NAME>
     <ICFORDER>01</ICFORDER>
     <ICFTYP>A</ICFTYP>
     <ICFHANDLER>ZCL_AGS_SICF</ICFHANDLER>
    </ICFHANDLER>
   </ICFHANDLER_TABLE>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry().addFile(new MemoryFile("zabapgitserver 9def6c78d0beedf8d5b04ba6c.sicf.xml", xml));
    await reg.parseAsync();
    const sicf = reg.getObjects()[0] as ICFService;

    const handlers = sicf.getHandlerList();
    expect(handlers).to.not.equal(undefined);
    expect(handlers!.length).to.equal(1);
    expect(handlers![0]).to.equal("ZCL_AGS_SICF");
  });

});