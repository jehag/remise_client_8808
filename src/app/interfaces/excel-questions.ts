export interface ExcelQuestions {
    symbol: string,
    savedSymbol?: string,
    question: string,
    choices: Map<number, string>
}
