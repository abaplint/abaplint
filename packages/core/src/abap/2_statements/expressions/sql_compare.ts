import {ver, seq, optPrio, altPrio, Expression, plusPrio, tok, AlsoIn} from "../combi";
import {SQLSource, SQLFieldName, Dynamic, SQLIn, SQLCompareOperator, SQLFunction, SQLAggregation, SQLCase, Source, SimpleSource3, SQLPathForColumn, ConstantString} from ".";
import {Release} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {ParenLeftW, WAt, WParenRightW} from "../../1_lexer/tokens";
import {SQLSetOpGroup} from "./sql_set_op_group";
import {buildSelectCore} from "./_select_core";
import {SQLLikeRegexpr} from "./sql_like_regexpr";

export class SQLCompare extends Expression {
  public getRunnable(): IStatementRunnable {
    const subSelect = ver(Release.v750, SQLSetOpGroup, {also: AlsoIn.OpenABAP});
    const simpleSubSelect = seq("(", "SELECT", buildSelectCore(undefined, false), ")");
    const simpleScalarSubSelect = ver(Release.v740sp08, simpleSubSelect, {also: AlsoIn.OpenABAP});

    const between = seq("BETWEEN", SQLSource, "AND", SQLSource);

    const like = seq("LIKE", SQLSource, optPrio(seq("ESCAPE", SQLSource)));

    const nul = seq("IS", optPrio("NOT"), altPrio("NULL", ver(Release.v753, "INITIAL")));

    const sub = seq(optPrio(altPrio("ALL", "ANY", "SOME")), altPrio(subSelect, simpleScalarSubSelect));

    const source = new SQLSource();

    const arith = ver(Release.v750, plusPrio(seq(altPrio("+", "-", "*", "/"), SQLFieldName)), {also: AlsoIn.OpenABAP});

    const paren = seq(tok(ParenLeftW), Source, tok(WParenRightW));
    const at = ver(Release.v740sp05, seq(tok(WAt), altPrio(SimpleSource3, paren)), {also: AlsoIn.OpenABAP});

    const lhs = altPrio(SQLCase, SQLAggregation, SQLFunction, ConstantString,
                        seq(altPrio(SQLPathForColumn, SQLFieldName), optPrio(arith)), at);
    const rhs = altPrio(seq(SQLCompareOperator, altPrio(sub, SQLCase, SQLAggregation, SQLFunction, seq(source, optPrio(arith)))),
                        seq(optPrio("NOT"), altPrio(SQLIn, like, between)),
                        SQLLikeRegexpr,
                        nul);
    const rett = seq(lhs, rhs);

    const exists = seq("EXISTS", altPrio(subSelect, simpleSubSelect));

    return altPrio(exists, Dynamic, rett);
  }
}
