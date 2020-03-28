import {AbstractObject} from "./_abstract_object";

export class GatewayVocabularyAnnotation extends AbstractObject {

  public getType(): string {
    return "IWVB";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }
}