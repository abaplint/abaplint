import {CDSAnnotation, CDSAs, CDSAssociation, CDSComposition, CDSCondition, CDSElement, CDSName, CDSPrefixedName, CDSType, CDSWithParameters} from ".";
import {Expression, str, seq, star, opt, optPrio, plus, alt, altPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSExtendView extends Expression {
  public getRunnable(): IStatementRunnable {

    const namedot = seq(CDSName, optPrio(seq(".", CDSName)), optPrio(CDSAs));
    const valueNested = seq("{", namedot, star(seq(",", namedot)), "}");

    const redefineAssoc = seq(
      "REDEFINE", "ASSOCIATION", CDSPrefixedName, optPrio(seq("[", CDSCondition, "]")),
      opt(CDSAs),
      "REDIRECTED", "TO",
      optPrio(altPrio(seq("COMPOSITION", "CHILD"), "PARENT")),
      CDSName,
    );

    const elementList = seq(CDSElement, star(seq(",", CDSElement)), opt(","));
    const elementNested = seq("{", altPrio("*", elementList), "}");

    const extendView = seq(
      star(CDSAnnotation),
      str("EXTEND VIEW"), opt(str("ENTITY")), CDSName, str("WITH"), opt(CDSName),
      star(redefineAssoc),
      star(CDSAssociation),
      altPrio(elementNested, valueNested),
      opt(";"),
    );

    const field = seq(star(CDSAnnotation), optPrio(str("KEY")), CDSName, ":", CDSType, ";");
    const assocOrComp = seq(star(CDSAnnotation), CDSName, ":", alt(CDSComposition, CDSAssociation), ";");
    const entityBody = seq("{", plus(alt(field, assocOrComp)), "}");
    const extendAbstractOrCustom = seq(
      star(CDSAnnotation),
      "EXTEND",
      alt("ABSTRACT", "CUSTOM"),
      "ENTITY",
      CDSName,
      opt(CDSWithParameters),
      "WITH",
      entityBody,
      opt(";"),
    );

    return alt(extendAbstractOrCustom, extendView);
  }
}
