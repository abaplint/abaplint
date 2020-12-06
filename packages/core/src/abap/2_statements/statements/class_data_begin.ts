import {IStatement} from "./_statement";
import {seqs, opts} from "../combi";
import {Integer, NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ClassDataBegin implements IStatement {

  public getMatcher(): IStatementRunnable {

    const occurs = seqs("OCCURS", Integer);

    const structure = seqs("BEGIN OF",
                           opts("COMMON PART"),
                           NamespaceSimpleName,
                           opts("READ-ONLY"),
                           opts(occurs));

    return seqs("CLASS-DATA", structure);
  }

}