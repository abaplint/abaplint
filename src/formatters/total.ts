import File from "../file";

export class Total {

    public static output(files: Array<File>): string {
        let count = 0;
        files.forEach((file) => { count = count + file.get_issues().length; });

        return "abaplint: " + count + " issue(s) found\n";
    }

}