import {IRule} from "./rule";
import {ParsedFile} from "../file";

export class GenericErrorConf {
  public enabled: boolean = true;
}

export class GenericError implements IRule {

  private conf = new GenericErrorConf();
  private text: string;

  public constructor(text: string) {
    this.text = text;
  }

  public getKey(): string {
    return "generic";
  }

  public getDescription(): string {
    return this.text;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf) {
    this.conf = conf;
  }

  public run(_file: ParsedFile) {
    return [];
  }

}