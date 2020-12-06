import {Version} from "../../../version";
import {ParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {Expression, vers, seqs, tok, alts} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SQLFieldName} from "./sql_field_name";

export class SQLFunction extends Expression {
  public getRunnable(): IStatementRunnable {

    const uuid = vers(Version.v754, seqs("uuid", tok(ParenLeftW), tok(WParenRightW)));
    const abs = vers(Version.v751, seqs("abs", tok(ParenLeftW), SQLFieldName, tok(WParenRightW)));

    return alts(uuid, abs);
  }
}