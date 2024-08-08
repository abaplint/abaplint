import {IStatement} from "./_statement";
import {verNot, seq, opt} from "../combi";
import {Source, SimpleName, SimpleFieldChain2} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Ranges implements IStatement {

  public getMatcher(): IStatementRunnable {
    const occurs = seq("OCCURS", Source);

    const ret = seq("RANGES",
                    SimpleName,
                    "FOR",
                    SimpleFieldChain2,
                    opt(occurs));

    return verNot(Version.Cloud, ret);
  }

}