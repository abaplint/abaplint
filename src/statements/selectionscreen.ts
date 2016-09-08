import { Statement } from "./statement";
import * as Combi from "../combi";
import * as Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;
let reg = Combi.regex;

export class SelectionScreen extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let blockName = reg(/^\w+$/);

    let beginBlock = seq(str("BEGIN OF BLOCK"),
                         blockName,
                         opt(str("WITH FRAME")),
                         opt(seq(str("TITLE"), new Reuse.Source())));
    let endBlock = seq(str("END OF BLOCK"), blockName);

    let beginScreen = seq(str("BEGIN OF SCREEN"),
                          new Reuse.Integer(),
                          opt(str("AS SUBSCREEN")),
                          opt(seq(str("TITLE"), new Reuse.Source())));

    let endScreen = seq(str("END OF SCREEN"), new Reuse.Integer());

    let beginLine = str("BEGIN OF LINE");
    let endLine = str("END OF LINE");

    let comment = seq(str("COMMENT"),
                      opt(reg(/^\/?\d+$/)),
                      str("("),
                      new Reuse.Integer(),
                      str(")"),
                      opt(new Reuse.Source()),
                      opt(seq(str("FOR FIELD"), new Reuse.Field())),
                      opt(seq(str("MODIF ID"), new Reuse.Field())));

    let func = seq(str("FUNCTION KEY"), new Reuse.Integer());

    let skip = seq(str("SKIP"), opt(new Reuse.Integer()));

    let pos = seq(str("POSITION"), new Reuse.Integer());

    let incl = seq(str("INCLUDE BLOCKS"), blockName);

    let tabbed = seq(str("BEGIN OF TABBED BLOCK"),
                     new Reuse.Field(),
                     str("FOR"),
                     new Reuse.Integer(),
                     str("LINES"));

    let ret = seq(str("SELECTION-SCREEN"),
                  alt(comment,
                      func,
                      skip,
                      pos,
                      incl,
                      beginBlock,
                      tabbed,
                      endBlock,
                      beginLine,
                      endLine,
                      beginScreen,
                      endScreen));

    return ret;
  }

}