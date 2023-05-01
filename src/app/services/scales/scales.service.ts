import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { QuestionData } from 'src/app/interfaces/question-data';

@Injectable({
  providedIn: 'root'
})
export class ScalesService {

  constructor() { }

  /**
 * Defines the scale used to position the bars
 *
 * @param {number} width The width of the graph
 * @param {object} data The data to be used
 * @returns {*} The linear scale in X
 */
  setXScale (width: number) {
    return d3.scaleLinear().domain([0, 100]).range([0, width]);
  }

  /**
 * Defines the scale used to position the bars
 *
 * @param {number} height The height of the graph
 * @param {QuestionData[]} data The data to be used
 * @returns {*} The band scale in Y
 */
  setYScale (height: number, data: QuestionData[]) {
    return d3.scaleBand().domain(data.map(function(d) { return d.label; })).range([0, height]).padding(0.4);
  }

  /**
 * Defines the scale used to color the bars
 *
 * @param {number} domain The domain of the scale
 * @param {string[]} range The range of the scale
 * @returns {*} The ordinal color scale
 */
  setColorScale (domain: string[], range: string[]) {
    return d3.scaleOrdinal(domain, range);
  }

  /**
 * Defines the scale used to position the bars
 *
 * @param {number} width The width of the graph
 * @param {string[]} data The data to be used
 * @returns {*} The band scale in X
 */
  setTupperwareXScale (width: number, data: string[]) {
    return d3.scaleBand().domain(data).range([0, width]).padding(0.4);
  }

  /**
 * Defines the scale used to position the bars
 *
 * @param {number} height The width of the graph
 * @returns {*} The linear scale in Y
 */
  setTupperwareYScale (height: number) {
    return d3.scaleLinear().domain([0, 100]).range([height, 0]);
  }
}
