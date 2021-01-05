import {IStatement} from "./_statement";
import {seq, ver, plus, tok} from "../combi";
import {Version} from "../../../version";
import {Select, SelectLoop, WithName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";

export class With implements IStatement {

  public getMatcher(): IStatementRunnable {
    const as = seq(WithName, "AS", tok(WParenLeftW), SelectLoop, tok(WParenRightW));
    return ver(Version.v751, seq("WITH", plus(as), Select));
  }

}