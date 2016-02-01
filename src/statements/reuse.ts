import * as Combi from "../combi";

let reg  = Combi.regex;

export default class Reuse {
    public static integer(): Combi.IRunnable {
        return reg(/^\d+$/);
    }

    public static typename(): Combi.IRunnable {
        return reg(/^\w+((->|=>|-)\w+)*$/);
    }

    public static field_symbol(): Combi.IRunnable {
        return reg(/^<(\w|_)+>?$/);
    }

    public static target(): Combi.IRunnable {
        return reg(/^\w+((->|=>|-)\w+)*|<\w+>$/);
    }

    public static source(): Combi.IRunnable {
        return reg(/^(\w+((->|=>|-)\w+)?)|'.*'|<\w+>$/);
    }

    public static variable_def(): Combi.IRunnable {
        return reg(/^\w+(\(\d+\))?$/);
    }

    public static constant(): Combi.IRunnable {
        return reg(/^\w+$/);
    }
}