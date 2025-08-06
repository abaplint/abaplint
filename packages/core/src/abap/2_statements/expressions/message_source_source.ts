import {Expression, alt, ver} from "../combi";
import {Source, SimpleSource3} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class MessageSourceSource extends Expression {
  public getRunnable(): IStatementRunnable {
    return alt(ver(Version.v740sp02, Source), SimpleSource3);
  }
}