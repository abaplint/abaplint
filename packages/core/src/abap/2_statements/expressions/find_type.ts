import {Release} from "../../../version";
import {alt, ver, opt, Expression, AlsoIn} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class FindType extends Expression {
  public getRunnable(): IStatementRunnable {
    return opt(alt("REGEX", "SUBSTRING", ver(Release.v755, "PCRE", {also: AlsoIn.OpenABAP})));
  }
}