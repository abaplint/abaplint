import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {FunctionGroup} from "../../src/objects";
import {getABAPObjects} from "../../src/get_abap";

describe("Funcion Group, parse main xml", () => {
  const xml =
    "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
    "<abapGit version=\"v1.0.0\" serializer=\"LCL_OBJECT_FUGR\" serializer_version=\"v1.0.0\">\n" +
    " <asx:abap xmlns:asx=\"http://www.sap.com/abapxml\" version=\"1.0\">\n" +
    "  <asx:values>\n" +
    "   <AREAT>test</AREAT>\n" +
    "   <INCLUDES>\n" +
    "    <SOBJ_NAME>LZAGTEST_FUNCTION_GROUPTOP</SOBJ_NAME>\n" +
    "    <SOBJ_NAME>SAPLZAGTEST_FUNCTION_GROUP</SOBJ_NAME>\n" +
    "   </INCLUDES>\n" +
    "   <FUNCTIONS>\n" +
    "    <item>\n" +
    "     <FUNCNAME>ZAGTEST_FUNCTION_MODULE</FUNCNAME>\n" +
    "     <SHORT_TEXT>test</SHORT_TEXT>\n" +
    "     <IMPORT>\n" +
    "      <RSIMP>\n" +
    "       <PARAMETER>IMPORT_PARAMETER</PARAMETER>\n" +
    "       <REFERENCE>X</REFERENCE>\n" +
    "       <TYP>C</TYP>\n" +
    "      </RSIMP>\n" +
    "     </IMPORT>\n" +
    "     <DOCUMENTATION>\n" +
    "      <RSFDO>\n" +
    "       <PARAMETER>IMPORT_PARAMETER</PARAMETER>\n" +
    "       <KIND>P</KIND>\n" +
    "       <INDEX> 001</INDEX>\n" +
    "      </RSFDO>\n" +
    "     </DOCUMENTATION>\n" +
    "    </item>\n" +
    "   </FUNCTIONS>\n" +
    "  </asx:values>\n" +
    " </asx:abap>\n" +
    "</abapGit>";

  it("test, getModules", () => {
    const reg = new Registry().addFile(new MemoryFile("zagtest_function_group.fugr.xml", xml)).parse();
    const fugr = getABAPObjects(reg)[0] as FunctionGroup;

    const modules = fugr.getModules();
    expect(modules.length).to.equal(1);
    expect(modules[0].getName()).to.equal("ZAGTEST_FUNCTION_MODULE");
    expect(modules[0].getParameters().length).to.equal(1);
  });

  it("test, getIncludes", () => {
    const reg = new Registry().addFile(new MemoryFile("zagtest_function_group.fugr.xml", xml)).parse();
    const fugr = getABAPObjects(reg)[0] as FunctionGroup;

    const includes = fugr.getIncludes();
    expect(includes.length).to.equal(2);
    expect(includes).to.include("LZAGTEST_FUNCTION_GROUPTOP");
    expect(includes).to.include("SAPLZAGTEST_FUNCTION_GROUP");
  });

  it("test, getIncludeFiles", () => {
    const reg = new Registry();
    reg.addFile(new MemoryFile("zagtest_function_group.fugr.xml", xml));
    reg.addFile(new MemoryFile("zagtest_function_group.fugr.lzagtest_function_grouptop.abap", "WRITE hello."));
    reg.parse();
    const fugr = getABAPObjects(reg)[0] as FunctionGroup;

    const includes = fugr.getIncludeFiles();
    expect(includes.length).to.equal(1);
    const row = includes[0];
    expect(row.name).to.equal("LZAGTEST_FUNCTION_GROUPTOP");
  });

});