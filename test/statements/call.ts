import "../../typings/index.d.ts";
import File from "../../src/file";
import Runner from "../../src/runner";
import * as chai from "chai";
import * as Statements from "../../src/statements/";

let expect = chai.expect;

describe("CALL statement type", () => {
  let tests = [
    "cl_gui_cfw=>flush( ).",
    "cl_gui_cfw=>flush( ) .",
    "lif_object~delete( ).",
    "gui( )->go_home( ).",
    "<ls_late>-obj->deserialize( iv_package = <ls_late>-package ).",
    "CALL METHOD ('CL_OO_FACTORY')=>('CREATE_INSTANCE').",
    "ro_html->add( |var\"\n| ).",
    "CALL METHOD lo_instance->('CREATE_CLIF_SOURCE').",
    "ii_client->request->set_header_field( name  = '~request_method' value = 'POST' ).",
    "mo_files->add_string( iv_extra  = 'source' iv_ext    = 'xml' ).",
    "mo_files->add_string( iv_extra  = 'source' ) ##NO_TEXT.",
    ];

  tests.forEach((test) => {
    let file = new File("temp.abap", test);
    Runner.run([file]);
    let slist = file.getStatements();

    it("\"" + test + "\" should be CALL", () => {
      let compare = slist[0] instanceof Statements.Call;
      expect(compare).to.equals(true);
    });
  });
});
