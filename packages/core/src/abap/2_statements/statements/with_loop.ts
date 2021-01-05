import {IStatement} from "./_statement";
import {plus, seq, tok, ver} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {SelectLoop, WithName} from "../expressions";

export class WithLoop implements IStatement {

  public getMatcher(): IStatementRunnable {
    const as = seq(WithName, "AS", tok(WParenLeftW), SelectLoop, tok(WParenRightW));
    return ver(Version.v751, seq("WITH", plus(as), SelectLoop));
  }

}