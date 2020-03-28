import {IStatement} from "./_statement";
import {verNot, str, seq, opt, per} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GetDataset implements IStatement {

  public getMatcher(): IStatementRunnable {
    const position = seq(str("POSITION"), new Target());
    const attr = seq(str("ATTRIBUTES"), new Target());

    const ret = seq(str("GET DATASET"),
                    new Target(),
                    opt(per(position, attr)));

    return verNot(Version.Cloud, ret);
  }

}