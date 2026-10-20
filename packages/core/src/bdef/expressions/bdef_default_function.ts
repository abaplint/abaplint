import {BDEFName, BDEFString} from ".";
import {Expression, optPrio, plusPrio, seq} from "../../abap/2_statements/combi";
import {IStatementRunnable} from "../../abap/2_statements/statement_runnable";

/** eg. "{ default function GetDefaultsForCreate; }" */
export class BDEFDefaultFunction extends Expression {
  public getRunnable(): IStatementRunnable {
    const func = seq("DEFAULT FUNCTION", optPrio(seq(BDEFName, optPrio(seq("EXTERNAL", BDEFString)))), ";");
    return seq("{", plusPrio(func), "}");
  }
}
