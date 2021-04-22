import {IStatement} from "./_statement";
import {seq, ver} from "../combi";
import {Value, NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class TypeEnum implements IStatement {

  public getMatcher(): IStatementRunnable {

// it is also possible to define without Value, this is covered by normal type
    const ret = ver(Version.v751, seq("TYPES", NamespaceSimpleName, Value));

    return ret;
  }

}