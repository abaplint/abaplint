import {Statement} from "./_statement";
import {verNot, str, seq, alt, opt, regex as reg, IRunnable} from "../combi";
import {FieldSub, Field} from "../expressions";
import {Version} from "../../version";

export class AtSelectionScreen extends Statement {

  public getMatcher(): IRunnable {
    let output = str("OUTPUT");

    let value = seq(str("ON VALUE-REQUEST FOR"), new FieldSub());

    let exit = str("ON EXIT-COMMAND");

    let field = seq(str("ON"), new FieldSub());

    let end = seq(str("ON END OF"), new Field());

    let radio = seq(str("ON RADIOBUTTON GROUP"), new Field());

    let block = seq(str("ON BLOCK"), reg(/^\w+$/));

    let help = seq(str("ON HELP-REQUEST FOR"), new FieldSub());

    let ret = seq(str("AT SELECTION-SCREEN"),
                  opt(alt(output, value, radio, exit, field, end, help, block)));

    return verNot(Version.Cloud, ret);
  }

}