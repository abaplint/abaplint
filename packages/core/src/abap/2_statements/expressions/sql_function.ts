import {Version} from "../../../version";
import {ParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {Expression, ver, seq, str, tok, alt} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SQLFieldName} from "./sql_field_name";

export class SQLFunction extends Expression {
  public getRunnable(): IStatementRunnable {

    const uuid = ver(Version.v754, seq(str("uuid"), tok(ParenLeftW), tok(WParenRightW)));
    const abs = ver(Version.v751, seq(str("abs"), tok(ParenLeftW), new SQLFieldName(), tok(WParenRightW)));

    return alt(uuid, abs);
  }
}