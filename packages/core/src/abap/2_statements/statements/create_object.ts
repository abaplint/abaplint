import {IStatement} from "./_statement";
import {str, seq, optPrio, altPrio, per} from "../combi";
import {Target, ParameterListS, ParameterListExceptions, Source, ClassName, Dynamic} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class CreateObject implements IStatement {

  public getMatcher(): IStatementRunnable {
    const exporting = seq(str("EXPORTING"), new ParameterListS());
    const exceptions = seq(str("EXCEPTIONS"), new ParameterListExceptions());
    const table = seq(str("PARAMETER-TABLE"), new Source());
    const area = seq(str("AREA HANDLE"), new Source());
    const type = seq(str("TYPE"), altPrio(new ClassName(), new Dynamic()));

    const ret = seq(str("CREATE OBJECT"),
                    new Target(),
                    optPrio(per(type, area)),
                    optPrio(altPrio(exporting, table)),
                    optPrio(exceptions));

    return ret;
  }

}