import File from "./file";
import * as Rules from "./rules/";

export default class Runner {

    public static run(files: Array<File>) {
        for (let file of files) {
            this.analyze(file);
        }
    }

    private static analyze(file: File) {

// TODO, some easier way to call all the Rules

        let check01 = new Rules.Check01();
        check01.run(file);

        let check02 = new Rules.Check02();
        check02.run(file);

        let check03 = new Rules.Check03();
        check03.run(file);

        let check04 = new Rules.Check04();
        check04.run(file);

        let check05 = new Rules.Check05();
        check05.run(file);

        let check06 = new Rules.Check06();
        check06.run(file);

        let check07 = new Rules.Check07();
        check07.run(file);

        let check08 = new Rules.Check08();
        check08.run(file);

        let check09 = new Rules.Check09();
        check09.run(file);

        let check10 = new Rules.Check10();
        check10.run(file);

        let check11 = new Rules.Check11();
        check11.run(file);

        let check12 = new Rules.Check12();
        check12.run(file);
    }
}