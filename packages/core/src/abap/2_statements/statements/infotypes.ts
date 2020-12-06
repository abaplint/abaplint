import {IStatement} from "./_statement";
import {verNot, seqs, optPrio} from "../combi";
import {Constant} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Infotypes implements IStatement {

  public getMatcher(): IStatementRunnable {
    const occurs = seqs("OCCURS", Constant);

    const ret = seqs("INFOTYPES", Constant, optPrio(occurs));

    return verNot(Version.Cloud, ret);
  }

}