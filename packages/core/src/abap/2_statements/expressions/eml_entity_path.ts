import {altPrio, plusPrio, regex as reg, tok, Expression} from "../combi";
import {AssociationName} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class EMLEntityPath extends Expression {
  public getRunnable(): IStatementRunnable {
    return plusPrio(altPrio(tok(AssociationName), reg(/^\\[\w]+$/)));
  }
}
