import {tok, ver, Expression, IStatementRunnable} from "../combi";
import {StringTemplate as tString} from "../tokens/";
import {Version} from "../../version";

export class StringTemplate extends Expression {
  public getRunnable(): IStatementRunnable {
    return ver(Version.v702, tok(tString));
  }
}