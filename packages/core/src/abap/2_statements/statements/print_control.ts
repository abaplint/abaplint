import {IStatement} from "./_statement";
import {verNot, alt, seqs} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class PrintControl implements IStatement {

  public getMatcher(): IStatementRunnable {
    const index = seqs("INDEX-LINE", Source);
    const func = seqs("FUNCTION", Source);

    const ret = seqs("PRINT-CONTROL", alt(index, func));

    return verNot(Version.Cloud, ret);
  }

}