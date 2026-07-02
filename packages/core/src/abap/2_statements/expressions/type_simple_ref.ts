import {seq, alt, Expression, altPrio} from "../combi";
import {TypeName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class TypeSimpleRef extends Expression {
  public getRunnable(): IStatementRunnable {
    const tableKind = seq(alt("ANY", "STANDARD", "HASHED", "SORTED", "INDEX"), "TABLE");

    return altPrio(
      seq("LINE", "OF", TypeName),
      seq("REF", "TO", TypeName),
      tableKind,
      seq("ANY", "STRUCTURE"),
      TypeName);
  }
}
