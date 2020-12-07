import {IStatement} from "./_statement";
import {seq, alt, optPrio} from "../combi";
import {NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ClassDataEnd implements IStatement {

  public getMatcher(): IStatementRunnable {

    const common = seq("COMMON PART", optPrio(NamespaceSimpleName));

    const structure = seq("END OF",
                          alt(common, NamespaceSimpleName));

    return seq("CLASS-DATA", structure);
  }

}