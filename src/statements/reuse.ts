import * as Combi from "../combi";

let reg = Combi.regex;
let seq = Combi.seq;
let alt = Combi.alt;
let star = Combi.star;

export default class Reuse {
    public static integer(): Combi.IRunnable {
        return reg(/^\d+$/);
    }

    public static typename(): Combi.IRunnable {
        return seq(reg(/^\w+$/), star(seq(reg(/^(->|=>|-)$/), reg(/^\w+$/))));
    }

    public static field_symbol(): Combi.IRunnable {
        return reg(/^<(\w|_)+>?$/);
    }

    public static target(): Combi.IRunnable {
        return seq(alt(this.field(), this.field_symbol()), star(seq(reg(/^(->|=>|-)$/), this.field())));
    }

    public static source(): Combi.IRunnable {
        return reg(/^(\w+((->|=>|-)\w+)?)|'.*'|<\w+>$/);
    }

    public static field(): Combi.IRunnable {
        return reg(/^\w+$/);
    }

    public static constant(): Combi.IRunnable {
        return reg(/^\w+$/);
    }
}