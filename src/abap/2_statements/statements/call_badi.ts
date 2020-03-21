import {Statement} from "./_statement";
import {verNot, str, seq, IStatementRunnable} from "../combi";
import {MethodSource, MethodCallBody} from "../expressions";
import {Version} from "../../../version";

export class CallBadi extends Statement {

  public getMatcher(): IStatementRunnable {

    const call = seq(str("CALL"),
                     str("BADI"),
                     new MethodSource(),
                     new MethodCallBody());

    return verNot(Version.Cloud, call);
  }

}