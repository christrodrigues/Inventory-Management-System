import React, { useReducer, useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Form, Card, Button } from "react-bootstrap";
import { URLS } from "../../routes";
import displayToast from "../../utils/displayToast";
import { validateInputField } from "../../utils/validations";
import { useHistory, useLocation } from "react-router";

const initialState = {
  productName: "",
  quantity: 0,
  price: 0,
  id: -1,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "PRODUCT_NAME":
      return {
        ...state,
        productName: action.productName,
      };

    case "PRODUCT_QUANTITY":
      return {
        ...state,
        quantity: action.quantity,
      };

    case "PRODUCT_PRICE":
      return {
        ...state,
        price: action.price,
      };

    case "RESET":
      return initialState;

    case "UPDATE_ALL_FIELDS":
      return action.state;

    default:
      return state;
  }
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function AddProduct() {
  let query = useQuery();
  const productId = query.get("id");
  const [state, dispatch] = useReducer(reducer, initialState);
  const { productName, quantity, price, id } = state;
  const history = useHistory();
  const [isUpdate, setIsUpdate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    let isPageUpdate = false;

    if (productId) {
      isPageUpdate = true;
    }

    setIsUpdate(isPageUpdate);

    if (isActive && isPageUpdate) {
      setIsLoading(true);
      fetchProduct();
    } else {
      setIsLoading(false);
    }
    return () => {
      isActive = false;
    };
  }, []);

  const fetchProduct = async () => {
    const url = `${URLS.GET_PRODUCT_DETAILS}/${productId}`;

    axios
      .get(url)
      .then(function (response) {
        setIsLoading(false);
        // console.log({response});
        // debugger;
        dispatch({ type: "UPDATE_ALL_FIELDS", state: response.data });
      })
      .catch(function (error) {
        console.log(error);
        displayToast({ type: "error", msg: error.msg });
      });
  };

  const handleProductNameChange = (event) => {
    dispatch({
      type: "PRODUCT_NAME",
      productName: event.target.value,
    });
  };

  const handleQuantityChange = (event) => {
    dispatch({
      type: "PRODUCT_QUANTITY",
      quantity: event.target.value,
    });
  };

  const handlePriceChange = (event) => {
    dispatch({
      type: "PRODUCT_PRICE",
      price: event.target.value,
    });
  };

  const resetForm = () => {
    dispatch({
      type: "RESET",
    });
  };

  const submitForm = (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (
      validateInputField({ field: productName, fieldName: "product name" }) &&
      validateInputField({ field: quantity, fieldName: "quantity" }) &&
      validateInputField({ field: price, fieldName: "price" })
    ) {
      const body = { productName, quantity, price, purchaseOrder: [] };
      const url = isUpdate ? URLS.EDIT_PRODUCT : URLS.ADD_PRODUCT;

      if (isUpdate) {
        body.id = id;
      }
      debugger;
      axios[isUpdate ? "put" : "post"](url, body)
        .then(function (response) {
          const { status } = response;
          if (status === 200) {
            resetForm();
            displayToast({
              type: "success",
              msg: `${
                isUpdate ? productName + " updated" : "Product added"
              } successfully!`,
            });
            setIsLoading(false);
            setTimeout(() => {
              history.push("/manage-products");
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
    } else {
      setIsLoading(false);
      // displayToast({type : "error", msg : "Login Failed!"});
    }
  };

  return (
    <React.Fragment>
      <Container fluid="lg">
        <Row className="container-main">
          <Col>
            <h3 className="center-align">
              {isUpdate ? "Update" : "Add"} Product
            </h3>
          </Col>
        </Row>
        <Row className="container-main">
          <Col md={{ span: 6, offset: 3 }}>
            <Card>
              <Card.Body>
                <Form onSubmit={submitForm}>
                  <Form.Group className="mb-3" controlId="formBasicProductName">
                    <Form.Label>Product Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={productName}
                      onChange={handleProductNameChange}
                      placeholder="Enter Product Name"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formBasicQuantity">
                    <Form.Label>Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      value={quantity}
                      onChange={handleQuantityChange}
                      placeholder="Enter Quantity"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formBasicPrice">
                    <Form.Label>Price</Form.Label>
                    <Form.Control
                      type="number"
                      value={price}
                      onChange={handlePriceChange}
                      placeholder="Enter Price"
                    />
                  </Form.Group>

                  <Button disabled={isLoading} variant="success" type="submit">
                    Save
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </React.Fragment>
  );
}

export default AddProduct;
