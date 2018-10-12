import {Statement} from "./statement";
import {verNot, str, seq, opt, alt, IRunnable} from "../combi";
import {Source, Field, TypeName} from "../expressions";
import {Version} from "../../version";

export class IncludeType extends Statement {

  public get_matcher(): IRunnable {
    let tas = seq(str("AS"), new Field());

    let renaming = seq(str("RENAMING WITH SUFFIX"), new Source());

    let ret = seq(str("INCLUDE"),
                  alt(str("TYPE"), str("STRUCTURE")),
                  new TypeName(),
                  opt(tas),
                  opt(renaming));

    return verNot(Version.Cloud, ret);
  }

}