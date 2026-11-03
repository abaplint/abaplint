import {BDEFAssociationBody, BDEFField, BDEFName} from ".";
import {altPrio, Expression, optPrio, seq, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

/** eg. "instance hierarchy /DMO/I_EmployeeHN { managed reorder action changeNextSibling; ascending association _Manager; }" */
export class BDEFHierarchy extends Expression {
  public getRunnable(): IStatementRunnable {
    const action = seq(optPrio("MANAGED"), altPrio("REORDER", "COPY"), "ACTION", BDEFName, ";");
    const association = seq(altPrio("ASCENDING", "DESCENDING"), "ASSOCIATION", BDEFName, altPrio(";", BDEFAssociationBody));
    const item = altPrio(action, association, BDEFField, ";");

    return seq("INSTANCE HIERARCHY", BDEFName, "{", starPrio(item), "}");
  }
}
