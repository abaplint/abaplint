import {regex as reg, seq, tok, Expression, optPrio} from "../combi";
import {BracketLeftW, Dash, WBracketRight} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {AssociationName} from "./association_name";
import {SQLCond} from "./sql_cond";

export class SQLPath extends Expression {
  public getRunnable(): IStatementRunnable {
// todo, only from version?

    const condition = seq(tok(BracketLeftW), "ONE TO ONE WHERE", SQLCond, tok(WBracketRight));

    const ret = seq(AssociationName, optPrio(condition), tok(Dash), reg(/\w+/));

    return ret;
  }
}