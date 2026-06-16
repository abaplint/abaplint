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

    const subNoAgg = plusPrio(seq(altPrio("+", "-", "*", "/", "&&"), altPrio(parenFieldNoAgg, fieldNoAgg)));
    const arithNoAgg = ver(Version.v740sp05, subNoAgg);

    const subWithAgg = plusPrio(seq(altPrio("+", "-", "*", "/", "&&"), altPrio(parenField, field)));
    const arithWithAgg = ver(Version.v754, subWithAgg);

    const arith = altPrio(arithWithAgg, arithNoAgg);

    const arithSequence = seq(optPrio("-"), field, optPrio(arith));
    const parenArithSequence = seq(tok(WParenLeftW), optPrio("-"), arithSequence, tok(WParenRightW));

    // allows (a-b)*(c-d) — paren groups as operands, defined after parenArithSequence
    const subExtWithAgg = plusPrio(seq(altPrio("+", "-", "*", "/", "&&"), altPrio(parenArithSequence, parenField, field)));
    const subExtNoAgg = plusPrio(seq(altPrio("+", "-", "*", "/", "&&"), altPrio(parenArithSequence, parenFieldNoAgg, fieldNoAgg)));
    const arithExt = altPrio(ver(Version.v754, subExtWithAgg), ver(Version.v740sp05, subExtNoAgg));

    return seq(altPrio(
      seq(parenArithSequence, optPrio(arithExt)),
      arithSequence,
    ), optPrio(as));
  }
}