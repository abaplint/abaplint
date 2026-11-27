import {MemoryFile} from "../../../src/files/memory_file";
import {expect} from "chai";
import {Renamer} from "../../../src/objects/rename/renamer";
import {Registry} from "../../../src/registry";
import {IRegistry} from "../../../src/_iregistry";

// a HTTP service of ABAP Cloud, as serialized by abapGit: the service with its handler class, the
// inbound service that publishes it and the IAM app of the inbound service
describe("Rename HTTP, SCO2, SIA6", () => {

  const wrap = (serializer: string, values: string) => `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_${serializer}" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
${values}
  </asx:values>
 </asx:abap>
</abapGit>`;

  const http = wrap("HTTP", `   <HTTPID>ZFOO_SERVICE</HTTPID>
   <HTTPTEXT>
    <ID>ZFOO_SERVICE</ID>
    <VERSION>I</VERSION>
    <LANG>E</LANG>
    <SHORTTEXT>http service</SHORTTEXT>
   </HTTPTEXT>
   <HTTPHDL>
    <UCONSERVHANDLER>
     <ID>ZFOO_SERVICE</ID>
     <VERSION>I</VERSION>
     <SERVICEORDER>01</SERVICEORDER>
     <SERVICEHANDLER>ZCL_FOO_HANDLER</SERVICEHANDLER>
    </UCONSERVHANDLER>
   </HTTPHDL>`);

  const sco2 = wrap("SCO2", `   <SCO2>
    <IBS_ID>ZFOO_SERVICE_HTTP</IBS_ID>
    <IBS_TYPE>HTTP</IBS_TYPE>
    <HTTP_SERVICE_ID>ZFOO_SERVICE</HTTP_SERVICE_ID>
    <REL_FOR_CUST_CSCN>X</REL_FOR_CUST_CSCN>
    <ABAP_LANGUAGE_VERSION>5</ABAP_LANGUAGE_VERSION>
    <NAME>ZFOO_SERVICE_HTTP</NAME>
    <DESCRIPTION> HTTP Service ZFOO_SERVICE</DESCRIPTION>
    <ABAP_LANGU_VERSION>5</ABAP_LANGU_VERSION>
   </SCO2>`);

  const sia6 = wrap("SIA6", `   <SIA6>
    <MAIN_OBJECT>
     <NAME>ZFOO_SERVICE_HTTP_IBS</NAME>
     <TYPE>SIA6</TYPE>
     <MASTER_LANGUAGE>EN</MASTER_LANGUAGE>
     <ABAP_LANGU_VERSION>5</ABAP_LANGU_VERSION>
    </MAIN_OBJECT>
    <APP_ID>ZFOO_SERVICE_HTTP_IBS</APP_ID>
    <APP_TYPE>IBS</APP_TYPE>
    <ABAP_LANGUAGE_VERSION>5</ABAP_LANGUAGE_VERSION>
    <SECONDARY_ID>ZFOO_SERVICE_HTTP</SECONDARY_ID>
    <PUBLISH_STATUS>u</PUBLISH_STATUS>
   </SIA6>`);

  const sia7 = wrap("SIA7", `   <SIA7>
    <METADATA>
     <NAME>ZFOO_BC_0001</NAME>
     <ABAP_LANGU_VERSION>5</ABAP_LANGU_VERSION>
    </METADATA>
    <CONTENT>
     <BU_CATALOG_APP_ID>ZFOO_BC_0001</BU_CATALOG_APP_ID>
     <BU_CATALOG_ID>ZFOO_BC</BU_CATALOG_ID>
     <APP_ID>ZFOO_SERVICE_HTTP_IBS</APP_ID>
     <ABAP_LANGUAGE_VERSION>5</ABAP_LANGUAGE_VERSION>
    </CONTENT>
   </SIA7>`);

  const clas = `CLASS zcl_foo_handler DEFINITION PUBLIC FINAL CREATE PUBLIC.
ENDCLASS.
CLASS zcl_foo_handler IMPLEMENTATION.
ENDCLASS.`;

  function build(): IRegistry {
    return new Registry().addFiles([
      new MemoryFile("src/zfoo_service.http.xml", http),
      new MemoryFile("src/zfoo_service_http.sco2.xml", sco2),
      new MemoryFile("src/zfoo_service_http_ibs.sia6.xml", sia6),
      new MemoryFile("src/zfoo_bc_0001.sia7.xml", sia7),
      new MemoryFile("src/zcl_foo_handler.clas.abap", clas),
    ]).parse();
  }

  function raw(reg: IRegistry, filename: string): string {
    const file = reg.getFileByName(filename);
    expect(file, filename).to.not.equal(undefined);
    return file!.getRaw();
  }

  it("HTTP, the service and the inbound service that publishes it", () => {
    const reg = build();
    new Renamer(reg).rename("HTTP", "zfoo_service", "zbar_service");

    const service = raw(reg, "src/zbar_service.http.xml");
    expect(service).to.include("<HTTPID>ZBAR_SERVICE</HTTPID>");
    expect(service).to.not.include("ZFOO_SERVICE");
    expect(service).to.include("<SERVICEHANDLER>ZCL_FOO_HANDLER</SERVICEHANDLER>");

    // the reference follows, the inbound service keeps its own name
    const inbound = raw(reg, "src/zfoo_service_http.sco2.xml");
    expect(inbound).to.include("<HTTP_SERVICE_ID>ZBAR_SERVICE</HTTP_SERVICE_ID>");
    expect(inbound).to.include("<IBS_ID>ZFOO_SERVICE_HTTP</IBS_ID>");
  });

  it("SCO2, the inbound service and its IAM app", () => {
    const reg = build();
    new Renamer(reg).rename("SCO2", "zfoo_service_http", "zbar_service_http");

    const inbound = raw(reg, "src/zbar_service_http.sco2.xml");
    expect(inbound).to.include("<IBS_ID>ZBAR_SERVICE_HTTP</IBS_ID>");
    expect(inbound).to.include("<NAME>ZBAR_SERVICE_HTTP</NAME>");
    expect(inbound).to.include("<HTTP_SERVICE_ID>ZFOO_SERVICE</HTTP_SERVICE_ID>");

    const app = raw(reg, "src/zfoo_service_http_ibs.sia6.xml");
    expect(app).to.include("<SECONDARY_ID>ZBAR_SERVICE_HTTP</SECONDARY_ID>");
    expect(app).to.include("<APP_ID>ZFOO_SERVICE_HTTP_IBS</APP_ID>");
  });

  it("SIA6, the IAM app and its assignment to a business catalog", () => {
    const reg = build();
    new Renamer(reg).rename("SIA6", "zfoo_service_http_ibs", "zbar_service_http_ibs");

    const app = raw(reg, "src/zbar_service_http_ibs.sia6.xml");
    expect(app).to.include("<NAME>ZBAR_SERVICE_HTTP_IBS</NAME>");
    expect(app).to.include("<APP_ID>ZBAR_SERVICE_HTTP_IBS</APP_ID>");
    expect(app).to.include("<SECONDARY_ID>ZFOO_SERVICE_HTTP</SECONDARY_ID>");

    const assignment = raw(reg, "src/zfoo_bc_0001.sia7.xml");
    expect(assignment).to.include("<APP_ID>ZBAR_SERVICE_HTTP_IBS</APP_ID>");
    expect(assignment).to.include("<NAME>ZFOO_BC_0001</NAME>");
  });

  it("CLAS, the handler class of the service", () => {
    const reg = build();
    new Renamer(reg).rename("CLAS", "zcl_foo_handler", "zcl_bar_handler");

    expect(raw(reg, "src/zfoo_service.http.xml")).to.include("<SERVICEHANDLER>ZCL_BAR_HANDLER</SERVICEHANDLER>");
    expect(raw(reg, "src/zcl_bar_handler.clas.abap")).to.include("CLASS zcl_bar_handler DEFINITION");
  });

  it("all of them, nothing is left of the old name", () => {
    const reg = build();
    const renamer = new Renamer(reg);
    renamer.rename("CLAS", "zcl_foo_handler", "zcl_bar_handler");
    renamer.rename("HTTP", "zfoo_service", "zbar_service");
    renamer.rename("SCO2", "zfoo_service_http", "zbar_service_http");
    renamer.rename("SIA6", "zfoo_service_http_ibs", "zbar_service_http_ibs");

    expect(reg.getObjectCount().normal).to.equal(5);
    for (const name of ["src/zbar_service.http.xml", "src/zbar_service_http.sco2.xml", "src/zbar_service_http_ibs.sia6.xml"]) {
      // the description is free text and keeps the old name
      const content = raw(reg, name).replace(/<DESCRIPTION>.*<\/DESCRIPTION>/, "");
      expect(content.toUpperCase(), name).to.not.include("FOO");
    }
  });

});
