import {IStatement} from "./_statement";
import {seq} from "../combi";
import {NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class TypeBegin implements IStatement {

  public getMatcher(): IStatementRunnable {

    const ret = seq("TYPES", "BEGIN OF", NamespaceSimpleName);

    return ret;
  }

}