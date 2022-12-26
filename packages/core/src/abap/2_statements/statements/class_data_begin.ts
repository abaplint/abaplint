import {IStatement} from "./_statement";
import {seq, optPrio} from "../combi";
import {Integer, NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ClassDataBegin implements IStatement {

  public getMatcher(): IStatementRunnable {

    const occurs = seq("OCCURS", Integer);

    const structure = seq("BEGIN OF",
                          optPrio("COMMON PART"),
                          NamespaceSimpleName,
                          optPrio("READ-ONLY"),
                          optPrio(occurs));

    return seq("CLASS-DATA", structure);
  }

}