import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {
  EnhancementSpot,
  FunctionGroup,
  MessageClass,
  Oauth2Profile,
  Program,
  ProxyObject,
  Table,
  TableType,
  View,
  WebMIME,
} from "../../src/objects";
import {ABAPObject} from "../../src/objects/_abap_object";
import {Registry} from "../../src/registry";
import {RemoveDescriptions} from "../../src/rules";

describe("malformed object XML", () => {
  const malformedInputs = [
    {description: "missing abapGit", xml: "<unexpected/>"},
    {description: "missing asx:abap", xml: "<abapGit><unexpected/></abapGit>"},
  ];
  const filenames = [
    "ztest.auth.xml",
    "ztest.clas.xml",
    "ztest.enho.xml",
    "ztest.enhs.xml",
    "ztest.fugr.xml",
    "ztest 9def6c78d0beedf8d5b04ba6c.sicf.xml",
    "ztest.intf.xml",
    "eztest.enqu.xml",
    "ztest.tobj.xml",
    "ztest.msag.xml",
    "02b8283ec9511ee5b5aaf11a0c28106a.smim.xml",
    "ztest.oa2p.xml",
    "ztest.prog.xml",
    "ztest.tabl.xml",
    "ztest.ttyp.xml",
    "ztest.view.xml",
    "ztest.w3mi.xml",
  ];

  for (const malformed of malformedInputs) {
    it(`does not throw with ${malformed.description}`, async () => {
      const reg = new Registry();
      for (const filename of filenames) {
        reg.addFile(new MemoryFile(filename, malformed.xml));
      }
      await reg.parseAsync();

      const objects = [...reg.getObjects()];
      expect(objects.length).to.equal(filenames.length);
      for (const object of objects) {
        object.getDescription();

        if (object instanceof EnhancementSpot) {
          expect(object.listBadiDefinitions()).to.deep.equal([]);
        } else if (object instanceof Oauth2Profile) {
          expect(object.listScopes()).to.deep.equal([]);
        } else if (object.getType() === "CLAS") {
          expect(new RemoveDescriptions().run(object)).to.deep.equal([]);
        }
      }
    });
  }

  const wrapValues = (contents: string): string =>
    `<abapGit><asx:abap><asx:values>${contents}</asx:values></asx:abap></abapGit>`;

  it("ignores malformed inner object metadata", () => {
    let reg = new Registry().addFile(new MemoryFile(
      "ztest.ttyp.xml",
      wrapValues("<unexpected/>"),
    ));
    expect((reg.getFirstObject() as TableType).getDescription()).to.equal(undefined);

    reg = new Registry().addFile(new MemoryFile(
      "ztest.prog.xml",
      wrapValues("<DYNPROS><item><FIELDS/></item></DYNPROS>"),
    ));
    expect((reg.getFirstObject() as Program).getDynpros()).to.deep.equal([]);

    reg = new Registry().addFile(new MemoryFile(
      "ztest.fugr.xml",
      wrapValues(`<INCLUDES><SOBJ_NAME><nested/></SOBJ_NAME></INCLUDES>
        <FUNCTIONS><item><SHORT_TEXT>missing name</SHORT_TEXT></item></FUNCTIONS>`),
    ));
    const functionGroup = reg.getFirstObject() as FunctionGroup;
    expect(functionGroup.getIncludes()).to.deep.equal([]);
    expect(functionGroup.getModules()).to.deep.equal([]);

    reg = new Registry().addFile(new MemoryFile(
      "ztest.w3mi.xml",
      wrapValues("<PARAMS><WWWPARAMS><VALUE>x</VALUE></WWWPARAMS></PARAMS>"),
    ));
    expect((reg.getFirstObject() as WebMIME).getParameters()).to.deep.equal({});

    reg = new Registry().addFile(new MemoryFile(
      "ztest.sprx.xml",
      wrapValues("<PROXY_DATA><item><R3_TYPE>INTF</R3_TYPE><R3_NAME><nested/></R3_NAME></item></PROXY_DATA>"),
    ));
    expect((reg.getFirstObject() as ProxyObject).generateABAPObjects()).to.deep.equal([]);
  });

  it("ignores malformed DDIC field metadata", () => {
    let reg = new Registry().addFile(new MemoryFile(
      "ztest.tabl.xml",
      wrapValues("<DD03P_TABLE><DD03P><DATATYPE>CHAR</DATATYPE></DD03P></DD03P_TABLE>"),
    ));
    expect(() => (reg.getFirstObject() as Table).parseType(reg)).to.not.throw();

    reg = new Registry().addFile(new MemoryFile(
      "ztest.view.xml",
      wrapValues("<DD27P_TABLE><DD27P><TABNAME>ZFOO</TABNAME></DD27P></DD27P_TABLE>"),
    ));
    expect(() => (reg.getFirstObject() as View).parseType(reg)).to.not.throw();
  });

  it("ignores structured values where text is expected", () => {
    let reg = new Registry().addFile(new MemoryFile(
      "ztest.msag.xml",
      wrapValues("<T100><T100><TEXT><nested/></TEXT></T100></T100>"),
    ));
    expect((reg.getFirstObject() as MessageClass).getMessages()[0].getMessage()).to.equal("");

    reg = new Registry().addFile(new MemoryFile(
      "ztest.prog.xml",
      wrapValues("<TPOOL><item><ID>S</ID><KEY><nested/></KEY></item></TPOOL>"),
    ));
    expect((reg.getFirstObject() as Program).getSelectionTexts()).to.deep.equal({});

    reg = new Registry().addFile(new MemoryFile(
      "ztest.clas.xml",
      wrapValues(`<TPOOL><item><ID><nested/></ID></item></TPOOL>
        <I18N_TPOOL><item><TEXTPOOL><item><ID>I</ID><ENTRY><nested/></ENTRY></item></TEXTPOOL></item></I18N_TPOOL>`),
    ));
    const abapObject = reg.getFirstObject() as ABAPObject;
    expect(abapObject.getTextElements()).to.deep.equal({});
    expect(abapObject.getTextElementsTranslations()[0].textElements.I.entry).to.equal("");
  });

  it("ignores XML parser errors outside parseRaw2", () => {
    let reg = new Registry()
      .addFile(new MemoryFile("ztest.fugr.xml", "<abapGit/>"))
      .addFile(new MemoryFile("ztest.fugr.saplztest.xml", "<"));
    expect((reg.getFirstObject() as FunctionGroup).getTextSymbols()).to.deep.equal({});

    reg = new Registry().addFile(new MemoryFile("ztest.intf.xml", "<"));
    const rule = new RemoveDescriptions().initialize(reg);
    expect(rule.run(reg.getFirstObject()!)).to.deep.equal([]);
  });
});
