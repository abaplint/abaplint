import {IStatement} from "./_statement";
import {verNot, str, seq, alt, opt, regex as reg} from "../combi";
import {FieldSub, Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class AtSelectionScreen implements IStatement {

  public getMatcher(): IStatementRunnable {
    const output = str("OUTPUT");

    const value = seq(str("ON VALUE-REQUEST FOR"), new FieldSub());

    const exit = str("ON EXIT-COMMAND");

    const field = seq(str("ON"), new FieldSub());

    const end = seq(str("ON END OF"), new Field());

    const radio = seq(str("ON RADIOBUTTON GROUP"), new Field());

    const block = seq(str("ON BLOCK"), reg(/^\w+$/));

    const help = seq(str("ON HELP-REQUEST FOR"), new FieldSub());

    const ret = seq(str("AT SELECTION-SCREEN"),
                    opt(alt(output, value, radio, exit, field, end, help, block)));

    return verNot(Version.Cloud, ret);
  }

}