import {IStatement} from "./_statement";
import {verNot, seq, opt, alt} from "../combi";
import {FieldSub, FormName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Field implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("FIELD", FieldSub, "MODULE", FormName, opt(alt("ON INPUT", "ON REQUEST")));

    return verNot(Version.Cloud, ret);
  }

}