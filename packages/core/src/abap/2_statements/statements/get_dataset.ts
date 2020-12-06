import {IStatement} from "./_statement";
import {verNot, seq, opt, per} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GetDataset implements IStatement {

  public getMatcher(): IStatementRunnable {
    const position = seq("POSITION", Target);
    const attr = seq("ATTRIBUTES", Target);

    const ret = seq("GET DATASET",
                    Target,
                    opt(per(position, attr)));

    return verNot(Version.Cloud, ret);
  }

}