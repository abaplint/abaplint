import {IStatement} from "./_statement";
import {verNot, seq, opt} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class VerificationMessage implements IStatement {

  public getMatcher(): IStatementRunnable {

    const priority = seq("PRIORITY", Source);

    const ret = seq("VERIFICATION-MESSAGE", Source, Source, opt(priority));

    return verNot(Version.Cloud, ret);
  }

}