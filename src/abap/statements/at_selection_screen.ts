import {Statement} from "./_statement";
import {verNot, str, seq, alt, opt, regex as reg, IRunnable} from "../combi";
import {FieldSub, Field} from "../expressions";
import {Version} from "../../version";

export class AtSelectionScreen extends Statement {

  public getMatcher(): IRunnable {
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