import {IStatement} from "./_statement";
import {seq, optPrios, altPrios, pers} from "../combi";
import {Target, ParameterListS, ParameterListExceptions, Source, ClassName, Dynamic} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class CreateObject implements IStatement {

  public getMatcher(): IStatementRunnable {
    const exporting = seq("EXPORTING", ParameterListS);
    const exceptions = seq("EXCEPTIONS", ParameterListExceptions);
    const table = seq("PARAMETER-TABLE", Source);
    const area = seq("AREA HANDLE", Source);
    const type = seq("TYPE", altPrios(ClassName, Dynamic));

    const ret = seq("CREATE OBJECT",
                    Target,
                    optPrios(pers(type, area)),
                    optPrios(altPrios(exporting, table)),
                    optPrios(exceptions));

    return ret;
  }

}