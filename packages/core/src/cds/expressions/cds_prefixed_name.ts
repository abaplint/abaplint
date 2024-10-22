import {Expression, opt, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSName} from "./cds_name";
import {CDSParameters} from "./cds_parameters";

export class CDSPrefixedName extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(CDSName, opt(CDSParameters), star(seq(".", CDSName, opt(CDSParameters))));
  }
}