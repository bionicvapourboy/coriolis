import React from 'react';
import { findDOMNode } from 'react-dom';
import d3 from 'd3';
import TranslatedComponent from './TranslatedComponent';

const RENDER_POINTS = 20;   // Only render 20 points on the graph
const MARGIN = { top: 15, right: 15, bottom: 35, left: 60 }

export default class LineChart extends TranslatedComponent {

  static defaultProps = {
    xMin: 0,
    yMin: 0,
    colors: ['#ff8c0d']
  }

  static PropTypes = {
    width: React.PropTypes.number.isRequired,
    func: React.PropTypes.func.isRequired,
    xLabel: React.PropTypes.string.isRequired,
    xMin: React.PropTypes.number,
    xMax: React.PropTypes.number.isRequired,
    xUnit: React.PropTypes.string.isRequired,
    yLabel: React.PropTypes.string.isRequired,
    yMin: React.PropTypes.number,
    yMax: React.PropTypes.number.isRequired,
    yUnit: React.PropTypes.string.isRequired,
    series: React.PropTypes.array,
    colors: React.PropTypes.array,
  };

  constructor(props, context) {
    super(props);

    this._updateDimensions = this._updateDimensions.bind(this);
    this._updateSeriesData = this._updateSeriesData.bind(this);
    this._tooltip = this._tooltip.bind(this);
    this._showTip = this._showTip.bind(this);
    this._hideTip = this._hideTip.bind(this);
    this._moveTip = this._moveTip.bind(this);

    let markerElems = [];
    let detailElems = [<text key={'lbl'} className='label x' y='1.25em'/>];
    let xScale = d3.scale.linear();
    let yScale = d3.scale.linear();
    let series = props.series;
    let seriesLines = [];

    this.xAxis = d3.svg.axis().scale(xScale).outerTickSize(0).orient('bottom');
    this.yAxis = d3.svg.axis().scale(yScale).ticks(6).outerTickSize(0).orient('left');

    for(let i = 0, l = series ? series.length : 1; i < l; i++) {
      let yAccessor = series ? function(d) { return yScale(d[1][this]); }.bind(series[i]) : (d) => yScale(d[1]);
      seriesLines.push(d3.svg.line().x((d) => xScale(d[0])).y(yAccessor));
      detailElems.push(<text key={i} className='label y' y={1.25 * (i + 2) + 'em'}/>);
      markerElems.push(<circle key={i} className='marker' r='4' />);
    }

    this.state = {
      xScale,
      yScale,
      seriesLines,
      detailElems,
      markerElems,
      tipHeight: 2 + (1.25 * (series ? series.length : 0.75))
    };
  }

  _tooltip(xPos) {
    let { xLabel, yLabel, xUnit, yUnit, func, series } = this.props;
    let { xScale, yScale } = this.state;
    let { formats, translate } = this.context.language;
    let x0 = xScale.invert(xPos),
        y0 = func(x0),
        tips = this.tipContainer,
        yTotal = 0,
        flip = (x0 / xScale.domain()[1] > 0.65),
        tipWidth = 0,
        tipHeightPx = tips.selectAll('rect').node().getBoundingClientRect().height;

    tips.selectAll('text.label.y').text(function(d, i) {
      let yVal = series ? y0[series[i]] : y0;
      yTotal += yVal;
      return (series ? translate(series[i]) : '') + ' ' + formats.f2(yVal);
    }).append('tspan').attr('class', 'metric').text(' ' + yUnit);

    tips.selectAll('text').each(function() {
      if (this.getBBox().width > tipWidth) {
        tipWidth = Math.ceil(this.getBBox().width);
      }
    });

    let tipY = Math.floor(yScale(yTotal / (series ? series.length : 1)) - (tipHeightPx / 2));

    tipWidth += 8;
    tips.attr('transform', 'translate(' + xPos + ',' + tipY + ')');
    tips.selectAll('text.label').attr('x', flip ? -12 : 12).style('text-anchor', flip ? 'end' : 'start');
    tips.selectAll('text.label.x').text(formats.f2(x0)).append('tspan').attr('class', 'metric').text(' ' + xUnit);
    tips.selectAll('rect').attr('width', tipWidth + 4).attr('x', flip ? -tipWidth - 12 : 8).style('text-anchor', flip ? 'end' : 'start');
    this.markersContainer.selectAll('circle').attr('cx', xPos).attr('cy', (d, i) => yScale(series ? y0[series[i]] : y0));
  }

  _updateDimensions(props, sizeRatio) {
    let { width, xMax, xMin, yMin, yMax } = props;
    let innerWidth = width - MARGIN.left - MARGIN.right;
    let outerHeight = Math.round(width * 0.5 * sizeRatio);
    let innerHeight = outerHeight - MARGIN.top - MARGIN.bottom;

    this.state.xScale.range([0, innerWidth]).domain([xMin, xMax || 1]).clamp(true);
    this.state.yScale.range([innerHeight, 0]).domain([yMin, yMax]);
    this.setState({ innerWidth, outerHeight, innerHeight });
  }

  _showTip(e) {
    this._moveTip(e);
    this.tipContainer.style('display', null);
    this.markersContainer.style('display', null);
  }

  _moveTip(e) {
    this._tooltip(Math.round(e.clientX - e.target.getBoundingClientRect().left));
  }

  _hideTip() {
    this.tipContainer.style('display', 'none');
    this.markersContainer.style('display', 'none');
  }

  _updateSeriesData(props) {
    let { func, xMin, xMax, series } = props;
    let delta = (xMax - xMin) / RENDER_POINTS;
    let seriesData = new Array(RENDER_POINTS);

    if (delta) {
      seriesData = new Array(RENDER_POINTS);
      for (let i = 0, x = xMin; i < RENDER_POINTS; i++) {
        seriesData[i] = [ x, func(x) ];
        x += delta;
      }
      seriesData[RENDER_POINTS - 1] = [ xMax, func(xMax) ];
    } else {
      let yVal = func(xMin);
      seriesData = [ [0, yVal], [1, yVal]];
    }

    this.setState({ seriesData });
  }

  componentWillMount(){
    this._updateDimensions(this.props, this.context.sizeRatio);
    this._updateSeriesData(this.props);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    let { func, xMin, xMax, yMin, yMax, width } = nextProps;
    let props = this.props;

    let domainChanged = xMax != props.xMax || xMin != props.xMin || yMax != props.yMax || yMin != props.yMin || func != props.func;

    if (width != props.width || domainChanged || this.context.sizeRatio != nextContext.sizeRatio) {
      this._updateDimensions(nextProps, nextContext.sizeRatio);
    }

    if (domainChanged) {
      this._updateSeriesData(nextProps);
    }
  }

  render() {
    if (!this.props.width) {
      return null;
    }

    let { xLabel, yLabel, xUnit, yUnit, colors } = this.props;
    let { innerWidth, outerHeight, innerHeight, tipHeight, detailElems, markerElems, seriesData, seriesLines } = this.state;
    let line = this.line;
    let lines = seriesLines.map((line, i) => <path key={i} className='line' stroke={colors[i]} strokeWidth='2' d={line(seriesData)} />);

    return <svg style={{ width: '100%', height: outerHeight }}>
      <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
        <g>{lines}</g>
        <g className='x axis' ref={(elem) => d3.select(elem).call(this.xAxis)} transform={`translate(0,${innerHeight})`}>
          <text className='cap' y='30' dy='.1em' x={innerWidth / 2} style={{ textAnchor: 'middle' }}>
            <tspan>{xLabel}</tspan>
            <tspan className='metric'>{` (${xUnit})`}</tspan>
          </text>
        </g>
        <g className='y axis' ref={(elem) => d3.select(elem).call(this.yAxis)}>
          <text className='cap' transform='rotate(-90)' y='-50' dy='.1em' x={innerHeight / -2} style={{ textAnchor: 'middle' }}>
            <tspan>{yLabel}</tspan>
            <tspan className='metric'>{` (${yUnit})`}</tspan>
          </text>
        </g>
        <g ref={(g) => this.tipContainer = d3.select(g)} className='tooltip' style={{ display: 'none' }}>
          <rect className='tip' style={{height: tipHeight + 'em'}}></rect>
          {detailElems}
        </g>
        <g ref={(g) => this.markersContainer = d3.select(g)} style={{ display: 'none' }}>
          {markerElems}
        </g>
        <rect
          fillOpacity='0'
          height={innerHeight}
          width={innerWidth + 1}
          onMouseEnter={this._showTip}
          onTouchStart={this._showTip}
          onMouseLeave={this._hideTip}
          onTouchEnd={this._hideTip}
          onMouseMove={this._moveTip}
          onTouchMove={this._moveTip}
        />
      </g>
    </svg>;
  }
}
