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
                         opt(seq(str("WITH FRAME"), opt(seq(str("TITLE"), Reuse.source())))));
    let endBlock = seq(str("END OF BLOCK"), blockName);

    let beginScreen = seq(str("BEGIN OF SCREEN"), Reuse.integer());
    let endScreen = seq(str("END OF SCREEN"), Reuse.integer());

    let beginLine = str("BEGIN OF LINE");
    let endLine = str("END OF LINE");

    let comment = seq(str("COMMENT"),
                      opt(reg(/^\/?\d+$/)),
                      str("("),
                      Reuse.integer(),
                      str(")"),
                      Reuse.source(),
                      opt(seq(str("FOR FIELD"), Reuse.field())));

    let func = seq(str("FUNCTION KEY"), Reuse.integer());

    let skip = seq(str("SKIP"), Reuse.integer());

    let pos = seq(str("POSITION"), Reuse.integer());

    let ret = seq(str("SELECTION-SCREEN"),
                  alt(comment,
                      func,
                      skip,
                      pos,
                      beginBlock,
                      endBlock,
                      beginLine,
                      endLine,
                      beginScreen,
                      endScreen));

    return ret;
  }

}