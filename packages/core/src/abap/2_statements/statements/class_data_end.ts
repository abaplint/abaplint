import {IStatement} from "./_statement";
import {seq, alts, optPrios} from "../combi";
import {NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ClassDataEnd implements IStatement {

  public getMatcher(): IStatementRunnable {

    const common = seq("COMMON PART", optPrios(NamespaceSimpleName));

    const structure = seq("END OF",
                          alts(common, NamespaceSimpleName));

    return seq("CLASS-DATA", structure);
  }

}