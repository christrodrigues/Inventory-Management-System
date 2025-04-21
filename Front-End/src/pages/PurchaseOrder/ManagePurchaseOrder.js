import axios from "axios";
import React, { useEffect, useState } from "react";
import { Container, Row, Button, Col, Table, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { URLS } from "../../routes";
import displayToast from "../../utils/displayToast";

function ManagePurchaseOrder() {
  const [pos, setPos] = useState([]);
  const [currentPo, setCurrentPo] = useState(null);
  const [currentPo1, setCurrentPo1] = useState(null);

  const [show, setShow] = useState(false);
  const handleClose = () => {
    setShow(false);
    setCurrentPo(null);
  };

  const [show1, setShow1] = useState(false);
  const handleClose1 = () => {
    setShow1(false);
    setCurrentPo1(null);
  };

  const handleShow = () => setShow(true);
  const handleShow1 = () => setShow1(true);

  useEffect(() => {
    let isActive = true;

    if (isActive) {
      fetchPos();
    }
    return () => {
      isActive = false;
    };
  }, []);

  const fetchPos = async () => {
    const url = URLS.GET_ALL_PURCHASE_ORDERS;
    axios
      .get(url)
      .then(function (response) {
        console.log(response);
        const { status } = response;
        if (status === 200) {
          setPos(response.data);
        }
      })
      .catch(function (error) {
        console.log(error);
        displayToast({ type: "error", msg: "Oops! Something went wrong" });
      });
  };

  const makePayment = async () => {
    const url = URLS.GENERATE_INVOICE + currentPo1.id;

    axios
      .post(url)
      .then(function (response) {
        if (response.status === 200) {
          handleClose1();
          setCurrentPo1(null);
          displayToast({
            type: "success",
            msg: "Invoice generated successfully!",
          });
          fetchPos();
        } else {
          displayToast({ type: "error", msg: "Oops! Something went wrong" });
        }
      })
      .catch(function (error) {
        console.log(error);
        displayToast({ type: "error", msg: "Oops! Something went wrong" });
      });
  };

  const deletePoConfirmation = (b) => {
    setCurrentPo(b);
    handleShow();
  };

  const deletePurchaseOrder = async () => {
    const url = URLS.DELETE_PURCHASE_ORDER + currentPo.id;
    // const data = {
    //     id : currentBuyer.id
    // };
    axios
      .delete(url)
      .then(function (response) {
        handleClose();
        // console.log(response);
        displayToast({
          type: "success",
          msg: "Purchase Order deleted successfully!",
        });
        fetchPos();
      })
      .catch(function (error) {
        console.log(error);
        displayToast({ type: "error", msg: "Oops! Something went wrong" });
      });
  };

  const generateInvoiceConfirmation = (item) => {
    setCurrentPo1(item);
    handleShow1();
  };

  return (
    <Container className="container-main">
      <Row className="container-main">
        <Col>
          <Link to="/add-purchase-order">
            <Button style={{ backgroundColor: "#90E4C1", color:"BLACK" }}>Add Purchase Order</Button>
          </Link>
        </Col>

      </Row>
      <Row>
        <Table className="table table-success">
          <div id="customers">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Company Name</th>
                <th>Total Products</th>
                <th>Total Price</th>
                <th>Payment Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {pos.map((item, index) => {
                const {
                  id,
                  products,
                  paymentDueDate,
                  paid,
                  invoice,
                  buyer = {},
                  totalAmount,
                } = item;
                let { companyName = "" } = buyer;

                return (
                  <tr key={id}>
                    <td>{index + 1}</td>
                    <td>{companyName}</td>
                    <td>{products.length}</td>
                    <td>{totalAmount}</td>
                    <td>{paymentDueDate}</td>
                    <td>{paid ? "Paid" : "Unpaid"}</td>
                    <td>
                      {/* <Link to={`/edit-purchase-order/?id=${id}`}><Button variant="primary">Edit</Button>{' '}</Link> */}
                      {paid ? (
                        " - "
                      ) : (
                        <React.Fragment>
                          <Button
                            onClick={() => generateInvoiceConfirmation(item)}
                            variant="secondary"
                          >
                            Generate Invoice
                          </Button>{" "}
                          <Button
                            onClick={() => deletePoConfirmation(item)}
                            variant="danger"
                          >
                            Delete
                          </Button>
                        </React.Fragment>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </div>
        </Table>
      </Row>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this Purchase Order?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="danger" onClick={deletePurchaseOrder}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={show1} onHide={handleClose1}>
        <Modal.Header closeButton>
          <Modal.Title>Payment Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          You are about to generate invoice and make full payment. Are you sure
          you want to continue?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleClose1}>
            No
          </Button>
          <Button variant="info" onClick={makePayment}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ManagePurchaseOrder;
