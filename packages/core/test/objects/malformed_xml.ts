import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {EnhancementSpot, Oauth2Profile} from "../../src/objects";
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
});
