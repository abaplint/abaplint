import {CDSAnnotation, CDSAs, CDSAssociation, CDSElement, CDSName, CDSProviderContract, CDSWhere, CDSWithParameters} from ".";
import {Version} from "../..";
import {Expression, seq, star, plus, opt, str, ver} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSDefineProjection extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(star(CDSAnnotation),
               "DEFINE",
               opt("ROOT"),
               opt("TRANSIENT"),
               "VIEW",
               ver(Version.v755, opt("ENTITY")),
               CDSName,
               opt(CDSProviderContract),
               opt(CDSWithParameters),
               "AS PROJECTION ON",
               CDSName,
               opt(CDSAs),
               star(CDSAssociation),
               str("{"),
               plus(CDSElement),
               star(seq(",", CDSElement)),
               str("}"),
               opt(CDSWhere),
               opt(";"));
  }
}