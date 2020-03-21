import {IStatement} from "./_statement";
import {verNot, str, alt, seq, IStatementRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";

export class PrintControl implements IStatement {

  public getMatcher(): IStatementRunnable {
    const index = seq(str("INDEX-LINE"), new Source());
    const func = seq(str("FUNCTION"), new Source());

    const ret = seq(str("PRINT-CONTROL"), alt(index, func));

    return verNot(Version.Cloud, ret);
  }

}