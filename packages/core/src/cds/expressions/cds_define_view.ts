import {CDSAnnotation} from ".";
import {Expression, str, seq, star, opt} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSName} from "./cds_name";
import {CDSSelect} from "./cds_select";

export class CDSDefineView extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(star(CDSAnnotation), str("DEFINE VIEW"), CDSName, "AS", CDSSelect, opt(";"));
  }
}