declare module '*.module.css' {

  // CSS Module type definitions with commonly used class names
  const styles: {
    readonly [key: string]: string;
    readonly columnsContainer: string;
    readonly container: string;
    readonly centered: string;
    readonly start: string;
    readonly end: string;
    readonly row: string;
    readonly column: string;
    readonly flatRow: string;
    readonly visible: string;
    readonly hidden: string;
    readonly lineColumn: string;
  }

  export default styles
}