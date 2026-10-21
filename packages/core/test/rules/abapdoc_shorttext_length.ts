import {expect} from "chai";
import {Issue, MemoryFile, Registry} from "../../src";
import {AbapdocShorttextLength} from "../../src/rules";
import {testRule} from "./_utils";

const text60 = "a".repeat(60);
const text61 = "a".repeat(61);

function definition(abap: string): string {
  return `CLASS lcl_foo DEFINITION.\n  PUBLIC SECTION.\n${abap}\nENDCLASS.\nCLASS lcl_foo IMPLEMENTATION.\nENDCLASS.`;
}

testRule([
  {abap: definition(`"! <p class="shorttext synchronized" lang="en">${text61}</p>\nDATA mv_foo TYPE string.`), cnt: 1},
  {abap: definition(`"! <p class="shorttext synchronized">${text61}</p>\nDATA mv_foo TYPE string.`), cnt: 1},
  {abap: definition(`"! <p class="shorttext">${text61}</p>\nDATA mv_foo TYPE string.`), cnt: 1},
  {abap: definition(`"! <P CLASS="shorttext synchronized">${text61}</P>\nDATA mv_foo TYPE string.`), cnt: 1},
  {abap: definition(`"! <p class="shorttext synchronized">${"a".repeat(40)}\n"! ${"b".repeat(20)}</p>\nDATA mv_foo TYPE string.`), cnt: 1},
  {abap: `"! <p class="shorttext synchronized">${text61}</p>\nCLASS lcl_foo DEFINITION.\nENDCLASS.\n`
    + `CLASS lcl_foo IMPLEMENTATION.\nENDCLASS.`, cnt: 1},
  {abap: `INTERFACE lif_foo.\n  "! <p class="shorttext synchronized">${text61}</p>\n  METHODS foo.\nENDINTERFACE.`, cnt: 1},
  {abap: definition(`"! <p class="shorttext synchronized">${text60}</p>\nDATA mv_foo TYPE string.`), cnt: 0},
  {abap: definition(`"! <p class="shorttext synchronized">  ${text60}  </p>\nDATA mv_foo TYPE string.`), cnt: 0},
  {abap: definition(`"! <p class="shorttext synchronized">${"a".repeat(30)}\n"! ${"b".repeat(29)}</p>\nDATA mv_foo TYPE string.`), cnt: 0},
  {abap: definition(`"! <p class="shorttext synchronized">${"a".repeat(58)}&lt;&gt;</p>\nDATA mv_foo TYPE string.`), cnt: 0},
  {abap: definition(`"! <p>${text61}</p>\nDATA mv_foo TYPE string.`), cnt: 0},
  {abap: definition(`"! ${text61}\nDATA mv_foo TYPE string.`), cnt: 0},
  {abap: definition(`" <p class="shorttext synchronized">${text61}</p>\nDATA mv_foo TYPE string.`), cnt: 0},
  {abap: definition(`"! <p class="shorttext synchronized">${"a".repeat(40)}\n\n"! ${"b".repeat(30)}</p>\nDATA mv_foo TYPE string.`), cnt: 0},
], AbapdocShorttextLength);

async function findIssues(abap: string): Promise<readonly Issue[]> {
  const reg = new Registry().addFile(new MemoryFile("zif_foobar.intf.abap", abap));
  await reg.parseAsync();
  const rule = new AbapdocShorttextLength();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: abapdoc_shorttext_length", () => {

  it("reports the line of the shorttext with its length", async () => {
    const abap = `INTERFACE zif_foobar PUBLIC.
  "! <p class="shorttext synchronized" lang="en">Client</p>
  METHODS foo.
  "! Long description
  "! <p class="shorttext synchronized" lang="en">${text61}</p>
  METHODS bar.
ENDINTERFACE.`;
    const issues = await findIssues(abap);
    expect(issues.length).to.equal(1);
    expect(issues[0].getStart().getRow()).to.equal(5);
    expect(issues[0].getMessage()).to.contain("61");
  });

});
