import {CDSAnnotation, CDSElement, CDSJoin, CDSName,
  CDSSource, CDSTableField, CDSWhere, CDSWithParameters,
  CDSAssociation, CDSComposition} from ".";
import {Expression, str, seq, star, opt, optPrio, plus, altPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSDefineTableEntity extends Expression {
  public getRunnable(): IStatementRunnable {
    // Inline `{ ... }` body: one or more table-field entries. Each entry is
    // wrapped in a CDSTableField node so downstream tooling can pair each
    // field name with its own annotations.
    const inlineBody = plus(CDSTableField);

    const elementList = seq(CDSElement, star(seq(",", CDSElement)), opt(","));
    const elements = seq(str("{"), altPrio("*", elementList), str("}"));

    const selectBody = seq(
      "AS", "SELECT", "FROM",
      CDSSource,
      star(CDSJoin),
      star(altPrio(CDSComposition, CDSAssociation)),
      opt(elements),
      optPrio(CDSWhere),
    );

    return seq(
      star(CDSAnnotation),
      "DEFINE",
      opt("ROOT"),
      "TABLE", "ENTITY", CDSName,
      opt(CDSWithParameters),
      altPrio(
        seq(str("{"), inlineBody, str("}")),
        selectBody,
      ),
      opt(";"),
    );
  }
}
