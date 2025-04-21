import axios from "axios";
import React, { useEffect, useState } from "react";
import { Container, Row, Button, Col, Table, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { URLS } from "../../routes";
import displayToast from "../../utils/displayToast";
import "./ManageBuyers.css";
function ManageBuyer() {
  const [buyers, setBuyers] = useState([]);
  const [currentBuyer, setCurrentBuyer] = useState(null);

  const [show, setShow] = useState(false);
  const handleClose = () => {
    setShow(false);
    setCurrentBuyer(null);
  };

  const handleShow = () => setShow(true);

  useEffect(() => {
    let isActive = true;

    if (isActive) {
      fetchBuyers();
    }
    return () => {
      isActive = false;
    };
  }, []);

  const fetchBuyers = async () => {
    const url = URLS.GET_ALL_BUYERS;
    axios
      .get(url)
      .then(function (response) {
        // console.log(response);
        setBuyers(response.data);
      })
      .catch(function (error) {
        console.log(error);
        displayToast({ type: "error", msg: "Oops! Something went wrong" });
      });
  };

  const deleteBuyerConfirmation = (b) => {
    setCurrentBuyer(b);
    handleShow();
  };

  const deleteBuyer = async () => {
    const url = URLS.DELETE_BUYER + currentBuyer.id;
    // const data = {
    //     id : currentBuyer.id
    // };
    axios
      .delete(url)
      .then(function (response) {
        handleClose();
        // console.log(response);
        displayToast({ type: "success", msg: "Buyer deleted successfully!" });
        fetchBuyers();
      })
      .catch(function (error) {
        console.log(error);
        displayToast({ type: "error", msg: "Oops! Something went wrong" });
      });
  };

  return (
    <Container className="container-main" >
      <Row className="container-main" >
        <Col >
          <Link to="/add-buyer">
            <Button style={{ backgroundColor: "#90E4C1", color:"BLACK" }}>Add New Buyer</Button>

          </Link>
        </Col>

      </Row>
      <Row>
        <Table className="table table-success">
          <div id="customers">
            <thead >
              <tr >
                <th>Sr. No.</th>
                <th>Owner Name</th>
                <th>Company Name</th>
                <th>Zipcode</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {buyers.map((buyer, index) => {
                const { id, ownerName, companyName, zipcode } = buyer;

                return (
                  <tr key={id}>
                    <td>{index + 1}</td>
                    <td>{ownerName}</td>
                    <td>{companyName}</td>
                    <td>{zipcode}</td>
                    <td>
                      <Link to={`/edit-buyer/?id=${id}`}>
                        <Button style={{ backgroundColor: "lightgrey", color:"BLACK", width: '70px'}}>Edit</Button>{" "}
                      </Link>
                      <Button
                        onClick={() => deleteBuyerConfirmation(buyer)}
                        variant="danger"
                      >
                        Delete
                      </Button>
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
          Are you sure you want to delete{" "}
          {currentBuyer ? currentBuyer.ownerName : ""}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="danger" onClick={deleteBuyer}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ManageBuyer;
