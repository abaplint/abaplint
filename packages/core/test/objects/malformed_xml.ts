import {expect} from "chai";
import {MemoryFile} from "../../src/files/memory_file";
import {EnhancementSpot, Oauth2Profile} from "../../src/objects";
import {Registry} from "../../src/registry";
import {RemoveDescriptions} from "../../src/rules";

describe("malformed object XML", () => {
  const malformed = "<abapGit><unexpected/></abapGit>";
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

  for (const filename of filenames) {
    it(`does not throw for ${filename}`, async () => {
      const reg = new Registry().addFile(new MemoryFile(filename, malformed));
      await reg.parseAsync();

      const object = reg.getFirstObject();
      expect(object).to.not.equal(undefined);
      object!.getDescription();

      if (object instanceof EnhancementSpot) {
        expect(object.listBadiDefinitions()).to.deep.equal([]);
      } else if (object instanceof Oauth2Profile) {
        expect(object.listScopes()).to.deep.equal([]);
      }
    });
  }

  it("does not throw in remove_descriptions", async () => {
    const reg = new Registry().addFile(new MemoryFile("ztest.clas.xml", malformed));
    await reg.parseAsync();

    const issues = new RemoveDescriptions().run(reg.getFirstObject()!);
    expect(issues).to.deep.equal([]);
  });
});
