import * as Combi from "../combi";

let reg = Combi.regex;
let seq = Combi.seq;
let alt = Combi.alt;
let str = Combi.str;
let re = Combi.reuse;
let star = Combi.star;

export default class Reuse {
    public static integer(): Combi.IRunnable {
        return reg(/^\d+$/);
    }

    public static typename(): Combi.IRunnable {
        return seq(reg(/^(\/\w+\/)?\w+$/),
                   star(seq(reg(/^(->|=>|-)$/), reg(/^\w+$/))));
    }

    public static field_symbol(): Combi.IRunnable {
        return reg(/^<(\w|_)+>?$/);
    }

    public static target(): Combi.IRunnable {
        let data = seq(str("DATA"), str("("), this.field(), str(")"));
        return re(alt(data,
                      seq(alt(this.field(), this.field_symbol()),
                          star(seq(reg(/^(->|=>|-)$/), this.field())))),
                  "target");
    }

    public static source(): Combi.IRunnable {
        return re(alt(this.integer(),
                      reg(/^'.*'$/),
                      seq(alt(this.field(),
                              this.field_symbol()),
                          star(seq(reg(/^(->|=>|-)$/), this.field())))),
                  "source");
    }

    public static boolean(): Combi.IRunnable {
        return re(star(reg(/.*/)), "boolean");
    }

    public static field(): Combi.IRunnable {
        return reg(/^\w+$/);
    }

    public static constant(): Combi.IRunnable {
        return reg(/^\w+$/);
    }
}