import {altPrio, Expression, regex, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class BDEFName extends Expression {
  public getRunnable(): IStatementRunnable {
    const word = regex(/^\$?\w+$/);
    const slashName = seq("/", regex(/^\w+$/), "/", regex(/^\w+$/));
    return altPrio(slashName, word);
  }
}
