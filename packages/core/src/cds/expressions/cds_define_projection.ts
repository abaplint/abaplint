import {CDSAnnotation, CDSAs, CDSAssociation, CDSCondition, CDSElement, CDSInteger, CDSName, CDSParametersSelect, CDSPrefixedName, CDSProviderContract, CDSString, CDSType, CDSWhere, CDSWithParameters} from ".";
import {Release} from "../..";
import {Expression, seq, star, opt, str, ver, altPrio, optPrio, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSDefineProjection extends Expression {
  public getRunnable(): IStatementRunnable {
    const redefineCard = altPrio(
      "EXACT ONE TO EXACT ONE", "EXACT ONE TO MANY", "EXACT ONE TO ONE",
      "MANY TO EXACT ONE", "MANY TO MANY", "MANY TO ONE",
      "ONE TO EXACT ONE", "ONE TO MANY", "ONE TO ONE",
      "TO EXACT ONE", "TO ONE", "TO MANY",
      CDSInteger, "*",
    );
    const redefineAssocFilter = seq("[", optPrio(seq(redefineCard, ":")), CDSCondition, "]");
    const redefineAssoc = seq(
      "REDEFINE", "ASSOCIATION", CDSPrefixedName,
      optPrio(redefineAssocFilter),
      opt(CDSAs),
      "REDIRECTED", "TO",
      optPrio(altPrio(seq("COMPOSITION", "CHILD"), "PARENT")),
      CDSName,
    );

    const typedLiteralVal = seq(CDSType, CDSString);
    const aspectValue = altPrio(typedLiteralVal, CDSString, CDSPrefixedName);
    const aspectBinding = seq(CDSPrefixedName, "=", ">", aspectValue);
    const bindAspect = seq("BIND", "ASPECT", CDSName, "(", aspectBinding, starPrio(seq(",", aspectBinding)), ")", optPrio(seq("AS", CDSName)));

    return seq(star(CDSAnnotation),
               opt("DEFINE"),
               opt("TRANSIENT"),
               opt("ROOT"),
               "VIEW",
               ver(Release.v755, opt("ENTITY")),
               CDSName,
               opt(CDSProviderContract),
               opt(CDSWithParameters),
               "AS PROJECTION ON",
               CDSName,
               opt(CDSParametersSelect),
               opt(CDSAs),
               star(altPrio(CDSAssociation, redefineAssoc)),
               starPrio(bindAspect),
               str("{"),
               seq(CDSElement, star(seq(",", CDSElement)), opt(",")),
               str("}"),
               opt(CDSWhere),
               opt(";"));
  }
}
