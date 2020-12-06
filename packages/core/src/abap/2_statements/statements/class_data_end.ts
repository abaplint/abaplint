import {IStatement} from "./_statement";
import {seqs, alts, optPrio} from "../combi";
import {NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ClassDataEnd implements IStatement {

  public getMatcher(): IStatementRunnable {

    const common = seqs("COMMON PART", optPrio(new NamespaceSimpleName()));

    const structure = seqs("END OF",
                           alts(common, NamespaceSimpleName));

    return seqs("CLASS-DATA", structure);
  }

}