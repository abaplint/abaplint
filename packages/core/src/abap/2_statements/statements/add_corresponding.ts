import {IStatement} from "./_statement";
import {seq, verNot} from "../combi";
import {Version} from "../../../version";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class AddCorresponding implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("ADD-CORRESPONDING",
                    Source,
                    "TO",
                    Target);

    return verNot(Version.Cloud, ret);
  }

}