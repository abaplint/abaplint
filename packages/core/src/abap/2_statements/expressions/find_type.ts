import {Version} from "../../../version";
import {alt, ver, opt, Expression} from "../combi";
import {IStatementRunnable} from "../statement_runnable";

export class FindType extends Expression {
  public getRunnable(): IStatementRunnable {
    return opt(alt("REGEX", "SUBSTRING", ver(Version.v755, "PCRE", Version.OpenABAP)));
  }
}