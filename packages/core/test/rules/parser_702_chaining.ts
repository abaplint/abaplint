import {Parser702Chaining} from "../../src/rules/parser_702_chaining";
import {Config} from "../../src/config";
import {Version} from "../../src/version";
import {Issue} from "../../src/issue";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";

async function findIssues(abap: string): Promise<readonly Issue[]> {
  const config = Config.getDefault(Version.v702);
  const reg = new Registry(config).addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  const rule = new Parser702Chaining();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: Parser702Chaining", () => {
  it("no issues", async () => {
    const issues = await findIssues("pasrser error.");
    expect(issues.length).to.equal(0);
  });

  it("no issues, method call1", async () => {
    const abap = "moo( 'sdf' ).";
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("issue1", async () => {
    const abap = "ii_event->query( )->to_abap( CHANGING cs_container = ls_db ).";
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("issue2", async () => {
    const abap = `zcl_abapgit_repo_srv=>get_instance( )->get_repo_from_package(
    EXPORTING
      iv_package = ls_popup-package
    IMPORTING
      eo_repo    = lo_repo
      ev_reason  = lv_reason ).`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("issue3, exporting with exceptions", async () => {
    const abap = `get_persistence( )->lock(
    EXPORTING
      p_objname_tr = objname
    EXCEPTIONS
      foreign_lock = 1
      OTHERS       = 3 ).
`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
  });

  it("no issues, method call2", async () => {
    const abap = `get_repo_from_package(
      EXPORTING
        iv_package = ls_popup-package
      IMPORTING
        eo_repo    = lo_repo
        ev_reason  = lv_reason ).`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  it("no issues, method call3", async () => {
    const abap = `lcl=>method( EXPORTING iv_value = lcl=>method( 42 ) ).`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(0);
  });

  describe("variable assignment through functional method", () => {
    it("no issues, method call with implicit importing parameter", async () => {
      const abap = "foo = lcl=>method( 42 ).";
      const issues = await findIssues(abap);
      expect(issues.length).to.equal(0);
    });
    it("no issues, method call with explicit importing parameter name without EXPORTING keyword", async () => {
      const abap = "foo = lcl=>method( iv_value = 42 ).";
      const issues = await findIssues(abap);
      expect(issues.length).to.equal(0);
    });
    it("issue, method call with explicit parameter name with EXPORTING keyword", async () => {
      const abap = "foo = lcl=>method( EXPORTING iv_value = 42 ).";
      const issues = await findIssues(abap);
      expect(issues.length).to.equal(1);
      expect(issues[0].getMessage()).to.equal("Unexpected word EXPORTING in functional method call");
    });
    it("issue, method call inside method parameter with explicit parameter name with EXPORTING keyword", async () => {
      const abap = "lcl=>method( EXPORTING iv_value = lcl=>method( EXPORTING iv_value = 42 ) ).";
      const issues = await findIssues(abap);
      expect(issues.length).to.equal(1);
      expect(issues[0].getMessage()).to.equal("Unexpected word EXPORTING in functional method call");
    });
  });
});