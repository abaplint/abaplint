import {Version} from "../../../version";
import {ParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {Expression, ver, seq, tok, altPrio} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Integer} from "./integer";
import {SQLAliasField} from "./sql_alias_field";
import {SQLFieldName} from "./sql_field_name";

export class SQLFunction extends Expression {
  public getRunnable(): IStatementRunnable {

    const uuid = ver(Version.v754, seq("uuid", tok(ParenLeftW), tok(WParenRightW)));
    const abs = ver(Version.v751, seq("abs", tok(ParenLeftW), altPrio(SQLFieldName, SQLAliasField), tok(WParenRightW)));
    const cast = ver(Version.v750, seq("cast", tok(ParenLeftW), altPrio(SQLFieldName, SQLAliasField), "AS CHAR", tok(ParenLeftW), Integer, tok(WParenRightW), tok(WParenRightW)));

    return altPrio(uuid, abs, cast);
  }
}