import React, { useReducer, useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Form,
  Card,
  Button,
  FloatingLabel,
  Table,
} from "react-bootstrap";
import { URLS } from "../../routes";
import displayToast from "../../utils/displayToast";
import { validateInputField } from "../../utils/validations";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import { useHistory, useLocation } from "react-router";

const initialState = {
  selectedProducts: [],
  paymentDate: new Date(),
  id: -1,
  buyerId: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_PRODUCT":
      return {
        ...state,
        selectedProducts: [...state.selectedProducts, action.product],
      };

    case "DELETE_PRODUCT":
      return {
        ...state,
        selectedProducts: state.selectedProducts.filter(
          (p) => p.id !== action.product.id
        ),
      };

    case "UPDATE_BUYER":
      return {
        ...state,
        buyerId: action.buyerId,
      };

    case "UPDATE_PAYMENT_DATE":
      return {
        ...state,
        paymentDate: action.paymentDate,
      };

    case "UPDATE_QUANTITY":
      return {
        ...state,
        selectedProducts: action.productList,
      };

    case "UPDATE_ALL_FIELDS":
      return action.state;

    case "RESET":
      return initialState;

    default:
      return state;
  }
};

let isSubmitted = false;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function AddPurchaseOrder() {
  let query = useQuery();
  const poId = query.get("id");

  const [productList, setProductList] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);

  const [buyers, setBuyers] = useState([]);

  const [state, dispatch] = useReducer(reducer, initialState);
  const { selectedProducts, paymentDate, buyerId } = state;

  const [isLoading, setIsLoading] = useState(true);

  const history = useHistory();

  const [isUpdate, setIsUpdate] = useState(false);

  const fetchProducts = async () => {
    const url = URLS.GET_ALL_PRODUCTS;
    axios
      .get(url)
      .then(function (response) {
        setProductList(response.data);
        fetchBuyers();
      })
      .catch(function (error) {
        console.log(error);
        displayToast({ type: "error", msg: "Oops! Something went wrong" });
      });
  };

  const fetchBuyers = async () => {
    const url = URLS.GET_ALL_BUYERS;
    axios
      .get(url)
      .then(function (response) {
        // console.log(response);
        setBuyers(response.data);
        if (isUpdate) {
          fetchCurrentPo();
        } else {
          setIsLoading(false);
        }
      })
      .catch(function (error) {
        console.log(error);
        displayToast({ type: "error", msg: "Oops! Something went wrong" });
      });
  };

  useEffect(() => {
    let isActive = true;

    if (isActive) {
      isSubmitted = false;
      setIsUpdate(!!poId);
      fetchProducts();
    }

    return () => {
      isActive = false;
    };
  }, []);

  const fetchCurrentPo = async () => {
    const url = `${URLS.GET_PURCHASE_ORDERS_DETAILS}/${poId}`;
    axios
      .get(url)
      .then(function (response) {
        const { status } = response;

        if (status === 200) {
          dispatch({ type: "UPDATE_ALL_FIELDS", state: response.data });
        } else {
          displayToast({ type: "error", msg: "Oops! Something went wrong." });
          setIsLoading(false);
        }
      })
      .catch(function (error) {
        setIsLoading(false);
        console.log(error);
        displayToast({ type: "error", msg: error.msg });
      });
  };

  const handleProductChangne = (e) => {
    setCurrentProduct(e.target.value);
  };

  const addProduct = (e) => {
    setIsLoading(true);
    e.preventDefault();
    if (currentProduct) {
      if (selectedProducts.findIndex((p) => p.id == currentProduct) === -1) {
        const product = productList.find((i) => i.id == currentProduct);
        dispatch({ type: "ADD_PRODUCT", product });
      } else {
        displayToast({ type: "error", msg: "Product already added in list!" });
      }
    } else {
      displayToast({ type: "error", msg: "Please select a product!" });
    }
    setIsLoading(false);
  };

  const deleteProduct = (product) => {
    dispatch({ type: "DELETE_PRODUCT", product });
  };

  const handleQuantityChange = (e, product) => {
    const quantity = e.target.value;
    let isValid = false;

    const productList = selectedProducts.map((i) => {
      if (i.id == product.id) {
        if (quantity > i.quantity) {
          displayToast({
            type: "error",
            msg: "Quantity cannot be more than available quantity!",
          });
          return false;
        } else {
          isValid = true;
          return { ...i, selectedQuantity: quantity };
        }
      }
      return i;
    });

    if (isValid) {
      dispatch({ type: "UPDATE_QUANTITY", productList });
    }
  };

  const handleBuyerChangne = (e) => {
    dispatch({ type: "UPDATE_BUYER", buyerId: e.target.value });
  };

  const handleDateChange = (date) => {
    dispatch({ type: "UPDATE_PAYMENT_DATE", paymentDate: date });
  };

  const submitPo = () => {
    if (!isSubmitted) {
      isSubmitted = true;
      setIsLoading(true);

      if (
        validateInputField({ field: buyerId, fieldName: "buyer name" }) &&
        validateInputField({ field: paymentDate, fieldName: "payment date" })
      ) {
        if (selectedProducts.length > 0) {
          let isValid = true;
          for (let i = 0; i < selectedProducts.length; i++) {
            const { selectedQuantity } = selectedProducts[i];
            if (!selectedQuantity) {
              isValid = false;
              displayToast({
                type: "error",
                msg: "Please select a quantity for each product!",
              });
              return false;
            }
          }
          const date = dayjs(paymentDate).format("MM-DD-YYYY");

          if (isValid) {
            const buyer = buyers.find((b) => b.id == state.buyerId);

            const userProducts = selectedProducts.map((item) => {
              return {
                product: item,
                quantity: parseInt(item.selectedQuantity),
              };
            });

            const body = {
              buyer,
              paymentDueDate: date,
              products: userProducts,
              totalAmount: 0.0,
              paid: false,
            };

            submitPoAPi(body);
          }
        } else {
          isSubmitted = false;
          setIsLoading(false);
          displayToast({ type: "error", msg: "Please select a product!" });
        }
      } else {
        isSubmitted = false;
        setIsLoading(false);
      }
    }
  };

  const submitPoAPi = async (body) => {
    const url = URLS.ADD_PURCHASE_ORDERS;

    axios
      .post(url, body)
      .then(function (response) {
        const { status } = response;
        if (status === 200) {
          resetForm();
          displayToast({
            type: "success",
            msg: `Purchase Order added successfully!`,
          });
          setIsLoading(false);
          setTimeout(() => {
            history.push("/manage-purchase-order");
          }, 1000);
        } else {
          displayToast({ type: "error", msg: "Oops! Something went wrong." });
          setIsLoading(false);
        }
      })
      .catch(function (error) {
        setIsLoading(false);
        console.log(error);
        displayToast({ type: "error", msg: error.msg });
      });
  };

  const resetForm = () => {
    dispatch({ type: "RESET" });
  };

  let totalPrice = 0,
    totalAvlQty = 0,
    totalQty = 0,
    totalAmount = 0;

  selectedProducts.forEach((i) => {
    // totalPrice += i.price;
    // totalAvlQty += i.quantity;
    totalQty += i.selectedQuantity ? parseInt(i.selectedQuantity) : 0;
    totalPrice += i.selectedQuantity ? i.selectedQuantity * i.price : 0;
  });

  return (
    <React.Fragment>
      <Container fluid="lg">
        <Row className="container-main">
          <Col lg={6}>
            <h3 className="center-align">Add Purchase Order</h3>
          </Col>
        </Row>

        <Row className="container-main">
          <Col md={{ span: 10, offset: 1 }}>
            <Card>
              <Card.Body>
                {/* <Form onSubmit={addProduct}> */}
                <Row>
                  <Col lg={6}>
                    <FloatingLabel
                      controlId="floatingSelect"
                      label="Seelct Buyer"
                    >
                      <Form.Select
                        aria-label="Buyer List"
                        onChange={handleBuyerChangne}
                        defaultValue={buyerId}
                      >
                        <option value="" selected disabled>
                          Select a Buyer
                        </option>
                        {buyers.map((b) => {
                          return (
                            <option key={b.id} value={b.id}>
                              {b.companyName} - {b.ownerName}
                            </option>
                          );
                        })}
                      </Form.Select>
                    </FloatingLabel>
                  </Col>
                  <Col lg={6}>
                    <Form.Group className="mb-3" controlId="formBasicQuantity">
                      <Form.Label>Payment Date</Form.Label>
                      <DatePicker
                        selected={paymentDate}
                        onChange={(date) => handleDateChange(date)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <br />
                <Row>
                  <Col lg={5}>
                    <FloatingLabel
                      controlId="floatingSelect"
                      label="Seelct Products"
                    >
                      <Form.Select
                        aria-label="Product List"
                        onChange={handleProductChangne}
                      >
                        <option value="" selected disabled>
                          Select a Product
                        </option>
                        {productList.map((product) => {
                          return (
                            <option key={product.id} value={product.id}>
                              {product.productName}
                            </option>
                          );
                        })}
                      </Form.Select>
                    </FloatingLabel>
                  </Col>
                  <Col lg={1}>
                    <Button
                      variant="primary"
                      type="button"
                      onClick={addProduct}
                      disabled={isLoading}
                    >
                      Add
                    </Button>
                  </Col>
                </Row>
                {/* </Form> */}
              </Card.Body>
            </Card>
            <br />
            <Card>
              <Card.Body>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Sr. No.</th>
                      <th>Product Name</th>
                      <th>Price</th>
                      <th>Available Quantity</th>
                      <th>Quantity</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedProducts.map((product, index) => {
                      const {
                        id,
                        productName,
                        quantity,
                        price = 0,
                        selectedQuantity = 0,
                      } = product;

                      return (
                        <tr key={id}>
                          <td>{index + 1}</td>
                          <td>{productName}</td>
                          <td>{price}</td>
                          <td>{quantity}</td>
                          <th>
                            <Form.Group
                              className="mb-3"
                              controlId="formBasicQuantity"
                            >
                              <Form.Label>Quantity</Form.Label>
                              <Form.Control
                                type="number"
                                value={selectedQuantity}
                                onChange={(e) =>
                                  handleQuantityChange(e, product)
                                }
                                placeholder="Enter Quantity"
                              />
                            </Form.Group>
                          </th>
                          <td>
                            <Button
                              onClick={() => deleteProduct(product)}
                              variant="danger"
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="2">Total</td>
                      <td>{totalPrice}</td>
                      {/* <td>{totalAvlQty}</td> */}
                      <td></td>
                      <td>
                        <Form.Group
                          className="mb-3"
                          controlId="formBasicQuantity"
                        >
                          <Form.Control
                            type="number"
                            readOnly
                            value={totalQty}
                            placeholder="Enter Quantity"
                          />
                        </Form.Group>
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </Table>
              </Card.Body>
            </Card>
            <br />
            <Row>
              <Col md={{ span: 6, offset: 5 }}>
                {/* <Form onSubmit={submitPo}> */}
                <Button
                  variant="success"
                  disabled={isLoading}
                  className="center-align"
                  type="button"
                  onClick={submitPo}
                >
                  Save
                </Button>
                {/* </Form> */}
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </React.Fragment>
  );
}

export default AddPurchaseOrder;
