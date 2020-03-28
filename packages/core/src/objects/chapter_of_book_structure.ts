import {AbstractObject} from "./_abstract_object";

export class ChapterOfBookStructure extends AbstractObject {

  public getType(): string {
    return "DSYS";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}