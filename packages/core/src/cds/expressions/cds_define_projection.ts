import {CDSAnnotation, CDSElement, CDSName} from ".";
import {Version} from "../..";
import {Expression, seq, star, plus, opt, str, ver} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSDefineProjection extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(star(CDSAnnotation),
               "DEFINE",
               opt("ROOT"),
               "VIEW",
               ver(Version.v755, opt("ENTITY")),
               CDSName,
               opt(seq("PROVIDER CONTRACT", CDSName)),
               "AS PROJECTION ON",
               CDSName,
               str("{"),
               plus(CDSElement),
               star(seq(",", CDSElement)),
               str("}"),
               opt(";"));
  }
}