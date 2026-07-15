import {CDSAnnotation, CDSName, CDSType} from ".";
import {Expression, seq, star, opt, altPrio, regex} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSWithParameters extends Expression {
  public getRunnable(): IStatementRunnable {
    const extNameValue = altPrio(CDSName, regex(/^"(?:[^"]|"")*"$/));
    const externalName = seq("EXTERNAL", "NAME", extNameValue);
    const param = seq(star(CDSAnnotation), CDSName, ":", CDSType, opt(externalName), star(CDSAnnotation));
    return seq("WITH PARAMETERS", param, star(seq(",", param)));
  }
}