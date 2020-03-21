import {IStatement} from "./_statement";
import {verNot, str, seq, opt} from "../combi";
import {Source, ParameterListS, FieldSub} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GetProperty implements IStatement {

  public getMatcher(): IStatementRunnable {
    const exporting = seq(str("EXPORTING"), new ParameterListS());

    const ret = seq(str("GET PROPERTY OF"),
                    new FieldSub(),
                    new Source(),
                    str("="),
                    new Source(),
                    opt(str("NO FLUSH")),
                    opt(exporting));

    return verNot(Version.Cloud, ret);
  }

}