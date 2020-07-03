import {MemoryFile} from "../src/files";
import {Registry} from "../src/registry";
import {expect} from "chai";
import {SkipLogic} from "../src/skip_logic";
import {Class} from "../src/objects";

describe("Skip logic", () => {

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
    expect(reg.getObjects().length).to.equal(1);
    const skip = new SkipLogic(reg);
    expect(skip.isGeneratedGatewayClass(reg.getObjects()[0] as Class)).to.equal(true);
  });
});
