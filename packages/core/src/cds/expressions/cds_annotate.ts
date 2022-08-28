import {CDSAnnotation, CDSElement, CDSName} from ".";
import {Expression, seq, star, plus, opt, str, alt} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSAnnotate extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(star(CDSAnnotation),
               "ANNOTATE",
               alt("ENTITY", "VIEW"),
               CDSName,
               "WITH",
               str("{"),
               plus(seq(CDSElement, ";")),
               str("}"),
               opt(";"));
  }
}