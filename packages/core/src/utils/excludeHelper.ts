export class ExcludeHelper {

  public static isExcluded(filename: string, excludePatterns: RegExp[]): boolean {
    for (const exclude of excludePatterns) {
      if (exclude.exec(filename)) {
        return true;
      }
    }

    return false;
  }

}