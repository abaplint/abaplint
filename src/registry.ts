
export default class Registry {

    private static macros: Array<string> = [];

// todo, handle scoping
    public static add_macro(name: string) {
        this.macros.push(name.toUpperCase());
    }

    public static is_macro(name: string): boolean {
        for (let mac of this.macros) {
            if (mac === name.toUpperCase()) {
                return true;
            }
        }
        return false;
    }

}