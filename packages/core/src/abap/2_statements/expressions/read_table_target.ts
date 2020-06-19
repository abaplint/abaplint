import {str, Expression, alt, seq, opt} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {FSTarget} from "./fstarget";
import {Target} from "./target";

export class ReadTableTarget extends Expression {
  public getRunnable(): IStatementRunnable {

    const target = alt(seq(str("ASSIGNING"), new FSTarget()),
                       seq(opt(str("REFERENCE")), str("INTO"), new Target()),
                       str("TRANSPORTING NO FIELDS"));

    return target;
  }
}