import {IStatement} from "./_statement";
import {seq, opts} from "../combi";
import {Integer, NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ClassDataBegin implements IStatement {

  public getMatcher(): IStatementRunnable {

    const occurs = seq("OCCURS", Integer);

    const structure = seq("BEGIN OF",
                          opts("COMMON PART"),
                          NamespaceSimpleName,
                          opts("READ-ONLY"),
                          opts(occurs));

    return seq("CLASS-DATA", structure);
  }

}