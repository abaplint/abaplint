import {BDEFAlias, BDEFName} from ".";
import {altPrio, Expression, optPrio, plusPrio, regex, seq, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

/** header statements following the implementation type, eg. "strict ( 2 );" or "with draft;" */
export class BDEFHeader extends Expression {
  public getRunnable(): IStatementRunnable {
    const extensibleItem = seq("WITH", plusPrio(regex(/^\w+$/)), ";");
    const extensible = seq("EXTENSIBLE", optPrio(seq("{", starPrio(extensibleItem), "}")), optPrio(";"));

    return altPrio(
      seq("STRICT", optPrio(seq("(", regex(/^\d+$/), ")")), ";"),
      seq("WITH DRAFT", ";"),
      seq("USE DRAFT", optPrio("AS DEPENDENT"), ";"),
      seq(altPrio("WITH", "USE"), "COLLABORATIVE DRAFT", ";"),
      seq("WITH PRIVILEGED MODE", optPrio(seq("DISABLING", BDEFName)), ";"),
      seq("WITH MANAGED INSTANCE FILTER", ";"),
      seq("WITH HIERARCHY", ";"),
      seq("WITH CROSS ASSOCIATIONS", ";"),
      seq("USE SIDE EFFECTS", ";"),
      seq("USE RECOMMENDATIONS", ";"),
      seq("FOREIGN ENTITY", BDEFName, optPrio(BDEFAlias), ";"),
      seq("SCALAR ENTITY", BDEFName, "FIELD", BDEFName, ";"),
      seq("AUXILIARY CLASS", BDEFName, ";"),
      extensible);
  }
}
