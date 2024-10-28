import {ver, seq, optPrio, altPrio, Expression, plusPrio, tok} from "../combi";
import {SQLSource, SQLFieldName, Dynamic, Select, SQLIn, SQLCompareOperator, SQLFunction, Source, SimpleSource3} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {ParenLeftW, WAt, WParenRightW} from "../../1_lexer/tokens";

export class SQLCompare extends Expression {
  public getRunnable(): IStatementRunnable {
    const subSelect = seq("(", Select, ")");
    const subSelectDouble = seq("(", "(", Select, ")", ")");

    const between = seq("BETWEEN", SQLSource, "AND", SQLSource);

    const like = seq("LIKE", SQLSource, optPrio(seq("ESCAPE", SQLSource)));

    const nul = seq("IS", optPrio("NOT"), altPrio("NULL", ver(Version.v753, "INITIAL")));

    const source = new SQLSource();

    const sub = seq(optPrio(altPrio("ALL", "ANY", "SOME")), altPrio(subSelect, subSelectDouble));

    const arith = ver(Version.v750, plusPrio(seq(altPrio("+", "-", "*", "/"), SQLFieldName)));

    const paren = seq(tok(ParenLeftW), Source, tok(WParenRightW));
    const at = ver(Version.v740sp05, seq(tok(WAt), altPrio(SimpleSource3, paren)));

    const rett = seq(altPrio(SQLFunction, seq(SQLFieldName, optPrio(arith)), at),
                     altPrio(seq(SQLCompareOperator, altPrio(sub, source)),
                             seq(optPrio("NOT"), altPrio(SQLIn, like, between)),
                             nul));

    const exists = seq("EXISTS", subSelect);

    return altPrio(exists, Dynamic, rett);
  }
}