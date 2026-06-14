import {WPlus, ParenLeftW, WParenRightW} from "../../1_lexer/tokens";
import {regex as reg, Expression, tok, seq, optPrio, star} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {SQLFieldName} from "./sql_field_name";

export class WithName extends Expression {
  public getRunnable(): IStatementRunnable {
    // ( has no leading space, ) has leading space
    const colList = seq(tok(ParenLeftW), SQLFieldName, star(seq(",", SQLFieldName)), tok(WParenRightW));
    return seq(tok(WPlus), reg(/^\w+$/), optPrio(colList));
  }
}