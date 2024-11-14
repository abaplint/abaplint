import {seq, ver, Expression, alt, starPrio, altPrio, tok} from "../combi";
import {SQLField, Dynamic, SQLFieldName} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {WParenLeftW, WParenRightW} from "../../1_lexer/tokens";

export class SQLFieldList extends Expression {
  public getRunnable(): IStatementRunnable {
    const paren = seq(tok(WParenLeftW), SQLFieldName, tok(WParenRightW));

    const nev = ver(Version.v740sp05, starPrio(seq(",", SQLField)));
    const old = starPrio(SQLField);

    return altPrio("*",
                   Dynamic,
                   seq(SQLField, alt(nev, old)),
                   paren);
  }
}