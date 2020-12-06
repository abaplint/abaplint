import {IStatement} from "./_statement";
import {verNot, seqs, opt, per} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GetDataset implements IStatement {

  public getMatcher(): IStatementRunnable {
    const position = seqs("POSITION", Target);
    const attr = seqs("ATTRIBUTES", Target);

    const ret = seqs("GET DATASET",
                     Target,
                     opt(per(position, attr)));

    return verNot(Version.Cloud, ret);
  }

}