import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { Margin } from 'src/app/interfaces/margin';
import { legendColor } from 'd3-svg-legend';
import { QuestionData } from 'src/app/interfaces/question-data';
import { MapDataSetup } from 'src/app/interfaces/map-data-setup';
import { ScalesDataSetup } from 'src/app/interfaces/scales-data-setup';

@Injectable({
  providedIn: 'root'
})
export class VizService {

  constructor() { }

  /**
 * Generates the SVG element g which will contain the graph base.
 *
 * @param {Margin} Margin The margin of the page
 * @param {string} graphClass The name of the class of the graph
 * @returns {*} The d3 Selection for the created g element
 */
  generateG (margin: Margin, graphClass: string) {
    return d3.select(graphClass)
      .select('svg')
      .append('g')
      .attr('transform',
        'translate(' + margin.left + ',' + margin.top + ')')
  }

  /**
 * Sets the size of the SVG canvas containing the graph.
 *
 * @param {number} width The desired width
 * @param {number} height The desired height
 * @param {string} graphId The name of the Id of the graph
 */
  setCanvasSize (width: number, height: number, graphId: string) {
    d3.select(graphId)
      .attr('width', width)
      .attr('height', height)
      .attr("xmlns", "http://www.w3.org/2000/svg")
  }

  /**
 * Appends SVG g elements which will contain the axes.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 */
  appendAxes (g: any) {
    g.append('g')
      .attr('class', 'x axis')
  
    g.append('g')
      .attr('class', 'y axis')
      .style('transform', 'translate(10px, 0px)')
  }

  /**
 * Appends the labels for the x axis
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 */
  appendGraphLabels (g: any) {
    g.append('text')
      .text('Pourcentage (%)')
      .attr('class', 'x axis-text')
      .attr('font-size', 15)
  }

    /**
 * Appends the labels for the x and y axis on the tupperware graph
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 */
  appendTupperwareGraphLabels (g: any) {
    g.append('text')
      .text('Pourcentage (%)')
      .attr('class', 'y axis-text')
      .attr('font-size', 25)

    g.append('text')
      .text("Tranches d'âge")
      .attr('class', 'x axis-text')
      .attr('font-size', 25)
  }

  /**
 * Places the graph's title.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {string} title The name of the graph
 * @param {number} width The width of the graph
 */
  placeTitle (g: any, title: string, width: number) {
    if(title.length > 60){

      let words: string[] = title.split(' ');
      let i: number = 0;
      let j: number = -55;
      while(i <= words.length - 1){
        let line: string = words[i];
        i++;
        while(line.length < 60 && i <= words.length - 1){
          line = line + ' ' + words[i];
          i++;
        }

        if(words[i] && words[i].match(/[.,:!?]/)){
          line += words[i];
          i++;
        }

        g.append('text')
        .attr('class', 'title')
        .attr('x', width/2)
        .attr('y', j)
        .attr('font-size', '20px')
        .attr('text-anchor', 'middle')
        .text(line)
        j = j + 20;
      }
    } else {
      g.append('text')
      .attr('class', 'title')
      .attr('x', width/2)
      .attr('y', -20)
      .attr('font-size', '20px')
      .attr('text-anchor', 'middle')
      .text(title)
    }
  }

  /**
 * Appends the graph's title on the wall.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {string} title The name of the graph
 * @param {number} width The width of the graph
 * @param {number} height The height of the graph
 */
  appendClientWallTitle (g: any, title: string, width: number, height:number = -20) {
    g.append('text')
      .attr('class', 'title')
      .attr('x', width/2)
      .attr('y', height)
      .style('font-size', '40px')
      .style('font-weight', 'bold')
      .style('text-anchor', 'middle')
      .style('margin-bottom', '30px')
      .style('line-height', '50px')
      .text(title)
  }

  /**
 * Prepends the graph's title on the wall.
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {string} title The name of the graph
 * @param {number} width The width of the graph
 * @param {number} height The height of the graph
 */
  insertClientWallTitle (g: any, title: string, width: number, height:number = -20) {
    g.insert("text",":first-child")
      .attr('class', 'title')
      .attr('x', width/2)
      .attr('y', height)
      .style('font-size', '40px')
      .style('font-weight', 'bold')
      .style('text-anchor', 'middle')
      .style('margin', '30px')
      .style('line-height', '50px')
      .text(title)
  }

  /**
 * Positions the x and y axis labels
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {number} width The width of the graph
 * @param {number} height The height of the graph
 */
  positionLabels (g: any, width: number, height: number) {
    g.selectAll('.y.axis-text')
      .attr('transform', 'translate( -50 ,' + height / 2 + '), rotate(-90)')
  
    g.selectAll('.x.axis-text')
      .attr('transform', 'translate(' + width / 2 + ',' + (height + 50) + ')')
  }

  /**
 * Positions the x and y axis labels on the wall
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {number} yHeight The height of the graph in y
 * @param {number} xWidth The width of the graph in x
 * @param {number} xHeight The height of the graph in x
 */
  positionClientWallLabels (g: any, yHeight: number, xWidth : number, xHeight: number) {
    g.selectAll('.y.axis-text')
      .attr('transform', 'translate( -50 ,' + yHeight / 2 + '), rotate(-90)')
  
    g.selectAll('.x.axis-text')
      .attr('transform', 'translate(' + xWidth / 2 + ',' + (xHeight + 50) + ')')
  }

  /**
 * Draws the X axis at the bottom of the diagram.
 *
 * @param {*} xScale The scale to use to draw the axis
 * @param {number} height The height of the graph
 */
  drawXAxis (xScale: any, height: number) {
    d3.select('.x.axis')
      .attr('transform', 'translate( 0, ' + height + ')')
      .call(d3.axisBottom(xScale).tickSizeOuter(0).tickArguments([5, '~s']) as any)
  }

  /**
 * Draws the Y axis to the left of the diagram.
 *
 * @param {*} yScale The scale to use to draw the axis
 */
  drawYAxis (yScale: any) {
    const maxLineLength = 35;
    d3.select('.y.axis')
      .call(d3.axisLeft(yScale).tickSizeOuter(0).tickArguments([5, '.0r']) as any);
    d3.select('.y.axis').selectAll('.tick').select('text').text(function(d: any) {
      if(d.length <= maxLineLength){
        return d;
      } else {
        const splitLabel = d.split(' ');
        let labelStart: string = '';
        let i: number = 0;
        while(labelStart.length + splitLabel[i].length < maxLineLength){
          labelStart += ' ' + splitLabel[i];
          i++;
        }
        return labelStart;
      }
    }).each(function(d: any, i: any, nodes: any) {
      if(d.length > maxLineLength){
        let words: string[] = d.split(' ');
        let labelStart: string = '';
        let currentWordIndex: number = 0;
        while(labelStart.length + words[currentWordIndex].length < maxLineLength){
          labelStart += ' ' + words[currentWordIndex];
          currentWordIndex++;
        }
        let j: number = 12;
        while(currentWordIndex <= words.length - 1){
          let line: string = words[currentWordIndex];
          currentWordIndex++;
          while(words[currentWordIndex] && line.length + words[currentWordIndex].length < maxLineLength && currentWordIndex <= words.length - 1){
            line = line + ' ' + words[currentWordIndex];
            currentWordIndex++;
          }
          
          if(words[currentWordIndex] && words[currentWordIndex].match(/[.,:!?]/)){
            line += words[currentWordIndex];
            currentWordIndex++;
          }
          d3.select(nodes[i].parentNode)
          .append("text")
          .text(function() {
            return line;
          })
          .attr('fill', 'black')
          .attr('y', j)
          .attr('x', -9)
          .attr('dy', '0.32em')
          j = j + 12;
        }
        const lines: number = (j/12);
        let currentLineHeight: number = -(((lines-1)/2)*12) - 12;
        d3.select(nodes[i].parentNode).selectAll('text').attr('y', function() {
          currentLineHeight += 12;
          return currentLineHeight;
        })
      }
    })
  }

  /**
 * Draws the legend for the phone
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {number} width The width of the graph, used to place the legend
 * @param {*} colorScale The color scale to use
 */
  drawLegend (g: any, width: number, colorScale: any) {
    g.append('g')
      .attr('class', 'legendOrdinal')
      .attr('transform', 'translate(' + (width + 30) + ', 200)')
  
    var legendOrdinal = legendColor()
      .shape('path', d3.symbol().type(d3.symbolCircle).size(300)()!)
      .shapePadding(2)
      .scale(colorScale);
    
  
    g.selectAll('.legendOrdinal')
      .call(legendOrdinal)
  }

  /**
 * Displays the bars for the phone graph
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {QuestionData[]} data The data to be displayed
 * @param {*} xScale The scale to use to draw on the x axis
 * @param {*} yScale The scale to use to draw on the y axis
 * @param {string} userChoice The user's choice
 */
  drawBars(g:any, data: QuestionData[], xScale:any, yScale:any, userChoice: string) {
    g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("y", function(d: QuestionData) { return yScale(d.label); })
      .style('fill', function (d: QuestionData) { return d.label == userChoice? 'orange': 'green'; })
      .attr("width", function(d: QuestionData) { return xScale(d.value); })
      .attr("height", yScale.bandwidth())
      .attr('x', '10px')
  }

  /**
 * Displays the tuppeware bars for the wall graph
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {QuestionData[]} data The data to be displayed
 * @param {*} xScale The scale to use to draw on the x axis
 * @param {*} yScale The scale to use to draw on the y axis
 */
  drawTupperwareBars(g:any, data: QuestionData[], xScale:any, yScale:any) {
    const ware = `
    <div class="ware"></div>
    <div class="tup"></div>
    <div class="per"></div>`

    g.selectAll(".bar")
      .data(data)
      .enter().append("foreignObject")
      .attr("x", function(d: QuestionData) { return xScale(d.label) - xScale.bandwidth() / 2; })
      .attr("y", function(d: QuestionData) { return yScale(100); })
      .attr("width", function(d: QuestionData) { return xScale.bandwidth() * 2; })
      .attr("height", function(d: QuestionData) { return yScale(0); })
      .append("xhtml:div")
      .style("display", "flex")
      .style("position", "relative")
      .style("transform", "translateX(50%)")
      .style("width", function(d: QuestionData) { return xScale.bandwidth() + "px"; })
      .style("height", function(d: QuestionData) { return yScale(0) + "px"; })
      .attr("class", "column")
      .each(function (this: any, d: any, index: any) {
        let container_sizes: any[] = [];
        if (d.value > 0) {
          container_sizes.push({index: 0, size: d.value % 10});
          for (let i = 1; i < d.value / 10; i++) {
            container_sizes.push({index: i , size: 10});
          }
        }

        d3.select(this).selectAll("div")
          .data(container_sizes)
          .enter()
          .append("div")
          .attr("class", "tupperware")
          .style('height', function (d: any) { return (d.size) + "%"})
          .html(ware)
          .style('animation', function(d: any) { return (Math.random() < 0.5 ? "fall-right": "fall-left") + " 2s linear backwards"})
          .style('animation-delay', function(d: any) { return ((container_sizes.length - d.index -1) * 0.6) + "s"})
      });

      const images = ["apple.png", "brocolli.png", "chicken.png", "spaghetti.png"]

      d3.selectAll('.tup').style('background-color', '#BDE1FF');
      d3.selectAll('.per').style('background-color', 'red');

      d3.selectAll('.ware')
        .style('background-color', '#F5F5F5')
        .style('border', '3px solid #BDE1FF')
        .each(function(d: any, i:any, nodes:any) {
          if (parseInt(d3.select(nodes[i].parentNode).style('height').replace("%", "")) >= 5) {
            const randomNum = Math.floor(Math.random() * images.length);
            const imgPath = `assets/images/tup/${images[randomNum]}`;
            d3.select(this)
              .style('background-image', `url(${imgPath})`)
              .style('background-size', '25px 25px')
              .style('background-repeat', 'no-repeat')
              .style('background-position', 'center');
          }
      });

  }

  /**
 * Deletes the graph
 *
 * @param {string} graphId The id of the graph
 */
  deleteGraph(graphId: string){
    const g = d3.select(graphId).selectAll('*').remove();
    g.remove();
  }

  /**
 * Sets up the projection to be used for the map
 *
 * @returns {*} The projection to use to trace the map elements
 */
  getProjection (data: any, width: number, height:number) {
    return d3.geoAzimuthalEquidistant()
      .fitSize([width, height], data)
      .rotate([90, 0])
      .translate([(width/2) - 150, height + height/2 + 50])
  }
  
  /**
 * Sets up the path to be used for the map
 *
 * @param {*} projection The projection used to trace the map elements
 * @returns {*} The path to use to trace the map elements
 */
  getPath (projection: d3.GeoProjection) {
    return d3.geoPath()
      .projection(projection)
  }

  /**
 * Draws the pyramid graph
 *
 * @param {string[]} data The data we're showing
 * @param {*} colorScale The color of the graph
 */
  drawPyramid(data: string[], colorScale: any){
    const numElements = data.length;

    const pyramid = d3.select(".pyramid-container");

    pyramid.style("margin-top", '50px')

    pyramid.selectAll(".pyramid-level")
      .data(data)
      .enter()
      .append("div")
      .attr("class", "pyramid-level")
      .style("border-top", (d, i) => "50px solid " + colorScale(i))
      .style("width", (d, i) => {
        return (numElements - i) * 60 + "px";
      })
      .style("border-left", "30px solid transparent")
      .style("border-right", "30px solid transparent")
      .style("height", 0)
      .append("span")
      .text((d: any, i: any , nodes: any) => {
        const letterSize: number = 7;
        const currentWidth: number = parseInt(nodes[i].parentNode.style.width.split('p')[0]);
        if(d.length * letterSize < currentWidth){
          d3.select(nodes[i])
            .style("transform", "translateY(-175%)")
          return d;
        }
        let words: string[] = d.split(' ');
        for(let i = 0; i < words.length;i++){
          if(words[i] == ''){
            words.splice(i,1);
          }
        }
        let labelStart: string = '';
        let currentWordIndex: number = 0;
        while((labelStart.length + words[currentWordIndex].length) * letterSize < currentWidth){
          labelStart += ' ' + words[currentWordIndex];
          currentWordIndex++;
        }
        
        let substringOffset: number = 80;
        let stringOffset = 40;
        while(currentWordIndex <= words.length - 1){
          let line: string = words[currentWordIndex];
          currentWordIndex++;
          while(words[currentWordIndex] && (line.length + words[currentWordIndex].length) * letterSize < currentWidth){
            line = line + ' ' + words[currentWordIndex];
            currentWordIndex++;
          }
          
          if(words[currentWordIndex] && (words[currentWordIndex].match(/[.,:!?]/))){
            line += words[currentWordIndex];
            currentWordIndex++;
          }
          d3.select(nodes[i].parentNode)
            .append("span")
            .text(function() {
              return line;
            })
            .style("color", "#000")
            .style("font-size", "18px")
            .style("position", "absolute")
            .style("left", "0")
            .style("right", "0")
            .style("transform", "translateY(-" + (175 - substringOffset + stringOffset) + "%)")
            .attr('dy', '0.64em')

          d3.select(nodes[i])
            .style("transform", "translateY(-" + (175 + stringOffset) + "%)")
          stringOffset += 40;
          substringOffset += 80;
        }
        return labelStart;

      })
      .style("color", "#000")
      .style("font-size", "18px")
      .style("position", "absolute")
      .style("left", "0")
      .style("right", "0")
  
    pyramid.append("div")
      .style('width', '0')
      .style('height', '0')
      .style('border-left', '30px solid transparent')
      .style('border-right', '30px solid transparent')
      .style('border-bottom', '50px solid' + colorScale(numElements - 1))
      .style('transform', 'rotate(180deg)')
  }

   /**
 * Draws the jars graph
 *
 * @param {QuestionData[]} data The data we're showing
 * @param {string} title The title of the graph
 */
  drawJars(data: QuestionData[], title: string) {
    d3.select('#title')
      .append('text')
      .text(title)
      
    d3.selectAll('.water-level')
      .data(data)
      .style('top', function(d: any) {return (100 - d.value)+'%'});

    d3.selectAll('.wave')
      .data(data)
      .append('div')
      .attr('class', 'name')
      .style('position', 'absolute')
      .style('left', '50%')
      .style('transform', 'translate(-50%, 0)')
      .style('font-size', '20px')
      .style('color', 'white')
      .style('font-weight', 'bold')
      .text((d) => Math.round(d.value) + '%')
  }

  /**
 * Draws the map graph
 *
 * @param {*} g The d3 Selection of the graph's g SVG element
 * @param {*} data The Canada data
 * @param {*} path The path associated with the current projection
 * @param {MapDataSetup[]} provinceAnswers The data to be displayed
 */
  clientMapBackground (g:any, data: any, path: any, provinceAnswers: MapDataSetup[]) {
    g.append('g')
    .selectAll('path')
    .data(data.features)
    .enter()
    .append('path')
    .attr('transform', 'translate(-60,0)')
    .attr('d', path)
    .each((d: any, i: any) => {
      const centroid = path.centroid(d.geometry)
      if(provinceAnswers[i].value == 0){
        return;
      }

      g.append('g')
        .attr('id', 'map-label')
        .attr('transform', 'translate(' + (centroid[0] - 60) + ',' + centroid[1] + ')')
        .append('text')
        .attr('class','name')
        .text(function(){
          return Math.round(provinceAnswers[i].value) + '%';
        })
        .attr('text-anchor', 'middle')
        .style('stroke-width', '0.1')
        .style('font-size', '14')
        .style('font-weight', 'bold')
        .style('stroke', 'black')
        .style('fill', 'black')
    })
    .attr('fill', function(d: any) {
      const province = provinceAnswers.find((province) => {
        return province.province == d.properties.name;
      })
      if(province!.value == 0){
        return 'white';
      }
      const R = d3.scaleLinear().domain([30, 60]).range([250, 0]);
      const G = d3.scaleLinear().domain([30, 60]).range([0, 220]);
      return 'rgba('+ (R(province!.value)) +', '+ (G(province!.value)) +', 0,1)';
    })
    .style('stroke', 'black')
    .style('stroke-width', '0.5')
  }

 /**
 * Draws the Y axis of the tupperware graph.
 *
 * @param {*} yScale The scale to use to draw the axis
 */
  drawTupperwareYAxis (yScale: any) {
    d3.select('.y.axis')
      .call(d3.axisLeft(yScale).tickSizeOuter(0).tickArguments([5, '~s']) as any)

    d3.select('.y.axis').selectAll('.tick').select('text').style('font-size', '20px');
  }

 /**
 * Draws the X axis of the tupperware graph.
 *
 * @param {*} xScale The scale to use to draw the axis
 * @param {number} height The height of the graph
 */
  drawTupperwareXAxis (xScale: any, height: number) {
    d3.select('.x.axis')
    .attr('transform', 'translate( 0, ' + height + ')')
      .call(d3.axisBottom(xScale).tickSizeOuter(0).tickArguments([5, '.0r']) as any);
    d3.select('.x.axis').selectAll('.tick').select('text').text(function(d: any) {
        return d;
    }).style('font-size', '20px');
  }


  /**
 * Draws the scale graph
 *
 * @param {ScalesDataSetup[]} data The data we're showing
 */
  drawScale(data: ScalesDataSetup[]) {
    d3.select('.allScales')
      .attr('y', 300)

    this.drawScaleLegend();
    d3.selectAll('.scales')
      .data(data)
      .each((d: ScalesDataSetup, i:any) => {
        const numberOfElements = 5;
        
        const vracYes = Math.round(d.vracInfiniteValue * numberOfElements)
        const noVracYes = Math.round(d.nonVracInfiniteValue * numberOfElements)
        
        let delay = 0;
        this.addImages(vracYes,'#scale' + i, ".pile0", "assets/images/happy_tupperware.png",delay);
        delay += vracYes;
        this.addImages(noVracYes,'#scale' + i, ".pile1", "assets/images/garbage.png" ,delay);
        delay += noVracYes;
        this.addImages(numberOfElements - vracYes,'#scale' + i, ".pile2", "assets/images/happy_tupperware.png" ,delay);
        delay += numberOfElements - vracYes;
        this.addImages(numberOfElements - noVracYes,'#scale' + i, ".pile3", "assets/images/garbage.png" ,delay);
        delay += numberOfElements - noVracYes;
      })
  }

  /**
 * Draws the scale graph's legend
 */
  drawScaleLegend() {
    const legendItemsNames: string[] = ['Fait du vrac', 'Ne fait pas de vrac', "Fait l'épicerie en auto", "Fait l'épicerie en bus", "Fait l'épicerie en vélo", "Infinité de ressources", "Nombre fini de ressources"];
    d3.select('.allScales')
      .append('div')
      .attr('class', 'legend')
      .style('position','absolute')
      .style('right', 0)
      .style('top', 0)
      .style('transform', 'translate(-50%, -100%)')
      .style('display','flex')
      .style('flex-direction','column')
      .append('text')
      .text('Légende')
      .style('font-size', '25px')
      .style('font-weight', 'bold')
      .style('margin-bottom', '10px')

    const legendNames: string[] = ['happy_tupperware.png', 'garbage.png', 'car_img.png', 'bus_img.png', 'bike_img.png', 'tumb.png']
    for(let name of legendNames){
      d3.select('.legend')
      .append('div')
      .attr('class', 'legendItem')
      .style('display', 'flex')
      .style('flex-direction', 'row')
      .append('img')
      .attr('src', "assets/images/" + name)
      .attr("width", 30)
      .attr("height", 30)
      .style('margin', '0 5px 5px 0')
    }

    d3.select('.legend')
      .append('div')
      .attr('class', 'legendItem')
      .style('display', 'flex')
      .style('flex-direction', 'row')
      .append('img')
      .attr('src', "assets/images/tumb.png")
      .style('transform', 'scaleX(-1) scaleY(-1)')
      .attr("width", 30)
      .attr("height", 30)
      .style('margin', '0 5px 5px 0')

    d3.selectAll('.legendItem')
      .append('text')
      .text(function(d, i) {
        return legendItemsNames[i];
      })
      .style('font-size', '20px')
      .style('margin-top', '5px')
  }

  /**
 * Rotates the scales in the scale graph
 *
 * @param {string} scaleName The name of the rotating scale
 * @param {number} degrees The degrees to rotate
 * @param {number} delay The delay before rotating
 */
  rotateScale(scaleName:string, degrees: number, delay: number) {
    setTimeout(()=>{
      const scale = d3.select(scaleName)

      const plates = scale.selectAll(".plate");
    
      scale.style("transform-origin", "top left")
          .style("transform", `rotate(${degrees}deg) translate(-50%, -50%)`)
      
      plates.style("transform-origin", "top left")
            .style("transform", `rotate(${-degrees}deg) translate(-50%, -50%)`);
    }, delay);
  }
  
  /**
 * Adds images to the piles of scales
 *
 * @param {number} number The amount of images on the scale
 * @param {string} scaleId The name of the scale
 * @param {string} pileid The name of the pile
 * @param {string} src The path to the image
 * @param {number} delay The delay before adding images
 */
  addImages(number: number, scaleId: string, pileid: string, src: string, delay: number) {
    const container = d3.select(scaleId).select(pileid);
    let start = (delay + number) * 0.6;

    container.selectAll("img")
      .data(d3.range(number))
      .enter()
      .append("img")
      .attr("src", src)
      .style('position', "relative")
      .attr("width", 30)
      .attr("height", 30)
      .style("display", "block")
      .style('animation', function(d: any) { return (Math.random() < 0.5 ? "fall-right": "fall-left") + " 2s linear backwards"})
      .style('animation-delay', function(d: any) { start -= 0.6; return start + "s"});
  }

  /**
 * Creates the scale animation
 *
 * @param {string} id The id of the animation
 * @param {ScalesDataSetup} data The data that we want to show
 */
  createBalanceAnimation(id: string, data: ScalesDataSetup) {
    const numberOfElements = 5;

    const angle_increments = 7 / numberOfElements; /*7 looks to be the perfect value*/

    const delay_increments = 600; /* in ms */
    
    const vracYes = Math.round(data.vracInfiniteValue * numberOfElements)
    const noVracYes = Math.round(data.nonVracInfiniteValue * numberOfElements)

    let queue: any[] = []    

    const animation = {
      id: id,
      state: 0,
      queue: queue,
    };
    
    let currentAngle = 0;
    let currentDelay = 800; /* in ms */

    for (let i = 1; i <= vracYes + noVracYes; i++) {
      currentAngle -= angle_increments;
      currentDelay += delay_increments;
      animation.queue.push({angle: currentAngle, delay: currentDelay});
    }
    for (let i = 1; i <= numberOfElements * 2 - vracYes - noVracYes; i++) {
      currentAngle += angle_increments;
      currentDelay += delay_increments;
      animation.queue.push({angle: currentAngle, delay: currentDelay});
    }

    return animation;
  }

  /**
 * Draws the circle graph
 *
 * @param {QuestionData[]} data The data we're showing
 */
  drawCircles(data: QuestionData[]){

    const width = 150
    const borderWidth = 10

    const svg = d3.create('svg')
    .attr('viewBox', `0 0 ${width} ${width}`)
    
    svg.append('circle')
      .attr('cx', width/2)
      .attr('cy', width/2)
      .attr('r', width/2 - borderWidth/2)
      .style('stroke', 'gray')
      .style('stroke-width', borderWidth)
      .style('fill', 'none');

    const svgNode = svg.node();
    const svgString = svgNode ? new XMLSerializer().serializeToString(svgNode) : '';
    const dataUri = "data:image/svg+xml;base64," + btoa(svgString);

    d3.select('.donuts')
    .selectAll('.donut')
    .data(data)
    .each(function (d: QuestionData, i: number, nodes: any) {
      const value = Math.round(d.value);
      const donut = d3.select(nodes[i]);
      donut.select('.pie.animate')
        .html(value + '%')
        .style('--p', value)
        .style('--c', 'orange')
        .style('--b', '10px')
        .style('background-image', `url(${dataUri})`)

      donut.select('.text')
        .append('text')
        .text(d.label)
        .style('flex-wrap', 'wrap')
        .style('display', 'flex')
        .style('text-align', 'center')
        .style('margin', 'auto')
        .style('justify-content', 'center')
        .style('width', '150px');
    })
  }

  /**
 * Draws the images graph
 *
 * @param {QuestionData[]} data The data we're showing
 */
  drawImagesGraph(data: QuestionData[]) {
    const g = d3.select('.images-graph')
      .style('text-align', 'center')
      .style('justify-content', 'space-around')

    g.append('div')
      .attr('class', 'images')
      .selectAll(".image-stack")
      .data(data)
      .enter()
      .append("div")
      .attr("class", "image-stack")
      .style('display', 'flex')
      .style('flex-direction', 'column')
      .style('margin', '30px')
      .style("position", "relative")
      .append("img")
      .attr('src', function(d){ return d.label})
      .style('height', '200px')
      .attr('class', 'bottom-image')
      .style("position", "relative")
      .style('filter', 'grayscale(100%)')
      .style('opacity', 0.3)

    
    g.selectAll(".image-stack")
      .data(data)
      .append('img')
      .attr('src', function(d){ return d.label})
      .attr('class', 'top-image')
      .style('opacity', 1)
      .style("transition", "clip-path 2s, -webkit-clip-path 2s")
      .style('clip-path', function(d) {return 'inset(0 100% 0 0)';})
      .style('-webkit-clip-path', function(d) {return 'inset(0 100% 0 0)';})
      .style('height', '200px')
      .style('position', 'absolute')
      .attr('top', '0')
      .style('left', '0')

    g.selectAll(".image-stack")
      .data(data)
      .append('text')
      .text(function(d) { return Math.round(d.value * 100) + '%'})
      .style('text-align', 'center')
      .style('font-size', '25px')
      .style('font-weight', 'bold')
      .style('margin', '20px')


    g.select('.title')
      .style('margin', '40px')
  }

  /**
 * Animates the images graph
 *
 * @param {QuestionData[]} data The data we're showing
 */
  animateImagesGraph(data: QuestionData[]) {
    const g = d3.select('.images-graph');
    setTimeout(()=>{
      g.selectAll(".top-image")
        .data(data)
        .style("transition", "clip-path 2s, -webkit-clip-path 2s")
        .style('clip-path', function(d) {return 'inset(0 ' + (100 - d.value * 100) + '% 0 0)';})
        .style('-webkit-clip-path', function(d) {return 'inset(0 ' + (100 - d.value * 100) + '% 0 0)';})
    }, 500);
  }

  /**
 * Resets the images graph for the next animation
 */
  resetImagesGraph() {
    const g = d3.select('.images-graph');

    g.selectAll(".top-image")
      .style('clip-path', function(d) {return 'inset(0 100% 0 0)';})
      .style('-webkit-clip-path', function(d) {return 'inset(0 100% 0 0)';})
  }
}
