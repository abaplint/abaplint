import {IStatement} from "./_statement";
import {verNot, seqs, opts, pers} from "../combi";
import {Target} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class GetDataset implements IStatement {

  public getMatcher(): IStatementRunnable {
    const position = seqs("POSITION", Target);
    const attr = seqs("ATTRIBUTES", Target);

    const ret = seqs("GET DATASET",
                     Target,
                     opts(pers(position, attr)));

    return verNot(Version.Cloud, ret);
  }

}