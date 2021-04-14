import {seq, Expression, tok, starPrio, optPrio, altPrio} from "../combi";
import {SQLTarget} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {WParenLeft, WParenLeftW} from "../../1_lexer/tokens/paren_left";

export class SQLIntoStructure extends Expression {
  public getRunnable(): IStatementRunnable {
    const intoList = seq(altPrio(tok(WParenLeft), tok(WParenLeftW)),
                         starPrio(seq(SQLTarget, ",")),
                         SQLTarget,
                         ")");
    const intoSimple = seq(optPrio("CORRESPONDING FIELDS OF"),
                           SQLTarget);

    return seq("INTO", altPrio(intoList, intoSimple));
  }
}