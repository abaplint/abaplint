import {Statement} from "./statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {MacroName} from "../expressions";
import {Version} from "../../version";

export class Define extends Statement {

  public get_matcher(): IRunnable {
    let ret = seq(str("DEFINE"), new MacroName());
    return verNot(Version.Cloud, ret);
  }

}