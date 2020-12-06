import {IStatement} from "./_statement";
import {seqs, alts, optPrios} from "../combi";
import {NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ClassDataEnd implements IStatement {

  public getMatcher(): IStatementRunnable {

    const common = seqs("COMMON PART", optPrios(NamespaceSimpleName));

    const structure = seqs("END OF",
                           alts(common, NamespaceSimpleName));

    return seqs("CLASS-DATA", structure);
  }

}