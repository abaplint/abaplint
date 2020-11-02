import {Version} from "../../../version";
import {ParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {Expression, ver, seq, str, tok} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class SQLFunction extends Expression {
  public getRunnable(): IStatementRunnable {

    const uuid = ver(Version.v754, seq(str("uuid"), tok(ParenLeftW), tok(WParenRightW)));

    return uuid;
  }
}