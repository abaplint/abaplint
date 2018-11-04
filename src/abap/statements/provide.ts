import {Statement} from "./_statement";
import {str, verNot, seq, IRunnable, plus} from "../combi";
import {Field, Source, Target} from "../expressions";
import {Version} from "../../version";

export class Provide extends Statement {

  public getMatcher(): IRunnable {

    let list = str("*");

    let fields = seq(str("FIELDS"),
                     list,
                     str("FROM"),
                     new Source(),
                     str("INTO"),
                     new Target(),
                     str("VALID"),
                     new Field(),
                     str("BOUNDS"),
                     new Field(),
                     str("AND"),
                     new Field());

    let ret = seq(str("PROVIDE"),
                  plus(fields),
                  str("BETWEEN"),
                  new Field(),
                  str("AND"),
                  new Field());

    return verNot(Version.Cloud, ret);
  }

}