import File from "../file";

export class Summary {

    public static output(files: Array<File>): string {
        let result = "";

        for (let file of files) {
            if (file.get_issues().length > 0) {
                result = result + file.get_filename() + "\t" + file.get_issues().length + " issue(s)\n";
            }
        }
        return result;
    }

}