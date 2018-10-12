import {Statement} from "./statement";
import {verNot, str, seq, per, IRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class SetCursor extends Statement {

  public getMatcher(): IRunnable {
    let line = seq(str("LINE"), new Source());
    let offset = seq(str("OFFSET"), new Source());
    let field = seq(str("FIELD"), new Source());
    let pos = seq(new Source(), new Source());
    let ret = seq(str("SET CURSOR"), per(pos, field, offset, line));
    return verNot(Version.Cloud, ret);
  }

}