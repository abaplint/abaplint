import {IStatement} from "./_statement";
import {verNot, str, seq} from "../combi";
import {MethodSource, MethodCallBody} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallBadi implements IStatement {

  public getMatcher(): IStatementRunnable {

    const call = seq(str("CALL"),
                     str("BADI"),
                     new MethodSource(),
                     new MethodCallBody());

    return verNot(Version.Cloud, call);
  }

}