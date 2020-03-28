import {IStatement} from "./_statement";
import {str, seq, verNot} from "../combi";
import {Version} from "../../../version";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class AddCorresponding implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("ADD-CORRESPONDING"),
                    new Source(),
                    str("TO"),
                    new Target());

    return verNot(Version.Cloud, ret);
  }

}