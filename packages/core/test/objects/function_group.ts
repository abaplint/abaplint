import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {FunctionGroup} from "../../src/objects";
import {getABAPObjects} from "../get_abap";

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

  const xmlSingleInclude =
    "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
    "<abapGit version=\"v1.0.0\" serializer=\"LCL_OBJECT_FUGR\" serializer_version=\"v1.0.0\">\n" +
    " <asx:abap xmlns:asx=\"http://www.sap.com/abapxml\" version=\"1.0\">\n" +
    "  <asx:values>\n" +
    "   <AREAT>test</AREAT>\n" +
    "   <INCLUDES>\n" +
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

  it("test, getModules", async () => {
    const reg = new Registry().addFile(new MemoryFile("zagtest_function_group.fugr.xml", xml));
    await reg.parseAsync();
    const fugr = getABAPObjects(reg)[0] as FunctionGroup;

    const modules = fugr.getModules();
    expect(modules.length).to.equal(1);
    expect(modules[0].getName()).to.equal("ZAGTEST_FUNCTION_MODULE");
    expect(modules[0].getParameters().length).to.equal(1);

    expect(fugr.getDescription()).to.equal("test");
  });

  it("test, getExceptions", async () => {
    const withExceptions = xml.replace("     <DOCUMENTATION>\n",
                                       "     <EXCEPTION>\n" +
                                       "      <RSEXC>\n" +
                                       "       <EXCEPTION>NOT_FOUND</EXCEPTION>\n" +
                                       "      </RSEXC>\n" +
                                       "      <RSEXC>\n" +
                                       "       <EXCEPTION>INVALID</EXCEPTION>\n" +
                                       "      </RSEXC>\n" +
                                       "     </EXCEPTION>\n" +
                                       "     <DOCUMENTATION>\n");
    const reg = new Registry().addFile(new MemoryFile("zagtest_function_group.fugr.xml", withExceptions));
    await reg.parseAsync();
    const fugr = getABAPObjects(reg)[0] as FunctionGroup;

    const module = fugr.getModules()[0];
    expect(module.getExceptions()).to.deep.equal(["NOT_FOUND", "INVALID"]);
    expect(module.isClassBasedExceptions()).to.equal(false);
  });

  it("test, getExceptions, class-based", async () => {
    const withExceptions = xml.replace("     <DOCUMENTATION>\n",
                                       "     <EXCEPTION_CLASSES>X</EXCEPTION_CLASSES>\n" +
                                       "     <EXCEPTION>\n" +
                                       "      <RSEXC>\n" +
                                       "       <EXCEPTION>ZCX_ERROR</EXCEPTION>\n" +
                                       "      </RSEXC>\n" +
                                       "     </EXCEPTION>\n" +
                                       "     <DOCUMENTATION>\n");
    const reg = new Registry().addFile(new MemoryFile("zagtest_function_group.fugr.xml", withExceptions));
    await reg.parseAsync();
    const fugr = getABAPObjects(reg)[0] as FunctionGroup;

    const module = fugr.getModules()[0];
    expect(module.getExceptions()).to.deep.equal(["ZCX_ERROR"]);
    expect(module.isClassBasedExceptions()).to.equal(true);
  });

  it("test, getModules, no exceptions", async () => {
    const reg = new Registry().addFile(new MemoryFile("zagtest_function_group.fugr.xml", xml));
    await reg.parseAsync();
    const fugr = getABAPObjects(reg)[0] as FunctionGroup;

    expect(fugr.getModules()[0].getExceptions()).to.deep.equal([]);
  });

  it("test, getIncludes", async () => {
    const reg = new Registry().addFile(new MemoryFile("zagtest_function_group.fugr.xml", xml));
    await reg.parseAsync();
    const fugr = getABAPObjects(reg)[0] as FunctionGroup;

    const includes = fugr.getIncludes();
    expect(includes.length).to.equal(2);
    expect(includes).to.include("LZAGTEST_FUNCTION_GROUPTOP");
    expect(includes).to.include("SAPLZAGTEST_FUNCTION_GROUP");
  });

  it("test, getIncludes, single include", async () => {
    const reg = new Registry().addFile(new MemoryFile("zagtest_function_group.fugr.xml", xmlSingleInclude));
    await reg.parseAsync();
    const fugr = getABAPObjects(reg)[0] as FunctionGroup;

    const includes = fugr.getIncludes();
    expect(includes.length).to.equal(1);
    expect(includes).to.include("SAPLZAGTEST_FUNCTION_GROUP");
  });

  it("test, getIncludeFiles", async () => {
    const reg = new Registry();
    reg.addFile(new MemoryFile("zagtest_function_group.fugr.xml", xml));
    reg.addFile(new MemoryFile("zagtest_function_group.fugr.lzagtest_function_grouptop.abap", "WRITE hello."));
    await reg.parseAsync();
    const fugr = getABAPObjects(reg)[0] as FunctionGroup;

    const includes = fugr.getIncludeFiles();
    expect(includes.length).to.equal(1);
    const row = includes[0];
    expect(row.name).to.equal("LZAGTEST_FUNCTION_GROUPTOP");
  });

  it("test, findTextFile, Z case", async () => {
    const textXml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_FUGR" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <TPOOL>
    <item>
     <ID>I</ID>
     <KEY>001</KEY>
     <ENTRY>Hello</ENTRY>
    </item>
   </TPOOL>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry();
    reg.addFile(new MemoryFile("zagtest_function_group.fugr.xml", xml));
    reg.addFile(new MemoryFile("zagtest_function_group.fugr.saplzagtest_function_group.xml", textXml));
    await reg.parseAsync();
    const fugr = getABAPObjects(reg)[0] as FunctionGroup;

    const texts = fugr.getTextSymbols();
    expect(Object.keys(texts).length).to.be.greaterThan(0);
  });

  it("test, findTextFile, namespace case", async () => {
    const nsXml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_FUGR" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <AREAT>fugr</AREAT>
   <INCLUDES>
    <SOBJ_NAME>/FOO/LBARTOP</SOBJ_NAME>
   </INCLUDES>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const textXml = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_FUGR" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <TPOOL>
    <item>
     <ID>I</ID>
     <KEY>001</KEY>
     <ENTRY>Hello</ENTRY>
    </item>
   </TPOOL>
  </asx:values>
 </asx:abap>
</abapGit>`;

    const reg = new Registry();
    reg.addFile(new MemoryFile("#foo#bar.fugr.xml", nsXml));
    reg.addFile(new MemoryFile("#foo#bar.fugr.#foo#saplbar.xml", textXml));
    await reg.parseAsync();
    const fugr = getABAPObjects(reg)[0] as FunctionGroup;

    const texts = fugr.getTextSymbols();
    expect(Object.keys(texts).length).to.be.greaterThan(0);
  });

  it("test, getSequencedFiles with namespace", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
    <abapGit version="v1.0.0" serializer="LCL_OBJECT_FUGR" serializer_version="v1.0.0">
     <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
      <asx:values>
       <AREAT>fugr</AREAT>
       <INCLUDES>
        <SOBJ_NAME>/FOO/LBARTOP</SOBJ_NAME>
        <SOBJ_NAME>/FOO/SAPLBAR</SOBJ_NAME>
       </INCLUDES>
       <FUNCTIONS>
        <item>
         <FUNCNAME>/FOO/FMNAME</FUNCNAME>
         <SHORT_TEXT>hello</SHORT_TEXT>
        </item>
       </FUNCTIONS>
      </asx:values>
     </asx:abap>
    </abapGit>`;

    const reg = new Registry();
    reg.addFile(new MemoryFile("#foo#bar.fugr.xml", xml));
    reg.addFile(new MemoryFile("#foo#bar.fugr.#foo#fmname.abap", `FUNCTION /foo/fmname.
  WRITE 'hello'.
ENDFUNCTION.`));
    reg.addFile(new MemoryFile("#foo#bar.fugr.#foo#saplbar.abap", `INCLUDE /foo/lbartop.
INCLUDE /foo/lbaruxx.`));

    await reg.parseAsync();
    const fugr = getABAPObjects(reg)[0] as FunctionGroup;
    const sequenced = fugr.getSequencedFiles();
    expect(sequenced.length).to.equal(2);
  });

});