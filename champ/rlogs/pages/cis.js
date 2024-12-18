import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'datatables.net-dt/css/dataTables.dataTables.css'; // DataTables CSS
import $ from 'jquery';
import 'datatables.net'; // DataTables JS
import ReactDatePicker from 'react-datepicker'; // Import React Date Picker
import 'react-datepicker/dist/react-datepicker.css'; // React Date Picker CSS
import { format } from 'date-fns'; // Import date-fns for date formatting

export async function getServerSideProps() {
    try {
        const res = await fetch('http://localhost:3000/api/cis');
        if (!res.ok) {
            throw new Error(`API responded with status ${res.status}`);
        }

        const { data } = await res.json();

        // Pre-format dates as strings for JSON serialization
        const formattedData = data.map((item) => ({
            ...item,
            buyTime: item.buyTime ? new Date(item.buyTime).toISOString() : null,
            sellTime: item.sellTime ? new Date(item.sellTime).toISOString() : null,
            timestamp: item.timestamp ? new Date(item.timestamp).toISOString() : null,
        }));

        return {
            props: {
                data: formattedData,
            },
        };
    } catch (error) {
        console.error("Error fetching data in getServerSideProps:", error.message);
        return {
            props: {
                data: [],
            },
        };
    }
}

export default function CisPage({ data }) {
    const [filterDate, setFilterDate] = useState(null); // State for the selected date

    useEffect(() => {
        // Initialize DataTable
        const table = $('#cisTable').DataTable({
            dom: 'Bfrtip',
            buttons: ['colvis'], // Add column visibility buttons
            drawCallback: function () {
                // Calculate total profit dynamically
                const api = this.api();
                /* const totalProfit = api
                    .column(13, { search: 'applied' })
                    .data()
                    .reduce((sum, val) => sum + parseFloat(val || 0), 0); */
               /*  $('#totalProfit').text(`Total Profit: ${totalProfit.toFixed(2)}`); */
            },
        });

        return () => {
            table.destroy();
        };
    }, []);

    // Filter the table by Sell Time date
    useEffect(() => {
        const table = $('#cisTable').DataTable();
        if (filterDate) {
            const formattedDate = filterDate.toISOString().split('T')[0]; // Format date to YYYY-MM-DD
            table
                .column(10) // Sell Time column index
                .search(formattedDate)
                .draw();
        } else {
            table.column(10).search('').draw(); // Clear the filter if no date selected
        }
    }, [filterDate]);

    if (!data || data.length === 0) {
        return <p>No records available.</p>;
    }

    return (
        <div className="">
            <h1 className="text-center mb-4">CIS Collection Data</h1>
            <div >
                <label htmlFor="sellDateFilter" className="form-label">
                    Filter by Sell Time:
                </label>
                <ReactDatePicker
                    id="sellDateFilter"
                    selected={filterDate}
                    onChange={(date) => setFilterDate(date)}
                    className="form-control"
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select a date"
                />
            </div>
            <table id="cisTable" className="table table-striped table-bordered" style={{ width: '75%' }}>
            <thead>
                    <tr>
                        <th>Trading Symbol</th>
                        <th>Buy Strategy</th>
               {/*          <th>Buy Qty</th> */}
                        <th>Buy Price</th>
                        <th>Buy Time</th>
                     {/*    <th>Sell Type</th> */}
                       {/*  <th>Sell Strategy</th> */}
                        <th>Stop Loss Strategy</th>
                       {/*  <th>Sell Qty</th> */}
                        <th>Sell Price</th>
                     {/*    <th>Sell Time</th> */}
                      {/*   <th>Have Live Position</th> */}
                        <th>Holding Time (mins)</th>
                        <th>Profit</th>
                        <th>Target Strategy</th>
                        <th>Target Price</th>
                      {/*   <th>Has Target</th> */}
                        {/* <th>Timestamp</th> */}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item._id}>
                            <td>{item.tradingSymbol}</td>
                            <td>{item.buyStrategy}</td>
                          {/*   <td>{item.buyQty}</td> */}
                            <td>{item.buyPrice}</td>
                            <td>{item.buyTime ? format(new Date(item.buyTime), 'yyyy-MM-dd HH:mm:ss') : 'N/A'}</td>
                          {/*   <td>{item.sellType}</td> */}
                           {/*  <td>{item.sellStrategy}</td> */}
                            <td>{item.stopLossStrategy}</td>
                       {/*      <td>{item.sellQty}</td> */}
                            <td>{item.sellPrice}</td>
                            {/* <td>{item.sellTime ? format(new Date(item.sellTime), 'yyyy-MM-dd HH:mm:ss') : 'N/A'}</td> */}
      {/*                       <td>{item.haveLivePosition ? 'Yes' : 'No'}</td> */}
                            <td>{item.holdingTime}</td>
                            <td>{item.profit}</td>
                            <td>{item.targetStrategy}</td>
                            <td>{item.targetPrice}</td>
                            {/* <td>{item.hasTarget ? 'Yes' : 'No'}</td> */}
                          {/*   <td>{item.timestamp ? format(new Date(item.timestamp), 'yyyy-MM-dd HH:mm:ss') : 'N/A'}</td> */}
                        </tr>
                    ))}
                </tbody>
            </table>
           {/*  <div className="mt-3">
                <h4 id="totalProfit">Total Profit: 0.00</h4>
            </div> */}
        </div>
    );
}
