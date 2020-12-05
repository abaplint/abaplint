import {IStatement} from "./_statement";
import {seqs, alt, optPrio} from "../combi";
import {NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ClassDataEnd implements IStatement {

  public getMatcher(): IStatementRunnable {

    const common = seqs("COMMON PART", optPrio(new NamespaceSimpleName()));

    const structure = seqs("END OF",
                           alt(common, new NamespaceSimpleName()));

    return seqs("CLASS-DATA", structure);
  }

}