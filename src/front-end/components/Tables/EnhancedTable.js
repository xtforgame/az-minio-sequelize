/* eslint-disable react/no-array-index-key */
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import EnhancedTableHead from './EnhancedTableHead';
import MoreActionMenuButton from '~/components/Buttons/MoreActionMenuButton';
import ProgressWithMask from '~/components/Progress/ProgressWithMask';

const styles = theme => ({
  root: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
  tableFixedLayout: {
    minWidth: 700,
    tableLayout: 'fixed',
  },
  paper: {
    width: '100%',
  },
  iconCell: {
    width: 48 + (12 * 2),
  },
  actionsCell: {
    width: 48 + (12 * 2),
    '&:last-child': {
      paddingRight: theme.spacing(1.5),
    },
  },
  detailCell: {
    backgroundColor: theme.palette.background.default,
  },
});

class EnhancedTable extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  static updateState({
    columns,
    columnSizes,
    rows = [],
    order,
    orderBy,
  }) {
    let sortedRows = [...rows]; // eslint-disable-line no-unused-vars

    const columnMap = {};
    columns.forEach((column) => {
      columnMap[column.id] = column;
    });

    let compare = (a, b, orderBy) => a[orderBy] < b[orderBy];
    if (columnMap[orderBy] && columnMap[orderBy].numeric) {
      compare = (a, b, orderBy) => parseFloat(a[orderBy]) < parseFloat(b[orderBy]);
    }
    if (order && orderBy) {
      sortedRows = order === 'desc'
        ? rows.sort((a, b) => (compare(b, a, orderBy) ? -1 : 1))
        : rows.sort((a, b) => (compare(a, b, orderBy) ? -1 : 1));
    }

    return {
      columns,
      columnSizes,
      columnMap,
      rows: sortedRows,
      order,
      orderBy,
    };
  }

  constructor(...args) {
    super(...args);

    this.state = {
      page: 0,
      rowsPerPage: 5,
      expanded: {},
      ...EnhancedTable.updateState({
        columns: this.props.columns,
        columnSizes: this.props.columnSizes,
        rows: this.props.rows,
        order: 'asc',
        orderBy: this.props.defaultSortBy,
      }),
    };
  }

  static getDerivedStateFromProps(props, prevState) {
    if ((props.rows && (props.rows !== prevState.rows))
      || (props.order && (props.order !== prevState.order))
      || (props.orderBy && (props.orderBy !== prevState.orderBy))
      || (props.columns && (props.columns !== prevState.columns))
      || (props.columnSizes && (props.columnSizes !== prevState.columnSizes))
    ) {
      const rows = props.rows || prevState.rows;
      const order = props.order || prevState.order;
      const orderBy = props.orderBy || prevState.orderBy;
      const columns = props.columns || prevState.columns;

      return EnhancedTable.updateState({
        columns, rows, order, orderBy,
      });
    }

    // No state update necessary
    return null;
  }

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = (event) => {
    this.setState({ rowsPerPage: event.target.value });
  };

  handleRequestSort = (_, property) => {
    let orderBy = property || this.props.defaultSortBy;
    let order = 'desc';

    if (this.state.orderBy === property) {
      if (this.state.order === 'desc') {
        order = 'asc';
      } else if (orderBy !== this.props.defaultSortBy) {
        orderBy = this.props.defaultSortBy;
        order = 'asc';
      } else {
        order = 'desc';
      }
    }

    this.setState(EnhancedTable.updateState({
      columns: this.props.columns,
      columnSizes: this.props.columnSizes,
      rows: this.state.rows,
      order,
      orderBy,
    }));
  };

  toggleDetail(row) {
    if (this.state.expanded[row.id]) {
      return this.setState({
        expanded: {},
      });
    }
    return this.setState({
      expanded: {
        [row.id]: true,
      },
    });
  }

  render() {
    const {
      classes,
      withDetail,
      getActionMenuItems,
      columns,
      columnSizes,
      loading,
      loadingRows,
      renderEmptyRows,
    } = this.props;
    const {
      order, orderBy, rowsPerPage, page,
    } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, this.state.rows.length - page * rowsPerPage);

    return (
      <Paper className={classes.root}>
        <Table className={columnSizes ? classes.tableFixedLayout : classes.table}>
          <EnhancedTableHead
            withDetail={withDetail}
            withActions={!!getActionMenuItems}
            columns={columns}
            columnSizes={columnSizes}
            sortTip="Sort"
            order={order}
            orderBy={orderBy}
            onRequestSort={this.handleRequestSort}
          />
          <TableBody>
            {this.state.rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
              const expanded = this.state.expanded[row.id];
              const options = {
                columns,
              };
              return (
                <React.Fragment key={row.id}>
                  <TableRow>
                    { withDetail
                      && (
                        <TableCell padding="checkbox" className={classes.iconCell}>
                          <IconButton
                            onClick={() => { this.toggleDetail(row); }}
                          >
                            {expanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                          </IconButton>
                        </TableCell>
                      )
                    }
                    {columns.map((column) => {
                      const renderFunction = row.renderCell
                        || column.renderRowCell
                        || ((columnId, row) => row[columnId]);
                      return (
                        <TableCell
                          key={column.id}
                          align={column.numeric ? 'right' : 'left'}
                          padding={column.padding || 'default'}
                          className={column.cellClassName}
                        >
                          {renderFunction(column.id, row, options)}
                        </TableCell>
                      );
                    })}
                    { getActionMenuItems
                      && (
                        <TableCell padding="checkbox" className={classes.actionsCell}>
                          <MoreActionMenuButton
                            getActionMenuItems={getActionMenuItems}
                          />
                        </TableCell>
                      )
                    }
                  </TableRow>
                  {withDetail && expanded && (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length + (+withDetail) + (+!!getActionMenuItems)}
                        className={classes.detailCell}
                      >
                        {this.props.renderRowDetail && this.props.renderRowDetail(row, options)}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
            {renderEmptyRows && emptyRows > 0
            && Array.apply(null, { length: emptyRows }) // eslint-disable-line prefer-spread
            .map((_, i) => (
              <TableRow key={`empty-${i}`}>
                <TableCell colSpan={columns.length + (+withDetail) + (+!!getActionMenuItems)} />
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!loading && loadingRows && <ProgressWithMask delay={100} />}
        <TablePagination
          component="div"
          count={this.state.rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          backIconButtonProps={{
            'aria-label': 'Previous Page',
          }}
          nextIconButtonProps={{
            'aria-label': 'Next Page',
          }}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
        {loading && <ProgressWithMask delay={100} />}
      </Paper>
    );
  }
}

export default withStyles(styles)(EnhancedTable);
