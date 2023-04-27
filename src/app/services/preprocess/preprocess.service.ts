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

  isEnvironmentalQuestion(symbol:string): boolean{
    for(let i = 2; i <= 18; i++){
      let correctLetters: string = 'Q' + i;
      if(correctLetters != 'Q12' && symbol.includes(correctLetters)){
        return true;
      }
    }
    return false;
  }

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

  isNoToQuestion(question: ExcelQuestions): boolean {
    if(question.choices.get(0) && question.choices.get(0)?.includes('NO TO')){
      return true;
    }
    return false;
  }

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

  checkIfSameSituation(row: any, user: any, situation:string) : boolean{
    return row[situation] == user[situation];
  }

  getFormattedSymbolWithQuestion(questionName: string): string{
    const question = this.formattedQuestions.find((question) => {
      return question.question == questionName
    });
    if(question){
      return question.symbol;
    } 
    return 'unknown question';
  }

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

  getProcessedSymbolWithSubQuestionName(questionName: string): string{
    const question = this.processedExcelQuestions.find((question) => {
      return question.question == questionName
    });
    return question? question.symbol: 'unknown question'
  }

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

  getWallQuestions(): ExcelQuestions[] {
    let wallQuestions: ExcelQuestions[] = [];
    this.formattedQuestions.forEach((question) => {
      if(!question.symbol.includes('r')){
        wallQuestions.push(question);
      } else {
        let themeQuestions: string[] = this.getThemeQuestions(question.symbol);
        for(let themequestion of themeQuestions){
          let newQuestion: ExcelQuestions = {
            question: question.question,
            symbol: question.symbol,
            savedSymbol: question.savedSymbol,
            choices: question.choices
          };
          newQuestion.question = themequestion + ' - ' + newQuestion.question;
          wallQuestions.push(newQuestion);
        }
      }
    })
    return wallQuestions;
  }

  getMostPopularAnswer(questionData: QuestionData[]): string {
    const maxData = questionData.reduce((max: QuestionData, current: QuestionData) =>
      max.value > current.value ? max : current
    );
    if(maxData.value == 0){
      return 'Aucune réponse'
    }
    return maxData.label;
  }

  getQuestionChoices(question: ExcelQuestions): string[] {
    let choices: string[] = [];
    if(question.symbol.includes('n')){
      let symbolStart = question.symbol.substring(0,question.symbol.indexOf('n'));
      if(symbolStart.includes('Q10')){
        choices = this.getQ10Choices(symbolStart);
      } else {
        this.processedExcelQuestions.forEach((processedQuestion) => {
          if(this.isEnvironmentalQuestion(processedQuestion.symbol) && processedQuestion.symbol.includes(symbolStart)){
            choices.push(processedQuestion.question.split(' - ')[0]);
          }
        })
      }
    } else if(question.symbol.includes('r')){
      let questionName: string = '';
      let questionStart: string = question.question.split(' - ')[0].trim();
      for(let choice of question.choices.values()){
        if(choice.includes(questionStart)){
          questionName = choice;
        }
      }
      
      const subQuestion = this.processedExcelQuestions.find((processedQuestion) => {
        return processedQuestion.question == questionName;
      })
      
      for(let choice of subQuestion!.choices.values()){
        choices.push(choice);
      }

    } else {
      for(let choice of question.choices.values()){
        choices.push(choice);
      }
    }
    return choices;
  }

  getQ10Choices(symbol:string): string[] {
    if(symbol.includes('Q10A')){
      return this.getQ10AChoices();
    }
    return this.getQ10BChoices();
  }

  getQ10AChoices(): string[] {
    return ['Manque de disponibilité',"Trop d'efforts",'Trop coûteux','Ne connais pas assez',
    "Insatisfait de l'offre", "Par souci d'hygiène", "Manque d'information sur les produits",
    "Appréciation des emballages", "Pas besoin de grande quantité", "Autre"];
  }

  getQ10BChoices(): string[] {
    return ["Je souhaite protéger l'environnement","Je souhaite réduire ma facture d'épicerie","Je souhaite acheter des produits qui sont bons pour la santé",
    "Cette option est disponible proche de chez moi",'Autres (préciser)',"Aucune raison en particulier / je ne suis pas intéressé(e)"];
  }

  fixChoices(choicesList:string[]): Map<number,string> {
    let choices: Map<number,string> = new Map();
    for(let i = 0; i < choicesList.length; i++){
      choices.set(i + 1, choicesList[i]);
    }
    return choices;
  }

  fixSpecificQuestions(oldQuestion:ExcelQuestions): ExcelQuestions {
    let newQuestion: ExcelQuestions = {
      symbol: oldQuestion.symbol,
      question: oldQuestion.question,
      choices: oldQuestion.choices
    }
    if(newQuestion.symbol.includes('Q13')){
      newQuestion.choices = this.fixChoices(['Plus prioritaire','Moyennement prioritaire','Minimalement prioritaire','Moins prioritaire']);
    } else if (newQuestion.symbol == 'age'){
      newQuestion.choices.delete(1);
    }
    return newQuestion;
  }

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
    return questions;
  }

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

  getVehiculeRows(vehiculeNumber: number): any[] {
    let rows: any[] = [];
    this.excelData.forEach((row) => {
      if(row['Q3r' + vehiculeNumber] == 1){
        rows.push(row)
      }
    })
    return rows;
  }

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

  getReturnableValue(totalRows: any[]) {
    let returners: number = 0;
    let nonReturners: number = 0;
    totalRows.forEach((row) => {
      if(row['Q15'] == 1 || row['Q15'] == 2){
        returners++;
      } else if(row['Q15'] == 3){
        nonReturners++;
      }
    })
    return (returners/(returners + nonReturners));
  }
  
}
