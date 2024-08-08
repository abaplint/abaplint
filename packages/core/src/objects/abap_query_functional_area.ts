import {AbstractObject} from "./_abstract_object";

export class ABAPQueryFunctionalArea extends AbstractObject {

  public getType(): string {
    return "AQSG";
  }

  public getAllowedNaming() {
    return {
      maxLength: 60, // todo
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}
