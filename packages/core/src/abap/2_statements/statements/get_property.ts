import {IStatement} from "./_statement";
import {verNot, seq, opt} from "../combi";
import {Source, ParameterListS, FieldSub} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GetProperty implements IStatement {

  public getMatcher(): IStatementRunnable {
    const exporting = seq("EXPORTING", ParameterListS);

    const ret = seq("GET PROPERTY OF",
                    FieldSub,
                    Source,
                    "=",
                    Source,
                    opt("NO FLUSH"),
                    opt(exporting));

    return verNot(Version.Cloud, ret);
  }

}