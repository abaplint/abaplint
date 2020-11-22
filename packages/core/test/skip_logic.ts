import {Registry} from "../src/registry";
import {expect} from "chai";
import {SkipLogic} from "../src/skip_logic";
import {MemoryFile} from "../src/files/memory_file";
import {Config} from "../src/config";

describe("Skip logic", () => {

  it("normal interface, no skip", async () => {
    const abap = `
INTERFACE zif_bar PUBLIC.
ENDINTERFACE.`;

    const file = new MemoryFile("zif_bar.ingf.abap", abap);
    const reg = new Registry().addFile(file);
    await reg.parseAsync();
    expect(reg.getObjectCount()).to.equal(1);
    expect(new SkipLogic(reg).skip(reg.getFirstObject()!)).to.equal(false);
  });

  it("isGeneratedGatewayClass, true", async () => {
    const abap = "class /ABC/CL_Z_ABAPGIT_TEST_MPC definition\n" +
      "  public\n" +
      "  inheriting from /IWBEP/CL_MGW_PUSH_ABS_MODEL\n" +
      "  create public .\n" +
      "public section.\n" +
      "protected section.\n" +
      "private section.\n" +
      "ENDCLASS.\n" +
      "CLASS /ABC/CL_Z_ABAPGIT_TEST_MPC IMPLEMENTATION.\n" +
      "ENDCLASS.";

    const file = new MemoryFile("#abc#cl_z_abapgit_test_mpc.clas.abap", abap);
    const reg = new Registry().addFile(file);
    await reg.parseAsync();
    expect(reg.getObjectCount()).to.equal(1);
    expect(new SkipLogic(reg).skip(reg.getFirstObject()!)).to.equal(true);
  });

  it("interface, isGeneratedProxy", async () => {
    const abap = "INTERFACE zif_foobar PUBLIC.\n" +
      "  METHODS method1 IMPORTING foo TYPE i.\n" +
      "ENDINTERFACE.";
    const reg = new Registry().addFile(new MemoryFile("zif_foobar.intf.abap", abap));

    const xml = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
      "<abapGit version=\"v1.0.0\" serializer=\"LCL_OBJECT_INTF\" serializer_version=\"v1.0.0\">\n" +
      "<asx:abap xmlns:asx=\"http://www.sap.com/abapxml\" version=\"1.0\">\n" +
      "<asx:values>\n" +
      "<VSEOINTERF>\n" +
      "<CLSNAME>ZIF_FOOBAR</CLSNAME>\n" +
      "<LANGU>E</LANGU>\n" +
      "<DESCRIPT>Proxy Interface (generated)</DESCRIPT>\n" +
      "<EXPOSURE>2</EXPOSURE>\n" +
      "<STATE>1</STATE>\n" +
      "<UNICODE>X</UNICODE>\n" +
      "<CLSPROXY>X</CLSPROXY>\n" +
      "</VSEOINTERF>\n" +
      "</asx:values>\n" +
      "</asx:abap>\n" +
      "</abapGit>";
    reg.addFile(new MemoryFile("zif_foobar.intf.xml", xml));

    await reg.parseAsync();
    expect(reg.getObjectCount()).to.equal(1);
    expect(new SkipLogic(reg).skip(reg.getFirstObject()!)).to.equal(true);
  });

  it("generated BOPF constants interface", async () => {
    const abap = `
INTERFACE zif_tt_i_projects_c PUBLIC.
  INTERFACES /bobf/if_lib_constants .
ENDINTERFACE.`;

    const file = new MemoryFile("zif_tt_i_projects_c.intf.abap", abap);
    const reg = new Registry().addFile(file);
    await reg.parseAsync();
    expect(reg.getObjectCount()).to.equal(1);
    expect(new SkipLogic(reg).skip(reg.getFirstObject()!)).to.equal(true);
  });

  it("generated DPC classes generated for a published CDS", async () => {
    const abap = `
    class ZCL_ZTT_C_PROJECTS definition public
      inheriting from CL_SADL_GTK_EXPOSURE_MPC
      final create public.
    ENDCLASS.

    CLASS ZCL_ZTT_C_PROJECTS IMPLEMENTATION.
    ENDCLASS.
    `;

    const file = new MemoryFile("zcl_ztt_c_projects.clas.abap", abap);
    const reg = new Registry().addFile(file);
    await reg.parseAsync();
    expect(reg.getObjectCount()).to.equal(1);
    expect(new SkipLogic(reg).skip(reg.getFirstObject()!)).to.equal(true);
  });

  it("skipIncludesWithoutMain, skip", async () => {
    const reg = new Registry();
    const config = reg.getConfig().get();
    config.global.skipIncludesWithoutMain = true;
    reg.setConfig(new Config(JSON.stringify(config)));

    const abap = `write bar.`;
    reg.addFile(new MemoryFile("zprog.prog.abap", abap));

    const xml = `
    <?xml version="1.0" encoding="utf-8"?>
    <abapGit version="v1.0.0" serializer="LCL_OBJECT_PROG" serializer_version="v1.0.0">
     <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
      <asx:values>
       <PROGDIR>
        <NAME>ZPROG</NAME>
        <SUBC>I</SUBC>
        <RLOAD>E</RLOAD>
        <UCCHECK>X</UCCHECK>
       </PROGDIR>
      </asx:values>
     </asx:abap>
    </abapGit>`;
    reg.addFile(new MemoryFile("zprog.prog.xml", xml));

    await reg.parseAsync();
    expect(reg.getObjectCount()).to.equal(1);
    expect(new SkipLogic(reg).skip(reg.getFirstObject()!)).to.equal(true);
  });

  it("skipIncludesWithoutMain, not an include, do not skip", async () => {
    const reg = new Registry();
    const config = reg.getConfig().get();
    config.global.skipIncludesWithoutMain = true;
    reg.setConfig(new Config(JSON.stringify(config)));

    const abap = `write bar.`;
    reg.addFile(new MemoryFile("zprog.prog.abap", abap));

    await reg.parseAsync();
    expect(reg.getObjectCount()).to.equal(1);
    expect(new SkipLogic(reg).skip(reg.getFirstObject()!)).to.equal(false);
  });
});