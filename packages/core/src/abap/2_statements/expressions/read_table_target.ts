import {str, Expression, altPrio, seq, optPrio} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {FSTarget} from "./fstarget";
import {Target} from "./target";

export class ReadTableTarget extends Expression {
  public getRunnable(): IStatementRunnable {

    const target = altPrio(seq(str("ASSIGNING"), new FSTarget()),
                           seq(optPrio(str("REFERENCE")), str("INTO"), new Target()),
                           str("TRANSPORTING NO FIELDS"));

    return target;
  }
}