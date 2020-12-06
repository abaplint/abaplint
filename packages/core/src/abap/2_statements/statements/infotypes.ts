import {IStatement} from "./_statement";
import {verNot, seqs, optPrios} from "../combi";
import {Constant} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Infotypes implements IStatement {

  public getMatcher(): IStatementRunnable {
    const occurs = seqs("OCCURS", Constant);

    const ret = seqs("INFOTYPES", Constant, optPrios(occurs));

    return verNot(Version.Cloud, ret);
  }

}