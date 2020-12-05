import {IStatement} from "./_statement";
import {verNot, seqs} from "../combi";
import {MethodSource, MethodCallBody} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class CallBadi implements IStatement {

  public getMatcher(): IStatementRunnable {

    const call = seqs("CALL",
                      "BADI",
                      MethodSource,
                      MethodCallBody);

    return verNot(Version.Cloud, call);
  }

}