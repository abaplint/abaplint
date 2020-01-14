import {ApackDependencyProvider} from "../../src/cli/apack_dependency_provider";
import {expect} from "chai";

describe("apack dependency provider", () => {
  it("shouldn't return anything if the file is not found", () => {
    const apack = "";
    const deps = ApackDependencyProvider.fromManifest(apack);
    expect(deps.length).to.equal(0);
  });

  it("shouldn't return anything if the file contains no dependencies (omitted)", () => {
    const apack = `
    <?xml version="1.0" encoding="utf-8"?>
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
 <asx:values>
  <DATA>
   <GROUP_ID>sap.com</GROUP_ID>
   <ARTIFACT_ID>abap-platform-jak</ARTIFACT_ID>
   <VERSION>0.2</VERSION>
   <REPOSITORY_TYPE>abapGit</REPOSITORY_TYPE>
   <GIT_URL>https://github.com/SAP/abap-platform-jak.git</GIT_URL>
  </DATA>
 </asx:values>
</asx:abap>`;

    const deps = ApackDependencyProvider.fromManifest(apack);
    expect(deps.length).to.equal(0);
  });

  it("shouldn't return anything if the file contains no dependencies (empty)", () => {
    const apack = `
    <?xml version="1.0" encoding="utf-8"?>
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
 <asx:values>
  <DATA>
   <GROUP_ID>sap.com</GROUP_ID>
   <ARTIFACT_ID>abap-platform-jak</ARTIFACT_ID>
   <VERSION>0.2</VERSION>
   <REPOSITORY_TYPE>abapGit</REPOSITORY_TYPE>
   <GIT_URL>https://github.com/SAP/abap-platform-jak.git</GIT_URL>
   <DEPENDENCIES>
   </DEPENDENCIES>
  </DATA>
 </asx:values>
</asx:abap>`;

    const deps = ApackDependencyProvider.fromManifest(apack);
    expect(deps.length).to.equal(0);
  });

  it("should return the dependency if the file contains one", () => {
    const apack = `
    <?xml version="1.0" encoding="utf-8"?>
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
 <asx:values>
  <DATA>
   <GROUP_ID>sap.com</GROUP_ID>
   <ARTIFACT_ID>abap-platform-jak</ARTIFACT_ID>
   <VERSION>0.2</VERSION>
   <REPOSITORY_TYPE>abapGit</REPOSITORY_TYPE>
   <GIT_URL>https://github.com/SAP/abap-platform-jak.git</GIT_URL>
   <DEPENDENCIES>
    <item>
     <GROUP_ID>sap.com</GROUP_ID>
     <ARTIFACT_ID>abap-platform-yy</ARTIFACT_ID>
     <GIT_URL>https://github.com/SAP/abap-platform-yy.git</GIT_URL>
    </item>
   </DEPENDENCIES>
  </DATA>
 </asx:values>
</asx:abap>`;

    const deps = ApackDependencyProvider.fromManifest(apack);
    expect(deps.length).to.equal(1);
    expect(deps[0].url).to.equal("https://github.com/SAP/abap-platform-yy.git");
  });

  it("should return the dependencies if the file contains multiple", () => {
    const apack = `
    <?xml version="1.0" encoding="utf-8"?>
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
 <asx:values>
  <DATA>
   <GROUP_ID>sap.com</GROUP_ID>
   <ARTIFACT_ID>abap-platform-jak</ARTIFACT_ID>
   <VERSION>0.2</VERSION>
   <REPOSITORY_TYPE>abapGit</REPOSITORY_TYPE>
   <GIT_URL>https://github.com/SAP/abap-platform-jak.git</GIT_URL>
   <DEPENDENCIES>
    <item>
     <GROUP_ID>sap.com</GROUP_ID>
     <ARTIFACT_ID>abap-platform-yy</ARTIFACT_ID>
     <GIT_URL>https://github.com/SAP/abap-platform-yy.git</GIT_URL>
    </item>
    <item>
     <GROUP_ID>foo.bar</GROUP_ID>
     <ARTIFACT_ID>abap-turtle-graphics</ARTIFACT_ID>
     <GIT_URL>https://github.com/frehu/abap-turtle-graphics.git</GIT_URL>
    </item>
   </DEPENDENCIES>
  </DATA>
 </asx:values>
</asx:abap>`;

    const deps = ApackDependencyProvider.fromManifest(apack);
    expect(deps.length).to.equal(2);
    expect(deps[0].url).to.equal("https://github.com/SAP/abap-platform-yy.git");
    expect(deps[1].url).to.equal("https://github.com/frehu/abap-turtle-graphics.git");
  });
});