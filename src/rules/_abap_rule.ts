import {IRule} from "./_irule";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";
import {Issue} from "../issue";
import {ABAPFile} from "../files";
import {Class} from "../objects";

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

  public run(obj: IObject) {

    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    let abap = obj as ABAPObject;
    let output: Array<Issue> = [];

    if (abap instanceof Class && (abap as Class).isException()) {
      return [];
    }

    for (let file of abap.getParsed()) {
      output = output.concat(this.runParsed(file));
    }

    return output;
  }

}