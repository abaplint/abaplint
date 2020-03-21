import {IStatement} from "./_statement";
import {str, seq} from "../combi";
import {NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class TypeBegin implements IStatement {

  public getMatcher(): IStatementRunnable {

    const ret = seq(str("TYPES"), str("BEGIN OF"), new NamespaceSimpleName());

    return ret;
  }

}