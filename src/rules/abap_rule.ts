import {IRule} from "./_rule";
import {Object} from "../objects/_object";
import {ABAPObject} from "../objects/_abap_object";
import {Issue} from "../issue";
import {ABAPFile} from "../files";

export abstract class ABAPRule implements IRule {

  public abstract getKey(): string;
  public abstract getDescription(): string;
  public abstract getConfig(): void;
  public abstract setConfig(conf: any): void;

  public getMessage(_number: number) {
// quick fix for introducing getMessage method
    return this.getDescription();
  }

  public abstract runParsed(file: ABAPFile): Array<Issue>;

  public run(obj: Object) {

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