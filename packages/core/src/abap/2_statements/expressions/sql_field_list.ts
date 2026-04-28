import {seq, ver, Expression, alt, starPrio, altPrio, tok, optPrio} from "../combi";
import {SQLAsName, SQLField, SQLFieldName, Dynamic} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {ParenLeftW, WParenRight, WParenRightW} from "../../1_lexer/tokens";

export class SQLFieldList extends Expression {
  public getRunnable(): IStatementRunnable {
    const as = seq("AS", SQLAsName);
    const commaParenField = seq(tok(ParenLeftW), SQLFieldName, altPrio(tok(WParenRightW), tok(WParenRight)), optPrio(as));
    const nev = ver(Version.v740sp05, starPrio(seq(",", altPrio(SQLField, commaParenField))), Version.OpenABAP);
    const old = starPrio(SQLField);

    return altPrio("*",
                   Dynamic,
                   seq(SQLField, alt(nev, old)));
  }
}