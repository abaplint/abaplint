import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {ReleaseIdoc} from "../../src/rules";

function findIssues(contents: string, filename: string) {
  const reg = new Registry().addFile(new MemoryFile(filename, contents)).parse();
  const rule = new ReleaseIdoc();
  return rule.run(reg.getObjects()[0]);
}

describe("Rule: release_idoc", function() {
  it("TABL, error", function () {

    const xml = `<?xml version="1.0" encoding="utf-8"?>
    <abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
     <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
      <asx:values>
        <SEGMENT_DEFINITION>
          <item>
            <SEGMENTDEFINITION>
            </SEGMENTDEFINITION>
          </item>
        </SEGMENT_DEFINITION>
      </asx:values>
     </asx:abap>
    </abapGit>`;

    const issues = findIssues(xml, "ztabl.tabl.xml");
    expect(issues.length).to.equal(1);
  });

  it("TABL, no error", function () {

    const xml = `<?xml version="1.0" encoding="utf-8"?>
    <abapGit version="v1.0.0" serializer="LCL_OBJECT_TABL" serializer_version="v1.0.0">
     <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
      <asx:values>
        <SEGMENT_DEFINITION>
          <item>
            <SEGMENTDEFINITION>
            <CLOSED>X</CLOSED>
            </SEGMENTDEFINITION>
          </item>
        </SEGMENT_DEFINITION>
      </asx:values>
     </asx:abap>
    </abapGit>`;

    const issues = findIssues(xml, "ztabl.tabl.xml");
    expect(issues.length).to.equal(0);
  });

  it("IDoc, error", function () {

    const xml = `<?xml version="1.0" encoding="utf-8"?>
    <abapGit version="v1.0.0" serializer="LCL_OBJECT_IDOC" serializer_version="v1.0.0">
     <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
      <asx:values>
       <IDOC>
        <ATTRIBUTES>
         <DESCRP>description</DESCRP>
         </ATTRIBUTES>
       </IDOC>
      </asx:values>
     </asx:abap>
    </abapGit>`;

    const issues = findIssues(xml, "zidoc.idoc.xml");
    expect(issues.length).to.equal(1);
  });

  it("IDoc, no error", function () {

    const xml = `<?xml version="1.0" encoding="utf-8"?>
    <abapGit version="v1.0.0" serializer="LCL_OBJECT_IDOC" serializer_version="v1.0.0">
     <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
      <asx:values>
       <IDOC>
        <ATTRIBUTES>
         <DESCRP>description</DESCRP>
         <CLOSED>X</CLOSED>
        </ATTRIBUTES>
       </IDOC>
      </asx:values>
     </asx:abap>
    </abapGit>`;

    const issues = findIssues(xml, "zidoc.idoc.xml");
    expect(issues.length).to.equal(0);
  });

});