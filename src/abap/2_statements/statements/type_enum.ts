import {IStatement} from "./_statement";
import {str, seq} from "../combi";
import {Value, NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class TypeEnum implements IStatement {

  public getMatcher(): IStatementRunnable {

// it is also possible to define without Value, this is covered by normal type
    const ret = seq(str("TYPES"), new NamespaceSimpleName(), new Value());

    return ret;
  }

}