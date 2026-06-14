import {ver, seq, optPrio, altPrio, Expression, plusPrio, tok} from "../combi";
import {SQLSource, SQLFieldName, Dynamic, SQLIn, SQLCompareOperator, SQLFunction, SQLAggregation, Source, SimpleSource3, SQLPath, ConstantString} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {ParenLeftW, WAt, WParenRightW} from "../../1_lexer/tokens";
import {SQLSetOpGroup} from "./sql_set_op_group";

export class SQLCompare extends Expression {
  public getRunnable(): IStatementRunnable {
    const subSelect = ver(Version.v750, SQLSetOpGroup, Version.OpenABAP);

    const between = seq("BETWEEN", SQLSource, "AND", SQLSource);

    const like = seq("LIKE", SQLSource, optPrio(seq("ESCAPE", SQLSource)));

    const nul = seq("IS", optPrio("NOT"), altPrio("NULL", ver(Version.v753, "INITIAL")));

    const source = new SQLSource();

    const sub = seq(optPrio(altPrio("ALL", "ANY", "SOME")), subSelect);

    const arith = ver(Version.v750, plusPrio(seq(altPrio("+", "-", "*", "/"), SQLFieldName)), Version.OpenABAP);

    const paren = seq(tok(ParenLeftW), Source, tok(WParenRightW));
    const at = ver(Version.v740sp05, seq(tok(WAt), altPrio(SimpleSource3, paren)), Version.OpenABAP);

    const rett = seq(altPrio(SQLAggregation, SQLFunction, ConstantString, seq(altPrio(SQLPath, SQLFieldName), optPrio(arith)), at),
                     altPrio(seq(SQLCompareOperator, altPrio(sub, SQLAggregation, SQLFunction, source)),
                             seq(optPrio("NOT"), altPrio(SQLIn, like, between)),
                             nul));

    const exists = seq("EXISTS", subSelect);

    return altPrio(exists, Dynamic, rett);
  }
}