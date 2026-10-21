import {BDEFImplementationIn, BDEFName} from ".";
import {altPrio, Expression, optPrio, seq, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

/** first statement, eg. "managed with additional save implementation in class zbp_travel unique;" */
export class BDEFImplementationType extends Expression {
  public getRunnable(): IStatementRunnable {
    const extension = seq("EXTENSION", optPrio(altPrio(
      seq("USING INTERFACE", BDEFName),
      seq("FOR", altPrio("PROJECTION", "INTERFACE")))));

    const type = altPrio(
      "MANAGED", "UNMANAGED", "ABSTRACT", "PROJECTION", "INTERFACE", extension,
      // old syntax, eg. "implementation unmanaged;"
      seq("IMPLEMENTATION", altPrio("MANAGED", "UNMANAGED", "ABSTRACT", "PROJECTION")));

    const save = seq(altPrio("WITH ADDITIONAL SAVE", "WITH UNMANAGED SAVE"), optPrio("AND CLEANUP"), optPrio("WITH FULL DATA"));
    const option = altPrio(BDEFImplementationIn, save);

    return seq(type, starPrio(option), ";");
  }
}
