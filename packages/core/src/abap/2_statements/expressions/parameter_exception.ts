import {seq, altPrio, Expression, optPrio, tok} from "../combi";
import {Dash} from "../../1_lexer/tokens";
import {ComponentName, Integer, ParameterName, SimpleFieldChain, Target} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class ParameterException extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = altPrio("OTHERS", seq(ParameterName, tok(Dash), ComponentName), ParameterName);
    return seq(name,
               optPrio(seq("=",
                           altPrio(Integer, SimpleFieldChain),
                           optPrio(seq("MESSAGE", Target)))));
  }
}
