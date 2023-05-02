import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { ExcelQuestions } from '../../interfaces/excel-questions';
import { QuestionData } from '../../interfaces/question-data';
import { CheckboxChoices } from '../../interfaces/checkbox-choices';
import { QuestionDataHelper } from 'src/app/interfaces/question-data-helper';
type LabelMap = {
  [key:string]: string;
}
const Q10Alabels: LabelMap = {
  'Q10Ar1': "Manque de disponibilité",
  'Q10Ar2': "Trop d'efforts",
  'Q10Ar3': "Trop d'efforts",
  'Q10Ar4': "Trop d'efforts",
  'Q10Ar5': 'Ne connais pas assez',
  'Q10Ar6': 'Ne connais pas assez',
  'Q10Ar7': "Trop d'efforts",
  'Q10Ar8': "Insatisfait de l'offre",
  'Q10Ar9': "Insatisfait de l'offre",
  'Q10Ar10': "Par souci d'hygiène",
  'Q10Ar11': "Par souci d'hygiène",
  'Q10Ar12': "Par souci d'hygiène",
  'Q10Ar13': "Par souci d'hygiène",
  'Q10Ar14': 'Trop coûteux',
  'Q10Ar15': "Manque d'information sur les produits",
  'Q10Ar16': "Trop d'efforts",
  'Q10Ar17': "Insatisfait de l'offre",
  'Q10Ar18': "Appréciation des emballages",
  'Q10Ar19': 'Trop coûteux',
  'Q10Ar20': "Pas besoin de grande quantité",
  'Q10Ar96': 'Autre'
};

const Q10Blabels: LabelMap = {
  'Q10Br1': "Je souhaite protéger l'environnement",
  'Q10Br2': "Je souhaite réduire ma facture d'épicerie",
  'Q10Br3': "Je souhaite acheter des produits qui sont bons pour la santé",
  'Q10Br4': "Je souhaite protéger l'environnement",
  'Q10Br5': "Cette option est disponible proche de chez moi",
  'Q10Br6': "Je souhaite réduire ma facture d'épicerie",
  'Q10Br7': "Je souhaite protéger l'environnement",
  'Q10Br8': "Je souhaite protéger l'environnement",
  'Q10Br9': "Je souhaite protéger l'environnement",
  'Q10Br96': 'Autres (préciser)',
  'Q10Br97': "Aucune raison en particulier / je ne suis pas intéressé(e)"
};


@Injectable({
  providedIn: 'root'
})
export class PreprocessService {

  excelData:any[] = [];
  excelQuestions: any[] = [];
  processedExcelQuestions: ExcelQuestions[] = [];
  questionsList: string[] = [];
  formattedQuestions: ExcelQuestions[] = [];

  constructor(private http: HttpClient) {
  }

  /**
 * Saves the data from the excel file excelPageDonnees
 */
  async readExcelData(): Promise<void> {
    this.http.get('assets/data/excelPageDonnees.xlsx', {responseType: 'arraybuffer'})
      .subscribe(response => {
        const data: any = new Uint8Array(response);
        const workbook: XLSX.WorkBook = XLSX.read(data, {type: 'array'});
        const sheetName: string = workbook.SheetNames[0];
        const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];
        const excelData: any[] = XLSX.utils.sheet_to_json(worksheet, {raw: true});
        this.excelData = excelData;

      });
  }

  /**
 * Saves the questions from the excel file excelPageQuestions
 */
  async readExcelQuestions(): Promise<void> {
    this.http.get('assets/data/excelPageQuestions.xlsx', {responseType: 'arraybuffer'})
      .subscribe(response => {
        const data: any = new Uint8Array(response);
        const workbook: XLSX.WorkBook = XLSX.read(data, {type: 'array'});
        const sheetName: string = workbook.SheetNames[0];
        const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];
        const excelData: any[] = XLSX.utils.sheet_to_json(worksheet, {raw: true});
        this.excelQuestions = excelData;
        this.processQuestions();
        this.formatQuestions();
        console.log(this.processedExcelQuestions)
        console.log(this.formattedQuestions);
      });
  }

  /**
 * Processes the excel questions so that they are in an easier format to handle
 */
  processQuestions(): void {
    for(let i = 0; i < this.excelQuestions.length; i++){
      if(!this.excelQuestions[i]["__EMPTY"] && !this.excelQuestions[i]["__EMPTY_1"]){
        let excelQuestion: ExcelQuestions = {
          "symbol": "",
          "question": "",
          "choices": new Map() 
        };

        excelQuestion.symbol = this.excelQuestions[i]["Livre de codes"];

        let j = i + 2;
        let splitQuestion = this.excelQuestions[j]["__EMPTY_1"].split(":");
        for(let k = 1; k < splitQuestion.length; k++){
          excelQuestion.question += splitQuestion[k];
          if(k < splitQuestion.length - 1){
            excelQuestion.question += " : "
          }
        }
        excelQuestion.question = excelQuestion.question.trim();
        const length = excelQuestion.question.length;
        if(excelQuestion.question[length - 1] == ':'){
          excelQuestion.question = excelQuestion.question.substring(0, length - 2);
        }

        j++;

        if(this.excelQuestions[j]){
          while((this.excelQuestions[j]["__EMPTY"] || this.excelQuestions[j]["__EMPTY_1"]) && this.excelQuestions[j]["__EMPTY"] != 'Système'){
            excelQuestion.choices.set(parseInt(this.excelQuestions[j]["__EMPTY"]), this.excelQuestions[j]["__EMPTY_1"]);
            j++;
          }
        }
        

        excelQuestion = this.fixSpecificQuestions(excelQuestion);
        this.processedExcelQuestions.push(excelQuestion);

        i = j-1;
      }
    }
  }

  /**
 * Checks if the question is an environmental question that we have to show
 *
 * @param {string} symbol The symbol to analyze
 * @returns {boolean} True if it is one and false if it isn't
 */
  isEnvironmentalQuestion(symbol:string): boolean{
    for(let i = 2; i <= 18; i++){
      let correctLetters: string = 'Q' + i;
      if(correctLetters != 'Q12' && symbol.includes(correctLetters)){
        return true;
      }
    }
    return false;
  }

  /**
 * Formats the excel questions so that they are in an better format to show to the user
 */
  formatQuestions(){
    for(let i = 0; i < this.processedExcelQuestions.length; i++){
      let excelQuestion: ExcelQuestions = {
        "symbol": "",
        "question": "",
        "choices": new Map() 
      };

      if(this.isEnvironmentalQuestion(this.processedExcelQuestions[i].symbol)){
        if(this.isNoToQuestion(this.processedExcelQuestions[i])){
          let pair = this.fixNoToQuestions(i);
          excelQuestion = pair[0];
          i = pair[1];
        } else if(this.processedExcelQuestions[i].symbol.includes('r')) {
          let pair = this.fixSameThemeQuestions(i);
          excelQuestion = pair[0];
          i = pair[1];
        } else {
          excelQuestion = this.processedExcelQuestions[i];
        }
        excelQuestion.savedSymbol = this.processedExcelQuestions[i].symbol;
        this.formattedQuestions.push(excelQuestion);
        this.questionsList.push(excelQuestion.question);
      }
    }
  }

  /**
 * Checks if the question is an NO TO question
 *
 * @param {ExcelQuestions} question The question to analyze
 * @returns {boolean} True if it is one and false if it isn't
 */
  isNoToQuestion(question: ExcelQuestions): boolean {
    if(question.choices.get(0) && question.choices.get(0)?.includes('NO TO')){
      return true;
    }
    return false;
  }

  /**
 * Formats the NO TO excel questions so that they are in an better format to show to the user
 * 
 * @param {number} i Index of the question to analyze
 * @returns {[ExcelQuestions, number]} The new excel question with the index needed to continue the formatting
 */
  fixNoToQuestions(i: number) : [ExcelQuestions, number] {
    let excelQuestion: ExcelQuestions = {
      "symbol": "",
      "question": "",
      "choices": new Map() 
    };
    let splitQuestion = this.processedExcelQuestions[i].question.split('-');
    for(let k = 1; k < splitQuestion.length; k++){
      excelQuestion.question += splitQuestion[k];
      if(k < splitQuestion.length - 1){
        excelQuestion.question += "-"
      }
    }
    excelQuestion.question = excelQuestion.question.substring(1);
    
    let symbolStart = this.processedExcelQuestions[i].symbol.substring(0, this.processedExcelQuestions[i].symbol.indexOf('r'));
    excelQuestion.symbol = this.processedExcelQuestions[i].symbol.replace('r','n');
    
    let j = 0;
    while(this.processedExcelQuestions[i] && this.processedExcelQuestions[i].symbol.includes(symbolStart)){
      for(let choice of this.processedExcelQuestions[i].choices.entries()){
        if(choice[0] != 0){
          excelQuestion.choices.set(j, choice[1]);
        }
      }
      j++;
      i++;
    }

    return [excelQuestion, i-1];
  }

  /**
 * Formats the same theme excel questions so that they are in an better format to show to the user
 * 
 * @param {number} i Index of the question to analyze
 * @returns {[ExcelQuestions, number]} The new excel question with the index needed to continue the formatting
 */
  fixSameThemeQuestions(i: number) : [ExcelQuestions, number] {
    let excelQuestion: ExcelQuestions = {
      "symbol": "",
      "question": "",
      "choices": new Map() 
    };
    let splitQuestion = this.processedExcelQuestions[i].question.split('-');
    for(let k = 1; k < splitQuestion.length; k++){
      excelQuestion.question += splitQuestion[k];
      if(k < splitQuestion.length - 1){
        excelQuestion.question += "-"
      }
    }
    excelQuestion.question = excelQuestion.question.substring(1);
    
    let symbolStart = this.processedExcelQuestions[i].symbol.substring(0, this.processedExcelQuestions[i].symbol.indexOf('r'));
    excelQuestion.symbol = this.processedExcelQuestions[i].symbol;

    let j = 0;
    while(this.processedExcelQuestions[i] && this.processedExcelQuestions[i].symbol.includes(symbolStart)){
      excelQuestion.choices.set(j, this.processedExcelQuestions[i].question);
      i++;
      j++;
    }

    return [excelQuestion, i-1];
  }

  /**
 * Gets the data of the user that was chosen
 *
 * @param {boolean} man The sex of the user that has been chosen
 * @returns {*} The data of the user
 */
  getUserData(man:boolean){
    let data;
    if(man){
      data = this.excelData.find((row) => {
        return row.record == 100;
      });
    } else {
      data = this.excelData.find((row) => {
        return row.record == 69;
      });
    }
    return data;
  }

  /**
 * Gets the data for a normal question with the user's parameters
 *
 * @param {string} questionName The name of the question to get
 * @param {*} user The data of the user that has been chosen
 * @param {CheckboxChoices} checkboxChoices The parameter choices of the user
 * @returns {QuestionDataHelper} The data of the question
 */
  getQuestionData(questionName:string, user: any, checkboxChoices: CheckboxChoices) : QuestionDataHelper {
    let questionDataHelper:QuestionDataHelper = {
      questionData: [],
      sumOfValues: 0
    };
    if(questionName == 'could not find subQuestion' || questionName == 'could not find question'){
      return questionDataHelper;
    }

    let data:QuestionData[] = [];

    const question = this.processedExcelQuestions.find((question) => {
      return question.question == questionName;
    });

    if(!question){
      return questionDataHelper;
    }

    question.choices.forEach((choice) => {
      data.push({
        "label": choice,
        "value": 0
      })
    })

    let labelData: Map<number,number> = this.getLabelData(question, user, checkboxChoices);


    let sumOfValues: number = 0;
    for(let value of labelData.values()){
      sumOfValues += value;
    }

    for(let entry of labelData.entries()){
      for(let i = 0; i < data.length; i++){
        if(data[i].label == question.choices.get(entry[0])){
          data[i].value = (entry[1] / sumOfValues) * 100;
        }
      }
    }
    questionDataHelper.questionData = data;
    questionDataHelper.sumOfValues = sumOfValues;
    return questionDataHelper;
  }

  /**
 * Gets all data for a question with the user's parameters
 *
 * @param {ExcelQuestions} question The question to fetch
 * @param {*} user The data of the user that has been chosen
 * @param {CheckboxChoices} checkboxChoices The parameter choices of the user
 * @returns {Map<number, number>} The data of the question <choice index, value>
 */
  getLabelData(question: ExcelQuestions, user: any, checkboxChoices: CheckboxChoices): Map<number,number> {
    let labelData: Map<number,number> = new Map<number, number>();
    if(question){
      const symbol = question.symbol;
      this.excelData.forEach((row) => {
        if(row[symbol] && this.checkForChecks(row, user, checkboxChoices)){
          if(labelData.has(row[symbol])){
            let currentValue = labelData.get(row[symbol])!;
            labelData.set(row[symbol], currentValue + 1);
          } else{
            labelData.set(row[symbol], 1);
          }
        }
      })
    }
    return labelData;
  } 

  /**
 * Checks if the row corresponds to the user choice if the user checked that box
 *
 * @param {*} row The row to compare the user to
 * @param {*} user The data of the user that has been chosen
 * @param {CheckboxChoices} checkboxChoices The parameter choices of the user
 * @returns {boolean} True if the row is in line with the user and false if it isn't
 */
  checkForChecks(row: any, user: any, checkboxChoices: CheckboxChoices): boolean {
    if(checkboxChoices.myAge && !this.checkIfSameSituation(row, user, 'age')){
      return false;
    }
    if(checkboxChoices.myCivilState && !this.checkIfSameSituation(row, user, 'ETAT')){
      return false;
    }
    if(checkboxChoices.myGender && !this.checkIfSameSituation(row, user, 'sexe')){
      return false;
    }
    if(checkboxChoices.myLanguage && !this.checkIfSameSituation(row, user, 'LANGU')){
      return false;
    }
    if(checkboxChoices.myMoney && !this.checkIfSameSituation(row, user, 'REVEN')){
      return false;
    }
    if(checkboxChoices.myProvince && !this.checkIfSameSituation(row, user, 'PROV')){
      return false;
    }
    if(checkboxChoices.myScolarity && !this.checkIfSameSituation(row, user, 'SCOL')){
      return false;
    }
    if(checkboxChoices.myCitySize && !this.checkIfSameSituation(row, user, 'COL')){
      return false;
    }
    return true;
  }

  /**
 * Checks if the row's column corresponds to the user's column
 *
 * @param {*} row The row to compare the user to
 * @param {*} user The data of the user that has been chosen
 * @param {string} situation The chosen column to compare the user and the row to
 * @returns {boolean} True if the row is in the same situation as the user and false if it isn't
 */
  checkIfSameSituation(row: any, user: any, situation:string) : boolean{
    return row[situation] == user[situation];
  }

  /**
 * Gets the formatted symbol with a question's name
 *
 * @param {string} questionName The name of the question
 * @returns {string} The question's symbol
 */
  getFormattedSymbolWithQuestion(questionName: string): string{
    const question = this.formattedQuestions.find((question) => {
      return question.question == questionName
    });
    if(question){
      return question.symbol;
    } 
    return 'unknown question';
  }

  /**
 * Gets the questions that have the same theme as the symbol
 *
 * @param {string} symbol The symbol of the questions
 * @returns {string} The name of all sub questions that are linked by the theme
 */
  getThemeQuestions(symbol: string): string[] {
    let themeQuestions: string[] = [];
    this.processedExcelQuestions.forEach((question) => {
      if(this.isEnvironmentalQuestion(question.symbol) && question.symbol.includes('r') && !this.isNoToQuestion(question)){
        let symbolStart = question.symbol.substring(0, question.symbol.indexOf('r'));
        if(symbol.includes(symbolStart)){
          themeQuestions.push(question.question);
        }
      }
    })
    for(let i = 0; i < themeQuestions.length; i++){
      themeQuestions[i] = themeQuestions[i].split(' - ')[0];
    }
    return themeQuestions;
  }

  /**
 * Gets the data for a NO TO question with the user's parameters
 *
 * @param {string} symbolStart The start of the symbol of the questions to get
 * @param {*} user The data of the user that has been chosen
 * @param {CheckboxChoices} checkboxChoices The parameter choices of the user
 * @returns {QuestionDataHelper} The data of the question
 */
  getNoToQuestionData(symbolStart: string, user: any, checkboxChoices: CheckboxChoices): QuestionDataHelper {
    let questions: ExcelQuestions[] = [];
    this.processedExcelQuestions.forEach((question) => {
      if(this.isEnvironmentalQuestion(question.symbol) && question.symbol.includes(symbolStart)){
        questions.push(question);
      }
    })

    let questionDataList:QuestionData[] = [];
    let sumOfValues = 0;
    if(symbolStart.includes('Q10')){
      questionDataList = this.initializeQ10QuestionData(symbolStart);
    } else {
      questions.forEach((question) => {
        questionDataList.push({
          "label": question.question.split(' - ')[0],
          "value": 0
        })
      })
    }
    questions.forEach((question) => {
      let labelData: Map<number, number> = this.getLabelData(question, user, checkboxChoices);
      if(labelData.size >= 1){
        for(let data of labelData.values()){
          sumOfValues += data;
          if(symbolStart.includes('Q10')){
            questionDataList[this.findQ10index(questionDataList, question.symbol)].value += data;
          } else {
            for(let i = 0; i < questionDataList.length; i++){
              if(questionDataList[i].label == question.question.split(' - ')[0]){
                questionDataList[i].value = data;
              }
            }
          }
        }
      }
    })

    
    
    for(let i = 0; i < questionDataList.length; i++){
      if(sumOfValues != 0){
        questionDataList[i].value = (questionDataList[i].value / sumOfValues) * 100;
      }
    }
    let questionDataHelper:QuestionDataHelper = {
      questionData: [],
      sumOfValues: 0
    };
    questionDataHelper.questionData = questionDataList;
    questionDataHelper.sumOfValues = sumOfValues;
    return questionDataHelper;
  }
  
  /**
 * Initializes the question data for question 10
 *
 * @param {string} symbolStart The start of the symbol of the questions to get
 * @returns {QuestionData[]} The inital data of the question
 */
  initializeQ10QuestionData(symbolStart:string): QuestionData[] {
    let questionData: QuestionData[] = [];
    const choices: string[] = this.getQ10Choices(symbolStart);
    for(let choice of choices){
      questionData.push({
        label: choice,
        value: 0
      })
    }
    return questionData;
  }

  /**
 * Gets the index of the data list where the Q10 question is
 *
 * @param {QuestionData[]} questionDataList The list of data that we're analyzing
 * @param {sting} symbol The symbol of the question we're looking for
 * @returns {number} The index of the question
 */
  findQ10index(questionDataList: QuestionData[], symbol: string): number {
    let label = '';
    if(symbol.includes('Q10A')){
      label = Q10Alabels[symbol]
    } else {
      label = Q10Blabels[symbol]
    }

    for(let i = 0; i < questionDataList.length; i++){
      if(questionDataList[i].label == label){
        return i;
      }
    }
    return -1;
  }

  /**
 * Gets the real name of a subquestion with it's formatted question and subquestion
 *
 * @param {string} selectedQuestion The formatted envelopping question
 * @param {sting} subQuestion The formatted subquestion
 * @returns {number} The name of the subquestion
 */
  getSubQuestionRealName(selectedQuestion:string, subQuestion: string): string {
    const question = this.formattedQuestions.find((question) => {
      return question.question == selectedQuestion;
    })
    if(question){
      for (let value of question.choices.values()) {
        if(value.split(' - ')[0] == subQuestion){
          return value;
        }
      }
      return 'could not find subQuestion';
    }
    return 'could not find question';
  }

  /**
 * Gets the symbol of the question that the user answered using the formatted question name 
 *
 * @param {string} questionName The formatted envelopping question
 * @param {*} user The user data
 * @returns {string} The symbol of the question
 */
  getUserProcessedSymbolWithFormattedQuestion(questionName: string, user: any): string {
    const question = this.formattedQuestions.find((question) => {
      return question.question == questionName
    });

    if(question){
      if(user[question.savedSymbol!] != 0){
        return this.processedExcelQuestions.find((processedQuestion) => {
          return processedQuestion.symbol == question.savedSymbol
        })?.symbol!;
      } else {
        let symbolStart = question.savedSymbol!.substring(0, question.savedSymbol!.indexOf('r'));
        return this.processedExcelQuestions.find((processedQuestion) => {
          return (processedQuestion.symbol.includes(symbolStart) && user[processedQuestion.symbol] != 0)
        })?.symbol!;
      }
    } 
    return 'Unknown Question';
  }

  /**
 * Gets the processed symbol of the question using the processed question name 
 *
 * @param {string} questionName The formatted envelopping question
 * @returns {string} The symbol of the question
 */
  getProcessedSymbolWithSubQuestionName(questionName: string): string{
    const question = this.processedExcelQuestions.find((question) => {
      return question.question == questionName
    });
    return question? question.symbol: 'unknown question'
  }

  /**
 * Gets the choice name of a certain value
 *
 * @param {string} symbol The processed symbol of the question
 * @param {number} value The value of the choice
 * @returns {string} The choice name
 */
  getChoiceFromData(symbol: string, value: number) : string{
    const question = this.processedExcelQuestions.find((question) => {
      return question.symbol == symbol;
    })
    if(question){
      if(symbol.includes('Q10A')){
        return Q10Alabels[symbol];
      } else if(symbol.includes('Q10B')){
        return Q10Blabels[symbol];
      }
      return question.choices.get(value)!;
    }
    return 'Unknown Question';
  }

  /**
 * Gets all possible choices for a Q10 question
 *
 * @param {string} symbol The symbol of the question
 * @returns {string[]} All possible choices for that Q10 question
 */
  getQ10Choices(symbol:string): string[] {
    if(symbol.includes('Q10A')){
      return this.getQ10AChoices();
    }
    return this.getQ10BChoices();
  }

  /**
 * Gets all possible choices for a Q10A
 *
 * @returns {string[]} All possible choices for Q10A
 */
  getQ10AChoices(): string[] {
    return ['Manque de disponibilité',"Trop d'efforts",'Trop coûteux','Ne connais pas assez',
    "Insatisfait de l'offre", "Par souci d'hygiène", "Manque d'information sur les produits",
    "Appréciation des emballages", "Pas besoin de grande quantité", "Autre"];
  }

  /**
 * Gets all possible choices for a Q10B
 *
 * @returns {string[]} All possible choices for Q10B
 */
  getQ10BChoices(): string[] {
    return ["Je souhaite protéger l'environnement","Je souhaite réduire ma facture d'épicerie","Je souhaite acheter des produits qui sont bons pour la santé",
    "Cette option est disponible proche de chez moi",'Autres (préciser)',"Aucune raison en particulier / je ne suis pas intéressé(e)"];
  }

  /**
 * Repairs the choices of specific questions
 *
 * @param {ExcelQuestions} oldQuestion The question to be repaired
 * @returns {ExcelQuestions} The repaired question
 */
  fixSpecificQuestions(oldQuestion:ExcelQuestions): ExcelQuestions {
    let newQuestion: ExcelQuestions = {
      symbol: oldQuestion.symbol,
      question: oldQuestion.question,
      choices: oldQuestion.choices
    }
    if(newQuestion.symbol.includes('Q13')){
      const choicesList = ["Plus prioritaire","Moyennement prioritaire","Minimalement prioritaire","Moins prioritaire"]
      let choices: Map<number,string> = new Map();
      for(let i = 0; i < choicesList.length; i++){
        choices.set(i + 1, choicesList[i]);
      }
      newQuestion.choices = choices;
    } else if (newQuestion.symbol == 'age'){
      newQuestion.choices.delete(1);
    }
    return newQuestion;
  }

  /**
 * Gets the questions that have to be shown on the wall
 *
 * @returns {ExcelQuestions[]} The questions to be shown
 */
  getClientWallQuestions(): ExcelQuestions[] {
    let questions: ExcelQuestions[] = []
    const vrac = this.formattedQuestions.find((question) => {
      return question.symbol == 'Q5n1'
    })!;
    questions.push(vrac);
    questions.push(vrac);
    questions.push(this.formattedQuestions.find((question) => {
      return question.symbol == 'Q10An1'
    })!);
    questions.push(vrac);
    questions.push(vrac);
    questions.push(this.formattedQuestions.find((question) => {
      return question.symbol == 'Q8r1'
    })!);
    questions.push(this.formattedQuestions.find((question) => {
      return question.symbol == 'Q3n1'
    })!);
    return questions;
  }

  /**
 * Changes Q5 data into a Yes or No data
 *
 * @param {QuestionDataHelper} questionData The data to analyse
 * @returns {QuestionDataHelper} The Yes or No data
 */
  getYesOrNoQ5Data(questionData: QuestionDataHelper): QuestionDataHelper{
    let newQuestionDataHelper: QuestionDataHelper = {
      questionData: [],
      sumOfValues: 0
    }
    newQuestionDataHelper.questionData.push({
      label: 'Oui',
      value: questionData.questionData[0].value + questionData.questionData[1].value + questionData.questionData[2].value
    });
    newQuestionDataHelper.questionData.push({
      label: 'Non',
      value: questionData.questionData[3].value + questionData.questionData[4].value + questionData.questionData[5].value
    });
    newQuestionDataHelper.sumOfValues = questionData.sumOfValues;
    return newQuestionDataHelper;
  }

  /**
 * Gets all rows that answered i as their vehicule of choice
 *
 * @param {number} vehiculeNumber The vehicule answer
 * @returns {any[]} The vehicule rows
 */
  getVehiculeRows(vehiculeNumber: number): any[] {
    let rows: any[] = [];
    this.excelData.forEach((row) => {
      if(row['Q3r' + vehiculeNumber] == 1){
        rows.push(row)
      }
    })
    return rows;
  }

  /**
 * Separates an array of rows into two arrays with one that has all rows that do vrac and the other has the contrary
 *
 * @param {any[]} totalRows All rows
 * @returns {any[]} Both arrays
 */
  getVracRows(totalRows: any[]): any[] {
    let vracRows: any[] = [];
    let nonVracRows: any[] = [];
    totalRows.forEach((row) => {
      if(row['Q5r1'] == 1 || row['Q5r2'] == 2 || row['Q5r3'] == 3){
        vracRows.push(row)
      } else {
        nonVracRows.push(row);
      }
    })
    return [vracRows, nonVracRows];
  }

  /**
 * Gets the percentage of answers that answered yes to the Q18r2 question.
 *
 * @param {any[]} totalRows All rows
 * @returns {number} Percentage of yes
 */
  getInfiniteResourcesValue(totalRows: any[]): number {
    let infinites: number = 0;
    let noninfinites: number = 0;
    totalRows.forEach((row) => {
      if(row['Q18r2'] == 4 || row['Q18r2'] == 5){
        infinites++;
      } else if (row['Q18r2'] == 1 || row['Q18r2'] == 2){
        noninfinites++;
      }
    })
    return (infinites/(infinites + noninfinites));
  }
  
}
