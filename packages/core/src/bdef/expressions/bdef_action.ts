import {BDEFCardinality, BDEFDefaultFunction, BDEFName, BDEFOptions, BDEFParameter, BDEFResult, BDEFString} from ".";
import {altPrio, Expression, optPrio, seq, starPrio} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

/** actions and functions, eg. "static factory action ( features : global ) copy parameter ZPARAM result [1] $self;" */
export class BDEFAction extends Expression {
  public getRunnable(): IStatementRunnable {
    const modifier = altPrio(
      "INTERNAL", "STATIC", "FACTORY", "DEFAULT", "DRAFT", "REPEATABLE", "RECOMMENDATION",
      seq("SAVE", optPrio(BDEFOptions)),
      seq("KEY", BDEFOptions));

    const tail = altPrio(
      seq("EXTERNAL", BDEFString),
      seq("AS", BDEFName),
      BDEFParameter,
      BDEFResult,
      BDEFCardinality,
      "OPTIMIZED",
      "EXTENSIBLE",
      "WITH ADDITIONAL IMPLEMENTATION");

    return seq(
      starPrio(modifier),
      altPrio("ACTION", "FUNCTION"),
      optPrio(BDEFOptions),
      BDEFName,
      starPrio(tail),
      altPrio(";", BDEFDefaultFunction));
  }
}
