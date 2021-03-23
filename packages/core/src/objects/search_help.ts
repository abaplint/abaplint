import {AbstractObject} from "./_abstract_object";

export class SearchHelp extends AbstractObject {

  public getType(): string {
    return "SHLP";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}