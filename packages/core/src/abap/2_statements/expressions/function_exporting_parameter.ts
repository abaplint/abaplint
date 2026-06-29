import {seq, altPrio, Expression, ver, AlsoIn} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {ParameterName} from "./parameter_name";
import {Source} from "./source";
import {Release} from "../../../version";
import {SimpleSource3} from "./simple_source3";

export class FunctionExportingParameter extends Expression {
  public getRunnable(): IStatementRunnable {

    const s = altPrio(ver(Release.v740sp02, Source, {also: AlsoIn.OpenABAP}), SimpleSource3);
    const exp = seq(ParameterName, "=", s);

    return exp;
  }
}