import {Statement} from "./_statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {MacroName} from "../expressions";
import {Version} from "../../version";

export class Define extends Statement {

  public getMatcher(): IRunnable {
    const ret = seq(str("DEFINE"), new MacroName());
    return verNot(Version.Cloud, ret);
  }

}