import {plusPrio, seq, ver, tok, Expression, optPrio, altPrio} from "../combi";
import {Constant, SQLFieldName, SQLAggregation, SQLCase, SQLAsName, SimpleFieldChain2} from ".";
import {Version} from "../../../version";
import {ParenLeftW, WAt, WParenLeftW, WParenRight, WParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {SQLFunction} from "./sql_function";
import {SQLPath} from "./sql_path";

export class SQLField extends Expression {
  public getRunnable(): IStatementRunnable {

    const atParen = seq(tok(ParenLeftW), SimpleFieldChain2, tok(WParenRightW));
    const abap = ver(Version.v740sp05, seq(tok(WAt), altPrio(SimpleFieldChain2, atParen)), Version.OpenABAP);

    const as = seq("AS", SQLAsName);

    const parenFieldName = seq(tok(WParenLeftW), SQLFieldName, altPrio(tok(WParenRightW), tok(WParenRight)));

    const fieldNoAgg = altPrio(SQLCase,
                               SQLFunction,
                               SQLPath,
                               SQLFieldName,
                               abap,
                               Constant,
                               parenFieldName);

    const field = altPrio(SQLAggregation, fieldNoAgg);

    const parenField = seq(tok(WParenLeftW), field, tok(WParenRightW));
    const parenFieldNoAgg = seq(tok(WParenLeftW), fieldNoAgg, tok(WParenRightW));

    // arithmetic without aggregates as operands: from v740sp05
    const subNoAgg = plusPrio(seq(altPrio("+", "-", "*", "/", "&&"), altPrio(parenFieldNoAgg, fieldNoAgg)));
    const arithNoAgg = ver(Version.v740sp05, subNoAgg);

    // arithmetic with aggregates as operands: from v754
    const subWithAgg = plusPrio(seq(altPrio("+", "-", "*", "/", "&&"), altPrio(parenField, field)));
    const arithWithAgg = ver(Version.v754, subWithAgg);

    const arith = altPrio(arithWithAgg, arithNoAgg);

    const arithSequence = seq(field, optPrio(arith));
    const parenArithSequence = seq(tok(WParenLeftW), arithSequence, tok(WParenRightW));

    return seq(altPrio(parenArithSequence, arithSequence), optPrio(as));
  }
}