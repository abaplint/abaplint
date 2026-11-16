import {expect} from "chai";
import {TextFieldLiteralBlanks, TextFieldLiteralBlanksConf} from "../../src/rules/text_field_literal_blanks";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {testRule, testRuleFix} from "./_utils";

const data = `DATA lv TYPE string.
DATA lt TYPE string_table.
DATA lc TYPE c LENGTH 10.
`;

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: data + "WRITE lv.", cnt: 0},

  // searchPattern
  {abap: data + `REPLACE ALL OCCURRENCES OF ' ' IN lv WITH ''.`, cnt: 1},
  {abap: data + `REPLACE ALL OCCURRENCES OF '   ' IN lv WITH ''.`, cnt: 1},
  {abap: data + `REPLACE ALL OCCURRENCES OF '' IN lv WITH 'x'.`, cnt: 1},
  {abap: data + `REPLACE ALL OCCURRENCES OF space IN lv WITH ''.`, cnt: 1},
  {abap: data + `REPLACE ALL OCCURRENCES OF SUBSTRING ' ' IN lv WITH ''.`, cnt: 1},
  {abap: data + `REPLACE ALL OCCURRENCES OF ' ' IN lv WITH '' IN CHARACTER MODE.`, cnt: 1},
  {abap: data + `REPLACE ALL OCCURRENCES OF ' ' IN TABLE lt WITH ''.`, cnt: 1},
  {abap: data + `REPLACE FIRST OCCURRENCE OF ' ' IN lv WITH ''.`, cnt: 1},
  {abap: data + `REPLACE ' ' IN lv WITH ''.`, cnt: 1},
  {abap: data + `FIND ALL OCCURRENCES OF ' ' IN lv MATCH COUNT DATA(count).`, cnt: 1},
  {abap: data + `FIND ' ' IN lv.`, cnt: 1},
  {abap: data + `FIND FIRST OCCURRENCE OF ' ' IN lv.`, cnt: 1},
  {abap: data + `FIND ALL OCCURRENCES OF ' ' IN TABLE lt RESULTS DATA(results).`, cnt: 1},
  {abap: data + `REPLACE ALL OCCURRENCES OF \` \` IN lv WITH \`\`.`, cnt: 0},
  {abap: data + `REPLACE ALL OCCURRENCES OF 'a ' IN lv WITH ''.`, cnt: 0},
  {abap: data + `REPLACE ALL OCCURRENCES OF lc IN lv WITH ''.`, cnt: 0},
  {abap: data + `REPLACE ALL OCCURRENCES OF REGEX ' ' IN lv WITH ''.`, cnt: 0},
  {abap: data + `REPLACE ALL OCCURRENCES OF PCRE ' ' IN lv WITH ''.`, cnt: 0},
  {abap: data + `FIND REGEX ' ' IN lv.`, cnt: 0},
  {abap: data + `REPLACE ALL OCCURRENCES OF 'a' IN lv WITH ' '.`, cnt: 0},
  {abap: data + `REPLACE SECTION OFFSET 0 LENGTH 1 OF lv WITH ' '.`, cnt: 0},
  {abap: data + `FIND 'a' IN lv MATCH OFFSET DATA(off).`, cnt: 0},
  {abap: data + `REPLACE ALL OCCURRENCES OF ' ' IN lv WITH '' IN BYTE MODE.`, cnt: 0},
  {abap: data + `REPLACE ' ' WITH 'x' INTO lv.`, cnt: 0},

  // concatenation
  {abap: data + `lv = 'Hello ' && lv.`, cnt: 1},
  {abap: data + `lv = lv && ' ' && lv.`, cnt: 1},
  {abap: data + `lv = lv && 'world '.`, cnt: 1},
  {abap: data + `lv = 'a ' && 'b '.`, cnt: 2},
  {abap: data + `lv = lv && space && lv.`, cnt: 1},
  {abap: data + `lv &&= ' '.`, cnt: 1},
  {abap: data + `lv = |{ 'Hello ' }{ lv }|.`, cnt: 1},
  {abap: data + `lv = |{ lv && ' ' }|.`, cnt: 1},
  {abap: data + `CONCATENATE 'Hello ' lv INTO lv.`, cnt: 1},
  {abap: data + `CONCATENATE lv ' ' lv INTO lv.`, cnt: 1},
  {abap: data + `CONCATENATE lv space lv INTO lv.`, cnt: 1},
  {abap: data + `CONCATENATE 'Hello ' lv INTO lv SEPARATED BY ' '.`, cnt: 1},
  {abap: data + `WRITE / ( 'a ' && lv ).`, cnt: 1},
  {abap: data + `lv = \`Hello \` && lv.`, cnt: 0},
  {abap: data + `lv = 'Hello' && lv.`, cnt: 0},
  {abap: data + `lv = ' Hello' && lv.`, cnt: 0},
  {abap: data + `lv = '' && lv.`, cnt: 0},
  {abap: data + `lv = 'Hello ' & 'world'.`, cnt: 0},
  {abap: data + `lv = 'Hello '.`, cnt: 0},
  {abap: data + `lv = |{ 'Hello ' WIDTH = 10 }|.`, cnt: 0},
  {abap: data + `CONCATENATE 'Hello ' lv INTO lv RESPECTING BLANKS.`, cnt: 0},
  {abap: data + `CONCATENATE lv lv INTO lv SEPARATED BY ' '.`, cnt: 0},
  {abap: data + `CONCATENATE lv lv INTO lv SEPARATED BY space.`, cnt: 0},
  {abap: data + `IF lv = 'Hello '.
ENDIF.`, cnt: 0},
  {abap: data + `lv = to_upper( 'Hello ' ).`, cnt: 0},
];

testRule(tests, TextFieldLiteralBlanks);

const searchOnly = new TextFieldLiteralBlanksConf();
searchOnly.concatenation = false;
testRule([
  {abap: data + `REPLACE ALL OCCURRENCES OF ' ' IN lv WITH ''.`, cnt: 1},
  {abap: data + `lv = 'Hello ' && lv.`, cnt: 0},
  {abap: data + `FIND ' ' && lv IN lv.`, cnt: 0},
], TextFieldLiteralBlanks, searchOnly, "text_field_literal_blanks, concatenation off");

const concatenationOnly = new TextFieldLiteralBlanksConf();
concatenationOnly.searchPattern = false;
testRule([
  {abap: data + `REPLACE ALL OCCURRENCES OF ' ' IN lv WITH ''.`, cnt: 0},
  {abap: data + `lv = 'Hello ' && lv.`, cnt: 1},
], TextFieldLiteralBlanks, concatenationOnly, "text_field_literal_blanks, searchPattern off");

const fixes = [
  {
    input: data + `REPLACE ALL OCCURRENCES OF ' ' IN lv WITH ''.`,
    output: data + `REPLACE ALL OCCURRENCES OF \` \` IN lv WITH ''.`,
  },
  {
    input: data + `REPLACE ALL OCCURRENCES OF space IN lv WITH ''.`,
    output: data + `REPLACE ALL OCCURRENCES OF \` \` IN lv WITH ''.`,
  },
  {
    input: data + `lv = 'Hello ' && lv.`,
    output: data + `lv = \`Hello \` && lv.`,
  },
  {
    input: data + `lv = 'it''s \`a\` ' && lv.`,
    output: data + `lv = \`it's \`\`a\`\` \` && lv.`,
  },
  {
    input: data + `CONCATENATE lv ' ' lv INTO lv.`,
    output: data + `CONCATENATE lv \` \` lv INTO lv.`,
  },
];

testRuleFix(fixes, TextFieldLiteralBlanks);

function findIssues(abap: string) {
  const reg = new Registry().addFile(new MemoryFile("zfoo.prog.abap", abap)).parse();
  return new TextFieldLiteralBlanks().initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: text_field_literal_blanks, messages and positions", () => {

  it("REPLACE ALL OCCURRENCES: names the exception, issue on the literal", () => {
    const issues = findIssues(data + `REPLACE ALL OCCURRENCES OF ' ' IN lv WITH ''.`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("CX_SY_REPLACE_INFINITE_LOOP");
    expect(issues[0].getStart().getRow()).to.equal(4);
    expect(issues[0].getStart().getCol()).to.equal(28);
  });

  it("FIND ALL OCCURRENCES: names the exception", () => {
    const issues = findIssues(data + `FIND ALL OCCURRENCES OF ' ' IN lv MATCH COUNT DATA(count).`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("CX_SY_FIND_INFINITE_LOOP");
  });

  it("FIND first occurrence: found before the first character", () => {
    const issues = findIssues(data + `FIND ' ' IN lv.`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("before the first character");
  });

  it("empty literal: no quick fix, the intended pattern is unknown", () => {
    const issues = findIssues(data + `REPLACE ALL OCCURRENCES OF '' IN lv WITH 'x'.`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getDefaultFix()).to.equal(undefined);
  });

  it("space in a concatenation: own message", () => {
    const issues = findIssues(data + `lv = lv && space && lv.`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.equal("space is ignored here, use ` `");
  });

  it("concatenation: issue on the literal", () => {
    const issues = findIssues(data + `lv = lv && 'Hello '.`);
    expect(issues.length).to.equal(1);
    expect(issues[0].getMessage()).to.contain("'Hello '");
    expect(issues[0].getStart().getCol()).to.equal(12);
  });

});
