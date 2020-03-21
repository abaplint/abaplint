import {IStatement} from "./_statement";
import {str, seq, IStatementRunnable} from "../combi";
import {NamespaceSimpleName} from "../expressions";

export class TypeBegin implements IStatement {

  public getMatcher(): IStatementRunnable {

    const ret = seq(str("TYPES"), str("BEGIN OF"), new NamespaceSimpleName());

    return ret;
  }

}