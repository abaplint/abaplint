import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let per = Combi.per;

export class CreateObject extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let exporting = seq(str("EXPORTING"), new Reuse.ParameterListS());
    let exceptions = seq(str("EXCEPTIONS"), new Reuse.ParameterListExceptions());
    let table = seq(str("PARAMETER-TABLE"), new Reuse.Source());
    let area = seq(str("AREA HANDLE"), new Reuse.Source());
    let type = seq(str("TYPE"), alt(new Reuse.ClassName(), new Reuse.Dynamic()));

    let ret = seq(str("CREATE OBJECT"),
                  new Reuse.Target(),
                  opt(per(type, area)),
                  opt(alt(exporting, table)),
                  opt(exceptions));

    return ret;
  }

}