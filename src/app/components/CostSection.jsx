import React from 'react';
import cn from 'classnames';
import { Ships } from 'coriolis-data';
import Persist from '../stores/Persist';
import Ship from '../shipyard/Ship';
import { Insurance } from '../shipyard/Constants';
import { slotName, nameComparator } from '../utils/SlotFunctions';
import TranslatedComponent from './TranslatedComponent';

export default class CostSection extends TranslatedComponent {

  static PropTypes = {
    ship: React.PropTypes.object.isRequired,
    code: React.PropTypes.string.isRequired,
    buildName: React.PropTypes.string
  };

  constructor(props) {
    super(props);
    this._costsTab = this._costsTab.bind(this);
    this._sortCost = this._sortCost.bind(this);
    this._sortAmmo = this._sortAmmo.bind(this);
    this._sortRetrofit = this._sortRetrofit.bind(this);
    this._buildRetrofitShip = this._buildRetrofitShip.bind(this);
    this._onBaseRetrofitChange = this._onBaseRetrofitChange.bind(this);
    this._defaultRetrofitName = this._defaultRetrofitName.bind(this);

    let data = Ships[props.ship.id];   // Retrieve the basic ship properties, slots and defaults
    let retrofitName = this._defaultRetrofitName(props.ship.id, props.buildName);
    let retrofitShip = this._buildRetrofitShip(props.ship.id, retrofitName);
    let shipDiscount = Persist.getShipDiscount();
    let moduleDiscount = Persist.getModuleDiscount();

    this.props.ship.applyDiscounts(shipDiscount, moduleDiscount);
    retrofitShip.applyDiscounts(shipDiscount, moduleDiscount);

    this.state = {
      retrofitShip,
      retrofitName,
      shipDiscount,
      moduleDiscount,
      total: props.ship.totalCost,
      insurance: Insurance[Persist.getInsurance()],
      tab: Persist.getCostTab(),
      buildOptions: Persist.getBuildsNamesFor(props.ship.id),
      ammoPredicate: 'cr',
      ammoDesc: true,
      costPredicate: 'cr',
      costDesc: true,
      retroPredicate: 'cr',
      retroDesc: true
    };
  }

  _buildRetrofitShip(shipId, name, retrofitShip) {
    let data = Ships[shipId];   // Retrieve the basic ship properties, slots and defaults

    if (!retrofitShip) {
      retrofitShip = new Ship(shipId, data.properties, data.slots);  // Create a new Ship for retrofit comparison
    }

    if (Persist.hasBuild(shipId, name)) {
      retrofitShip.buildFrom(Persist.getBuild(shipId, name));  // Populate modules from existing build
    } else {
      retrofitShip.buildWith(data.defaults);  // Populate with default components
    }
    return retrofitShip;
  }

  _defaultRetrofitName(shipId, name) {
    return Persist.hasBuild(shipId, name) ? name : null;
  }

  _showTab(tab) {
    Persist.setCostTab(tab);
    this.setState({ tab });
  }

  _onDiscountChanged() {
    let shipDiscount = Persist.getShipDiscount();
    let moduleDiscount = Persist.getModuleDiscount();
    this.props.ship.applyDiscounts(shipDiscount, moduleDiscount);
    this.state.retrofitShip.applyDiscounts(shipDiscount, moduleDiscount);
    this.setState({ shipDiscount, moduleDiscount });
  }

  _onInsuranceChanged(insuranceName) {
    this.setState({ insurance: Insurance[insuranceName] });
  }

  /**
   * Repopulate modules on retrofit ship from existing build
   * @param  {string} retrofitName Build name to base the retrofit ship on
   */
  _onBaseRetrofitChange(event) {
    let retrofitName = event.target.value;
    let ship = this.props.ship;

    if (retrofitName) {
      this.state.retrofitShip.buildFrom(Persist.getBuild(ship.id, retrofitName));
    } else {
      this.state.retrofitShip.buildWith(Ships[ship.id].defaults);  // Retrofit ship becomes stock build
    }
    this._updateRetrofit(ship, this.state.retrofitShip);
    this.setState({ retrofitName });
  }

  _onBuildSaved(shipId, name, code) {
    if(this.state.retrofitName == name) {
      this.state.retrofitShip.buildFrom(code);  // Repopulate modules from saved build
      this._updateRetrofit(this.props.ship, this.state.retrofitShip);
    } else {
      this.setState({ buildOptions: Persist.getBuildsNamesFor(this.props.shipId) });
    }
  }

  _onBuildDeleted(shipId, name, code) {
    if(this.state.retrofitName == name) {
      this.state.retrofitShip.buildWith(Ships[shipId].defaults);  // Retrofit ship becomes stock build
      this.setState({ retrofitName: null });
    }
    this.setState({ buildOptions: Persist.getBuildsNamesFor(shipId) });
  }

  _toggleCost(item) {
    this.props.ship.setCostIncluded(item, !item.incCost);
    this.setState({ total: this.props.ship.totalCost });
  }

  _toggleRetrofitCost(item) {
    let retrofitTotal = this.state.retrofitTotal;
    item.retroItem.incCost = !item.retroItem.incCost;
    retrofitTotal += item.netCost * (item.retroItem.incCost ? 1 : -1);
    this.setState({ retrofitTotal });
  }

  _sortCostBy(predicate) {
    let { costPredicate, costDesc } = this.state;

    if (costPredicate == predicate) {
      costDesc = !costDesc;
    }

    this.setState({ costPredicate: predicate, costDesc });
  }

  _sortCost(ship, predicate, desc) {
    let costList = ship.costList;

    if (predicate == 'm') {
      costList.sort(nameComparator(this.context.language.translate));
    } else {
      costList.sort((a, b) => (a.m && a.m.cost ? a.m.cost : 0) - (b.m && b.m.cost ? b.m.cost : 0));
    }

    if (!desc) {
      costList.reverse();
    }
  }

  _sortAmmoBy(predicate) {
    let { ammoPredicate, ammoDesc } = this.state;

    if (ammoPredicate == predicate) {
      ammoDesc = !ammoDesc;
    }

    this.setState({ ammoPredicate: predicate, ammoDesc });
  }

  _sortAmmo(ammoCosts, predicate, desc) {

    if (predicate == 'm') {
      ammoCosts.sort(nameComparator(this.context.language.translate));
    } else {
      ammoCosts.sort((a, b) => a[predicate] - b[predicate]);
    }

    if (!desc) {
      ammoCosts.reverse();
    }
  }

  _sortRetrofitBy(predicate) {
    let { retroPredicate, retroDesc } = this.state;

    if (retroPredicate == predicate) {
      retroDesc = !retroDesc;
    }

    this.setState({ retroPredicate: predicate, retroDesc });
  }

  _sortRetrofit(retrofitCosts, predicate, desc) {
    let translate = this.context.language.translate;

    if (predicate == 'cr') {
      retrofitCosts.sort((a, b) => a.netCost - b.netCost);
    } else {
      retrofitCosts.sort((a , b) => (a[predicate] ? translate(a[predicate]).toLowerCase() : '').localeCompare(b[predicate] ? translate(b[predicate]).toLowerCase() : ''));
    }

    if (!desc) {
      retrofitCosts.reverse();
    }
  }

  _costsTab() {
    let { ship } = this.props;
    let { total, shipDiscount, moduleDiscount, insurance } = this.state;
    let { translate, formats, units } = this.context.language;
    let rows = [];

    for (let i = 0, l = ship.costList.length; i < l; i++) {
      let item = ship.costList[i];
      if (item.m && item.m.cost) {
        let toggle = this._toggleCost.bind(this, item);
        rows.push(<tr key={i} className={cn('highlight', { disabled: !item.incCost })}>
          <td className='ptr' style={{ width: '1em' }} onClick={toggle}>{item.m.class + item.m.rating}</td>
          <td className='le ptr shorten cap' onClick={toggle}>{slotName(translate, item)}</td>
          <td className='ri ptr' onClick={toggle}>{formats.int(item.discountedCost)}{units.CR}</td>
        </tr>);
      }
    }

    return <div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr className='main'>
            <th colSpan='2' className='sortable le' onClick={this._sortCostBy.bind(this,'m')}>
              {translate('component')}
              {shipDiscount < 1 && <u className='cap optional-hide' style={{ marginLeft: '0.5em' }}>{`[${translate('ship')} -${formats.pct1(1 - shipDiscount)}]`}</u>}
              {moduleDiscount < 1 && <u className='cap optional-hide' style={{ marginLeft: '0.5em' }}>{`[${translate('modules')} -${formats.pct1(1 - moduleDiscount)}]`}</u>}
            </th>
            <th className='sortable le' onClick={this._sortCostBy.bind(this, 'cr')} >{translate('credits')}</th>
          </tr>
        </thead>
        <tbody>
          {rows}
          <tr className='ri'>
            <td colSpan='2' className='lbl' >{translate('total')}</td>
            <td className='val'>{formats.int(total)}{units.CR}</td>
          </tr>
          <tr className='ri'>
            <td colSpan='2' className='lbl'>{translate('insurance')}</td>
            <td className='val'>{formats.int(total * insurance)}{units.CR}</td>
          </tr>
        </tbody>
      </table>
    </div>;
  }

  _retrofitTab() {
    let { retrofitTotal, retrofitCosts, moduleDiscount, retrofitName } = this.state;
    let { translate, formats, units } = this.context.language;
    let int = formats.int;
    let rows = [], options = [<option key='stock' value=''>{translate('Stock')}</option>];

    for (let opt of this.state.buildOptions) {
      options.push(<option key={opt} value={opt}>{opt}</option>);
    }

    if (retrofitCosts.length) {
      for (let i = 0, l = retrofitCosts.length; i < l; i++) {
        let item = retrofitCosts[i];
        rows.push(<tr key={i} className={cn('highlight', { disabled: !item.retroItem.incCost })} onClick={this._toggleRetrofitCost.bind(this, item)}>
            <td style={{ width: '1em' }}>{item.sellClassRating}</td>
            <td className='le shorten cap'>{translate(item.sellName)}</td>
            <td style={{ width: '1em' }}>{item.buyClassRating}</td>
            <td className='le shorten cap'>{translate(item.buyName)}</td>
            <td colSpan='2' className={cn('ri', item.retroItem.incCost ? item.netCost > 0 ? 'warning' : 'secondary-disabled' : 'disabled' )}>{int(item.netCost)}{units.CR}</td>
        </tr>);
      }
    } else {
      rows = <tr><td colSpan='7' style={{ padding: '3em 0' }}>{translate('PHRASE_NO_RETROCH')}</td></tr>
    }

    return <div>
      <div className='scroll-x'>
        <table style={{ width: '100%' }}>
          <thead>
            <tr className='main'>
              <th colSpan='2' className='sortable le' onClick={this._sortRetrofitBy.bind(this, 'sellName')}>{translate('sell')}</th>
              <th colSpan='2' className='sortable le' onClick={this._sortRetrofitBy.bind(this, 'buyName')}>{translate('buy')}</th>
              <th colSpan='2' className='sortable le' onClick={this._sortRetrofitBy.bind(this, 'cr')}>
                {translate('net cost')}
                {moduleDiscount < 1 && <u className='optional-hide'>{`[${translate('modules')} -${formats.rPct(1 - moduleDiscount)}]`}</u>}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows}
            <tr className='ri'>
              <td colSpan='4' className='lbl' >{translate('cost')}</td>
              <td colSpan='2' className={cn('val', retrofitTotal > 0 ? 'warning' : 'secondary-disabled')} style={{ borderBottom:'none' }}>
                {int(retrofitTotal)}{units.CR}
              </td>
            </tr>
            <tr className='ri'>
              <td colSpan='4' className='lbl cap' >{translate('retrofit from')}</td>
              <td className='val cen' style={{ borderRight: 'none', width: '1em' }}><u className='primary-disabled'>&#9662;</u></td>
              <td className='val' style={{ borderLeft:'none', padding: 0 }}>
                <select style={{ width: '100%', padding: 0 }} value={retrofitName} onChange={this._onBaseRetrofitChange}>
                {options}
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>;
  }

  _updateRetrofit(ship, retrofitShip) {
    let retrofitCosts = [];
    var retrofitTotal = 0, i, l, item;

    if (ship.bulkheads.index != retrofitShip.bulkheads.index) {
      item = {
        buyClassRating: ship.bulkheads.m.class + ship.bulkheads.m.rating,
        buyName: ship.bulkheads.m.name,
        sellClassRating: retrofitShip.bulkheads.m.class + retrofitShip.bulkheads.m.rating,
        sellName: retrofitShip.bulkheads.m.name,
        netCost: ship.bulkheads.discountedCost - retrofitShip.bulkheads.discountedCost,
        retroItem: retrofitShip.bulkheads
      };
      retrofitCosts.push(item);
      if (retrofitShip.bulkheads.incCost) {
        retrofitTotal += item.netCost;
      }
    }

    for (var g in { standard: 1, internal: 1, hardpoints: 1 }) {
      var retroSlotGroup = retrofitShip[g];
      var slotGroup = ship[g];
      for (i = 0, l = slotGroup.length; i < l; i++) {
        if (slotGroup[i].m != retroSlotGroup[i].m) {
          item = { netCost: 0, retroItem: retroSlotGroup[i] };
          if (slotGroup[i].m) {
            item.buyName = slotGroup[i].m.name || slotGroup[i].m.grp;
            item.buyClassRating = slotGroup[i].m.class + slotGroup[i].m.rating;
            item.netCost = slotGroup[i].discountedCost;
          }
          if (retroSlotGroup[i].m) {
            item.sellName = retroSlotGroup[i].m.name || retroSlotGroup[i].m.grp;
            item.sellClassRating = retroSlotGroup[i].m.class + retroSlotGroup[i].m.rating;
            item.netCost -= retroSlotGroup[i].discountedCost;
          }
          retrofitCosts.push(item);
          if (retroSlotGroup[i].incCost) {
            retrofitTotal += item.netCost;
          }
        }
      }
    }

    this.setState({ retrofitCosts, retrofitTotal });
    this._sortRetrofit(retrofitCosts, this.state.retroPredicate, this.state.retroDesc);
  }

  _ammoTab() {
    let { ammoTotal, ammoCosts } = this.state;
    let { translate, formats, units } = this.context.language;
    let int = formats.int;
    let rows = [];

    for (let i = 0, l = ammoCosts.length; i < l; i++) {
      let item = ammoCosts[i];
      rows.push(<tr key={i} className='highlight'>
        <td style={{ width: '1em' }}>{item.m.class + item.m.rating}</td>
        <td className='le shorten cap'>{slotName(translate, item)}</td>
        <td className='ri'>{int(item.max)}</td>
        <td className='ri'>{int(item.cost)}{units.CR}</td>
        <td className='ri'>{int(item.total)}{units.CR}</td>
      </tr>);
    }

    return <div>
      <div className='scroll-x' >
        <table style={{ width: '100%' }}>
          <thead>
            <tr className='main'>
              <th colSpan='2' className='sortable le' onClick={this._sortAmmoBy.bind(this, 'm')} >{translate('module')}</th>
              <th colSpan='1' className='sortable le' onClick={this._sortAmmoBy.bind(this, 'max')} >{translate('qty')}</th>
              <th colSpan='1' className='sortable le' onClick={this._sortAmmoBy.bind(this, 'cost')} >{translate('unit cost')}</th>
              <th className='sortable le' onClick={this._sortAmmoBy.bind(this, 'total')}>{translate('total cost')}</th>
            </tr>
          </thead>
          <tbody>
            {rows}
            <tr className='ri'>
              <td colSpan='4' className='lbl' >{translate('total')}</td>
              <td className='val'>{int(ammoTotal)}{units.CR}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>;
  }

  /**
   * Recalculate all ammo costs
   */
  _updateAmmoCosts(ship) {
    let ammoCosts = [], ammoTotal = 0, item, q, limpets = 0, srvs = 0, scoop = false;

    for (let g in { standard: 1, internal: 1, hardpoints: 1 }) {
      let slotGroup = ship[g];
      for (let i = 0, l = slotGroup.length; i < l; i++) {
        if (slotGroup[i].m) {
          //special cases needed for SCB, AFMU, and limpet controllers since they don't use standard ammo/clip
          q = 0;
          switch (slotGroup[i].m.grp) {
            case 'fs': //skip fuel calculation if scoop present
              scoop = true;
              break;
            case 'scb':
              q = slotGroup[i].m.cells;
              break;
            case 'am':
              q = slotGroup[i].m.ammo;
              break;
            case 'pv':
              srvs += slotGroup[i].m.vehicles;
              break;
            case 'fx': case 'hb': case 'cc': case 'pc':
              limpets = ship.cargoCapacity;
              break;
            default:
              q = slotGroup[i].m.clip + slotGroup[i].m.ammo;
          }
          //calculate ammo costs only if a cost is specified
          if (slotGroup[i].m.ammocost > 0) {
            item = {
              m: slotGroup[i].m,
              max: q,
              cost: slotGroup[i].m.ammocost,
              total: q * slotGroup[i].m.ammocost
            };
            ammoCosts.push(item);
            ammoTotal += item.total;
          }
        }
      }
    }

    //limpets if controllers exist and cargo space available
    if (limpets > 0) {
      item = {
        m: { name: 'limpets', class: '', rating: '' },
        max: ship.cargoCapacity,
        cost: 101,
        total: ship.cargoCapacity * 101
      };
      ammoCosts.push(item);
      ammoTotal += item.total;
    }

    if (srvs > 0) {
      item = {
        m: { name: 'SRVs', class: '', rating: '' },
        max: srvs,
        cost: 6005,
        total: srvs * 6005
      };
      ammoCosts.push(item);
      ammoTotal += item.total;
    }
    //calculate refuel costs if no scoop present
    if (!scoop) {
      item = {
        m: { name: 'fuel', class: '', rating: '' },
        max: ship.fuelCapacity,
        cost: 50,
        total: ship.fuelCapacity * 50
      };
      ammoCosts.push(item);
      ammoTotal += item.total;
    }

    this.setState({ ammoTotal, ammoCosts });
    this._sortAmmo(ammoCosts, this.state.ammoPredicate, this.state.ammoDesc);
  }

  componentWillMount(){
    this.listeners = [
      Persist.addListener('discounts', this._onDiscountChanged.bind(this)),
      Persist.addListener('insurance', this._onInsuranceChanged.bind(this)),
      Persist.addListener('buildSaved', this._onBuildSaved.bind(this)),
      Persist.addListener('buildDeleted', this._onBuildDeleted.bind(this))
    ];
    this._updateAmmoCosts(this.props.ship);
    this._updateRetrofit(this.props.ship, this.state.retrofitShip);
    this._sortCost(this.props.ship);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    let retrofitShip = this.state.retrofitShip;

    if (nextProps.ship != this.props.ship) { // Ship has changed
      let nextId = nextProps.ship.id;
      let retrofitName = this._defaultRetrofitName(nextId, nextProps.buildName);
      retrofitShip = this._buildRetrofitShip(nextId, retrofitName, nextId == this.props.ship.id ? retrofitShip : null );
      this.setState({
        retrofitShip,
        retrofitName,
        buildOptions: Persist.getBuildsNamesFor(nextId)
      });
    }

    if (nextProps.ship != this.props.ship || nextProps.code != this.props.code) {
      this._updateAmmoCosts(nextProps.ship);
      this._updateRetrofit(nextProps.ship, retrofitShip);
      this._sortCost(nextProps.ship);
    }
  }

  componentWillUpdate(nextProps, nextState) {
    let state = this.state;

    switch (nextState.tab) {
      case 'ammo':
        if (state.ammoPredicate != nextState.ammoPredicate || state.ammoDesc != nextState.ammoDesc) {
          this._sortAmmo(nextState.ammoCosts, nextState.ammoPredicate, nextState.ammoDesc);
        }
        break;
      case 'retrofit':
        if (state.retroPredicate != nextState.retroPredicate || state.retroDesc != nextState.retroDesc) {
          this._sortRetrofit(nextState.retrofitCosts, nextState.retroPredicate, nextState.retroDesc);
        }
        break;
      default:
        if (state.costPredicate != nextState.costPredicate || state.costDesc != nextState.costDesc) {
          this._sortCost(nextProps.ship, nextState.costPredicate, nextState.costDesc);
        }
    }
  }

  componentWillUnmount(){
    this.listeners.forEach(l => l.remove());
  }

  render() {
    let tab = this.state.tab;
    let translate = this.context.language.translate;
    let tabSection;

    switch (tab) {
      case 'ammo': tabSection = this._ammoTab(); break;
      case 'retrofit': tabSection = this._retrofitTab(); break;
      default:
        tab = 'costs';
        tabSection = this._costsTab();
    }

    return (
      <div className='group half'>
        <table className='tabs'>
          <thead>
            <tr>
              <th style={{ width:'33%' }} className={cn({active: tab == 'costs'})} onClick={this._showTab.bind(this, 'costs')} >{translate('costs')}</th>
              <th style={{ width:'33%' }} className={cn({active: tab == 'retrofit'})} onClick={this._showTab.bind(this, 'retrofit')} >{translate('retrofit costs')}</th>
              <th style={{ width:'34%' }} className={cn({active: tab == 'ammo'})} onClick={this._showTab.bind(this, 'ammo')} >{translate('reload costs')}</th>
            </tr>
          </thead>
        </table>
        {tabSection}
      </div>
    );
  }
}
