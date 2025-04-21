import axios from "axios";
import React, { useReducer, useState, useEffect } from "react";
import { Container, Row, Col, Form, Card, Button } from "react-bootstrap";
import { URLS } from "../../routes";
import displayToast from "../../utils/displayToast";
import { validateInputField } from "../../utils/validations";
import { useHistory, useLocation } from "react-router";

const initialState = {
  ownerName: "",
  companyName: "",
  zipcode: "",
  id: -1,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "BUYER_NAME":
      return {
        ...state,
        ownerName: action.ownerName,
      };

    case "COMPANY_NAME":
      return {
        ...state,
        companyName: action.companyName,
      };

    case "COMPANY_ZIPCODE":
      return {
        ...state,
        zipcode: action.zipcode,
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

function AddBuyer() {
  let query = useQuery();
  const buyerId = query.get("id");
  const [state, dispatch] = useReducer(reducer, initialState);
  const { ownerName, companyName, zipcode, id } = state;
  const history = useHistory();
  const [isUpdate, setIsUpdate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    let isPageUpdate = false;

    if (buyerId) {
      isPageUpdate = true;
    }
    setIsUpdate(isPageUpdate);

    if (isActive && isPageUpdate) {
      setIsLoading(true);
      fetchBuyer();
    } else {
      setIsLoading(false);
    }
    return () => {
      isActive = false;
    };
  }, []);

  const fetchBuyer = async () => {
    const url = `${URLS.GET_BUYER_DETAILS}/${buyerId}`;

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

  const handleOwnerNameChange = (event) => {
    dispatch({
      type: "BUYER_NAME",
      ownerName: event.target.value,
    });
  };

  const handleCompanyNameChange = (event) => {
    dispatch({
      type: "COMPANY_NAME",
      companyName: event.target.value,
    });
  };

  const handleZipcodeChange = (event) => {
    dispatch({
      type: "COMPANY_ZIPCODE",
      zipcode: event.target.value,
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
      validateInputField({ field: ownerName, fieldName: "owner name" }) &&
      validateInputField({ field: companyName, fieldName: "company name" }) &&
      validateInputField({ field: zipcode, fieldName: "zipcode" })
    ) {
      const body = { ownerName, companyName, zipcode };
      const url = isUpdate ? URLS.EDIT_BUYER : URLS.ADD_BUYER;

      if (isUpdate) {
        body.id = id;
      }

      axios[isUpdate ? "put" : "post"](url, body)
        .then(function (response) {
          const { status } = response;
          if (status === 200) {
            resetForm();
            displayToast({
              type: "success",
              msg: `${
                isUpdate ? ownerName + " updated" : "Buyer added"
              } successfully!`,
            });
            setIsLoading(false);
            setTimeout(() => {
              history.push("/manage-buyers");
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
              {isUpdate ? "Update" : "Add"} Buyer
            </h3>
          </Col>
        </Row>
        <Row className="container-main">
          <Col md={{ span: 6, offset: 3 }}>
            <Card>
              <Card.Body>
                <Form onSubmit={submitForm}>
                  <Form.Group className="mb-3" controlId="formBasicownerName">
                    <Form.Label>Owner Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={ownerName}
                      onChange={handleOwnerNameChange}
                      placeholder="Enter Buyer Name"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formBasicCompanyName">
                    <Form.Label>Company Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={companyName}
                      onChange={handleCompanyNameChange}
                      placeholder="Enter Company Name"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formBasicZipcode">
                    <Form.Label>Zipcode</Form.Label>
                    <Form.Control
                      type="text"
                      value={zipcode}
                      onChange={handleZipcodeChange}
                      placeholder="Enter Zipcode"
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

export default AddBuyer;
