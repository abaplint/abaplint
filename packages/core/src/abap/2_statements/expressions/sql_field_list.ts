import {plusPrio, seq, ver, tok, Expression, optPrio, altPrio} from "../combi";
import {Constant, SQLFieldName, Dynamic, SQLAggregation, SQLCase, SQLAsName} from ".";
import {Version} from "../../../version";
import {WAt, WParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {SQLFunction} from "./sql_function";
import {SimpleFieldChain} from "./simple_field_chain";
import {SQLPath} from "./sql_path";

export class SQLFieldList extends Expression {
  public getRunnable(): IStatementRunnable {
    const comma = optPrio(ver(Version.v740sp05, ","));

    const abap = ver(Version.v740sp05, seq(tok(WAt), SimpleFieldChain));

    const as = seq("AS", SQLAsName);

    const field = altPrio(SQLAggregation,
                          SQLCase,
                          SQLFunction,
                          SQLPath,
                          SQLFieldName,
                          abap,
                          Constant);
    const sub = plusPrio(seq(altPrio("+", "-", "*", "/", "&&"), optPrio(tok(WParenLeftW)), field, optPrio(tok(WParenRightW))));
    const arith = ver(Version.v740sp05, sub);

    return altPrio("*",
                   Dynamic,
                   plusPrio(seq(field, optPrio(arith), optPrio(as), comma)));
  }
}