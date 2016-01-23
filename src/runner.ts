import File from "./file";
import * as Checks from "./checks/";

export default class Runner {

    public static run(files: Array<File>) {
        for (let file of files) {
            this.analyze(file);
        }
    }

    private static analyze(file: File) {

// TODO, some easier way to call all the checks

        let check01 = new Checks.Check01();
        check01.run(file);

        let check02 = new Checks.Check02();
        check02.run(file);

        let check03 = new Checks.Check03();
        check03.run(file);

        let check04 = new Checks.Check04();
        check04.run(file);

        let check05 = new Checks.Check05();
        check05.run(file);

        let check06 = new Checks.Check06();
        check06.run(file);

        let check07 = new Checks.Check07();
        check07.run(file);

        let check08 = new Checks.Check08();
        check08.run(file);

        let check09 = new Checks.Check09();
        check09.run(file);

        let check10 = new Checks.Check10();
        check10.run(file);

        let check11 = new Checks.Check11();
        check11.run(file);

        let check12 = new Checks.Check12();
        check12.run(file);
    }
}