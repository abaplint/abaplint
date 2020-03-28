import {IStatement} from "./_statement";
import {verNot, str, seq, opt} from "../combi";
import {Target, Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Compute implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("COMPUTE"),
                    opt(str("EXACT")),
                    new Target(),
                    str("="),
                    new Source());

    return verNot(Version.Cloud, ret);
  }

}