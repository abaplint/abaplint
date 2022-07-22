import {seq, altPrio, Expression, ver} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {ParameterName} from "./parameter_name";
import {Source} from "./source";
import {Version} from "../../../version";
import {SimpleSource3} from "./simple_source3";

export class FunctionExportingParameter extends Expression {
  public getRunnable(): IStatementRunnable {

    const s = altPrio(SimpleSource3, ver(Version.v740sp02, Source));
    const exp = seq(ParameterName, "=", s);

    return exp;
  }
}