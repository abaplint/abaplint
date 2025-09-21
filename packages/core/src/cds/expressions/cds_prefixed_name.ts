import {alt, Expression, opt, seq, star} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";
import {CDSName} from "./cds_name";
import {CDSParameters} from "./cds_parameters";
import {CDSParametersSelect} from "./cds_parameters_select";

export class CDSPrefixedName extends Expression {
  public getRunnable(): IStatementRunnable {
    return seq(CDSName, opt(alt(CDSParameters, CDSParametersSelect)), star(seq(".", CDSName, opt(CDSParameters))));
  }
}