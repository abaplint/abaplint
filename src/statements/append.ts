import { Statement } from "./statement";
import { Token } from "../tokens/";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let opt = Combi.opt;
let alt = Combi.alt;
let seq = Combi.seq;
let reg = Combi.regex;
let star = Combi.star;

export class Append extends Statement {

    public static get_matcher(): Combi.IRunnable {
        return seq(str("APPEND"),
                   alt(str("INITIAL LINE"), seq(opt(str("LINES OF")), star(reg(/.*/)))),
                   str("TO"),
                   Reuse.target(),
                   opt(seq(str("ASSIGNING"), Reuse.field_symbol())));
    }

    public static match(tokens: Array<Token>): Statement {
        let result = Combi.Combi.run(this.get_matcher( ), tokens, true);
        if (result === true) {
            return new Append(tokens);
        } else {
            return undefined;
        }
    }

}