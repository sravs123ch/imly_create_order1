import React, { useState,useContext,useEffect } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Paper, IconButton } from '@mui/material';
import { FaUpload, FaEdit, FaTrashAlt } from 'react-icons/fa';
import { IoMdAddCircleOutline } from 'react-icons/io';
import { AiOutlineEye } from 'react-icons/ai';
import { FiDownload } from 'react-icons/fi';
import StatusBadge from './Statuses'; // Make sure you have this component
import Step2 from './payment';
import { useNavigate } from 'react-router-dom';
import {CREATEORUPDATE_ORDER_HISTORY__API} from "../../Constants/apiRoutes";
import LoadingAnimation from '../../components/Loading/LoadingAnimation';
import { IdContext } from '../../Context/IdContex';
import { GETORDERBYID_API } from "../../Constants/apiRoutes";



const YourComponent = ({ onBack, onNext }) => {
  // Define state for orders, images, pdfPreview, errors, etc.
  const [orderDetails, setOrderDetails] = useState({
    OrderStatus: '',
    assginto: '',
    ExpectedDurationDays: '',
    DeliveryDate: '',
    // Add other fields as needed
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [showModal, setShowModal] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  { activeStep === 2 && <Step2 /> }
  const { generatedId,customerId,orderDate} = useContext(IdContext);
  const saveOrderHistory = () => {
    const orderHistoryData = {
      TenantID: 1,
      OrderHistoryID:0,
      OrderID: generatedId,
      StatusID: 1,
      StartDate: orderDate,
      EndDate: orderDetails.DeliveryDate,
      AssignTo: "2",
      Comments: "Not Important",
      UserID: 2,
      OrderStatus: orderDetails.OrderStatus,
      CreatedBy: "sandy",
    };
    fetch(CREATEORUPDATE_ORDER_HISTORY__API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderHistoryData),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success || data.message === 'Status created successfully') {
          setPopupMessage('✔️' +'Status created successfully');
          setShowModal(true);
          closeModalAndMoveToNextStep(); // Close modal and move to next step
        } else {
          setPopupMessage((data.message || 'Unknown error'));
          setShowModal(true);
          closeModalAfterDelay(); // Close modal after a delay for errors
        }
      })
      .catch((error) => {
        setPopupMessage('❌' + error.message);
        setShowModal(true);
        closeModalAfterDelay(); // Close modal after a delay for errors
      });
  }
  
  const closeModalAndMoveToNextStep = () => {
    setTimeout(() => {
      setShowModal(false);
      onNext(); // Move to next step after 4 seconds
    }, 4000); // Close after 4 seconds
  };
  
  const closeModalAfterDelay = () => {
    setTimeout(() => {
      setShowModal(false); // Close modal after a delay
    }, 4000); // Close after 4 seconds
  };
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`${GETORDERBYID_API}/${generatedId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        setOrderDetails(data); // Set data to state
        console.log(setOrderDetails)
      } catch (err) {
        setError(err.message); // Handle error
      } finally {
        setLoading(false); // Stop loading spinner
      }
    };

    fetchOrderDetails(); // Trigger API call when the component mounts
  }, []); // Empty dependency array means this effect runs once on component mount
  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderDetails((prev) => ({ ...prev, [name]: value }));
  };
  const handledate = (e) => {
    const { name, value } = e.target;

    setOrderDetails((prevDetails) => {
      const updatedDetails = { ...prevDetails, [name]: value };

      // If ExpectedDurationDays is changed, validate and update DeliveryDate automatically
      if (name === "ExpectedDurationDays") {
        const days = parseInt(value, 10); // Parse the value as an integer

        if (!isNaN(days) && days >= 0) {
          // Only update DeliveryDate if the value is a valid non-negative number
          const today = new Date();
          const deliveryDate = addDays(today, days + 1); // Add 1 extra day for a 5-day gap
          updatedDetails.DeliveryDate = deliveryDate;

          // Clear any previous error
          setErrors((prevErrors) => ({
            ...prevErrors,
            ExpectedDurationDays: '',
          }));
        } else if (value === '') {
          // Clear DeliveryDate if ExpectedDurationDays is cleared
          updatedDetails.DeliveryDate = '';
        } else {
          // Set an error message if the value is not a valid number
          setErrors((prevErrors) => ({
            ...prevErrors,
            ExpectedDurationDays: 'Please enter a valid number of days.',
          }));
        }
      }

      return updatedDetails;
    });
  };
  const handleDateChanging = (e) => {
    const { value } = e.target;
    setOrderDetails((prevDetails) => ({
      ...prevDetails,
      DeliveryDate: value, // Manually update the DeliveryDate
    }));
  };
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 6) {
      alert("You can only upload up to 6 images.");
      return;
    }
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages([...images, ...newImages]);
    setImagePreviews([
      ...imagePreviews,
      ...newImages.map((img) => img.preview),
    ]);
  };
  const handleImageRemove = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };
  const handlePdfRemove = () => {
    setPdfFile(null);
    setPdfPreview("");
  };
  const [file, setFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  const handleAddOrder = () => {
    // Validate the form fields
    const newErrors = {};
    if (!orderDetails.OrderStatus)
      newErrors.OrderStatus = "Order Status is required";
    if (!orderDetails.assginto) newErrors.assginto = "Assign To is required";
    if (!orderDetails.ExpectedDurationDays)
      newErrors.ExpectedDurationDays =
        "Expected Duration (In Days) is required";

    setErrors(newErrors);


    if (Object.keys(newErrors).length === 0) {
      // Add the order to the orders array
      setOrders([...orders, orderDetails]);

      // Clear the form fields
      setOrderDetails({
        OrderStatus: "",
        assginto: "",
        ExpectedDurationDays: "",
      });
    }
  };
  const handleDelete = () => {
    setFile(null);
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const addDays = (date, days) => {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
  };
  const handleCancel = () => {
    // Example: Reset form or navigate to a different page
    console.log('Cancel clicked');
    // If you want to navigate away from the form, for example:
    navigate('/Orders');  // This assumes you're using `react-router-dom` for navigation
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: " 1fr" }, // Ensure proper grid layout
        gap: 2, // Adjust spacing between items
        justifyContent: "center",
        alignItems: "center",
        pt: 2,
      }}
    >
      <>
        <div className="flex flex-col items-center sm:ml-0 lg:ml-50 gap-4">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full">
            <label className="sm:w-1/4 w-full text-left text-xs font-medium text-gray-700">
              Order Status:
            </label>
            <select
              name="OrderStatus"
              value={orderDetails.OrderStatus}
              onChange={handleChange}
              className={`p-1 w-full sm:w-1/4 border rounded-md ${errors.OrderStatus ? "border-red-500" : "border-gray-300"}`}
            >
              <option value="">Select a Status</option>
              <option value="Quick Qoute">Quick Qoute</option>
              <option value="Initial Design">Initial Design</option>
              <option value="Initial Measurements">Initial Measurements</option>
              <option value="Revised Design(R1,R2,R#)">Revised Design(R1,R2,R#)</option>
              <option value="Final Measurement">Final Measurement</option>
              <option value="Signup Document">Signup Document</option>
              <option value="Production">Production</option>
              <option value="PDI">PDI</option>
              <option value="Dispatch">Dispatch</option>
              <option value="Installation">Installation</option>
              <option value="Completion">Completion</option>
              <option value="Canceled">Canceled</option>
            </select>
            {errors.OrderStatus && (
              <p className="text-red-500 text-sm ml-2">
                {errors.OrderStatus}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full">
            <label className="sm:w-1/4 w-full text-left text-xs font-medium text-gray-700">
              Comments
            </label>
            <input
              type="text"
              name="assginto"
              value={orderDetails.assginto}
              onChange={handleChange}
              className={`p-1 w-full sm:w-1/4 border rounded-md ${errors.assginto ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.assginto && (
              <p className="text-red-500 text-sm ml-2">
                {errors.assginto}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full">
            <label className="sm:w-1/4 w-full text-left text-xs font-medium text-gray-700">
              Expected Duration (In Days):
            </label>
            <input
              type="number"
              name="ExpectedDurationDays"
              value={orderDetails.ExpectedDurationDays}
              onChange={handledate}
              className={`p-1 w-full sm:w-1/4 border rounded-md ${errors.ExpectedDurationDays ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.ExpectedDurationDays && (
              <p className="text-red-500 text-sm ml-2">
                {errors.ExpectedDurationDays}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full">
            <label className="sm:w-1/4 w-full text-left text-xs font-medium text-gray-700">
              Delivery Date:
            </label>
            <input
              type="date"
              name="DeliveryDate"
              value={orderDetails.DeliveryDate}
              onChange={handleDateChanging}
              className={`p-1 w-full sm:w-1/4 border rounded-md ${errors.DeliveryDate ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.DeliveryDate && (
              <p className="text-red-500 text-sm ml-2">
                {errors.DeliveryDate}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full">
            <label className="sm:w-1/4 w-full text-left text-xs font-medium text-gray-700">
              Upload Document:
            </label>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf,.doc,.docx"
              onChange={handleImageChange}
              className="hidden"
              id="UploadFiles"
            />
            <label
              htmlFor="UploadFiles"
              className="flex items-center justify-center px-4 py-2 p-1 w-full sm:w-1/4 border rounded-md border border-black-500 text-black-500 cursor-pointer hover:bg-blue-50"
            >
              <FaUpload className="mr-2" />
              <span>Upload File</span>
            </label>
          </div>

          {images.length > 0 && (
            <div className="flex items-center mt-2 space-x-2 flex-wrap">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative inline-block">
                  <img
                    src={preview}
                    alt={`Preview ${index}`}
                    className="w-24 h-24 object-cover"
                  />
                  <button
                    onClick={() => handleImageRemove(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full text-xs"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}

          {pdfPreview && (
            <div className="mt-2 flex items-center">
              <a
                href={pdfPreview}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View PDF
              </a>
              <button
                onClick={handlePdfRemove}
                className="ml-4 bg-red-500 text-white p-1 rounded-full text-xs"
              >
                x
              </button>
            </div>
          )}
        </div>

        <div className="relative mt-10 flex justify-end gap-4">
        <div className="mt-6 flex justify-end gap-4">
                    <button
                      type="submit"
                      className="button-base save-btn"
                      onClick={() => {
                        saveOrderHistory();
                        handleAddOrder();
                      }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="button-base cancel-btn"
                    >
                    Cancel
                    </button>

                  </div>
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-lg p-6 text-center shadow-lg w-11/12 max-w-sm">
                <p className="text-lg">{popupMessage}</p>
              </div>
            </div>
          )}
        </div>



        {orders.length >= 0 && (
          <>
            <TableContainer component={Paper} className="mt-4 shadow-md">
              <Table aria-label="orders table" className="min-w-full border-collapse border border-gray-300">
                <TableHead className="bg-custom-darkblue">

                  <TableRow>
                    <TableCell align="center" sx={{ borderRight: '1px solid #e5e7eb', color: 'white', fontWeight: 'bold' }}>
                      Order Status
                    </TableCell>
                    <TableCell align="center" sx={{ borderRight: '1px solid #e5e7eb', color: 'white', fontWeight: 'bold' }}>
                      Comments
                    </TableCell>
                    <TableCell align="center" sx={{ borderRight: '1px solid #e5e7eb', color: 'white', fontWeight: 'bold' }}>
                      Delivery Date
                    </TableCell>
                    <TableCell align="center" sx={{ borderRight: '1px solid #e5e7eb', color: 'white', fontWeight: 'bold' }}>
                      Document
                    </TableCell>
                    <TableCell align="center" sx={{ borderRight: '1px solid #e5e7eb', color: 'white', fontWeight: 'bold' }}>
                      Edit
                    </TableCell>
                    <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                      Delete
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order, index) => (
                    <TableRow key={index} className="hover:bg-gray-100">
                      <TableCell align="center" className="border-r border-gray-300">
                        <StatusBadge status={order.OrderStatus} />
                      </TableCell>
                      <TableCell align="center" className="border-r border-gray-300">
                        {order.assginto}
                      </TableCell>
                      <TableCell align="center" className="border-r border-gray-300">
                        {order.DeliveryDate}
                      </TableCell>
                      <TableCell align="center" className="border-r border-gray-300">
                        <IconButton href={order.documentUrl} target="_blank" rel="noopener noreferrer" color="primary">
                          <AiOutlineEye size={20} />
                          <span className="ml-2 font-bold text-sm">View</span>
                        </IconButton>
                        <IconButton href={order.documentUrl} download color="success">
                          <FiDownload size={20} />
                          <span className="font-bold text-sm">Download</span>
                        </IconButton>
                      </TableCell>


                      <TableCell align="center" className="border-r border-gray-300">
                        <IconButton color="primary">
                          <FaEdit size={20} />
                        </IconButton>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton onClick={() => handleDelete(order)} color="error">
                          <FaTrashAlt size={20} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={orders.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </>
    </Box>
  );
};

export default YourComponent;