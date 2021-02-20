import {IStatement} from "./_statement";
import {seq, optPrio, altPrio, per} from "../combi";
import {Target, ParameterListS, ParameterListExceptions, Source, ClassName, Dynamic} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class CreateObject implements IStatement {

  public getMatcher(): IStatementRunnable {
    const exporting = seq("EXPORTING", ParameterListS);
    const exceptions = seq("EXCEPTIONS", ParameterListExceptions);
    const ptable = seq("PARAMETER-TABLE", Source);
    const etable = seq("EXCEPTION-TABLE", Source);
    const area = seq("AREA HANDLE", Source);
    const type = seq("TYPE", altPrio(ClassName, Dynamic));

    const ret = seq("CREATE OBJECT",
                    Target,
                    optPrio(per(type, area)),
                    optPrio(altPrio(exporting, ptable)),
                    optPrio(altPrio(exceptions, etable)));

    return ret;
  }

}