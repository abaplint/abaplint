import {IRule} from ".";
import {ABAPObject} from "../objects";
import {Issue} from "../issue";
import {ParsedFile} from "../file";

export abstract class ABAPRule implements IRule {

  public abstract getKey(): string;
  public abstract getDescription(): string;
  public abstract getConfig();
  public abstract setConfig(conf);

  public abstract runParsed(file: ParsedFile);

  public run(obj) {

    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    let abap = obj as ABAPObject;
    let output: Array<Issue> = [];

    for (let file of abap.getParsed()) {
      output = output.concat(this.runParsed(file));
    }

    return output;
  }

}