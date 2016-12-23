import { Statement } from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;
let star = Combi.star;

export class SyntaxCheck extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let program = seq(str("PROGRAM"), new Reuse.Target());
    let offset = seq(str("OFFSET"), new Reuse.Target());
    let frame = seq(str("FRAME ENTRY"), new Reuse.Target());
    let include = seq(str("INCLUDE"), new Reuse.Target());
    let line = seq(str("LINE"), new Reuse.Target());
    let word = seq(str("WORD"), new Reuse.Target());
    let messageId = seq(str("MESSAGE-ID"), new Reuse.Target());
    let message = seq(str("MESSAGE"), new Reuse.Target());
    let id = seq(str("ID"), new Reuse.Field(), str("TABLE"), new Reuse.Target());

    let syntax = seq(str("SYNTAX-CHECK FOR"),
                     new Reuse.Source(),
                     str("MESSAGE"),
                     new Reuse.Target(),
                     str("LINE"),
                     new Reuse.Target(),
                     opt(offset),
                     str("WORD"),
                     new Reuse.Target(),
                     opt(program),
                     str("DIRECTORY ENTRY"),
                     new Reuse.Source(),
                     opt(frame),
                     opt(include),
                     opt(messageId),
                     star(id));

    let dynpro = seq(str("SYNTAX-CHECK FOR DYNPRO"),
                     new Reuse.Source(),
                     new Reuse.Source(),
                     new Reuse.Source(),
                     new Reuse.Source(),
                     message,
                     line,
                     word,
                     offset,
                     messageId);

    return alt(syntax, dynpro);
  }

}