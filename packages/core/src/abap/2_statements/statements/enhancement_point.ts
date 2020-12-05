import {IStatement} from "./_statement";
import {verNot, str, seqs, opt} from "../combi";
import {Field, FieldSub} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class EnhancementPoint implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("ENHANCEMENT-POINT",
                     FieldSub,
                     "SPOTS",
                     Field,
                     opt(str("STATIC")),
                     opt(str("INCLUDE BOUND")));

    return verNot(Version.Cloud, ret);
  }

}