import {seq, optPrio, altPrio, Expression, ver, plusPrio} from "../combi";
import {ParameterListT, ParameterListExceptions, Field} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {ParameterName} from "./parameter_name";
import {Source} from "./source";
import {Version} from "../../../version";
import {SimpleSource3} from "./simple_source3";

export class FunctionParameters extends Expression {
  public getRunnable(): IStatementRunnable {

    const s = altPrio(ver(Version.v740sp02, Source), SimpleSource3);
    const exp = plusPrio(seq(ParameterName, "=", s));

    const exporting = seq("EXPORTING", exp);
    const importing = seq("IMPORTING", ParameterListT);
    const changing = seq("CHANGING", ParameterListT);
    const tables = seq("TABLES", ParameterListT);
    const exceptions = seq("EXCEPTIONS", optPrio(altPrio(ParameterListExceptions, Field)));
    const long = seq(optPrio(exporting),
                     optPrio(importing),
                     optPrio(tables),
                     optPrio(changing),
                     optPrio(exceptions));

    return long;
  }
}