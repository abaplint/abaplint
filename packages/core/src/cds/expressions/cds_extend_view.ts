import {CDSAnnotation, CDSAs, CDSAssociation, CDSComposition, CDSCondition, CDSElement, CDSGroupBy, CDSInteger, CDSName, CDSPrefixedName, CDSString, CDSType, CDSWithParameters} from ".";
import {Expression, str, seq, star, starPrio, opt, optPrio, plus, alt, altPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSExtendView extends Expression {
  public getRunnable(): IStatementRunnable {

    const namedot = seq(CDSName, optPrio(seq(".", CDSName)), optPrio(CDSAs));
    const valueNested = seq("{", namedot, star(seq(",", namedot)), "}");

    const redefineCard = altPrio(
      "EXACT ONE TO EXACT ONE", "EXACT ONE TO MANY", "EXACT ONE TO ONE",
      "MANY TO EXACT ONE", "MANY TO MANY", "MANY TO ONE",
      "ONE TO EXACT ONE", "ONE TO MANY", "ONE TO ONE",
      "TO EXACT ONE", "TO ONE", "TO MANY",
      CDSInteger, "*",
    );
    const redefineAssocFilter = seq("[", optPrio(seq(redefineCard, ":")), CDSCondition, "]");
    const redefineAssoc = seq(
      "REDEFINE", "ASSOCIATION", CDSPrefixedName, optPrio(redefineAssocFilter),
      opt(CDSAs),
      "REDIRECTED", "TO",
      optPrio(altPrio(seq("COMPOSITION", "CHILD"), "PARENT")),
      CDSName,
    );

    const elementList = seq(CDSElement, star(seq(",", CDSElement)), opt(","));
    const elementNested = seq("{", altPrio("*", elementList), "}");

    const unionElemList = seq(CDSElement, star(seq(",", CDSElement)), opt(","));
    const unionBranchBody = seq(star(altPrio(CDSAssociation, CDSComposition)), "{", altPrio("*", unionElemList), "}", optPrio(CDSGroupBy));
    const parenUnionBody = seq("(",
                               star(altPrio(CDSAssociation, CDSComposition)),
                               "{", seq(CDSElement, star(seq(",", CDSElement)), opt(",")), "}",
                               star(seq("UNION", opt("ALL"), star(altPrio(CDSAssociation, CDSComposition)), "{", seq(CDSElement, star(seq(",", CDSElement)), opt(",")), "}")),
                               ")");
    const unionSuffix = seq(
      optPrio(CDSGroupBy),
      star(seq("UNION", opt("ALL"), altPrio(parenUnionBody, unionBranchBody))),
    );

    const typedLiteralVal = seq(CDSType, CDSString);
    const aspectValue = altPrio(typedLiteralVal, CDSString, CDSPrefixedName);
    const aspectBinding = seq(CDSPrefixedName, "=", ">", aspectValue);
    const bindAspect = seq("BIND", "ASPECT", CDSName, "(", aspectBinding, starPrio(seq(",", aspectBinding)), ")", optPrio(seq("AS", CDSName)));

    const extendView = seq(
      star(CDSAnnotation),
      str("EXTEND VIEW"), opt(str("ENTITY")), CDSName, str("WITH"), opt(CDSName),
      star(redefineAssoc),
      star(altPrio(CDSAssociation, CDSComposition)),
      starPrio(bindAspect),
      altPrio(parenUnionBody, elementNested, valueNested),
      unionSuffix,
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
