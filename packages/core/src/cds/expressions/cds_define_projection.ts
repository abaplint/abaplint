import {CDSAnnotation, CDSAs, CDSAssociation, CDSElement, CDSName, CDSParametersSelect, CDSProviderContract, CDSWhere, CDSWithParameters} from ".";
import {Release} from "../..";
import {Expression, seq, star, opt, str, ver, altPrio, optPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSDefineProjection extends Expression {
  public getRunnable(): IStatementRunnable {
    // redefine association _Assoc redirected to [composition child | parent] Entity
    const redefineAssoc = seq(
      "REDEFINE", "ASSOCIATION", CDSName,
      "REDIRECTED", "TO",
      optPrio(altPrio(seq("COMPOSITION", "CHILD"), "PARENT")),
      CDSName,
    );

    return seq(star(CDSAnnotation),
               opt("DEFINE"),
               opt("ROOT"),
               opt("TRANSIENT"),
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
               str("{"),
               seq(CDSElement, star(seq(",", CDSElement)), opt(",")),
               str("}"),
               opt(CDSWhere),
               opt(";"));
  }
}
