import {IStatement} from "./_statement";
import {verNot, seq, alts, stars} from "../combi";
import {Source, Constant, Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallKernel implements IStatement {

  public getMatcher(): IStatementRunnable {

    const field = seq("ID", Source, "FIELD", Source);

    const ret = seq("CALL",
                    alts(Constant, Field),
                    stars(field));

    return verNot(Version.Cloud, ret);
  }

}