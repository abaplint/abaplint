import {regex as reg, altPrio, plusPrio, seq, tok, Expression} from "../combi";
import {AssociationName} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";

export class EntityAssociation extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(reg(/^[\/\w]+$/), plusPrio(altPrio(tok(AssociationName), reg(/^\\[\w]+$/))));
  }
}
