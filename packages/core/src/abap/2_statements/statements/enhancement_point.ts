import {IStatement} from "./_statement";
import {verNot, seq, opts} from "../combi";
import {Field, FieldSub} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class EnhancementPoint implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("ENHANCEMENT-POINT",
                    FieldSub,
                    "SPOTS",
                    Field,
                    opts("STATIC"),
                    opts("INCLUDE BOUND"));

    return verNot(Version.Cloud, ret);
  }

}