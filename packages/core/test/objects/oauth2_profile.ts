import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {Oauth2Profile} from "../../src/objects";

describe("OA2P, parse XML", () => {
  it("test", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_OA2P" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <PROFILE>
    <HEADER>
     <PROFILE>ZOAUTH_CLIENT_PROFILE</PROFILE>
     <TYPE>DEFAULT</TYPE>
    </HEADER>
    <T_SCOPES>
     <OA2P_SCOPES>
      <PROFILE>ZOAUTH_CLIENT_PROFILE</PROFILE>
      <SCOPENO>1</SCOPENO>
      <SCOPE>scopesomething1</SCOPE>
     </OA2P_SCOPES>
     <OA2P_SCOPES>
      <PROFILE>ZOAUTH_CLIENT_PROFILE</PROFILE>
      <SCOPENO>2</SCOPENO>
      <SCOPE>scopesomething2</SCOPE>
     </OA2P_SCOPES>
    </T_SCOPES>
    <T_SCOPES_UI>
     <OA2P_SCREENDATA_SCOPES_MARK>
      <SCOPE>scopesomething1</SCOPE>
     </OA2P_SCREENDATA_SCOPES_MARK>
     <OA2P_SCREENDATA_SCOPES_MARK>
      <SCOPE>scopesomething2</SCOPE>
     </OA2P_SCREENDATA_SCOPES_MARK>
    </T_SCOPES_UI>
   </PROFILE>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry().addFile(new MemoryFile("zoauth_client_profile.oa2p.xml", xml));
    await reg.parseAsync();
    const sicf = reg.getFirstObject()! as Oauth2Profile;

    const scopes = sicf.listScopes();
    expect(scopes).to.not.equal(undefined);
    expect(scopes!.length).to.equal(2);
    expect(scopes![0]).to.equal("scopesomething1");
    expect(scopes![1]).to.equal("scopesomething2");
  });

});