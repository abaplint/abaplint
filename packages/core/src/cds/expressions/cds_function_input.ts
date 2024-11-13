import {CDSArithmetics, CDSCase, CDSCast, CDSFunction, CDSName, CDSParameters, CDSString} from ".";
import {altPrio, Expression, opt, regex, seq, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

export class CDSFunctionInput extends Expression {
  public getRunnable(): IStatementRunnable {
    const qualified = seq(CDSName, opt(CDSParameters), starPrio(seq(".", CDSName, opt(CDSParameters))));
    const input = altPrio(CDSCast, CDSFunction, CDSArithmetics, CDSCase, CDSString, qualified, regex(/^\d+$/), );

    return input;
  }
}