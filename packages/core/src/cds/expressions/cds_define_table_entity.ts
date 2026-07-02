import {CDSAnnotation, CDSAssociation, CDSComposition, CDSElement, CDSJoin, CDSName,
  CDSSource, CDSType, CDSWhere, CDSWithParameters} from ".";
import {Expression, str, seq, star, opt, optPrio, plus, alt, altPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSDefineTableEntity extends Expression {
  public getRunnable(): IStatementRunnable {
    const nullability = optPrio(alt("NOT NULL", "NULL"));
    const field = seq(star(CDSAnnotation), optPrio(str("KEY")), CDSName, ":", CDSType, nullability, ";");
    const assocOrComp = seq(star(CDSAnnotation), CDSName, ":", alt(CDSComposition, CDSAssociation), ";");
    const inlineBody = plus(alt(field, assocOrComp));

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
