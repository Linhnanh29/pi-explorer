import React from 'react'
import {Table} from 'react-bootstrap'
import {Link} from 'react-router-dom'
import {FormattedRelative, FormattedMessage} from 'react-intl'

import {server as stellar} from '../lib/Stellar'
import {withSpinner} from './shared/HOCs'
import {isDefInt} from '../lib/Utils'

const REFRESH_RATE = 15000
const DEFAULT_LIMIT = 5

const responseToLedgers = (rsp) => (rsp.records.map((ledger) => ({sequence: ledger.sequence, time: ledger.closed_at, txCount: ledger.transaction_count})))

const isLoading = (props) => (props.isLoading === true)

const LedgerRow = (props) => <tr>
  <td>
    <Link to={`/ledger/${props.sequence}`}>{props.sequence}</Link>
  </td>
  <td><FormattedRelative value={props.time}/></td>
  <td>{props.txCount}</td>
</tr>

class LedgerTable extends React.Component {
  render() {
    const ledgerRows = this.props.ledgers.map((ledger) => <LedgerRow
      key={ledger.sequence}
      sequence={ledger.sequence}
      time={ledger.time}
      txCount={ledger.txCount}/>)

    return (
      <Table
        id="ledger-table"
        className="table-striped table-hover table-condensed"
        fill>
        <thead>
          <tr>
            <th>#</th>
            <th><FormattedMessage id="time"/></th>
            <th><FormattedMessage id="transactions"/></th>
          </tr>
        </thead>
        <tbody>
          {ledgerRows}
        </tbody>
      </Table>
    )
  }
}
const WrappedLedgerTable = withSpinner(LedgerTable, isLoading)

class LedgerTableContainer extends React.Component {
  state = {
    isLoading: true,
    ledgers: []
  }

  componentDidMount() {
    this.update()
    this.timerID = setInterval(() => this.update(), REFRESH_RATE);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  ledgers() {
    const limit = (isDefInt(this.props, 'limit'))
      ? this.props.limit
      : DEFAULT_LIMIT
    return stellar.ledgers().order('desc').limit(limit).call()
  }

  update() {
    this.setState({isLoading: true, ledgers: []})
    this.ledgers().then((stellarRsp) => {
      this.setState({ledgers: responseToLedgers(stellarRsp), isLoading: false})
    }).catch((err) => {
      console.error(`Failed to fetch ledgers: [${err}]`)
      this.setState({ledgers: [], isLoading: false})
    })
  }

  render() {
    return (<WrappedLedgerTable
      isLoading={this.state.isLoading}
      ledgers={this.state.ledgers}/>)
  }
}

export default LedgerTableContainer
