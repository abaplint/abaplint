import { Statement } from "./statement";
import * as Combi from "../combi";
import Reuse from "./reuse";

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
                         opt(seq(str("TITLE"), Reuse.source())));
    let endBlock = seq(str("END OF BLOCK"), blockName);

    let beginScreen = seq(str("BEGIN OF SCREEN"),
                          Reuse.integer(),
                          opt(str("AS SUBSCREEN")),
                          opt(seq(str("TITLE"), Reuse.source())));

    let endScreen = seq(str("END OF SCREEN"), Reuse.integer());

    let beginLine = str("BEGIN OF LINE");
    let endLine = str("END OF LINE");

    let comment = seq(str("COMMENT"),
                      opt(reg(/^\/?\d+$/)),
                      str("("),
                      Reuse.integer(),
                      str(")"),
                      opt(Reuse.source()),
                      opt(seq(str("FOR FIELD"), Reuse.field())),
                      opt(seq(str("MODIF ID"), Reuse.field())));

    let func = seq(str("FUNCTION KEY"), Reuse.integer());

    let skip = seq(str("SKIP"), opt(Reuse.integer()));

    let pos = seq(str("POSITION"), Reuse.integer());

    let incl = seq(str("INCLUDE BLOCKS"), blockName);

    let tabbed = seq(str("BEGIN OF TABBED BLOCK"), Reuse.field(), str("FOR"), Reuse.integer(), str("LINES"));

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