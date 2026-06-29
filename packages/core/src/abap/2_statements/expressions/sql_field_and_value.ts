import {seq, Expression, altPrio, tok} from "../combi";
import {WDashW, WPlusW} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {Integer} from "./integer";
import {SQLFieldName} from "./sql_field_name";
import {SQLSource} from "./sql_source";

export class SQLFieldAndValue extends Expression {
  public getRunnable(): IStatementRunnable {
    const op = altPrio(tok(WPlusW), tok(WDashW));
    const opt1 = seq(altPrio(Integer, SQLFieldName), op, SQLSource);
    const param = seq(SQLFieldName, "=", altPrio(opt1, SQLSource));
    return param;
  }
}