import {IStatement} from "./_statement";
import {verNot, seq, plus} from "../combi";
import {Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class FieldGroup implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("FIELD-GROUPS", plus(Field));

    return verNot(Version.Cloud, ret);
  }

}