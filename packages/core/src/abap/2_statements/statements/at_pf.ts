import {IStatement} from "./_statement";
import {regex, seq, verNot} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class AtPF implements IStatement {

  public getMatcher(): IStatementRunnable {
    return verNot(Version.Cloud, seq("AT", regex(/^PF\d\d?$/i)));
  }

}