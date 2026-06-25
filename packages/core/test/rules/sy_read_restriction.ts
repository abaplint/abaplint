import {SyReadRestriction} from "../../src/rules";
import {Config, Issue, Registry, LanguageVersion} from "../../src";
import {MemoryFile} from "../../src/files/memory_file";
import {expect} from "chai";

async function findIssues(abap: string, languageVersion: LanguageVersion): Promise<readonly Issue[]> {
  const c = Config.getDefault().get();
  c.syntax.languageVersion = languageVersion;
  const reg = new Registry(new Config(JSON.stringify(c))).addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  const rule = new SyReadRestriction();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

// All 17 system fields allowed for reading in ABAP Cloud
const CLOUD_FIELDS = [
  "sy-batch", "sy-dbcnt", "sy-fdpos", "sy-index",
  "sy-langu", "sy-mandt", "sy-msgid", "sy-msgno", "sy-msgty",
  "sy-msgv1", "sy-msgv2", "sy-msgv3", "sy-msgv4",
  "sy-subrc", "sy-sysid", "sy-tabix", "sy-uname",
];

// 5 system fields allowed for reading in ABAP for Key Users
const KEYUSER_FIELDS = ["sy-dbcnt", "sy-fdpos", "sy-index", "sy-subrc", "sy-tabix"];

describe("sy_read_restriction", () => {

  describe("Cloud: all 17 allowed fields produce no issue", () => {
    for (const f of CLOUD_FIELDS) {
      it(`${f}`, async () => {
        const issues = await findIssues(`lv = ${f}.`, LanguageVersion.Cloud);
        expect(issues.length).to.equal(0);
      });
    }
  });

  describe("Cloud: non-allowed fields produce a warning", () => {
    for (const f of ["sy-linct", "sy-pagno", "sy-uzeit", "sy-datum", "sy-tcode"]) {
      it(`${f}`, async () => {
        const issues = await findIssues(`lv = ${f}.`, LanguageVersion.Cloud);
        expect(issues.length).to.equal(1);
      });
    }
  });

  describe("KeyUser: all 5 allowed fields produce no issue", () => {
    for (const f of KEYUSER_FIELDS) {
      it(`${f}`, async () => {
        const issues = await findIssues(`lv = ${f}.`, LanguageVersion.KeyUser);
        expect(issues.length).to.equal(0);
      });
    }
  });

  describe("KeyUser: the 12 Cloud-allowed fields outside KeyUser's 5 produce an issue", () => {
    for (const f of CLOUD_FIELDS.filter(x => !KEYUSER_FIELDS.includes(x))) {
      it(`${f}`, async () => {
        const issues = await findIssues(`lv = ${f}.`, LanguageVersion.KeyUser);
        expect(issues.length).to.equal(1);
      });
    }
  });

  describe("KeyUser: arbitrary other SY fields produce an issue", () => {
    for (const f of ["sy-linct", "sy-pagno", "sy-uzeit", "sy-datum", "sy-tcode"]) {
      it(`${f}`, async () => {
        const issues = await findIssues(`lv = ${f}.`, LanguageVersion.KeyUser);
        expect(issues.length).to.equal(1);
      });
    }
  });

  it("Normal: no restriction, sy-uname produces no issue", async () => {
    const issues = await findIssues("lv = sy-uname.", LanguageVersion.Normal);
    expect(issues.length).to.equal(0);
  });

  it("KeyUser: SELECT host variable @sy-subrc allowed, no issue", async () => {
    const issues = await findIssues(
      "SELECT COUNT(*) FROM ztab INTO @DATA(cnt) WHERE id = @sy-subrc.",
      LanguageVersion.KeyUser);
    expect(issues.length).to.equal(0);
  });

  it("KeyUser: SELECT host variable @sy-uname not allowed, 1 issue", async () => {
    const issues = await findIssues(
      "SELECT COUNT(*) FROM ztab INTO @DATA(cnt) WHERE name = @sy-uname.",
      LanguageVersion.KeyUser);
    expect(issues.length).to.equal(1);
  });

  it("KeyUser: writes to SY fields are not flagged here (sy_modification handles those)", async () => {
    // sy-subrc = 4. — this is a write, the sy_modification rule covers writes.
    const issues = await findIssues("sy-subrc = 4.", LanguageVersion.KeyUser);
    expect(issues.length).to.equal(0);
  });

});
