import { Statement } from "./statement";
import { Token } from "../tokens/";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let opt = Combi.opt;
let alt = Combi.alt;
let seq = Combi.seq;

export class Append extends Statement {

    public static get_matcher(): Combi.IRunnable {
        let assigning = seq(str("ASSIGNING"), Reuse.field_symbol());
        let reference = seq(str("REFERENCE INTO"), Reuse.target());

        return seq(str("APPEND"),
                   alt(str("INITIAL LINE"), seq(opt(str("LINES OF")), Reuse.source())),
                   str("TO"),
                   Reuse.target(),
                   opt(alt(assigning, reference)));
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