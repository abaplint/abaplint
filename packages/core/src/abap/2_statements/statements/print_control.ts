import {IStatement} from "./_statement";
import {verNot, alt, seq} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class PrintControl implements IStatement {

  public getMatcher(): IStatementRunnable {
    const index = seq("INDEX-LINE", Source);
    const func = seq("FUNCTION", Source);

    const ret = seq("PRINT-CONTROL", alt(index, func));

    return verNot(Version.Cloud, ret);
  }

}