import {IStatement} from "./_statement";
import {verNot, seq, pers, opt} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GetCursor implements IStatement {

  public getMatcher(): IStatementRunnable {
    const line = seq("LINE", Target);
    const field = seq("FIELD", Target);
    const offset = seq("OFFSET", Target);
    const value = seq("VALUE", Target);
    const length = seq("LENGTH", Target);
    const area = seq("AREA", Target);

    const ret = seq("GET CURSOR",
                    pers(line, opt("DISPLAY"), field, offset, value, length, area));

    return verNot(Version.Cloud, ret);
  }

}