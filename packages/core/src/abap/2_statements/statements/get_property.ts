import {IStatement} from "./_statement";
import {verNot, str, seqs, opt} from "../combi";
import {Source, ParameterListS, FieldSub} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GetProperty implements IStatement {

  public getMatcher(): IStatementRunnable {
    const exporting = seqs("EXPORTING", ParameterListS);

    const ret = seqs("GET PROPERTY OF",
                     FieldSub,
                     Source,
                     "=",
                     Source,
                     opt(str("NO FLUSH")),
                     opt(exporting));

    return verNot(Version.Cloud, ret);
  }

}