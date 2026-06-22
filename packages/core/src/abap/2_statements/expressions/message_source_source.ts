import {Expression, alt, ver, AlsoIn} from "../combi";
import {Source, SimpleSource3} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {Release} from "../../../version";

export class MessageSourceSource extends Expression {
  public getRunnable(): IStatementRunnable {
    return alt(ver(Release.v740sp02, Source, {also: AlsoIn.OpenABAP}), SimpleSource3);
  }
}