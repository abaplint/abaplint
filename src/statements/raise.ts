import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";
import {Version} from "../../src/version";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;
let ver = Combi.ver;
let plus = Combi.plus;

export class Raise extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let wit  = seq(str("WITH"), plus(new Reuse.Source()));

    let mess1 = seq(str("ID"), new Reuse.Source(), str("TYPE"), new Reuse.Source(), str("NUMBER"), new Reuse.Source());
    let mess2 = seq(new Reuse.Field(), str("("), new Reuse.Field(), str(")"));

    let mess = seq(str("MESSAGE"),
                   alt(mess1, mess2),
                   opt(wit));

    let exporting = seq(str("EXPORTING"), new Reuse.ParameterListS());

    let clas = seq(opt(str("RESUMABLE")),
                   str("EXCEPTION"),
                   opt(str("TYPE")),
                   new Reuse.Source(),
                   opt(alt(exporting, ver(Version.v750, mess))));

    return seq(str("RAISE"), alt(new Reuse.Field(), clas));
  }

}