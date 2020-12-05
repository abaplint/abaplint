import {IStatement} from "./_statement";
import {verNot, seqs, plus} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {NamespaceSimpleName} from "../expressions/namespace_simple_name";

export class Enhancement implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seqs("ENHANCEMENT", plus(new NamespaceSimpleName()));

    return verNot(Version.Cloud, ret);
  }

}