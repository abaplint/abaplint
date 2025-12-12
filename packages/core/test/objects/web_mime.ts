import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {WebMIME} from "../../src/objects";

describe("W3MI parse", () => {

  it("test", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_W3MI" serializer_version="v2.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <NAME>ZABAPGIT_JS_COMMON</NAME>
   <TEXT>abapGit - Common Scripts (JS)</TEXT>
   <PARAMS>
    <WWWPARAMS>
     <NAME>fileextension</NAME>
     <VALUE>.js</VALUE>
    </WWWPARAMS>
    <WWWPARAMS>
     <NAME>filename</NAME>
     <VALUE>common.js</VALUE>
    </WWWPARAMS>
    <WWWPARAMS>
     <NAME>mimetype</NAME>
     <VALUE>text/javascript</VALUE>
    </WWWPARAMS>
   </PARAMS>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry().addFile(new MemoryFile("zabapgit_js_common.w3mi.xml", xml));
    await reg.parseAsync();
    const w3mi = reg.getFirstObject()! as WebMIME;
    expect(w3mi).to.not.equal(undefined);
    expect(w3mi.getDescription()).to.equal("abapGit - Common Scripts (JS)");
    expect(w3mi.getParameter("fileextension")).to.equal(".js");
    expect(w3mi.getParameter("filename")).to.equal("common.js");
    expect(w3mi.getParameter("mimetype")).to.equal("text/javascript");
  });

  it("parse without PARAMS", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_W3MI" serializer_version="v2.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <NAME>ZTEST</NAME>
   <TEXT>Test description</TEXT>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry().addFile(new MemoryFile("ztest.w3mi.xml", xml));
    await reg.parseAsync();
    const w3mi = reg.getFirstObject()! as WebMIME;
    expect(w3mi).to.not.equal(undefined);
    expect(w3mi.getDescription()).to.equal("Test description");
    expect(w3mi.getParameter("fileextension")).to.equal(undefined);
    expect(w3mi.getParameter("filename")).to.equal(undefined);
    expect(w3mi.getParameter("mimetype")).to.equal(undefined);
  });

  it("parse with single PARAM", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_W3MI" serializer_version="v2.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <NAME>ZTEST</NAME>
   <TEXT>Test</TEXT>
   <PARAMS>
    <WWWPARAMS>
     <NAME>mimetype</NAME>
     <VALUE>image/png</VALUE>
    </WWWPARAMS>
   </PARAMS>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry().addFile(new MemoryFile("ztest.w3mi.xml", xml));
    await reg.parseAsync();
    const w3mi = reg.getFirstObject()! as WebMIME;
    expect(w3mi).to.not.equal(undefined);
    expect(w3mi.getParameter("mimetype")).to.equal("image/png");
    expect(w3mi.getParameter("fileextension")).to.equal(undefined);
    expect(w3mi.getParameter("filename")).to.equal(undefined);
  });

});