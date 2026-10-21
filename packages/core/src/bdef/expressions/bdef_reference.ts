import {BDEFName} from ".";
import {altPrio, Expression, optPrio, regex, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

/** reference to a determination, validation or action, optionally prefixed with an entity, eg. "Child ~ validatePercentage" */
export class BDEFReference extends Expression {
  public getRunnable(): IStatementRunnable {
    const namespace = seq("/", regex(/^\w+$/), "/");
    const tildeEnd = regex(/^\w+~$/);

    return altPrio(
      seq(BDEFName, "~", BDEFName),
      seq(BDEFName, regex(/^~\w+$/)),
      seq(optPrio(namespace), tildeEnd, BDEFName),
      seq(optPrio(namespace), regex(/^\w+~\w+$/)),
      BDEFName);
  }
}
