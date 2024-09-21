import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import PrinterIcon from "@mui/icons-material/Print";
import { Edit } from "@mui/icons-material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
import StatusBadge from "./Statuses";
import FilterBar from "./FilterBar";

import { AiOutlineEdit } from "react-icons/ai";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Button, TextField, InputAdornment } from "@mui/material";
import { MdOutlineCancel } from "react-icons/md";
import {OrderContext} from "../../Context/orderContext";
import axios from "axios";
import {GETORDERBYID_API} from "../../Constants/apiRoutes";
import {GET_ALL_ORDERS} from "../../Constants/apiRoutes";

import {
  StyledTableCell,
  StyledTableRow,
} from "../CustomTablePagination";
import "../../style.css";



const Orders = () => {
  const [products, setProducts] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();



  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(GET_ALL_ORDERS, {
          params: {
            page: 1,
            limit: 10,
          },
        });
        
        const result = await response.json();
        console.log('Fetched result:', result);

        // Assuming result contains a "data" field for orders
        setProducts(result.data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);
  // const handleOrderUpdate = (orderId) => {
  //   navigate("/Addorders", { state: { orderId } });const handleEditClick = async (roleId) => {
  // };
  const getOrderById = async (orderId) => {
    try {
      const response = await axios.get(
        // `https://imlystudios-backend-mqg4.onrender.com/api/userrole/getRoleById/${roleId}`
     `${GETORDERBYID_API}/${orderId}`,
      );
      console.log("UserRole retrieved successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching UserRole:", error);
      throw error;
    }
  };
  const handleEditClick = async (orderId) => {
    try {
      const orderIdDetails= await getOrderById(orderId);
      setOrderIdDetails(orderIdDetails);
      navigate("/Addorders");
    } catch (error) {
      console.error("Error fetching UserRole details:", error);
    }
  };

  const handleCancel = (id) => {
    const newStatus = "Canceled";
    setProducts((prevItems) =>
      prevItems.map((item) =>
        item.OrderID === id ? { ...item, OrderStatus: newStatus } : item
      )
    );
  };


  const filteredOrders = products.filter(
    (product) =>
      selectedFilter === "All" || product.OrderStatus === selectedFilter
  );

  const paginatedData = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const { setOrderIdDetails } = useContext(OrderContext);

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-4 ml-10 lg:ml-72 w-auto">
      <div className="px-4 sm:px-6 lg:px-8 pt-4 w-auto bg-white">
        <div className="sm:flex sm:items-center sm:justify-between">
          {/* Title Section */}
          <div className="sm:flex-auto">
            <h2 className="w-auto text-xl mb-5 font-semibold">Orders</h2>
          </div>

          {/* Container for centering search box */}
          <div className="flex w-[60%] justify-center sm:justify-center">
            <TextField
              variant="outlined"
              placeholder="Search by Order Number / Customer Name"
              size="small"
              sx={{
                width: { xs: "100%", sm: "100%", md: "400px", lg: "500px" },
                mb: { xs: 1, sm: 0 },
                mx: { xs: 0, sm: 1 },
              }}
              InputProps={{
                sx: {
                  fontSize: "0.875rem",
                  ":hover fieldset": {
                    borderColor: "#003375",
                  },
                },
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </div>

          {/* Container for buttons aligned at the end */}
          <div className="sm:flex sm:items-center sm:ml-auto sm:justify-end">
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center",
                gap: { xs: 2, sm: 1 },
              }}
            >
              {/* Create Order Button */}
              <Button
                variant="contained"
                disableRipple
                sx={{
                  backgroundColor: "#003375",
                  color: "white",
                  mx: { xs: 0, sm: 1 },
                  mb: { xs: 1, sm: 0 },
                  boxShadow: "none",
                  textTransform: "capitalize",
                  fontSize: "0.875rem",
                  ":hover": {
                    backgroundColor: "#cadcfc",
                    color: "#374151",
                    boxShadow: "none",
                  },
                  width: { xs: "100%", sm: "auto" },
                }}
                startIcon={<HomeIcon />}
                href="/AddOrders"
              >
                Create Order
              </Button>

              {/* Export Order Button */}
              <Button
                variant="contained"
                disableRipple
                sx={{
                  backgroundColor: "#003375",
                  color: "white",
                  mr: { xs: 0, sm: 0 },
                  boxShadow: "none",
                  textTransform: "capitalize",
                  fontSize: "0.875rem",
                  ":hover": {
                    backgroundColor: "#cadcfc",
                    color: "#374151",
                    boxShadow: "none",
                  },
                  width: { xs: "100%", sm: "auto" },
                }}
                startIcon={<PrinterIcon />}
                href="/create-order"
              >
                Export Order
              </Button>
            </Box>
          </div>
        </div>

        <div className="flex justify-center md:justify-center mb-4 px-4 md:px-0 mt-6">
          <div className="flex flex-wrap justify-center space-x-2 md:space-x-2 md:justify-center lg:justify-end">
            <FilterBar
              selectedFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
            />
          </div>
        </div>

        {/* <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Order Number</StyledTableCell>
                <StyledTableCell>Order Date</StyledTableCell>
                <StyledTableCell align="center">Project Type</StyledTableCell>
                <StyledTableCell align="center">Customer Name</StyledTableCell>
                <StyledTableCell align="center">Order Status</StyledTableCell>
                <StyledTableCell align="center" colSpan={2}>
                  Update
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((product) => (
                <StyledTableRow key={product.OrderID}>
                  <StyledTableCell>{product.OrderNumber}</StyledTableCell>
                  <StyledTableCell>
                    {new Date(product.OrderDate).toLocaleDateString()} <br />
                    {new Date(product.OrderDate).toLocaleTimeString()}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {product.Type}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {product.OrderBy}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <StatusBadge status={product.OrderStatus} />
                  </StyledTableCell>
                  <StyledTableCell>
                    <div className="button-container">
  <button
    type="button"
    onClick={() => handleEditClick(product.OrderID)}
    className="button edit-button"
  >
    <AiOutlineEdit aria-hidden="true" className="h-4 w-4" />
    Edit
  </button>

  <button
    type="button"
    onClick={() => handleCancel(product.OrderID)}
    className="button delete-button"
  >
    <MdOutlineCancel aria-hidden="true" className="h-4 w-4" />
    Delete
  </button>
</div>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredOrders.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer> */}
        <TableContainer component={Paper}>
  <Table
    sx={{ minWidth: 700, tableLayout: "fixed" }}  // Ensure equal width columns
    aria-label="customized table"
  >
    <TableHead>
      <TableRow>
        <StyledTableCell align="center" sx={{ width: '15%' }}>Order Number</StyledTableCell>
        <StyledTableCell align="center" sx={{ width: '15%' }}>Order Date</StyledTableCell>
        <StyledTableCell align="center" sx={{ width: '15%' }}>Project Type</StyledTableCell>
        <StyledTableCell align="center" sx={{ width: '20%' }}>Customer Name</StyledTableCell>
        <StyledTableCell align="center" sx={{ width: '15%' }}>Order Status</StyledTableCell>
        <StyledTableCell align="center" sx={{ width: '20%' }} colSpan={2}>Update</StyledTableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {paginatedData.map((product) => (
        <StyledTableRow key={product.OrderID}>
          <StyledTableCell align="center">{product.OrderNumber}</StyledTableCell>
          <StyledTableCell align="center">
            {new Date(product.OrderDate).toLocaleDateString()} <br />
            {new Date(product.OrderDate).toLocaleTimeString()}
          </StyledTableCell>
          <StyledTableCell align="center">{product.Type}</StyledTableCell>
          <StyledTableCell align="center">{product.OrderBy}</StyledTableCell>
          <StyledTableCell align="center">
            <StatusBadge status={product.OrderStatus} />
          </StyledTableCell>
          <StyledTableCell align="center">
            <div className="button-container">
              <button
                type="button"
                onClick={() => handleEditClick(product.OrderID)}
                className="button edit-button"
              >
                <AiOutlineEdit aria-hidden="true" className="h-4 w-4" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleCancel(product.OrderID)}
                className="button delete-button"
              >
                <MdOutlineCancel aria-hidden="true" className="h-4 w-4" />
                Delete
              </button>
            </div>
          </StyledTableCell>
        </StyledTableRow>
      ))}
    </TableBody>
  </Table>
  <TablePagination
    rowsPerPageOptions={[5, 10, 25]}
    component="div"
    count={filteredOrders.length}
    rowsPerPage={rowsPerPage}
    page={page}
    onPageChange={handleChangePage}
    onRowsPerPageChange={handleChangeRowsPerPage}
  />
</TableContainer>

      </div>
    </div>
  );
};

export default Orders;
