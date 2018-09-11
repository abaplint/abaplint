import {tok, ver, Reuse, IRunnable} from "../combi";
import {StringTemplate as tString} from "../tokens/";
import {Version} from "../version";

export class StringTemplate extends Reuse {
  public get_runnable(): IRunnable {
    return ver(Version.v702, tok(tString));
  }
}