import {AbstractObject} from "./_abstract_object";
import {Issue} from "../issue";
import {Position} from "../position";

export class UnknownObject extends AbstractObject {
  private readonly type: string;

  public constructor(name: string, type: string) {
    super(name);
    this.type = type;
  }

  public getType(): string {
    return this.type;
  }

  public getAllowedNaming() {
    return {
      maxLength: 100,
      allowNamespace: true,
    };
  }

  public getIssues() {
    const issue = new Issue({
      filename: this.getFiles()[0]?.getFilename(),
      message: "Unknown object type, add/change fielname eg zclass.clas.abap or zprogram.prog.abap",
      start: new Position(1, 1),
      end: new Position(1, 1),
      key: "registry_add"});

    return [issue];
  }

}