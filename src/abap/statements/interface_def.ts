import {Statement} from "./statement";
import {Version} from "../../version";
import {str, seq, opt, alt, ver, plus, IRunnable} from "../combi";
import {Source, Field} from "../expressions";

export class InterfaceDef extends Statement {

  public getMatcher(): IRunnable {
    let val = seq(new Field(), str("="), new Source());

    let dataValues = seq(str("DATA VALUES"),
                         plus(val));

    let options = alt(seq(str("ABSTRACT METHODS"), plus(new Field())),
                      seq(str("FINAL METHODS"), plus(new Field())),
                      str("ALL METHODS ABSTRACT"),
                      str("ALL METHODS FINAL"),
                      ver(Version.v740sp02, str("PARTIALLY IMPLEMENTED")));

    return seq(str("INTERFACES"),
               new Field(),
               opt(options),
               opt(dataValues));
  }

}