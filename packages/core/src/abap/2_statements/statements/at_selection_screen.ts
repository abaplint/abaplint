import {IStatement} from "./_statement";
import {verNot, seq, alt, opts, regex as reg} from "../combi";
import {FieldSub, Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class AtSelectionScreen implements IStatement {

  public getMatcher(): IStatementRunnable {
    const output = "OUTPUT";

    const value = seq("ON VALUE-REQUEST FOR", FieldSub);

    const exit = "ON EXIT-COMMAND";

    const field = seq("ON", FieldSub);

    const end = seq("ON END OF", Field);

    const radio = seq("ON RADIOBUTTON GROUP", Field);

    const block = seq("ON BLOCK", reg(/^\w+$/));

    const help = seq("ON HELP-REQUEST FOR", FieldSub);

    const ret = seq("AT SELECTION-SCREEN",
                    opts(alt(output, value, radio, exit, field, end, help, block)));

    return verNot(Version.Cloud, ret);
  }

}