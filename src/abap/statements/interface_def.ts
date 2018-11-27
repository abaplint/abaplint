import {Statement} from "./_statement";
import {Version} from "../../version";
import {str, seq, opt, alt, ver, plus, IStatementRunnable} from "../combi";
import {Source, Field} from "../expressions";

export class InterfaceDef extends Statement {

  public getMatcher(): IStatementRunnable {
    const val = seq(new Field(), str("="), new Source());

    const dataValues = seq(str("DATA VALUES"),
                           plus(val));

    const options = alt(seq(str("ABSTRACT METHODS"), plus(new Field())),
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