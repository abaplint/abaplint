import {tok, ver, Expression, IRunnable} from "../combi";
import {StringTemplate as tString} from "../tokens/";
import {Version} from "../../version";

export class StringTemplate extends Expression {
  public getRunnable(): IRunnable {
    return ver(Version.v702, tok(tString));
  }
}