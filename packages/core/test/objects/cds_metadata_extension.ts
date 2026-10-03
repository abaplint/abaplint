import {expect} from "chai";
import {Registry} from "../../src/registry";
import {MemoryFile} from "../../src/files/memory_file";
import {CDSMetadataExtension} from "../../src/objects";

describe("DDLX, CDS metadata extension", () => {

  it("parser error is reset when the file is fixed", async () => {
    const filename = "zacb_c_label_s.ddlx.asddlxs";
    const reg = new Registry().addFile(new MemoryFile(filename, "parser error"));
    await reg.parseAsync();
    const ddlx = reg.getFirstObject()! as CDSMetadataExtension;
    expect(ddlx.hasParserError()).to.equal(true);

    reg.updateFile(new MemoryFile(filename, `annotate view ZACB_C_Label_S with
{
  SingletonID;
}`));
    await reg.parseAsync();
    expect(ddlx.hasParserError()).to.not.equal(true);
  });

});
