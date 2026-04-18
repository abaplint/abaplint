import {Config} from "../../src/config";
import {Version} from "../../src/version";
import {Issue} from "../../src/issue";
import {MemoryFile} from "../../src/files/memory_file";
import {Registry} from "../../src/registry";
import {expect} from "chai";
import {ParserBadExceptions} from "../../src/rules";

async function findIssues(abap: string): Promise<readonly Issue[]> {
  const config = Config.getDefault(Version.v702);
  const reg = new Registry(config).addFile(new MemoryFile("zfoo.prog.abap", abap));
  await reg.parseAsync();
  const rule = new ParserBadExceptions();
  return rule.initialize(reg).run(reg.getFirstObject()!);
}

describe("Rule: parser_bad_exceptions", () => {

  it("no issues", async () => {
    const issues = await findIssues("pasrser error.");
    expect(issues.length).to.equal(0);
  });

  it("issue", async () => {
    const issues = await findIssues(`
CALL FUNCTION 'BDC_OPEN_GROUP'
    EXPORTING
      client              = sy-mandt
      group               = binam
      user                = usnam
      keep                = xkeep
      holddate            = start
    EXCEPTIONS
      client_invalid
      destination_invalid
      group_invalid
      group_is_locked
      holddate_invalid
      internal_error
      queue_error
      running
      system_lock_error
      user_invalid.`);
    expect(issues.length).to.equal(10);
  });

  it("ok", async () => {
    const issues = await findIssues(
      "CALL FUNCTION 'GUI_UPLOAD'\n" +
  " EXPORTING\n" +
  "   filename                = l_sfile\n" +
  "   filetype                = 'BIN'\n" +
  " IMPORTING\n" +
  "   filelength              = l_len\n" +
  " TABLES\n" +
  "   data_tab                = lt_bin\n" +
  " EXCEPTIONS\n" +
  "   file_open_error         = 1\n" +
  "   file_read_error         = 2\n" +
  "   no_batch                = 3\n" +
  "   gui_refuse_filetransfer = 4\n" +
  "   invalid_type            = 5\n" +
  "   no_authority            = 6\n" +
  "   unknown_error           = 7\n" +
  "   bad_data_format         = 8\n" +
  "   header_not_allowed      = 9\n" +
  "   separator_not_allowed   = 10\n" +
  "   header_too_long         = 11\n" +
  "   unknown_dp_error        = 12\n" +
  "   access_denied           = 13\n" +
  "   dp_out_of_memory        = 14\n" +
  "   disk_full               = 15\n" +
  "   dp_timeout              = 16\n" +
  "   OTHERS                  = 17."
    );
    expect(issues.length).to.equal(0);
  });

});