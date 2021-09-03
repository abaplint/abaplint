import {seq, altPrio, Expression, ver, plusPrio} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {ParameterName} from "./parameter_name";
import {Source} from "./source";
import {Version} from "../../../version";
import {SimpleSource3} from "./simple_source3";

export class FunctionExporting extends Expression {
  public getRunnable(): IStatementRunnable {

    const s = altPrio(ver(Version.v740sp02, Source), SimpleSource3);
    const exp = plusPrio(seq(ParameterName, "=", s));

    return exp;
  }
}