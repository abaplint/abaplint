import {IStatement} from "./_statement";
import {str, seq, opt, alt, per} from "../combi";
import {Target, ParameterListS, ParameterListExceptions, Source, ClassName, Dynamic} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class CreateObject implements IStatement {

  public getMatcher(): IStatementRunnable {
    const exporting = seq(str("EXPORTING"), new ParameterListS());
    const exceptions = seq(str("EXCEPTIONS"), new ParameterListExceptions());
    const table = seq(str("PARAMETER-TABLE"), new Source());
    const area = seq(str("AREA HANDLE"), new Source());
    const type = seq(str("TYPE"), alt(new ClassName(), new Dynamic()));

    const ret = seq(str("CREATE OBJECT"),
                    new Target(),
                    opt(per(type, area)),
                    opt(alt(exporting, table)),
                    opt(exceptions));

    return ret;
  }

}