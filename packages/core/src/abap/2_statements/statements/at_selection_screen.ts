import {IStatement} from "./_statement";
import {verNot, str, seqs, alts, opt, regex as reg} from "../combi";
import {FieldSub, Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class AtSelectionScreen implements IStatement {

  public getMatcher(): IStatementRunnable {
    const output = str("OUTPUT");

    const value = seqs("ON VALUE-REQUEST FOR", FieldSub);

    const exit = str("ON EXIT-COMMAND");

    const field = seqs("ON", FieldSub);

    const end = seqs("ON END OF", Field);

    const radio = seqs("ON RADIOBUTTON GROUP", Field);

    const block = seqs("ON BLOCK", reg(/^\w+$/));

    const help = seqs("ON HELP-REQUEST FOR", FieldSub);

    const ret = seqs("AT SELECTION-SCREEN",
                     opt(alts(output, value, radio, exit, field, end, help, block)));

    return verNot(Version.Cloud, ret);
  }

}