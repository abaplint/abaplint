import {IStatement} from "./_statement";
import {verNot, str, seq, per, opt, plus} from "../combi";
import {Target, Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Get implements IStatement {

  public getMatcher(): IStatementRunnable {
    const fields = seq(str("FIELDS"), plus(new Field()));

    const options = per(str("LATE"), fields);

    const ret = seq(str("GET"),
                    new Target(),
                    opt(options));

    return verNot(Version.Cloud, ret);
  }

}