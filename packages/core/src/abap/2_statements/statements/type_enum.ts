import {IStatement} from "./_statement";
import {seq} from "../combi";
import {Value, NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class TypeEnum implements IStatement {

  public getMatcher(): IStatementRunnable {

// it is also possible to define without Value, this is covered by normal type
    const ret = seq("TYPES", NamespaceSimpleName, Value);

    return ret;
  }

}