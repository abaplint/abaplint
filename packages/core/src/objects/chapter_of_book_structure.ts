import {AbstractObject} from "./_abstract_object";

export class ChapterOfBookStructure extends AbstractObject {

  public getType(): string {
    return "DSYS";
  }

  public getAllowedNaming() {
    return {
      maxLength: 40,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}
