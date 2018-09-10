import {Statement} from "./statement";
import {Version} from "../version";
import {str, seq, opt, alt, ver, plus, IRunnable} from "../combi";
import * as Reuse from "./reuse";

export class InterfaceDef extends Statement {

  public static get_matcher(): IRunnable {
    let val = seq(new Reuse.Field(), str("="), new Reuse.Source());

    let dataValues = seq(str("DATA VALUES"),
                         plus(val));

    let options = alt(seq(str("ABSTRACT METHODS"), plus(new Reuse.Field())),
                      seq(str("FINAL METHODS"), plus(new Reuse.Field())),
                      str("ALL METHODS ABSTRACT"),
                      str("ALL METHODS FINAL"),
                      ver(Version.v740sp02, str("PARTIALLY IMPLEMENTED")));

    return seq(str("INTERFACES"),
               new Reuse.Field(),
               opt(options),
               opt(dataValues));
  }

}