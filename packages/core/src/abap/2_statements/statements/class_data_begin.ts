import {IStatement} from "./_statement";
import {str, seqs, opt} from "../combi";
import {Integer, NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ClassDataBegin implements IStatement {

  public getMatcher(): IStatementRunnable {

    const occurs = seqs("OCCURS", Integer);

    const structure = seqs("BEGIN OF",
                           opt(str("COMMON PART")),
                           NamespaceSimpleName,
                           opt(str("READ-ONLY")),
                           opt(occurs));

    return seqs("CLASS-DATA", structure);
  }

}