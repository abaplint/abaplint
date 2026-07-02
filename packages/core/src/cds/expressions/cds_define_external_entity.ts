import {CDSAnnotation, CDSAssociation, CDSComposition, CDSName, CDSType, CDSWithParameters} from ".";
import {Expression, str, seq, star, opt, optPrio, plus, alt, regex} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSDefineExternalEntity extends Expression {
  public getRunnable(): IStatementRunnable {
    const extNameValue = alt(CDSName, regex(/^"[^"]*"$/));
    const externalName = seq("EXTERNAL", "NAME", extNameValue);
    const nullability = optPrio(alt("NOT NULL", "NULL"));
    const field = seq(star(CDSAnnotation), optPrio(str("KEY")), CDSName, ":", CDSType, nullability, optPrio(externalName), ";");
    const assocOrComp = seq(star(CDSAnnotation), CDSName, ":", alt(CDSComposition, CDSAssociation), ";");
    const body = plus(alt(field, assocOrComp));

    const externalEntity = seq(
      opt("WRITABLE"),
      "EXTERNAL", "ENTITY", CDSName,
      opt(externalName),
      opt(CDSWithParameters),
    );

    const staticEntity = seq(
      "STATIC", "ENTITY", CDSName,
      opt(externalName),
    );

    return seq(
      star(CDSAnnotation),
      "DEFINE",
      alt(externalEntity, staticEntity),
      str("{"), body, str("}"),
      opt(seq("WITH", "FEDERATED", "DATA", optPrio(alt(
        seq("PROVIDED", "AT", "RUNTIME"),
        seq("PROVIDED", "BY", CDSName),
      )))),
      opt(";"),
    );
  }
}
