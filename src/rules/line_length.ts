import { IRule } from "./rule";
import File from "../file";
import Issue from "../issue";
import Position from "../position";

export class LineLengthConf {
  public enabled: boolean = true;
  public length: number = 120;
}

export class LineLength implements IRule {

  private conf = new LineLengthConf();

  public getKey(): string {
    return "line_length";
  }

  public getDescription(): string {
    return "Reduce line length";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf) {
    this.conf = conf;
  }

  public run(file: File) {
    let lines = file.getRaw().split("\n");
    for (let line = 0; line < lines.length; line++) {
      if (lines[line].length > this.conf.length) {
        let issue = new Issue(this, new Position(line + 1, 1), file);
        file.add(issue);
      }
    }
  }

}