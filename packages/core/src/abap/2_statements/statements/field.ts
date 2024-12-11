import {IStatement} from "./_statement";
import {verNot, seq, opt} from "../combi";
import {FieldSub, FormName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Field implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("FIELD", FieldSub, "MODULE", FormName, opt("ON INPUT"));

    return verNot(Version.Cloud, ret);
  }

}